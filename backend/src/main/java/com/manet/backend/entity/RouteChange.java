package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "route_changes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "simulation_id", nullable = false)
    private Simulation simulation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traffic_flow_id")
    private TrafficFlow trafficFlow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "old_route_id")
    private Route oldRoute;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_route_id")
    private Route newRoute;

    @Column(name = "reason", length = 100)
    private String reason;

    @Column(name = "trigger_type", length = 50)
    private String triggerType;

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED";

    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();

        if (status == null) {
            status = "COMPLETED";
        }
    }
}