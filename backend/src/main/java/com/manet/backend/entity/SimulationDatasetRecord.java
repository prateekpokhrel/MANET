package com.manet.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "simulation_dataset_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationDatasetRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // COMMON SIMULATION INFORMATION
    // =========================================================

    @Column(nullable = false)
    private Long simulationId;

    @Column(nullable = false)
    private Long timestamp;


    // =========================================================
    // NODE INFORMATION
    // Used by:
    // XGBoost
    // Random Forest
    // =========================================================

    /*
     * For NODE records this is the actual node ID.
     *
     * For LINK records this contains the source node ID.
     * This is required because your existing PostgreSQL
     * database has node_id as NOT NULL.
     */
    @Column
    private Long nodeId;

    @Column
    private double x;

    @Column
    private double y;

    @Column
    private double speed;

    @Column
    private double batteryLevel;

    @Column
    private double cpuUsage;

    @Column
    private double memoryUsage;

    /*
     * For NODE records:
     *     node RSSI / signal strength
     *
     * For LINK records:
     *     link RSSI / signal strength
     */
    @Column
    private double signalStrength;

    /*
     * For NODE records:
     *     node packet loss
     *
     * For LINK records:
     *     link packet loss
     */
    @Column
    private double packetLoss;

    /*
     * For NODE records:
     *     node latency
     *
     * For LINK records:
     *     link latency
     */
    @Column
    private double latency;

    @Column
    private boolean active;

    @Column
    private boolean faulty;

    @Column
    private String faultType;


    // =========================================================
    // LINK INFORMATION
    // Used by LSTM
    // =========================================================

    /*
     * Source node of the link.
     */
    @Column
    private Long sourceNodeId;

    /*
     * Destination node of the link.
     */
    @Column
    private Long destinationNodeId;

    /*
     * Distance between source and destination.
     *
     * LSTM input:
     * Node Distance
     */
    @Column
    private double nodeDistance;

    /*
     * Link throughput.
     *
     * LSTM input:
     * Historical Throughput
     */
    @Column
    private double throughput;

    /*
     * Link quality.
     *
     * LSTM input:
     * Historical Link Quality
     */
    @Column
    private double linkQuality;

    /*
     * Current link availability.
     */
    @Column
    private boolean linkActive;


    // =========================================================
    // RECORD TYPE
    // =========================================================

    /*
     * NODE:
     *     Used for XGBoost / Random Forest
     *
     * LINK:
     *     Used for LSTM
     *
     * Keeping both in the same entity/table allows the
     * backend to support all AI models using one dataset
     * infrastructure.
     */
    @Column(nullable = false)
    private String recordType;
}