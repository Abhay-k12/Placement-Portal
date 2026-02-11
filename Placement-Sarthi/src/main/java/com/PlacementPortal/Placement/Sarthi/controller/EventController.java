package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Event;
import com.PlacementPortal.Placement.Sarthi.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping("/create")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        Event event = eventService.getEventById(id);
        if (event != null) return ResponseEntity.ok(event);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id, @RequestBody Event eventDetails) {
        Event updatedEvent = eventService.updateEvent(id, eventDetails);
        if (updatedEvent != null) return ResponseEntity.ok(updatedEvent);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Event>> getEventsByStatus(@PathVariable Event.EventStatus status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEventsByCompany(@RequestParam String company) {
        return ResponseEntity.ok(eventService.searchEventsByCompany(company));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/ongoing")
    public ResponseEntity<List<Event>> getOngoingEvents() {
        return ResponseEntity.ok(eventService.getOngoingEvents());
    }

    @GetMapping("/past")
    public ResponseEntity<List<Event>> getPastEvents() {
        return ResponseEntity.ok(eventService.getPastEvents());
    }

    @GetMapping("/company/{companyName}")
    public ResponseEntity<List<Event>> getEventsByCompany(@PathVariable String companyName) {
        try {
            return ResponseEntity.ok(eventService.getEventsByCompany(companyName));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}