package com.manet.backend.simulation.movement;

import com.manet.backend.model.NodePosition;
import com.manet.backend.model.SimulatedNode;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
public class RandomWalkMovement implements MovementModel {

    @Override
    public void move(
            SimulatedNode node,
            double areaWidth,
            double areaHeight,
            double timeStep
    ) {

        NodePosition position = node.getPosition();

        double angle = ThreadLocalRandom.current()
                .nextDouble(0, 2 * Math.PI);

        double distance = node.getSpeed() * timeStep;

        double newX = position.getX() + Math.cos(angle) * distance;
        double newY = position.getY() + Math.sin(angle) * distance;

        newX = Math.max(0, Math.min(areaWidth, newX));
        newY = Math.max(0, Math.min(areaHeight, newY));

        position.setX(newX);
        position.setY(newY);
    }
}