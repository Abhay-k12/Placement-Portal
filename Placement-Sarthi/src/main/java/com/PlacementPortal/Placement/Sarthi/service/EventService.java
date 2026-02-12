package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Event;
import com.PlacementPortal.Placement.Sarthi.repository.EventRepository;
import com.PlacementPortal.Placement.Sarthi.repository.ParticipationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    public Event createEvent(Event event) {
        event.onCreate();
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(String eventId) {
        return eventRepository.findById(eventId).orElse(null);
    }

    public Event updateEvent(String eventId, Event eventDetails) {
        Optional<Event> optionalEvent = eventRepository.findById(eventId);
        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            event.setEventName(eventDetails.getEventName());
            event.setOrganizingCompany(eventDetails.getOrganizingCompany());
            event.setExpectedCgpa(eventDetails.getExpectedCgpa());
            event.setJobRole(eventDetails.getJobRole());
            event.setRegistrationStart(eventDetails.getRegistrationStart());
            event.setRegistrationEnd(eventDetails.getRegistrationEnd());
            event.setEventMode(eventDetails.getEventMode());
            event.setExpectedPackage(eventDetails.getExpectedPackage());
            event.setEventDescription(eventDetails.getEventDescription());
            event.setEligibleDepartments(eventDetails.getEligibleDepartments());
            event.setStatus(eventDetails.getStatus());
            event.onUpdate();
            return eventRepository.save(event);
        }
        return null;
    }

    @Transactional
    public void deleteEvent(String eventId) throws Exception {
        try {
            participationRepository.deleteByEventId(eventId);
            logger.info("Deleted all participation records for event: {}", eventId);
        } catch (Exception e) {
            logger.error("Error deleting participations for event {}: {}", eventId, e.getMessage());
            throw new IllegalAccessException("Error deleting participations for event : "+ eventId+ ": "+ e.getMessage());
        }
        eventRepository.deleteById(eventId);
        logger.info("Deleted event: {}", eventId);
    }

    public List<Event> getEventsByStatus(Event.EventStatus status) {
        return eventRepository.findByStatus(status);
    }

    public List<Event> searchEventsByCompany(String companyName) {
        return eventRepository.findByOrganizingCompanyContainingIgnoreCase(companyName);
    }

    public List<Event> getUpcomingEvents() {
        return eventRepository.findByRegistrationStartAfter(LocalDateTime.now());
    }

    public List<Event> getOngoingEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByRegistrationStartBeforeAndRegistrationEndAfter(now, now);
    }

    public List<Event> getPastEvents() {
        return eventRepository.findByRegistrationEndBefore(LocalDateTime.now());
    }

    public List<Event> getEventsByCompany(String companyName) {
        return eventRepository.findByOrganizingCompanyContainingIgnoreCase(companyName);
    }

    public String generateEventId(String companyName) {
        String cleanName = companyName.trim()
                .replaceAll("\\s+", "")
                .toUpperCase();

        // Limiting company name part to 5 chars
        if (cleanName.length() > 10) {
            cleanName = cleanName.substring(0, 10);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("ddMMyyHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);

        return cleanName + "-" + timestamp;
    }
}