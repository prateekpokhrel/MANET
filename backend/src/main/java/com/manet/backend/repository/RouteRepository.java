package com.manet.backend.repository;

import com.manet.backend.entity.Route;
import com.manet.backend.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    List<Route> findBySimulation(Simulation simulation);

    List<Route> findBySimulationId(Long simulationId);

    List<Route> findBySourceNodeIdAndDestinationNodeId(
            Long sourceNodeId,
            Long destinationNodeId
    );

    List<Route> findByStatus(String status);
}