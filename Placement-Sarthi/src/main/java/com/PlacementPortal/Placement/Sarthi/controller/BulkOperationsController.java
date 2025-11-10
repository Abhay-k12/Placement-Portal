package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.dto.BulkOperationRequest;
import com.PlacementPortal.Placement.Sarthi.service.BulkOperationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bulk-operations")
@CrossOrigin(origins = "http://localhost:8081")
public class BulkOperationsController {

    @Autowired
    private BulkOperationsService bulkOperationsService;

    @PostMapping("/extract-admission-numbers")
    public ResponseEntity<?> extractAdmissionNumbers(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Please select a file"
                ));
            }

            List<String> admissionNumbers = bulkOperationsService.extractAdmissionNumbersFromExcel(file);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "admissionNumbers", admissionNumbers,
                    "count", admissionNumbers.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error processing file: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/send-oa-links")
    public ResponseEntity<?> sendOALinks(@RequestBody BulkOperationRequest request,
                                         @RequestHeader("Company-Name") String companyName) {
        try {
            if (request.getStudentAdmissionNumbers() == null || request.getStudentAdmissionNumbers().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "No students selected"
                ));
            }

            if (request.getOaLink() == null || request.getOaLink().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "OA link is required"
                ));
            }

            String result = bulkOperationsService.sendOALinks(request, companyName);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", result
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error sending OA links: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/schedule-interviews")
    public ResponseEntity<?> scheduleInterviews(@RequestBody BulkOperationRequest request,
                                                @RequestHeader("Company-Name") String companyName) {
        try {
            if (request.getStudentAdmissionNumbers() == null || request.getStudentAdmissionNumbers().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "No students selected"
                ));
            }

            if (request.getOaLink() == null || request.getOaLink().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Interview link/venue is required"
                ));
            }

            String result = bulkOperationsService.scheduleInterviews(request, companyName);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", result
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error scheduling interviews: " + e.getMessage()
            ));
        }
    }
}
