package com.manet.backend.repository;

import com.manet.backend.entity.NodeMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeMetricRepository extends JpaRepository<NodeMetric, Long> {

    List<NodeMetric> findByNodeIdOrderByRecordedAtDesc(Long nodeId);
}