package com.manet.backend.service;

import com.manet.backend.entity.HealthAssessment;
import com.manet.backend.repository.HealthAssessmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HealthAssessmentService {

    private final HealthAssessmentRepository healthAssessmentRepository;

    public HealthAssessmentService(
            HealthAssessmentRepository healthAssessmentRepository) {
        this.healthAssessmentRepository = healthAssessmentRepository;
    }

    public HealthAssessment createAssessment(HealthAssessment assessment) {
        return healthAssessmentRepository.save(assessment);
    }

    public List<HealthAssessment> getAllAssessments() {
        return healthAssessmentRepository.findAll();
    }

    public HealthAssessment getAssessmentById(Long id) {
        return healthAssessmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Health assessment not found: " + id));
    }

    public List<HealthAssessment> getNodeHealthHistory(Long nodeId) {
        return healthAssessmentRepository
                .findByNodeIdOrderByAssessedAtDesc(nodeId);
    }

    public List<HealthAssessment> getAssessmentsByStatus(String status) {
        return healthAssessmentRepository.findByStatus(status);
    }
}