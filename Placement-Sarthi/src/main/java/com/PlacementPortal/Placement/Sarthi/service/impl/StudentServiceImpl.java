package com.PlacementPortal.Placement.Sarthi.service.impl;

import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import com.PlacementPortal.Placement.Sarthi.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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
}