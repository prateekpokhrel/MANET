package com.manet.backend.ai.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.manet.backend.ai.dto.AiNodeAnalysis;
import com.manet.backend.ai.dto.RecoveryResponse;
import com.manet.backend.ai.service.RecoveryExecutionResult;
import com.manet.backend.entity.AiAnalysisRecord;
import com.manet.backend.entity.AiRecoveryExecution;
import com.manet.backend.repository.AiAnalysisRecordRepository;
import com.manet.backend.repository.AiRecoveryExecutionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiPersistenceService {

    private final AiAnalysisRecordRepository analysisRepository;
    private final AiRecoveryExecutionRepository recoveryRepository;
    private final ObjectMapper objectMapper;

    public AiPersistenceService(
            AiAnalysisRecordRepository analysisRepository,
            AiRecoveryExecutionRepository recoveryRepository,
            ObjectMapper objectMapper
    ) {
        this.analysisRepository =
                analysisRepository;

        this.recoveryRepository =
                recoveryRepository;

        this.objectMapper =
                objectMapper;
    }

    // ============================================================
    // SAVE AI ANALYSIS
    // ============================================================

    @Transactional
    public AiAnalysisRecord saveAnalysis(
            Long simulationId,
            AiNodeAnalysis analysis
    ) {

        if (simulationId == null) {
            throw new IllegalArgumentException(
                    "Simulation ID is required"
            );
        }

        if (analysis == null) {
            throw new IllegalArgumentException(
                    "AI analysis is required"
            );
        }

        if (analysis.getNodeId() == null) {
            throw new IllegalArgumentException(
                    "AI analysis node ID is required"
            );
        }

        RecoveryResponse recovery =
                analysis.getRecovery();

        AiAnalysisRecord record =
                AiAnalysisRecord.builder()
                        .simulationId(
                                simulationId
                        )

                        .nodeId(
                                analysis.getNodeId()
                        )

                        .simulationTimestamp(
                                analysis.getTimestamp()
                        )

                        .status(
                                analysis.getStatus()
                        )

                        // ------------------------------------------------
                        // RANDOM FOREST
                        // ------------------------------------------------

                        .failureProbability(
                                analysis.getRandomForest() == null
                                        ? null
                                        : analysis
                                          .getRandomForest()
                                          .failure_probability()
                        )

                        .failurePrediction(
                                analysis.getRandomForest() == null
                                        ? null
                                        : analysis
                                          .getRandomForest()
                                          .failure_prediction()
                        )

                        // ------------------------------------------------
                        // XGBOOST
                        // ------------------------------------------------

                        .faultPrediction(
                                analysis.getXgboost() == null
                                        ? null
                                        : analysis
                                          .getXgboost()
                                          .fault_prediction()
                        )

                        .xgbFaultProbability(
                                analysis.getXgboost() == null
                                        ? null
                                        : analysis
                                          .getXgboost()
                                          .fault_probability()
                        )

                        .xgbClassProbabilities(
                                analysis.getXgboost() == null
                                        ? null
                                        : toJson(
                                        analysis
                                        .getXgboost()
                                        .class_probabilities()
                                )
                        )

                        // ------------------------------------------------
                        // ISOLATION FOREST
                        // ------------------------------------------------

                        .anomalyStatus(
                                analysis.getIsolationForest() == null
                                        ? null
                                        : analysis
                                          .getIsolationForest()
                                          .anomaly_status()
                        )

                        .isolationAnomalyScore(
                                analysis.getIsolationForest() == null
                                        ? null
                                        : analysis
                                          .getIsolationForest()
                                          .anomaly_score()
                        )

                        // ------------------------------------------------
                        // LSTM
                        // ------------------------------------------------

                        .lstmLinkQuality(
                                analysis.getLstm() == null
                                        ? null
                                        : analysis
                                          .getLstm()
                                          .predicted_future_link_quality()
                        )

                        .lstmFutureRssi(
                                analysis.getLstm() == null
                                        ? null
                                        : analysis
                                          .getLstm()
                                          .predicted_future_rssi()
                        )

                        .lstmFailureRisk(
                                analysis.getLstm() == null
                                        ? null
                                        : analysis
                                          .getLstm()
                                          .failure_risk()
                        )

                        .lstmSequenceLength(
                                analysis.getLstm() == null
                                        ? null
                                        : analysis
                                          .getLstm()
                                          .sequence_length()
                        )

                        // ------------------------------------------------
                        // RECOVERY
                        // ------------------------------------------------

                        .recoveryDecision(
                                recovery == null
                                        ? null
                                        : recovery
                                          .recovery_decision()
                        )

                        .recommendedRecoveryAction(
                                recovery == null
                                        ? null
                                        : recovery
                                          .recommended_recovery_action()
                        )

                        .recoverabilityScore(
                                recovery == null
                                        ? null
                                        : recovery
                                          .recoverability_score()
                        )

                        .recoverySuccessProbability(
                                recovery == null
                                        ? null
                                        : findActionProbability(
                                        recovery,
                                        recovery
                                        .recommended_recovery_action()
                                )
                        )

                        .recoveryExecutionStatus(
                                analysis.getRecoveryExecutionStatus()
                        )

                        .recoveryExecutionMessage(
                                analysis.getRecoveryExecutionMessage()
                        )

                        // ------------------------------------------------
                        // COMPLETE JSON
                        // ------------------------------------------------

                        .analysisJson(
                                toJson(analysis)
                        )

                        .createdAt(
                                LocalDateTime.now()
                        )

                        .build();

        return analysisRepository.save(
                record
        );
    }

    // ============================================================
    // SAVE RECOVERY EXECUTION
    // ============================================================

    @Transactional
    public AiRecoveryExecution saveRecoveryExecution(
            Long simulationId,
            AiNodeAnalysis analysis,
            RecoveryExecutionResult result,
            String conditionSignature
    ) {

        if (simulationId == null) {
            throw new IllegalArgumentException(
                    "Simulation ID is required"
            );
        }

        if (analysis == null) {
            throw new IllegalArgumentException(
                    "AI analysis is required"
            );
        }

        if (result == null) {
            throw new IllegalArgumentException(
                    "Recovery execution result is required"
            );
        }

        RecoveryResponse recovery =
                analysis.getRecovery();

        LocalDateTime now =
                LocalDateTime.now();

        AiRecoveryExecution execution =
                AiRecoveryExecution.builder()
                        .simulationId(
                                simulationId
                        )

                        .nodeId(
                                analysis.getNodeId()
                        )

                        .simulationTimestamp(
                                analysis.getTimestamp()
                        )

                        .actionType(
                                result.action()
                        )

                        .recoveryDecision(
                                recovery == null
                                        ? null
                                        : recovery
                                          .recovery_decision()
                        )

                        .executionStatus(
                                result.status()
                        )

                        .message(
                                result.message()
                        )

                        .affectedPackets(
                                result.affectedPackets()
                        )

                        .recoverabilityScore(
                                recovery == null
                                        ? null
                                        : recovery
                                          .recoverability_score()
                        )

                        .successProbability(
                                recovery == null
                                        ? null
                                        : findActionProbability(
                                        recovery,
                                        result.action()
                                )
                        )

                        .conditionSignature(
                                conditionSignature
                        )

                        .recoveryJson(
                                recovery == null
                                        ? null
                                        : toJson(
                                        recovery
                                )
                        )

                        .startedAt(
                                now
                        )

                        .completedAt(
                                now
                        )

                        .build();

        return recoveryRepository.save(
                execution
        );
    }

    // ============================================================
    // GET ANALYSIS HISTORY
    // ============================================================

    @Transactional(readOnly = true)
    public List<AiAnalysisRecord> getAnalysisHistory(
            Long simulationId
    ) {

        if (simulationId == null) {
            return List.of();
        }

        return analysisRepository
                .findBySimulationIdOrderBySimulationTimestampAscNodeIdAsc(
                        simulationId
                );
    }

    // ============================================================
    // GET NODE ANALYSIS HISTORY
    // ============================================================

    @Transactional(readOnly = true)
    public List<AiAnalysisRecord> getNodeAnalysisHistory(
            Long simulationId,
            Long nodeId
    ) {

        if (simulationId == null || nodeId == null) {
            return List.of();
        }

        return analysisRepository
                .findBySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
                        simulationId,
                        nodeId
                );
    }

    // ============================================================
    // GET LATEST ANALYSIS PER NODE
    // ============================================================

    @Transactional(readOnly = true)
    public Map<Long, AiAnalysisRecord>
    getLatestPersistedAnalysis(
            Long simulationId
    ) {

        Map<Long, AiAnalysisRecord> latest =
                new LinkedHashMap<>();

        if (simulationId == null) {
            return latest;
        }

        List<AiAnalysisRecord> records =
                analysisRepository
                        .findBySimulationIdOrderBySimulationTimestampDescNodeIdAsc(
                                simulationId
                        );

        for (AiAnalysisRecord record :
                records) {

            if (record == null
                    || record.getNodeId() == null) {
                continue;
            }

            latest.putIfAbsent(
                    record.getNodeId(),
                    record
            );
        }

        return latest;
    }

    // ============================================================
    // GET RECOVERY EXECUTIONS
    // ============================================================

    @Transactional(readOnly = true)
    public List<AiRecoveryExecution>
    getRecoveryExecutions(
            Long simulationId
    ) {

        if (simulationId == null) {
            return List.of();
        }

        return recoveryRepository
                .findBySimulationIdOrderBySimulationTimestampDesc(
                        simulationId
                );
    }

    // ============================================================
    // GET NODE RECOVERY EXECUTIONS
    // ============================================================

    @Transactional(readOnly = true)
    public List<AiRecoveryExecution>
    getNodeRecoveryExecutions(
            Long simulationId,
            Long nodeId
    ) {

        if (simulationId == null || nodeId == null) {
            return List.of();
        }

        return recoveryRepository
                .findBySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
                        simulationId,
                        nodeId
                );
    }

    // ============================================================
    // GET LATEST AI OBJECTS
    // ============================================================

    @Transactional(readOnly = true)
    public Map<Long, AiNodeAnalysis>
    getLatestAnalysisObjects(
            Long simulationId
    ) {

        Map<Long, AiNodeAnalysis> result =
                new LinkedHashMap<>();

        for (AiAnalysisRecord record :
                getLatestPersistedAnalysis(
                        simulationId
                ).values()) {

            if (record == null) {
                continue;
            }

            AiNodeAnalysis analysis =
                    fromJson(
                            record.getAnalysisJson(),
                            AiNodeAnalysis.class
                    );

            if (analysis != null) {

                result.put(
                        record.getNodeId(),
                        analysis
                );
            }
        }

        return result;
    }

    // ============================================================
    // GET NODE ANALYSIS OBJECT HISTORY
    // ============================================================

    @Transactional(readOnly = true)
    public List<AiNodeAnalysis>
    getNodeAnalysisHistoryObjects(
            Long simulationId,
            Long nodeId
    ) {

        List<AiNodeAnalysis> result =
                new ArrayList<>();

        for (AiAnalysisRecord record :
                getNodeAnalysisHistory(
                        simulationId,
                        nodeId
                )) {

            if (record == null
                    || record.getAnalysisJson() == null) {
                continue;
            }

            AiNodeAnalysis analysis =
                    fromJson(
                            record.getAnalysisJson(),
                            AiNodeAnalysis.class
                    );

            if (analysis != null) {
                result.add(
                        analysis
                );
            }
        }

        return result;
    }

    // ============================================================
    // GET LATEST NODE ANALYSIS
    // ============================================================

    @Transactional(readOnly = true)
    public AiNodeAnalysis getLatestAnalysisObject(
            Long simulationId,
            Long nodeId
    ) {

        if (simulationId == null
                || nodeId == null) {
            return null;
        }

        List<AiAnalysisRecord> records =
                analysisRepository
                        .findBySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
                                simulationId,
                                nodeId
                        );

        if (records.isEmpty()) {
            return null;
        }

        AiAnalysisRecord latest =
                records.get(0);

        if (latest.getAnalysisJson() == null) {
            return null;
        }

        return fromJson(
                latest.getAnalysisJson(),
                AiNodeAnalysis.class
        );
    }

    // ============================================================
    // COUNT ANALYSIS
    // ============================================================

    @Transactional(readOnly = true)
    public long countAnalysisRecords(
            Long simulationId
    ) {

        if (simulationId == null) {
            return 0;
        }

        return analysisRepository
                .countBySimulationId(
                        simulationId
                );
    }

    // ============================================================
    // COUNT RECOVERY
    // ============================================================

    @Transactional(readOnly = true)
    public long countRecoveryExecutions(
            Long simulationId
    ) {

        if (simulationId == null) {
            return 0;
        }

        return recoveryRepository
                .countBySimulationId(
                        simulationId
                );
    }

    // ============================================================
    // CLEAR SIMULATION
    // ============================================================

    @Transactional
    public void clearSimulation(
            Long simulationId
    ) {

        if (simulationId == null) {
            return;
        }

        recoveryRepository.deleteBySimulationId(
                simulationId
        );

        analysisRepository.deleteBySimulationId(
                simulationId
        );
    }

    // ============================================================
    // ACTION PROBABILITY
    // ============================================================

    private Double findActionProbability(
            RecoveryResponse recovery,
            String action
    ) {

        if (recovery == null) {
            return null;
        }

        if (action == null
                || action.isBlank()) {

            return recovery
                    .best_action_success_probability();
        }

        if (recovery.action_evaluations() == null
                || recovery.action_evaluations().isEmpty()) {

            return recovery
                    .best_action_success_probability();
        }

        return recovery
                .action_evaluations()
                .stream()
                .filter(
                        evaluation ->
                                evaluation != null
                                        && action.equals(
                                        evaluation.action()
                                )
                )
                .map(
                        evaluation ->
                                evaluation
                                        .recovery_success_probability()
                )
                .filter(
                        value ->
                                value != null
                )
                .findFirst()
                .orElse(
                        recovery
                                .best_action_success_probability()
                );
    }

    // ============================================================
    // JSON
    // ============================================================

    private String toJson(
            Object value
    ) {

        if (value == null) {
            return null;
        }

        try {

            return objectMapper.writeValueAsString(
                    value
            );

        } catch (JsonProcessingException exception) {

            throw new IllegalStateException(
                    "Failed to serialize AI data",
                    exception
            );
        }
    }

    private <T> T fromJson(
            String json,
            Class<T> type
    ) {

        if (json == null || json.isBlank()) {
            return null;
        }

        try {

            return objectMapper.readValue(
                    json,
                    type
            );

        } catch (JsonProcessingException exception) {

            throw new IllegalStateException(
                    "Failed to deserialize persisted AI data",
                    exception
            );
        }
    }
}