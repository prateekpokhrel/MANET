package com.manet.backend.simulation.metrics;

import com.manet.backend.model.SimulatedLink;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LinkMetricCollector {

    public void collect(
            List<SimulatedLink> links
    ) {

        for (SimulatedLink link : links) {

            if (!link.isActive()) {
                continue;
            }

            double quality =
                    calculateLinkQuality(link);

            link.setQuality(quality);

            link.setSignalStrength(
                    quality * 100
            );

            link.setPacketLoss(
                    Math.max(
                            0,
                            Math.min(
                                    1,
                                    1 - quality
                            )
                    )
            );

            link.setLatency(
                    calculateLatency(
                            link.getDistance(),
                            quality
                    )
            );
        }
    }

    private double calculateLinkQuality(
            SimulatedLink link
    ) {

        double distanceFactor =
                Math.max(
                        0,
                        1 - (
                                link.getDistance()
                                        / (
                                        link.getDistance()
                                                + 1
                                )
                        )
                );

        double existingQuality =
                Math.max(
                        0,
                        Math.min(
                                1,
                                link.getQuality()
                        )
                );

        return (
                distanceFactor
                        + existingQuality
        ) / 2;
    }

    private double calculateLatency(
            double distance,
            double quality
    ) {

        double baseLatency = 5;

        double distanceDelay =
                distance * 0.05;

        double qualityDelay =
                (1 - quality) * 50;

        return baseLatency
                + distanceDelay
                + qualityDelay;
    }
}