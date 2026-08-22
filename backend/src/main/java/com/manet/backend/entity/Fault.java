package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "faults")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fault {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "simulation_id", nullable = false)
    private Simulation simulation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id")
    private Node node;

    @Column(name = "fault_type", nullable = false, length = 50)
    private String faultType;

    @Column(length = 30)
    private String severity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    private String status = "DETECTED";

    @Column(name = "detected_at", nullable = false)
    private LocalDateTime detectedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        detectedAt = LocalDateTime.now();

        if (status == null) {
            status = "DETECTED";
        }
    }
}