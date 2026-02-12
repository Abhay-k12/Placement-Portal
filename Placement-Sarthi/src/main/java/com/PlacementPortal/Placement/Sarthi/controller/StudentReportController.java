package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Event;
import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.repository.EventRepository;
import com.PlacementPortal.Placement.Sarthi.repository.ParticipationRepository;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class StudentReportController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    @GetMapping("/student/{admissionNumber}")
    public ResponseEntity<Map<String, Object>> getStudentReport(
            @PathVariable String admissionNumber) {

        // Find the student
        Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(admissionNumber);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Student not found: " + admissionNumber
            ));
        }

        Student student = studentOpt.get();

        // Get all participations for this student (only events they registered for)
        List<Participation> participations = participationRepository
                .findByStudentAdmissionNumber(admissionNumber);

        if (participations.isEmpty()) {
            // Student exists but never registered for any event
            Map<String, Object> studentInfo = buildStudentInfo(student);

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("totalRegistered", 0);
            summary.put("totalSelected", 0);
            summary.put("totalRejected", 0);
            summary.put("totalAttempted", 0);
            summary.put("totalAbsent", 0);
            summary.put("totalCompleted", 0);

            Map<String, Object> report = new LinkedHashMap<>();
            report.put("success", true);
            report.put("student", studentInfo);
            report.put("summary", summary);
            report.put("events", Collections.emptyList());

            return ResponseEntity.ok(report);
        }

        // Get event IDs from participations
        Set<String> eventIds = participations.stream()
                .map(Participation::getEventId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Fetch all those events
        List<Event> events = eventRepository.findAllById(eventIds);
        Map<String, Event> eventMap = events.stream()
                .collect(Collectors.toMap(Event::getEventId, e -> e, (a, b) -> a));

        // Build event history list
        List<Map<String, Object>> eventHistory = new ArrayList<>();
        int totalSelected = 0;
        int totalRejected = 0;
        int totalAttempted = 0;
        int totalAbsent = 0;
        int totalCompleted = 0;
        int totalRegistered = 0;

        for (Participation participation : participations) {
            Event event = eventMap.get(participation.getEventId());

            Map<String, Object> eventInfo = new LinkedHashMap<>();

            // Event details (from Event collection)
            if (event != null) {
                eventInfo.put("eventId", event.getEventId());
                eventInfo.put("eventName", event.getEventName());
                eventInfo.put("organizingCompany", event.getOrganizingCompany());
                eventInfo.put("jobRole", event.getJobRole());
                eventInfo.put("registrationStart", event.getRegistrationStart() != null ? event.getRegistrationStart().toString() : "");
                eventInfo.put("registrationEnd", event.getRegistrationEnd() != null ? event.getRegistrationEnd().toString() : "");
                eventInfo.put("expectedCgpa", event.getExpectedCgpa());
                eventInfo.put("expectedPackage", event.getExpectedPackage());
                eventInfo.put("eventMode", event.getEventMode() != null ? event.getEventMode().toString() : "");
            } else {
                // Event might have been deleted, use participation data
                eventInfo.put("eventId", participation.getEventId());
                eventInfo.put("eventName", "Event Removed");
                eventInfo.put("organizingCompany", "Unknown");
                eventInfo.put("jobRole", "N/A");
                eventInfo.put("registrationStart", "");
                eventInfo.put("registrationEnd", "");
                eventInfo.put("expectedCgpa", null);
                eventInfo.put("expectedPackage", null);
                eventInfo.put("eventMode", "");
            }

            // Participation details
            String status = participation.getParticipationStatus() != null
                    ? participation.getParticipationStatus().toString()
                    : "REGISTERED";
            eventInfo.put("status", status);
            eventInfo.put("description", participation.getEventDescription() != null
                    ? participation.getEventDescription() : "");
            eventInfo.put("registeredAt", participation.getCreatedAt() != null
                    ? participation.getCreatedAt().toString() : "");

            eventHistory.add(eventInfo);

            // Count statuses
            switch (status) {
                case "SELECTED": totalSelected++; break;
                case "REJECTED": totalRejected++; break;
                case "ATTEMPTED": totalAttempted++; break;
                case "ABSENT": totalAbsent++; break;
                case "COMPLETED": totalCompleted++; break;
                default: totalRegistered++; break;
            }
        }

        // Build response
        Map<String, Object> studentInfo = buildStudentInfo(student);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRegistered", participations.size());
        summary.put("totalSelected", totalSelected);
        summary.put("totalRejected", totalRejected);
        summary.put("totalAttempted", totalAttempted);
        summary.put("totalAbsent", totalAbsent);
        summary.put("totalCompleted", totalCompleted);
        summary.put("totalPending", totalRegistered);

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("success", true);
        report.put("student", studentInfo);
        report.put("summary", summary);
        report.put("events", eventHistory);

        return ResponseEntity.ok(report);
    }

    private Map<String, Object> buildStudentInfo(Student student) {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("admissionNumber", student.getStudentAdmissionNumber());
        info.put("name", ((student.getStudentFirstName() != null ? student.getStudentFirstName() : "")
                + " " + (student.getStudentLastName() != null ? student.getStudentLastName() : "")).trim());
        info.put("department", student.getDepartment());
        info.put("batch", student.getBatch());
        info.put("cgpa", student.getCgpa());
        info.put("course", student.getCourse());
        info.put("email", student.getEmailId());
        info.put("phone", student.getMobileNo());
        info.put("tenthPercentage", student.getTenthPercentage());
        info.put("twelfthPercentage", student.getTwelfthPercentage());
        info.put("backLogsCount", student.getBackLogsCount());
        return info;
    }
}