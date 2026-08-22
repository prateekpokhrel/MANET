package com.manet.backend.controller;

import com.manet.backend.entity.HealthAssessment;
import com.manet.backend.service.HealthAssessmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health")
public class HealthAssessmentController {

    private final HealthAssessmentService healthAssessmentService;

    public HealthAssessmentController(
            HealthAssessmentService healthAssessmentService) {
        this.healthAssessmentService = healthAssessmentService;
    }

    @PostMapping
    public ResponseEntity<HealthAssessment> createAssessment(
            @RequestBody HealthAssessment assessment) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(healthAssessmentService.createAssessment(assessment));
    }

    @GetMapping
    public ResponseEntity<List<HealthAssessment>> getAllAssessments() {
        return ResponseEntity.ok(
                healthAssessmentService.getAllAssessments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthAssessment> getAssessmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                healthAssessmentService.getAssessmentById(id)
        );
    }

    @GetMapping("/node/{nodeId}")
    public ResponseEntity<List<HealthAssessment>> getNodeHealthHistory(
            @PathVariable Long nodeId) {

        return ResponseEntity.ok(
                healthAssessmentService.getNodeHealthHistory(nodeId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<HealthAssessment>> getAssessmentsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                healthAssessmentService.getAssessmentsByStatus(status)
        );
    }
}