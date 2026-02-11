package com.PlacementPortal.Placement.Sarthi.dto;

import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ParticipationDTO {

    private String id;

    private String studentAdmissionNumber;

    private String eventId;

    private String studentFirstName;

    private String studentLastName;

    private String studentDepartment;

    private String eventName;

    private String organizingCompany;

    private String jobRole;

    private LocalDateTime registrationStart;

    private String eventDescription;

    private String participationStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public ParticipationDTO(Participation p) {
        this.id = p.getId();
        this.studentAdmissionNumber = p.getStudentAdmissionNumber();
        this.eventId = p.getEventId();
        this.studentFirstName = p.getStudentFirstName();
        this.studentLastName = p.getStudentLastName();
        this.studentDepartment = p.getStudentDepartment();
        this.eventName = p.getEventName();
        this.organizingCompany = p.getOrganizingCompany();
        this.jobRole = p.getJobRole();
        this.registrationStart = p.getRegistrationStart();
        this.eventDescription = p.getEventDescription();
        this.participationStatus = p.getStatus() != null ? p.getStatus().name() : "REGISTERED";
        this.createdAt = p.getCreatedAt();
        this.updatedAt = p.getUpdatedAt();
    }
}