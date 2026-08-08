package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Node on which prediction was performed
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id", nullable = false)
    private Node node;

    /**
     * Simulation session
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulation_session_id")
    private SimulationSession simulationSession;

    /**
     * Failure probability (0 - 100%)
     */
    @Column(nullable = false)
    private Double failureProbability;

    /**
     * Predicted fault type
     * Examples:
     * LINK_FAILURE
     * NODE_FAILURE
     * CONGESTION
     * SIGNAL_LOSS
     * BATTERY_LOW
     */
    @Column(nullable = false, length = 100)
    private String predictedFaultType;

    /**
     * AI confidence score (0 - 100%)
     */
    @Column(nullable = false)
    private Double confidence;

    /**
     * AI model used
     * Random Forest
     * XGBoost
     * LSTM
     * Isolation Forest
     */
    @Column(nullable = false, length = 100)
    private String modelName;

    /**
     * Estimated time until failure (seconds)
     */
    private Integer estimatedFailureTime;

    /**
     * Is the node predicted to fail?
     */
    @Column(nullable = false)
    private Boolean failurePredicted;

    /**
     * AI-generated health score (0 - 100)
     */
    private Double healthScore;

    /**
     * Recoverability score (0 - 100)
     */
    private Double recoverabilityScore;

    /**
     * Prediction timestamp
     */
    @Column(nullable = false)
    private LocalDateTime predictionTime;

    @PrePersist
    public void prePersist() {
        this.predictionTime = LocalDateTime.now();
    }
}