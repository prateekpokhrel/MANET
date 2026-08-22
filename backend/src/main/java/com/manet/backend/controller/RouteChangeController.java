package com.manet.backend.controller;

import com.manet.backend.entity.RouteChange;
import com.manet.backend.service.RouteChangeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route-changes")
public class RouteChangeController {

    private final RouteChangeService routeChangeService;

    public RouteChangeController(RouteChangeService routeChangeService) {
        this.routeChangeService = routeChangeService;
    }

    @PostMapping
    public ResponseEntity<RouteChange> createRouteChange(
            @RequestBody RouteChange routeChange) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(routeChangeService.createRouteChange(routeChange));
    }

    @GetMapping
    public ResponseEntity<List<RouteChange>> getAllRouteChanges() {
        return ResponseEntity.ok(
                routeChangeService.getAllRouteChanges()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteChange> getRouteChangeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                routeChangeService.getRouteChangeById(id)
        );
    }

    @GetMapping("/simulation/{simulationId}")
    public ResponseEntity<List<RouteChange>> getChangesBySimulation(
            @PathVariable Long simulationId) {

        return ResponseEntity.ok(
                routeChangeService.getChangesBySimulation(simulationId)
        );
    }

    @GetMapping("/traffic/{trafficFlowId}")
    public ResponseEntity<List<RouteChange>> getChangesByTrafficFlow(
            @PathVariable Long trafficFlowId) {

        return ResponseEntity.ok(
                routeChangeService.getChangesByTrafficFlow(trafficFlowId)
        );
    }
}