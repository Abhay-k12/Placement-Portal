package com.PlacementPortal.Placement.Sarthi.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "events")
public class Event {

    @Id
    private String eventId;

    private String eventName;

    private String organizingCompany;

    private Double expectedCgpa;

    private String jobRole;

    private LocalDateTime registrationStart;

    private LocalDateTime registrationEnd;

    private EventMode eventMode = EventMode.ONLINE;

    private Double expectedPackage;

    private String eventDescription;

    private List<String> eligibleDepartments;

    private EventStatus status = EventStatus.UPCOMING;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum EventMode {
        ONLINE, OFFLINE, HYBRID
    }

    public enum EventStatus {
        UPCOMING, ONGOING, COMPLETED, CANCELLED
    }

    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}