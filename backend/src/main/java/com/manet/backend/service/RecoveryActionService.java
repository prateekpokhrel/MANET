package com.manet.backend.service;

import com.manet.backend.entity.RecoveryAction;
import com.manet.backend.repository.RecoveryActionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecoveryActionService {

    private final RecoveryActionRepository recoveryActionRepository;

    public RecoveryActionService(RecoveryActionRepository recoveryActionRepository) {
        this.recoveryActionRepository = recoveryActionRepository;
    }

    public RecoveryAction createAction(RecoveryAction action) {
        return recoveryActionRepository.save(action);
    }

    public List<RecoveryAction> getAllActions() {
        return recoveryActionRepository.findAll();
    }

    public RecoveryAction getActionById(Long id) {
        return recoveryActionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recovery action not found: " + id));
    }

    public List<RecoveryAction> getActionsByFault(Long faultId) {
        return recoveryActionRepository.findByFaultId(faultId);
    }

    public List<RecoveryAction> getActionsByNode(Long nodeId) {
        return recoveryActionRepository.findByNodeId(nodeId);
    }

    public List<RecoveryAction> getActionsByStatus(String status) {
        return recoveryActionRepository.findByStatus(status);
    }

    public RecoveryAction updateAction(Long id, RecoveryAction updatedAction) {
        RecoveryAction action = getActionById(id);

        action.setActionType(updatedAction.getActionType());
        action.setInitiatedBy(updatedAction.getInitiatedBy());
        action.setStatus(updatedAction.getStatus());
        action.setDescription(updatedAction.getDescription());
        action.setStartedAt(updatedAction.getStartedAt());
        action.setCompletedAt(updatedAction.getCompletedAt());

        return recoveryActionRepository.save(action);
    }
}