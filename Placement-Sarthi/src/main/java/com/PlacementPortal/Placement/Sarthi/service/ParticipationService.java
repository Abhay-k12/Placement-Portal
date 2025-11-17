package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.dto.ParticipationDTO;
import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.entity.Event;
import com.PlacementPortal.Placement.Sarthi.repository.ParticipationRepository;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import com.PlacementPortal.Placement.Sarthi.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ParticipationService {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EventRepository eventRepository;

    public Participation registerStudentForEvent(String studentAdmissionNumber, Long eventId, String eventDescription) {
        // Check if student exists
        Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(studentAdmissionNumber);
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        // Check if event exists
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            throw new RuntimeException("Event not found");
        }

        Student student = studentOpt.get();
        Event event = eventOpt.get();

        // Check if already registered
        if (participationRepository.existsByStudentAndEvent(student, event)) {
            throw new RuntimeException("Student is already registered for this event");
        }

        // Check registration period
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (now.isAfter(event.getRegistrationEnd())) {
            throw new RuntimeException("Registration period has ended for this event");
        }

        // Create participation record
        Participation participation = new Participation(student, event, eventDescription);
        return participationRepository.save(participation);
    }

    public List<ParticipationDTO> getParticipationsByStudent(String admissionNumber) {
        List<Participation> participations = participationRepository.findByStudent_StudentAdmissionNumber(admissionNumber);
        return participations.stream()
                .map(ParticipationDTO::new)
                .collect(Collectors.toList());
    }

    public List<ParticipationDTO> getParticipationsByEvent(Long eventId) {
        List<Participation> participations = participationRepository.findByEvent_EventId(eventId);
        return participations.stream()
                .map(ParticipationDTO::new)
                .collect(Collectors.toList());
    }

    public Participation updateParticipationStatus(String admissionNumber, Long eventId, Participation.ParticipationStatus status) {
        Optional<Participation> participationOpt = participationRepository
                .findByStudent_StudentAdmissionNumberAndEvent_EventId(admissionNumber, eventId);

        if (participationOpt.isEmpty()) {
            throw new RuntimeException("Participation record not found");
        }

        Participation participation = participationOpt.get();
        participation.setStatus(status);
        return participationRepository.save(participation);
    }
}
