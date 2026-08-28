package com.manet.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatedPacket {

    private Long packetId;

    private Long sourceNodeId;

    private Long destinationNodeId;

    private Long currentNodeId;

    private int packetSize;

    private long creationTime;

    private long deliveryTime;

    private long lastTransmissionTime;

    private int hopCount;

    private int retransmissionCount;

    private double latency;

    private boolean delivered;

    private boolean dropped;

    private String dropReason;

    private List<Long> route;
}