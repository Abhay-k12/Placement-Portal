package com.PlacementPortal.Placement.Sarthi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "events")
public class Event {
    // Getters and Setters
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

}