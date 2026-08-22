package com.manet.backend.repository;

import com.manet.backend.entity.Node;
import com.manet.backend.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<Node, Long> {

    List<Node> findBySimulation(Simulation simulation);

    List<Node> findBySimulationId(Long simulationId);
}