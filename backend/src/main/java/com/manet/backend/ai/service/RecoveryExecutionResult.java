package com.manet.backend.ai.service;

public record RecoveryExecutionResult(
        String status,
        String action,
        String message,
        int affectedPackets
) {
}
