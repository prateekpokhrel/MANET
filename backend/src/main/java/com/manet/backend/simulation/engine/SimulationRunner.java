package com.manet.backend.simulation.engine;

import com.manet.backend.model.NetworkState;
import com.manet.backend.model.SimulationParameters;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

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

    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(4);

    private final Map<Long, ScheduledFuture<?>> runningTasks =
            new ConcurrentHashMap<>();

    public SimulationRunner(
            ManetSimulationEngine simulationEngine,
            ApplicationEventPublisher eventPublisher
    ) {
        this.simulationEngine = simulationEngine;
        this.eventPublisher = eventPublisher;
    }

    public void run(
            Long simulationId,
            NetworkState state,
            SimulationParameters parameters
    ) {

        stop(simulationId);

        long interval =
                Math.max(
                        1,
                        (long) parameters.getTimeStep()
                );

        ScheduledFuture<?> task =
                scheduler.scheduleAtFixedRate(
                        () -> executeStep(
                                simulationId,
                                state,
                                parameters
                        ),
                        0,
                        interval,
                        TimeUnit.SECONDS
                );

        runningTasks.put(
                simulationId,
                task
        );
    }

    private void executeStep(
            Long simulationId,
            NetworkState state,
            SimulationParameters parameters
    ) {

        try {

            if (!state.isRunning()) {

                stop(simulationId);

                return;
            }

            if (state.getCurrentTime()
                    >= parameters.getSimulationDuration()) {

                simulationEngine.stop(state);

                stop(simulationId);

                eventPublisher.publishEvent(
                        new SimulationCompletedEvent(
                                simulationId,
                                state
                        )
                );

                return;
            }

            simulationEngine.step(
                    simulationId,
                    state,
                    parameters
            );

        } catch (Exception exception) {

            simulationEngine.stop(state);

            stop(simulationId);

            exception.printStackTrace();
        }
    }

    public void stop(
            Long simulationId
    ) {

        ScheduledFuture<?> task =
                runningTasks.remove(
                        simulationId
                );

        if (task != null) {

            task.cancel(false);
        }
    }

    public boolean isRunning(
            Long simulationId
    ) {

        ScheduledFuture<?> task =
                runningTasks.get(
                        simulationId
                );

        return task != null
                && !task.isCancelled()
                && !task.isDone();
    }

    public void shutdown() {

        scheduler.shutdownNow();

        runningTasks.clear();
    }
}