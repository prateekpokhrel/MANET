package com.manet.backend.controller;

import com.manet.backend.entity.Link;
import com.manet.backend.service.LinkService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    @PostMapping
    public ResponseEntity<Link> createLink(
            @RequestBody Link link) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(linkService.createLink(link));
    }

    @GetMapping
    public ResponseEntity<List<Link>> getAllLinks() {
        return ResponseEntity.ok(linkService.getAllLinks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Link> getLinkById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                linkService.getLinkById(id)
        );
    }

    @GetMapping("/simulation/{simulationId}")
    public ResponseEntity<List<Link>> getLinksBySimulation(
            @PathVariable Long simulationId) {

        return ResponseEntity.ok(
                linkService.getLinksBySimulation(simulationId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Link> updateLink(
            @PathVariable Long id,
            @RequestBody Link link) {

        return ResponseEntity.ok(
                linkService.updateLink(id, link)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLink(
            @PathVariable Long id) {

        linkService.deleteLink(id);

        return ResponseEntity.noContent().build();
    }
}