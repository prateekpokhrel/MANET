package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "simulation_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name of simulation
     * Example:
     * Simulation-001
     */
    @Column(nullable = false, unique = true, length = 100)
    private String sessionName;

    /**
     * Description
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Number of virtual nodes
     */
    private Integer totalNodes;

    /**
     * Number of virtual links
     */
    private Integer totalLinks;

    /**
     * Total packets generated
     */
    private Long packetsGenerated;

    /**
     * Successfully delivered packets
     */
    private Long packetsDelivered;

    /**
     * Lost packets
     */
    private Long packetsLost;

    /**
     * Average latency (ms)
     */
    private Double averageLatency;

    /**
     * Average throughput (Mbps)
     */
    private Double averageThroughput;

    /**
     * Average packet loss (%)
     */
    private Double averagePacketLoss;

    /**
     * Number of failures simulated
     */
    private Integer failuresDetected;

    /**
     * Number of successful recoveries
     */
    private Integer successfulRecoveries;

    /**
     * Average recovery time (seconds)
     */
    private Double averageRecoveryTime;

    /**
     * Simulation status
     * CREATED
     * RUNNING
     * COMPLETED
     * FAILED
     */
    @Column(nullable = false, length = 50)
    private String status;

    /**
     * Simulation start time
     */
    private LocalDateTime startTime;

    /**
     * Simulation end time
     */
    private LocalDateTime endTime;

    /**
     * Session creation timestamp
     */
    private LocalDateTime createdAt;

    /**
     * AI predictions for this simulation
     */
    @OneToMany(mappedBy = "simulationSession",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Prediction> predictions;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}