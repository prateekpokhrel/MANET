package com.manet.backend.simulation.network;

import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedPacket;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class PacketTransmissionManager {

    /*
     * Stores successful packet transmissions for each link
     * at each simulation timestep.
     *
     * Structure:
     *
     * timestamp
     *      ↓
     * link key
     *      ↓
     * successful packet count
     *
     * Example:
     *
     * t=30
     * 1->2 = 5
     * 2->3 = 3
     *
     * This gives us link-level throughput information
     * for the LSTM dataset.
     */
    private final Map<Long, Map<String, Long>>
            successfulTransmissionsByTime =
            new ConcurrentHashMap<>();


    // =========================================================
    // PACKET TRANSMISSION
    // =========================================================

    public void transmit(
            SimulatedPacket packet,
            List<SimulatedLink> links,
            long currentTime
    ) {

        if (packet == null) {
            return;
        }

        if (packet.isDelivered()
                || packet.isDropped()) {

            return;
        }


        // =====================================================
        // VALIDATE ROUTE
        // =====================================================

        List<Long> route =
                packet.getRoute();

        if (route == null
                || route.size() < 2) {

            packet.setDropped(true);
            packet.setDropReason("INVALID ROUTE");

            return;
        }


        // =====================================================
        // FIND CURRENT NODE IN ROUTE
        // =====================================================

        Long currentNode =
                packet.getCurrentNodeId();

        if (currentNode == null) {

            packet.setDropped(true);
            packet.setDropReason("INVALID CURRENT NODE");

            return;
        }

        int currentIndex =
                route.indexOf(currentNode);

        if (currentIndex < 0
                || currentIndex >= route.size() - 1) {

            packet.setDropped(true);
            packet.setDropReason(
                    "ROUTE INVALIDATED"
            );

            return;
        }


        // =====================================================
        // FIND NEXT NODE
        // =====================================================

        Long nextNode =
                route.get(currentIndex + 1);

        if (nextNode == null) {

            packet.setDropped(true);
            packet.setDropReason(
                    "INVALID NEXT NODE"
            );

            return;
        }


        // =====================================================
        // FIND ACTIVE LINK
        // =====================================================

        SimulatedLink link =
                findLink(
                        currentNode,
                        nextNode,
                        links
                );

        if (link == null) {

            packet.setDropped(true);
            packet.setDropReason(
                    "LINK UNAVAILABLE"
            );

            return;
        }


        // =====================================================
        // RECORD TRANSMISSION ATTEMPT TIME
        // =====================================================

        packet.setLastTransmissionTime(
                currentTime
        );


        // =====================================================
        // PACKET LOSS
        // =====================================================

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

            /*
             * IMPORTANT:
             *
             * A lost packet is NOT counted as throughput.
             *
             * Only successful transmissions are counted.
             */

            return;
        }


        // =====================================================
        // SUCCESSFUL LINK TRANSMISSION
        // =====================================================

        packet.setCurrentNodeId(
                nextNode
        );


        /*
         * Count this successful packet transmission
         * for this source-destination link and timestep.
         *
         * This is the value later used as link throughput.
         */
        recordSuccessfulTransmission(
                currentNode,
                nextNode,
                currentTime
        );


        // =====================================================
        // CHECK FINAL DESTINATION
        // =====================================================

        if (nextNode.equals(
                packet.getDestinationNodeId()
        )) {

            packet.setDelivered(true);

            packet.setDeliveryTime(
                    currentTime
            );

            packet.setLatency(
                    currentTime
                            - packet.getCreationTime()
            );
        }
    }


    // =========================================================
    // RECORD SUCCESSFUL TRANSMISSION
    // =========================================================

    private void recordSuccessfulTransmission(
            Long sourceNodeId,
            Long destinationNodeId,
            long timestamp
    ) {

        if (sourceNodeId == null
                || destinationNodeId == null) {

            return;
        }


        String linkKey =
                createLinkKey(
                        sourceNodeId,
                        destinationNodeId
                );


        Map<String, Long> transmissionsAtTime =
                successfulTransmissionsByTime
                        .computeIfAbsent(
                                timestamp,
                                key -> new ConcurrentHashMap<>()
                        );


        transmissionsAtTime.merge(
                linkKey,
                1L,
                Long::sum
        );
    }


    // =========================================================
    // GET THROUGHPUT
    // =========================================================

    /**
     * Returns the number of successfully transmitted
     * packets over the specified link during the
     * specified simulation timestep.
     *
     * This is currently represented as:
     *
     * packets / timestep
     *
     * because SimulatedPacket does not currently expose
     * a payload size.
     */
    public double getThroughput(
            Long sourceNodeId,
            Long destinationNodeId,
            long timestamp
    ) {

        if (sourceNodeId == null
                || destinationNodeId == null) {

            return 0.0;
        }


        Map<String, Long> transmissionsAtTime =
                successfulTransmissionsByTime
                        .get(timestamp);

        if (transmissionsAtTime == null) {
            return 0.0;
        }


        String forwardKey =
                createLinkKey(
                        sourceNodeId,
                        destinationNodeId
                );

        String reverseKey =
                createLinkKey(
                        destinationNodeId,
                        sourceNodeId
                );


        /*
         * SimulatedLink is treated as bidirectional
         * by findLink(), so combine both directions.
         */

        long forward =
                transmissionsAtTime
                        .getOrDefault(
                                forwardKey,
                                0L
                        );

        long reverse =
                transmissionsAtTime
                        .getOrDefault(
                                reverseKey,
                                0L
                        );


        return (double)
                (forward + reverse);
    }


    // =========================================================
    // GET DIRECTIONAL THROUGHPUT
    // =========================================================

    /**
     * Returns throughput only in the specified direction.
     *
     * This can be useful if the LSTM dataset needs
     * directional link information.
     */
    public double getDirectionalThroughput(
            Long sourceNodeId,
            Long destinationNodeId,
            long timestamp
    ) {

        if (sourceNodeId == null
                || destinationNodeId == null) {

            return 0.0;
        }


        Map<String, Long> transmissionsAtTime =
                successfulTransmissionsByTime
                        .get(timestamp);

        if (transmissionsAtTime == null) {
            return 0.0;
        }


        String linkKey =
                createLinkKey(
                        sourceNodeId,
                        destinationNodeId
                );


        return transmissionsAtTime
                .getOrDefault(
                        linkKey,
                        0L
                );
    }


    // =========================================================
    // GET ALL THROUGHPUT VALUES FOR A TIMESTEP
    // =========================================================

    public Map<String, Long> getThroughputForTime(
            long timestamp
    ) {

        Map<String, Long> data =
                successfulTransmissionsByTime
                        .get(timestamp);

        if (data == null) {

            return new HashMap<>();
        }


        return new HashMap<>(data);
    }


    // =========================================================
    // CLEAR THROUGHPUT DATA FOR A TIMESTEP
    // =========================================================

    public void clearTime(
            long timestamp
    ) {

        successfulTransmissionsByTime
                .remove(timestamp);
    }


    // =========================================================
    // CLEAR ALL THROUGHPUT DATA
    // =========================================================

    public void clearAllThroughputData() {

        successfulTransmissionsByTime.clear();
    }


    // =========================================================
    // CREATE LINK KEY
    // =========================================================

    private String createLinkKey(
            Long sourceNodeId,
            Long destinationNodeId
    ) {

        return sourceNodeId
                + "->"
                + destinationNodeId;
    }


    // =========================================================
    // FIND ACTIVE LINK
    // =========================================================

    private SimulatedLink findLink(
            Long sourceNode,
            Long destinationNode,
            List<SimulatedLink> links
    ) {

        if (sourceNode == null
                || destinationNode == null
                || links == null) {

            return null;
        }


        for (SimulatedLink link :
                links) {

            if (link == null
                    || !link.isActive()) {

                continue;
            }


            Long linkSource =
                    link.getSourceNodeId();

            Long linkDestination =
                    link.getDestinationNodeId();


            if (linkSource == null
                    || linkDestination == null) {

                continue;
            }


            boolean forward =
                    linkSource.equals(sourceNode)
                            && linkDestination.equals(
                            destinationNode
                    );


            boolean reverse =
                    linkSource.equals(destinationNode)
                            && linkDestination.equals(
                            sourceNode
                    );


            if (forward || reverse) {

                return link;
            }
        }


        return null;
    }
}