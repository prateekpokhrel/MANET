package com.manet.backend.service;

import com.manet.backend.entity.Link;
import com.manet.backend.repository.LinkRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LinkService {

    private final LinkRepository linkRepository;

    public LinkService(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    public Link createLink(Link link) {
        return linkRepository.save(link);
    }

    public List<Link> getAllLinks() {
        return linkRepository.findAll();
    }

    public Link getLinkById(Long id) {
        return linkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Link not found: " + id));
    }

    public List<Link> getLinksBySimulation(Long simulationId) {
        return linkRepository.findBySimulationId(simulationId);
    }

    public Link updateLink(Long id, Link updatedLink) {
        Link link = getLinkById(id);

        link.setStatus(updatedLink.getStatus());
        link.setBandwidth(updatedLink.getBandwidth());
        link.setLatency(updatedLink.getLatency());
        link.setPacketLoss(updatedLink.getPacketLoss());
        link.setRssi(updatedLink.getRssi());

        return linkRepository.save(link);
    }

    public void deleteLink(Long id) {
        Link link = getLinkById(id);
        linkRepository.delete(link);
    }
}