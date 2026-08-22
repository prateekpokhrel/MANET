package com.manet.backend.controller;

import com.manet.backend.entity.Fault;
import com.manet.backend.service.FaultService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faults")
public class FaultController {

    private final FaultService faultService;

    public FaultController(FaultService faultService) {
        this.faultService = faultService;
    }

    @PostMapping
    public ResponseEntity<Fault> createFault(
            @RequestBody Fault fault) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(faultService.createFault(fault));
    }

    @GetMapping
    public ResponseEntity<List<Fault>> getAllFaults() {
        return ResponseEntity.ok(faultService.getAllFaults());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fault> getFaultById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                faultService.getFaultById(id)
        );
    }

    @GetMapping("/simulation/{simulationId}")
    public ResponseEntity<List<Fault>> getFaultsBySimulation(
            @PathVariable Long simulationId) {

        return ResponseEntity.ok(
                faultService.getFaultsBySimulation(simulationId)
        );
    }

    @GetMapping("/node/{nodeId}")
    public ResponseEntity<List<Fault>> getFaultsByNode(
            @PathVariable Long nodeId) {

        return ResponseEntity.ok(
                faultService.getFaultsByNode(nodeId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Fault>> getFaultsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                faultService.getFaultsByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fault> updateFault(
            @PathVariable Long id,
            @RequestBody Fault fault) {

        return ResponseEntity.ok(
                faultService.updateFault(id, fault)
        );
    }
}