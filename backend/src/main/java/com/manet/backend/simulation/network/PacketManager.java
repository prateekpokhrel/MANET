package com.manet.backend.simulation.network;

import com.manet.backend.model.SimulatedPacket;
import com.manet.backend.model.SimulatedNode;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class PacketManager {

    private final AtomicLong packetSequence = new AtomicLong(1);

    public SimulatedPacket generatePacket(
            List<SimulatedNode> nodes,
            long currentTime
    ) {

        List<SimulatedNode> activeNodes = nodes.stream()
                .filter(SimulatedNode::isActive)
                .toList();

        if (activeNodes.size() < 2) {
            return null;
        }

        SimulatedNode source = activeNodes.get(
                ThreadLocalRandom.current()
                        .nextInt(activeNodes.size())
        );

        SimulatedNode destination;

        do {
            destination = activeNodes.get(
                    ThreadLocalRandom.current()
                            .nextInt(activeNodes.size())
            );
        } while (
                destination.getNodeId()
                        .equals(source.getNodeId())
        );

        return SimulatedPacket.builder()
                .packetId(packetSequence.getAndIncrement())
                .sourceNodeId(source.getNodeId())
                .destinationNodeId(destination.getNodeId())
                .currentNodeId(source.getNodeId())
                .packetSize(
                        ThreadLocalRandom.current()
                                .nextInt(256, 1501)
                )
                .creationTime(currentTime)
                .hopCount(0)
                .delivered(false)
                .dropped(false)
                .build();
    }

    public List<SimulatedPacket> generatePackets(
            List<SimulatedNode> nodes,
            long currentTime,
            int count
    ) {

        List<SimulatedPacket> packets = new ArrayList<>();

        for (int i = 0; i < count; i++) {

            SimulatedPacket packet =
                    generatePacket(nodes, currentTime);

            if (packet != null) {
                packets.add(packet);
            }
        }

        return packets;
    }
}