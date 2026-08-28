package com.manet.backend.simulation.metrics;

import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulatedPacket;
import org.springframework.stereotype.Component;

@Component
public class NetworkMetricCollector {

    public NetworkMetrics collect(
            NetworkState state
    ) {

        int totalPackets =
                state.getPackets().size();

        int deliveredPackets = 0;
        int droppedPackets = 0;

        double totalLatency = 0;
        long totalBytesDelivered = 0;
        int totalHops = 0;

        for (SimulatedPacket packet : state.getPackets()) {

            if (packet.isDelivered()) {

                deliveredPackets++;

                totalLatency += packet.getLatency();

                totalBytesDelivered +=
                        packet.getPacketSize();

                totalHops += packet.getHopCount();
            }

            if (packet.isDropped()) {
                droppedPackets++;
            }
        }

        double packetDeliveryRatio =
                totalPackets == 0
                        ? 0
                        : (double) deliveredPackets
                          / totalPackets;

        double packetLossRatio =
                totalPackets == 0
                        ? 0
                        : (double) droppedPackets
                          / totalPackets;

        double averageLatency =
                deliveredPackets == 0
                        ? 0
                        : totalLatency
                          / deliveredPackets;

        double averageHopCount =
                deliveredPackets == 0
                        ? 0
                        : (double) totalHops
                          / deliveredPackets;

        double throughput =
                calculateThroughput(
                        totalBytesDelivered,
                        state.getCurrentTime()
                );

        return new NetworkMetrics(
                state.getCurrentTime(),
                state.getNodes().size(),
                countActiveNodes(state),
                state.getLinks().size(),
                totalPackets,
                deliveredPackets,
                droppedPackets,
                packetDeliveryRatio,
                packetLossRatio,
                averageLatency,
                averageHopCount,
                throughput
        );
    }

    private int countActiveNodes(
            NetworkState state
    ) {

        int count = 0;

        for (var node : state.getNodes()) {

            if (node.isActive()) {
                count++;
            }
        }

        return count;
    }

    private double calculateThroughput(
            long bytes,
            long time
    ) {

        if (time <= 0) {
            return 0;
        }

        return (
                (double) bytes * 8
        ) / time;
    }

    public record NetworkMetrics(
            long timestamp,
            int totalNodes,
            int activeNodes,
            int activeLinks,
            int totalPackets,
            int deliveredPackets,
            int droppedPackets,
            double packetDeliveryRatio,
            double packetLossRatio,
            double averageLatency,
            double averageHopCount,
            double throughput
    ) {
    }
}