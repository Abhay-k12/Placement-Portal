package com.PlacementPortal.Placement.Sarthi.repository;

import com.PlacementPortal.Placement.Sarthi.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {
    boolean existsByStudentAdmissionNumber(String studentAdmissionNumber);
    Optional<Student> findByStudentAdmissionNumber(String studentAdmissionNumber);
    List<Student> findByDepartment(String department);
    List<Student> findByBatch(String batch);
    List<Student> findByCgpaGreaterThanEqual(Double cgpa);
    List<Student> findByBackLogsCountLessThanEqual(Integer maxBacklogs);
}