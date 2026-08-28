package com.manet.backend.controller;

import com.manet.backend.entity.Simulation;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulationParameters;
import com.manet.backend.service.SimulationService;
import com.manet.backend.simulation.fault.FaultScenarioParameters;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.manet.backend.service.SimulationDatasetExportService;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/simulations")
public class SimulationController {
    private final SimulationDatasetExportService datasetExportService;
    private final SimulationService simulationService;


    public SimulationController(
            SimulationService simulationService,
            SimulationDatasetExportService datasetExportService
    ) {
        this.simulationService =
                simulationService;

        this.datasetExportService =
                datasetExportService;
    }

    @PostMapping
    public ResponseEntity<Simulation> createSimulation(
            @RequestBody Simulation simulation
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        simulationService.createSimulation(
                                simulation
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<Simulation>> getAllSimulations() {

        return ResponseEntity.ok(
                simulationService.getAllSimulations()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Simulation> getSimulationById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                simulationService.getSimulationById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Simulation> updateSimulation(
            @PathVariable Long id,
            @RequestBody Simulation simulation
    ) {

        return ResponseEntity.ok(
                simulationService.updateSimulation(
                        id,
                        simulation
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSimulation(
            @PathVariable Long id
    ) {

        simulationService.deleteSimulation(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<NetworkState> startSimulation(
            @PathVariable Long id,
            @RequestBody SimulationParameters parameters
    ) {

        return ResponseEntity.ok(
                simulationService.startSimulation(
                        id,
                        parameters
                )
        );
    }
    @GetMapping("/{id}/dataset/stats")
    public ResponseEntity<Map<String, Object>> getDatasetStats(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                simulationService.getDatasetStats(id)
        );
    }

    @GetMapping(
            value = "/{id}/dataset/csv",
            produces = "text/csv"
    )
    public ResponseEntity<String> exportNodeHealthDataset(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                datasetExportService
                        .exportNodeHealthDataset(id)
        );
    }

    @PostMapping("/{id}/step")
    public ResponseEntity<NetworkState> stepSimulation(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                simulationService.stepSimulation(id)
        );
    }

    @GetMapping("/{id}/state")
    public ResponseEntity<NetworkState> getSimulationState(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                simulationService.getSimulationState(id)
        );
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<Void> stopSimulation(
            @PathVariable Long id
    ) {

        simulationService.stopSimulation(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset")
    public ResponseEntity<Void> resetSimulation(
            @PathVariable Long id
    ) {

        simulationService.resetSimulation(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/fault-scenario")
    public ResponseEntity<Void> configureFaultScenario(
            @PathVariable Long id,
            @RequestBody FaultScenarioParameters parameters
    ) {

        simulationService.configureFaultScenario(
                id,
                parameters
        );

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/fault-scenario")
    public ResponseEntity<Void> clearFaultScenario(
            @PathVariable Long id
    ) {

        simulationService.clearFaultScenario(id);

        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(
            IllegalStateException exception
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        exception.getMessage()
                );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(
            IllegalArgumentException exception
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        exception.getMessage()
                );
    }
}