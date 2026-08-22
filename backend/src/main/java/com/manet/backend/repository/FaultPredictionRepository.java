package com.manet.backend.repository;

import com.manet.backend.entity.FaultPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaultPredictionRepository extends JpaRepository<FaultPrediction, Long> {

    List<FaultPrediction> findByNodeIdOrderByPredictedAtDesc(Long nodeId);

    List<FaultPrediction> findByRiskLevel(String riskLevel);
}