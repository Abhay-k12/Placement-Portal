package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.dto.BulkOperationRequest;
import com.PlacementPortal.Placement.Sarthi.entity.*;
import com.PlacementPortal.Placement.Sarthi.repository.EventRepository;
import com.PlacementPortal.Placement.Sarthi.repository.ParticipationRepository;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BulkOperationsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    // ADD THIS MISSING METHOD
    public List<String> extractAdmissionNumbersFromExcel(MultipartFile file) {
        List<String> admissionNumbers = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip header row
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Skip empty rows
                if (isRowEmpty(currentRow)) {
                    continue;
                }

                // Get admission number from first column
                Cell admissionNumberCell = currentRow.getCell(0);
                if (admissionNumberCell != null && !isCellEmpty(admissionNumberCell)) {
                    String admissionNumber = getStringCellValue(admissionNumberCell);
                    if (admissionNumber != null && !admissionNumber.trim().isEmpty()) {
                        admissionNumbers.add(admissionNumber.trim());
                    }
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("Error processing Excel file: " + e.getMessage());
        }

        return admissionNumbers;
    }

    @Transactional
    public String sendOALinks(BulkOperationRequest request, String companyName) {
        try {
            // Create event for OA
            Event oaEvent = new Event();
            oaEvent.setEventName(request.getEventName() + " - Online Assessment");
            oaEvent.setOrganizingCompany(companyName);

            // Enhanced event description with OA details
            String eventDescription = request.getEventDescription() +
                    "\n\nOnline Assessment Details:\n" +
                    "Assessment Link: " + request.getOaLink() + "\n" +
                    "Available From: " + formatDateTime(request.getStartDate()) + "\n" +
                    "Available Until: " + formatDateTime(request.getEndDate()) + "\n" +
                    "Job Role: " + (request.getJobRole() != null ? request.getJobRole() : "Not specified") + "\n" +
                    "Minimum CGPA: " + (request.getExpectedCgpa() != null ? request.getExpectedCgpa() : "Not specified");

            oaEvent.setEventDescription(eventDescription);
            oaEvent.setRegistrationStart(request.getStartDate());
            oaEvent.setRegistrationEnd(request.getEndDate());
            oaEvent.setJobRole(request.getJobRole());
            oaEvent.setExpectedCgpa(request.getExpectedCgpa());
            oaEvent.setEventMode(Event.EventMode.ONLINE);
            oaEvent.setStatus(Event.EventStatus.UPCOMING);

            Event savedEvent = eventRepository.save(oaEvent);
            System.out.println("Created event with ID: " + savedEvent.getEventId());

            // Create participations for each student
            int successCount = 0;
            List<String> notFoundStudents = new ArrayList<>();
            List<String> alreadyRegistered = new ArrayList<>();

            for (String admissionNumber : request.getStudentAdmissionNumbers()) {
                Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(admissionNumber);

                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();

                    // Check if participation DOES NOT exist
                    boolean exists = participationRepository.existsByStudentAndEvent(student, savedEvent);

                    if (!exists) {
                        try {
                            // Create new participation using the convenience constructor
                            Participation participation = new Participation(student, savedEvent,
                                    "Online Assessment Invitation\n" +
                                            "Assessment Link: " + request.getOaLink() + "\n" +
                                            "Time Window: " + formatDateTime(request.getStartDate()) + " to " +
                                            formatDateTime(request.getEndDate()) + "\n" +
                                            "Instructions: " + request.getEventDescription());

                            participation.setStatus(Participation.ParticipationStatus.REGISTERED);

                            Participation savedParticipation = participationRepository.save(participation);
                            System.out.println("Created participation for student: " + admissionNumber + " with event: " + savedEvent.getEventId());
                            successCount++;

                        } catch (Exception e) {
                            System.err.println("Error creating participation for student " + admissionNumber + ": " + e.getMessage());
                            notFoundStudents.add(admissionNumber + " (participation error)");
                        }
                    } else {
                        alreadyRegistered.add(admissionNumber);
                    }
                } else {
                    notFoundStudents.add(admissionNumber);
                }
            }

            StringBuilder result = new StringBuilder();
            result.append("Successfully sent OA links to ").append(successCount).append(" students.");

            if (!notFoundStudents.isEmpty()) {
                result.append("\nStudents not found/errors: ").append(String.join(", ", notFoundStudents));
            }

            if (!alreadyRegistered.isEmpty()) {
                result.append("\nAlready registered: ").append(String.join(", ", alreadyRegistered));
            }

            System.out.println("Final result: " + result.toString());
            return result.toString();

        } catch (Exception e) {
            System.err.println("Error in sendOALinks: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error sending OA links: " + e.getMessage());
        }
    }

    @Transactional
    public String scheduleInterviews(BulkOperationRequest request, String companyName) {
        try {
            // Create event for interviews
            Event interviewEvent = new Event();
            interviewEvent.setEventName(request.getEventName() + " - Interview");
            interviewEvent.setOrganizingCompany(companyName);

            // Determine if it's online or offline based on the link
            boolean isOnline = request.getOaLink().toLowerCase().contains("http") ||
                    request.getOaLink().toLowerCase().contains("meet") ||
                    request.getOaLink().toLowerCase().contains("zoom");

            String eventDescription = request.getEventDescription() +
                    "\n\nInterview Details:\n" +
                    (isOnline ? "🔗 Interview Link: " : " Interview Venue: ") + request.getOaLink() + "\n" +
                    "Scheduled From: " + formatDateTime(request.getStartDate()) + "\n" +
                    "Scheduled Until: " + formatDateTime(request.getEndDate()) + "\n" +
                    "Job Role: " + (request.getJobRole() != null ? request.getJobRole() : "Not specified") + "\n" +
                    "Minimum CGPA: " + (request.getExpectedCgpa() != null ? request.getExpectedCgpa() : "Not specified");

            interviewEvent.setEventDescription(eventDescription);
            interviewEvent.setRegistrationStart(request.getStartDate());
            interviewEvent.setRegistrationEnd(request.getEndDate());
            interviewEvent.setJobRole(request.getJobRole());
            interviewEvent.setExpectedCgpa(request.getExpectedCgpa());
            interviewEvent.setEventMode(isOnline ? Event.EventMode.ONLINE : Event.EventMode.OFFLINE);
            interviewEvent.setStatus(Event.EventStatus.UPCOMING);

            Event savedEvent = eventRepository.save(interviewEvent);
            System.out.println("Created interview event with ID: " + savedEvent.getEventId());

            // Create participations for each student
            int successCount = 0;
            List<String> notFoundStudents = new ArrayList<>();
            List<String> alreadyRegistered = new ArrayList<>();

            for (String admissionNumber : request.getStudentAdmissionNumbers()) {
                Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(admissionNumber);

                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();

                    // Check if participation DOES NOT exist
                    boolean exists = participationRepository.existsByStudentAndEvent(student, savedEvent);

                    if (!exists) {
                        try {
                            // Create new participation using the convenience constructor
                            Participation participation = new Participation(student, savedEvent,
                                    "Interview Scheduled\n" +
                                            (isOnline ? "Interview Link: " : "Venue: ") + request.getOaLink() + "\n" +
                                            "Time: " + formatDateTime(request.getStartDate()) + " to " +
                                            formatDateTime(request.getEndDate()) + "\n" +
                                            "Preparation: " + request.getEventDescription());

                            participation.setStatus(Participation.ParticipationStatus.REGISTERED);

                            Participation savedParticipation = participationRepository.save(participation);
                            System.out.println("Created interview participation for student: " + admissionNumber + " with event: " + savedEvent.getEventId());
                            successCount++;

                        } catch (Exception e) {
                            System.err.println("Error creating interview participation for student " + admissionNumber + ": " + e.getMessage());
                            notFoundStudents.add(admissionNumber + " (participation error)");
                        }
                    } else {
                        alreadyRegistered.add(admissionNumber);
                    }
                } else {
                    notFoundStudents.add(admissionNumber);
                }
            }

            StringBuilder result = new StringBuilder();
            result.append("Successfully scheduled interviews for ").append(successCount).append(" students.");

            if (!notFoundStudents.isEmpty()) {
                result.append("\nStudents not found/errors: ").append(String.join(", ", notFoundStudents));
            }

            if (!alreadyRegistered.isEmpty()) {
                result.append("\nAlready registered: ").append(String.join(", ", alreadyRegistered));
            }

            System.out.println("Final interview result: " + result.toString());
            return result.toString();

        } catch (Exception e) {
            System.err.println("Error in scheduleInterviews: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error scheduling interviews: " + e.getMessage());
        }
    }

    // ADD THESE HELPER METHODS
    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "Not specified";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
        return dateTime.format(formatter);
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private boolean isCellEmpty(Cell cell) {
        if (cell == null) return true;
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim().isEmpty();
            case NUMERIC: return false;
            case BOOLEAN: return false;
            case FORMULA: return false;
            default: return true;
        }
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC:
                double numericValue = cell.getNumericCellValue();
                // Check if it's an integer value (like admission number, phone number)
                if (numericValue == Math.floor(numericValue)) {
                    return String.valueOf((long) numericValue);
                } else {
                    return String.valueOf(numericValue);
                }
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return null;
        }
    }
}