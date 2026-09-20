package com.manet.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RandomForestResponse(
        Long node_id,
        double failure_probability,
        double failure_probability_percent,
        String failure_prediction,
        int failure_prediction_code,
        String model
) {}
