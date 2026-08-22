package com.manet.backend.controller;

import com.manet.backend.entity.NodeMetric;
import com.manet.backend.service.NodeMetricService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
public class NodeMetricController {

    private final NodeMetricService nodeMetricService;

    public NodeMetricController(NodeMetricService nodeMetricService) {
        this.nodeMetricService = nodeMetricService;
    }

    @PostMapping
    public ResponseEntity<NodeMetric> recordMetric(
            @RequestBody NodeMetric metric) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nodeMetricService.recordMetric(metric));
    }

    @GetMapping
    public ResponseEntity<List<NodeMetric>> getAllMetrics() {
        return ResponseEntity.ok(
                nodeMetricService.getAllMetrics()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<NodeMetric> getMetricById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                nodeMetricService.getMetricById(id)
        );
    }

    @GetMapping("/node/{nodeId}")
    public ResponseEntity<List<NodeMetric>> getNodeMetrics(
            @PathVariable Long nodeId) {

        return ResponseEntity.ok(
                nodeMetricService.getNodeMetrics(nodeId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMetric(
            @PathVariable Long id) {

        nodeMetricService.deleteMetric(id);

        return ResponseEntity.noContent().build();
    }
}