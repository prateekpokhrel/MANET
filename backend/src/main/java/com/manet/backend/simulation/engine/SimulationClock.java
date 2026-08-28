package com.manet.backend.simulation.engine;

import lombok.Getter;

@Getter
public class SimulationClock {

    private long currentTime;

    private final double timeStep;

    public SimulationClock(double timeStep) {
        this.timeStep = timeStep;
        this.currentTime = 0;
    }

    public void tick() {
        currentTime += (long) timeStep;
    }

    public void reset() {
        currentTime = 0;
    }
}