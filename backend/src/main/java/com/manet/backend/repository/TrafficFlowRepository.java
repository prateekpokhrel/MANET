package com.manet.backend.repository;

import com.manet.backend.entity.TrafficFlow;
import com.manet.backend.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrafficFlowRepository extends JpaRepository<TrafficFlow, Long> {

    List<TrafficFlow> findBySimulation(Simulation simulation);

    List<TrafficFlow> findBySimulationId(Long simulationId);
}