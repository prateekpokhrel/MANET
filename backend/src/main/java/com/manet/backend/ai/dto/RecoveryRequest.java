package com.manet.backend.ai.dto;

public record RecoveryRequest(
        Long node_id,
        double failure_probability,
        String fault_type_for_engine,
        String fault_severity,
        double node_health_score,
        double battery_level,
        double link_quality,
        double available_neighbor_nodes,
        double number_of_alternative_routes,
        double alternative_route_quality,
        double current_traffic_load,
        double previous_recovery_history,
        double predicted_link_quality,
        double anomaly_score
) {}
