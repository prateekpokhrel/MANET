package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "simulation_id", nullable = false)
    private Simulation simulation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_node_id", nullable = false)
    private Node sourceNode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_node_id", nullable = false)
    private Node destinationNode;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String path;

    @Column
    private Double cost;

    @Column
    private Double latency;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();

        if (status == null) {
            status = "ACTIVE";
        }
    }
}