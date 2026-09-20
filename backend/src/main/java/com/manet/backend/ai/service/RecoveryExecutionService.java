package com.manet.backend.ai.service;

import com.manet.backend.ai.dto.AiNodeAnalysis;
import com.manet.backend.ai.dto.RecoveryResponse;
import com.manet.backend.ai.persistence.AiPersistenceService;
import com.manet.backend.entity.AiRecoveryExecution;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.RecoveryExecutionEvent;
import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.model.SimulatedPacket;
import com.manet.backend.repository.AiRecoveryExecutionRepository;
import com.manet.backend.simulation.fault.FaultInjector;
import com.manet.backend.simulation.network.RouteManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RecoveryExecutionService {

    private final AiPersistenceService persistenceService;
    private final AiRecoveryExecutionRepository recoveryRepository;
    private final RouteManager routeManager;
    private final FaultInjector faultInjector;

    private final boolean automaticRecoveryEnabled;

    /*
     * Prevent the exact same AI condition from executing repeatedly
     * on consecutive simulation ticks.
     */
    private final Map<String, String> handledConditions =
            new ConcurrentHashMap<>();

    public RecoveryExecutionService(
            AiPersistenceService persistenceService,
            AiRecoveryExecutionRepository recoveryRepository,
            RouteManager routeManager,
            FaultInjector faultInjector,
            @Value("${manet.ai.auto-recovery-enabled:true}")
            boolean automaticRecoveryEnabled
    ) {
        this.persistenceService = persistenceService;
        this.recoveryRepository = recoveryRepository;
        this.routeManager = routeManager;
        this.faultInjector = faultInjector;
        this.automaticRecoveryEnabled = automaticRecoveryEnabled;
    }

    /**
     * Executes the recovery action returned by the trained
     * Recoverability Engine and persists the execution result.
     */
    public RecoveryExecutionResult execute(
            Long simulationId,
            NetworkState state,
            SimulatedNode node,
            AiNodeAnalysis analysis
    ) {

        if (simulationId == null || state == null || node == null || analysis == null) {
            return new RecoveryExecutionResult(
                    "SKIPPED",
                    null,
                    "Recovery execution skipped because required state is missing.",
                    0
            );
        }

        RecoveryResponse recovery = analysis.getRecovery();

        if (recovery == null) {
            return new RecoveryExecutionResult(
                    "SKIPPED",
                    null,
                    "Recovery Engine did not return a recovery decision.",
                    0
            );
        }

        String action = recovery.recommended_recovery_action();

        if (action == null || action.isBlank()) {
            return persist(
                    simulationId,
                    analysis,
                    new RecoveryExecutionResult(
                            "SKIPPED",
                            null,
                            "Recovery Engine returned no recovery action.",
                            0
                    ),
                    "UNKNOWN",
                    state
            );
        }

        String conditionSignature = buildConditionSignature(
                analysis,
                recovery,
                action
        );

        /*
         * Do not repeatedly execute/persist the same recommendation
         * while a fault remains in the same state.
         */
        if (wasAlreadyHandled(
                simulationId,
                node.getNodeId(),
                conditionSignature
        )) {
            return new RecoveryExecutionResult(
                    "ALREADY_HANDLED",
                    action,
                    "The same recovery condition was already handled.",
                    0
            );
        }

        /*
         * A human intervention decision must never mutate the MANET.
         */
        if (!"AI Recoverable".equalsIgnoreCase(
                recovery.recovery_decision()
        )) {

            return persist(
                    simulationId,
                    analysis,
                    new RecoveryExecutionResult(
                            "NOTIFIED",
                            action,
                            "Human intervention required; no automatic topology change was executed.",
                            0
                    ),
                    conditionSignature,
                    state
            );
        }

        if (!automaticRecoveryEnabled) {

            return persist(
                    simulationId,
                    analysis,
                    new RecoveryExecutionResult(
                            "DISABLED",
                            action,
                            "Automatic recovery is disabled by configuration.",
                            0
                    ),
                    conditionSignature,
                    state
            );
        }

        RecoveryExecutionResult result;

        try {

            result = switch (action.toUpperCase()) {
                case "REROUTE" -> executeReroute(
                        state,
                        node
                );

                case "ISOLATE_NODE" -> executeIsolateNode(
                        state,
                        node
                );

                case "RESTART_SERVICE" -> executeRestartService(
                        state,
                        node
                );

                case "ROLLBACK_CONFIGURATION" -> executeRollback(
                        state,
                        node
                );

                case "CONTINUE_MONITORING" -> new RecoveryExecutionResult(
                        "MONITORING",
                        action,
                        "AI selected continued monitoring; no network mutation was required.",
                        0
                );

                case "NOTIFY_OPERATOR" -> new RecoveryExecutionResult(
                        "NOTIFIED",
                        action,
                        "Operator notification recorded.",
                        0
                );

                default -> new RecoveryExecutionResult(
                        "FAILED",
                        action,
                        "Unsupported recovery action: " + action,
                        0
                );
            };

        } catch (Exception exception) {

            result = new RecoveryExecutionResult(
                    "FAILED",
                    action,
                    "Recovery execution failed: " + exception.getMessage(),
                    0
            );
        }

        return persist(
                simulationId,
                analysis,
                result,
                conditionSignature,
                state
        );
    }

    private RecoveryExecutionResult executeReroute(
            NetworkState state,
            SimulatedNode failedNode
    ) {

        int rerouted = 0;
        int affected = 0;

        for (SimulatedPacket packet : state.getPackets()) {

            if (packet == null || packet.isDelivered() || packet.isDropped()) {
                continue;
            }

            boolean routeAffected =
                    failedNode.getNodeId().equals(packet.getCurrentNodeId())
                            ||
                    (packet.getRoute() != null
                            && packet.getRoute().contains(failedNode.getNodeId()));

            if (!routeAffected) {
                continue;
            }

            affected++;

            Long currentNodeId = packet.getCurrentNodeId();
            Long destinationNodeId = packet.getDestinationNodeId();

            if (currentNodeId == null || destinationNodeId == null) {
                continue;
            }

            List<Long> newRoute = routeManager.findRoute(
                    state.getLinks(),
                    currentNodeId,
                    destinationNodeId
            );

            if (!newRoute.isEmpty()) {

                packet.setRoute(newRoute);
                packet.setHopCount(
                        Math.max(
                                0,
                                newRoute.size() - 1
                        )
                );

                packet.setDropped(false);
                packet.setDropReason(null);

                rerouted++;
            }
        }

        String message;

        if (rerouted > 0) {
            message = "Rerouted " + rerouted + " of " + affected + " affected packets using the current MANET topology.";
        } else if (affected == 0) {
            message = "No in-flight packets were affected by the detected condition.";
        } else {
            message = "No alternate active path was available for the affected packets.";
        }

        return new RecoveryExecutionResult(
                "EXECUTED",
                "REROUTE",
                message,
                rerouted
        );
    }

    private RecoveryExecutionResult executeIsolateNode(
            NetworkState state,
            SimulatedNode node
    ) {

        node.setActive(false);
        node.setFaulty(true);

        for (SimulatedLink link : state.getLinks()) {

            if (link == null) {
                continue;
            }

            if (node.getNodeId().equals(link.getSourceNodeId())
                    || node.getNodeId().equals(link.getDestinationNodeId())) {

                link.setActive(false);
            }
        }

        /*
         * Prevent the simulation fault injector from immediately
         * putting the same node back into the failed state before
         * the next AI decision.
         */
        faultInjector.markFaultsInvolvingNodeMitigated(
                node.getNodeId()
        );

        return new RecoveryExecutionResult(
                "EXECUTED",
                "ISOLATE_NODE",
                "Node isolated from the active MANET topology.",
                0
        );
    }

    private RecoveryExecutionResult executeRestartService(
            NetworkState state,
            SimulatedNode node
    ) {

        node.setActive(true);
        node.setFaulty(false);
        node.setFaultType(null);

        /*
         * Simulated restart baseline. We do not artificially change
         * battery or signal quality.
         */
        node.setCpuUsage(
                Math.min(
                        node.getCpuUsage(),
                        25.0
                )
        );

        node.setMemoryUsage(
                Math.min(
                        node.getMemoryUsage(),
                        30.0
                )
        );

        faultInjector.markFaultsInvolvingNodeMitigated(
                node.getNodeId()
        );

        return new RecoveryExecutionResult(
                "EXECUTED",
                "RESTART_SERVICE",
                "Node service restarted and active participation restored.",
                0
        );
    }

    private RecoveryExecutionResult executeRollback(
            NetworkState state,
            SimulatedNode node
    ) {

        node.setActive(true);
        node.setFaulty(false);
        node.setFaultType(null);

        node.setCpuUsage(
                Math.min(
                        node.getCpuUsage(),
                        15.0
                )
        );

        node.setMemoryUsage(
                Math.min(
                        node.getMemoryUsage(),
                        20.0
                )
        );

        faultInjector.markFaultsInvolvingNodeMitigated(
                node.getNodeId()
        );

        return new RecoveryExecutionResult(
                "EXECUTED",
                "ROLLBACK_CONFIGURATION",
                "Node configuration rolled back to the simulated stable baseline.",
                0
        );
    }

    private boolean wasAlreadyHandled(
            Long simulationId,
            Long nodeId,
            String conditionSignature
    ) {

        String memoryKey = simulationId
                + ":"
                + nodeId
                + ":"
                + conditionSignature;

        return handledConditions.containsKey(
                memoryKey
        );
    }

    private RecoveryExecutionResult persist(
            Long simulationId,
            AiNodeAnalysis analysis,
            RecoveryExecutionResult result,
            String conditionSignature,
            NetworkState state
    ) {

        persistenceService.saveRecoveryExecution(
                simulationId,
                analysis,
                result,
                conditionSignature
        );

        state.addRecoveryEvent(
                RecoveryExecutionEvent.builder()
                        .simulationId(simulationId)
                        .nodeId(analysis.getNodeId())
                        .simulationTimestamp(analysis.getTimestamp())
                        .action(result.action())
                        .status(result.status())
                        .message(result.message())
                        .affectedPackets(result.affectedPackets())
                        .executedAt(java.time.LocalDateTime.now())
                        .build()
        );

        String key = simulationId
                + ":"
                + analysis.getNodeId()
                + ":"
                + conditionSignature;

        if (Set.of(
                "EXECUTED",
                "NOTIFIED",
                "DISABLED",
                "MONITORING"
        ).contains(result.status())) {

            handledConditions.put(
                    key,
                    "handled"
            );
        }

        return result;
    }

    private String buildConditionSignature(
            AiNodeAnalysis analysis,
            RecoveryResponse recovery,
            String action
    ) {

        String fault =
                analysis.getXgboost() == null
                        ? "UNKNOWN"
                        : String.valueOf(
                                analysis.getXgboost().fault_prediction()
                        );

        String anomaly =
                analysis.getIsolationForest() == null
                        ? "UNKNOWN"
                        : String.valueOf(
                                analysis.getIsolationForest().anomaly_status()
                        );

        String decision =
                recovery.recovery_decision() == null
                        ? "UNKNOWN"
                        : recovery.recovery_decision();

        return fault
                + "|"
                + anomaly
                + "|"
                + decision
                + "|"
                + action;
    }

    /**
     * Clears recovery de-duplication markers for one node. This is
     * called when the node returns to a non-triggered state so a
     * later fault can generate a fresh recovery action.
     */
    public void clearNodeConditions(
            Long simulationId,
            Long nodeId
    ) {

        if (simulationId == null || nodeId == null) {
            return;
        }

        String prefix = simulationId
                + ":"
                + nodeId
                + ":";

        handledConditions.keySet()
                .removeIf(
                        key -> key.startsWith(prefix)
                );
    }

    public void clearSimulation(
            Long simulationId
    ) {

        if (simulationId == null) {
            return;
        }

        String prefix = simulationId + ":";

        handledConditions.keySet()
                .removeIf(
                        key -> key.startsWith(prefix)
                );
    }
}
