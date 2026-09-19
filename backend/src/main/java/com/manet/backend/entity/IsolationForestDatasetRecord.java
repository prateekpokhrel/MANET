package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "isolation_forest_dataset_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IsolationForestDatasetRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SIMULATION INFORMATION
    @Column(name = "simulation_id", nullable = false)
    private Long simulationId;

    @Column(nullable = false)
    private Long timestamp;

    @Column(name = "node_id", nullable = false)
    private Long nodeId;

    // ISOLATION FOREST INPUT 1
    // CPU
   @Column(name = "cpu_usage")
    private double cpuUsage;

    // ISOLATION FOREST INPUT 2
    // MEMORY
    @Column(name = "memory_usage")
    private double memoryUsage;

    // ISOLATION FOREST INPUT 3
    // BATTERY
    @Column(name = "battery_level")
    private double batteryLevel;

    // ISOLATION FOREST INPUT 4
    // RSSI
   @Column
    private double rssi;

    // ISOLATION FOREST INPUT 5
    // PACKET LOSS
    @Column(name = "packet_loss")
    private double packetLoss;

    // ISOLATION FOREST INPUT 6
    // LATENCY
    @Column
    private double latency;

    // ISOLATION FOREST INPUT 7
    // THROUGHPUT
    @Column
    private double throughput;

    // ISOLATION FOREST INPUT 8
    // QUEUE SIZE
    @Column(name = "queue_size")
    private int queueSize;

    // ISOLATION FOREST INPUT 9
    // TRAFFIC LOAD
    @Column(name = "traffic_load")
    private double trafficLoad;

    // ISOLATION FOREST INPUT 10
    // LINK QUALITY
   @Column(name = "link_quality")
    private double linkQuality;

    // ISOLATION FOREST INPUT 11
    // MOBILITY SPEED
     @Column(name = "mobility_speed")
    private double mobilitySpeed;
}