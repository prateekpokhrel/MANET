package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "node_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NodeMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "node_id", nullable = false)
    private Node node;

    @Column(name = "battery_level")
    private Double batteryLevel;

    @Column(name = "cpu_usage")
    private Double cpuUsage;

    @Column(name = "memory_usage")
    private Double memoryUsage;

    @Column(name = "packet_loss")
    private Double packetLoss;

    @Column
    private Double latency;

    @Column
    private Double rssi;

    @Column(name = "traffic_in")
    private Double trafficIn;

    @Column(name = "traffic_out")
    private Double trafficOut;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }
}