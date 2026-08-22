package com.manet.backend.service;

import com.manet.backend.entity.TrafficFlow;
import com.manet.backend.repository.TrafficFlowRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrafficFlowService {

    private final TrafficFlowRepository trafficFlowRepository;

    public TrafficFlowService(TrafficFlowRepository trafficFlowRepository) {
        this.trafficFlowRepository = trafficFlowRepository;
    }

    public TrafficFlow createTrafficFlow(TrafficFlow trafficFlow) {
        return trafficFlowRepository.save(trafficFlow);
    }

    public List<TrafficFlow> getAllTrafficFlows() {
        return trafficFlowRepository.findAll();
    }

    public TrafficFlow getTrafficFlowById(Long id) {
        return trafficFlowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Traffic flow not found: " + id));
    }

    public List<TrafficFlow> getTrafficFlowsBySimulation(Long simulationId) {
        return trafficFlowRepository.findBySimulationId(simulationId);
    }

    public TrafficFlow updateTrafficFlow(Long id, TrafficFlow updatedFlow) {
        TrafficFlow flow = getTrafficFlowById(id);

        flow.setTrafficType(updatedFlow.getTrafficType());
        flow.setPacketSize(updatedFlow.getPacketSize());
        flow.setPacketsPerSecond(updatedFlow.getPacketsPerSecond());
        flow.setDataRate(updatedFlow.getDataRate());
        flow.setStatus(updatedFlow.getStatus());

        return trafficFlowRepository.save(flow);
    }

    public void deleteTrafficFlow(Long id) {
        TrafficFlow flow = getTrafficFlowById(id);
        trafficFlowRepository.delete(flow);
    }
}