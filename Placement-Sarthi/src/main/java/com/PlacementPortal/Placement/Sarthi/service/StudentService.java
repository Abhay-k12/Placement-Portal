package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "gehu@123";

    public Student registerStudent(Student student) {
        if (studentRepository.existsByStudentAdmissionNumber(student.getStudentAdmissionNumber())) {
            throw new RuntimeException("Student with admission number " +
                    student.getStudentAdmissionNumber() + " already exists");
        }

        // Always hash the default password on registration
        if (student.getPassword() == null || student.getPassword().isEmpty()) {
            student.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        } else {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
        }

        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentByAdmissionNumber(String admissionNumber) {
        return studentRepository.findByStudentAdmissionNumber(admissionNumber).orElse(null);
    }

    public Student updateStudent(String admissionNumber, Student student) {
        if (!studentRepository.existsById(admissionNumber)) {
            throw new RuntimeException("Student not found with admission number: " + admissionNumber);
        }
        student.setStudentAdmissionNumber(admissionNumber);

        // Don't overwrite password if not provided in update
        if (student.getPassword() == null || student.getPassword().isEmpty()) {
            Student existing = studentRepository.findById(admissionNumber).orElse(null);
            if (existing != null) {
                student.setPassword(existing.getPassword());
            }
        }

        return studentRepository.save(student);
    }

    public void deleteStudent(String admissionNumber) {
        if (!studentRepository.existsById(admissionNumber)) {
            throw new RuntimeException("Student not found with admission number: " + admissionNumber);
        }
        studentRepository.deleteById(admissionNumber);
    }

    public boolean studentExists(String admissionNumber) {
        return studentRepository.existsByStudentAdmissionNumber(admissionNumber);
    }

    /**
     * Change student password. Verifies current password first.
     */
    public boolean changePassword(String admissionNumber, String currentPassword, String newPassword) {
        Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(admissionNumber);
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        Student student = studentOpt.get();

        if (!passwordEncoder.matches(currentPassword, student.getPassword())) {
            return false; // Current password is wrong
        }

        student.setPassword(passwordEncoder.encode(newPassword));
        studentRepository.save(student);
        return true;
    }

    /**
     * MongoDB-based flexible filtering using MongoTemplate + Criteria.
     * Replaces JpaSpecificationExecutor.
     */
    public List<Student> filterStudents(String department, Double minCgpa, Integer maxBacklogs, String batch) {
        Query query = new Query();

        if (department != null && !department.isEmpty()) {
            query.addCriteria(Criteria.where("department").is(department));
        }
        if (minCgpa != null) {
            query.addCriteria(Criteria.where("cgpa").gte(minCgpa));
        }
        if (maxBacklogs != null) {
            query.addCriteria(Criteria.where("backLogsCount").lte(maxBacklogs));
        }
        if (batch != null && !batch.isEmpty()) {
            query.addCriteria(Criteria.where("batch").is(batch));
        }

        return mongoTemplate.find(query, Student.class);
    }

    public byte[] exportFilteredStudents(String department, Double minCgpa, Integer maxBacklogs, String batch) {
        List<Student> students = filterStudents(department, minCgpa, maxBacklogs, batch);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Filtered Students");

            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Admission Number", "First Name", "Last Name",
                    "Department", "Batch", "CGPA", "Backlogs",
                    "Email", "Mobile", "Course", "University Roll No", "Resume Link"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            int rowNum = 1;
            for (Student student : students) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(student.getStudentAdmissionNumber() != null ? student.getStudentAdmissionNumber() : "");
                row.createCell(1).setCellValue(student.getStudentFirstName() != null ? student.getStudentFirstName() : "");
                row.createCell(2).setCellValue(student.getStudentLastName() != null ? student.getStudentLastName() : "");
                row.createCell(3).setCellValue(student.getDepartment() != null ? student.getDepartment() : "");
                row.createCell(4).setCellValue(student.getBatch() != null ? student.getBatch() : "");
                row.createCell(5).setCellValue(student.getCgpa() != null ? student.getCgpa() : 0.0);
                row.createCell(6).setCellValue(student.getBackLogsCount() != null ? student.getBackLogsCount() : 0);
                row.createCell(7).setCellValue(student.getEmailId() != null ? student.getEmailId() : "");
                row.createCell(8).setCellValue(student.getMobileNo() != null ? student.getMobileNo() : "");
                row.createCell(9).setCellValue(student.getCourse() != null ? student.getCourse() : "");
                row.createCell(10).setCellValue(student.getStudentUniversityRollNo() != null ? student.getStudentUniversityRollNo() : "");
                row.createCell(11).setCellValue(student.getResumeLink() != null ? student.getResumeLink() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel file", e);
        }
    }
}