package com.manet.backend.repository;

import com.manet.backend.entity.SimulationDatasetRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationDatasetRecordRepository
        extends JpaRepository<SimulationDatasetRecord, Long> {

    // ALL RECORDS
   List<SimulationDatasetRecord>
    findBySimulationIdOrderByTimestampAscNodeIdAsc(
            Long simulationId
    );

    // NODE RECORDS
    // Used by Random Forest / XGBoost / Isolation Forest
   List<SimulationDatasetRecord>
    findBySimulationIdAndRecordTypeOrderByTimestampAscNodeIdAsc(
            Long simulationId,
            String recordType
    );

    // LINK RECORDS
    // Used by LSTM
   List<SimulationDatasetRecord>
    findBySimulationIdAndRecordTypeOrderByTimestampAsc(
            Long simulationId,
            String recordType
    );

    // COUNT
   long countBySimulationId(
            Long simulationId
    );

    // DELETE

    void deleteBySimulationId(
            Long simulationId
    );
}