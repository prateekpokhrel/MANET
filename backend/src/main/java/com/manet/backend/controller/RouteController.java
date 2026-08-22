package com.manet.backend.controller;

import com.manet.backend.entity.Route;
import com.manet.backend.service.RouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping
    public ResponseEntity<Route> createRoute(
            @RequestBody Route route) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(routeService.createRoute(route));
    }

    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                routeService.getRouteById(id)
        );
    }

    @GetMapping("/simulation/{simulationId}")
    public ResponseEntity<List<Route>> getRoutesBySimulation(
            @PathVariable Long simulationId) {

        return ResponseEntity.ok(
                routeService.getRoutesBySimulation(simulationId)
        );
    }

    @GetMapping("/between")
    public ResponseEntity<List<Route>> findRoutesBetweenNodes(
            @RequestParam Long sourceNodeId,
            @RequestParam Long destinationNodeId) {

        return ResponseEntity.ok(
                routeService.findRoutesBetweenNodes(
                        sourceNodeId,
                        destinationNodeId
                )
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<Route>> getActiveRoutes() {
        return ResponseEntity.ok(
                routeService.getActiveRoutes()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Route> updateRoute(
            @PathVariable Long id,
            @RequestBody Route route) {

        return ResponseEntity.ok(
                routeService.updateRoute(id, route)
        );
    }
}