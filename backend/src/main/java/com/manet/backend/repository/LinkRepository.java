package com.manet.backend.repository;

import com.manet.backend.entity.Link;
import com.manet.backend.entity.Simulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LinkRepository extends JpaRepository<Link, Long> {

    List<Link> findBySimulation(Simulation simulation);

    List<Link> findBySimulationId(Long simulationId);
}