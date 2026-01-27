package com.PlacementPortal.Placement.Sarthi.service.impl;


import com.PlacementPortal.Placement.Sarthi.entity.Event;
import com.PlacementPortal.Placement.Sarthi.repository.EventRepository;
import com.PlacementPortal.Placement.Sarthi.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Override
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Event getEventById(Long eventId) {
        Optional<Event> event = eventRepository.findById(eventId);
        return event.orElse(null);
    }

    @Override
    public Event updateEvent(Long eventId, Event eventDetails) {
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
            return eventRepository.save(event);
        }
        return null;
    }

    @Override
    public void deleteEvent(Long eventId) {
        eventRepository.deleteById(eventId);
    }

    @Override
    public List<Event> getEventsByStatus(Event.EventStatus status) {
        return eventRepository.findByStatus(status);
    }

    @Override
    public List<Event> searchEventsByCompany(String companyName) {
        return eventRepository.findByOrganizingCompanyContainingIgnoreCase(companyName);
    }

    @Override
    public List<Event> getUpcomingEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByRegistrationStartAfter(now);
    }

    @Override
    public List<Event> getOngoingEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByRegistrationStartBeforeAndRegistrationEndAfter(now, now);
    }

    @Override
    public List<Event> getPastEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findByRegistrationEndBefore(now);
    }

    @Override
    public List<Event> getEventsByCompany(String companyName) {
        return eventRepository.findByOrganizingCompanyContainingIgnoreCase(companyName);
    }
}