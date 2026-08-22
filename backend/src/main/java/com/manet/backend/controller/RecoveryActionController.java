package com.manet.backend.controller;

import com.manet.backend.entity.RecoveryAction;
import com.manet.backend.service.RecoveryActionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recovery")
public class RecoveryActionController {

    private final RecoveryActionService recoveryActionService;

    public RecoveryActionController(
            RecoveryActionService recoveryActionService) {
        this.recoveryActionService = recoveryActionService;
    }

    @PostMapping
    public ResponseEntity<RecoveryAction> createAction(
            @RequestBody RecoveryAction action) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(recoveryActionService.createAction(action));
    }

    @GetMapping
    public ResponseEntity<List<RecoveryAction>> getAllActions() {
        return ResponseEntity.ok(
                recoveryActionService.getAllActions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecoveryAction> getActionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                recoveryActionService.getActionById(id)
        );
    }

    @GetMapping("/fault/{faultId}")
    public ResponseEntity<List<RecoveryAction>> getActionsByFault(
            @PathVariable Long faultId) {

        return ResponseEntity.ok(
                recoveryActionService.getActionsByFault(faultId)
        );
    }

    @GetMapping("/node/{nodeId}")
    public ResponseEntity<List<RecoveryAction>> getActionsByNode(
            @PathVariable Long nodeId) {

        return ResponseEntity.ok(
                recoveryActionService.getActionsByNode(nodeId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<RecoveryAction>> getActionsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                recoveryActionService.getActionsByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecoveryAction> updateAction(
            @PathVariable Long id,
            @RequestBody RecoveryAction action) {

        return ResponseEntity.ok(
                recoveryActionService.updateAction(id, action)
        );
    }
}