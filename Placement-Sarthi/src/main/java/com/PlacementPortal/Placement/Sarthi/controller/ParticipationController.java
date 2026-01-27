package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.dto.ParticipationDTO;
import com.PlacementPortal.Placement.Sarthi.entity.Participation;
import com.PlacementPortal.Placement.Sarthi.service.ParticipationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/participations")
@CrossOrigin(origins = "*")
public class ParticipationController {

    @Autowired
    private ParticipationService participationService;

    @PostMapping("/register")
    public ResponseEntity<?> registerForEvent(@RequestBody Map<String, Object> registrationData) {
        try {
            String studentAdmissionNumber = (String) registrationData.get("studentAdmissionNumber");
            Long eventId = Long.valueOf(registrationData.get("eventId").toString());
            String eventDescription = (String) registrationData.get("eventDescription");

            Participation participation = participationService.registerStudentForEvent(
                    studentAdmissionNumber, eventId, eventDescription);

            return ResponseEntity.ok(participation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Internal server error"
            ));
        }
    }

    @GetMapping("/student/{admissionNumber}")
    public ResponseEntity<List<ParticipationDTO>> getStudentParticipations(@PathVariable String admissionNumber) {
        try {
            List<ParticipationDTO> participations = participationService.getParticipationsByStudent(admissionNumber);
            return ResponseEntity.ok(participations);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<ParticipationDTO>> getEventParticipations(@PathVariable Long eventId) {
        try {
            List<ParticipationDTO> participations = participationService.getParticipationsByEvent(eventId);
            return ResponseEntity.ok(participations);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/update-status")
    public ResponseEntity<?> updateParticipationStatus(@RequestBody Map<String, Object> updateData) {
        try {
            String studentAdmissionNumber = (String) updateData.get("studentAdmissionNumber");
            Long eventId = Long.valueOf(updateData.get("eventId").toString());
            Participation.ParticipationStatus status = Participation.ParticipationStatus.valueOf(
                    ((String) updateData.get("status")).toUpperCase());

            Participation participation = participationService.updateParticipationStatus(
                    studentAdmissionNumber, eventId, status);

            return ResponseEntity.ok(participation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}