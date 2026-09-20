package com.manet.backend.controller;

import com.manet.backend.ai.dto.AiNodeAnalysis;
import com.manet.backend.ai.service.AiOrchestratorService;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin
public class AiController {

    private final AiOrchestratorService aiOrchestratorService;
    private final SimulationService simulationService;

    public AiController(
            AiOrchestratorService aiOrchestratorService,
            SimulationService simulationService
    ) {
        this.aiOrchestratorService = aiOrchestratorService;
        this.simulationService = simulationService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {

        return ResponseEntity.ok(
                aiOrchestratorService.health()
        );
    }

    @PostMapping(
            "/simulations/{simulationId}/nodes/{nodeId}/analyze"
    )
    public ResponseEntity<AiNodeAnalysis> analyzeNode(
            @PathVariable Long simulationId,
            @PathVariable Long nodeId
    ) {

        NetworkState state =
                simulationService.getSimulationState(
                        simulationId
                );

        SimulatedNode node =
                state.getNodes()
                        .stream()
                        .filter(candidate ->
                                candidate != null
                                        && nodeId.equals(
                                        candidate.getNodeId()
                                )
                        )
                        .findFirst()
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Simulation node not found: "
                                                + nodeId
                                )
                        );

        AiNodeAnalysis analysis =
                aiOrchestratorService.analyzeNode(
                        simulationId,
                        state,
                        node
                );

        state.getAiAnalysis().put(
                nodeId,
                analysis
        );

        return ResponseEntity.ok(
                analysis
        );
    }

    @GetMapping(
            "/simulations/{simulationId}/analysis"
    )
    public ResponseEntity<Map<Long, AiNodeAnalysis>> getSimulationAnalysis(
            @PathVariable Long simulationId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        return ResponseEntity.ok(
                aiOrchestratorService.getLatestAnalyses(
                        simulationId
                )
        );
    }

    @GetMapping(
            "/simulations/{simulationId}/analysis/{nodeId}"
    )
    public ResponseEntity<AiNodeAnalysis> getNodeAnalysis(
            @PathVariable Long simulationId,
            @PathVariable Long nodeId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        AiNodeAnalysis analysis =
                aiOrchestratorService.getLatestAnalysis(
                        simulationId,
                        nodeId
                );

        if (analysis == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                analysis
        );
    }

    @GetMapping(
            "/simulations/{simulationId}/recovery-events"
    )
    public ResponseEntity<?> getRecoveryEvents(
            @PathVariable Long simulationId
    ) {

        NetworkState state =
                simulationService.getSimulationState(
                        simulationId
                );

        return ResponseEntity.ok(
                state.getRecoveryEvents()
        );
    }
}