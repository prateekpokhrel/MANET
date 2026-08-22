package com.manet.backend.repository;

import com.manet.backend.entity.Alert;
import com.manet.backend.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findBySimulation(Simulation simulation);

    List<Alert> findBySimulationId(Long simulationId);

    List<Alert> findByNodeId(Long nodeId);

    List<Alert> findByAcknowledgedFalse();
}