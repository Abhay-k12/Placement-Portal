package com.PlacementPortal.Placement.Sarthi.dto;

import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ParticipationDTO {
    // Getters and setters
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

}