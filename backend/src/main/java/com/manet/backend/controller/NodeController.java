package com.manet.backend.controller;

import com.manet.backend.entity.Node;
import com.manet.backend.service.NodeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nodes")
public class NodeController {

    private final NodeService nodeService;

    public NodeController(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    @PostMapping
    public ResponseEntity<Node> createNode(
            @RequestBody Node node) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nodeService.createNode(node));
    }

    @GetMapping
    public ResponseEntity<List<Node>> getAllNodes() {
        return ResponseEntity.ok(nodeService.getAllNodes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Node> getNodeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                nodeService.getNodeById(id)
        );
    }

    @GetMapping("/simulation/{simulationId}")
    public ResponseEntity<List<Node>> getNodesBySimulation(
            @PathVariable Long simulationId) {

        return ResponseEntity.ok(
                nodeService.getNodesBySimulation(simulationId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Node> updateNode(
            @PathVariable Long id,
            @RequestBody Node node) {

        return ResponseEntity.ok(
                nodeService.updateNode(id, node)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNode(
            @PathVariable Long id) {

        nodeService.deleteNode(id);

        return ResponseEntity.noContent().build();
    }
}