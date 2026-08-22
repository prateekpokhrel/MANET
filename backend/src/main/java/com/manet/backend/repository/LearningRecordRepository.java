package com.manet.backend.repository;

import com.manet.backend.entity.LearningRecord;
import com.manet.backend.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningRecordRepository extends JpaRepository<LearningRecord, Long> {

    List<LearningRecord> findBySimulation(Simulation simulation);

    List<LearningRecord> findBySimulationId(Long simulationId);

    List<LearningRecord> findByNodeId(Long nodeId);

    List<LearningRecord> findByPredictionCorrect(Boolean predictionCorrect);
}