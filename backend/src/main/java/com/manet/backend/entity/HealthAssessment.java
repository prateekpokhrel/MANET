package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "node_id", nullable = false)
    private Node node;

    @Column(name = "health_score")
    private Double healthScore;

    @Column(name = "battery_health")
    private Double batteryHealth;

    @Column(name = "cpu_health")
    private Double cpuHealth;

    @Column(name = "connectivity_health")
    private Double connectivityHealth;

    @Column(name = "packet_loss")
    private Double packetLoss;

    @Column(name = "latency")
    private Double latency;

    @Column(nullable = false, length = 30)
    private String status = "HEALTHY";

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "assessed_at", nullable = false)
    private LocalDateTime assessedAt;

    @PrePersist
    protected void onCreate() {
        assessedAt = LocalDateTime.now();

        if (status == null) {
            status = "HEALTHY";
        }
    }
}