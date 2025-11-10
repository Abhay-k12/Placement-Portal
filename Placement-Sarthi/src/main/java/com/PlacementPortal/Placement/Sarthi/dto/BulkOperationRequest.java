package com.PlacementPortal.Placement.Sarthi.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BulkOperationRequest {
    private List<String> studentAdmissionNumbers;
    private String eventName;
    private String eventDescription;
    private String oaLink;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String jobRole;
    private Double expectedCgpa;

    // Constructors
    public BulkOperationRequest() {}

    public BulkOperationRequest(List<String> studentAdmissionNumbers, String eventName,
                                String eventDescription, String oaLink,
                                LocalDateTime startDate, LocalDateTime endDate) {
        this.studentAdmissionNumbers = studentAdmissionNumbers;
        this.eventName = eventName;
        this.eventDescription = eventDescription;
        this.oaLink = oaLink;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public List<String> getStudentAdmissionNumbers() { return studentAdmissionNumbers; }
    public void setStudentAdmissionNumbers(List<String> studentAdmissionNumbers) { this.studentAdmissionNumbers = studentAdmissionNumbers; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public String getEventDescription() { return eventDescription; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }

    public String getOaLink() { return oaLink; }
    public void setOaLink(String oaLink) { this.oaLink = oaLink; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public Double getExpectedCgpa() { return expectedCgpa; }
    public void setExpectedCgpa(Double expectedCgpa) { this.expectedCgpa = expectedCgpa; }
}