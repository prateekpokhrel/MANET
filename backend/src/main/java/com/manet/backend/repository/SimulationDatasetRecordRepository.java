package com.manet.backend.repository;

import com.manet.backend.entity.SimulationDatasetRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationDatasetRecordRepository
        extends JpaRepository<SimulationDatasetRecord, Long> {

    List<SimulationDatasetRecord>
    findBySimulationIdOrderByTimestampAscNodeIdAsc(
            Long simulationId
    );

    List<SimulationDatasetRecord>
    findBySimulationIdAndRecordTypeOrderByTimestampAscNodeIdAsc(
            Long simulationId,
            String recordType
    );

    List<SimulationDatasetRecord>
    findBySimulationIdAndRecordTypeOrderByTimestampAsc(
            Long simulationId,
            String recordType
    );

    /*
     * Required by the LSTM integration.
     *
     * Gets the latest 4 historical records for the exact
     * source -> destination link.
     *
     * Spring Boot then adds the current in-memory link
     * state to make the required 5 timestep LSTM sequence.
     */
    List<SimulationDatasetRecord>
    findTop4BySimulationIdAndRecordTypeAndSourceNodeIdAndDestinationNodeIdOrderByTimestampDesc(
            Long simulationId,
            String recordType,
            Long sourceNodeId,
            Long destinationNodeId
    );

    long countBySimulationId(
            Long simulationId
    );

    void deleteBySimulationId(
            Long simulationId
    );
}