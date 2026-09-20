package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ai_recovery_executions",
        indexes = {
                @Index(
                        name = "idx_ai_recovery_sim_time",
                        columnList = "simulation_id,simulation_timestamp"
                ),
                @Index(
                        name = "idx_ai_recovery_sim_node",
                        columnList = "simulation_id,node_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecoveryExecution {

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
            name = "action_type",
            nullable = false,
            length = 60
    )
    private String actionType;

    @Column(
            name = "recovery_decision",
            length = 60
    )
    private String recoveryDecision;

    @Column(
            name = "execution_status",
            nullable = false,
            length = 40
    )
    private String executionStatus;

    @Column(
            name = "message",
            columnDefinition = "TEXT"
    )
    private String message;

    @Column(
            name = "affected_packets"
    )
    private int affectedPackets;

    @Column(
            name = "recoverability_score"
    )
    private Double recoverabilityScore;

    @Column(
            name = "success_probability"
    )
    private Double successProbability;

    @Column(
            name = "condition_signature",
            length = 500
    )
    private String conditionSignature;

    @Column(
            name = "recovery_json",
            columnDefinition = "TEXT"
    )
    private String recoveryJson;

    @Column(
            name = "started_at",
            nullable = false
    )
    private LocalDateTime startedAt;

    @Column(
            name = "completed_at"
    )
    private LocalDateTime completedAt;
}