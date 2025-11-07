package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Event;
import com.PlacementPortal.Placement.Sarthi.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:8081")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping("/create")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event createdEvent = eventService.createEvent(event);
        return ResponseEntity.ok(createdEvent);
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        if (event != null) {
            return ResponseEntity.ok(event);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event eventDetails) {
        Event updatedEvent = eventService.updateEvent(id, eventDetails);
        if (updatedEvent != null) {
            return ResponseEntity.ok(updatedEvent);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Event>> getEventsByStatus(@PathVariable Event.EventStatus status) {
        List<Event> events = eventService.getEventsByStatus(status);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEventsByCompany(@RequestParam String company) {
        List<Event> events = eventService.searchEventsByCompany(company);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        List<Event> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/ongoing")
    public ResponseEntity<List<Event>> getOngoingEvents() {
        List<Event> events = eventService.getOngoingEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/past")
    public ResponseEntity<List<Event>> getPastEvents() {
        List<Event> events = eventService.getPastEvents();
        return ResponseEntity.ok(events);
    }
}
