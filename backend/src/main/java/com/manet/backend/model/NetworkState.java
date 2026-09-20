package com.manet.backend.model;

import com.manet.backend.ai.dto.AiNodeAnalysis;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Data
public class NetworkState {

    private List<SimulatedNode> nodes =
            new ArrayList<>();

    private List<SimulatedLink> links =
            new ArrayList<>();

    private List<SimulatedPacket> packets =
            new ArrayList<>();

    private long currentTime;

    private boolean running;

    /*
     * Latest AI analysis for every node.
     */
    private Map<Long, AiNodeAnalysis> aiAnalysis =
            new ConcurrentHashMap<>();

    /*
     * Recent recovery execution events.
     *
     * These will later be consumed by React.
     */
    private List<RecoveryExecutionEvent> recoveryEvents =
            new CopyOnWriteArrayList<>();

    public void clearLinks() {
        links.clear();
    }

    public void addNode(
            SimulatedNode node
    ) {
        nodes.add(node);
    }

    public void addLink(
            SimulatedLink link
    ) {
        links.add(link);
    }

    public void addPacket(
            SimulatedPacket packet
    ) {
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
                        ? new ConcurrentHashMap<>()
                        : aiAnalysis;
    }

    public List<RecoveryExecutionEvent>
    getRecoveryEvents() {
        return recoveryEvents;
    }

    public void setRecoveryEvents(
            List<RecoveryExecutionEvent> recoveryEvents
    ) {
        this.recoveryEvents =
                recoveryEvents == null
                        ? new CopyOnWriteArrayList<>()
                        : recoveryEvents;
    }

    public void addRecoveryEvent(
            RecoveryExecutionEvent event
    ) {

        if (event == null) {
            return;
        }

        recoveryEvents.add(event);

        /*
         * Prevent the live /state response from growing forever.
         */
        while (recoveryEvents.size() > 100) {
            recoveryEvents.remove(0);
        }
    }
}