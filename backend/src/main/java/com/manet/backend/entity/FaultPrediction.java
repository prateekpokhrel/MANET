package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fault_predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaultPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "node_id", nullable = false)
    private Node node;

    @Column(name = "predicted_fault_type", length = 50)
    private String predictedFaultType;

    @Column
    private Double probability;

    @Column(name = "risk_level", length = 30)
    private String riskLevel;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "predicted_at", nullable = false)
    private LocalDateTime predictedAt;

    @PrePersist
    protected void onCreate() {
        predictedAt = LocalDateTime.now();
    }
}