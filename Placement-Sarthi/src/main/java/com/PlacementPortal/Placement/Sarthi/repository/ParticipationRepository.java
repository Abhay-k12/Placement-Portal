package com.PlacementPortal.Placement.Sarthi.repository;

import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Participation.ParticipationId> {

    boolean existsByStudentAndEvent(Student student, Event event);

    List<Participation> findByStudent_StudentAdmissionNumber(String admissionNumber);

    List<Participation> findByEvent_EventId(Long eventId);

    @Query("SELECT p FROM Participation p WHERE p.event.organizingCompany = :companyName")
    List<Participation> findByCompanyName(@Param("companyName") String companyName);

    Optional<Participation> findByStudent_StudentAdmissionNumberAndEvent_EventId(String admissionNumber, Long eventId);
}