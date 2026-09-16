package com.manet.backend.service;

import com.manet.backend.entity.IsolationForestDatasetRecord;
import com.manet.backend.repository.IsolationForestDatasetRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class IsolationForestDatasetExportService {

    private final IsolationForestDatasetRecordRepository repository;


    public IsolationForestDatasetExportService(
            IsolationForestDatasetRecordRepository repository
    ) {
        this.repository = repository;
    }


    // =========================================================
    // EXPORT DATASET AS CSV
    // =========================================================

    @Transactional(readOnly = true)
    public String exportNormalNetworkBehaviorDataset(
            Long simulationId
    ) {

        if (simulationId == null) {

            throw new IllegalArgumentException(
                    "Simulation ID is required"
            );
        }


        List<IsolationForestDatasetRecord> records =
                repository
                        .findBySimulationIdOrderByTimestampAscNodeIdAsc(
                                simulationId
                        );


        StringBuilder csv =
                new StringBuilder();


        // =====================================================
        // CSV HEADER
        // =====================================================

        csv.append(
                "simulation_id,"
                        + "timestamp,"
                        + "node_id,"
                        + "cpu,"
                        + "memory,"
                        + "battery,"
                        + "rssi,"
                        + "packet_loss,"
                        + "latency,"
                        + "throughput,"
                        + "queue_size,"
                        + "traffic_load,"
                        + "link_quality,"
                        + "mobility_speed"
        );

        csv.append('\n');


        // =====================================================
        // CSV DATA
        // =====================================================

        for (IsolationForestDatasetRecord record :
                records) {

            csv.append(
                    record.getSimulationId()
            );

            csv.append(',');

            csv.append(
                    record.getTimestamp()
            );

            csv.append(',');

            csv.append(
                    record.getNodeId()
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getCpuUsage()
                    )
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getMemoryUsage()
                    )
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getBatteryLevel()
                    )
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getRssi()
                    )
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getPacketLoss()
                    )
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getLatency()
                    )
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getThroughput()
                    )
            );

            csv.append(',');

            csv.append(
                    record.getQueueSize()
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getTrafficLoad()
                    )
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getLinkQuality()
                    )
            );

            csv.append(',');

            csv.append(
                    formatDouble(
                            record.getMobilitySpeed()
                    )
            );

            csv.append('\n');
        }


        return csv.toString();
    }


    // =========================================================
    // DATASET STATISTICS
    // =========================================================

    @Transactional(readOnly = true)
    public long getRecordCount(
            Long simulationId
    ) {

        if (simulationId == null) {

            throw new IllegalArgumentException(
                    "Simulation ID is required"
            );
        }


        return repository.countBySimulationId(
                simulationId
        );
    }


    // =========================================================
    // CHECK DATASET AVAILABILITY
    // =========================================================

    @Transactional(readOnly = true)
    public boolean hasDataset(
            Long simulationId
    ) {

        return getRecordCount(
                simulationId
        ) > 0;
    }


    // =========================================================
    // FORMAT DOUBLE
    // =========================================================

    private String formatDouble(
            double value
    ) {

        if (Double.isNaN(value)
                || Double.isInfinite(value)) {

            return "0.0";
        }


        return String.format(
                Locale.US,
                "%.6f",
                value
        );
    }
}