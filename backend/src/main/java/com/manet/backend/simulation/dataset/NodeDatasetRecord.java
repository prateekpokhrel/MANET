package com.manet.backend.simulation.dataset;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NodeDatasetRecord {

    private long timestamp;

    private long nodeId;

    private double x;

    private double y;

    private double speed;

    private double batteryLevel;

    private double cpuUsage;

    private double memoryUsage;

    private double signalStrength;

    private double packetLoss;

    private double latency;

    private boolean active;

    private boolean faulty;
}