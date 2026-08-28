package com.manet.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationParameters {

    private int nodeCount;

    private double areaWidth;

    private double areaHeight;

    private double communicationRange;

    private double simulationDuration;

    private double timeStep;

    private double packetGenerationRate;

    private double faultProbability;

    private double minimumBatteryLevel;

    private double maximumNodeSpeed;
}
