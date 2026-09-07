package com.manet.backend.simulation.dataset;

import com.manet.backend.entity.SimulationDatasetRecord;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.NodePosition;
import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.repository.SimulationDatasetRecordRepository;
import com.manet.backend.simulation.fault.FaultInjector;
import com.manet.backend.simulation.fault.FaultType;
import com.manet.backend.simulation.fault.SimulatedFault;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SimulationDataRecorder {

    private final SimulationDatasetRecordRepository repository;
    private final FaultInjector faultInjector;

    public SimulationDataRecorder(
            SimulationDatasetRecordRepository repository,
            FaultInjector faultInjector
    ) {
        this.repository = repository;
        this.faultInjector = faultInjector;
    }

    // =========================================================
    // INITIALIZE
    // =========================================================

    public void initialize(Long simulationId) {

        if (simulationId == null) {
            return;
        }

        // Remove old records for this simulation
        repository.deleteBySimulationId(simulationId);
    }


    // =========================================================
    // RECORD NODE + LINK DATA
    // =========================================================

    public synchronized void record(
            Long simulationId,
            NetworkState state
    ) {

        if (simulationId == null || state == null) {
            return;
        }

        List<SimulationDatasetRecord> records =
                new ArrayList<>();

        long timestamp =
                state.getCurrentTime();

        List<SimulatedFault> activeFaults =
                faultInjector != null
                        ? faultInjector.getActiveFaults()
                        : null;


        // =====================================================
        // PART 1
        // NODE DATA
        //
        // Used by:
        // XGBoost
        // Random Forest
        // =====================================================

        if (state.getNodes() != null) {

            for (SimulatedNode node :
                    state.getNodes()) {

                if (node == null) {
                    continue;
                }

                if (node.getNodeId() == null) {
                    continue;
                }

                NodePosition position =
                        node.getPosition();

                if (position == null) {
                    continue;
                }

                String faultType =
                        resolveFaultType(
                                node,
                                activeFaults
                        );


                SimulationDatasetRecord nodeRecord =
                        SimulationDatasetRecord.builder()

                                // -------------------------
                                // COMMON
                                // -------------------------

                                .simulationId(
                                        simulationId
                                )

                                .timestamp(
                                        timestamp
                                )


                                // -------------------------
                                // NODE IDENTIFICATION
                                // -------------------------

                                .nodeId(
                                        node.getNodeId()
                                )


                                // -------------------------
                                // POSITION
                                // -------------------------

                                .x(
                                        sanitize(
                                                position.getX()
                                        )
                                )

                                .y(
                                        sanitize(
                                                position.getY()
                                        )


                                        // -------------------------
                                        // NODE FEATURES
                                        // -------------------------

                                )

                                .speed(
                                        sanitize(
                                                node.getSpeed()
                                        )
                                )

                                .batteryLevel(
                                        sanitize(
                                                node.getBatteryLevel()
                                        )
                                )

                                .cpuUsage(
                                        sanitize(
                                                node.getCpuUsage()
                                        )
                                )

                                .memoryUsage(
                                        sanitize(
                                                node.getMemoryUsage()
                                        )
                                )

                                .signalStrength(
                                        sanitize(
                                                node.getSignalStrength()
                                        )
                                )

                                .packetLoss(
                                        sanitize(
                                                node.getPacketLoss()
                                        )
                                )

                                .latency(
                                        sanitize(
                                                node.getLatency()
                                        )
                                )


                                // -------------------------
                                // NODE STATE
                                // -------------------------

                                .active(
                                        node.isActive()
                                )

                                .faulty(
                                        node.isFaulty()
                                )

                                .faultType(
                                        faultType
                                )


                                // -------------------------
                                // LINK FIELDS
                                // Not applicable
                                // -------------------------

                                .sourceNodeId(
                                        null
                                )

                                .destinationNodeId(
                                        null
                                )

                                .nodeDistance(
                                        0.0
                                )

                                .throughput(
                                        0.0
                                )

                                .linkQuality(
                                        0.0
                                )

                                .linkActive(
                                        false
                                )


                                // -------------------------
                                // RECORD TYPE
                                // -------------------------

                                .recordType(
                                        "NODE"
                                )

                                .build();


                records.add(nodeRecord);
            }
        }


        // =====================================================
        // PART 2
        // LINK DATA
        //
        // Used by:
        // LSTM
        // =====================================================

        if (state.getLinks() != null) {

            for (SimulatedLink link :
                    state.getLinks()) {

                if (link == null) {
                    continue;
                }

                Long sourceNodeId =
                        link.getSourceNodeId();

                Long destinationNodeId =
                        link.getDestinationNodeId();


                // Both endpoints are required
                if (sourceNodeId == null
                        || destinationNodeId == null) {

                    continue;
                }


                // ---------------------------------------------
                // Find source node
                // ---------------------------------------------

                SimulatedNode sourceNode =
                        findNode(
                                state,
                                sourceNodeId
                        );


                // ---------------------------------------------
                // Find destination node
                // ---------------------------------------------

                SimulatedNode destinationNode =
                        findNode(
                                state,
                                destinationNodeId
                        );


                // ---------------------------------------------
                // Mobility speed
                //
                // Average speed of the two nodes
                // ---------------------------------------------

                double mobilitySpeed =
                        calculateMobilitySpeed(
                                sourceNode,
                                destinationNode
                        );


                // ---------------------------------------------
                // Link metrics
                // ---------------------------------------------

                double signalStrength =
                        sanitize(
                                link.getSignalStrength()
                        );

                double packetLoss =
                        sanitize(
                                link.getPacketLoss()
                        );

                double latency =
                        sanitize(
                                link.getLatency()
                        );

                double linkQuality =
                        sanitize(
                                link.getQuality()
                        );

                double nodeDistance =
                        sanitize(
                                link.getDistance()
                        );


                // ---------------------------------------------
                // Keep normalized values in valid ranges
                // ---------------------------------------------

                linkQuality =
                        clamp(
                                linkQuality,
                                0.0,
                                1.0
                        );

                packetLoss =
                        clamp(
                                packetLoss,
                                0.0,
                                1.0
                        );


                // ---------------------------------------------
                // Throughput
                // ---------------------------------------------

                double throughput =
                        calculateThroughput(
                                linkQuality,
                                packetLoss,
                                link.isActive()
                        );


                // ---------------------------------------------
                // Source position
                // ---------------------------------------------

                double sourceX = 0.0;
                double sourceY = 0.0;

                if (sourceNode != null
                        && sourceNode.getPosition() != null) {

                    sourceX =
                            sanitize(
                                    sourceNode
                                            .getPosition()
                                            .getX()
                            );

                    sourceY =
                            sanitize(
                                    sourceNode
                                            .getPosition()
                                            .getY()
                            );
                }


                // =================================================
                // CREATE LINK RECORD
                // =================================================

                /*
                 * nodeId cannot be null because the current
                 * database schema requires it.
                 *
                 * Therefore sourceNodeId is stored in nodeId
                 * as the primary identifier for this link record.
                 *
                 * The actual link is still identified by:
                 *
                 * sourceNodeId
                 * destinationNodeId
                 */

                SimulationDatasetRecord linkRecord =
                        SimulationDatasetRecord.builder()

                                // -------------------------
                                // COMMON
                                // -------------------------

                                .simulationId(
                                        simulationId
                                )

                                .timestamp(
                                        timestamp
                                )


                                // -------------------------
                                // REQUIRED NODE ID
                                // -------------------------

                                .nodeId(
                                        sourceNodeId
                                )


                                // -------------------------
                                // POSITION
                                // -------------------------

                                .x(
                                        sourceX
                                )

                                .y(
                                        sourceY
                                )


                                // -------------------------
                                // MOBILITY
                                // -------------------------

                                .speed(
                                        mobilitySpeed
                                )


                                // -------------------------
                                // NODE-ONLY FIELDS
                                // -------------------------

                                .batteryLevel(
                                        0.0
                                )

                                .cpuUsage(
                                        0.0
                                )

                                .memoryUsage(
                                        0.0
                                )


                                // -------------------------
                                // LSTM INPUT 1
                                // RSSI
                                // -------------------------

                                .signalStrength(
                                        signalStrength
                                )


                                // -------------------------
                                // LSTM INPUT 2
                                // Packet Loss
                                // -------------------------

                                .packetLoss(
                                        packetLoss
                                )


                                // -------------------------
                                // LSTM INPUT 3
                                // Latency
                                // -------------------------

                                .latency(
                                        latency
                                )


                                // -------------------------
                                // LSTM INPUT 4
                                // Throughput
                                // -------------------------

                                .throughput(
                                        throughput
                                )


                                // -------------------------
                                // LSTM INPUT 5
                                // Link Quality
                                // -------------------------

                                .linkQuality(
                                        linkQuality
                                )


                                // -------------------------
                                // LSTM INPUT 6
                                // Node Distance
                                // -------------------------

                                .nodeDistance(
                                        nodeDistance
                                )


                                // -------------------------
                                // LINK STATE
                                // -------------------------

                                .linkActive(
                                        link.isActive()
                                )


                                // -------------------------
                                // LINK IDENTIFICATION
                                // -------------------------

                                .sourceNodeId(
                                        sourceNodeId
                                )

                                .destinationNodeId(
                                        destinationNodeId
                                )


                                // -------------------------
                                // FAULT FIELDS
                                //
                                // These are not node-fault
                                // classification records.
                                // -------------------------

                                .active(
                                        false
                                )

                                .faulty(
                                        false
                                )

                                .faultType(
                                        "NORMAL"
                                )


                                // -------------------------
                                // RECORD TYPE
                                // -------------------------

                                .recordType(
                                        "LINK"
                                )

                                .build();


                records.add(linkRecord);
            }
        }


        // =====================================================
        // SAVE ALL RECORDS
        // =====================================================

        if (!records.isEmpty()) {

            repository.saveAll(
                    records
            );
        }
    }


    // =========================================================
    // FIND NODE
    // =========================================================

    private SimulatedNode findNode(
            NetworkState state,
            Long nodeId
    ) {

        if (state == null
                || state.getNodes() == null
                || nodeId == null) {

            return null;
        }

        for (SimulatedNode node :
                state.getNodes()) {

            if (node == null) {
                continue;
            }

            if (node.getNodeId() != null
                    && node.getNodeId().equals(nodeId)) {

                return node;
            }
        }

        return null;
    }


    // =========================================================
    // CALCULATE MOBILITY SPEED
    // =========================================================

    private double calculateMobilitySpeed(
            SimulatedNode sourceNode,
            SimulatedNode destinationNode
    ) {

        if (sourceNode != null
                && destinationNode != null) {

            return sanitize(
                    (
                            sourceNode.getSpeed()
                                    + destinationNode.getSpeed()
                    ) / 2.0
            );
        }

        if (sourceNode != null) {

            return sanitize(
                    sourceNode.getSpeed()
            );
        }

        if (destinationNode != null) {

            return sanitize(
                    destinationNode.getSpeed()
            );
        }

        return 0.0;
    }


    // =========================================================
    // CALCULATE THROUGHPUT
    // =========================================================

    private double calculateThroughput(
            double linkQuality,
            double packetLoss,
            boolean linkActive
    ) {

        if (!linkActive) {
            return 0.0;
        }

        /*
         * Simulation throughput.
         *
         * This is not physical network throughput.
         *
         * It provides a consistent throughput feature for
         * the LSTM dataset.
         */

        double baseCapacity = 100.0;

        double throughput =
                baseCapacity
                        * linkQuality
                        * (1.0 - packetLoss);

        return sanitize(
                Math.max(
                        0.0,
                        throughput
                )
        );
    }


    // =========================================================
    // CLAMP
    // =========================================================

    private double clamp(
            double value,
            double minimum,
            double maximum
    ) {

        return Math.max(
                minimum,
                Math.min(
                        maximum,
                        value
                )
        );
    }


    // =========================================================
    // SANITIZE
    // =========================================================

    private double sanitize(
            double value
    ) {

        if (Double.isNaN(value)
                || Double.isInfinite(value)) {

            return 0.0;
        }

        return value;
    }


    // =========================================================
    // RESOLVE NODE FAULT TYPE
    // =========================================================

    private String resolveFaultType(
            SimulatedNode node,
            List<SimulatedFault> activeFaults
    ) {

        if (node == null) {
            return "NORMAL";
        }


        // -----------------------------------------------------
        // 1. Node's own fault
        // -----------------------------------------------------

        FaultType nodeFaultType =
                node.getFaultType();

        if (nodeFaultType != null) {

            return nodeFaultType.name();
        }


        // -----------------------------------------------------
        // 2. Active fault records
        // -----------------------------------------------------

        if (activeFaults != null) {

            for (SimulatedFault fault :
                    activeFaults) {

                if (fault == null
                        || !fault.isActive()) {

                    continue;
                }

                FaultType faultType =
                        fault.getFaultType();

                if (faultType == null) {
                    continue;
                }


                // Direct node fault
                if (fault.getNodeId() != null
                        && fault.getNodeId()
                        .equals(node.getNodeId())) {

                    return faultType.name();
                }


                // Source node of affected link
                if (fault.getSourceNodeId() != null
                        && fault.getSourceNodeId()
                        .equals(node.getNodeId())) {

                    return faultType.name();
                }


                // Destination node of affected link
                if (fault.getDestinationNodeId() != null
                        && fault.getDestinationNodeId()
                        .equals(node.getNodeId())) {

                    return faultType.name();
                }
            }
        }


        return "NORMAL";
    }


    // =========================================================
    // GET NODE RECORDS
    // =========================================================

    public List<NodeDatasetRecord> getNodeRecords(
            Long simulationId
    ) {

        if (simulationId == null) {
            return new ArrayList<>();
        }

        List<SimulationDatasetRecord> databaseRecords =
                repository
                        .findBySimulationIdOrderByTimestampAscNodeIdAsc(
                                simulationId
                        );

        List<NodeDatasetRecord> records =
                new ArrayList<>();


        for (SimulationDatasetRecord databaseRecord :
                databaseRecords) {

            /*
             * Only NODE records should be returned here.
             *
             * This protects XGBoost and Random Forest
             * from accidentally receiving LINK records.
             */

            if (!"NODE".equals(
                    databaseRecord.getRecordType()
            )) {

                continue;
            }


            records.add(
                    new NodeDatasetRecord(
                            databaseRecord.getTimestamp(),
                            databaseRecord.getNodeId(),
                            databaseRecord.getX(),
                            databaseRecord.getY(),
                            databaseRecord.getSpeed(),
                            databaseRecord.getBatteryLevel(),
                            databaseRecord.getCpuUsage(),
                            databaseRecord.getMemoryUsage(),
                            databaseRecord.getSignalStrength(),
                            databaseRecord.getPacketLoss(),
                            databaseRecord.getLatency(),
                            databaseRecord.isActive(),
                            databaseRecord.isFaulty()
                    )
            );
        }


        return records;
    }


    // =========================================================
    // GET RECORD COUNT
    // =========================================================

    public int getRecordCount(
            Long simulationId
    ) {

        if (simulationId == null) {
            return 0;
        }

        return (int)
                repository.countBySimulationId(
                        simulationId
                );
    }


    // =========================================================
    // CLEAR ONE SIMULATION
    // =========================================================

    public void clear(
            Long simulationId
    ) {

        if (simulationId == null) {
            return;
        }

        repository.deleteBySimulationId(
                simulationId
        );
    }


    // =========================================================
    // CLEAR EVERYTHING
    // =========================================================

    public void clearAll() {

        repository.deleteAll();
    }
}