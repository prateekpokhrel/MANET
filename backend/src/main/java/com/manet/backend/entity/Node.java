package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Node Name
     * Example:
     * Node-01
     */
    @Column(nullable = false, unique = true, length = 50)
    private String nodeName;

    /**
     * Current Position
     */
    @Column(nullable = false)
    private Double xCoordinate;

    @Column(nullable = false)
    private Double yCoordinate;

    /**
     * Battery Percentage
     */
    @Column(nullable = false)
    private Double batteryLevel;

    /**
     * Signal Strength (RSSI)
     */
    @Column(nullable = false)
    private Double signalStrength;

    /**
     * CPU Usage (%)
     */
    @Column(nullable = false)
    private Double cpuUsage;

    /**
     * Memory Usage (%)
     */
    @Column(nullable = false)
    private Double memoryUsage;

    /**
     * Queue Size
     */
    @Column(nullable = false)
    private Integer queueSize;

    /**
     * Packet Loss (%)
     */
    @Column(nullable = false)
    private Double packetLoss;

    /**
     * Current Latency (ms)
     */
    @Column(nullable = false)
    private Double latency;

    /**
     * Throughput (Mbps)
     */
    @Column(nullable = false)
    private Double throughput;

    /**
     * AI Generated Health Score (0-100)
     */
    @Column(nullable = false)
    private Double healthScore;

    /**
     * Is node isolated?
     */
    @Column(nullable = false)
    private Boolean isolated;

    /**
     * Is node active?
     */
    @Column(nullable = false)
    private Boolean active;

    /**
     * Current Status
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NodeStatus status;

    /**
     * Simulation Session
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulation_session_id")
    private SimulationSession simulationSession;

    /**
     * AI Predictions
     */
    @OneToMany(mappedBy = "node",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Prediction> predictions;

    /**
     * Recovery History
     */
    @OneToMany(mappedBy = "node",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<RecoveryLog> recoveryLogs;

    /**
     * Alerts
     */
    @OneToMany(mappedBy = "node",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<Alert> alerts;

    /**
     * Node Creation Time
     */
    private LocalDateTime createdAt;

    /**
     * Last Updated
     */
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (batteryLevel == null) batteryLevel = 100.0;
        if (healthScore == null) healthScore = 100.0;
        if (cpuUsage == null) cpuUsage = 0.0;
        if (memoryUsage == null) memoryUsage = 0.0;
        if (queueSize == null) queueSize = 0;
        if (packetLoss == null) packetLoss = 0.0;
        if (latency == null) latency = 0.0;
        if (throughput == null) throughput = 0.0;
        if (signalStrength == null) signalStrength = -40.0;
        if (isolated == null) isolated = false;
        if (active == null) active = true;
        if (status == null) status = NodeStatus.ACTIVE;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}