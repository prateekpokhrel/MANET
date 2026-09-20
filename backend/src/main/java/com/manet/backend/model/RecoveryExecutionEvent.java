package com.manet.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecoveryExecutionEvent {

    private Long simulationId;
    private Long nodeId;
    private long simulationTimestamp;
    private String action;
    private String status;
    private String message;
    private int affectedPackets;
    private LocalDateTime executedAt;
}
