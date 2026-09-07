package com.manet.backend.simulation.dataset;

import com.manet.backend.entity.IsolationForestDatasetRecord;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulatedLink;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.model.SimulatedPacket;
import com.manet.backend.repository.IsolationForestDatasetRecordRepository;
import com.manet.backend.simulation.network.PacketTransmissionManager;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class IsolationForestDatasetRecorder {

    private final IsolationForestDatasetRecordRepository repository;

    private final PacketTransmissionManager packetTransmissionManager;


    public IsolationForestDatasetRecorder(
            IsolationForestDatasetRecordRepository repository,
            PacketTransmissionManager packetTransmissionManager
    ) {

        this.repository = repository;

        this.packetTransmissionManager =
                packetTransmissionManager;
    }

    // INITIALIZE
   public void initialize(
            Long simulationId
    ) {

        if (simulationId == null) {
            return;
        }

        repository.deleteBySimulationId(
                simulationId
        );
    }

    // RECORD ISOLATION FOREST DATA
    public synchronized void record(
            Long simulationId,
            NetworkState state
    ) {

        if (simulationId == null
                || state == null) {

            return;
        }


        if (state.getNodes() == null) {
            return;
        }


        List<IsolationForestDatasetRecord> records =
                new ArrayList<>();


        long timestamp =
                state.getCurrentTime();


        for (SimulatedNode node :
                state.getNodes()) {

            if (node == null) {
                continue;
            }


            if (node.getNodeId() == null) {
                continue;
            }

            // BASIC NODE METRICS
           double cpu =
                    sanitize(
                            node.getCpuUsage()
                    );

            double memory =
                    sanitize(
                            node.getMemoryUsage()
                    );

            double battery =
                    sanitize(
                            node.getBatteryLevel()
                    );

            double rssi =
                    sanitize(
                            node.getSignalStrength()
                    );

            double packetLoss =
                    sanitize(
                            node.getPacketLoss()
                    );

            double latency =
                    sanitize(
                            node.getLatency()
                    );

            double mobilitySpeed =
                    sanitize(
                            node.getSpeed()
                    );

            // QUEUE SIZE
           int queueSize =
                    calculateQueueSize(
                            node.getNodeId(),
                            state
                    );

            // TRAFFIC LOAD
            double trafficLoad =
                    calculateTrafficLoad(
                            node.getNodeId(),
                            timestamp,
                            state
                    );

            // LINK QUALITY
            double linkQuality =
                    calculateAverageLinkQuality(
                            node.getNodeId(),
                            state
                    );

            // THROUGHPUT
            double throughput =
                    calculateNodeThroughput(
                            node.getNodeId(),
                            timestamp,
                            state
                    );

            // CREATE RECORD
            IsolationForestDatasetRecord record =
                    IsolationForestDatasetRecord.builder()

                            .simulationId(
                                    simulationId
                            )

                            .timestamp(
                                    timestamp
                            )

                            .nodeId(
                                    node.getNodeId()
                            )

                            .cpuUsage(
                                    cpu
                            )

                            .memoryUsage(
                                    memory
                            )

                            .batteryLevel(
                                    battery
                            )

                            .rssi(
                                    rssi
                            )

                            .packetLoss(
                                    packetLoss
                            )

                            .latency(
                                    latency
                            )

                            .throughput(
                                    throughput
                            )

                            .queueSize(
                                    queueSize
                            )

                            .trafficLoad(
                                    trafficLoad
                            )

                            .linkQuality(
                                    linkQuality
                            )

                            .mobilitySpeed(
                                    mobilitySpeed
                            )

                            .build();


            records.add(record);
        }


        if (!records.isEmpty()) {

            repository.saveAll(
                    records
            );
        }
    }

    // CALCULATE QUEUE SIZE
   private int calculateQueueSize(
            Long nodeId,
            NetworkState state
    ) {

        if (nodeId == null
                || state.getPackets() == null) {

            return 0;
        }


        int count = 0;


        for (SimulatedPacket packet :
                state.getPackets()) {

            if (packet == null) {
                continue;
            }


            /*
             * A packet is considered queued at this node
             * when it is currently located at the node and
             * has not yet been delivered or dropped.
             */

            if (nodeId.equals(
                    packet.getCurrentNodeId()
            )
                    && !packet.isDelivered()
                    && !packet.isDropped()) {

                count++;
            }
        }


        return count;
    }

    // CALCULATE TRAFFIC LOAD
    private double calculateTrafficLoad(
            Long nodeId,
            long timestamp,
            NetworkState state
    ) {

        if (nodeId == null
                || state.getPackets() == null) {

            return 0.0;
        }


        double trafficLoad = 0.0;


        for (SimulatedPacket packet :
                state.getPackets()) {

            if (packet == null) {
                continue;
            }


            /*
             * Traffic load represents the amount of traffic
             * generated by this node during this simulation
             * timestep.
             */

            if (nodeId.equals(
                    packet.getSourceNodeId()
            )
                    && packet.getCreationTime()
                    == timestamp) {

                trafficLoad +=
                        packet.getPacketSize();
            }
        }


        return sanitize(
                trafficLoad
        );
    }

    // CALCULATE LINK QUALITY
    private double calculateAverageLinkQuality(
            Long nodeId,
            NetworkState state
    ) {

        if (nodeId == null
                || state.getLinks() == null) {

            return 0.0;
        }


        double totalQuality = 0.0;

        int count = 0;


        for (SimulatedLink link :
                state.getLinks()) {

            if (link == null) {
                continue;
            }


            boolean connected =

                    nodeId.equals(
                            link.getSourceNodeId()
                    )

                            ||

                            nodeId.equals(
                                    link.getDestinationNodeId()
                            );


            if (!connected) {
                continue;
            }


            totalQuality +=
                    sanitize(
                            link.getQuality()
                    );

            count++;
        }


        if (count == 0) {
            return 0.0;
        }


        return clamp(
                totalQuality / count,
                0.0,
                1.0
        );
    }

    // CALCULATE NODE THROUGHPUT
    private double calculateNodeThroughput(
            Long nodeId,
            long timestamp,
            NetworkState state
    ) {

        if (nodeId == null
                || state.getLinks() == null) {

            return 0.0;
        }


        double totalThroughput = 0.0;


        for (SimulatedLink link :
                state.getLinks()) {

            if (link == null) {
                continue;
            }


            Long source =
                    link.getSourceNodeId();

            Long destination =
                    link.getDestinationNodeId();


            boolean connected =

                    nodeId.equals(source)
                            ||
                            nodeId.equals(destination);


            if (!connected) {
                continue;
            }


            totalThroughput +=
                    packetTransmissionManager
                            .getThroughput(
                                    source,
                                    destination,
                                    timestamp
                            );
        }


        return sanitize(
                totalThroughput
        );
    }

    // SANITIZE
    private double sanitize(
            double value
    ) {

        if (Double.isNaN(value)
                || Double.isInfinite(value)) {

            return 0.0;
        }

        return value;
    }

    // CLAMP
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
}