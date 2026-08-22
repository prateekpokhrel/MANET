package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "traffic_flows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrafficFlow {

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

    @Column(name = "traffic_type", length = 50)
    private String trafficType;

    @Column(name = "packet_size")
    private Integer packetSize;

    @Column(name = "packets_per_second")
    private Double packetsPerSecond;

    @Column(name = "data_rate")
    private Double dataRate;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

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