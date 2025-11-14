package com.PlacementPortal.Placement.Sarthi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participation")
public class Participation {

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
    @Embeddable
    public static class ParticipationId implements java.io.Serializable {
        @Column(name = "student_admission_number")
        private String studentAdmissionNumber;

        @Column(name = "event_id")
        private Long eventId;

        public ParticipationId() {}

        public ParticipationId(String studentAdmissionNumber, Long eventId) {
            this.studentAdmissionNumber = studentAdmissionNumber;
            this.eventId = eventId;
        }

        // Getters and Setters
        public String getStudentAdmissionNumber() { return studentAdmissionNumber; }
        public void setStudentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; }

        public Long getEventId() { return eventId; }
        public void setEventId(Long eventId) { this.eventId = eventId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ParticipationId)) return false;
            ParticipationId that = (ParticipationId) o;
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

    // Default constructor
    public Participation() {}

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

    // Getters and Setters
    public ParticipationId getId() { return id; }
    public void setId(ParticipationId id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) {
        this.student = student;
        // Update ID when student is set
        if (this.id == null) {
            this.id = new ParticipationId();
        }
        this.id.setStudentAdmissionNumber(student != null ? student.getStudentAdmissionNumber() : null);
    }

    public Event getEvent() { return event; }
    public void setEvent(Event event) {
        this.event = event;
        // Update ID when event is set
        if (this.id == null) {
            this.id = new ParticipationId();
        }
        this.id.setEventId(event != null ? event.getEventId() : null);
    }

    public String getEventDescription() { return eventDescription; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }

    public ParticipationStatus getStatus() { return status; }
    public void setStatus(ParticipationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}