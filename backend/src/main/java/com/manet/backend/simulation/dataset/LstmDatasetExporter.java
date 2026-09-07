package com.manet.backend.simulation.dataset;

import com.manet.backend.entity.SimulationDatasetRecord;
import com.manet.backend.repository.SimulationDatasetRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LstmDatasetExporter {

    private final SimulationDatasetRecordRepository repository;


    public LstmDatasetExporter(
            SimulationDatasetRecordRepository repository
    ) {

        this.repository = repository;
    }

    // EXPORT LSTM CSV
    public String exportCsv(Long simulationId) {

        if (simulationId == null) {

            throw new IllegalArgumentException(
                    "Simulation ID cannot be null"
            );
        }

        // Get ONLY LINK records
        List<SimulationDatasetRecord> records =
                repository
                        .findBySimulationIdAndRecordTypeOrderByTimestampAsc(
                                simulationId,
                                "LINK"
                        );


        StringBuilder csv =
                new StringBuilder();
        // CSV HEADER
       csv.append(
                "simulation_id,"
                        + "timestamp,"
                        + "source_node_id,"
                        + "destination_node_id,"
                        + "rssi,"
                        + "packet_loss,"
                        + "latency,"
                        + "throughput,"
                        + "link_quality,"
                        + "node_distance,"
                        + "mobility_speed,"
                        + "link_active"
        );

        csv.append("\n");

        // CSV DATA
        for (SimulationDatasetRecord record : records) {

            if (record == null) {
                continue;
            }


            csv.append(
                    safe(record.getSimulationId())
            ).append(",");

            csv.append(
                    safe(record.getTimestamp())
            ).append(",");

            csv.append(
                    safe(record.getSourceNodeId())
            ).append(",");

            csv.append(
                    safe(record.getDestinationNodeId())
            ).append(",");

            csv.append(
                    safe(record.getSignalStrength())
            ).append(",");

            csv.append(
                    safe(record.getPacketLoss())
            ).append(",");

            csv.append(
                    safe(record.getLatency())
            ).append(",");

            csv.append(
                    safe(record.getThroughput())
            ).append(",");

            csv.append(
                    safe(record.getLinkQuality())
            ).append(",");

            csv.append(
                    safe(record.getNodeDistance())
            ).append(",");

            csv.append(
                    safe(record.getSpeed())
            ).append(",");

            csv.append(
                    safe(record.isLinkActive())
            ).append("\n");
        }


        return csv.toString();
    }

    // NUMBER OF LINK RECORDS
    public int getLinkRecordCount(
            Long simulationId
    ) {

        return repository
                .findBySimulationIdAndRecordTypeOrderByTimestampAsc(
                        simulationId,
                        "LINK"
                )
                .size();
    }

    // EMPTY DATA CHECK
    public boolean hasLinkData(
            Long simulationId
    ) {

        return getLinkRecordCount(
                simulationId
        ) > 0;
    }

    // SAFE CSV VALUE
    private String safe(Object value) {

        if (value == null) {
            return "";
        }

        return String.valueOf(value);
    }
}