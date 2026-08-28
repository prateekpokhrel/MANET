package com.manet.backend.simulation.fault;

import com.manet.backend.model.NetworkState;
import com.manet.backend.simulation.engine.ManetSimulationEngine;
import org.springframework.stereotype.Service;

@Service
public class FaultScenarioService {

    private final ManetSimulationEngine simulationEngine;

    public FaultScenarioService(
            ManetSimulationEngine simulationEngine
    ) {
        this.simulationEngine = simulationEngine;
    }

    public void startNodeFailureScenario() {

        FaultScenarioParameters scenario =
                FaultScenarioParameters.builder()
                        .scenario(
                                FaultScenario.NODE_FAILURE_SCENARIO
                        )
                        .startTime(30)
                        .duration(30)
                        .intensity(1)
                        .numberOfFaults(1)
                        .automaticRecovery(false)
                        .build();

        simulationEngine.configureFaultScenario(
                scenario
        );
    }

    public void startBatteryDegradationScenario() {

        FaultScenarioParameters scenario =
                FaultScenarioParameters.builder()
                        .scenario(
                                FaultScenario.BATTERY_DEGRADATION_SCENARIO
                        )
                        .startTime(30)
                        .duration(120)
                        .intensity(0.5)
                        .numberOfFaults(1)
                        .automaticRecovery(true)
                        .build();

        simulationEngine.configureFaultScenario(
                scenario
        );
    }

    public void startCpuOverloadScenario() {

        FaultScenarioParameters scenario =
                FaultScenarioParameters.builder()
                        .scenario(
                                FaultScenario.CPU_OVERLOAD_SCENARIO
                        )
                        .startTime(60)
                        .duration(30)
                        .intensity(5)
                        .numberOfFaults(1)
                        .automaticRecovery(true)
                        .build();

        simulationEngine.configureFaultScenario(
                scenario
        );
    }

    public void startLinkFailureScenario() {

        FaultScenarioParameters scenario =
                FaultScenarioParameters.builder()
                        .scenario(
                                FaultScenario.LINK_FAILURE_SCENARIO
                        )
                        .startTime(80)
                        .duration(30)
                        .intensity(1)
                        .numberOfFaults(1)
                        .automaticRecovery(true)
                        .build();

        simulationEngine.configureFaultScenario(
                scenario
        );
    }

    public void startNetworkCongestionScenario() {

        FaultScenarioParameters scenario =
                FaultScenarioParameters.builder()
                        .scenario(
                                FaultScenario.NETWORK_CONGESTION_SCENARIO
                        )
                        .startTime(100)
                        .duration(60)
                        .intensity(1)
                        .numberOfFaults(1)
                        .automaticRecovery(true)
                        .build();

        simulationEngine.configureFaultScenario(
                scenario
        );
    }

    public void startMultiFaultScenario() {

        FaultScenarioParameters scenario =
                FaultScenarioParameters.builder()
                        .scenario(
                                FaultScenario.MULTI_FAULT_SCENARIO
                        )
                        .startTime(150)
                        .duration(60)
                        .intensity(1)
                        .numberOfFaults(3)
                        .automaticRecovery(true)
                        .build();

        simulationEngine.configureFaultScenario(
                scenario
        );
    }

    public void stopScenario() {

        simulationEngine.clearFaultScenario();
    }
}