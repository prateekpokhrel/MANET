package com.manet.backend.repository;

import com.manet.backend.entity.Fault;
import com.manet.backend.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaultRepository extends JpaRepository<Fault, Long> {

    List<Fault> findBySimulation(Simulation simulation);

    List<Fault> findBySimulationId(Long simulationId);

    List<Fault> findByNodeId(Long nodeId);

    List<Fault> findByStatus(String status);
}