package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Event;
import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.repository.ParticipationRepository;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import com.PlacementPortal.Placement.Sarthi.service.EventService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;
    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            Event createdEvent = eventService.createEvent(event);
            return ResponseEntity.ok(createdEvent);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Error creating event: " + e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        Event event = eventService.getEventById(id);
        if (event != null) return ResponseEntity.ok(event);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<?> updateEvent(@PathVariable String eventId, @RequestBody Event event) {
        try {
            Event updated = eventService.updateEvent(eventId, event);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Error updating event: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deleteEvent(@PathVariable String eventId) {
        try {
            eventService.deleteEvent(eventId);
            return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Error deleting event: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Event>> getEventsByStatus(@PathVariable Event.EventStatus status) {
        return ResponseEntity.ok(eventService.getEventsByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEventsByCompany(@RequestParam String company) {
        return ResponseEntity.ok(eventService.searchEventsByCompany(company));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/ongoing")
    public ResponseEntity<List<Event>> getOngoingEvents() {
        return ResponseEntity.ok(eventService.getOngoingEvents());
    }

    @GetMapping("/past")
    public ResponseEntity<List<Event>> getPastEvents() {
        return ResponseEntity.ok(eventService.getPastEvents());
    }

    @GetMapping("/company/{companyName}")
    public ResponseEntity<List<Event>> getEventsByCompany(@PathVariable String companyName) {
        try {
            return ResponseEntity.ok(eventService.getEventsByCompany(companyName));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    // Get registered student count for an event
    @GetMapping("/{eventId}/registrations/count")
    public ResponseEntity<Map<String, Object>> getRegistrationCount(@PathVariable String eventId) {
        List<Participation> participations = participationRepository.findByEventId(eventId);
        return ResponseEntity.ok(Map.of(
                "eventId", eventId,
                "count", participations.size()
        ));
    }

    // Get registered students for an event
    @GetMapping("/{eventId}/registrations")
    public ResponseEntity<List<Map<String, Object>>> getRegisteredStudents(@PathVariable String eventId) {
        List<Participation> participations = participationRepository.findByEventId(eventId);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Participation p : participations) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("admissionNumber", p.getStudentAdmissionNumber());
            entry.put("status", p.getParticipationStatus() != null ? p.getParticipationStatus().toString() : "REGISTERED");
            entry.put("registeredAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
            entry.put("description", p.getEventDescription());

            // Fetch student details
            Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(p.getStudentAdmissionNumber());
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                entry.put("firstName", s.getStudentFirstName());
                entry.put("lastName", s.getStudentLastName());
                entry.put("department", s.getDepartment());
                entry.put("batch", s.getBatch());
                entry.put("cgpa", s.getCgpa());
                entry.put("email", s.getEmailId());
                entry.put("phone", s.getMobileNo());
                entry.put("tenthPercentage", s.getTenthPercentage());
                entry.put("twelfthPercentage", s.getTwelfthPercentage());
                entry.put("backLogsCount", s.getBackLogsCount());
                entry.put("course", s.getCourse());
                entry.put("universityRollNo", s.getStudentUniversityRollNo());
                entry.put("enrollmentNo", s.getStudentEnrollmentNo());
            }

            result.add(entry);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{eventId}/registrations/export")
    public ResponseEntity<byte[]> exportRegisteredStudents(@PathVariable String eventId) {
        try {
            List<Participation> participations = participationRepository.findByEventId(eventId);

            // Collect admission numbers
            List<String> admissionNumbers = participations.stream()
                    .map(Participation::getStudentAdmissionNumber)
                    .collect(Collectors.toList());

            // Fetch all students
            List<Student> students = new ArrayList<>();
            for (String admNo : admissionNumbers) {
                studentRepository.findByStudentAdmissionNumber(admNo).ifPresent(students::add);
            }

            // Build status map
            Map<String, String> statusMap = participations.stream()
                    .collect(Collectors.toMap(
                            Participation::getStudentAdmissionNumber,
                            p -> p.getParticipationStatus() != null ? p.getParticipationStatus().toString() : "REGISTERED",
                            (a, b) -> a
                    ));

            // Create Excel
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Registered Students");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Headers
            String[] headers = {
                    "Admission Number", "First Name", "Last Name", "Department", "Batch",
                    "Course", "CGPA", "10th %", "12th %", "Backlogs",
                    "Email", "Phone", "University Roll No", "Enrollment No", "Status"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            for (Student s : students) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(s.getStudentAdmissionNumber() != null ? s.getStudentAdmissionNumber() : "");
                row.createCell(1).setCellValue(s.getStudentFirstName() != null ? s.getStudentFirstName() : "");
                row.createCell(2).setCellValue(s.getStudentLastName() != null ? s.getStudentLastName() : "");
                row.createCell(3).setCellValue(s.getDepartment() != null ? s.getDepartment() : "");
                row.createCell(4).setCellValue(s.getBatch() != null ? s.getBatch() : "");
                row.createCell(5).setCellValue(s.getCourse() != null ? s.getCourse() : "");
                row.createCell(6).setCellValue(s.getCgpa() != null ? s.getCgpa() : 0);
                row.createCell(7).setCellValue(s.getTenthPercentage() != null ? s.getTenthPercentage() : 0);
                row.createCell(8).setCellValue(s.getTwelfthPercentage() != null ? s.getTwelfthPercentage() : 0);
                row.createCell(9).setCellValue(s.getBackLogsCount() != null ? s.getBackLogsCount() : 0);
                row.createCell(10).setCellValue(s.getEmailId() != null ? s.getEmailId() : "");
                row.createCell(11).setCellValue(s.getMobileNo() != null ? s.getMobileNo() : "");
                row.createCell(12).setCellValue(s.getStudentUniversityRollNo() != null ? s.getStudentUniversityRollNo() : "");
                row.createCell(13).setCellValue(s.getStudentEnrollmentNo() != null ? s.getStudentEnrollmentNo() : "");
                row.createCell(14).setCellValue(statusMap.getOrDefault(s.getStudentAdmissionNumber(), "REGISTERED"));
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();

            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            httpHeaders.setContentDispositionFormData("attachment", "registered_students_" + eventId + ".xlsx");

            return ResponseEntity.ok()
                    .headers(httpHeaders)
                    .body(outputStream.toByteArray());

        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}