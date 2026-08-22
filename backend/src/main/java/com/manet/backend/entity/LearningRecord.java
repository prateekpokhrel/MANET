package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "simulation_id", nullable = false)
    private Simulation simulation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id")
    private Node node;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fault_id")
    private Fault fault;

    @Column(name = "event_type", length = 50)
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String inputData;

    @Column(columnDefinition = "TEXT")
    private String actualOutcome;

    @Column(name = "prediction_correct")
    private Boolean predictionCorrect;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}