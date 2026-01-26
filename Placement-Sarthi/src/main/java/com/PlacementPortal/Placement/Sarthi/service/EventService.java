package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Event;
import java.util.List;

public interface EventService {
    Event createEvent(Event event);
    List<Event> getAllEvents();
    Event getEventById(Long eventId);
    Event updateEvent(Long eventId, Event eventDetails);
    void deleteEvent(Long eventId);
    List<Event> getEventsByStatus(Event.EventStatus status);
    List<Event> searchEventsByCompany(String companyName);
    List<Event> getUpcomingEvents();
    List<Event> getOngoingEvents();
    List<Event> getPastEvents();
    List<Event> getEventsByCompany(String companyName);
}