package com.manet.backend.simulation.dataset;

import com.manet.backend.entity.SimulationDatasetRecord;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.NodePosition;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.repository.SimulationDatasetRecordRepository;
import com.manet.backend.simulation.fault.FaultInjector;
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
                faultInjector.getActiveFaults();

        for (SimulatedNode node :
                state.getNodes()) {

            NodePosition position =
                    node.getPosition();

            String faultType =
                    findFaultType(
                            node,
                            activeFaults
                    );

            SimulationDatasetRecord record =
                    SimulationDatasetRecord.builder()
                            .simulationId(simulationId)
                            .timestamp(timestamp)
                            .nodeId(node.getNodeId())
                            .x(position.getX())
                            .y(position.getY())
                            .speed(node.getSpeed())
                            .batteryLevel(node.getBatteryLevel())
                            .cpuUsage(node.getCpuUsage())
                            .memoryUsage(node.getMemoryUsage())
                            .signalStrength(node.getSignalStrength())
                            .packetLoss(node.getPacketLoss())
                            .latency(node.getLatency())
                            .active(node.isActive())
                            .faulty(node.isFaulty())
                            .faultType(faultType)
                            .build();

            records.add(record);
        }

        if (!records.isEmpty()) {

            repository.saveAll(
                    records
            );
        }
    }

    private String findFaultType(
            SimulatedNode node,
            List<SimulatedFault> faults
    ) {

        if (faults == null || faults.isEmpty()) {
            return "NORMAL";
        }

        for (SimulatedFault fault : faults) {

            if (!fault.isActive()) {
                continue;
            }

            if (fault.getNodeId() != null
                    && fault.getNodeId()
                    .equals(node.getNodeId())) {

                return fault.getFaultType().name();
            }

            if (fault.getSourceNodeId() != null
                    && fault.getSourceNodeId()
                    .equals(node.getNodeId())) {

                return fault.getFaultType().name();
            }

            if (fault.getDestinationNodeId() != null
                    && fault.getDestinationNodeId()
                    .equals(node.getNodeId())) {

                return fault.getFaultType().name();
            }
        }

        return "NORMAL";
    }

    public List<NodeDatasetRecord> getNodeRecords(
            Long simulationId
    ) {

        List<SimulationDatasetRecord> databaseRecords =
                repository
                        .findBySimulationIdOrderByTimestampAscNodeIdAsc(
                                simulationId
                        );

        List<NodeDatasetRecord> records =
                new ArrayList<>();

        for (SimulationDatasetRecord databaseRecord :
                databaseRecords) {

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

    public int getRecordCount(
            Long simulationId
    ) {

        return (int)
                repository.countBySimulationId(
                        simulationId
                );
    }

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

    public void clearAll() {

        repository.deleteAll();
    }
}