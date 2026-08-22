package com.manet.backend.service;

import com.manet.backend.entity.Simulation;
import com.manet.backend.repository.SimulationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SimulationService {

    private final SimulationRepository simulationRepository;

    public SimulationService(SimulationRepository simulationRepository) {
        this.simulationRepository = simulationRepository;
    }

    public Simulation createSimulation(Simulation simulation) {
        return simulationRepository.save(simulation);
    }

    public List<Simulation> getAllSimulations() {
        return simulationRepository.findAll();
    }

    public Simulation getSimulationById(Long id) {
        return simulationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Simulation not found: " + id));
    }

    public Simulation updateSimulation(Long id, Simulation updatedSimulation) {
        Simulation simulation = getSimulationById(id);

        simulation.setName(updatedSimulation.getName());
        simulation.setDescription(updatedSimulation.getDescription());
        simulation.setStatus(updatedSimulation.getStatus());

        return simulationRepository.save(simulation);
    }

    public void deleteSimulation(Long id) {
        Simulation simulation = getSimulationById(id);
        simulationRepository.delete(simulation);
    }
}