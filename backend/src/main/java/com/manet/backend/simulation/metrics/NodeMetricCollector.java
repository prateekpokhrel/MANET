package com.manet.backend.simulation.metrics;

import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NodeMetricCollector {

    public void collect(
            List<SimulatedNode> nodes,
            List<SimulatedLink> links
    ) {

        for (SimulatedNode node : nodes) {

            int neighborCount =
                    countNeighbors(node.getNodeId(), links);

            node.setSignalStrength(
                    calculateSignalStrength(
                            node.getNodeId(),
                            links
                    )
            );

            node.setPacketLoss(
                    calculatePacketLoss(
                            node.getNodeId(),
                            links
                    )
            );

            node.setLatency(
                    calculateLatency(
                            node.getNodeId(),
                            links
                    )
            );

            updateResourceUsage(node);

            if (neighborCount == 0 && node.isActive()) {
                node.setSignalStrength(0);
            }
        }
    }

    private int countNeighbors(
            Long nodeId,
            List<SimulatedLink> links
    ) {

        int count = 0;

        for (SimulatedLink link : links) {

            if (!link.isActive()) {
                continue;
            }

            if (link.getSourceNodeId().equals(nodeId)
                    || link.getDestinationNodeId().equals(nodeId)) {

                count++;
            }
        }

        return count;
    }

    private double calculateSignalStrength(
            Long nodeId,
            List<SimulatedLink> links
    ) {

        double total = 0;
        int count = 0;

        for (SimulatedLink link : links) {

            if (!link.isActive()) {
                continue;
            }

            if (link.getSourceNodeId().equals(nodeId)
                    || link.getDestinationNodeId().equals(nodeId)) {

                total += link.getSignalStrength();
                count++;
            }
        }

        return count == 0 ? 0 : total / count;
    }

    private double calculatePacketLoss(
            Long nodeId,
            List<SimulatedLink> links
    ) {

        double total = 0;
        int count = 0;

        for (SimulatedLink link : links) {

            if (!link.isActive()) {
                continue;
            }

            if (link.getSourceNodeId().equals(nodeId)
                    || link.getDestinationNodeId().equals(nodeId)) {

                total += link.getPacketLoss();
                count++;
            }
        }

        return count == 0 ? 0 : total / count;
    }

    private double calculateLatency(
            Long nodeId,
            List<SimulatedLink> links
    ) {

        double total = 0;
        int count = 0;

        for (SimulatedLink link : links) {

            if (!link.isActive()) {
                continue;
            }

            if (link.getSourceNodeId().equals(nodeId)
                    || link.getDestinationNodeId().equals(nodeId)) {

                total += link.getLatency();
                count++;
            }
        }

        return count == 0 ? 0 : total / count;
    }

    private void updateResourceUsage(
            SimulatedNode node
    ) {

        if (!node.isActive()) {
            return;
        }

        double cpuVariation =
                (Math.random() - 0.5) * 10;

        double memoryVariation =
                (Math.random() - 0.5) * 6;

        node.setCpuUsage(
                Math.max(
                        0,
                        Math.min(
                                100,
                                node.getCpuUsage()
                                        + cpuVariation
                        )
                )
        );

        node.setMemoryUsage(
                Math.max(
                        0,
                        Math.min(
                                100,
                                node.getMemoryUsage()
                                        + memoryVariation
                        )
                )
        );
    }
}