package com.PlacementPortal.Placement.Sarthi.repository;

import com.PlacementPortal.Placement.Sarthi.entity.Message;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findAllByOrderByCreatedAtDesc();

    List<Message> findByStatusOrderByCreatedAtDesc(String status);

    List<Message> findBySenderEmailContainingIgnoreCaseOrSubjectContainingIgnoreCaseOrMessageContainingIgnoreCase(
            String email, String subject, String message);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.status = :status WHERE m.id = :id")
    void updateStatus(@Param("id") Long id, @Param("status") String status);

    long countByStatus(String status);
}