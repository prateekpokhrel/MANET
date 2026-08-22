package com.manet.backend.service;

import com.manet.backend.entity.Fault;
import com.manet.backend.repository.FaultRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FaultService {

    private final FaultRepository faultRepository;

    public FaultService(FaultRepository faultRepository) {
        this.faultRepository = faultRepository;
    }

    public Fault createFault(Fault fault) {
        return faultRepository.save(fault);
    }

    public List<Fault> getAllFaults() {
        return faultRepository.findAll();
    }

    public Fault getFaultById(Long id) {
        return faultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fault not found: " + id));
    }

    public List<Fault> getFaultsBySimulation(Long simulationId) {
        return faultRepository.findBySimulationId(simulationId);
    }

    public List<Fault> getFaultsByNode(Long nodeId) {
        return faultRepository.findByNodeId(nodeId);
    }

    public List<Fault> getFaultsByStatus(String status) {
        return faultRepository.findByStatus(status);
    }

    public Fault updateFault(Long id, Fault updatedFault) {
        Fault fault = getFaultById(id);

        fault.setFaultType(updatedFault.getFaultType());
        fault.setSeverity(updatedFault.getSeverity());
        fault.setDescription(updatedFault.getDescription());
        fault.setStatus(updatedFault.getStatus());
        fault.setResolvedAt(updatedFault.getResolvedAt());

        return faultRepository.save(fault);
    }
}