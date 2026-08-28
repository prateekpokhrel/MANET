package com.manet.backend.simulation.fault;

import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class FaultInjector {

    private final AtomicLong faultSequence =
            new AtomicLong(1);

    private final List<SimulatedFault> activeFaults =
            new ArrayList<>();

    public void applyScenario(
            NetworkState state,
            FaultScenarioParameters parameters
    ) {

        long currentTime =
                state.getCurrentTime();

        if (currentTime < parameters.getStartTime()) {
            return;
        }

        long elapsed =
                currentTime - parameters.getStartTime();

        if (elapsed > parameters.getDuration()) {
            return;
        }

        if (hasScenarioFault(
                parameters.getScenario()
        )) {
            return;
        }

        switch (parameters.getScenario()) {

            case NODE_FAILURE_SCENARIO:
                injectNodeFault(
                        state,
                        FaultType.NODE_FAILURE
                );
                break;

            case LINK_FAILURE_SCENARIO:
                injectLinkFault(
                        state,
                        FaultType.LINK_FAILURE
                );
                break;

            case BATTERY_DEGRADATION_SCENARIO:
                applyBatteryDegradation(
                        state,
                        parameters.getIntensity()
                );
                break;

            case CPU_OVERLOAD_SCENARIO:
                applyCpuOverload(
                        state,
                        parameters.getIntensity()
                );
                break;

            case PACKET_LOSS_SCENARIO:
                injectLinkFault(
                        state,
                        FaultType.HIGH_PACKET_LOSS
                );
                break;

            case HIGH_LATENCY_SCENARIO:
                injectLinkFault(
                        state,
                        FaultType.HIGH_LATENCY
                );
                break;

            case NETWORK_CONGESTION_SCENARIO:
                injectLinkFault(
                        state,
                        FaultType.CHANNEL_CONGESTION
                );
                break;

            case RADIO_INTERFERENCE_SCENARIO:
                injectLinkFault(
                        state,
                        FaultType.RADIO_INTERFERENCE
                );
                break;

            case ROUTE_FAILURE_SCENARIO:
                injectLinkFault(
                        state,
                        FaultType.ROUTE_FAILURE
                );
                break;

            case NETWORK_PARTITION_SCENARIO:
                createNetworkPartition(state);
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
                            == FaultType.HIGH_LATENCY;

            case NONE -> false;
        };
    }

    public SimulatedFault injectNodeFault(
            NetworkState state,
            FaultType faultType
    ) {

        List<SimulatedNode> activeNodes =
                state.getNodes()
                        .stream()
                        .filter(SimulatedNode::isActive)
                        .toList();

        if (activeNodes.isEmpty()) {
            return null;
        }

        SimulatedNode node =
                activeNodes.get(
                        ThreadLocalRandom.current()
                                .nextInt(activeNodes.size())
                );

        applyNodeFault(
                node,
                faultType
        );

        SimulatedFault fault =
                SimulatedFault.builder()
                        .faultId(
                                faultSequence
                                        .getAndIncrement()
                        )
                        .faultType(faultType)
                        .category(
                                faultType.getCategory()
                        )
                        .severity(
                                faultType.getSeverity()
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
                                !faultType.isAiMitigable()
                        )
                        .description(
                                faultType.name()
                        )
                        .build();

        activeFaults.add(fault);

        return fault;
    }

    public SimulatedFault injectLinkFault(
            NetworkState state,
            FaultType faultType
    ) {

        List<SimulatedLink> activeLinks =
                state.getLinks()
                        .stream()
                        .filter(SimulatedLink::isActive)
                        .toList();

        if (activeLinks.isEmpty()) {
            return null;
        }

        SimulatedLink link =
                activeLinks.get(
                        ThreadLocalRandom.current()
                                .nextInt(activeLinks.size())
                );

        applyLinkFault(
                link,
                faultType
        );

        SimulatedFault fault =
                SimulatedFault.builder()
                        .faultId(
                                faultSequence
                                        .getAndIncrement()
                        )
                        .faultType(faultType)
                        .category(
                                faultType.getCategory()
                        )
                        .severity(
                                faultType.getSeverity()
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
                                !faultType.isAiMitigable()
                        )
                        .description(
                                faultType.name()
                        )
                        .build();

        activeFaults.add(fault);

        return fault;
    }

    public void reapplyActiveFaults(
            NetworkState state
    ) {

        for (SimulatedFault fault : getActiveFaults()) {

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

    private void applyBatteryDegradation(
            NetworkState state,
            double intensity
    ) {

        for (SimulatedNode node : state.getNodes()) {

            if (!node.isActive()) {
                continue;
            }

            double battery =
                    node.getBatteryLevel();

            double decrease =
                    Math.max(
                            0.1,
                            intensity
                    );

            node.setBatteryLevel(
                    Math.max(
                            0,
                            battery - decrease
                    )
            );

            if (node.getBatteryLevel() <= 20) {

                createNodeFaultRecord(
                        state,
                        node,
                        FaultType.LOW_BATTERY
                );
            }
        }
    }

    private void applyCpuOverload(
            NetworkState state,
            double intensity
    ) {

        for (SimulatedNode node : state.getNodes()) {

            if (!node.isActive()) {
                continue;
            }

            double cpu =
                    node.getCpuUsage();

            double increase =
                    Math.max(
                            1,
                            intensity
                    );

            node.setCpuUsage(
                    Math.min(
                            100,
                            cpu + increase
                    )
            );

            if (node.getCpuUsage() >= 90) {

                createNodeFaultRecord(
                        state,
                        node,
                        FaultType.HIGH_CPU
                );
            }
        }
    }

    private void createNetworkPartition(
            NetworkState state
    ) {

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

        activeFaults.add(fault);
    }

    private void applyMultiFaultScenario(
            NetworkState state,
            FaultScenarioParameters parameters
    ) {

        injectNodeFault(
                state,
                FaultType.HIGH_CPU
        );

        injectLinkFault(
                state,
                FaultType.HIGH_PACKET_LOSS
        );

        injectLinkFault(
                state,
                FaultType.HIGH_LATENCY
        );

        applyBatteryDegradation(
                state,
                parameters.getIntensity()
        );
    }

    private void applyNodeFault(
            SimulatedNode node,
            FaultType faultType
    ) {

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

                node.setBatteryLevel(
                        Math.min(
                                node.getBatteryLevel(),
                                15
                        )
                );
                break;

            case HIGH_CPU:

                node.setCpuUsage(
                        Math.max(
                                node.getCpuUsage(),
                                90
                        )
                );
                break;

            case MEMORY_EXHAUSTION:

                node.setMemoryUsage(
                        Math.max(
                                node.getMemoryUsage(),
                                95
                        )
                );
                break;

            case WEAK_SIGNAL:

                node.setSignalStrength(
                        Math.min(
                                node.getSignalStrength(),
                                20
                        )
                );
                break;

            default:
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

    private void createNodeFaultRecord(
            NetworkState state,
            SimulatedNode node,
            FaultType type
    ) {

        boolean alreadyActive =
                activeFaults.stream()
                        .anyMatch(
                                fault ->
                                        fault.isActive()
                                                && fault.getNodeId()
                                                != null
                                                && fault.getNodeId()
                                                .equals(
                                                        node.getNodeId()
                                                )
                                                && fault.getFaultType()
                                                == type
                        );

        if (alreadyActive) {
            return;
        }

        SimulatedFault fault =
                SimulatedFault.builder()
                        .faultId(
                                faultSequence
                                        .getAndIncrement()
                        )
                        .faultType(type)
                        .category(type.getCategory())
                        .severity(type.getSeverity())
                        .nodeId(node.getNodeId())
                        .startTime(
                                state.getCurrentTime()
                        )
                        .active(true)
                        .detected(false)
                        .aiMitigated(false)
                        .humanInterventionRequired(
                                !type.isAiMitigable()
                        )
                        .description(type.name())
                        .build();

        activeFaults.add(fault);
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

    public List<SimulatedFault> getActiveFaults() {

        return activeFaults.stream()
                .filter(SimulatedFault::isActive)
                .toList();
    }

    public List<SimulatedFault> getAllFaults() {

        return List.copyOf(activeFaults);
    }

    public void clearFaults() {

        activeFaults.clear();
    }
}