package com.manet.backend.repository;

import com.manet.backend.entity.AiAnalysisRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiAnalysisRecordRepository
        extends JpaRepository<AiAnalysisRecord, Long> {

    List<AiAnalysisRecord>
    findBySimulationIdOrderBySimulationTimestampAscNodeIdAsc(
            Long simulationId
    );

    List<AiAnalysisRecord>
    findBySimulationIdOrderBySimulationTimestampDescNodeIdAsc(
            Long simulationId
    );

    List<AiAnalysisRecord>
    findBySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
            Long simulationId,
            Long nodeId
    );

    AiAnalysisRecord
    findTop1BySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
            Long simulationId,
            Long nodeId
    );

    long countBySimulationId(
            Long simulationId
    );

    void deleteBySimulationId(
            Long simulationId
    );
}