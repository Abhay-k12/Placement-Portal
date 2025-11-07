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
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private ExcelProcessingService excelProcessingService;

    // Existing individual registration endpoint
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {
        try {
            System.out.println("Received student data: " + student.toString());

            Student registeredStudent = studentService.registerStudent(student);
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredStudent);

        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<Map<String, Object>> uploadBulkStudents(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Please select a file to upload"
                ));
            }

            // Validate file type
            String fileName = file.getOriginalFilename();
            if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv"))) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Please upload an Excel file (.xlsx, .xls) or CSV file"
                ));
            }

            Map<String, Object> result = excelProcessingService.processBulkUpload(file);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error processing file: " + e.getMessage()
            ));
        }
    }

    // NEW: Template download endpoint
    @GetMapping("/download-template")
    public ResponseEntity<byte[]> downloadStudentTemplate() {
        try {
            byte[] templateData = excelProcessingService.generateTemplate();

            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=\"student_bulk_upload_template.xlsx\"")
                    .body(templateData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Keep your existing endpoints as they are
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{admissionNumber}")
    public ResponseEntity<?> getStudent(@PathVariable String admissionNumber) {
        Optional<Student> student = Optional.ofNullable(studentService.getStudentByAdmissionNumber(admissionNumber));
        if (student.isPresent()) {
            return ResponseEntity.ok(student.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found with admission number: " + admissionNumber);
        }
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
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginStudent(@RequestBody Map<String, String> loginData) {
        try {
            // Check if request body is null
            if (loginData == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Login data is required"
                ));
            }

            String studentId = loginData.get("userId");
            String password = loginData.get("password");

            System.out.println("Received - Student ID: " + studentId + ", Password: " + password);

            // Check if required fields are present
            if (studentId == null || studentId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Student ID is required"
                ));
            }

            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Password is required"
                ));
            }

            // Trim the inputs
            studentId = studentId.trim();
            password = password.trim();

            // Find student by admission number (student ID)
            Student student = studentService.getStudentByAdmissionNumber(studentId);

            if (student == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Student not found"
                ));
            }

            // Check if password field exists and is not null
            if (student.getPassword() == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Student account not properly configured - missing password"
                ));
            }

            if (!student.getPassword().equals(password)) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Invalid password"
                ));
            }

            // Login successful - return user data using HashMap to avoid null issues
            Map<String, Object> userData = new HashMap<>();
            userData.put("studentAdmissionNumber", student.getStudentAdmissionNumber() != null ? student.getStudentAdmissionNumber() : "");
            userData.put("studentFirstName", student.getStudentFirstName() != null ? student.getStudentFirstName() : "");
            userData.put("studentLastName", student.getStudentLastName() != null ? student.getStudentLastName() : "");
            userData.put("emailId", student.getEmailId() != null ? student.getEmailId() : "");
            userData.put("department", student.getDepartment() != null ? student.getDepartment() : "");
            userData.put("mobileNo", student.getMobileNo() != null ? student.getMobileNo() : "");
            userData.put("dateOfBirth", student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : "");
            userData.put("photographLink", student.getPhotographLink() != null ? student.getPhotographLink() : "");
            userData.put("studentUniversityRollNo", student.getStudentUniversityRollNo() != null ? student.getStudentUniversityRollNo() : "");
            userData.put("cgpa", student.getCgpa() != null ? student.getCgpa() : "");
            userData.put("batch", student.getBatch() != null ? student.getBatch() : "");
            userData.put("course", student.getCourse() != null ? student.getCourse() : "");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful",
                    "user", userData
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Login failed: " + (e.getMessage() != null ? e.getMessage() : "Unknown error")
            ));
        } finally {
            System.out.println("STUDENT LOGIN END");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String studentId = request.get("userId");
            Student student = studentService.getStudentByAdmissionNumber(studentId);

            if (student == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Student not found"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password reset link sent to your registered email"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to process request"
            ));
        }
    }

    @PostMapping("/{admissionNumber}/resume")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @PathVariable String admissionNumber,
            @RequestParam("resume") MultipartFile file) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Please select a file to upload"
                ));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (!"application/pdf".equals(contentType) &&
                    !"application/msword".equals(contentType) &&
                    !"application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Please upload a PDF or Word document"
                ));
            }

            // Validate file size (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "File size should be less than 5MB"
                ));
            }

            // In a real implementation, you would save the file to cloud storage or server
            // and return the file URL. For now, we'll simulate this.
            String resumeLink = "/uploads/resumes/" + admissionNumber + "_" + file.getOriginalFilename();

            // Update student's resume link in database
            Student student = studentService.getStudentByAdmissionNumber(admissionNumber);
            if (student != null) {
                student.setResumeLink(resumeLink);
                studentService.updateStudent(admissionNumber, student);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Resume uploaded successfully",
                    "resumeLink", resumeLink
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to upload resume: " + e.getMessage()
            ));
        }
    }
}