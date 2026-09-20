package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ai_analysis_records",
        indexes = {
                @Index(
                        name = "idx_ai_analysis_sim_time",
                        columnList = "simulation_id,simulation_timestamp"
                ),
                @Index(
                        name = "idx_ai_analysis_sim_node_time",
                        columnList = "simulation_id,node_id,simulation_timestamp"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalysisRecord {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "simulation_id",
            nullable = false
    )
    private Long simulationId;

    @Column(
            name = "node_id",
            nullable = false
    )
    private Long nodeId;

    @Column(
            name = "simulation_timestamp",
            nullable = false
    )
    private Long simulationTimestamp;

    @Column(
            nullable = false,
            length = 30
    )
    private String status;

    // ============================================================
    // RANDOM FOREST
    // ============================================================

    @Column(
            name = "failure_probability"
    )
    private Double failureProbability;

    @Column(
            name = "failure_prediction",
            length = 50
    )
    private String failurePrediction;

    // ============================================================
    // XGBOOST
    // ============================================================

    @Column(
            name = "fault_prediction",
            length = 80
    )
    private String faultPrediction;

    @Column(
            name = "xgb_fault_probability"
    )
    private Double xgbFaultProbability;

    @Column(
            name = "xgb_class_probabilities",
            columnDefinition = "TEXT"
    )
    private String xgbClassProbabilities;

    // ============================================================
    // ISOLATION FOREST
    // ============================================================

    @Column(
            name = "anomaly_status",
            length = 30
    )
    private String anomalyStatus;

    @Column(
            name = "isolation_anomaly_score"
    )
    private Double isolationAnomalyScore;

    // ============================================================
    // LSTM
    // ============================================================

    @Column(
            name = "lstm_link_quality"
    )
    private Double lstmLinkQuality;

    @Column(
            name = "lstm_future_rssi"
    )
    private Double lstmFutureRssi;

    @Column(
            name = "lstm_failure_risk"
    )
    private Double lstmFailureRisk;

    @Column(
            name = "lstm_sequence_length"
    )
    private Integer lstmSequenceLength;

    // ============================================================
    // RECOVERY ENGINE
    // ============================================================

    @Column(
            name = "recovery_decision",
            length = 60
    )
    private String recoveryDecision;

    @Column(
            name = "recommended_recovery_action",
            length = 60
    )
    private String recommendedRecoveryAction;

    @Column(
            name = "recoverability_score"
    )
    private Double recoverabilityScore;

    @Column(
            name = "recovery_success_probability"
    )
    private Double recoverySuccessProbability;

    @Column(
            name = "recovery_execution_status",
            length = 40
    )
    private String recoveryExecutionStatus;

    @Column(
            name = "recovery_execution_message",
            columnDefinition = "TEXT"
    )
    private String recoveryExecutionMessage;

    // ============================================================
    // COMPLETE ANALYSIS JSON
    // ============================================================

    @Column(
            name = "analysis_json",
            columnDefinition = "TEXT"
    )
    private String analysisJson;

    // ============================================================
    // CREATED
    // ============================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt =
                    LocalDateTime.now();
        }
    }
}