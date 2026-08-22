package com.manet.backend.service;

import com.manet.backend.entity.RouteChange;
import com.manet.backend.repository.RouteChangeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteChangeService {

    private final RouteChangeRepository routeChangeRepository;

    public RouteChangeService(RouteChangeRepository routeChangeRepository) {
        this.routeChangeRepository = routeChangeRepository;
    }

    public RouteChange createRouteChange(RouteChange routeChange) {
        return routeChangeRepository.save(routeChange);
    }

    public List<RouteChange> getAllRouteChanges() {
        return routeChangeRepository.findAll();
    }

    public RouteChange getRouteChangeById(Long id) {
        return routeChangeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Route change not found: " + id));
    }

    public List<RouteChange> getChangesBySimulation(Long simulationId) {
        return routeChangeRepository.findBySimulationId(simulationId);
    }

    public List<RouteChange> getChangesByTrafficFlow(Long trafficFlowId) {
        return routeChangeRepository.findByTrafficFlowId(trafficFlowId);
    }
}