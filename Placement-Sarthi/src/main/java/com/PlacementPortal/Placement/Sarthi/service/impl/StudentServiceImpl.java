package com.PlacementPortal.Placement.Sarthi.service.impl;

import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import com.PlacementPortal.Placement.Sarthi.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public Student registerStudent(Student student) {
        // Check if student already exists using JPA
        if (studentRepository.existsByStudentAdmissionNumber(student.getStudentAdmissionNumber())) {
            throw new RuntimeException("Student with admission number " + student.getStudentAdmissionNumber() + " already exists");
        }

        // Set default password if not provided
        if (student.getPassword() == null) {
            student.setPassword("gehu@123");
        }

        // Save using JPA repository
        return studentRepository.save(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Student getStudentByAdmissionNumber(String admissionNumber) {
        System.out.println("Searching for student with admission number: " + admissionNumber);
        Optional<Student> student = studentRepository.findByStudentAdmissionNumber(admissionNumber);
        Student result = student.orElse(null);
        System.out.println("Student search result: " + (result != null ? "Found" : "Not found"));
        return result;
    }

    @Override
    public Student updateStudent(String admissionNumber, Student student) {
        // Check if student exists using JPA
        if (!studentRepository.existsById(admissionNumber)) {
            throw new RuntimeException("Student not found with admission number: " + admissionNumber);
        }
        student.setStudentAdmissionNumber(admissionNumber);
        return studentRepository.save(student);
    }

    @Override
    public void deleteStudent(String admissionNumber) {
        // Check if student exists using JPA
        if (!studentRepository.existsById(admissionNumber)) {
            throw new RuntimeException("Student not found with admission number: " + admissionNumber);
        }
        studentRepository.deleteById(admissionNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean studentExists(String admissionNumber) {
        return studentRepository.existsByStudentAdmissionNumber(admissionNumber);
    }

    @Override
    public Student getStudentById(Long studentId) {
        Optional<Student> student = studentRepository.findById(String.valueOf(studentId));
        return student.orElse(null); // Return Student or null
    }

    @Override
    public List<Student> filterStudents(String department, Double minCgpa, Integer maxBacklogs, String batch) {
        Specification<Student> spec = Specification.where(null);

        if (department != null && !department.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("department"), department));
        }

        if (minCgpa != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("cgpa"), minCgpa));
        }

        if (maxBacklogs != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("backLogsCount"), maxBacklogs));
        }

        if (batch != null && !batch.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("batch"), batch));
        }

        return studentRepository.findAll(spec);
    }

    @Override
    public byte[] exportFilteredStudents(String department, Double minCgpa, Integer maxBacklogs, String batch) {
        List<Student> students = filterStudents(department, minCgpa, maxBacklogs, batch);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Filtered Students");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Admission Number", "First Name", "Last Name",
                    "Department", "Batch", "CGPA", "Backlogs",
                    "Email", "Mobile", "Course", "University Roll No"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Fill data rows
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
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel file", e);
        }
    }
}