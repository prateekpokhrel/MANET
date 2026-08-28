package com.manet.backend.service;

import com.manet.backend.entity.Simulation;
import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulationParameters;
import com.manet.backend.repository.SimulationRepository;
import com.manet.backend.simulation.engine.ManetSimulationEngine;
import com.manet.backend.simulation.engine.SimulationCompletedEvent;
import com.manet.backend.simulation.engine.SimulationRunner;
import com.manet.backend.simulation.fault.FaultScenarioParameters;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SimulationService {

    private final SimulationRepository simulationRepository;
    private final ManetSimulationEngine simulationEngine;
    private final SimulationRunner simulationRunner;

    private final Map<Long, NetworkState> simulationStates =
            new ConcurrentHashMap<>();

    private final Map<Long, SimulationParameters> simulationParameters =
            new ConcurrentHashMap<>();

    public SimulationService(
            SimulationRepository simulationRepository,
            ManetSimulationEngine simulationEngine,
            SimulationRunner simulationRunner
    ) {
        this.simulationRepository = simulationRepository;
        this.simulationEngine = simulationEngine;
        this.simulationRunner = simulationRunner;
    }

    public Simulation createSimulation(
            Simulation simulation
    ) {

        simulation.setStatus("CREATED");

        return simulationRepository.save(
                simulation
        );
    }

    public List<Simulation> getAllSimulations() {

        return simulationRepository.findAll();
    }

    public Simulation getSimulationById(
            Long id
    ) {

        return simulationRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Simulation not found: " + id
                        )
                );
    }

    public Simulation updateSimulation(
            Long id,
            Simulation updatedSimulation
    ) {

        Simulation simulation =
                getSimulationById(id);

        if (updatedSimulation.getName() != null) {

            simulation.setName(
                    updatedSimulation.getName()
            );
        }

        if (updatedSimulation.getDescription() != null) {

            simulation.setDescription(
                    updatedSimulation.getDescription()
            );
        }

        if (updatedSimulation.getStatus() != null) {

            simulation.setStatus(
                    updatedSimulation.getStatus()
            );
        }

        return simulationRepository.save(
                simulation
        );
    }

    public void deleteSimulation(
            Long id
    ) {

        Simulation simulation =
                getSimulationById(id);

        NetworkState state =
                simulationStates.get(id);

        simulationRunner.stop(id);

        if (state != null) {

            simulationEngine.stop(
                    state
            );
        }

        simulationStates.remove(id);
        simulationParameters.remove(id);

        simulationEngine.clearDatasetRecords(
                id
        );

        simulationEngine.clearFaultScenario();

        simulationRepository.delete(
                simulation
        );
    }

    public NetworkState startSimulation(
            Long id,
            SimulationParameters parameters
    ) {

        Simulation simulation =
                getSimulationById(id);

        if (parameters == null) {

            throw new IllegalArgumentException(
                    "Simulation parameters are required"
            );
        }

        NetworkState existingState =
                simulationStates.get(id);

        if (existingState != null
                && existingState.isRunning()) {

            throw new IllegalStateException(
                    "Simulation is already running: " + id
            );
        }

        simulationRunner.stop(id);

        simulationEngine.clearFaultScenario();

        NetworkState state =
                simulationEngine.initialize(
                        id,
                        parameters
                );

        simulationStates.put(
                id,
                state
        );

        simulationParameters.put(
                id,
                parameters
        );

        simulation.setStatus("RUNNING");

        simulationRepository.save(
                simulation
        );

        simulationRunner.run(
                id,
                state,
                parameters
        );

        return state;
    }

    public NetworkState stepSimulation(
            Long id
    ) {

        NetworkState state =
                getRunningSimulation(id);

        SimulationParameters parameters =
                simulationParameters.get(id);

        if (parameters == null) {

            throw new IllegalStateException(
                    "Simulation parameters not found: " + id
            );
        }

        simulationEngine.step(
                id,
                state,
                parameters
        );

        return state;
    }

    public NetworkState getSimulationState(
            Long id
    ) {

        NetworkState state =
                simulationStates.get(id);

        if (state == null) {

            throw new IllegalStateException(
                    "Simulation state not found: " + id
            );
        }

        return state;
    }

    public void stopSimulation(
            Long id
    ) {

        Simulation simulation =
                getSimulationById(id);

        NetworkState state =
                simulationStates.get(id);

        simulationRunner.stop(id);

        if (state != null) {

            simulationEngine.stop(
                    state
            );
        }

        simulationParameters.remove(id);

        simulationEngine.clearFaultScenario();

        simulation.setStatus("STOPPED");

        simulationRepository.save(
                simulation
        );
    }

    public void resetSimulation(
            Long id
    ) {

        Simulation simulation =
                getSimulationById(id);

        NetworkState state =
                simulationStates.get(id);

        simulationRunner.stop(id);

        if (state != null) {

            simulationEngine.reset(
                    id,
                    state
            );
        } else {

            simulationEngine.clearDatasetRecords(
                    id
            );
        }

        simulationStates.remove(id);
        simulationParameters.remove(id);

        simulationEngine.clearFaultScenario();

        simulation.setStatus("CREATED");

        simulationRepository.save(
                simulation
        );
    }

    public void configureFaultScenario(
            Long id,
            FaultScenarioParameters parameters
    ) {

        getRunningSimulation(id);

        if (parameters == null) {

            throw new IllegalArgumentException(
                    "Fault scenario parameters are required"
            );
        }

        simulationEngine.configureFaultScenario(
                parameters
        );
    }

    public void clearFaultScenario(
            Long id
    ) {

        getRunningSimulation(id);

        simulationEngine.clearFaultScenario();
    }

    public boolean isSimulationRunning(
            Long id
    ) {

        NetworkState state =
                simulationStates.get(id);

        return state != null
                && state.isRunning()
                && simulationRunner.isRunning(id);
    }

    public Map<String, Object> getDatasetStats(
            Long id
    ) {

        getSimulationById(id);

        int recordCount =
                simulationEngine.getDatasetRecordCount(
                        id
                );

        NetworkState state =
                simulationStates.get(id);

        int nodeCount = 0;

        if (state != null) {

            nodeCount =
                    state.getNodes().size();
        }

        int timestepCount = 0;

        if (nodeCount > 0) {

            timestepCount =
                    recordCount / nodeCount;
        }

        return Map.of(
                "simulationId", id,
                "nodeCount", nodeCount,
                "timesteps", timestepCount,
                "records", recordCount
        );
    }

    @EventListener
    public void handleSimulationCompleted(
            SimulationCompletedEvent event
    ) {

        Long simulationId =
                event.getSimulationId();

        simulationStates.put(
                simulationId,
                event.getState()
        );

        Simulation simulation =
                getSimulationById(
                        simulationId
                );

        simulation.setStatus("COMPLETED");

        simulationRepository.save(
                simulation
        );
    }

    private NetworkState getRunningSimulation(
            Long id
    ) {

        NetworkState state =
                simulationStates.get(id);

        if (state == null) {

            throw new IllegalStateException(
                    "Simulation is not running: " + id
            );
        }

        if (!state.isRunning()) {

            throw new IllegalStateException(
                    "Simulation is stopped: " + id
            );
        }

        return state;
    }
}