package com.manet.backend.ai.dto;

public record AiNodeFeatures(
        long node_id,
        double x,
        double y,
        double speed,
        double battery_level,
        double cpu_usage,
        double memory_usage,
        double signal_strength,
        double packet_loss,
        double latency,
        boolean active,
        long timestamp
) {}
