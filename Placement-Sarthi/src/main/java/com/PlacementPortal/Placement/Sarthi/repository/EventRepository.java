package com.PlacementPortal.Placement.Sarthi.repository;

import com.PlacementPortal.Placement.Sarthi.entity.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByOrganizingCompanyContainingIgnoreCase(String companyName);
    List<Event> findByStatus(Event.EventStatus status);
    List<Event> findByRegistrationStartAfter(LocalDateTime date);
    List<Event> findByRegistrationStartBeforeAndRegistrationEndAfter(LocalDateTime startDate, LocalDateTime endDate);
    List<Event> findByRegistrationEndBefore(LocalDateTime date);
}