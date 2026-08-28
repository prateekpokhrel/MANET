package com.manet.backend.simulation.fault;

public enum FaultType {

    NODE_FAILURE(
            FaultCategory.NODE,
            FaultSeverity.CRITICAL,
            false
    ),

    NODE_CRASH(
            FaultCategory.NODE,
            FaultSeverity.HIGH,
            true
    ),

    HARDWARE_FAILURE(
            FaultCategory.HARDWARE,
            FaultSeverity.CRITICAL,
            false
    ),

    ANTENNA_FAILURE(
            FaultCategory.HARDWARE,
            FaultSeverity.HIGH,
            false
    ),

    TRANSCEIVER_FAILURE(
            FaultCategory.HARDWARE,
            FaultSeverity.CRITICAL,
            false
    ),

    LOW_BATTERY(
            FaultCategory.BATTERY,
            FaultSeverity.HIGH,
            true
    ),

    BATTERY_FAILURE(
            FaultCategory.BATTERY,
            FaultSeverity.CRITICAL,
            false
    ),

    HIGH_CPU(
            FaultCategory.PERFORMANCE,
            FaultSeverity.HIGH,
            true
    ),

    MEMORY_EXHAUSTION(
            FaultCategory.PERFORMANCE,
            FaultSeverity.HIGH,
            true
    ),

    LINK_FAILURE(
            FaultCategory.LINK,
            FaultSeverity.HIGH,
            true
    ),

    WEAK_SIGNAL(
            FaultCategory.RADIO,
            FaultSeverity.MEDIUM,
            true
    ),

    HIGH_PACKET_LOSS(
            FaultCategory.RADIO,
            FaultSeverity.HIGH,
            true
    ),

    HIGH_LATENCY(
            FaultCategory.RADIO,
            FaultSeverity.HIGH,
            true
    ),

    LINK_QUALITY_DEGRADATION(
            FaultCategory.LINK,
            FaultSeverity.MEDIUM,
            true
    ),

    RADIO_INTERFERENCE(
            FaultCategory.RADIO,
            FaultSeverity.HIGH,
            true
    ),

    RADIO_OUTAGE(
            FaultCategory.RADIO,
            FaultSeverity.CRITICAL,
            true
    ),

    CHANNEL_CONGESTION(
            FaultCategory.RADIO,
            FaultSeverity.HIGH,
            true
    ),

    HIGH_COLLISION_RATE(
            FaultCategory.RADIO,
            FaultSeverity.HIGH,
            true
    ),

    NODE_OUT_OF_RANGE(
            FaultCategory.MOBILITY,
            FaultSeverity.MEDIUM,
            true
    ),

    RAPID_NODE_MOVEMENT(
            FaultCategory.MOBILITY,
            FaultSeverity.MEDIUM,
            true
    ),

    UNEXPECTED_NODE_MOVEMENT(
            FaultCategory.MOBILITY,
            FaultSeverity.HIGH,
            true
    ),

    NETWORK_PARTITION(
            FaultCategory.NETWORK,
            FaultSeverity.CRITICAL,
            true
    ),

    TOPOLOGY_CHANGE(
            FaultCategory.MOBILITY,
            FaultSeverity.MEDIUM,
            true
    ),

    NETWORK_CONGESTION(
            FaultCategory.TRAFFIC,
            FaultSeverity.HIGH,
            true
    ),

    HIGH_TRAFFIC_LOAD(
            FaultCategory.TRAFFIC,
            FaultSeverity.HIGH,
            true
    ),

    PACKET_QUEUE_OVERFLOW(
            FaultCategory.TRAFFIC,
            FaultSeverity.HIGH,
            true
    ),

    THROUGHPUT_DEGRADATION(
            FaultCategory.NETWORK,
            FaultSeverity.MEDIUM,
            true
    ),

    PACKET_DELAY_SPIKE(
            FaultCategory.NETWORK,
            FaultSeverity.HIGH,
            true
    ),

    JITTER_SPIKE(
            FaultCategory.NETWORK,
            FaultSeverity.MEDIUM,
            true
    ),

    ROUTE_FAILURE(
            FaultCategory.ROUTING,
            FaultSeverity.HIGH,
            true
    ),

    ROUTE_LOOP(
            FaultCategory.ROUTING,
            FaultSeverity.HIGH,
            true
    ),

    STALE_ROUTE(
            FaultCategory.ROUTING,
            FaultSeverity.MEDIUM,
            true
    ),

    ROUTE_INSTABILITY(
            FaultCategory.ROUTING,
            FaultSeverity.HIGH,
            true
    ),

    FREQUENT_ROUTE_CHANGE(
            FaultCategory.ROUTING,
            FaultSeverity.MEDIUM,
            true
    ),

    NEXT_HOP_UNREACHABLE(
            FaultCategory.ROUTING,
            FaultSeverity.HIGH,
            true
    ),

    ENVIRONMENTAL_INTERFERENCE(
            FaultCategory.ENVIRONMENTAL,
            FaultSeverity.MEDIUM,
            true
    ),

    OBSTACLE_BLOCKAGE(
            FaultCategory.ENVIRONMENTAL,
            FaultSeverity.HIGH,
            true
    ),

    SIGNAL_ATTENUATION(
            FaultCategory.ENVIRONMENTAL,
            FaultSeverity.MEDIUM,
            true
    ),

    EXTREME_DISTANCE(
            FaultCategory.ENVIRONMENTAL,
            FaultSeverity.MEDIUM,
            true
    ),

    GPS_POSITION_ERROR(
            FaultCategory.ENVIRONMENTAL,
            FaultSeverity.MEDIUM,
            true
    ),

    TIME_SYNCHRONIZATION_ERROR(
            FaultCategory.ENVIRONMENTAL,
            FaultSeverity.MEDIUM,
            true
    );

    private final FaultCategory category;

    private final FaultSeverity severity;

    private final boolean aiMitigable;

    FaultType(
            FaultCategory category,
            FaultSeverity severity,
            boolean aiMitigable
    ) {
        this.category = category;
        this.severity = severity;
        this.aiMitigable = aiMitigable;
    }

    public FaultCategory getCategory() {
        return category;
    }

    public FaultSeverity getSeverity() {
        return severity;
    }

    public boolean isAiMitigable() {
        return aiMitigable;
    }
}