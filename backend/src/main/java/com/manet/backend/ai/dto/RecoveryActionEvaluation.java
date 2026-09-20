package com.manet.backend.ai.dto;

public record RecoveryActionEvaluation(
        String action,
        double recoverability_score,
        Double recovery_success_probability,
        Double recovery_success_percent,
        String success_prediction
) {}
