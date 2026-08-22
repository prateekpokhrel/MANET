package com.manet.backend.repository;

import com.manet.backend.entity.RouteChange;
import com.manet.backend.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteChangeRepository extends JpaRepository<RouteChange, Long> {

    List<RouteChange> findBySimulation(Simulation simulation);

    List<RouteChange> findBySimulationId(Long simulationId);

    List<RouteChange> findByTrafficFlowId(Long trafficFlowId);
}