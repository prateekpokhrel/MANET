package com.manet.backend.ai.dto;

public record RecoveryExecutionResult(
        String status,
        String action,
        String message,
        int affectedPackets
) {
}