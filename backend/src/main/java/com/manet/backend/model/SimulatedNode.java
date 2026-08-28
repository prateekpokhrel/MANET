package com.manet.backend.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatedNode {

    private Long nodeId;

    private NodePosition position;

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
