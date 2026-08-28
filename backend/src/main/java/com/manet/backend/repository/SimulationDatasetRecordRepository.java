package com.manet.backend.repository;

import com.manet.backend.entity.SimulationDatasetRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationDatasetRecordRepository
        extends JpaRepository<SimulationDatasetRecord, Long> {

    List<SimulationDatasetRecord> findBySimulationIdOrderByTimestampAscNodeIdAsc(
            Long simulationId
    );

    long countBySimulationId(
            Long simulationId
    );

    void deleteBySimulationId(
            Long simulationId
    );
}