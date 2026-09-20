package com.manet.backend.simulation.engine;

import com.manet.backend.ai.service.AiOrchestratorService;
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
    private final AiOrchestratorService aiOrchestratorService;

    /*
     * Current configured fault scenario for the simulation engine.
     */
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
            SimulationDataRecorder simulationDataRecorder,
            IsolationForestDatasetRecorder isolationForestDatasetRecorder,
            AiOrchestratorService aiOrchestratorService
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
        this.isolationForestDatasetRecorder =
                isolationForestDatasetRecorder;
        this.aiOrchestratorService =
                aiOrchestratorService;
    }

    // ============================================================
    // INITIALIZE SIMULATION
    // ============================================================

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
         * Clear stale AI state when a simulation ID is reused.
         *
         * This clears:
         * - latest AI analysis
         * - LSTM history cache
         * - recovery execution guards
         */
        aiOrchestratorService.clearSimulation(
                simulationId
        );

        /*
         * Clear old simulation dataset records.
         */
        simulationDataRecorder.initialize(
                simulationId
        );

        /*
         * Clear any previous fault configuration.
         */
        clearFaultScenario();

        NetworkState state =
                new NetworkState();

        // --------------------------------------------------------
        // CREATE NODES
        // --------------------------------------------------------

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

        state.setCurrentTime(
                0
        );

        state.setRunning(
                true
        );

        return state;
    }

    // ============================================================
    // ONE SIMULATION STEP
    // ============================================================

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
         * Never execute beyond configured duration.
         */
        if (state.getCurrentTime()
                >= parameters.getSimulationDuration()) {

            stop(state);
            return;
        }

        /*
         * ========================================================
         * SIMULATION PIPELINE
         * ========================================================
         *
         * 1. Move nodes
         * 2. Build topology
         * 3. Apply configured faults
         * 4. Rebuild topology
         * 5. Reapply active link faults
         * 6. Collect link metrics
         * 7. Collect node metrics
         * 8. Generate traffic
         * 9. Route + transmit packets
         * 10. Collect network metrics
         * 11. Record simulation dataset
         * 12. Record Isolation Forest dataset
         * 13. Run AI + recovery execution
         * 14. Advance simulation clock
         *
         * AI runs BEFORE the clock advances so the models see
         * the exact state represented by the current timestamp.
         */

        // ========================================================
        // 1. MOVE NODES
        // ========================================================

        moveNodes(
                state,
                parameters
        );

        // ========================================================
        // 2. CALCULATE LINKS
        // ========================================================

        updateLinks(
                state,
                parameters
        );

        // ========================================================
        // 3. APPLY FAULT SCENARIO
        // ========================================================

        applyFaultScenario(
                state
        );

        // ========================================================
        // 4. REBUILD LINKS AFTER FAULTS
        // ========================================================

        /*
         * Faults may change node/link availability, therefore
         * rebuild the topology after applying the scenario.
         */
        updateLinks(
                state,
                parameters
        );

        // ========================================================
        // 5. REAPPLY ACTIVE LINK FAULTS
        // ========================================================

        /*
         * LinkManager creates new SimulatedLink objects every step.
         *
         * Therefore any active link fault must be applied again
         * to the newly-created link objects.
         */
        faultInjector.reapplyActiveFaults(
                state
        );

        // ========================================================
        // 6. LINK METRICS
        // ========================================================

        collectLinkMetrics(
                state
        );

        // ========================================================
        // 7. NODE METRICS
        // ========================================================

        collectNodeMetrics(
                state
        );

        // ========================================================
        // 8. GENERATE TRAFFIC
        // ========================================================

        generateTraffic(
                state,
                parameters
        );

        // ========================================================
        // 9. ROUTE + TRANSMIT PACKETS
        // ========================================================

        transmitPackets(
                state
        );

        // ========================================================
        // 10. NETWORK METRICS
        // ========================================================

        collectNetworkMetrics(
                state
        );

        // ========================================================
        // 11. RECORD MAIN AI DATASET
        // ========================================================

        /*
         * Save the current network state BEFORE AI recovery.
         *
         * This preserves the actual condition that caused the AI
         * prediction, rather than recording only the post-recovery
         * state.
         */
        recordSimulationData(
                simulationId,
                state
        );

        // ========================================================
        // 12. RECORD ISOLATION FOREST DATASET
        // ========================================================

        isolationForestDatasetRecorder.record(
                simulationId,
                state
        );

        // ========================================================
        // 13. AI INFERENCE + SELF-HEALING
        // ========================================================

        /*
         * AiOrchestratorService performs:
         *
         * Random Forest
         * XGBoost
         * Isolation Forest
         * LSTM
         * Recovery Engine
         * RecoveryExecutionService
         *
         * Any recovery action selected by the Recovery Engine
         * changes the in-memory MANET state here.
         *
         * Those state changes therefore affect the NEXT timestep.
         */
        aiOrchestratorService.analyzeSimulationStep(
                simulationId,
                state
        );

        // ========================================================
        // 14. ADVANCE SIMULATION CLOCK
        // ========================================================

        advanceSimulationTime(
                state,
                parameters
        );
    }

    // ============================================================
    // MOVE NODES
    // ============================================================

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
             * Inactive/isolated nodes do not move.
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

    // ============================================================
    // UPDATE LINKS
    // ============================================================

    private void updateLinks(
            NetworkState state,
            SimulationParameters parameters
    ) {

        /*
         * LinkManager calculates the current topology from
         * the latest node positions.
         */
        state.clearLinks();

        state.getLinks().addAll(
                linkManager.calculateLinks(
                        state.getNodes(),
                        parameters.getCommunicationRange()
                )
        );
    }

    // ============================================================
    // APPLY FAULT SCENARIO
    // ============================================================

    private void applyFaultScenario(
            NetworkState state
    ) {

        /*
         * Apply the currently configured scenario.
         */
        if (faultScenarioParameters != null) {

            faultInjector.applyScenario(
                    state,
                    faultScenarioParameters
            );
        }

        /*
         * Keep already-active faults applied to the current
         * node/link objects.
         *
         * This is important for node faults before topology
         * recalculation.
         *
         * Link faults are reapplied again after updateLinks()
         * in step(), because LinkManager creates fresh links.
         */
        faultInjector.reapplyActiveFaults(
                state
        );
    }

    // ============================================================
    // COLLECT LINK METRICS
    // ============================================================

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

    // ============================================================
    // COLLECT NODE METRICS
    // ============================================================

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

    // ============================================================
    // GENERATE TRAFFIC
    // ============================================================

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
             * Calculate the initial route using the current topology.
             */
            routeManager.routePacket(
                    packet,
                    state.getLinks()
            );

            state.addPacket(
                    packet
            );
        }
    }

    // ============================================================
    // PACKET TRANSMISSION
    // ============================================================

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

    // ============================================================
    // NETWORK METRICS
    // ============================================================

    private void collectNetworkMetrics(
            NetworkState state
    ) {

        networkMetricCollector.collect(
                state
        );
    }

    // ============================================================
    // RECORD DATASET
    // ============================================================

    private void recordSimulationData(
            Long simulationId,
            NetworkState state
    ) {

        /*
         * SimulationDataRecorder handles:
         *
         * NODE records
         * -> Random Forest / XGBoost
         *
         * LINK records
         * -> LSTM
         */
        simulationDataRecorder.record(
                simulationId,
                state
        );
    }

    // ============================================================
    // ADVANCE SIMULATION TIME
    // ============================================================

    private void advanceSimulationTime(
            NetworkState state,
            SimulationParameters parameters
    ) {

        long timeStep =
                (long) parameters.getTimeStep();

        /*
         * Protect against invalid timestep.
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
         * Never exceed configured simulation duration.
         */
        if (nextTime > simulationDuration) {
            nextTime = simulationDuration;
        }

        state.setCurrentTime(
                nextTime
        );

        /*
         * Stop once the duration has been reached.
         */
        if (nextTime >= simulationDuration) {
            state.setRunning(
                    false
            );
        }
    }

    // ============================================================
    // CONFIGURE FAULT SCENARIO
    // ============================================================

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

    // ============================================================
    // CLEAR FAULT SCENARIO
    // ============================================================

    public void clearFaultScenario() {

        this.faultScenarioParameters =
                null;

        faultInjector.clearFaults();
    }

    // ============================================================
    // GET CURRENT FAULT SCENARIO
    // ============================================================

    public FaultScenarioParameters
    getFaultScenarioParameters() {

        return faultScenarioParameters;
    }

    // ============================================================
    // STOP SIMULATION
    // ============================================================

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

    // ============================================================
    // RESET SIMULATION
    // ============================================================

    public void reset(
            Long simulationId,
            NetworkState state
    ) {

        if (state == null) {
            return;
        }

        // --------------------------------------------------------
        // Remove nodes
        // --------------------------------------------------------

        if (state.getNodes() != null) {
            state.getNodes().clear();
        }

        // --------------------------------------------------------
        // Remove links
        // --------------------------------------------------------

        if (state.getLinks() != null) {
            state.getLinks().clear();
        }

        // --------------------------------------------------------
        // Remove packets
        // --------------------------------------------------------

        if (state.getPackets() != null) {
            state.getPackets().clear();
        }

        // --------------------------------------------------------
        // Clear live AI information
        // --------------------------------------------------------

        if (state.getAiAnalysis() != null) {
            state.getAiAnalysis().clear();
        }

        if (state.getRecoveryEvents() != null) {
            state.getRecoveryEvents().clear();
        }

        // --------------------------------------------------------
        // Reset time
        // --------------------------------------------------------

        state.setCurrentTime(
                0
        );

        // --------------------------------------------------------
        // Stop simulation
        // --------------------------------------------------------

        state.setRunning(
                false
        );

        // --------------------------------------------------------
        // Clear persisted dataset
        // --------------------------------------------------------

        if (simulationId != null) {

            simulationDataRecorder.clear(
                    simulationId
            );

            /*
             * Clear:
             * - AI analysis cache
             * - LSTM history cache
             * - recovery execution guards
             */
            aiOrchestratorService.clearSimulation(
                    simulationId
            );
        }

        // --------------------------------------------------------
        // Remove faults
        // --------------------------------------------------------

        clearFaultScenario();

        // --------------------------------------------------------
        // Reset traffic generator
        // --------------------------------------------------------

        trafficGenerator.reset();
    }

    // ============================================================
    // GET NODE DATASET
    // ============================================================

    public List<NodeDatasetRecord>
    getNodeDatasetRecords(
            Long simulationId
    ) {

        return simulationDataRecorder
                .getNodeRecords(
                        simulationId
                );
    }

    // ============================================================
    // GET DATASET RECORD COUNT
    // ============================================================

    public int getDatasetRecordCount(
            Long simulationId
    ) {

        return simulationDataRecorder
                .getRecordCount(
                        simulationId
                );
    }

    // ============================================================
    // CLEAR DATASET
    // ============================================================

    public void clearDatasetRecords(
            Long simulationId
    ) {

        simulationDataRecorder.clear(
                simulationId
        );
    }
}