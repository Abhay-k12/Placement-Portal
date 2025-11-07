package com.PlacementPortal.Placement.Sarthi.repository;


import com.PlacementPortal.Placement.Sarthi.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizingCompanyContainingIgnoreCase(String companyName);
    List<Event> findByStatus(Event.EventStatus status);
    List<Event> findByRegistrationStartAfter(LocalDateTime date);
    List<Event> findByRegistrationStartBeforeAndRegistrationEndAfter(LocalDateTime startDate, LocalDateTime endDate);
    List<Event> findByRegistrationEndBefore(LocalDateTime date);
}
