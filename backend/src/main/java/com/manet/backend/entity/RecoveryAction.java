package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recovery_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecoveryAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fault_id", nullable = false)
    private Fault fault;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id")
    private Node node;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "initiated_by", length = 30)
    private String initiatedBy;

    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}