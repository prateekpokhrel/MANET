package com.manet.backend.simulation.network;

import com.manet.backend.model.NodePosition;
import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class LinkManager {

    public List<SimulatedLink> calculateLinks(
            List<SimulatedNode> nodes,
            double communicationRange
    ) {

        List<SimulatedLink> links = new ArrayList<>();

        for (int i = 0; i < nodes.size(); i++) {

            for (int j = i + 1; j < nodes.size(); j++) {

                SimulatedNode source = nodes.get(i);
                SimulatedNode destination = nodes.get(j);

                if (!source.isActive() || !destination.isActive()) {
                    continue;
                }

                double distance = calculateDistance(
                        source.getPosition(),
                        destination.getPosition()
                );

                if (distance <= communicationRange) {

                    double quality =
                            1.0 - (distance / communicationRange);

                    double signalStrength = quality * 100;

                    double latency = 5 + (distance / communicationRange) * 95;

                    double packetLoss =
                            Math.max(0, 1 - quality);

                    links.add(
                            SimulatedLink.builder()
                                    .sourceNodeId(source.getNodeId())
                                    .destinationNodeId(destination.getNodeId())
                                    .distance(distance)
                                    .quality(quality)
                                    .signalStrength(signalStrength)
                                    .latency(latency)
                                    .packetLoss(packetLoss)
                                    .active(true)
                                    .build()
                    );
                }
            }
        }

        return links;
    }

    private double calculateDistance(
            NodePosition first,
            NodePosition second
    ) {

        double dx = first.getX() - second.getX();
        double dy = first.getY() - second.getY();

        return Math.sqrt(dx * dx + dy * dy);
    }
}