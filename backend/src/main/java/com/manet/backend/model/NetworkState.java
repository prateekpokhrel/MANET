package com.manet.backend.model;

import com.manet.backend.ai.dto.AiNodeAnalysis;
import lombok.Data;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
public class NetworkState {

    private List<SimulatedNode> nodes = new ArrayList<>();

    private List<SimulatedLink> links = new ArrayList<>();

    private List<SimulatedPacket> packets = new ArrayList<>();

    private long currentTime;

    private boolean running;

    /**
     * Latest AI analysis for each simulated node.
     */
    private Map<Long, AiNodeAnalysis> aiAnalysis = new LinkedHashMap<>();

    public void clearLinks() {
        links.clear();
    }

    public void addNode(SimulatedNode node) {
        nodes.add(node);
    }

    public void addLink(SimulatedLink link) {
        links.add(link);
    }

    public void addPacket(SimulatedPacket packet) {
        packets.add(packet);
    }

    // Explicit getter/setter so the AI integration does not depend
    // on IDE Lombok processing for this field.
    public Map<Long, AiNodeAnalysis> getAiAnalysis() {
        return aiAnalysis;
    }

    public void setAiAnalysis(Map<Long, AiNodeAnalysis> aiAnalysis) {
        this.aiAnalysis = aiAnalysis;
    }
}