package com.manet.backend.service;

import com.manet.backend.entity.NodeMetric;
import com.manet.backend.repository.NodeMetricRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NodeMetricService {

    private final NodeMetricRepository nodeMetricRepository;

    public NodeMetricService(NodeMetricRepository nodeMetricRepository) {
        this.nodeMetricRepository = nodeMetricRepository;
    }

    public NodeMetric recordMetric(NodeMetric metric) {
        return nodeMetricRepository.save(metric);
    }

    public List<NodeMetric> getAllMetrics() {
        return nodeMetricRepository.findAll();
    }

    public NodeMetric getMetricById(Long id) {
        return nodeMetricRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Metric not found: " + id));
    }

    public List<NodeMetric> getNodeMetrics(Long nodeId) {
        return nodeMetricRepository.findByNodeIdOrderByRecordedAtDesc(nodeId);
    }

    public void deleteMetric(Long id) {
        NodeMetric metric = getMetricById(id);
        nodeMetricRepository.delete(metric);
    }
}