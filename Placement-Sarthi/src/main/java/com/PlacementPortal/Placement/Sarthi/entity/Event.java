// src/main/java/com/placementPortal/PlacementSarthi/entity/Event.java
package com.PlacementPortal.Placement.Sarthi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(name = "organizing_company", nullable = false)
    private String organizingCompany;

    @Column(name = "expected_cgpa")
    private Double expectedCgpa;

    @Column(name = "job_role", length = 100)
    private String jobRole;

    @Column(name = "registration_start", nullable = false)
    private LocalDateTime registrationStart;

    @Column(name = "registration_end", nullable = false)
    private LocalDateTime registrationEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_mode")
    private EventMode eventMode = EventMode.ONLINE;

    @Column(name = "expected_package")
    private Double expectedPackage;

    @Column(name = "event_description", columnDefinition = "TEXT", nullable = false)
    private String eventDescription;

    @Column(name = "eligible_departments", columnDefinition = "JSON")
    private String eligibleDepartments;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EventStatus status = EventStatus.UPCOMING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enums
    public enum EventMode {
        ONLINE, OFFLINE, HYBRID
    }

    public enum EventStatus {
        UPCOMING, ONGOING, COMPLETED, CANCELLED
    }

    // Constructors
    public Event() {}

    public Event(String eventName, String organizingCompany, Double expectedCgpa, String jobRole,
                 LocalDateTime registrationStart, LocalDateTime registrationEnd, EventMode eventMode,
                 Double expectedPackage, String eventDescription, String eligibleDepartments) {
        this.eventName = eventName;
        this.organizingCompany = organizingCompany;
        this.expectedCgpa = expectedCgpa;
        this.jobRole = jobRole;
        this.registrationStart = registrationStart;
        this.registrationEnd = registrationEnd;
        this.eventMode = eventMode;
        this.expectedPackage = expectedPackage;
        this.eventDescription = eventDescription;
        this.eligibleDepartments = eligibleDepartments;
    }

    // PrePersist and PreUpdate methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public String getOrganizingCompany() { return organizingCompany; }
    public void setOrganizingCompany(String organizingCompany) { this.organizingCompany = organizingCompany; }

    public Double getExpectedCgpa() { return expectedCgpa; }
    public void setExpectedCgpa(Double expectedCgpa) { this.expectedCgpa = expectedCgpa; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public LocalDateTime getRegistrationStart() { return registrationStart; }
    public void setRegistrationStart(LocalDateTime registrationStart) { this.registrationStart = registrationStart; }

    public LocalDateTime getRegistrationEnd() { return registrationEnd; }
    public void setRegistrationEnd(LocalDateTime registrationEnd) { this.registrationEnd = registrationEnd; }

    public EventMode getEventMode() { return eventMode; }
    public void setEventMode(EventMode eventMode) { this.eventMode = eventMode; }

    public Double getExpectedPackage() { return expectedPackage; }
    public void setExpectedPackage(Double expectedPackage) { this.expectedPackage = expectedPackage; }

    public String getEventDescription() { return eventDescription; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }

    public String getEligibleDepartments() { return eligibleDepartments; }
    public void setEligibleDepartments(String eligibleDepartments) { this.eligibleDepartments = eligibleDepartments; }

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}