package com.manet.backend.ai.dto;

public record IsolationForestResponse(
        Long node_id,
        String anomaly_status,
        int anomaly_prediction_code,
        double anomaly_score,
        double decision_function,
        String model
) {}
