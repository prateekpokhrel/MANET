package com.manet.backend.ai.service;

import com.manet.backend.ai.client.AiServiceClient;
import com.manet.backend.ai.dto.*;
import com.manet.backend.ai.persistence.AiPersistenceService;
import com.manet.backend.entity.SimulationDatasetRecord;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.repository.SimulationDatasetRecordRepository;
import com.manet.backend.simulation.fault.FaultSeverity;
import com.manet.backend.simulation.fault.FaultType;
import com.manet.backend.simulation.network.PacketTransmissionManager;
import com.manet.backend.websocket.SimulationWebSocketPublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiOrchestratorService {

    /*
     * These are the fault types supported by the trained
     * Recoverability Engine.
     */
    private static final Set<String> RECOVERY_FAULT_TYPES = Set.of(
            "NORMAL",
            "HIGH_PACKET_LOSS",
            "LINK_FAILURE",
            "RADIO_INTERFERENCE",
            "CHANNEL_CONGESTION"
    );

    private final AiServiceClient aiServiceClient;
    private final SimulationDatasetRecordRepository datasetRepository;
    private final PacketTransmissionManager packetTransmissionManager;
    private final AiPersistenceService aiPersistenceService;
    private final RecoveryExecutionService recoveryExecutionService;
    private final SimulationWebSocketPublisher webSocketPublisher;

    private final boolean enabled;
    private final boolean failFast;
    private final double recoveryTriggerThreshold;

    /*
     * Latest AI result for every node of every simulation.
     */
    private final Map<Long, Map<Long, AiNodeAnalysis>> latestAnalyses =
            new ConcurrentHashMap<>();

    /*
     * Cache LINK dataset records for a simulation timestamp.
     *
     * The simulation can analyze multiple nodes at the same timestamp.
     * Without this cache, we would repeatedly query the complete LINK
     * history from PostgreSQL.
     */
    private final Map<Long, LinkHistoryCacheEntry> lstmHistoryCache =
            new ConcurrentHashMap<>();

    public AiOrchestratorService(
            AiServiceClient aiServiceClient,
            SimulationDatasetRecordRepository datasetRepository,
            PacketTransmissionManager packetTransmissionManager,
            AiPersistenceService aiPersistenceService,
            RecoveryExecutionService recoveryExecutionService,
            SimulationWebSocketPublisher webSocketPublisher,
            @Value("${manet.ai.enabled:true}") boolean enabled,
            @Value("${manet.ai.fail-fast:false}") boolean failFast,
            @Value("${manet.ai.recovery-trigger-threshold:0.50}")
            double recoveryTriggerThreshold
    ) {
        this.aiServiceClient = aiServiceClient;
        this.datasetRepository = datasetRepository;
        this.packetTransmissionManager = packetTransmissionManager;
        this.aiPersistenceService = aiPersistenceService;
        this.recoveryExecutionService = recoveryExecutionService;
        this.webSocketPublisher = webSocketPublisher;
        this.enabled = enabled;
        this.failFast = failFast;
        this.recoveryTriggerThreshold = recoveryTriggerThreshold;
    }

    public boolean isEnabled() {
        return enabled;
    }

    /*
     * Analyze every node in the current simulation state.
     */
    public void analyzeSimulationStep(
            Long simulationId,
            NetworkState state
    ) {

        if (!enabled || simulationId == null || state == null) {
            return;
        }

        Map<Long, AiNodeAnalysis> simulationResults =
                latestAnalyses.computeIfAbsent(
                        simulationId,
                        ignored -> new ConcurrentHashMap<>()
                );

        for (SimulatedNode node : state.getNodes()) {

            if (node == null || node.getNodeId() == null) {
                continue;
            }

            AiNodeAnalysis analysis =
                    analyzeNode(
                            simulationId,
                            state,
                            node
                    );

            simulationResults.put(
                    node.getNodeId(),
                    analysis
            );

            /*
             * Store latest AI analysis directly in the live state
             * so the frontend can receive it through the normal
             * /state endpoint.
             */
            state.getAiAnalysis().put(
                    node.getNodeId(),
                    analysis
            );
        }
    }

    /*
     * Run all AI models for a single node.
     */
    public AiNodeAnalysis analyzeNode(
            Long simulationId,
            NetworkState state,
            SimulatedNode node
    ) {

        if (!enabled) {
            return emptyDisabledResult(node);
        }

        AiNodeAnalysis.AiNodeAnalysisBuilder result =
                AiNodeAnalysis.builder()
                        .nodeId(node.getNodeId())
                        .timestamp(state.getCurrentTime())
                        .status("READY");

        /*
         * Convert the current MANET node state to the feature
         * structure expected by Random Forest / XGBoost.
         */
        AiNodeFeatures nodeFeatures =
                toNodeFeatures(
                        node,
                        state.getCurrentTime()
                );

        RandomForestResponse randomForest = null;
        XgboostResponse xgboost = null;
        IsolationForestResponse isolationForest = null;
        LstmResponse lstm = null;
        RecoveryResponse recovery = null;
        RecoveryExecutionResult recoveryExecution = null;

        List<String> errors = new ArrayList<>();

        /*
         * ----------------------------------------------------------
         * 1. RANDOM FOREST
         * ----------------------------------------------------------
         */
        try {

            randomForest =
                    aiServiceClient.predictRandomForest(
                            nodeFeatures
                    );

        } catch (RestClientException | IllegalArgumentException exception) {

            errors.add(
                    "Random Forest: " + exception.getMessage()
            );
        }

        /*
         * ----------------------------------------------------------
         * 2. XGBOOST
         * ----------------------------------------------------------
         */
        try {

            xgboost =
                    aiServiceClient.predictXgboost(
                            nodeFeatures
                    );

        } catch (RestClientException | IllegalArgumentException exception) {

            errors.add(
                    "XGBoost: " + exception.getMessage()
            );
        }

        /*
         * ----------------------------------------------------------
         * 3. ISOLATION FOREST
         * ----------------------------------------------------------
         */
        try {

            IsolationForestFeatures isolationFeatures =
                    toIsolationFeatures(
                            node,
                            state
                    );

            isolationForest =
                    aiServiceClient.predictIsolationForest(
                            isolationFeatures
                    );

        } catch (RestClientException | IllegalArgumentException exception) {

            errors.add(
                    "Isolation Forest: " + exception.getMessage()
            );
        }

        /*
         * ----------------------------------------------------------
         * 4. LSTM
         * ----------------------------------------------------------
         *
         * The trained LSTM requires:
         *
         * 5 timesteps × 7 features
         *
         * We build:
         *
         * 4 historical LINK records
         * +
         * 1 current LINK state
         *
         * The current link is preferred when enough historical
         * records exist for that link.
         *
         * If the current link recently disappeared because of
         * mobility/failure, we fall back to the latest historical
         * link pair with enough history.
         */
        Optional<SimulatedLink> representativeLink =
                findRepresentativeLink(
                        simulationId,
                        node,
                        state
                );

        Optional<LstmRequest> lstmRequest =
                buildLstmRequest(
                        simulationId,
                        representativeLink.orElse(null),
                        node,
                        state
                );

        if (lstmRequest.isPresent()) {

            try {

                lstm =
                        aiServiceClient.predictLstm(
                                lstmRequest.get()
                        );

            } catch (RestClientException | IllegalArgumentException exception) {

                errors.add(
                        "LSTM: " + exception.getMessage()
                );
            }

        } else if (state.getCurrentTime() > 0) {

            errors.add(
                    "LSTM: insufficient historical LINK data for a 5-step sequence"
            );
        }

        /*
         * ----------------------------------------------------------
         * 5. RECOVERABILITY ENGINE
         * ----------------------------------------------------------
         *
         * Recovery is triggered when:
         *
         * RF failure probability >= threshold
         * OR
         * XGBoost predicts a non-normal fault
         * OR
         * Isolation Forest detects an anomaly
         */
        if (shouldRunRecovery(
                randomForest,
                xgboost,
                isolationForest
        )) {

            try {

                RecoveryRequest recoveryRequest =
                        buildRecoveryRequest(
                                node,
                                state,
                                randomForest,
                                xgboost,
                                isolationForest,
                                lstm,
                                representativeLink
                        );

                /*
                 * The recoverability model was not trained for
                 * every XGBoost fault category.
                 *
                 * Only send supported categories.
                 */
                if (RECOVERY_FAULT_TYPES.contains(
                        recoveryRequest.fault_type_for_engine()
                )) {

                    recovery =
                            aiServiceClient.predictRecovery(
                                    recoveryRequest
                            );

                    /*
                     * The Python model recommends the action.
                     * Spring Boot now executes and persists the
                     * resulting recovery action.
                     */
                    if (recovery != null) {

                        RecoveryExecutionResult execution =
                                recoveryExecutionService.execute(
                                        simulationId,
                                        state,
                                        node,
                                        buildPreExecutionAnalysis(
                                                node,
                                                state,
                                                randomForest,
                                                xgboost,
                                                isolationForest,
                                                lstm,
                                                recovery
                                        )
                                );

                        recoveryExecution = execution;
                    }

                } else {

                    errors.add(
                            "Recovery Engine: trained model does not contain fault type "
                                    + recoveryRequest.fault_type_for_engine()
                    );
                }

            } catch (RestClientException | IllegalArgumentException exception) {

                errors.add(
                        "Recovery Engine: " + exception.getMessage()
                );
            }
        }

        else {
            /*
             * The node returned to a non-triggered state. Clear the
             * de-duplication marker so a later fault can be recovered
             * independently in the same simulation.
             */
            recoveryExecutionService.clearNodeConditions(
                    simulationId,
                    node.getNodeId()
            );
        }

        /*
         * Build final AI response.
         */
        result
                .randomForest(randomForest)
                .xgboost(xgboost)
                .isolationForest(isolationForest)
                .lstm(lstm)
                .recovery(recovery);

        if (recoveryExecution != null) {
            result
                    .recoveryExecutionStatus(
                            recoveryExecution.status()
                    )
                    .recoveryExecutionMessage(
                            recoveryExecution.message()
                    );
        }

        if (!errors.isEmpty()) {

            result
                    .status("PARTIAL")
                    .message(
                            String.join(
                                    " | ",
                                    errors
                            )
                    );

            if (failFast) {

                throw new IllegalStateException(
                        "AI inference failed for node "
                                + node.getNodeId()
                                + ": "
                                + String.join(
                                " | ",
                                errors
                        )
                );
            }

        } else {

            result.status("READY");
        }

        AiNodeAnalysis analysis =
                result.build();

        /*
         * Store in in-memory latest-result map.
         */
        latestAnalyses
                .computeIfAbsent(
                        simulationId,
                        ignored -> new ConcurrentHashMap<>()
                )
                .put(
                        node.getNodeId(),
                        analysis
                );

        /*
         * Store in live NetworkState for frontend /state response.
         */
        state.getAiAnalysis().put(
                node.getNodeId(),
                analysis
        );

        /*
         * Persist the complete model snapshot so it survives
         * application restarts and can be consumed by the dashboard.
         */
        aiPersistenceService.saveAnalysis(
                simulationId,
                analysis
        );

        /*
         * Push the node-level AI state to subscribed frontend clients.
         */
        webSocketPublisher.publishAiAnalysis(
                simulationId,
                analysis
        );

        if (recoveryExecution != null
                && !"ALREADY_HANDLED".equals(
                        recoveryExecution.status()
                )
                && !"SKIPPED".equals(
                        recoveryExecution.status()
                )) {

            webSocketPublisher.publishRecoveryExecution(
                    simulationId,
                    analysis,
                    recoveryExecution
            );
        }

        return analysis;
    }

    /*
     * Return latest analysis for all nodes of a simulation.
     */
    public Map<Long, AiNodeAnalysis> getLatestAnalyses(
            Long simulationId
    ) {

        return latestAnalyses.getOrDefault(
                simulationId,
                Collections.emptyMap()
        );
    }

    /*
     * Return latest analysis for a specific node.
     */
    public AiNodeAnalysis getLatestAnalysis(
            Long simulationId,
            Long nodeId
    ) {

        return latestAnalyses
                .getOrDefault(
                        simulationId,
                        Collections.emptyMap()
                )
                .get(nodeId);
    }

    /**
     * Clears only the in-memory AI state for a simulation.
     * Persistent AI history is retained.
     */
    public void clearSimulation(
            Long simulationId
    ) {

        if (simulationId != null) {

            latestAnalyses.remove(simulationId);

            lstmHistoryCache.remove(simulationId);

            recoveryExecutionService.clearSimulation(
                    simulationId
            );
        }
    }

    /**
     * Explicitly delete persisted AI/recovery history.
     * Used by simulation reset/delete.
     */
    public void clearPersistedSimulation(
            Long simulationId
    ) {

        clearSimulation(simulationId);

        aiPersistenceService.clearSimulation(
                simulationId
        );
    }

    /*
     * AI service health.
     */
    public Map<String, Object> health() {

        boolean available =
                aiServiceClient.isAvailable();

        return Map.of(
                "enabled",
                enabled,
                "available",
                available,
                "baseUrlConfigured",
                true
        );
    }

    /**
     * Builds the in-memory analysis object passed to the recovery
     * executor before the final persisted analysis is assembled.
     */
    private AiNodeAnalysis buildPreExecutionAnalysis(
            SimulatedNode node,
            NetworkState state,
            RandomForestResponse randomForest,
            XgboostResponse xgboost,
            IsolationForestResponse isolationForest,
            LstmResponse lstm,
            RecoveryResponse recovery
    ) {

        return AiNodeAnalysis.builder()
                .nodeId(node.getNodeId())
                .timestamp(state.getCurrentTime())
                .status("READY")
                .randomForest(randomForest)
                .xgboost(xgboost)
                .isolationForest(isolationForest)
                .lstm(lstm)
                .recovery(recovery)
                .build();
    }

    /*
     * --------------------------------------------------------------
     * NODE FEATURE MAPPING
     * --------------------------------------------------------------
     *
     * Random Forest expects:
     *
     * node_id
     * x
     * y
     * speed
     * battery_level
     * cpu_usage
     * memory_usage
     * signal_strength
     * packet_loss
     * latency
     *
     * XGBoost additionally uses active + timestamp-derived fields
     * inside the Python AI service.
     */
    private AiNodeFeatures toNodeFeatures(
            SimulatedNode node,
            long timestamp
    ) {

        double x = 0.0;
        double y = 0.0;

        if (node.getPosition() != null) {

            x = node.getPosition().getX();
            y = node.getPosition().getY();
        }

        return new AiNodeFeatures(
                node.getNodeId(),
                x,
                y,
                node.getSpeed(),
                node.getBatteryLevel(),
                node.getCpuUsage(),
                node.getMemoryUsage(),
                node.getSignalStrength(),
                node.getPacketLoss(),
                node.getLatency(),
                node.isActive(),
                timestamp
        );
    }

    /*
     * --------------------------------------------------------------
     * ISOLATION FOREST FEATURES
     * --------------------------------------------------------------
     */
    private IsolationForestFeatures toIsolationFeatures(
            SimulatedNode node,
            NetworkState state
    ) {

        int queueSize =
                calculateQueueSize(
                        node.getNodeId(),
                        state
                );

        double trafficLoad =
                calculateTrafficLoad(
                        node.getNodeId(),
                        state
                );

        double linkQuality =
                calculateAverageLinkQuality(
                        node.getNodeId(),
                        state
                );

        double throughput =
                calculateNodeThroughput(
                        node.getNodeId(),
                        state
                );

        return new IsolationForestFeatures(
                node.getNodeId(),
                node.getCpuUsage(),
                node.getMemoryUsage(),
                node.getBatteryLevel(),
                node.getSignalStrength(),
                node.getPacketLoss(),
                node.getLatency(),
                throughput,
                queueSize,
                trafficLoad,
                linkQuality,
                node.getSpeed()
        );
    }

    /*
     * --------------------------------------------------------------
     * LSTM REQUEST BUILDER
     * --------------------------------------------------------------
     */
    private Optional<LstmRequest> buildLstmRequest(
            Long simulationId,
            SimulatedLink currentLink,
            SimulatedNode currentNode,
            NetworkState state
    ) {

        if (simulationId == null
                || currentNode == null
                || currentNode.getNodeId() == null
                || state == null
                || state.getCurrentTime() <= 0) {

            return Optional.empty();
        }

        /*
         * Load cached LINK history.
         */
        List<SimulationDatasetRecord> linkRecords =
                getCachedLinkHistory(
                        simulationId,
                        state.getCurrentTime()
                );

        /*
         * Do not use current timestamp as historical data.
         * Current state is appended separately as timestep 5.
         */
        linkRecords = linkRecords.stream()
                .filter(Objects::nonNull)
                .filter(record ->
                        record.getTimestamp()
                                < state.getCurrentTime()
                )
                .filter(record ->
                        record.getSourceNodeId() != null
                                && record.getDestinationNodeId() != null
                )
                .toList();

        if (linkRecords.isEmpty()) {
            return Optional.empty();
        }

        /*
         * Group historical link records using canonical
         * source-destination pairs.
         *
         * 1 -> 2
         * and
         * 2 -> 1
         *
         * are treated as the same physical link.
         */
        Map<String, List<SimulationDatasetRecord>> historyByPair =
                new HashMap<>();

        for (SimulationDatasetRecord record : linkRecords) {

            if (!isConnectedToNode(
                    record,
                    currentNode.getNodeId()
            )) {
                continue;
            }

            String pairKey =
                    canonicalLinkKey(
                            record.getSourceNodeId(),
                            record.getDestinationNodeId()
                    );

            historyByPair
                    .computeIfAbsent(
                            pairKey,
                            ignored -> new ArrayList<>()
                    )
                    .add(record);
        }

        if (historyByPair.isEmpty()) {
            return Optional.empty();
        }

        /*
         * Sort newest -> oldest.
         */
        historyByPair.values().forEach(
                records ->
                        records.sort(
                                Comparator
                                        .comparingLong(
                                                SimulationDatasetRecord
                                                        ::getTimestamp
                                        )
                                        .reversed()
                        )
        );

        /*
         * Select the best historical/current link candidate.
         */
        LstmCandidate candidate =
                chooseBestLstmCandidate(
                        currentNode.getNodeId(),
                        currentLink,
                        state,
                        historyByPair
                );

        if (candidate == null
                || candidate.history().size() < 4) {

            return Optional.empty();
        }

        /*
         * Select latest 4 historical records.
         */
        List<SimulationDatasetRecord> history =
                candidate.history()
                        .subList(
                                0,
                                Math.min(
                                        4,
                                        candidate.history().size()
                                )
                        );

        List<LstmTimeStep> sequence =
                new ArrayList<>(5);

        /*
         * Historical records are stored newest -> oldest.
         * LSTM receives oldest -> newest.
         */
        for (int i = history.size() - 1; i >= 0; i--) {

            sequence.add(
                    toLstmTimeStep(
                            history.get(i)
                    )
            );
        }

        /*
         * ----------------------------------------------------------
         * CURRENT TIMESTEP
         * ----------------------------------------------------------
         */
        LstmTimeStep currentStep;

        if (candidate.currentLink() != null) {

            currentStep =
                    new LstmTimeStep(
                            candidate.currentLink()
                                    .getSignalStrength(),

                            candidate.currentLink()
                                    .getPacketLoss(),

                            candidate.currentLink()
                                    .getLatency(),

                            calculateLinkThroughput(
                                    candidate.currentLink(),
                                    state.getCurrentTime()
                            ),

                            clamp(
                                    candidate.currentLink()
                                            .getQuality(),
                                    0.0,
                                    1.0
                            ),

                            candidate.currentLink()
                                    .getDistance(),

                            calculateLinkMobilitySpeed(
                                    candidate.currentLink(),
                                    state
                            )
                    );

        } else {

            /*
             * If the current link disappeared due to mobility
             * or fault injection, use the latest historical
             * state as the fifth timestep.
             */
            currentStep =
                    toLstmTimeStep(
                            history.get(0)
                    );
        }

        sequence.add(currentStep);

        /*
         * Absolute guarantee that the request is exactly:
         *
         * 5 timesteps × 7 features
         */
        if (sequence.size() != 5) {
            return Optional.empty();
        }

        return Optional.of(
                new LstmRequest(
                        currentNode.getNodeId(),
                        sequence
                )
        );
    }

    /*
     * --------------------------------------------------------------
     * CHOOSE BEST LSTM LINK
     * --------------------------------------------------------------
     */
    private LstmCandidate chooseBestLstmCandidate(
            Long nodeId,
            SimulatedLink currentLink,
            NetworkState state,
            Map<String, List<SimulationDatasetRecord>> historyByPair
    ) {

        LstmCandidate best = null;

        /*
         * ----------------------------------------------------------
         * 1. Prefer an active current link that has >=4 records.
         * ----------------------------------------------------------
         */
        for (SimulatedLink link : state.getLinks()) {

            if (link == null || !link.isActive()) {
                continue;
            }

            if (!nodeId.equals(link.getSourceNodeId())
                    && !nodeId.equals(link.getDestinationNodeId())) {

                continue;
            }

            String pairKey =
                    canonicalLinkKey(
                            link.getSourceNodeId(),
                            link.getDestinationNodeId()
                    );

            List<SimulationDatasetRecord> history =
                    historyByPair.get(pairKey);

            if (history == null || history.size() < 4) {
                continue;
            }

            LstmCandidate candidate =
                    new LstmCandidate(
                            pairKey,
                            history,
                            link,
                            true
                    );

            if (isBetterLstmCandidate(
                    candidate,
                    best
            )) {

                best = candidate;
            }
        }

        if (best != null) {
            return best;
        }

        /*
         * ----------------------------------------------------------
         * 2. Fallback:
         *    Use the most recent historical link pair for this node.
         *
         *    This handles:
         *    - mobility
         *    - link disappearance
         *    - link reversal
         *    - link failure
         * ----------------------------------------------------------
         */
        for (Map.Entry<String, List<SimulationDatasetRecord>> entry :
                historyByPair.entrySet()) {

            List<SimulationDatasetRecord> history =
                    entry.getValue();

            if (history.size() < 4) {
                continue;
            }

            SimulatedLink matchingCurrentLink =
                    findActiveLinkForPair(
                            state,
                            entry.getKey()
                    );

            LstmCandidate candidate =
                    new LstmCandidate(
                            entry.getKey(),
                            history,
                            matchingCurrentLink,
                            matchingCurrentLink != null
                    );

            if (isBetterLstmCandidate(
                    candidate,
                    best
            )) {

                best = candidate;
            }
        }

        return best;
    }

    /*
     * Compare two LSTM candidates.
     */
    private boolean isBetterLstmCandidate(
            LstmCandidate candidate,
            LstmCandidate currentBest
    ) {

        if (currentBest == null) {
            return true;
        }

        /*
         * Active/current link wins over historical-only link.
         */
        if (candidate.currentLinkAvailable()
                != currentBest.currentLinkAvailable()) {

            return candidate.currentLinkAvailable();
        }

        /*
         * Prefer more historical records.
         */
        if (candidate.history().size()
                != currentBest.history().size()) {

            return candidate.history().size()
                    > currentBest.history().size();
        }

        /*
         * Prefer the candidate with the latest historical record.
         */
        long candidateTimestamp =
                candidate.history().isEmpty()
                        ? Long.MIN_VALUE
                        : candidate.history()
                          .get(0)
                          .getTimestamp();

        long bestTimestamp =
                currentBest.history().isEmpty()
                        ? Long.MIN_VALUE
                        : currentBest.history()
                          .get(0)
                          .getTimestamp();

        return candidateTimestamp > bestTimestamp;
    }

    /*
     * Find active link corresponding to canonical pair.
     */
    private SimulatedLink findActiveLinkForPair(
            NetworkState state,
            String pairKey
    ) {

        for (SimulatedLink link : state.getLinks()) {

            if (link == null || !link.isActive()) {
                continue;
            }

            if (pairKey.equals(
                    canonicalLinkKey(
                            link.getSourceNodeId(),
                            link.getDestinationNodeId()
                    )
            )) {

                return link;
            }
        }

        return null;
    }

    /*
     * Convert DB LINK record into one LSTM timestep.
     */
    private LstmTimeStep toLstmTimeStep(
            SimulationDatasetRecord record
    ) {

        return new LstmTimeStep(
                record.getSignalStrength(),
                record.getPacketLoss(),
                record.getLatency(),
                record.getThroughput(),
                record.getLinkQuality(),
                record.getNodeDistance(),
                record.getSpeed()
        );
    }

    /*
     * Check whether a historical record belongs to the node.
     */
    private boolean isConnectedToNode(
            SimulationDatasetRecord record,
            Long nodeId
    ) {

        return nodeId.equals(
                record.getSourceNodeId()
        )
                ||
                nodeId.equals(
                        record.getDestinationNodeId()
                );
    }

    /*
     * Treat A->B and B->A as the same physical MANET link.
     */
    private String canonicalLinkKey(
            Long first,
            Long second
    ) {

        if (first == null || second == null) {
            return "UNKNOWN";
        }

        long low =
                Math.min(
                        first,
                        second
                );

        long high =
                Math.max(
                        first,
                        second
                );

        return low + "-" + high;
    }

    /*
     * --------------------------------------------------------------
     * LINK HISTORY CACHE
     * --------------------------------------------------------------
     */
    private List<SimulationDatasetRecord> getCachedLinkHistory(
            Long simulationId,
            long timestamp
    ) {

        LinkHistoryCacheEntry cached =
                lstmHistoryCache.get(
                        simulationId
                );

        if (cached != null
                && cached.timestamp() == timestamp) {

            return cached.records();
        }

        List<SimulationDatasetRecord> records =
                datasetRepository
                        .findBySimulationIdAndRecordTypeOrderByTimestampAsc(
                                simulationId,
                                "LINK"
                        );

        lstmHistoryCache.put(
                simulationId,
                new LinkHistoryCacheEntry(
                        timestamp,
                        List.copyOf(records)
                )
        );

        return records;
    }

    /*
     * --------------------------------------------------------------
     * REPRESENTATIVE LINK
     * --------------------------------------------------------------
     *
     * Select a link for a node.
     *
     * We prefer links that already have enough history for LSTM.
     */
    private Optional<SimulatedLink> findRepresentativeLink(
            Long simulationId,
            SimulatedNode node,
            NetworkState state
    ) {

        List<SimulatedLink> candidates =
                state.getLinks()
                        .stream()
                        .filter(Objects::nonNull)
                        .filter(SimulatedLink::isActive)
                        .filter(link ->
                                node.getNodeId().equals(
                                        link.getSourceNodeId()
                                )
                                        ||
                                        node.getNodeId().equals(
                                                link.getDestinationNodeId()
                                        )
                        )
                        .toList();

        if (candidates.isEmpty()) {
            return Optional.empty();
        }

        /*
         * Load current cached link history once.
         */
        List<SimulationDatasetRecord> linkRecords =
                getCachedLinkHistory(
                        simulationId,
                        state.getCurrentTime()
                );

        /*
         * Prefer:
         *
         * 1. highest historical record count
         * 2. best current link quality
         */
        return candidates.stream()
                .max(
                        Comparator
                                .comparingInt(
                                        (SimulatedLink link) ->
                                                historyCountForPair(
                                                        linkRecords,
                                                        link,
                                                        state.getCurrentTime()
                                                )
                                )
                                .thenComparing(
                                        Comparator
                                                .comparingDouble(
                                                        SimulatedLink::getQuality
                                                )
                                                .reversed()
                                )
                );
    }

    /*
     * Count historical LINK records for a pair.
     */
    private int historyCountForPair(
            List<SimulationDatasetRecord> records,
            SimulatedLink link,
            long currentTimestamp
    ) {

        String key =
                canonicalLinkKey(
                        link.getSourceNodeId(),
                        link.getDestinationNodeId()
                );

        int count = 0;

        for (SimulationDatasetRecord record : records) {

            if (record == null
                    || record.getTimestamp()
                    >= currentTimestamp
                    || record.getSourceNodeId() == null
                    || record.getDestinationNodeId() == null) {

                continue;
            }

            if (key.equals(
                    canonicalLinkKey(
                            record.getSourceNodeId(),
                            record.getDestinationNodeId()
                    )
            )) {

                count++;
            }
        }

        return count;
    }

    /*
     * Candidate selected for LSTM.
     */
    private record LstmCandidate(
            String pairKey,
            List<SimulationDatasetRecord> history,
            SimulatedLink currentLink,
            boolean currentLinkAvailable
    ) {
    }

    /*
     * Cached LINK records for a simulation timestamp.
     */
    private record LinkHistoryCacheEntry(
            long timestamp,
            List<SimulationDatasetRecord> records
    ) {
    }

    /*
     * --------------------------------------------------------------
     * RECOVERY REQUEST
     * --------------------------------------------------------------
     */
    private RecoveryRequest buildRecoveryRequest(
            SimulatedNode node,
            NetworkState state,
            RandomForestResponse randomForest,
            XgboostResponse xgboost,
            IsolationForestResponse isolationForest,
            LstmResponse lstm,
            Optional<SimulatedLink> representativeLink
    ) {

        /*
         * XGBoost is the primary source for fault type.
         */
        String faultType =
                xgboost != null
                        && xgboost.fault_prediction() != null
                        ? xgboost.fault_prediction()
                        : "NORMAL";

        /*
         * Random Forest provides failure probability.
         */
        double failureProbability =
                randomForest != null
                        ? randomForest.failure_probability()
                        : 0.0;

        /*
         * Calculate current node health.
         */
        double nodeHealthScore =
                calculateNodeHealthScore(
                        node
                );

        /*
         * Count active neighbours.
         */
        double availableNeighbors =
                countNeighbors(
                        node.getNodeId(),
                        state
                );

        /*
         * Approximate alternative routes using available neighbours.
         */
        double alternativeRoutes =
                Math.max(
                        0,
                        availableNeighbors - 1
                );

        /*
         * Quality of the second-best current link.
         */
        double alternativeRouteQuality =
                calculateAlternativeRouteQuality(
                        node.getNodeId(),
                        state
                );

        /*
         * Current traffic load.
         */
        double currentTrafficLoad =
                calculateTrafficLoad(
                        node.getNodeId(),
                        state
                );

        /*
         * LSTM prediction, when available.
         * Otherwise fall back to current representative link quality.
         */
        double predictedLinkQuality =
                lstm != null
                        ? lstm.predicted_future_link_quality()
                        : representativeLink
                          .map(
                                  SimulatedLink::getQuality
                          )
                          .orElse(0.0);

        /*
         * Isolation Forest anomaly score.
         */
        double anomalyScore =
                isolationForest != null
                        ? isolationForest.anomaly_score()
                        : 0.0;

        /*
         * Resolve severity using the backend fault enum.
         */
        FaultSeverity severity =
                resolveSeverity(
                        faultType
                );

        /*
         * Previous recovery history is currently 0 because the
         * backend does not yet persist recovery execution history.
         *
         * We will connect this later when automatic recovery execution
         * is implemented.
         */
        double previousRecoveryHistory = 0.0;

        return new RecoveryRequest(
                node.getNodeId(),
                failureProbability,
                faultType,
                severity.name(),
                nodeHealthScore,
                node.getBatteryLevel(),

                representativeLink
                        .map(
                                SimulatedLink::getQuality
                        )
                        .orElse(
                                calculateAverageLinkQuality(
                                        node.getNodeId(),
                                        state
                                )
                        ),

                availableNeighbors,
                alternativeRoutes,
                alternativeRouteQuality,
                currentTrafficLoad,
                previousRecoveryHistory,
                predictedLinkQuality,
                anomalyScore
        );
    }

    /*
     * --------------------------------------------------------------
     * RECOVERY TRIGGER
     * --------------------------------------------------------------
     */
    private boolean shouldRunRecovery(
            RandomForestResponse randomForest,
            XgboostResponse xgboost,
            IsolationForestResponse isolationForest
    ) {

        /*
         * RF threshold trigger.
         */
        boolean failureRisk =
                randomForest != null
                        && randomForest.failure_probability()
                        >= recoveryTriggerThreshold;

        /*
         * XGBoost non-normal fault trigger.
         */
        boolean nonNormalFault =
                xgboost != null
                        && xgboost.fault_prediction() != null
                        && !"NORMAL".equals(
                        xgboost.fault_prediction()
                );

        /*
         * Isolation Forest anomaly trigger.
         */
        boolean anomaly =
                isolationForest != null
                        && "Anomalous".equalsIgnoreCase(
                        isolationForest.anomaly_status()
                );

        return failureRisk
                || nonNormalFault
                || anomaly;
    }

    /*
     * --------------------------------------------------------------
     * FAULT SEVERITY
     * --------------------------------------------------------------
     */
    private FaultSeverity resolveSeverity(
            String faultType
    ) {

        try {

            return FaultType
                    .valueOf(
                            faultType
                    )
                    .getSeverity();

        } catch (Exception ignored) {

            return FaultSeverity.HIGH;
        }
    }

    /*
     * --------------------------------------------------------------
     * NODE HEALTH SCORE
     * --------------------------------------------------------------
     */
    private double calculateNodeHealthScore(
            SimulatedNode node
    ) {

        double batteryHealth =
                clamp(
                        node.getBatteryLevel(),
                        0,
                        100
                );

        double cpuHealth =
                100
                        - clamp(
                        node.getCpuUsage(),
                        0,
                        100
                );

        double memoryHealth =
                100
                        - clamp(
                        node.getMemoryUsage(),
                        0,
                        100
                );

        double connectivityHealth =
                clamp(
                        node.getSignalStrength(),
                        0,
                        100
                );

        double packetHealth =
                (
                        1
                                - clamp(
                                node.getPacketLoss(),
                                0,
                                1
                        )
                )
                        * 100;

        double latencyHealth =
                (
                        1
                                - clamp(
                                node.getLatency() / 100.0,
                                0,
                                1
                        )
                )
                        * 100;

        /*
         * Weighted health score.
         */
        return clamp(
                batteryHealth * 0.35
                        + cpuHealth * 0.20
                        + memoryHealth * 0.15
                        + connectivityHealth * 0.15
                        + packetHealth * 0.10
                        + latencyHealth * 0.05,
                0,
                100
        );
    }

    /*
     * --------------------------------------------------------------
     * NEIGHBOUR COUNT
     * --------------------------------------------------------------
     */
    private int countNeighbors(
            Long nodeId,
            NetworkState state
    ) {

        Set<Long> neighbors =
                new HashSet<>();

        for (SimulatedLink link : state.getLinks()) {

            if (link == null || !link.isActive()) {
                continue;
            }

            if (nodeId.equals(link.getSourceNodeId())) {

                neighbors.add(
                        link.getDestinationNodeId()
                );
            }

            if (nodeId.equals(link.getDestinationNodeId())) {

                neighbors.add(
                        link.getSourceNodeId()
                );
            }
        }

        return neighbors.size();
    }

    /*
     * --------------------------------------------------------------
     * ALTERNATIVE ROUTE QUALITY
     * --------------------------------------------------------------
     *
     * We use the second-best connected link quality as an
     * approximation of alternative route quality at this stage.
     */
    private double calculateAlternativeRouteQuality(
            Long nodeId,
            NetworkState state
    ) {

        List<Double> qualities =
                state.getLinks()
                        .stream()
                        .filter(Objects::nonNull)
                        .filter(SimulatedLink::isActive)
                        .filter(link ->
                                nodeId.equals(
                                        link.getSourceNodeId()
                                )
                                        ||
                                        nodeId.equals(
                                                link.getDestinationNodeId()
                                        )
                        )
                        .map(
                                SimulatedLink::getQuality
                        )
                        .sorted(
                                Comparator.reverseOrder()
                        )
                        .toList();

        return qualities.size() >= 2
                ? qualities.get(1)
                : 0.0;
    }

    /*
     * --------------------------------------------------------------
     * QUEUE SIZE
     * --------------------------------------------------------------
     */
    private int calculateQueueSize(
            Long nodeId,
            NetworkState state
    ) {

        int count = 0;

        for (var packet : state.getPackets()) {

            if (packet == null) {
                continue;
            }

            if (nodeId.equals(packet.getCurrentNodeId())
                    && !packet.isDelivered()
                    && !packet.isDropped()) {

                count++;
            }
        }

        return count;
    }

    /*
     * --------------------------------------------------------------
     * TRAFFIC LOAD
     * --------------------------------------------------------------
     */
    private double calculateTrafficLoad(
            Long nodeId,
            NetworkState state
    ) {

        double trafficLoad = 0.0;

        for (var packet : state.getPackets()) {

            if (packet == null) {
                continue;
            }

            if (nodeId.equals(packet.getSourceNodeId())
                    && packet.getCreationTime()
                    == state.getCurrentTime()) {

                trafficLoad += packet.getPacketSize();
            }
        }

        return trafficLoad;
    }

    /*
     * --------------------------------------------------------------
     * AVERAGE LINK QUALITY
     * --------------------------------------------------------------
     */
    private double calculateAverageLinkQuality(
            Long nodeId,
            NetworkState state
    ) {

        double total = 0.0;
        int count = 0;

        for (SimulatedLink link : state.getLinks()) {

            if (link == null) {
                continue;
            }

            boolean connected =
                    nodeId.equals(link.getSourceNodeId())
                            ||
                            nodeId.equals(
                                    link.getDestinationNodeId()
                            );

            if (!connected) {
                continue;
            }

            total += link.getQuality();
            count++;
        }

        return count == 0
                ? 0.0
                : clamp(
                total / count,
                0,
                1
        );
    }

    /*
     * --------------------------------------------------------------
     * NODE THROUGHPUT
     * --------------------------------------------------------------
     */
    private double calculateNodeThroughput(
            Long nodeId,
            NetworkState state
    ) {

        double total = 0.0;

        for (SimulatedLink link : state.getLinks()) {

            if (link == null) {
                continue;
            }

            boolean connected =
                    nodeId.equals(link.getSourceNodeId())
                            ||
                            nodeId.equals(
                                    link.getDestinationNodeId()
                            );

            if (!connected) {
                continue;
            }

            total +=
                    packetTransmissionManager.getThroughput(
                            link.getSourceNodeId(),
                            link.getDestinationNodeId(),
                            state.getCurrentTime()
                    );
        }

        return total;
    }

    /*
     * --------------------------------------------------------------
     * LINK THROUGHPUT
     * --------------------------------------------------------------
     */
    private double calculateLinkThroughput(
            SimulatedLink link,
            long timestamp
    ) {

        return packetTransmissionManager.getThroughput(
                link.getSourceNodeId(),
                link.getDestinationNodeId(),
                timestamp
        );
    }

    /*
     * --------------------------------------------------------------
     * LINK MOBILITY SPEED
     * --------------------------------------------------------------
     */
    private double calculateLinkMobilitySpeed(
            SimulatedLink link,
            NetworkState state
    ) {

        SimulatedNode source =
                findNode(
                        state,
                        link.getSourceNodeId()
                );

        SimulatedNode destination =
                findNode(
                        state,
                        link.getDestinationNodeId()
                );

        if (source == null || destination == null) {
            return 0.0;
        }

        return (
                source.getSpeed()
                        + destination.getSpeed()
        ) / 2.0;
    }

    /*
     * --------------------------------------------------------------
     * FIND NODE
     * --------------------------------------------------------------
     */
    private SimulatedNode findNode(
            NetworkState state,
            Long nodeId
    ) {

        for (SimulatedNode node :
                state.getNodes()) {

            if (node != null
                    && nodeId.equals(
                    node.getNodeId()
            )) {

                return node;
            }
        }

        return null;
    }

    /*
     * --------------------------------------------------------------
     * CLAMP
     * --------------------------------------------------------------
     */
    private double clamp(
            double value,
            double minimum,
            double maximum
    ) {

        return Math.max(
                minimum,
                Math.min(
                        maximum,
                        value
                )
        );
    }

    /*
     * --------------------------------------------------------------
     * DISABLED RESPONSE
     * --------------------------------------------------------------
     */
    private AiNodeAnalysis emptyDisabledResult(
            SimulatedNode node
    ) {

        return AiNodeAnalysis.builder()
                .nodeId(node.getNodeId())
                .timestamp(0)
                .status("DISABLED")
                .message(
                        "AI integration is disabled"
                )
                .build();
    }
}