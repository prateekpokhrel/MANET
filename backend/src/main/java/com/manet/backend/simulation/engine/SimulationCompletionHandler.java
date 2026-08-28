package com.manet.backend.simulation.engine;

import com.manet.backend.model.NetworkState;

public interface SimulationCompletionHandler {

    void onSimulationCompleted(
            Long simulationId,
            NetworkState state
    );
}