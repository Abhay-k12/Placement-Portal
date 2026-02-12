package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Event;
import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import com.PlacementPortal.Placement.Sarthi.entity.Participation.ParticipationStatus;
import com.PlacementPortal.Placement.Sarthi.repository.EventRepository;
import com.PlacementPortal.Placement.Sarthi.repository.ParticipationRepository;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bulk-operations")
public class BulkOperationsController {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private EventRepository eventRepository;

    // Extract admission numbers from uploaded Excel
    @PostMapping("/extract-admission-numbers")
    public ResponseEntity<Map<String, Object>> extractAdmissionNumbers(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();

        try {
            Workbook workbook = WorkbookFactory.create(file.getInputStream());
            Sheet sheet = workbook.getSheetAt(0);

            List<String> admissionNumbers = new ArrayList<>();

            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell cell = row.getCell(0);
                if (cell == null) continue;

                String value = "";
                if (cell.getCellType() == CellType.STRING) {
                    value = cell.getStringCellValue().trim();
                } else if (cell.getCellType() == CellType.NUMERIC) {
                    value = String.valueOf((long) cell.getNumericCellValue());
                }

                if (!value.isEmpty() && !value.equalsIgnoreCase("admission number")
                        && !value.equalsIgnoreCase("admissionNumber")
                        && !value.equalsIgnoreCase("Admission No")) {
                    admissionNumbers.add(value);
                }
            }

            workbook.close();

            response.put("success", true);
            response.put("admissionNumbers", admissionNumbers);
            response.put("count", admissionNumbers.size());
            response.put("message", "Successfully extracted " + admissionNumbers.size() + " admission numbers");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error processing file: " + e.getMessage());
            return ResponseEntity.status(400).body(response);
        }
    }

    // Send OA Links — requires eventId, updates status to ATTEMPTED, rejects those not in list
    @PostMapping("/send-oa-links")
    public ResponseEntity<Map<String, Object>> sendOALinks(
            @RequestBody Map<String, Object> requestData,
            @RequestHeader(value = "Company-Name", required = false) String companyName) {

        Map<String, Object> response = new HashMap<>();

        try {
            String eventId = (String) requestData.get("eventId");
            List<String> studentAdmissionNumbers = (List<String>) requestData.get("studentAdmissionNumbers");
            String oaLink = (String) requestData.get("oaLink");
            String eventDescription = (String) requestData.get("eventDescription");

            if (eventId == null || eventId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Event ID is required");
                return ResponseEntity.status(400).body(response);
            }

            // Verify event exists
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Event not found: " + eventId);
                return ResponseEntity.status(404).body(response);
            }

            if (studentAdmissionNumbers == null || studentAdmissionNumbers.isEmpty()) {
                response.put("success", false);
                response.put("message", "No students provided");
                return ResponseEntity.status(400).body(response);
            }

            // Get all current participations for this event
            List<Participation> allParticipations = participationRepository.findByEventId(eventId);
            Set<String> allRegistered = allParticipations.stream()
                    .map(Participation::getStudentAdmissionNumber)
                    .collect(Collectors.toSet());

            Set<String> movingForward = new HashSet<>(studentAdmissionNumbers);

            int updatedCount = 0;
            int rejectedCount = 0;

            // Mark students in the list as ATTEMPTED (OA sent)
            for (Participation p : allParticipations) {
                String admNo = p.getStudentAdmissionNumber();

                if (movingForward.contains(admNo)) {
                    // Student is moving forward — mark as ATTEMPTED
                    p.setParticipationStatus(ParticipationStatus.ATTEMPTED);
                    p.setEventDescription(
                            (eventDescription != null ? eventDescription : "OA Link sent")
                                    + " | OA Link: " + (oaLink != null ? oaLink : "N/A")
                    );
                    participationRepository.save(p);
                    updatedCount++;
                } else {
                    // Student registered but NOT in the forward list — REJECTED
                    if (p.getParticipationStatus() == ParticipationStatus.REGISTERED) {
                        p.setParticipationStatus(ParticipationStatus.REJECTED);
                        p.setEventDescription("Not shortlisted for OA round");
                        participationRepository.save(p);
                        rejectedCount++;
                    }
                }
            }

            // Handle students in list but not yet registered
            int newRegistrations = 0;
            for (String admNo : studentAdmissionNumbers) {
                if (!allRegistered.contains(admNo)) {
                    Participation newParticipation = new Participation();
                    newParticipation.setStudentAdmissionNumber(admNo);
                    newParticipation.setEventId(eventId);
                    newParticipation.setParticipationStatus(ParticipationStatus.ATTEMPTED);
                    newParticipation.setEventDescription(
                            (eventDescription != null ? eventDescription : "OA Link sent")
                                    + " | OA Link: " + (oaLink != null ? oaLink : "N/A")
                    );
                    newParticipation.setCreatedAt(LocalDateTime.now());
                    participationRepository.save(newParticipation);
                    newRegistrations++;
                }
            }

            response.put("success", true);
            response.put("message", String.format(
                    "OA links processed: %d updated, %d rejected, %d new registrations",
                    updatedCount, rejectedCount, newRegistrations
            ));
            response.put("updatedCount", updatedCount);
            response.put("rejectedCount", rejectedCount);
            response.put("newRegistrations", newRegistrations);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Schedule Interviews — requires eventId, updates status, rejects others
    @PostMapping("/schedule-interviews")
    public ResponseEntity<Map<String, Object>> scheduleInterviews(
            @RequestBody Map<String, Object> requestData,
            @RequestHeader(value = "Company-Name", required = false) String companyName) {

        Map<String, Object> response = new HashMap<>();

        try {
            String eventId = (String) requestData.get("eventId");
            List<String> studentAdmissionNumbers = (List<String>) requestData.get("studentAdmissionNumbers");
            String interviewLink = (String) requestData.get("oaLink");
            String eventDescription = (String) requestData.get("eventDescription");

            if (eventId == null || eventId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Event ID is required");
                return ResponseEntity.status(400).body(response);
            }

            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Event not found: " + eventId);
                return ResponseEntity.status(404).body(response);
            }

            if (studentAdmissionNumbers == null || studentAdmissionNumbers.isEmpty()) {
                response.put("success", false);
                response.put("message", "No students provided");
                return ResponseEntity.status(400).body(response);
            }

            List<Participation> allParticipations = participationRepository.findByEventId(eventId);
            Set<String> allRegistered = allParticipations.stream()
                    .map(Participation::getStudentAdmissionNumber)
                    .collect(Collectors.toSet());

            Set<String> movingForward = new HashSet<>(studentAdmissionNumbers);

            int updatedCount = 0;
            int rejectedCount = 0;

            for (Participation p : allParticipations) {
                String admNo = p.getStudentAdmissionNumber();

                if (movingForward.contains(admNo)) {
                    p.setParticipationStatus(ParticipationStatus.ATTEMPTED);
                    p.setEventDescription(
                            (eventDescription != null ? eventDescription : "Interview scheduled")
                                    + " | Interview Link: " + (interviewLink != null ? interviewLink : "N/A")
                    );
                    participationRepository.save(p);
                    updatedCount++;
                } else {
                    // Only reject if they were previously ATTEMPTED (passed OA) or REGISTERED
                    if (p.getParticipationStatus() == ParticipationStatus.ATTEMPTED
                            || p.getParticipationStatus() == ParticipationStatus.REGISTERED) {
                        p.setParticipationStatus(ParticipationStatus.REJECTED);
                        p.setEventDescription("Not shortlisted for interview round");
                        participationRepository.save(p);
                        rejectedCount++;
                    }
                }
            }

            int newRegistrations = 0;
            for (String admNo : studentAdmissionNumbers) {
                if (!allRegistered.contains(admNo)) {
                    Participation newParticipation = new Participation();
                    newParticipation.setStudentAdmissionNumber(admNo);
                    newParticipation.setEventId(eventId);
                    newParticipation.setParticipationStatus(ParticipationStatus.ATTEMPTED);
                    newParticipation.setEventDescription(
                            (eventDescription != null ? eventDescription : "Interview scheduled")
                                    + " | Interview Link: " + (interviewLink != null ? interviewLink : "N/A")
                    );
                    newParticipation.setCreatedAt(LocalDateTime.now());
                    participationRepository.save(newParticipation);
                    newRegistrations++;
                }
            }

            response.put("success", true);
            response.put("message", String.format(
                    "Interviews processed: %d updated, %d rejected, %d new",
                    updatedCount, rejectedCount, newRegistrations
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Final Selection — marks students as SELECTED, others as REJECTED
    @PostMapping("/final-selection")
    public ResponseEntity<Map<String, Object>> finalSelection(
            @RequestBody Map<String, Object> requestData) {

        Map<String, Object> response = new HashMap<>();

        try {
            String eventId = (String) requestData.get("eventId");
            List<String> selectedStudents = (List<String>) requestData.get("studentAdmissionNumbers");

            if (eventId == null || eventId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Event ID is required");
                return ResponseEntity.status(400).body(response);
            }

            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Event not found: " + eventId);
                return ResponseEntity.status(404).body(response);
            }

            if (selectedStudents == null || selectedStudents.isEmpty()) {
                response.put("success", false);
                response.put("message", "No students provided for final selection");
                return ResponseEntity.status(400).body(response);
            }

            List<Participation> allParticipations = participationRepository.findByEventId(eventId);
            Set<String> selectedSet = new HashSet<>(selectedStudents);

            int selectedCount = 0;
            int rejectedCount = 0;

            for (Participation p : allParticipations) {
                String admNo = p.getStudentAdmissionNumber();

                if (selectedSet.contains(admNo)) {
                    p.setParticipationStatus(ParticipationStatus.SELECTED);
                    p.setEventDescription("Congratulations! Final selection confirmed for " + eventOpt.get().getEventName());
                    participationRepository.save(p);
                    selectedCount++;
                } else {
                    // Only reject those not already rejected
                    if (p.getParticipationStatus() != ParticipationStatus.REJECTED
                            && p.getParticipationStatus() != ParticipationStatus.SELECTED) {
                        p.setParticipationStatus(ParticipationStatus.REJECTED);
                        p.setEventDescription("Not selected in final round");
                        participationRepository.save(p);
                        rejectedCount++;
                    }
                }
            }

            response.put("success", true);
            response.put("message", String.format(
                    "Final selection complete: %d selected, %d rejected",
                    selectedCount, rejectedCount
            ));
            response.put("selectedCount", selectedCount);
            response.put("rejectedCount", rejectedCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}