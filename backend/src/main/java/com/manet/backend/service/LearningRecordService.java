package com.manet.backend.service;

import com.manet.backend.entity.LearningRecord;
import com.manet.backend.repository.LearningRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningRecordService {

    private final LearningRecordRepository learningRecordRepository;

    public LearningRecordService(
            LearningRecordRepository learningRecordRepository) {
        this.learningRecordRepository = learningRecordRepository;
    }

    public LearningRecord createRecord(LearningRecord record) {
        return learningRecordRepository.save(record);
    }

    public List<LearningRecord> getAllRecords() {
        return learningRecordRepository.findAll();
    }

    public LearningRecord getRecordById(Long id) {
        return learningRecordRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Learning record not found: " + id));
    }

    public List<LearningRecord> getRecordsBySimulation(Long simulationId) {
        return learningRecordRepository.findBySimulationId(simulationId);
    }

    public List<LearningRecord> getRecordsByNode(Long nodeId) {
        return learningRecordRepository.findByNodeId(nodeId);
    }

    public List<LearningRecord> getCorrectPredictions() {
        return learningRecordRepository.findByPredictionCorrect(true);
    }

    public List<LearningRecord> getIncorrectPredictions() {
        return learningRecordRepository.findByPredictionCorrect(false);
    }
}