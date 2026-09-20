package com.manet.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiNodeAnalysis {

    private Long nodeId;
    private long timestamp;

    private String status;

    private RandomForestResponse randomForest;
    private XgboostResponse xgboost;
    private IsolationForestResponse isolationForest;
    private LstmResponse lstm;
    private RecoveryResponse recovery;

    /*
     * Result of the Spring Boot recovery execution layer.
     *
     * Examples:
     * EXECUTED
     * NOTIFIED
     * MONITORING
     * DISABLED
     * SKIPPED
     * FAILED
     */
    private String recoveryExecutionStatus;

    private String recoveryExecutionMessage;

    private String message;
}
