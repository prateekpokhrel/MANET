package com.manet.backend.ai.dto;

import java.util.Map;

public record XgboostResponse(
        Long node_id,
        String fault_prediction,
        int fault_prediction_code,
        double fault_probability,
        Map<String, Double> class_probabilities,
        String model
) {}
