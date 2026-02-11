package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.dto.BulkOperationRequest;
import com.PlacementPortal.Placement.Sarthi.entity.*;
import com.PlacementPortal.Placement.Sarthi.repository.EventRepository;
import com.PlacementPortal.Placement.Sarthi.repository.ParticipationRepository;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
public class BulkOperationsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    public List<String> extractAdmissionNumbersFromExcel(MultipartFile file) {
        List<String> admissionNumbers = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) rows.next(); // Skip header

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                if (isRowEmpty(currentRow)) continue;

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

    public String sendOALinks(BulkOperationRequest request, String companyName) {
        try {
            Event oaEvent = new Event();
            oaEvent.setEventName(request.getEventName() + " - Online Assessment");
            oaEvent.setOrganizingCompany(companyName);

            String eventDescription = request.getEventDescription() +
                    "\n\nOnline Assessment Details:\n" +
                    "Assessment Link: " + request.getOaLink() + "\n" +
                    "Available From: " + formatDateTime(request.getStartDate()) + "\n" +
                    "Available Until: " + formatDateTime(request.getEndDate());

            oaEvent.setEventDescription(eventDescription);
            oaEvent.setRegistrationStart(request.getStartDate());
            oaEvent.setRegistrationEnd(request.getEndDate());
            oaEvent.setJobRole(request.getJobRole());
            oaEvent.setExpectedCgpa(request.getExpectedCgpa());
            oaEvent.setEventMode(Event.EventMode.ONLINE);
            oaEvent.setStatus(Event.EventStatus.UPCOMING);
            oaEvent.onCreate();

            Event savedEvent = eventRepository.save(oaEvent);

            return createParticipations(request.getStudentAdmissionNumbers(), savedEvent,
                    "Online Assessment Invitation\nAssessment Link: " + request.getOaLink());

        } catch (Exception e) {
            throw new RuntimeException("Error sending OA links: " + e.getMessage());
        }
    }

    public String scheduleInterviews(BulkOperationRequest request, String companyName) {
        try {
            Event interviewEvent = new Event();
            interviewEvent.setEventName(request.getEventName() + " - Interview");
            interviewEvent.setOrganizingCompany(companyName);

            boolean isOnline = request.getOaLink().toLowerCase().contains("http") ||
                    request.getOaLink().toLowerCase().contains("meet") ||
                    request.getOaLink().toLowerCase().contains("zoom");

            String eventDescription = request.getEventDescription() +
                    "\n\nInterview Details:\n" +
                    (isOnline ? "Interview Link: " : "Interview Venue: ") + request.getOaLink() + "\n" +
                    "Scheduled From: " + formatDateTime(request.getStartDate()) + "\n" +
                    "Scheduled Until: " + formatDateTime(request.getEndDate());

            interviewEvent.setEventDescription(eventDescription);
            interviewEvent.setRegistrationStart(request.getStartDate());
            interviewEvent.setRegistrationEnd(request.getEndDate());
            interviewEvent.setJobRole(request.getJobRole());
            interviewEvent.setExpectedCgpa(request.getExpectedCgpa());
            interviewEvent.setEventMode(isOnline ? Event.EventMode.ONLINE : Event.EventMode.OFFLINE);
            interviewEvent.setStatus(Event.EventStatus.UPCOMING);
            interviewEvent.onCreate();

            Event savedEvent = eventRepository.save(interviewEvent);

            return createParticipations(request.getStudentAdmissionNumbers(), savedEvent,
                    "Interview Scheduled\n" + (isOnline ? "Link: " : "Venue: ") + request.getOaLink());

        } catch (Exception e) {
            throw new RuntimeException("Error scheduling interviews: " + e.getMessage());
        }
    }

    private String createParticipations(List<String> admissionNumbers, Event savedEvent, String description) {
        int successCount = 0;
        List<String> notFoundStudents = new ArrayList<>();
        List<String> alreadyRegistered = new ArrayList<>();

        for (String admissionNumber : admissionNumbers) {
            Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(admissionNumber);

            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();

                boolean exists = participationRepository.existsByStudentAdmissionNumberAndEventId(
                        admissionNumber, savedEvent.getEventId());

                if (!exists) {
                    try {
                        Participation participation = new Participation(
                                admissionNumber, savedEvent.getEventId(), description);

                        // Denormalize data
                        participation.setStudentFirstName(student.getStudentFirstName());
                        participation.setStudentLastName(student.getStudentLastName());
                        participation.setStudentDepartment(student.getDepartment());
                        participation.setEventName(savedEvent.getEventName());
                        participation.setOrganizingCompany(savedEvent.getOrganizingCompany());
                        participation.setJobRole(savedEvent.getJobRole());
                        participation.setRegistrationStart(savedEvent.getRegistrationStart());
                        participation.setStatus(Participation.ParticipationStatus.REGISTERED);

                        participationRepository.save(participation);
                        successCount++;
                    } catch (Exception e) {
                        notFoundStudents.add(admissionNumber + " (error)");
                    }
                } else {
                    alreadyRegistered.add(admissionNumber);
                }
            } else {
                notFoundStudents.add(admissionNumber);
            }
        }

        StringBuilder result = new StringBuilder();
        result.append("Successfully processed ").append(successCount).append(" students.");
        if (!notFoundStudents.isEmpty()) {
            result.append("\nNot found/errors: ").append(String.join(", ", notFoundStudents));
        }
        if (!alreadyRegistered.isEmpty()) {
            result.append("\nAlready registered: ").append(String.join(", ", alreadyRegistered));
        }
        return result.toString();
    }

    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return "Not specified";
        return dateTime.format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"));
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private boolean isCellEmpty(Cell cell) {
        if (cell == null) return true;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim().isEmpty();
            case NUMERIC, BOOLEAN, FORMULA -> false;
            default -> true;
        };
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double numericValue = cell.getNumericCellValue();
                if (numericValue == Math.floor(numericValue)) {
                    yield String.valueOf((long) numericValue);
                }
                yield String.valueOf(numericValue);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
    }
}