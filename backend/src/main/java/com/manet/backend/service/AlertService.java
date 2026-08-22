package com.manet.backend.service;

import com.manet.backend.entity.Alert;
import com.manet.backend.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public Alert createAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Alert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + id));
    }

    public List<Alert> getAlertsBySimulation(Long simulationId) {
        return alertRepository.findBySimulationId(simulationId);
    }

    public List<Alert> getAlertsByNode(Long nodeId) {
        return alertRepository.findByNodeId(nodeId);
    }

    public List<Alert> getUnacknowledgedAlerts() {
        return alertRepository.findByAcknowledgedFalse();
    }

    public Alert acknowledgeAlert(Long id) {
        Alert alert = getAlertById(id);
        alert.setAcknowledged(true);
        return alertRepository.save(alert);
    }
}