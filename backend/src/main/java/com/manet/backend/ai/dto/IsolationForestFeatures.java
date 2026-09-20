package com.manet.backend.ai.dto;

public record IsolationForestFeatures(
        Long node_id,
        double cpu,
        double memory,
        double battery,
        double rssi,
        double packet_loss,
        double latency,
        double throughput,
        double queue_size,
        double traffic_load,
        double link_quality,
        double mobility_speed
) {}
