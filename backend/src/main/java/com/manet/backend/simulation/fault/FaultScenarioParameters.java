package com.manet.backend.simulation.fault;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaultScenarioParameters {

    private FaultScenario scenario;

    private long startTime;

    private long duration;

    private double intensity;

    private int numberOfFaults;

    private boolean automaticRecovery;
}