package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "simulation_id", nullable = false)
    private Simulation simulation;

    @Column(name = "node_identifier", nullable = false, length = 100)
    private String nodeIdentifier;

    @Column(name = "node_type", length = 50)
    private String nodeType;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "x_position")
    private Double xPosition;

    @Column(name = "y_position")
    private Double yPosition;

    @Column(name = "battery_level")
    private Double batteryLevel;

    @Column(name = "cpu_usage")
    private Double cpuUsage;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = "ACTIVE";
        }
    }
}