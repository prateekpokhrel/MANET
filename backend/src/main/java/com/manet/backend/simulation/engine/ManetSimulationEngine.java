package com.manet.backend.simulation.engine;

import com.manet.backend.model.NetworkState;
import com.manet.backend.model.NodePosition;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.model.SimulatedPacket;
import com.manet.backend.model.SimulationParameters;
import com.manet.backend.simulation.dataset.NodeDatasetRecord;
import com.manet.backend.simulation.dataset.SimulationDataRecorder;
import com.manet.backend.simulation.fault.FaultInjector;
import com.manet.backend.simulation.fault.FaultScenarioParameters;
import com.manet.backend.simulation.metrics.LinkMetricCollector;
import com.manet.backend.simulation.metrics.NetworkMetricCollector;
import com.manet.backend.simulation.metrics.NodeMetricCollector;
import com.manet.backend.simulation.movement.MovementModel;
import com.manet.backend.simulation.network.LinkManager;
import com.manet.backend.simulation.network.PacketTransmissionManager;
import com.manet.backend.simulation.network.RouteManager;
import com.manet.backend.simulation.network.TrafficGenerator;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class ManetSimulationEngine {

    private final MovementModel movementModel;
    private final LinkManager linkManager;
    private final RouteManager routeManager;
    private final TrafficGenerator trafficGenerator;
    private final PacketTransmissionManager packetTransmissionManager;

    private final NodeMetricCollector nodeMetricCollector;
    private final LinkMetricCollector linkMetricCollector;
    private final NetworkMetricCollector networkMetricCollector;

    private final FaultInjector faultInjector;
    private final SimulationDataRecorder simulationDataRecorder;

    private FaultScenarioParameters faultScenarioParameters;

    public ManetSimulationEngine(
            MovementModel movementModel,
            LinkManager linkManager,
            RouteManager routeManager,
            TrafficGenerator trafficGenerator,
            PacketTransmissionManager packetTransmissionManager,
            NodeMetricCollector nodeMetricCollector,
            LinkMetricCollector linkMetricCollector,
            NetworkMetricCollector networkMetricCollector,
            FaultInjector faultInjector,
            SimulationDataRecorder simulationDataRecorder
    ) {
        this.movementModel = movementModel;
        this.linkManager = linkManager;
        this.routeManager = routeManager;
        this.trafficGenerator = trafficGenerator;
        this.packetTransmissionManager = packetTransmissionManager;
        this.nodeMetricCollector = nodeMetricCollector;
        this.linkMetricCollector = linkMetricCollector;
        this.networkMetricCollector = networkMetricCollector;
        this.faultInjector = faultInjector;
        this.simulationDataRecorder = simulationDataRecorder;
    }

    public NetworkState initialize(
            Long simulationId,
            SimulationParameters parameters
    ) {

        if (simulationId == null) {
            throw new IllegalArgumentException(
                    "Simulation ID is required"
            );
        }

        if (parameters == null) {
            throw new IllegalArgumentException(
                    "Simulation parameters are required"
            );
        }

        simulationDataRecorder.initialize(
                simulationId
        );

        clearFaultScenario();

        NetworkState state =
                new NetworkState();

        for (int i = 1;
             i <= parameters.getNodeCount();
             i++) {

            double x =
                    ThreadLocalRandom.current()
                            .nextDouble(
                                    0,
                                    parameters.getAreaWidth()
                            );

            double y =
                    ThreadLocalRandom.current()
                            .nextDouble(
                                    0,
                                    parameters.getAreaHeight()
                            );

            double speed;

            if (parameters.getMaximumNodeSpeed() <= 1) {

                speed =
                        parameters.getMaximumNodeSpeed();

            } else {

                speed =
                        ThreadLocalRandom.current()
                                .nextDouble(
                                        1,
                                        parameters.getMaximumNodeSpeed()
                                );
            }

            SimulatedNode node =
                    SimulatedNode.builder()
                            .nodeId((long) i)
                            .position(
                                    new NodePosition(
                                            x,
                                            y
                                    )
                            )
                            .speed(speed)
                            .batteryLevel(100)
                            .cpuUsage(0)
                            .memoryUsage(0)
                            .signalStrength(100)
                            .packetLoss(0)
                            .latency(0)
                            .active(true)
                            .faulty(false)
                            .build();

            state.addNode(node);
        }

        state.setCurrentTime(0);
        state.setRunning(true);

        return state;
    }

    public void step(
            Long simulationId,
            NetworkState state,
            SimulationParameters parameters
    ) {

        if (simulationId == null) {
            return;
        }

        if (state == null) {
            return;
        }

        if (parameters == null) {
            return;
        }

        if (!state.isRunning()) {
            return;
        }

        moveNodes(
                state,
                parameters
        );

        updateLinks(
                state,
                parameters
        );

        applyFaultScenario(
                state
        );

        updateLinks(
                state,
                parameters
        );

        collectLinkMetrics(
                state
        );

        collectNodeMetrics(
                state
        );

        generateTraffic(
                state,
                parameters
        );

        transmitPackets(
                state
        );

        collectNetworkMetrics(
                state
        );

        recordSimulationData(
                simulationId,
                state
        );

        advanceSimulationTime(
                state,
                parameters
        );
    }

    private void moveNodes(
            NetworkState state,
            SimulationParameters parameters
    ) {

        for (SimulatedNode node :
                state.getNodes()) {

            if (!node.isActive()) {
                continue;
            }

            movementModel.move(
                    node,
                    parameters.getAreaWidth(),
                    parameters.getAreaHeight(),
                    parameters.getTimeStep()
            );
        }
    }

    private void updateLinks(
            NetworkState state,
            SimulationParameters parameters
    ) {

        state.clearLinks();

        state.getLinks().addAll(
                linkManager.calculateLinks(
                        state.getNodes(),
                        parameters.getCommunicationRange()
                )
        );
    }

    private void applyFaultScenario(
            NetworkState state
    ) {

        if (faultScenarioParameters != null) {

            faultInjector.applyScenario(
                    state,
                    faultScenarioParameters
            );
        }

        faultInjector.reapplyActiveFaults(
                state
        );
    }

    private void collectLinkMetrics(
            NetworkState state
    ) {

        linkMetricCollector.collect(
                state.getLinks()
        );
    }

    private void collectNodeMetrics(
            NetworkState state
    ) {

        nodeMetricCollector.collect(
                state.getNodes(),
                state.getLinks()
        );
    }

    private void generateTraffic(
            NetworkState state,
            SimulationParameters parameters
    ) {

        List<SimulatedPacket> packets =
                trafficGenerator.generateTraffic(
                        state.getNodes(),
                        parameters,
                        state.getCurrentTime()
                );

        for (SimulatedPacket packet :
                packets) {

            routeManager.routePacket(
                    packet,
                    state.getLinks()
            );

            state.addPacket(packet);
        }
    }

    private void transmitPackets(
            NetworkState state
    ) {

        for (SimulatedPacket packet :
                state.getPackets()) {

            if (packet.isDelivered()
                    || packet.isDropped()) {

                continue;
            }

            packetTransmissionManager.transmit(
                    packet,
                    state.getLinks(),
                    state.getCurrentTime()
            );
        }
    }

    private void collectNetworkMetrics(
            NetworkState state
    ) {

        networkMetricCollector.collect(
                state
        );
    }

    private void recordSimulationData(
            Long simulationId,
            NetworkState state
    ) {

        simulationDataRecorder.record(
                simulationId,
                state
        );
    }

    private void advanceSimulationTime(
            NetworkState state,
            SimulationParameters parameters
    ) {

        state.setCurrentTime(
                state.getCurrentTime()
                        + (long) parameters.getTimeStep()
        );
    }

    public void configureFaultScenario(
            FaultScenarioParameters parameters
    ) {

        if (parameters == null) {

            throw new IllegalArgumentException(
                    "Fault scenario parameters are required"
            );
        }

        this.faultScenarioParameters =
                parameters;
    }

    public void clearFaultScenario() {

        this.faultScenarioParameters = null;

        faultInjector.clearFaults();
    }

    public FaultScenarioParameters
    getFaultScenarioParameters() {

        return faultScenarioParameters;
    }

    public void stop(
            NetworkState state
    ) {

        if (state == null) {
            return;
        }

        state.setRunning(false);
    }

    public void reset(
            Long simulationId,
            NetworkState state
    ) {

        if (state == null) {
            return;
        }

        state.getNodes().clear();
        state.getLinks().clear();
        state.getPackets().clear();

        state.setCurrentTime(0);
        state.setRunning(false);

        if (simulationId != null) {

            simulationDataRecorder.clear(
                    simulationId
            );
        }

        clearFaultScenario();

        trafficGenerator.reset();
    }

    public List<NodeDatasetRecord>
    getNodeDatasetRecords(
            Long simulationId
    ) {

        return simulationDataRecorder
                .getNodeRecords(
                        simulationId
                );
    }

    public int getDatasetRecordCount(
            Long simulationId
    ) {

        return simulationDataRecorder
                .getRecordCount(
                        simulationId
                );
    }

    public void clearDatasetRecords(
            Long simulationId
    ) {

        simulationDataRecorder.clear(
                simulationId
        );
    }
}