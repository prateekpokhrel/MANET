package com.manet.backend.controller;

import com.manet.backend.entity.FaultPrediction;
import com.manet.backend.service.FaultPredictionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
public class FaultPredictionController {

    private final FaultPredictionService faultPredictionService;

    public FaultPredictionController(
            FaultPredictionService faultPredictionService) {
        this.faultPredictionService = faultPredictionService;
    }

    @PostMapping
    public ResponseEntity<FaultPrediction> savePrediction(
            @RequestBody FaultPrediction prediction) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(faultPredictionService.savePrediction(prediction));
    }

    @GetMapping
    public ResponseEntity<List<FaultPrediction>> getAllPredictions() {
        return ResponseEntity.ok(
                faultPredictionService.getAllPredictions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaultPrediction> getPredictionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                faultPredictionService.getPredictionById(id)
        );
    }

    @GetMapping("/node/{nodeId}")
    public ResponseEntity<List<FaultPrediction>> getNodePredictions(
            @PathVariable Long nodeId) {

        return ResponseEntity.ok(
                faultPredictionService.getNodePredictions(nodeId)
        );
    }

    @GetMapping("/risk/high")
    public ResponseEntity<List<FaultPrediction>> getHighRiskPredictions() {
        return ResponseEntity.ok(
                faultPredictionService.getHighRiskPredictions()
        );
    }
}