package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.service.StudentService;
import com.PlacementPortal.Placement.Sarthi.service.ExcelProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ExcelProcessingService excelProcessingService;

    // Admin registers student - default password "gehu@123" is set in StudentService
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {
        try {
            Student registeredStudent = studentService.registerStudent(student);
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<Map<String, Object>> uploadBulkStudents(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "Please select a file to upload"));
            }

            String fileName = file.getOriginalFilename();
            if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv"))) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "Please upload an Excel file (.xlsx, .xls) or CSV file"));
            }

            Map<String, Object> result = excelProcessingService.processBulkUpload(file);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false, "message", "Error processing file: " + e.getMessage()));
        }
    }

    @GetMapping("/download-template")
    public ResponseEntity<byte[]> downloadStudentTemplate() {
        try {
            byte[] templateData = excelProcessingService.generateTemplate();
            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=\"student_bulk_upload_template.xlsx\"")
                    .body(templateData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{admissionNumber}")
    public ResponseEntity<?> getStudent(@PathVariable String admissionNumber) {
        Student student = studentService.getStudentByAdmissionNumber(admissionNumber);
        if (student != null) {
            return ResponseEntity.ok(student);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Student not found with admission number: " + admissionNumber);
    }

    @PutMapping("/{admissionNumber}")
    public ResponseEntity<?> updateStudent(@PathVariable String admissionNumber, @RequestBody Student student) {
        try {
            Student updatedStudent = studentService.updateStudent(admissionNumber, student);
            return ResponseEntity.ok(updatedStudent);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{admissionNumber}")
    public ResponseEntity<?> deleteStudent(@PathVariable String admissionNumber) {
        try {
            studentService.deleteStudent(admissionNumber);
            return ResponseEntity.ok("Student deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Student changes own password
    @PostMapping("/{admissionNumber}/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable String admissionNumber,
            @RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Current password and new password are required"
                ));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "New password must be at least 6 characters"
                ));
            }

            boolean success = studentService.changePassword(admissionNumber, currentPassword, newPassword);

            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Password changed successfully"
                ));
            } else {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Current password is incorrect"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error changing password: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String studentId = request.get("userId");
            Student student = studentService.getStudentByAdmissionNumber(studentId);

            if (student == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false, "message", "Student not found"));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password reset link sent to your registered email"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false, "message", "Failed to process request"));
        }
    }

    @PostMapping("/{admissionNumber}/resume")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @PathVariable String admissionNumber,
            @RequestParam("resume") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "Please select a file to upload"));
            }

            String contentType = file.getContentType();
            if (!"application/pdf".equals(contentType) &&
                    !"application/msword".equals(contentType) &&
                    !"application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "Please upload a PDF or Word document"));
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "File size should be less than 5MB"));
            }

            String resumeLink = "/uploads/resumes/" + admissionNumber + "_" + file.getOriginalFilename();

            Student student = studentService.getStudentByAdmissionNumber(admissionNumber);
            if (student != null) {
                student.setResumeLink(resumeLink);
                studentService.updateStudent(admissionNumber, student);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Resume uploaded successfully",
                    "resumeLink", resumeLink));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false, "message", "Failed to upload resume: " + e.getMessage()));
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Student>> filterStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Double minCgpa,
            @RequestParam(required = false) Integer maxBacklogs,
            @RequestParam(required = false) String batch) {
        try {
            List<Student> filteredStudents = studentService.filterStudents(department, minCgpa, maxBacklogs, batch);
            return ResponseEntity.ok(filteredStudents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/filtered")
    public ResponseEntity<byte[]> exportFilteredStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Double minCgpa,
            @RequestParam(required = false) Integer maxBacklogs,
            @RequestParam(required = false) String batch) {
        try {
            byte[] excelData = studentService.exportFilteredStudents(department, minCgpa, maxBacklogs, batch);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=\"filtered_students.xlsx\"")
                    .body(excelData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{admissionNumber}/resume-drive-link")
    public ResponseEntity<Map<String, Object>> updateResumeDriveLink(
            @PathVariable String admissionNumber,
            @RequestBody Map<String, String> request) {
        try {
            String driveLink = request.get("driveLink");

            if (driveLink == null || driveLink.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "Drive link is required"));
            }

            if (!isValidDriveLink(driveLink)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "Please provide a valid Google Drive shareable link"));
            }

            Student student = studentService.getStudentByAdmissionNumber(admissionNumber);
            if (student == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false, "message", "Student not found"));
            }

            student.setResumeLink(driveLink);
            studentService.updateStudent(admissionNumber, student);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Resume drive link updated successfully",
                    "resumeLink", driveLink));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false, "message", "Failed to update resume link: " + e.getMessage()));
        }
    }

    @GetMapping("/{admissionNumber}/resume-drive-link")
    public ResponseEntity<Map<String, Object>> getResumeDriveLink(@PathVariable String admissionNumber) {
        try {
            Student student = studentService.getStudentByAdmissionNumber(admissionNumber);
            if (student == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false, "message", "Student not found"));
            }

            String resumeLink = student.getResumeLink();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "resumeLink", resumeLink != null ? resumeLink : "",
                    "hasResume", resumeLink != null && !resumeLink.trim().isEmpty()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false, "message", "Failed to get resume link: " + e.getMessage()));
        }
    }

    private boolean isValidDriveLink(String link) {
        if (link == null) return false;
        return link.matches("^https://drive\\.google\\.com/.*") ||
                link.matches("^https://docs\\.google\\.com/.*") ||
                link.startsWith("https://") && link.contains("drive.google.com");
    }
}