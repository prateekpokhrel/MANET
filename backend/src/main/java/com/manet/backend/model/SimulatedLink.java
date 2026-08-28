package com.manet.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatedLink {

    private Long sourceNodeId;

    private Long destinationNodeId;

    private double distance;

    private double signalStrength;

    private double quality;

    private double latency;

    private double packetLoss;

    private boolean active;
}
