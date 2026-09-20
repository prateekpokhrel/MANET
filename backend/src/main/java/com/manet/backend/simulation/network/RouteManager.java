package com.manet.backend.simulation.network;

import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedPacket;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class RouteManager {

    public List<Long> findRoute(
            List<SimulatedLink> links,
            Long sourceNodeId,
            Long destinationNodeId
    ) {

        Map<Long, List<Long>> graph = buildGraph(links);

        Queue<Long> queue = new LinkedList<>();
        Map<Long, Long> previous = new HashMap<>();
        Set<Long> visited = new HashSet<>();

        queue.add(sourceNodeId);
        visited.add(sourceNodeId);

        while (!queue.isEmpty()) {

            Long currentNode = queue.poll();

            if (currentNode.equals(destinationNodeId)) {
                return buildPath(
                        previous,
                        sourceNodeId,
                        destinationNodeId
                );
            }

            for (Long neighbor : graph.getOrDefault(
                    currentNode,
                    Collections.emptyList()
            )) {

                if (!visited.contains(neighbor)) {

                    visited.add(neighbor);
                    previous.put(neighbor, currentNode);
                    queue.add(neighbor);
                }
            }
        }

        return Collections.emptyList();
    }
    /**
     * Recalculates a route from the packet's CURRENT node
     * to its destination.
     *
     * This is different from routePacket(), which calculates
     * from the original source node.
     */
    public boolean reroutePacket(
            SimulatedPacket packet,
            List<SimulatedLink> links
    ) {

        if (packet == null
                || packet.getCurrentNodeId() == null
                || packet.getDestinationNodeId() == null) {

            return false;
        }

        Long currentNode =
                packet.getCurrentNodeId();

        Long destination =
                packet.getDestinationNodeId();

        /*
         * Already at destination.
         */
        if (currentNode.equals(destination)) {

            packet.setRoute(
                    List.of(currentNode)
            );

            packet.setHopCount(0);

            return true;
        }

        List<Long> newRoute =
                findRoute(
                        links,
                        currentNode,
                        destination
                );

        if (newRoute.isEmpty()) {

            return false;
        }

        packet.setRoute(
                newRoute
        );

        packet.setHopCount(
                Math.max(
                        0,
                        newRoute.size() - 1
                )
        );

        return true;
    }
    public boolean routePacket(
            SimulatedPacket packet,
            List<SimulatedLink> links
    ) {

        List<Long> route = findRoute(
                links,
                packet.getSourceNodeId(),
                packet.getDestinationNodeId()
        );

        if (route.isEmpty()) {

            packet.setDropped(true);
            packet.setDropReason("NO ROUTE FOUND");

            return false;
        }

        packet.setRoute(route);
        packet.setHopCount(route.size() - 1);

        return true;
    }

    private Map<Long, List<Long>> buildGraph(
            List<SimulatedLink> links
    ) {

        Map<Long, List<Long>> graph = new HashMap<>();

        for (SimulatedLink link : links) {

            if (!link.isActive()) {
                continue;
            }

            graph.computeIfAbsent(
                    link.getSourceNodeId(),
                    key -> new ArrayList<>()
            ).add(link.getDestinationNodeId());

            graph.computeIfAbsent(
                    link.getDestinationNodeId(),
                    key -> new ArrayList<>()
            ).add(link.getSourceNodeId());
        }

        return graph;
    }

    private List<Long> buildPath(
            Map<Long, Long> previous,
            Long source,
            Long destination
    ) {

        LinkedList<Long> path = new LinkedList<>();

        Long current = destination;

        while (current != null) {

            path.addFirst(current);

            if (current.equals(source)) {
                break;
            }

            current = previous.get(current);
        }

        if (!path.getFirst().equals(source)) {
            return Collections.emptyList();
        }

        return path;
    }
}