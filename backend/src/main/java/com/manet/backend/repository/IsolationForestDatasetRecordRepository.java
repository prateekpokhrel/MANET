package com.manet.backend.repository;

import com.manet.backend.entity.IsolationForestDatasetRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IsolationForestDatasetRecordRepository
        extends JpaRepository<IsolationForestDatasetRecord, Long> {

    List<IsolationForestDatasetRecord>
    findBySimulationIdOrderByTimestampAscNodeIdAsc(
            Long simulationId
    );

    long countBySimulationId(
            Long simulationId
    );

    void deleteBySimulationId(
            Long simulationId
    );
}