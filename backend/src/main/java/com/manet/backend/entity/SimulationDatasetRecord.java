package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "simulation_dataset_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationDatasetRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long simulationId;

    @Column(nullable = false)
    private Long timestamp;

    @Column(nullable = false)
    private Long nodeId;

    @Column(nullable = false)
    private double x;

    @Column(nullable = false)
    private double y;

    @Column(nullable = false)
    private double speed;

    @Column(nullable = false)
    private double batteryLevel;

    @Column(nullable = false)
    private double cpuUsage;

    @Column(nullable = false)
    private double memoryUsage;

    @Column(nullable = false)
    private double signalStrength;

    @Column(nullable = false)
    private double packetLoss;

    @Column(nullable = false)
    private double latency;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private boolean faulty;

    @Column(nullable = false)
    private String faultType;
}