package com.PlacementPortal.Placement.Sarthi.repository;

import com.PlacementPortal.Placement.Sarthi.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findAllByOrderByCreatedAtDesc();

    List<Message> findByStatusOrderByCreatedAtDesc(String status);

    List<Message> findBySenderEmailContainingIgnoreCaseOrSubjectContainingIgnoreCaseOrMessageContainingIgnoreCase(
            String email, String subject, String message);

    long countByStatus(String status);
}