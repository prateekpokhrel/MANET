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
        this.analysisRepository = analysisRepository;
        this.recoveryRepository = recoveryRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AiAnalysisRecord saveAnalysis(
            Long simulationId,
            AiNodeAnalysis analysis
    ) {
        if (simulationId == null || analysis == null || analysis.getNodeId() == null) {
            throw new IllegalArgumentException(
                    "Simulation ID and AI analysis with node ID are required"
            );
        }

        RecoveryResponse recovery = analysis.getRecovery();

        AiAnalysisRecord record = AiAnalysisRecord.builder()
                .simulationId(simulationId)
                .nodeId(analysis.getNodeId())
                .simulationTimestamp(analysis.getTimestamp())
                .status(analysis.getStatus())
                .failureProbability(
                        analysis.getRandomForest() == null
                                ? null
                                : analysis.getRandomForest().failure_probability()
                )
                .faultPrediction(
                        analysis.getXgboost() == null
                                ? null
                                : analysis.getXgboost().fault_prediction()
                )
                .anomalyStatus(
                        analysis.getIsolationForest() == null
                                ? null
                                : analysis.getIsolationForest().anomaly_status()
                )
                .lstmLinkQuality(
                        analysis.getLstm() == null
                                ? null
                                : analysis.getLstm().predicted_future_link_quality()
                )
                .lstmFailureRisk(
                        analysis.getLstm() == null
                                ? null
                                : analysis.getLstm().failure_risk()
                )
                .recoveryDecision(
                        recovery == null
                                ? null
                                : recovery.recovery_decision()
                )
                .recommendedRecoveryAction(
                        recovery == null
                                ? null
                                : recovery.recommended_recovery_action()
                )
                .recoverabilityScore(
                        recovery == null
                                ? null
                                : recovery.recoverability_score()
                )
                .recoverySuccessProbability(
                        recovery == null
                                ? null
                                : recovery.best_action_success_probability()
                )
                .recoveryExecutionStatus(
                        analysis.getRecoveryExecutionStatus()
                )
                .recoveryExecutionMessage(
                        analysis.getRecoveryExecutionMessage()
                )
                .analysisJson(toJson(analysis))
                .createdAt(LocalDateTime.now())
                .build();

        return analysisRepository.save(record);
    }

    @Transactional
    public AiRecoveryExecution saveRecoveryExecution(
            Long simulationId,
            AiNodeAnalysis analysis,
            RecoveryExecutionResult result,
            String conditionSignature
    ) {
        if (simulationId == null || analysis == null || result == null) {
            throw new IllegalArgumentException(
                    "Simulation ID, analysis and recovery result are required"
            );
        }

        RecoveryResponse recovery = analysis.getRecovery();

        AiRecoveryExecution execution = AiRecoveryExecution.builder()
                .simulationId(simulationId)
                .nodeId(analysis.getNodeId())
                .simulationTimestamp(analysis.getTimestamp())
                .actionType(result.action())
                .recoveryDecision(
                        recovery == null
                                ? null
                                : recovery.recovery_decision()
                )
                .executionStatus(result.status())
                .message(result.message())
                .affectedPackets(result.affectedPackets())
                .recoverabilityScore(
                        recovery == null
                                ? null
                                : recovery.recoverability_score()
                )
                .successProbability(
                        recovery == null
                                ? null
                                : findActionProbability(
                                        recovery,
                                        result.action()
                                )
                )
                .conditionSignature(conditionSignature)
                .recoveryJson(
                        recovery == null
                                ? null
                                : toJson(recovery)
                )
                .startedAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .build();

        return recoveryRepository.save(execution);
    }

    public List<AiAnalysisRecord> getAnalysisHistory(
            Long simulationId
    ) {
        return analysisRepository
                .findBySimulationIdOrderBySimulationTimestampAscNodeIdAsc(
                        simulationId
                );
    }

    public List<AiAnalysisRecord> getNodeAnalysisHistory(
            Long simulationId,
            Long nodeId
    ) {
        return analysisRepository
                .findBySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
                        simulationId,
                        nodeId
                );
    }

    public Map<Long, AiAnalysisRecord> getLatestPersistedAnalysis(
            Long simulationId
    ) {
        Map<Long, AiAnalysisRecord> latest =
                new LinkedHashMap<>();

        for (AiAnalysisRecord record :
                analysisRepository
                        .findBySimulationIdOrderBySimulationTimestampDescNodeIdAsc(
                                simulationId
                        )) {

            latest.putIfAbsent(
                    record.getNodeId(),
                    record
            );
        }

        return latest;
    }

    public List<AiRecoveryExecution> getRecoveryExecutions(
            Long simulationId
    ) {
        return recoveryRepository
                .findBySimulationIdOrderBySimulationTimestampDesc(
                        simulationId
                );
    }

    public List<AiRecoveryExecution> getNodeRecoveryExecutions(
            Long simulationId,
            Long nodeId
    ) {
        return recoveryRepository
                .findBySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
                        simulationId,
                        nodeId
                );
    }

    public Map<Long, AiNodeAnalysis> getLatestAnalysisObjects(
            Long simulationId
    ) {

        Map<Long, AiNodeAnalysis> latest =
                new LinkedHashMap<>();

        for (AiAnalysisRecord record :
                getLatestPersistedAnalysis(simulationId).values()) {

            latest.put(
                    record.getNodeId(),
                    fromJson(
                            record.getAnalysisJson(),
                            AiNodeAnalysis.class
                    )
            );
        }

        return latest;
    }

    public List<AiNodeAnalysis> getNodeAnalysisHistoryObjects(
            Long simulationId,
            Long nodeId
    ) {

        List<AiNodeAnalysis> result = new ArrayList<>();

        for (AiAnalysisRecord record :
                getNodeAnalysisHistory(simulationId, nodeId)) {

            result.add(
                    fromJson(
                            record.getAnalysisJson(),
                            AiNodeAnalysis.class
                    )
            );
        }

        return result;
    }

    public AiNodeAnalysis getLatestAnalysisObject(
            Long simulationId,
            Long nodeId
    ) {

        List<AiAnalysisRecord> records =
                analysisRepository
                        .findBySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
                                simulationId,
                                nodeId
                        );

        if (records.isEmpty()) {
            return null;
        }

        return fromJson(
                records.get(0).getAnalysisJson(),
                AiNodeAnalysis.class
        );
    }

    public long countAnalysisRecords(
            Long simulationId
    ) {
        return analysisRepository.countBySimulationId(
                simulationId
        );
    }

    public long countRecoveryExecutions(
            Long simulationId
    ) {
        return recoveryRepository.countBySimulationId(
                simulationId
        );
    }

    @Transactional
    public void clearSimulation(
            Long simulationId
    ) {
        if (simulationId == null) {
            return;
        }

        analysisRepository.deleteBySimulationId(
                simulationId
        );

        recoveryRepository.deleteBySimulationId(
                simulationId
        );
    }

    private Double findActionProbability(
            RecoveryResponse recovery,
            String action
    ) {
        if (recovery == null || action == null) {
            return null;
        }

        if (recovery.action_evaluations() == null) {
            return recovery.best_action_success_probability();
        }

        return recovery.action_evaluations()
                .stream()
                .filter(evaluation ->
                        action.equals(
                                evaluation.action()
                        )
                )
                .map(evaluation ->
                        evaluation.recovery_success_probability()
                )
                .findFirst()
                .orElse(
                        recovery.best_action_success_probability()
                );
    }

    private <T> T fromJson(
            String json,
            Class<T> type
    ) {
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

    private String toJson(
            Object value
    ) {
        try {
            return objectMapper.writeValueAsString(
                    value
            );
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                    "Failed to serialize AI data for PostgreSQL",
                    exception
            );
        }
    }
}
