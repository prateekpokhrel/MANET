package com.manet.backend.simulation.fault;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatedFault {

    private Long faultId;

    private FaultType faultType;

    private FaultCategory category;

    private FaultSeverity severity;

    private Long nodeId;

    private Long sourceNodeId;

    private Long destinationNodeId;

    private long startTime;

    private Long endTime;

    private boolean active;

    private boolean detected;

    private boolean aiMitigated;

    private boolean humanInterventionRequired;

    private String description;
}