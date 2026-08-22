package com.manet.backend.service;

import com.manet.backend.entity.FaultPrediction;
import com.manet.backend.repository.FaultPredictionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FaultPredictionService {

    private final FaultPredictionRepository faultPredictionRepository;

    public FaultPredictionService(FaultPredictionRepository faultPredictionRepository) {
        this.faultPredictionRepository = faultPredictionRepository;
    }

    public FaultPrediction savePrediction(FaultPrediction prediction) {
        return faultPredictionRepository.save(prediction);
    }

    public List<FaultPrediction> getAllPredictions() {
        return faultPredictionRepository.findAll();
    }

    public FaultPrediction getPredictionById(Long id) {
        return faultPredictionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prediction not found: " + id));
    }

    public List<FaultPrediction> getNodePredictions(Long nodeId) {
        return faultPredictionRepository.findByNodeIdOrderByPredictedAtDesc(nodeId);
    }

    public List<FaultPrediction> getHighRiskPredictions() {
        return faultPredictionRepository.findByRiskLevel("HIGH");
    }
}