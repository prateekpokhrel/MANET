package com.manet.backend.simulation.engine;

import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulationParameters;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import jakarta.annotation.PreDestroy;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Component
public class SimulationRunner {

    private final ManetSimulationEngine simulationEngine;
    private final ApplicationEventPublisher eventPublisher;

    /*
     * Dedicated scheduler for running simulations.
     *
     * Multiple simulations can run at the same time,
     * but each simulation has only one scheduled task.
     */
    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(4);

    /*
     * Stores the currently running task for every simulation.
     *
     * Key   -> simulationId
     * Value -> scheduled task
     */
    private final Map<Long, ScheduledFuture<?>> runningTasks =
            new ConcurrentHashMap<>();

    public SimulationRunner(
            ManetSimulationEngine simulationEngine,
            ApplicationEventPublisher eventPublisher
    ) {
        this.simulationEngine = simulationEngine;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Starts continuous execution of a simulation.
     */
    public void run(
            Long simulationId,
            NetworkState state,
            SimulationParameters parameters
    ) {

        if (simulationId == null) {
            throw new IllegalArgumentException(
                    "Simulation ID cannot be null"
            );
        }

        if (state == null) {
            throw new IllegalArgumentException(
                    "Network state cannot be null"
            );
        }

        if (parameters == null) {
            throw new IllegalArgumentException(
                    "Simulation parameters cannot be null"
            );
        }

        /*
         * Make sure an older task for this simulation
         * does not continue running.
         */
        stop(simulationId);

        /*
         * timeStep represents simulation time between steps.
         *
         * Prevent zero/negative scheduling intervals.
         */
        long intervalMillis =
                Math.max(
                        1L,
                        (long) (
                                parameters.getTimeStep()
                                        * 1000.0
                        )
                );

        /*
         * scheduleWithFixedDelay is intentionally used instead
         * of scheduleAtFixedRate.
         *
         * This guarantees that the next simulation step starts
         * only after the previous step has completely finished.
         *
         * This is safer because one step may perform:
         *
         * - node movement
         * - link calculation
         * - packet transmission
         * - fault processing
         * - metric calculation
         * - dataset recording
         * - database insertion
         */
        ScheduledFuture<?> task =
                scheduler.scheduleWithFixedDelay(
                        () -> executeStep(
                                simulationId,
                                state,
                                parameters
                        ),
                        0,
                        intervalMillis,
                        TimeUnit.MILLISECONDS
                );

        runningTasks.put(
                simulationId,
                task
        );
    }

    /**
     * Executes one simulation step.
     */
    private void executeStep(
            Long simulationId,
            NetworkState state,
            SimulationParameters parameters
    ) {

        try {

            /*
             * If the simulation has already been stopped,
             * cancel its scheduled task.
             */
            if (!state.isRunning()) {

                stop(simulationId);

                return;
            }

            /*
             * Check whether the simulation has reached
             * its configured duration.
             */
            if (state.getCurrentTime()
                    >= parameters.getSimulationDuration()) {

                completeSimulation(
                        simulationId,
                        state
                );

                return;
            }

            /*
             * Execute exactly ONE simulation step.
             *
             * IMPORTANT:
             * ManetSimulationEngine.step() must advance
             * the simulation clock.
             */
            simulationEngine.step(
                    simulationId,
                    state,
                    parameters
            );

            /*
             * Check again AFTER the step.
             *
             * Example:
             *
             * duration = 120
             * currentTime = 119
             *
             * step() advances it to 120.
             *
             * We should complete immediately instead of
             * waiting for another scheduler cycle.
             */
            if (state.getCurrentTime()
                    >= parameters.getSimulationDuration()) {

                completeSimulation(
                        simulationId,
                        state
                );
            }

        } catch (Exception exception) {

            /*
             * Never allow an exception inside one simulation
             * step to leave the scheduler task running forever.
             */
            handleSimulationError(
                    simulationId,
                    state,
                    exception
            );
        }
    }

    /**
     * Completes a simulation exactly once.
     */
    private void completeSimulation(
            Long simulationId,
            NetworkState state
    ) {

        /*
         * Stop the actual simulation engine.
         */
        simulationEngine.stop(state);

        /*
         * Cancel the scheduled runner task.
         */
        stop(simulationId);

        /*
         * Notify the rest of the backend that the simulation
         * has completed.
         *
         * This can be used by:
         *
         * - dataset generation
         * - CSV export
         * - statistics
         * - AI dataset preparation
         * - WebSocket notifications
         */
        eventPublisher.publishEvent(
                new SimulationCompletedEvent(
                        simulationId,
                        state
                )
        );
    }

    /**
     * Handles an unexpected simulation error.
     */
    private void handleSimulationError(
            Long simulationId,
            NetworkState state,
            Exception exception
    ) {

        try {

            /*
             * Stop the simulation engine first.
             */
            simulationEngine.stop(state);

        } catch (Exception stopException) {

            stopException.printStackTrace();
        }

        /*
         * Remove/cancel the scheduler task.
         */
        stop(simulationId);

        /*
         * Print the original exception so the exact
         * backend problem remains visible in IntelliJ.
         */
        System.err.println(
                "Simulation failed: " + simulationId
        );

        exception.printStackTrace();
    }

    /**
     * Stops one simulation.
     */
    public void stop(
            Long simulationId
    ) {

        if (simulationId == null) {
            return;
        }

        ScheduledFuture<?> task =
                runningTasks.remove(
                        simulationId
                );

        if (task != null) {

            /*
             * false means do not interrupt a step that is
             * currently executing.
             */
            task.cancel(false);
        }
    }

    /**
     * Checks whether a simulation currently has
     * an active scheduled runner.
     */
    public boolean isRunning(
            Long simulationId
    ) {

        if (simulationId == null) {
            return false;
        }

        ScheduledFuture<?> task =
                runningTasks.get(
                        simulationId
                );

        return task != null
                && !task.isCancelled()
                && !task.isDone();
    }

    /**
     * Stops every running simulation and shuts down
     * the scheduler when Spring destroys this component.
     */
    @PreDestroy
    public void shutdown() {

        /*
         * Cancel all simulation tasks.
         */
        for (ScheduledFuture<?> task :
                runningTasks.values()) {

            if (task != null) {
                task.cancel(false);
            }
        }

        runningTasks.clear();

        /*
         * Stop scheduler threads.
         */
        scheduler.shutdownNow();

        try {

            if (!scheduler.awaitTermination(
                    5,
                    TimeUnit.SECONDS
            )) {

                System.err.println(
                        "Simulation scheduler did not terminate cleanly."
                );
            }

        } catch (InterruptedException exception) {

            Thread.currentThread().interrupt();

            System.err.println(
                    "Interrupted while shutting down simulation scheduler."
            );
        }
    }
}