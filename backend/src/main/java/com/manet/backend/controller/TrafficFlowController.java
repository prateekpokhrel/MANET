package com.manet.backend.controller;

import com.manet.backend.entity.TrafficFlow;
import com.manet.backend.service.TrafficFlowService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traffic")
public class TrafficFlowController {

    private final TrafficFlowService trafficFlowService;

    public TrafficFlowController(TrafficFlowService trafficFlowService) {
        this.trafficFlowService = trafficFlowService;
    }

    @PostMapping
    public ResponseEntity<TrafficFlow> createTrafficFlow(
            @RequestBody TrafficFlow trafficFlow) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(trafficFlowService.createTrafficFlow(trafficFlow));
    }

    @GetMapping
    public ResponseEntity<List<TrafficFlow>> getAllTrafficFlows() {
        return ResponseEntity.ok(
                trafficFlowService.getAllTrafficFlows()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrafficFlow> getTrafficFlowById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                trafficFlowService.getTrafficFlowById(id)
        );
    }

    @GetMapping("/simulation/{simulationId}")
    public ResponseEntity<List<TrafficFlow>> getTrafficFlowsBySimulation(
            @PathVariable Long simulationId) {

        return ResponseEntity.ok(
                trafficFlowService.getTrafficFlowsBySimulation(simulationId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrafficFlow> updateTrafficFlow(
            @PathVariable Long id,
            @RequestBody TrafficFlow trafficFlow) {

        return ResponseEntity.ok(
                trafficFlowService.updateTrafficFlow(id, trafficFlow)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrafficFlow(
            @PathVariable Long id) {

        trafficFlowService.deleteTrafficFlow(id);

        return ResponseEntity.noContent().build();
    }
}