package com.manet.backend.simulation.network;

import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedPacket;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class PacketTransmissionManager {

    public void transmit(
            SimulatedPacket packet,
            List<SimulatedLink> links,
            long currentTime
    ) {

        if (packet.isDelivered() || packet.isDropped()) {
            return;
        }

        List<Long> route = packet.getRoute();

        if (route == null || route.size() < 2) {
            packet.setDropped(true);
            packet.setDropReason("INVALID ROUTE");
            return;
        }

        Long currentNode = packet.getCurrentNodeId();

        int currentIndex =
                route.indexOf(currentNode);

        if (currentIndex < 0
                || currentIndex >= route.size() - 1) {

            packet.setDropped(true);
            packet.setDropReason("ROUTE INVALIDATED");
            return;
        }

        Long nextNode =
                route.get(currentIndex + 1);

        SimulatedLink link =
                findLink(
                        currentNode,
                        nextNode,
                        links
                );

        if (link == null) {

            packet.setDropped(true);
            packet.setDropReason("LINK UNAVAILABLE");

            return;
        }

        packet.setLastTransmissionTime(currentTime);

        double randomValue =
                ThreadLocalRandom.current()
                        .nextDouble();

        if (randomValue < link.getPacketLoss()) {

            packet.setRetransmissionCount(
                    packet.getRetransmissionCount() + 1
            );

            if (packet.getRetransmissionCount() >= 3) {

                packet.setDropped(true);
                packet.setDropReason(
                        "MAX RETRANSMISSIONS"
                );
            }

            return;
        }

        packet.setCurrentNodeId(nextNode);

        if (nextNode.equals(
                packet.getDestinationNodeId()
        )) {

            packet.setDelivered(true);

            packet.setDeliveryTime(currentTime);

            packet.setLatency(
                    currentTime
                            - packet.getCreationTime()
            );
        }
    }

    private SimulatedLink findLink(
            Long sourceNode,
            Long destinationNode,
            List<SimulatedLink> links
    ) {

        for (SimulatedLink link : links) {

            if (!link.isActive()) {
                continue;
            }

            boolean forward =
                    link.getSourceNodeId()
                            .equals(sourceNode)
                            && link.getDestinationNodeId()
                            .equals(destinationNode);

            boolean reverse =
                    link.getSourceNodeId()
                            .equals(destinationNode)
                            && link.getDestinationNodeId()
                            .equals(sourceNode);

            if (forward || reverse) {
                return link;
            }
        }

        return null;
    }
}