package com.manet.backend.controller;

import com.manet.backend.entity.LearningRecord;
import com.manet.backend.service.LearningRecordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning")
public class LearningRecordController {

    private final LearningRecordService learningRecordService;

    public LearningRecordController(
            LearningRecordService learningRecordService) {
        this.learningRecordService = learningRecordService;
    }

    @PostMapping
    public ResponseEntity<LearningRecord> createRecord(
            @RequestBody LearningRecord record) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(learningRecordService.createRecord(record));
    }

    @GetMapping
    public ResponseEntity<List<LearningRecord>> getAllRecords() {
        return ResponseEntity.ok(
                learningRecordService.getAllRecords()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningRecord> getRecordById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                learningRecordService.getRecordById(id)
        );
    }

    @GetMapping("/simulation/{simulationId}")
    public ResponseEntity<List<LearningRecord>> getRecordsBySimulation(
            @PathVariable Long simulationId) {

        return ResponseEntity.ok(
                learningRecordService.getRecordsBySimulation(simulationId)
        );
    }

    @GetMapping("/node/{nodeId}")
    public ResponseEntity<List<LearningRecord>> getRecordsByNode(
            @PathVariable Long nodeId) {

        return ResponseEntity.ok(
                learningRecordService.getRecordsByNode(nodeId)
        );
    }

    @GetMapping("/predictions/correct")
    public ResponseEntity<List<LearningRecord>> getCorrectPredictions() {
        return ResponseEntity.ok(
                learningRecordService.getCorrectPredictions()
        );
    }

    @GetMapping("/predictions/incorrect")
    public ResponseEntity<List<LearningRecord>> getIncorrectPredictions() {
        return ResponseEntity.ok(
                learningRecordService.getIncorrectPredictions()
        );
    }
}