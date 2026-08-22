package com.manet.backend.repository;

import com.manet.backend.entity.RecoveryAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecoveryActionRepository extends JpaRepository<RecoveryAction, Long> {

    List<RecoveryAction> findByFaultId(Long faultId);

    List<RecoveryAction> findByNodeId(Long nodeId);

    List<RecoveryAction> findByStatus(String status);
}