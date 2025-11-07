package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.entity.Gender; // Updated import for separate Gender enum
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class ExcelProcessingService {

    @Autowired
    private StudentRepository studentRepository;

    public Map<String, Object> processBulkUpload(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        List<Student> successfulStudents = new ArrayList<>();
        List<Map<String, String>> errors = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip header row
            if (rows.hasNext()) {
                rows.next();
            }

            int rowNum = 2; // Starting from row 2 (1-based index for user)

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Skip empty rows
                if (isRowEmpty(currentRow)) {
                    rowNum++;
                    continue;
                }

                Map<String, String> rowError = processStudentRow(currentRow, rowNum);

                if (rowError.isEmpty()) {
                    try {
                        Student student = createStudentFromRow(currentRow);

                        // Check if admission number already exists
                        if (studentRepository.existsByStudentAdmissionNumber(student.getStudentAdmissionNumber())) {
                            rowError.put("admissionNumber", "Admission number already exists");
                            rowError.put("row", String.valueOf(rowNum));
                            errors.add(rowError);
                        } else {
                            successfulStudents.add(student);
                        }
                    } catch (Exception e) {
                        rowError.put("general", "Error creating student: " + e.getMessage());
                        rowError.put("row", String.valueOf(rowNum));
                        errors.add(rowError);
                    }
                } else {
                    errors.add(rowError);
                }
                rowNum++;
            }

            // Save all successful students
            if (!successfulStudents.isEmpty()) {
                studentRepository.saveAll(successfulStudents);
            }

            result.put("success", true);
            result.put("successfulCount", successfulStudents.size());
            result.put("errorCount", errors.size());
            result.put("errors", errors);
            result.put("message", String.format("Successfully uploaded %d students. %d errors found.",
                    successfulStudents.size(), errors.size()));

        } catch (IOException e) {
            result.put("success", false);
            result.put("message", "Error processing file: " + e.getMessage());
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Invalid file format or structure: " + e.getMessage());
        }

        return result;
    }

    private Map<String, String> processStudentRow(Row row, int rowNum) {
        Map<String, String> errors = new HashMap<>();

        // Check mandatory fields
        if (isCellEmpty(row.getCell(0))) {
            errors.put("admissionNumber", "Admission number is required");
        }
        if (isCellEmpty(row.getCell(1))) {
            errors.put("firstName", "First name is required");
        }
        if (isCellEmpty(row.getCell(2))) {
            errors.put("lastName", "Last name is required");
        }

        // Validate gender if provided
        if (!isCellEmpty(row.getCell(6))) {
            String genderValue = getStringCellValue(row.getCell(6));
            if (genderValue != null && !isValidGender(genderValue)) {
                errors.put("gender", "Gender must be: Male, Female, or Others");
            }
        }

        // If mandatory fields are missing, add row number and return
        if (!errors.isEmpty()) {
            errors.put("row", String.valueOf(rowNum));
        }

        return errors;
    }

    private Student createStudentFromRow(Row row) {
        Student student = new Student();

        // Mandatory fields
        student.setStudentAdmissionNumber(getStringCellValue(row.getCell(0)));
        student.setStudentFirstName(getStringCellValue(row.getCell(1)));
        student.setStudentLastName(getStringCellValue(row.getCell(2)));

        // Optional fields
        student.setFatherName(getStringCellValue(row.getCell(3)));
        student.setMotherName(getStringCellValue(row.getCell(4)));
        student.setDateOfBirth(getLocalDateCellValue(row.getCell(5)));
        student.setGender(getGenderCellValue(row.getCell(6)));
        student.setMobileNo(getStringCellValue(row.getCell(7)));
        student.setEmailId(getStringCellValue(row.getCell(8)));
        student.setCollegeEmailId(getStringCellValue(row.getCell(9)));
        student.setDepartment(getStringCellValue(row.getCell(10)));
        student.setBatch(getStringCellValue(row.getCell(11)));
        student.setCgpa(getNumericCellValue(row.getCell(12)));
        student.setTenthPercentage(getNumericCellValue(row.getCell(13)));
        student.setTwelfthPercentage(getNumericCellValue(row.getCell(14)));

        // Handle backlogs count - default to 0 if null
        Integer backlogs = getIntegerCellValue(row.getCell(15));
        student.setBackLogsCount(backlogs != null ? backlogs : 0);

        student.setAddress(getStringCellValue(row.getCell(16)));
        student.setResumeLink(getStringCellValue(row.getCell(17)));
        student.setPhotographLink(getStringCellValue(row.getCell(18)));
        student.setCourse(getStringCellValue(row.getCell(19)));
        student.setStudentUniversityRollNo(getStringCellValue(row.getCell(20)));
        student.setStudentEnrollmentNo(getStringCellValue(row.getCell(21)));

        // Set default password
        student.setPassword("gehu@123");

        return student;
    }

    private LocalDate getLocalDateCellValue(Cell cell) {
        if (cell == null) return null;

        try {
            if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                // Convert java.util.Date to LocalDate
                Date date = cell.getDateCellValue();
                return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            } else if (cell.getCellType() == CellType.STRING) {
                // Try to parse string date (yyyy-mm-dd format)
                String dateString = cell.getStringCellValue().trim();
                if (!dateString.isEmpty()) {
                    return LocalDate.parse(dateString);
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing date at cell: " + e.getMessage());
        }
        return null;
    }

    private Gender getGenderCellValue(Cell cell) {
        if (cell == null) return null;

        String genderValue = getStringCellValue(cell);
        if (genderValue != null) {
            try {
                // Convert string to enum - using the separate Gender enum
                // The enum values remain the same: Male, Female, Others
                return Gender.valueOf(genderValue.trim());
            } catch (IllegalArgumentException e) {
                // Handle case variations
                String normalized = genderValue.trim();
                if (normalized.equalsIgnoreCase("male")) {
                    return Gender.Male;
                } else if (normalized.equalsIgnoreCase("female")) {
                    return Gender.Female;
                } else if (normalized.equalsIgnoreCase("others") || normalized.equalsIgnoreCase("other")) {
                    return Gender.Others;
                }
            }
        }
        return null;
    }

    private boolean isValidGender(String genderValue) {
        if (genderValue == null) return false;

        String normalized = genderValue.trim();
        return normalized.equalsIgnoreCase("male") ||
                normalized.equalsIgnoreCase("female") ||
                normalized.equalsIgnoreCase("others") ||
                normalized.equalsIgnoreCase("other");
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
            case STRING:
                return cell.getStringCellValue().trim().isEmpty();
            case NUMERIC:
                return false;
            case BOOLEAN:
                return false;
            case FORMULA:
                return false;
            default:
                return true;
        }
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                // For numeric cells that should be treated as strings (like phone numbers, admission numbers)
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double numericValue = cell.getNumericCellValue();
                    // Check if it's an integer value (like admission number, phone number)
                    if (numericValue == Math.floor(numericValue)) {
                        return String.valueOf((long) numericValue);
                    } else {
                        return String.valueOf(numericValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }

    private Double getNumericCellValue(Cell cell) {
        if (cell == null) return null;

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getNumericCellValue();
            } else if (cell.getCellType() == CellType.STRING) {
                String stringValue = cell.getStringCellValue().trim();
                if (!stringValue.isEmpty()) {
                    return Double.parseDouble(stringValue);
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing numeric value: " + e.getMessage());
        }
        return null;
    }

    private Integer getIntegerCellValue(Cell cell) {
        if (cell == null) return null;

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            } else if (cell.getCellType() == CellType.STRING) {
                String stringValue = cell.getStringCellValue().trim();
                if (!stringValue.isEmpty()) {
                    return Integer.parseInt(stringValue);
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing integer value: " + e.getMessage());
        }
        return null;
    }

    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Student Template");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "student_admission_number*", "student_first_name*", "student_last_name*",
                    "father_name", "mother_name", "date_of_birth (yyyy-mm-dd)",
                    "gender (Male/Female/Others)", "mobile_no", "email_id", "college_email_id",
                    "department", "batch", "cgpa", "tenth_percentage", "twelfth_percentage",
                    "back_logs_count", "address", "resume_link", "photograph_link",
                    "course", "student_university_roll_no", "student_enrollment_no"
            };

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create sample data row
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("2024001");
            sampleRow.createCell(1).setCellValue("John");
            sampleRow.createCell(2).setCellValue("Doe");
            sampleRow.createCell(3).setCellValue("Robert Doe");
            sampleRow.createCell(4).setCellValue("Mary Doe");
            sampleRow.createCell(5).setCellValue("2000-01-15");
            sampleRow.createCell(6).setCellValue("Male");
            sampleRow.createCell(7).setCellValue("9876543210");
            sampleRow.createCell(8).setCellValue("john.doe@gmail.com");
            sampleRow.createCell(9).setCellValue("john.doe@college.edu");
            sampleRow.createCell(10).setCellValue("Computer Science");
            sampleRow.createCell(11).setCellValue("2024");
            sampleRow.createCell(12).setCellValue(8.5);
            sampleRow.createCell(13).setCellValue(85.0);
            sampleRow.createCell(14).setCellValue(78.0);
            sampleRow.createCell(15).setCellValue(0);
            sampleRow.createCell(16).setCellValue("123 Main Street, City, State");
            sampleRow.createCell(17).setCellValue("");
            sampleRow.createCell(18).setCellValue("");
            sampleRow.createCell(19).setCellValue("B.Tech CSE");
            sampleRow.createCell(20).setCellValue("UNIV001");
            sampleRow.createCell(21).setCellValue("ENR001");

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Convert to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}