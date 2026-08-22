package com.manet.backend.controller;

import com.manet.backend.entity.Alert;
import com.manet.backend.service.AlertService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(
            @RequestBody Alert alert) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(alertService.createAlert(alert));
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(
                alertService.getAllAlerts()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlertById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                alertService.getAlertById(id)
        );
    }

    @GetMapping("/simulation/{simulationId}")
    public ResponseEntity<List<Alert>> getAlertsBySimulation(
            @PathVariable Long simulationId) {

        return ResponseEntity.ok(
                alertService.getAlertsBySimulation(simulationId)
        );
    }

    @GetMapping("/node/{nodeId}")
    public ResponseEntity<List<Alert>> getAlertsByNode(
            @PathVariable Long nodeId) {

        return ResponseEntity.ok(
                alertService.getAlertsByNode(nodeId)
        );
    }

    @GetMapping("/unacknowledged")
    public ResponseEntity<List<Alert>> getUnacknowledgedAlerts() {
        return ResponseEntity.ok(
                alertService.getUnacknowledgedAlerts()
        );
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                alertService.acknowledgeAlert(id)
        );
    }
}