package com.manet.backend.service;

import com.manet.backend.entity.SimulationDatasetRecord;
import com.manet.backend.repository.SimulationDatasetRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SimulationDatasetExportService {

    private final SimulationDatasetRecordRepository repository;

    public SimulationDatasetExportService(
            SimulationDatasetRecordRepository repository
    ) {
        this.repository = repository;
    }

    public String exportNodeHealthDataset(
            Long simulationId
    ) {

        List<SimulationDatasetRecord> records =
                repository
                        .findBySimulationIdOrderByTimestampAscNodeIdAsc(
                                simulationId
                        );

        if (records.isEmpty()) {

            throw new IllegalStateException(
                    "No dataset records found for simulation: "
                            + simulationId
            );
        }

        StringBuilder csv =
                new StringBuilder();

        csv.append(
                "simulation_id,"
                        + "timestamp,"
                        + "node_id,"
                        + "x,"
                        + "y,"
                        + "speed,"
                        + "battery_level,"
                        + "cpu_usage,"
                        + "memory_usage,"
                        + "signal_strength,"
                        + "packet_loss,"
                        + "latency,"
                        + "active,"
                        + "faulty,"
                        + "fault_type,\n"
        );

        for (SimulationDatasetRecord record :
                records) {

            csv.append(
                    record.getSimulationId()
            ).append(",");

            csv.append(
                    record.getTimestamp()
            ).append(",");

            csv.append(
                    record.getNodeId()
            ).append(",");

            csv.append(
                    record.getX()
            ).append(",");

            csv.append(
                    record.getY()
            ).append(",");

            csv.append(
                    record.getSpeed()
            ).append(",");

            csv.append(
                    record.getBatteryLevel()
            ).append(",");

            csv.append(
                    record.getCpuUsage()
            ).append(",");

            csv.append(
                    record.getMemoryUsage()
            ).append(",");

            csv.append(
                    record.getSignalStrength()
            ).append(",");

            csv.append(
                    record.getPacketLoss()
            ).append(",");

            csv.append(
                    record.getLatency()
            ).append(",");

            csv.append(
                    record.isActive()
            ).append(",");

            csv.append(
                    record.isFaulty()
            ).append(",");

            csv.append(
                    record.getFaultType()
            ).append("\n");
        }

        return csv.toString();
    }
}