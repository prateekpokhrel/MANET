package com.manet.backend.controller;

import com.manet.backend.simulation.dataset.LstmDatasetExporter;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/lstm")
public class LstmController {

    private final LstmDatasetExporter datasetExporter;


    public LstmController(
            LstmDatasetExporter datasetExporter
    ) {

        this.datasetExporter =
                datasetExporter;
    }

    // DOWNLOAD LSTM DATASET
    @GetMapping(
            path = "/dataset/{simulationId}",
            produces = "text/csv"
    )
    public ResponseEntity<byte[]> downloadDataset(
            @PathVariable Long simulationId
    ) {

        String csv =
                datasetExporter.exportCsv(
                        simulationId
                );


        byte[] data =
                csv.getBytes(
                        StandardCharsets.UTF_8
                );


        HttpHeaders headers =
                new HttpHeaders();


        headers.setContentType(
                MediaType.parseMediaType(
                        "text/csv"
                )
        );


        headers.setContentDisposition(
                ContentDisposition
                        .attachment()
                        .filename(
                                "link_quality_timeseries.csv"
                        )
                        .build()
        );


        headers.setContentLength(
                data.length
        );


        return ResponseEntity
                .ok()
                .headers(headers)
                .body(data);
    }

    // CHECK LINK DATA
    @GetMapping(
            "/dataset/{simulationId}/count"
    )
    public ResponseEntity<Integer> getLinkRecordCount(
            @PathVariable Long simulationId
    ) {

        return ResponseEntity.ok(
                datasetExporter.getLinkRecordCount(
                        simulationId
                )
        );
    }
}