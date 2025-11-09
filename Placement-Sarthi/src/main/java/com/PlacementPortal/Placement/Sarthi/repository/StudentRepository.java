package com.PlacementPortal.Placement.Sarthi.repository;


import com.PlacementPortal.Placement.Sarthi.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String>, JpaSpecificationExecutor<Student> {
    boolean existsByStudentAdmissionNumber(String studentAdmissionNumber);
    Optional<Student> findByStudentAdmissionNumber(String studentAdmissionNumber);
}