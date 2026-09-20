package com.manet.backend.ai.service;

import com.manet.backend.ai.client.AiServiceClient;
import com.manet.backend.ai.dto.*;
import com.manet.backend.entity.SimulationDatasetRecord;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.repository.SimulationDatasetRecordRepository;
import com.manet.backend.simulation.fault.FaultSeverity;
import com.manet.backend.simulation.fault.FaultType;
import com.manet.backend.simulation.network.PacketTransmissionManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiOrchestratorService {

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

    private final boolean enabled;
    private final boolean failFast;
    private final double recoveryTriggerThreshold;

    private final Map<Long, Map<Long, AiNodeAnalysis>> latestAnalyses =
            new ConcurrentHashMap<>();

    public AiOrchestratorService(
            AiServiceClient aiServiceClient,
            SimulationDatasetRecordRepository datasetRepository,
            PacketTransmissionManager packetTransmissionManager,
            @Value("${manet.ai.enabled:true}") boolean enabled,
            @Value("${manet.ai.fail-fast:false}") boolean failFast,
            @Value("${manet.ai.recovery-trigger-threshold:0.50}") double recoveryTriggerThreshold
    ) {
        this.aiServiceClient = aiServiceClient;
        this.datasetRepository = datasetRepository;
        this.packetTransmissionManager = packetTransmissionManager;
        this.enabled = enabled;
        this.failFast = failFast;
        this.recoveryTriggerThreshold = recoveryTriggerThreshold;
    }

    public boolean isEnabled() {
        return enabled;
    }

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

            state.getAiAnalysis().put(
                    node.getNodeId(),
                    analysis
            );
        }
    }

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

        List<String> errors = new ArrayList<>();

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

        Optional<SimulatedLink> representativeLink =
                findRepresentativeLink(
                        node,
                        state
                );

        if (representativeLink.isPresent()) {

            Optional<LstmRequest> lstmRequest =
                    buildLstmRequest(
                            simulationId,
                            representativeLink.get(),
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
                        "LSTM: waiting for 5 historical link records"
                );
            }
        }

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

                if (RECOVERY_FAULT_TYPES.contains(
                        recoveryRequest.fault_type_for_engine()
                )) {

                    recovery =
                            aiServiceClient.predictRecovery(
                                    recoveryRequest
                            );

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

        result
                .randomForest(randomForest)
                .xgboost(xgboost)
                .isolationForest(isolationForest)
                .lstm(lstm)
                .recovery(recovery);

        if (!errors.isEmpty()) {

            result.status(
                    "PARTIAL"
            ).message(
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

        AiNodeAnalysis analysis = result.build();

        latestAnalyses
                .computeIfAbsent(
                        simulationId,
                        ignored -> new ConcurrentHashMap<>()
                )
                .put(
                        node.getNodeId(),
                        analysis
                );

        state.getAiAnalysis().put(
                node.getNodeId(),
                analysis
        );

        return analysis;
    }

    public Map<Long, AiNodeAnalysis> getLatestAnalyses(
            Long simulationId
    ) {

        return latestAnalyses.getOrDefault(
                simulationId,
                Collections.emptyMap()
        );
    }

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

    public void clearSimulation(
            Long simulationId
    ) {

        if (simulationId != null) {
            latestAnalyses.remove(
                    simulationId
            );
        }
    }

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

    private Optional<LstmRequest> buildLstmRequest(
            Long simulationId,
            SimulatedLink currentLink,
            SimulatedNode currentNode,
            NetworkState state
    ) {

        if (simulationId == null || currentLink == null) {
            return Optional.empty();
        }

        List<SimulationDatasetRecord> history =
                datasetRepository
                        .findTop4BySimulationIdAndRecordTypeAndSourceNodeIdAndDestinationNodeIdOrderByTimestampDesc(
                                simulationId,
                                "LINK",
                                currentLink.getSourceNodeId(),
                                currentLink.getDestinationNodeId()
                        );

        List<LstmTimeStep> sequence =
                new ArrayList<>();

        // Oldest -> newest.
        for (int i = history.size() - 1; i >= 0; i--) {

            SimulationDatasetRecord record =
                    history.get(i);

            sequence.add(
                    new LstmTimeStep(
                            record.getSignalStrength(),
                            record.getPacketLoss(),
                            record.getLatency(),
                            record.getThroughput(),
                            record.getLinkQuality(),
                            record.getNodeDistance(),
                            record.getSpeed()
                    )
            );
        }

        // Append the current in-memory link state.
        sequence.add(
                new LstmTimeStep(
                        currentLink.getSignalStrength(),
                        currentLink.getPacketLoss(),
                        currentLink.getLatency(),
                        calculateLinkThroughput(
                                currentLink,
                                state.getCurrentTime()
                        ),
                        currentLink.getQuality(),
                        currentLink.getDistance(),
                        calculateLinkMobilitySpeed(
                                currentLink,
                                state
                        )
                )
        );

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

    private Optional<SimulatedLink> findRepresentativeLink(
            SimulatedNode node,
            NetworkState state
    ) {

        return state.getLinks()
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
                .min(
                        Comparator.comparingDouble(
                                SimulatedLink::getQuality
                        )
                );
    }

    private RecoveryRequest buildRecoveryRequest(
            SimulatedNode node,
            NetworkState state,
            RandomForestResponse randomForest,
            XgboostResponse xgboost,
            IsolationForestResponse isolationForest,
            LstmResponse lstm,
            Optional<SimulatedLink> representativeLink
    ) {

        String faultType =
                xgboost != null
                        && xgboost.fault_prediction() != null
                        ? xgboost.fault_prediction()
                        : "NORMAL";

        double failureProbability =
                randomForest != null
                        ? randomForest.failure_probability()
                        : 0.0;

        double nodeHealthScore =
                calculateNodeHealthScore(
                        node
                );

        double availableNeighbors =
                countNeighbors(
                        node.getNodeId(),
                        state
                );

        double alternativeRoutes =
                Math.max(
                        0,
                        availableNeighbors - 1
                );

        double alternativeRouteQuality =
                calculateAlternativeRouteQuality(
                        node.getNodeId(),
                        state
                );

        double currentTrafficLoad =
                calculateTrafficLoad(
                        node.getNodeId(),
                        state
                );

        double predictedLinkQuality =
                lstm != null
                        ? lstm.predicted_future_link_quality()
                        : representativeLink
                                .map(
                                        SimulatedLink::getQuality
                                )
                                .orElse(0.0);

        double anomalyScore =
                isolationForest != null
                        ? isolationForest.anomaly_score()
                        : 0.0;

        FaultSeverity severity =
                resolveSeverity(
                        faultType
                );

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
                0.0,
                predictedLinkQuality,
                anomalyScore
        );
    }

    private boolean shouldRunRecovery(
            RandomForestResponse randomForest,
            XgboostResponse xgboost,
            IsolationForestResponse isolationForest
    ) {

        boolean failureRisk =
                randomForest != null
                        && randomForest.failure_probability()
                        >= recoveryTriggerThreshold;

        boolean nonNormalFault =
                xgboost != null
                        && xgboost.fault_prediction() != null
                        && !"NORMAL".equals(
                                xgboost.fault_prediction()
                        );

        boolean anomaly =
                isolationForest != null
                        && "Anomalous".equalsIgnoreCase(
                                isolationForest.anomaly_status()
                        );

        return failureRisk
                || nonNormalFault
                || anomaly;
    }

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
                (1
                        - clamp(
                                node.getPacketLoss(),
                                0,
                                1
                        ))
                        * 100;

        double latencyHealth =
                (1
                        - clamp(
                                node.getLatency() / 100.0,
                                0,
                                1
                        ))
                        * 100;

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

    private int countNeighbors(
            Long nodeId,
            NetworkState state
    ) {

        Set<Long> neighbors =
                new HashSet<>();

        for (SimulatedLink link :
                state.getLinks()) {

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
                    nodeId.equals(link.getDestinationNodeId());

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
                    nodeId.equals(link.getDestinationNodeId());

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

    private AiNodeAnalysis emptyDisabledResult(
            SimulatedNode node
    ) {

        return AiNodeAnalysis.builder()
                .nodeId(node.getNodeId())
                .timestamp(0)
                .status("DISABLED")
                .message("AI integration is disabled")
                .build();
    }
}
