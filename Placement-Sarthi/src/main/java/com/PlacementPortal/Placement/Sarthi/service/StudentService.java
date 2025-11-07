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

    Student getStudentById(Long studentId);
}
