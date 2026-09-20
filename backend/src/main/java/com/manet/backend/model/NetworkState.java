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

    /** Latest AI analysis for each simulated node. */
    private Map<Long, AiNodeAnalysis> aiAnalysis = new LinkedHashMap<>();

    /** Latest recovery executions for the running simulation. */
    private List<RecoveryExecutionEvent> recoveryEvents = new ArrayList<>();

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

    public Map<Long, AiNodeAnalysis> getAiAnalysis() {
        return aiAnalysis;
    }

    public void setAiAnalysis(
            Map<Long, AiNodeAnalysis> aiAnalysis
    ) {
        this.aiAnalysis =
                aiAnalysis == null
                        ? new LinkedHashMap<>()
                        : aiAnalysis;
    }

    public List<RecoveryExecutionEvent> getRecoveryEvents() {
        return recoveryEvents;
    }

    public void setRecoveryEvents(
            List<RecoveryExecutionEvent> recoveryEvents
    ) {
        this.recoveryEvents =
                recoveryEvents == null
                        ? new ArrayList<>()
                        : recoveryEvents;
    }

    public void addRecoveryEvent(
            RecoveryExecutionEvent event
    ) {
        if (event == null) {
            return;
        }

        recoveryEvents.add(event);

        while (recoveryEvents.size() > 100) {
            recoveryEvents.remove(0);
        }
    }
}
