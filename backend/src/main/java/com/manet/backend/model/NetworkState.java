package com.manet.backend.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class NetworkState {

    private List<SimulatedNode> nodes = new ArrayList<>();

    private List<SimulatedLink> links = new ArrayList<>();

    private List<SimulatedPacket> packets = new ArrayList<>();

    private long currentTime;

    private boolean running;

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
}
