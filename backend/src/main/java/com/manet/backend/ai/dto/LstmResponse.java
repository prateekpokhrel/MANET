package com.manet.backend.ai.dto;

public record LstmResponse(
        Long node_id,
        double predicted_future_link_quality,
        double predicted_future_rssi,
        double failure_risk,
        double failure_risk_percent,
        String link_failure_risk_status,
        String model,
        int sequence_length
) {}
