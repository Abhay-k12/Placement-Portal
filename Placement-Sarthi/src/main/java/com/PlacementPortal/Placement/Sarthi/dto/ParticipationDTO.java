package com.PlacementPortal.Placement.Sarthi.dto;

import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import java.time.LocalDateTime;

public class ParticipationDTO {
    private String studentAdmissionNumber;
    private Long eventId;
    private String eventDescription;
    private Participation.ParticipationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Event details
    private String eventName;
    private String organizingCompany;
    private String jobRole;
    private LocalDateTime registrationStart;
    private LocalDateTime registrationEnd;
    private String eventMode;
    private Double expectedPackage;

    public ParticipationDTO(Participation participation) {
        this.studentAdmissionNumber = participation.getStudent().getStudentAdmissionNumber();
        this.eventId = participation.getEvent().getEventId();
        this.eventDescription = participation.getEventDescription();
        this.status = participation.getStatus();
        this.createdAt = participation.getCreatedAt();
        this.updatedAt = participation.getUpdatedAt();

        // Event details
        this.eventName = participation.getEvent().getEventName();
        this.organizingCompany = participation.getEvent().getOrganizingCompany();
        this.jobRole = participation.getEvent().getJobRole();
        this.registrationStart = participation.getEvent().getRegistrationStart();
        this.registrationEnd = participation.getEvent().getRegistrationEnd();
        this.eventMode = participation.getEvent().getEventMode().name();
        this.expectedPackage = participation.getEvent().getExpectedPackage();
    }

    // Getters and setters
    public String getStudentAdmissionNumber() { return studentAdmissionNumber; }
    public void setStudentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventDescription() { return eventDescription; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }

    public Participation.ParticipationStatus getStatus() { return status; }
    public void setStatus(Participation.ParticipationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public String getOrganizingCompany() { return organizingCompany; }
    public void setOrganizingCompany(String organizingCompany) { this.organizingCompany = organizingCompany; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public LocalDateTime getRegistrationStart() { return registrationStart; }
    public void setRegistrationStart(LocalDateTime registrationStart) { this.registrationStart = registrationStart; }

    public LocalDateTime getRegistrationEnd() { return registrationEnd; }
    public void setRegistrationEnd(LocalDateTime registrationEnd) { this.registrationEnd = registrationEnd; }

    public String getEventMode() { return eventMode; }
    public void setEventMode(String eventMode) { this.eventMode = eventMode; }

    public Double getExpectedPackage() { return expectedPackage; }
    public void setExpectedPackage(Double expectedPackage) { this.expectedPackage = expectedPackage; }
}
