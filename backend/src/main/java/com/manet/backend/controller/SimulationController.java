package com.manet.backend.controller;

import com.manet.backend.entity.Simulation;
import com.manet.backend.service.SimulationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulations")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping
    public ResponseEntity<Simulation> createSimulation(
            @RequestBody Simulation simulation) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(simulationService.createSimulation(simulation));
    }

    @GetMapping
    public ResponseEntity<List<Simulation>> getAllSimulations() {
        return ResponseEntity.ok(simulationService.getAllSimulations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Simulation> getSimulationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                simulationService.getSimulationById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Simulation> updateSimulation(
            @PathVariable Long id,
            @RequestBody Simulation simulation) {

        return ResponseEntity.ok(
                simulationService.updateSimulation(id, simulation)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSimulation(
            @PathVariable Long id) {

        simulationService.deleteSimulation(id);

        return ResponseEntity.noContent().build();
    }
}