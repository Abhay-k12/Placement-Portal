package com.PlacementPortal.Placement.Sarthi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "participation")
public class Participation {

    // Getters and Setters
    @EmbeddedId
    private ParticipationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentAdmissionNumber")
    @JoinColumn(name = "student_admission_number")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventId")
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(name = "event_description", columnDefinition = "TEXT")
    private String eventDescription;

    @Column(name = "participation_status")
    @Enumerated(EnumType.STRING)
    private ParticipationStatus status = ParticipationStatus.REGISTERED;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Embedded ID class
    @Data
    @NoArgsConstructor
    @Embeddable
    public static class ParticipationId implements java.io.Serializable {
        // Getters and Setters
        @Column(name = "student_admission_number")
        private String studentAdmissionNumber;

        @Column(name = "event_id")
        private Long eventId;

        public ParticipationId(String studentAdmissionNumber, Long eventId) {
            this.studentAdmissionNumber = studentAdmissionNumber;
            this.eventId = eventId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ParticipationId that)) return false;
            return studentAdmissionNumber.equals(that.studentAdmissionNumber) &&
                    eventId.equals(that.eventId);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(studentAdmissionNumber, eventId);
        }
    }

    // Enum for participation status
    public enum ParticipationStatus {
        REGISTERED, ATTEMPTED, COMPLETED, ABSENT, SELECTED, REJECTED
    }

    // Convenience constructor
    public Participation(Student student, Event event, String eventDescription) {
        this.student = student;
        this.event = event;
        this.eventDescription = eventDescription;
        this.id = new ParticipationId(student.getStudentAdmissionNumber(), event.getEventId());
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();

        // Ensure ID is set if not already
        if (id == null && student != null && event != null) {
            this.id = new ParticipationId(student.getStudentAdmissionNumber(), event.getEventId());
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    public void setStudent(Student student) {
        this.student = student;
        // Update ID when student is set
        if (this.id == null) {
            this.id = new ParticipationId();
        }
        this.id.setStudentAdmissionNumber(student != null ? student.getStudentAdmissionNumber() : null);
    }

    public void setEvent(Event event) {
        this.event = event;
        // Update ID when event is set
        if (this.id == null) {
            this.id = new ParticipationId();
        }
        this.id.setEventId(event != null ? event.getEventId() : null);
    }
}