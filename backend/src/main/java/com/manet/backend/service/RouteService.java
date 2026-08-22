package com.manet.backend.service;

import com.manet.backend.entity.Route;
import com.manet.backend.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public Route createRoute(Route route) {
        return routeRepository.save(route);
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Route getRouteById(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found: " + id));
    }

    public List<Route> getRoutesBySimulation(Long simulationId) {
        return routeRepository.findBySimulationId(simulationId);
    }

    public List<Route> findRoutesBetweenNodes(
            Long sourceNodeId,
            Long destinationNodeId) {

        return routeRepository
                .findBySourceNodeIdAndDestinationNodeId(
                        sourceNodeId,
                        destinationNodeId
                );
    }

    public List<Route> getActiveRoutes() {
        return routeRepository.findByStatus("ACTIVE");
    }

    public Route updateRoute(Long id, Route updatedRoute) {
        Route route = getRouteById(id);

        route.setPath(updatedRoute.getPath());
        route.setCost(updatedRoute.getCost());
        route.setLatency(updatedRoute.getLatency());
        route.setStatus(updatedRoute.getStatus());

        return routeRepository.save(route);
    }
}