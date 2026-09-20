package com.manet.backend.websocket;

import com.manet.backend.ai.dto.AiNodeAnalysis;
import com.manet.backend.ai.service.RecoveryExecutionResult;
import com.manet.backend.model.NetworkState;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class SimulationWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public SimulationWebSocketPublisher(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate =
                messagingTemplate;
    }

    // ============================================================
    // FULL STATE
    // ============================================================

    public void publishState(
            Long simulationId,
            NetworkState state
    ) {

        if (simulationId == null
                || state == null) {
            return;
        }

        String destination =
                "/topic/simulations/"
                        + simulationId
                        + "/state";

        messagingTemplate.convertAndSend(
                destination,
                (Object) state
        );
    }

    // ============================================================
    // AI ANALYSIS
    // ============================================================

    public void publishAiAnalysis(
            Long simulationId,
            AiNodeAnalysis analysis
    ) {

        if (simulationId == null
                || analysis == null) {
            return;
        }

        String destination =
                "/topic/simulations/"
                        + simulationId
                        + "/ai";

        messagingTemplate.convertAndSend(
                destination,
                (Object) analysis
        );
    }

    // ============================================================
    // RECOVERY EXECUTION
    // ============================================================

    public void publishRecoveryExecution(
            Long simulationId,
            AiNodeAnalysis analysis,
            RecoveryExecutionResult execution
    ) {

        if (simulationId == null
                || analysis == null
                || execution == null) {
            return;
        }

        Map<String, Object> payload =
                new LinkedHashMap<>();

        payload.put(
                "simulationId",
                simulationId
        );

        payload.put(
                "nodeId",
                analysis.getNodeId()
        );

        payload.put(
                "simulationTimestamp",
                analysis.getTimestamp()
        );

        if (analysis.getRecovery() != null) {

            payload.put(
                    "recoveryDecision",
                    analysis.getRecovery()
                            .recovery_decision()
            );

            payload.put(
                    "recommendedAction",
                    analysis.getRecovery()
                            .recommended_recovery_action()
            );

            payload.put(
                    "recoverabilityScore",
                    analysis.getRecovery()
                            .recoverability_score()
            );

            payload.put(
                    "successProbability",
                    analysis.getRecovery()
                            .best_action_success_probability()
            );
        }

        payload.put(
                "action",
                execution.action()
        );

        payload.put(
                "status",
                execution.status()
        );

        payload.put(
                "message",
                execution.message()
        );

        payload.put(
                "affectedPackets",
                execution.affectedPackets()
        );

        String destination =
                "/topic/simulations/"
                        + simulationId
                        + "/recovery";

        /*
         * Explicit Object cast is important here.
         * Without it Spring can see the Map and try to resolve
         * the convertAndSend overload ambiguously.
         */
        messagingTemplate.convertAndSend(
                destination,
                (Object) payload
        );
    }

    // ============================================================
    // GENERIC RECOVERY EVENT
    // ============================================================

    public void publishRecovery(
            Long simulationId,
            Object recoveryEvent
    ) {

        if (simulationId == null
                || recoveryEvent == null) {
            return;
        }

        String destination =
                "/topic/simulations/"
                        + simulationId
                        + "/recovery";

        messagingTemplate.convertAndSend(
                destination,
                recoveryEvent
        );
    }

    // ============================================================
    // LIFECYCLE
    // ============================================================

    public void publishLifecycle(
            Long simulationId,
            String status,
            String message
    ) {

        if (simulationId == null) {
            return;
        }

        Map<String, Object> payload =
                new LinkedHashMap<>();

        payload.put(
                "simulationId",
                simulationId
        );

        payload.put(
                "status",
                status
        );

        payload.put(
                "message",
                message
        );

        String destination =
                "/topic/simulations/"
                        + simulationId
                        + "/lifecycle";

        messagingTemplate.convertAndSend(
                destination,
                (Object) payload
        );
    }

    // ============================================================
    // COMPLETE STATE
    // ============================================================

    public void publishCompleteState(
            Long simulationId,
            NetworkState state
    ) {

        publishState(
                simulationId,
                state
        );
    }
}