package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Student;
import java.util.List;

public interface StudentService {
    Student registerStudent(Student student);
    List<Student> getAllStudents();
    Student getStudentByAdmissionNumber(String admissionNumber);
    Student updateStudent(String admissionNumber, Student student);
    void deleteStudent(String admissionNumber);
    boolean studentExists(String admissionNumber);
    List<Student> filterStudents(String department, Double minCgpa, Integer maxBacklogs, String batch);
    byte[] exportFilteredStudents(String department, Double minCgpa, Integer maxBacklogs, String batch);
    Student getStudentById(Long studentId);
}
