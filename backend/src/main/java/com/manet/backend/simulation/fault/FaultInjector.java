package com.manet.backend.simulation.fault;

import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class FaultInjector {

    private final AtomicLong faultSequence =
            new AtomicLong(1);

    private final List<SimulatedFault> activeFaults =
            new ArrayList<>();

    public synchronized void applyScenario(
            NetworkState state,
            FaultScenarioParameters parameters
    ) {

        if (state == null || parameters == null) {
            return;
        }

        long currentTime =
                state.getCurrentTime();

        long startTime =
                parameters.getStartTime();

        long duration =
                parameters.getDuration();

        if (currentTime < startTime) {
            return;
        }

        long elapsed =
                currentTime - startTime;

        if (elapsed > duration) {

            if (parameters.isAutomaticRecovery()) {

                recoverScenario(
                        state,
                        parameters.getScenario()
                );
            }

            return;
        }

        switch (parameters.getScenario()) {

            case NODE_FAILURE_SCENARIO:

                injectNodeFaults(
                        state,
                        FaultType.NODE_FAILURE,
                        parameters.getNumberOfFaults()
                );

                break;

            case LINK_FAILURE_SCENARIO:

                injectLinkFaults(
                        state,
                        FaultType.LINK_FAILURE,
                        parameters.getNumberOfFaults()
                );

                break;

            case BATTERY_DEGRADATION_SCENARIO:

                injectBatteryDegradationFaults(
                        state,
                        parameters.getIntensity(),
                        parameters.getNumberOfFaults()
                );

                break;

            case CPU_OVERLOAD_SCENARIO:

                injectCpuOverloadFaults(
                        state,
                        parameters.getIntensity(),
                        parameters.getNumberOfFaults()
                );

                break;

            case PACKET_LOSS_SCENARIO:

                injectLinkFaults(
                        state,
                        FaultType.HIGH_PACKET_LOSS,
                        parameters.getNumberOfFaults()
                );

                break;

            case HIGH_LATENCY_SCENARIO:

                injectLinkFaults(
                        state,
                        FaultType.HIGH_LATENCY,
                        parameters.getNumberOfFaults()
                );

                break;

            case NETWORK_CONGESTION_SCENARIO:

                injectLinkFaults(
                        state,
                        FaultType.CHANNEL_CONGESTION,
                        parameters.getNumberOfFaults()
                );

                break;

            case RADIO_INTERFERENCE_SCENARIO:

                injectLinkFaults(
                        state,
                        FaultType.RADIO_INTERFERENCE,
                        parameters.getNumberOfFaults()
                );

                break;

            case ROUTE_FAILURE_SCENARIO:

                injectLinkFaults(
                        state,
                        FaultType.ROUTE_FAILURE,
                        parameters.getNumberOfFaults()
                );

                break;

            case NETWORK_PARTITION_SCENARIO:

                createNetworkPartition(
                        state
                );

                break;

            case MULTI_FAULT_SCENARIO:

                applyMultiFaultScenario(
                        state,
                        parameters
                );

                break;

            case NONE:

                break;
        }
    }

    private boolean hasScenarioFault(
            FaultScenario scenario
    ) {

        return activeFaults.stream()
                .anyMatch(
                        fault ->
                                fault.isActive()
                                        && matchesScenario(
                                        fault,
                                        scenario
                                )
                );
    }

    private boolean matchesScenario(
            SimulatedFault fault,
            FaultScenario scenario
    ) {

        if (fault == null
                || fault.getFaultType() == null
                || scenario == null) {

            return false;
        }

        return switch (scenario) {

            case NODE_FAILURE_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.NODE_FAILURE;

            case LINK_FAILURE_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.LINK_FAILURE;

            case BATTERY_DEGRADATION_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.LOW_BATTERY;

            case CPU_OVERLOAD_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.HIGH_CPU;

            case PACKET_LOSS_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.HIGH_PACKET_LOSS;

            case HIGH_LATENCY_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.HIGH_LATENCY;

            case NETWORK_CONGESTION_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.CHANNEL_CONGESTION;

            case RADIO_INTERFERENCE_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.RADIO_INTERFERENCE;

            case ROUTE_FAILURE_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.ROUTE_FAILURE;

            case NETWORK_PARTITION_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.NETWORK_PARTITION;

            case MULTI_FAULT_SCENARIO ->
                    fault.getFaultType()
                            == FaultType.HIGH_CPU
                            || fault.getFaultType()
                            == FaultType.HIGH_PACKET_LOSS
                            || fault.getFaultType()
                            == FaultType.HIGH_LATENCY
                            || fault.getFaultType()
                            == FaultType.LOW_BATTERY;

            case NONE ->
                    false;
        };
    }

    private void injectNodeFaults(
            NetworkState state,
            FaultType faultType,
            int numberOfFaults
    ) {

        int required =
                normalizeFaultCount(
                        numberOfFaults
                );

        int existing =
                countActiveNodeFaults(
                        faultType
                );

        int missing =
                Math.max(
                        0,
                        required - existing
                );

        if (missing == 0) {
            return;
        }

        List<SimulatedNode> availableNodes =
                getAvailableNodes(
                        state,
                        faultType
                );

        Collections.shuffle(
                availableNodes
        );

        int count =
                Math.min(
                        missing,
                        availableNodes.size()
                );

        for (int i = 0; i < count; i++) {

            SimulatedNode node =
                    availableNodes.get(i);

            applyNodeFault(
                    node,
                    faultType
            );

            createNodeFaultRecord(
                    state,
                    node,
                    faultType
            );
        }
    }

    private void injectBatteryDegradationFaults(
            NetworkState state,
            double intensity,
            int numberOfFaults
    ) {

        int required =
                normalizeFaultCount(
                        numberOfFaults
                );

        int existing =
                countActiveNodeFaults(
                        FaultType.LOW_BATTERY
                );

        int missing =
                Math.max(
                        0,
                        required - existing
                );

        if (missing > 0) {

            List<SimulatedNode> availableNodes =
                    getAvailableNodes(
                            state,
                            FaultType.LOW_BATTERY
                    );

            Collections.shuffle(
                    availableNodes
            );

            int count =
                    Math.min(
                            missing,
                            availableNodes.size()
                    );

            for (int i = 0; i < count; i++) {

                SimulatedNode node =
                        availableNodes.get(i);

                node.setFaultType(
                        FaultType.LOW_BATTERY
                );

                node.setFaulty(true);

                createNodeFaultRecord(
                        state,
                        node,
                        FaultType.LOW_BATTERY
                );
            }
        }

        double decrease =
                Math.max(
                        0.1,
                        intensity
                );

        List<SimulatedFault> batteryFaults =
                getActiveFaultsByType(
                        FaultType.LOW_BATTERY
                );

        for (SimulatedFault fault :
                batteryFaults) {

            if (fault.getNodeId() == null) {
                continue;
            }

            SimulatedNode node =
                    findNode(
                            state,
                            fault.getNodeId()
                    );

            if (node == null) {
                continue;
            }

            node.setFaultType(
                    FaultType.LOW_BATTERY
            );

            node.setFaulty(true);

            node.setBatteryLevel(
                    Math.max(
                            0,
                            node.getBatteryLevel()
                                    - decrease
                    )
            );
        }
    }

    private void injectCpuOverloadFaults(
            NetworkState state,
            double intensity,
            int numberOfFaults
    ) {

        int required =
                normalizeFaultCount(
                        numberOfFaults
                );

        int existing =
                countActiveNodeFaults(
                        FaultType.HIGH_CPU
                );

        int missing =
                Math.max(
                        0,
                        required - existing
                );

        if (missing > 0) {

            List<SimulatedNode> availableNodes =
                    getAvailableNodes(
                            state,
                            FaultType.HIGH_CPU
                    );

            Collections.shuffle(
                    availableNodes
            );

            int count =
                    Math.min(
                            missing,
                            availableNodes.size()
                    );

            for (int i = 0; i < count; i++) {

                SimulatedNode node =
                        availableNodes.get(i);

                node.setFaultType(
                        FaultType.HIGH_CPU
                );

                node.setFaulty(true);

                createNodeFaultRecord(
                        state,
                        node,
                        FaultType.HIGH_CPU
                );
            }
        }

        double increase =
                Math.max(
                        1,
                        intensity
                );

        List<SimulatedFault> cpuFaults =
                getActiveFaultsByType(
                        FaultType.HIGH_CPU
                );

        for (SimulatedFault fault :
                cpuFaults) {

            if (fault.getNodeId() == null) {
                continue;
            }

            SimulatedNode node =
                    findNode(
                            state,
                            fault.getNodeId()
                    );

            if (node == null) {
                continue;
            }

            node.setFaultType(
                    FaultType.HIGH_CPU
            );

            node.setFaulty(true);

            node.setCpuUsage(
                    Math.min(
                            100,
                            node.getCpuUsage()
                                    + increase
                    )
            );
        }
    }

    private void injectLinkFaults(
            NetworkState state,
            FaultType faultType,
            int numberOfFaults
    ) {

        int required =
                normalizeFaultCount(
                        numberOfFaults
                );

        int existing =
                countActiveLinkFaults(
                        faultType
                );

        int missing =
                Math.max(
                        0,
                        required - existing
                );

        if (missing == 0) {
            return;
        }

        List<SimulatedLink> availableLinks =
                new ArrayList<>(
                        state.getLinks()
                                .stream()
                                .filter(SimulatedLink::isActive)
                                .toList()
                );

        Collections.shuffle(
                availableLinks
        );

        int injected = 0;

        for (SimulatedLink link :
                availableLinks) {

            if (injected >= missing) {
                break;
            }

            if (hasLinkFault(
                    link,
                    faultType
            )) {
                continue;
            }

            applyLinkFault(
                    link,
                    faultType
            );

            createLinkFaultRecord(
                    state,
                    link,
                    faultType
            );

            injected++;
        }
    }

    public synchronized SimulatedFault injectNodeFault(
            NetworkState state,
            FaultType faultType
    ) {

        List<SimulatedNode> activeNodes =
                getAvailableNodes(
                        state,
                        faultType
                );

        if (activeNodes.isEmpty()) {
            return null;
        }

        SimulatedNode node =
                activeNodes.get(
                        ThreadLocalRandom.current()
                                .nextInt(
                                        activeNodes.size()
                                )
                );

        applyNodeFault(
                node,
                faultType
        );

        return createNodeFaultRecord(
                state,
                node,
                faultType
        );
    }

    public synchronized SimulatedFault injectLinkFault(
            NetworkState state,
            FaultType faultType
    ) {

        List<SimulatedLink> activeLinks =
                new ArrayList<>(
                        state.getLinks()
                                .stream()
                                .filter(SimulatedLink::isActive)
                                .toList()
                );

        if (activeLinks.isEmpty()) {
            return null;
        }

        SimulatedLink link =
                activeLinks.get(
                        ThreadLocalRandom.current()
                                .nextInt(
                                        activeLinks.size()
                                )
                );

        applyLinkFault(
                link,
                faultType
        );

        return createLinkFaultRecord(
                state,
                link,
                faultType
        );
    }

    public synchronized void reapplyActiveFaults(
            NetworkState state
    ) {

        for (SimulatedFault fault :
                getActiveFaults()) {

            if (fault.getNodeId() != null) {

                SimulatedNode node =
                        findNode(
                                state,
                                fault.getNodeId()
                        );

                if (node != null) {

                    applyNodeFault(
                            node,
                            fault.getFaultType()
                    );
                }
            }

            if (fault.getSourceNodeId() != null
                    && fault.getDestinationNodeId() != null) {

                SimulatedLink link =
                        findLink(
                                state,
                                fault.getSourceNodeId(),
                                fault.getDestinationNodeId()
                        );

                if (link != null) {

                    applyLinkFault(
                            link,
                            fault.getFaultType()
                    );
                }
            }
        }
    }

    private List<SimulatedNode> getAvailableNodes(
            NetworkState state,
            FaultType faultType
    ) {

        Set<Long> alreadyAffected =
                new HashSet<>();

        for (SimulatedFault fault :
                activeFaults) {

            if (!fault.isActive()) {
                continue;
            }

            if (fault.getFaultType()
                    != faultType) {
                continue;
            }

            if (fault.getNodeId() != null) {

                alreadyAffected.add(
                        fault.getNodeId()
                );
            }
        }

        return new ArrayList<>(
                state.getNodes()
                        .stream()
                        .filter(SimulatedNode::isActive)
                        .filter(
                                node ->
                                        !alreadyAffected.contains(
                                                node.getNodeId()
                                        )
                        )
                        .toList()
        );
    }

    private List<SimulatedFault> getActiveFaultsByType(
            FaultType faultType
    ) {

        return activeFaults.stream()
                .filter(SimulatedFault::isActive)
                .filter(
                        fault ->
                                fault.getFaultType()
                                        == faultType
                )
                .toList();
    }

    private int countActiveNodeFaults(
            FaultType faultType
    ) {

        return (int)
                activeFaults.stream()
                        .filter(SimulatedFault::isActive)
                        .filter(
                                fault ->
                                        fault.getFaultType()
                                                == faultType
                                                && fault.getNodeId()
                                                != null
                        )
                        .count();
    }

    private int countActiveLinkFaults(
            FaultType faultType
    ) {

        return (int)
                activeFaults.stream()
                        .filter(SimulatedFault::isActive)
                        .filter(
                                fault ->
                                        fault.getFaultType()
                                                == faultType
                                                && fault.getSourceNodeId()
                                                != null
                                                && fault.getDestinationNodeId()
                                                != null
                        )
                        .count();
    }

    private boolean hasNodeFault(
            Long nodeId,
            FaultType faultType
    ) {

        return activeFaults.stream()
                .anyMatch(
                        fault ->
                                fault.isActive()
                                        && fault.getNodeId() != null
                                        && fault.getNodeId()
                                        .equals(nodeId)
                                        && fault.getFaultType()
                                        == faultType
                );
    }

    private boolean hasLinkFault(
            SimulatedLink link,
            FaultType faultType
    ) {

        return activeFaults.stream()
                .anyMatch(
                        fault ->
                                fault.isActive()
                                        && fault.getSourceNodeId() != null
                                        && fault.getDestinationNodeId() != null
                                        && fault.getFaultType()
                                        == faultType
                                        && (
                                        (
                                                fault.getSourceNodeId()
                                                        .equals(
                                                                link.getSourceNodeId()
                                                        )
                                                        && fault.getDestinationNodeId()
                                                        .equals(
                                                                link.getDestinationNodeId()
                                                        )
                                        )
                                                ||
                                                (
                                                        fault.getSourceNodeId()
                                                                .equals(
                                                                        link.getDestinationNodeId()
                                                                )
                                                                && fault.getDestinationNodeId()
                                                                .equals(
                                                                        link.getSourceNodeId()
                                                                )
                                                )
                                )
                );
    }

    private int normalizeFaultCount(
            int numberOfFaults
    ) {

        return Math.max(
                1,
                numberOfFaults
        );
    }

    private SimulatedFault createNodeFaultRecord(
            NetworkState state,
            SimulatedNode node,
            FaultType type
    ) {

        for (SimulatedFault existing :
                activeFaults) {

            if (existing.isActive()
                    && existing.getNodeId() != null
                    && existing.getNodeId()
                    .equals(node.getNodeId())
                    && existing.getFaultType() == type) {

                return existing;
            }
        }

        SimulatedFault fault =
                SimulatedFault.builder()
                        .faultId(
                                faultSequence
                                        .getAndIncrement()
                        )
                        .faultType(type)
                        .category(
                                type.getCategory()
                        )
                        .severity(
                                type.getSeverity()
                        )
                        .nodeId(
                                node.getNodeId()
                        )
                        .startTime(
                                state.getCurrentTime()
                        )
                        .active(true)
                        .detected(false)
                        .aiMitigated(false)
                        .humanInterventionRequired(
                                !type.isAiMitigable()
                        )
                        .description(
                                type.name()
                        )
                        .build();

        activeFaults.add(
                fault
        );

        return fault;
    }

    private SimulatedFault createLinkFaultRecord(
            NetworkState state,
            SimulatedLink link,
            FaultType type
    ) {

        for (SimulatedFault existing :
                activeFaults) {

            if (existing.isActive()
                    && existing.getSourceNodeId() != null
                    && existing.getDestinationNodeId() != null
                    && existing.getSourceNodeId()
                    .equals(link.getSourceNodeId())
                    && existing.getDestinationNodeId()
                    .equals(link.getDestinationNodeId())
                    && existing.getFaultType() == type) {

                return existing;
            }
        }

        SimulatedFault fault =
                SimulatedFault.builder()
                        .faultId(
                                faultSequence
                                        .getAndIncrement()
                        )
                        .faultType(type)
                        .category(
                                type.getCategory()
                        )
                        .severity(
                                type.getSeverity()
                        )
                        .sourceNodeId(
                                link.getSourceNodeId()
                        )
                        .destinationNodeId(
                                link.getDestinationNodeId()
                        )
                        .startTime(
                                state.getCurrentTime()
                        )
                        .active(true)
                        .detected(false)
                        .aiMitigated(false)
                        .humanInterventionRequired(
                                !type.isAiMitigable()
                        )
                        .description(
                                type.name()
                        )
                        .build();

        activeFaults.add(
                fault
        );

        return fault;
    }

    private void createNetworkPartition(
            NetworkState state
    ) {

        if (hasScenarioFault(
                FaultScenario.NETWORK_PARTITION_SCENARIO
        )) {
            return;
        }

        List<SimulatedNode> nodes =
                state.getNodes();

        if (nodes.size() < 4) {
            return;
        }

        int partitionPoint =
                nodes.size() / 2;

        for (int i = partitionPoint;
             i < nodes.size();
             i++) {

            SimulatedNode node =
                    nodes.get(i);

            node.setSignalStrength(
                    Math.min(
                            node.getSignalStrength(),
                            5
                    )
            );

            node.setFaultType(
                    FaultType.NETWORK_PARTITION
            );

            node.setFaulty(true);
        }

        SimulatedFault fault =
                SimulatedFault.builder()
                        .faultId(
                                faultSequence
                                        .getAndIncrement()
                        )
                        .faultType(
                                FaultType.NETWORK_PARTITION
                        )
                        .category(
                                FaultCategory.NETWORK
                        )
                        .severity(
                                FaultSeverity.CRITICAL
                        )
                        .startTime(
                                state.getCurrentTime()
                        )
                        .active(true)
                        .detected(false)
                        .aiMitigated(false)
                        .humanInterventionRequired(false)
                        .description(
                                "Network partition detected"
                        )
                        .build();

        activeFaults.add(
                fault
        );
    }

    private void applyMultiFaultScenario(
            NetworkState state,
            FaultScenarioParameters parameters
    ) {

        int numberOfFaults =
                normalizeFaultCount(
                        parameters.getNumberOfFaults()
                );

        injectNodeFaults(
                state,
                FaultType.HIGH_CPU,
                numberOfFaults
        );

        injectLinkFaults(
                state,
                FaultType.HIGH_PACKET_LOSS,
                numberOfFaults
        );

        injectLinkFaults(
                state,
                FaultType.HIGH_LATENCY,
                numberOfFaults
        );

        injectBatteryDegradationFaults(
                state,
                parameters.getIntensity(),
                numberOfFaults
        );
    }

    private void applyNodeFault(
            SimulatedNode node,
            FaultType faultType
    ) {

        node.setFaultType(
                faultType
        );

        switch (faultType) {

            case NODE_FAILURE:
            case NODE_CRASH:
            case HARDWARE_FAILURE:
            case BATTERY_FAILURE:
            case ANTENNA_FAILURE:
            case TRANSCEIVER_FAILURE:

                node.setActive(false);
                node.setFaulty(true);
                break;

            case LOW_BATTERY:

                node.setFaulty(true);
                break;

            case HIGH_CPU:

                node.setCpuUsage(
                        Math.max(
                                node.getCpuUsage(),
                                90
                        )
                );

                node.setFaulty(true);
                break;

            case MEMORY_EXHAUSTION:

                node.setMemoryUsage(
                        Math.max(
                                node.getMemoryUsage(),
                                95
                        )
                );

                node.setFaulty(true);
                break;

            case WEAK_SIGNAL:

                node.setSignalStrength(
                        Math.min(
                                node.getSignalStrength(),
                                20
                        )
                );

                node.setFaulty(true);
                break;

            default:

                node.setFaulty(true);
                break;
        }
    }

    private void applyLinkFault(
            SimulatedLink link,
            FaultType faultType
    ) {

        switch (faultType) {

            case LINK_FAILURE:
            case RADIO_OUTAGE:

                link.setActive(false);
                break;

            case HIGH_PACKET_LOSS:

                link.setPacketLoss(
                        Math.max(
                                link.getPacketLoss(),
                                0.70
                        )
                );

                break;

            case HIGH_LATENCY:

                link.setLatency(
                        Math.max(
                                link.getLatency(),
                                500
                        )
                );

                break;

            case WEAK_SIGNAL:
            case SIGNAL_ATTENUATION:

                link.setSignalStrength(
                        Math.min(
                                link.getSignalStrength(),
                                20
                        )
                );

                link.setQuality(
                        Math.min(
                                link.getQuality(),
                                0.20
                        )
                );

                break;

            case RADIO_INTERFERENCE:

                link.setPacketLoss(
                        Math.max(
                                link.getPacketLoss(),
                                0.40
                        )
                );

                link.setLatency(
                        Math.max(
                                link.getLatency(),
                                150
                        )
                );

                break;

            case CHANNEL_CONGESTION:
            case HIGH_COLLISION_RATE:

                link.setPacketLoss(
                        Math.max(
                                link.getPacketLoss(),
                                0.30
                        )
                );

                break;

            default:

                break;
        }
    }

    private void recoverScenario(
            NetworkState state,
            FaultScenario scenario
    ) {

        for (SimulatedFault fault :
                activeFaults) {

            if (!fault.isActive()
                    || !matchesScenario(
                    fault,
                    scenario
            )) {
                continue;
            }

            fault.setActive(false);

            if (fault.getNodeId() != null) {

                SimulatedNode node =
                        findNode(
                                state,
                                fault.getNodeId()
                        );

                if (node != null
                        && node.getFaultType()
                        == fault.getFaultType()) {

                    node.setFaulty(false);
                    node.setFaultType(null);
                }
            }

            if (fault.getSourceNodeId() != null
                    && fault.getDestinationNodeId() != null) {

                SimulatedLink link =
                        findLink(
                                state,
                                fault.getSourceNodeId(),
                                fault.getDestinationNodeId()
                        );

                if (link != null) {

                    recoverLink(
                            link,
                            fault.getFaultType()
                    );
                }
            }
        }
    }

    private void recoverLink(
            SimulatedLink link,
            FaultType faultType
    ) {

        switch (faultType) {

            case LINK_FAILURE:
            case RADIO_OUTAGE:

                link.setActive(true);
                break;

            case HIGH_PACKET_LOSS:
            case CHANNEL_CONGESTION:
            case HIGH_COLLISION_RATE:
            case RADIO_INTERFERENCE:

                link.setPacketLoss(0);
                break;

            case HIGH_LATENCY:

                link.setLatency(0);
                break;

            case WEAK_SIGNAL:
            case SIGNAL_ATTENUATION:

                link.setSignalStrength(100);
                link.setQuality(1.0);
                break;

            default:

                break;
        }
    }

    private SimulatedNode findNode(
            NetworkState state,
            Long nodeId
    ) {

        return state.getNodes()
                .stream()
                .filter(
                        node ->
                                node.getNodeId()
                                        .equals(nodeId)
                )
                .findFirst()
                .orElse(null);
    }

    private SimulatedLink findLink(
            NetworkState state,
            Long source,
            Long destination
    ) {

        return state.getLinks()
                .stream()
                .filter(
                        link ->
                                (
                                        link.getSourceNodeId()
                                                .equals(source)
                                                && link.getDestinationNodeId()
                                                .equals(destination)
                                )
                                        ||
                                        (
                                                link.getSourceNodeId()
                                                        .equals(destination)
                                                        && link.getDestinationNodeId()
                                                        .equals(source)
                                        )
                )
                .findFirst()
                .orElse(null);
    }
    /**
     * Marks every active simulated fault involving the specified node
     * as mitigated by the AI recovery layer.
     *
     * The fault remains in memory/history but will not be reapplied
     * on future simulation steps.
     */
    public synchronized void markFaultsInvolvingNodeMitigated(
            Long nodeId
    ) {

        if (nodeId == null) {
            return;
        }

        for (SimulatedFault fault : activeFaults) {

            if (!fault.isActive()) {
                continue;
            }

            boolean matchesNode =
                    nodeId.equals(
                            fault.getNodeId()
                    )
                            ||
                            nodeId.equals(
                                    fault.getSourceNodeId()
                            )
                            ||
                            nodeId.equals(
                                    fault.getDestinationNodeId()
                            );

            if (!matchesNode) {
                continue;
            }

            fault.setActive(false);

            fault.setDetected(true);

            fault.setAiMitigated(true);

            fault.setHumanInterventionRequired(false);
        }
    }
    public synchronized List<SimulatedFault> getActiveFaults() {

        return activeFaults.stream()
                .filter(SimulatedFault::isActive)
                .toList();
    }

    public synchronized List<SimulatedFault> getAllFaults() {

        return List.copyOf(
                activeFaults
        );
    }

    public synchronized void clearFaults() {

        activeFaults.clear();
    }
}