package com.manet.backend.repository;

import com.manet.backend.entity.AiRecoveryExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiRecoveryExecutionRepository
        extends JpaRepository<AiRecoveryExecution, Long> {

    List<AiRecoveryExecution>
    findBySimulationIdOrderBySimulationTimestampDesc(
            Long simulationId
    );

    List<AiRecoveryExecution>
    findBySimulationIdOrderBySimulationTimestampDescNodeIdAsc(
            Long simulationId
    );

    List<AiRecoveryExecution>
    findBySimulationIdAndNodeIdOrderBySimulationTimestampDesc(
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