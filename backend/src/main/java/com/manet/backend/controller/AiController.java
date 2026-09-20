package com.manet.backend.controller;

import com.manet.backend.ai.dto.AiNodeAnalysis;
import com.manet.backend.ai.persistence.AiPersistenceService;
import com.manet.backend.ai.service.AiOrchestratorService;
import com.manet.backend.entity.AiAnalysisRecord;
import com.manet.backend.entity.AiRecoveryExecution;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulatedNode;
import com.manet.backend.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin
public class AiController {

    private final AiOrchestratorService aiOrchestratorService;

    private final SimulationService simulationService;

    private final AiPersistenceService aiPersistenceService;

    public AiController(
            AiOrchestratorService aiOrchestratorService,
            SimulationService simulationService,
            AiPersistenceService aiPersistenceService
    ) {
        this.aiOrchestratorService =
                aiOrchestratorService;

        this.simulationService =
                simulationService;

        this.aiPersistenceService =
                aiPersistenceService;
    }

    // ============================================================
    // AI HEALTH
    // ============================================================

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {

        return ResponseEntity.ok(
                aiOrchestratorService.health()
        );
    }

    // ============================================================
    // ANALYZE NODE
    // ============================================================

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
                        .filter(
                                candidate ->
                                        candidate != null
                                                && nodeId.equals(
                                                candidate.getNodeId()
                                        )
                        )
                        .findFirst()
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
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

    // ============================================================
    // LATEST AI ANALYSIS - ALL NODES
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/analysis"
    )
    public ResponseEntity<Map<Long, AiNodeAnalysis>>
    getSimulationAnalysis(
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

    // ============================================================
    // LATEST AI ANALYSIS - ONE NODE
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/analysis/node/{nodeId}"
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
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                analysis
        );
    }

    // ============================================================
    // PERSISTED AI HISTORY - NODE
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/analysis/history"
    )
    public ResponseEntity<List<AiAnalysisRecord>>
    getNodeAnalysisHistory(
            @PathVariable Long simulationId,
            @RequestParam Long nodeId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        return ResponseEntity.ok(
                aiPersistenceService.getNodeAnalysisHistory(
                        simulationId,
                        nodeId
                )
        );
    }

    // ============================================================
    // PERSISTED AI RECORDS - SIMULATION
    //
    // IMPORTANT:
    // Uses /analysis-records instead of /analysis/records
    // to eliminate the {nodeId} route collision completely.
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/analysis-records"
    )
    public ResponseEntity<List<AiAnalysisRecord>>
    getPersistedAnalyses(
            @PathVariable Long simulationId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        return ResponseEntity.ok(
                aiPersistenceService.getAnalysisHistory(
                        simulationId
                )
        );
    }

    // ============================================================
    // LATEST PERSISTED ANALYSIS
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/analysis/latest"
    )
    public ResponseEntity<Map<Long, AiAnalysisRecord>>
    getLatestPersistedAnalysis(
            @PathVariable Long simulationId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        return ResponseEntity.ok(
                aiPersistenceService.getLatestPersistedAnalysis(
                        simulationId
                )
        );
    }

    // ============================================================
    // RECOVERY EXECUTIONS - SIMULATION
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/recovery-executions"
    )
    public ResponseEntity<List<AiRecoveryExecution>>
    getRecoveryExecutions(
            @PathVariable Long simulationId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        return ResponseEntity.ok(
                aiPersistenceService.getRecoveryExecutions(
                        simulationId
                )
        );
    }

    // ============================================================
    // RECOVERY EXECUTIONS - NODE
    //
    // /node/{nodeId} avoids collision with the generic route.
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/recovery-executions/node/{nodeId}"
    )
    public ResponseEntity<List<AiRecoveryExecution>>
    getNodeRecoveryExecutions(
            @PathVariable Long simulationId,
            @PathVariable Long nodeId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        return ResponseEntity.ok(
                aiPersistenceService.getNodeRecoveryExecutions(
                        simulationId,
                        nodeId
                )
        );
    }

    // ============================================================
    // ANALYSIS RECORD COUNT
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/analysis/count"
    )
    public ResponseEntity<Map<String, Object>>
    getAnalysisCount(
            @PathVariable Long simulationId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        return ResponseEntity.ok(
                Map.of(
                        "simulationId",
                        simulationId,

                        "analysisRecordCount",
                        aiPersistenceService
                                .countAnalysisRecords(
                                        simulationId
                                )
                )
        );
    }

    // ============================================================
    // RECOVERY EXECUTION COUNT
    // ============================================================

    @GetMapping(
            "/simulations/{simulationId}/recovery-executions/count"
    )
    public ResponseEntity<Map<String, Object>>
    getRecoveryExecutionCount(
            @PathVariable Long simulationId
    ) {

        simulationService.getSimulationState(
                simulationId
        );

        return ResponseEntity.ok(
                Map.of(
                        "simulationId",
                        simulationId,

                        "recoveryExecutionCount",
                        aiPersistenceService
                                .countRecoveryExecutions(
                                        simulationId
                                )
                )
        );
    }
}