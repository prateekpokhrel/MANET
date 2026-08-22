package com.manet.backend.service;

import com.manet.backend.entity.Node;
import com.manet.backend.repository.NodeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NodeService {

    private final NodeRepository nodeRepository;

    public NodeService(NodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    public Node createNode(Node node) {
        return nodeRepository.save(node);
    }

    public List<Node> getAllNodes() {
        return nodeRepository.findAll();
    }

    public Node getNodeById(Long id) {
        return nodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Node not found: " + id));
    }

    public List<Node> getNodesBySimulation(Long simulationId) {
        return nodeRepository.findBySimulationId(simulationId);
    }

    public Node updateNode(Long id, Node updatedNode) {
        Node node = getNodeById(id);

        node.setNodeIdentifier(updatedNode.getNodeIdentifier());
        node.setNodeType(updatedNode.getNodeType());
        node.setStatus(updatedNode.getStatus());
        node.setXPosition(updatedNode.getXPosition());
        node.setYPosition(updatedNode.getYPosition());
        node.setBatteryLevel(updatedNode.getBatteryLevel());
        node.setCpuUsage(updatedNode.getCpuUsage());
        node.setIpAddress(updatedNode.getIpAddress());

        return nodeRepository.save(node);
    }

    public void deleteNode(Long id) {
        Node node = getNodeById(id);
        nodeRepository.delete(node);
    }
}