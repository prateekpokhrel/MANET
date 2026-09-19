package com.manet.backend.simulation.engine;

import com.manet.backend.model.NetworkState;
import com.manet.backend.model.NodePosition;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.model.SimulatedPacket;
import com.manet.backend.model.SimulationParameters;

import com.manet.backend.simulation.dataset.IsolationForestDatasetRecorder;
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

    private final IsolationForestDatasetRecorder isolationForestDatasetRecorder;

    /*
     * Current fault scenario.
     *
     * The scenario is applied according to the
     * current simulation timestamp.
     */
    private FaultScenarioParameters faultScenarioParameters;

    // CONSTRUCTOR


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
            SimulationDataRecorder simulationDataRecorder,
            IsolationForestDatasetRecorder isolationForestDatasetRecorder
    ) {

        this.movementModel =
                movementModel;

        this.linkManager =
                linkManager;

        this.routeManager =
                routeManager;

        this.trafficGenerator =
                trafficGenerator;

        this.packetTransmissionManager =
                packetTransmissionManager;

        this.nodeMetricCollector =
                nodeMetricCollector;

        this.linkMetricCollector =
                linkMetricCollector;

        this.networkMetricCollector =
                networkMetricCollector;

        this.faultInjector =
                faultInjector;

        this.simulationDataRecorder =
                simulationDataRecorder;

        this.isolationForestDatasetRecorder =
                isolationForestDatasetRecorder;
    }

    // INITIALIZE SIMULATION


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


        /*
         * Remove old dataset records for this simulation.
         *
         * The same SimulationDatasetRecord infrastructure
         * is used for:
         *
         * - Random Forest
         * - XGBoost
         * - LSTM
         */
        simulationDataRecorder.initialize(
                simulationId
        );


        /*
         * Remove any previous fault scenario.
         */
        clearFaultScenario();


        NetworkState state =
                new NetworkState();

        // CREATE NODES


        for (int i = 1;
             i <= parameters.getNodeCount();
             i++) {

            /*
             * Random initial X position.
             */
            double x =
                    ThreadLocalRandom.current()
                            .nextDouble(
                                    0,
                                    parameters.getAreaWidth()
                            );


            /*
             * Random initial Y position.
             */
            double y =
                    ThreadLocalRandom.current()
                            .nextDouble(
                                    0,
                                    parameters.getAreaHeight()
                            );


            /*
             * Random initial movement speed.
             */
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

                            .nodeId(
                                    (long) i
                            )

                            .position(
                                    new NodePosition(
                                            x,
                                            y
                                    )
                            )

                            .speed(
                                    speed
                            )

                            /*
                             * Healthy initial state.
                             */
                            .batteryLevel(
                                    100
                            )

                            .cpuUsage(
                                    0
                            )

                            .memoryUsage(
                                    0
                            )

                            .signalStrength(
                                    100
                            )

                            .packetLoss(
                                    0
                            )

                            .latency(
                                    0
                            )

                            .active(
                                    true
                            )

                            .faulty(
                                    false
                            )

                            .build();


            state.addNode(
                    node
            );
        }

        // INITIAL SIMULATION STATE
       state.setCurrentTime(
                0
        );

        state.setRunning(
                true
        );


        return state;
    }

    // ONE SIMULATION STEP
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


        /*

         * STOP CHECK

         *
         * Do not execute another step once the simulation
         * duration has already been reached.
         */

        if (state.getCurrentTime()
                >= parameters.getSimulationDuration()) {

            stop(state);

            return;
        }

        /*

         * STEP PIPELINE
         *
         * 1. Move nodes
         * 2. Calculate links
         * 3. Apply faults
         * 4. Recalculate links
         * 5. Collect link metrics
         * 6. Collect node metrics
         * 7. Generate traffic
         * 8. Route packets
         * 9. Transmit packets
         * 10. Collect network metrics
         * 11. Record NODE + LINK dataset
         * 12. Advance simulation clock
         *
         * This order is important for the AI datasets.
         */

        // 1. MOVE NODES


        moveNodes(
                state,
                parameters
        );

        // 2. CALCULATE LINKS


        updateLinks(
                state,
                parameters
        );

        // 3. APPLY FAULTS
       applyFaultScenario(
                state
        );

        // 4. RECALCULATE LINKS AFTER FAULTS
        /*
         * Faults can change node/link availability.
         *
         * Therefore links are calculated again after
         * applying the fault scenario.
         */
        updateLinks(
                state,
                parameters
        );

        // 5. LINK METRICS
        collectLinkMetrics(
                state
        );

        // 6. NODE METRICS
        collectNodeMetrics(
                state
        );

        // 7. GENERATE TRAFFIC
        generateTraffic(
                state,
                parameters
        );

        // 8 + 9. ROUTE AND TRANSMIT PACKETS

        transmitPackets(
                state
        );

        // 10. NETWORK METRICS
        collectNetworkMetrics(
                state
        );

        // 11. RECORD AI DATASET
       /*
         * IMPORTANT
         *
         * This must happen BEFORE the simulation clock
         * is advanced.
         *
         * Therefore:
         *
         * timestamp = current network state timestamp
         *
         * The recorder stores:
         *
         * NODE records:
         * - battery
         * - CPU
         * - memory
         * - RSSI
         * - packet loss
         * - latency
         * - fault information
         *
         * LINK records:
         * - source node
         * - destination node
         * - distance
         * - RSSI
         * - packet loss
         * - latency
         * - throughput
         * - link quality
         * - mobility speed
         *
         * This allows the same simulation data to support
         * Random Forest, XGBoost and LSTM.
         */

        // RECORD DATASET
        recordSimulationData(
                simulationId,
                state
        );

        // RECORD ISOLATION FOREST DATASET
        isolationForestDatasetRecorder.record(
                simulationId,
                state
        );

        // ADVANCE SIMULATION CLOCK

        advanceSimulationTime(
                state,
                parameters
        );
    }

    // MOVE NODES
   private void moveNodes(
            NetworkState state,
            SimulationParameters parameters
    ) {

        if (state.getNodes() == null) {
            return;
        }


        for (SimulatedNode node :
                state.getNodes()) {

            if (node == null) {
                continue;
            }


            /*
             * Failed/inactive nodes do not move.
             */
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

    // UPDATE LINKS
    private void updateLinks(
            NetworkState state,
            SimulationParameters parameters
    ) {

        /*
         * Remove links from the previous timestep.
         */
        state.clearLinks();


        /*
         * Calculate links using current node positions.
         *
         * LinkManager provides:
         *
         * - source node
         * - destination node
         * - distance
         * - signal strength
         * - quality
         * - latency
         * - packet loss
         * - active state
         */
        state.getLinks().addAll(
                linkManager.calculateLinks(
                        state.getNodes(),
                        parameters.getCommunicationRange()
                )
        );
    }


    // APPLY FAULT SCENARIO
    private void applyFaultScenario(
            NetworkState state
    ) {

        /*
         * Apply the configured fault scenario.
         */
        if (faultScenarioParameters != null) {

            faultInjector.applyScenario(
                    state,
                    faultScenarioParameters
            );
        }


        /*
         * Reapply faults which are already active.
         *
         * This ensures faults remain active for their
         * configured duration.
         */
        faultInjector.reapplyActiveFaults(
                state
        );
    }

    // LINK METRICS
   private void collectLinkMetrics(
            NetworkState state
    ) {

        if (state.getLinks() == null) {
            return;
        }

        linkMetricCollector.collect(
                state.getLinks()
        );
    }

    // NODE METRICS
   private void collectNodeMetrics(
            NetworkState state
    ) {

        if (state.getNodes() == null) {
            return;
        }

        nodeMetricCollector.collect(
                state.getNodes(),
                state.getLinks()
        );
    }

    // TRAFFIC GENERATION
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


        if (packets == null) {
            return;
        }


        for (SimulatedPacket packet :
                packets) {

            if (packet == null) {
                continue;
            }


            /*
             * Determine a route using the current topology.
             */
            routeManager.routePacket(
                    packet,
                    state.getLinks()
            );


            /*
             * Add packet to the network.
             */
            state.addPacket(
                    packet
            );
        }
    }

    // PACKET TRANSMISSION
   private void transmitPackets(
            NetworkState state
    ) {

        if (state.getPackets() == null) {
            return;
        }


        for (SimulatedPacket packet :
                state.getPackets()) {

            if (packet == null) {
                continue;
            }


            /*
             * Delivered/dropped packets require no
             * additional transmission.
             */
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

    // NETWORK METRICS
    private void collectNetworkMetrics(
            NetworkState state
    ) {

        networkMetricCollector.collect(
                state
        );
    }

    // RECORD DATASET
   private void recordSimulationData(
            Long simulationId,
            NetworkState state
    ) {

        /*
         * ONE unified recorder.
         *
         * No separate LSTM recorder is required.
         *
         * SimulationDataRecorder is responsible for both:
         *
         * NODE records -> XGBoost / Random Forest
         *
         * LINK records -> LSTM
         */
        simulationDataRecorder.record(
                simulationId,
                state
        );
    }

    // ADVANCE SIMULATION TIME
    private void advanceSimulationTime(
            NetworkState state,
            SimulationParameters parameters
    ) {

        long timeStep =
                (long) parameters.getTimeStep();


        /*
         * Protect against zero or negative timestep.
         */
        if (timeStep <= 0) {
            timeStep = 1;
        }


        long currentTime =
                state.getCurrentTime();


        long simulationDuration =
                (long) parameters.getSimulationDuration();


        long nextTime =
                currentTime + timeStep;


        /*
         * Never allow currentTime to exceed the configured
         * simulation duration.
         *
         * Example:
         *
         * duration = 120
         * currentTime = 119
         * timestep = 1
         *
         * nextTime = 120
         */
        if (nextTime > simulationDuration) {

            nextTime =
                    simulationDuration;
        }


        state.setCurrentTime(
                nextTime
        );


        /*
         * Stop immediately when duration is reached.
         *
         * SimulationRunner will also perform its own
         * completion check.
         */
        if (nextTime >= simulationDuration) {

            state.setRunning(
                    false
            );
        }
    }

    // CONFIGURE FAULT SCENARIO
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

    // CLEAR FAULT SCENARIO
    public void clearFaultScenario() {

        this.faultScenarioParameters =
                null;


        faultInjector.clearFaults();
    }

    // GET CURRENT FAULT SCENARIO
   public FaultScenarioParameters
    getFaultScenarioParameters() {

        return faultScenarioParameters;
    }

    // STOP SIMULATION
    public void stop(
            NetworkState state
    ) {

        if (state == null) {
            return;
        }


        state.setRunning(
                false
        );
    }

    // RESET SIMULATION
    public void reset(
            Long simulationId,
            NetworkState state
    ) {

        if (state == null) {
            return;
        }


        /*
         * Remove nodes.
         */
        if (state.getNodes() != null) {

            state.getNodes().clear();
        }


        /*
         * Remove links.
         */
        if (state.getLinks() != null) {

            state.getLinks().clear();
        }


        /*
         * Remove packets.
         */
        if (state.getPackets() != null) {

            state.getPackets().clear();
        }


        /*
         * Reset clock.
         */
        state.setCurrentTime(
                0
        );


        /*
         * Stop simulation.
         */
        state.setRunning(
                false
        );


        /*
         * Remove dataset records.
         */
        if (simulationId != null) {

            simulationDataRecorder.clear(
                    simulationId
            );
        }


        /*
         * Remove active faults.
         */
        clearFaultScenario();


        /*
         * Reset traffic generation.
         */
        trafficGenerator.reset();
    }

    // GET NODE DATASET
    public List<NodeDatasetRecord>
    getNodeDatasetRecords(
            Long simulationId
    ) {

        return simulationDataRecorder
                .getNodeRecords(
                        simulationId
                );
    }

    // GET DATASET RECORD COUNT
    public int getDatasetRecordCount(
            Long simulationId
    ) {

        return simulationDataRecorder
                .getRecordCount(
                        simulationId
                );
    }

    // CLEAR DATASET
   public void clearDatasetRecords(
            Long simulationId
    ) {

        simulationDataRecorder.clear(
                simulationId
        );
    }
}