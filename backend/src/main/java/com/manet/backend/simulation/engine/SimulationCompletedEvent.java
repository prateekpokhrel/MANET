package com.manet.backend.simulation.engine;

import com.manet.backend.model.NetworkState;

public class SimulationCompletedEvent {

    private final Long simulationId;
    private final NetworkState state;

    public SimulationCompletedEvent(
            Long simulationId,
            NetworkState state
    ) {
        this.simulationId = simulationId;
        this.state = state;
    }

    public Long getSimulationId() {
        return simulationId;
    }

    public NetworkState getState() {
        return state;
    }
}