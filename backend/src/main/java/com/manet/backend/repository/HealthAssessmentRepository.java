package com.manet.backend.repository;

import com.manet.backend.entity.HealthAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthAssessmentRepository extends JpaRepository<HealthAssessment, Long> {

    List<HealthAssessment> findByNodeIdOrderByAssessedAtDesc(Long nodeId);

    List<HealthAssessment> findByStatus(String status);
}