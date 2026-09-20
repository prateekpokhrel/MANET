package com.manet.backend.ai.dto;

public record LstmTimeStep(
        double rssi,
        double packet_loss,
        double latency,
        double throughput,
        double link_quality,
        double node_distance,
        double mobility_speed
) {}
