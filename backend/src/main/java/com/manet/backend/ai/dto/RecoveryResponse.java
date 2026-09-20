package com.manet.backend.ai.dto;

import java.util.List;

public record RecoveryResponse(
        Long node_id,
        double recoverability_score,
        String recovery_decision,
        String recommended_recovery_action,
        double decision_threshold,
        Double best_action_success_probability,
        Double best_action_success_percent,
        List<RecoveryActionEvaluation> action_evaluations,
        List<String> possible_recovery_actions,
        String model
) {}
