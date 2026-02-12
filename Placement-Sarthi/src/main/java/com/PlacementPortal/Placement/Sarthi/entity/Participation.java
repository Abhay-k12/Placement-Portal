package com.PlacementPortal.Placement.Sarthi.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "participations")
@CompoundIndex(name = "student_event_idx", def = "{'studentAdmissionNumber': 1, 'eventId': 1}", unique = true)
public class Participation {

    @Id
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

    private ParticipationStatus status = ParticipationStatus.REGISTERED;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum ParticipationStatus {
        REGISTERED, ATTEMPTED, COMPLETED, ABSENT, SELECTED, REJECTED
    }

    public Participation(String studentAdmissionNumber, String eventId, String eventDescription) {
        this.studentAdmissionNumber = studentAdmissionNumber;
        this.eventId = eventId;
        this.eventDescription = eventDescription;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ParticipationStatus getParticipationStatus() {
        return status;
    }

    public void setParticipationStatus(ParticipationStatus participationStatus) {
        this.status = participationStatus;
    }
}