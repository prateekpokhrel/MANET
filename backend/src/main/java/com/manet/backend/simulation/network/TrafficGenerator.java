package com.manet.backend.simulation.network;

import com.manet.backend.model.SimulatedNode;
import com.manet.backend.model.SimulatedPacket;
import com.manet.backend.model.SimulationParameters;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TrafficGenerator {

    private final PacketManager packetManager;

    private double packetAccumulator = 0.0;

    public TrafficGenerator(PacketManager packetManager) {
        this.packetManager = packetManager;
    }

    public List<SimulatedPacket> generateTraffic(
            List<SimulatedNode> nodes,
            SimulationParameters parameters,
            long currentTime
    ) {

        double packetsThisStep =
                parameters.getPacketGenerationRate()
                        * parameters.getTimeStep();

        packetAccumulator += packetsThisStep;

        int packetCount = (int) packetAccumulator;

        packetAccumulator -= packetCount;

        if (packetCount <= 0) {
            return List.of();
        }

        return packetManager.generatePackets(
                nodes,
                currentTime,
                packetCount
        );
    }

    public void reset() {
        packetAccumulator = 0.0;
    }
}