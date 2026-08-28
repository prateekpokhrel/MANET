package com.manet.backend.simulation.movement;

import com.manet.backend.model.SimulatedNode;

public interface MovementModel {

    void move(
            SimulatedNode node,
            double areaWidth,
            double areaHeight,
            double timeStep
    );
}