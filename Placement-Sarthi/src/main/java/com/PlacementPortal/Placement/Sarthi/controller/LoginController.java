package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Admin;
import com.PlacementPortal.Placement.Sarthi.entity.Company;
import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.repository.AdminRepository;
import com.PlacementPortal.Placement.Sarthi.repository.CompanyRepository;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String role,
            HttpServletRequest request) {

        try {
            String roleLower = role.trim().toLowerCase();

            if (!roleLower.equals("student") && !roleLower.equals("admin") && !roleLower.equals("company")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid role: " + role
                ));
            }

            String compositeUsername = roleLower + ":" + username.trim();

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(compositeUsername, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            Map<String, Object> userData = buildUserData(roleLower, username.trim());

            if (userData == null) {
                return ResponseEntity.status(500).body(Map.of(
                        "success", false,
                        "message", "Error fetching user profile after login"
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful",
                    "user", userData
            ));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Invalid credentials. Please check your ID and password."
            ));
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Login failed: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/check-session")
    public ResponseEntity<Map<String, Object>> checkSession() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String compositeUsername = auth.getName();
            String[] parts = compositeUsername.split(":", 2);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "role", parts.length > 0 ? parts[0] : "unknown",
                    "userId", parts.length > 1 ? parts[1] : "unknown"
            ));
        }

        return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Not authenticated"
        ));
    }

    private Map<String, Object> buildUserData(String role, String userId) {
        Map<String, Object> userData = new HashMap<>();

        switch (role) {
            case "student":
                Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(userId);
                if (studentOpt.isPresent()) {
                    Student s = studentOpt.get();
                    s.setLastLogin(LocalDateTime.now());
                    studentRepository.save(s);

                    userData.put("studentAdmissionNumber", nullSafe(s.getStudentAdmissionNumber()));
                    userData.put("studentFirstName", nullSafe(s.getStudentFirstName()));
                    userData.put("studentLastName", nullSafe(s.getStudentLastName()));
                    userData.put("emailId", nullSafe(s.getEmailId()));
                    userData.put("department", nullSafe(s.getDepartment()));
                    userData.put("mobileNo", nullSafe(s.getMobileNo()));
                    userData.put("dateOfBirth", s.getDateOfBirth() != null ? s.getDateOfBirth().toString() : "");
                    userData.put("photographLink", nullSafe(s.getPhotographLink()));
                    userData.put("studentUniversityRollNo", nullSafe(s.getStudentUniversityRollNo()));
                    userData.put("cgpa", s.getCgpa() != null ? s.getCgpa() : "");
                    userData.put("batch", nullSafe(s.getBatch()));
                    userData.put("course", nullSafe(s.getCourse()));
                }
                break;

            case "admin":
                // Try by email first, then by ID (both are String in MongoDB)
                Optional<Admin> adminOpt = adminRepository.findByEmailAddress(userId);
                if (adminOpt.isEmpty()) {
                    adminOpt = adminRepository.findById(userId);
                }

                if (adminOpt.isPresent()) {
                    Admin a = adminOpt.get();
                    a.setLastLogin(LocalDateTime.now());
                    adminRepository.save(a);

                    userData.put("adminId", nullSafe(a.getAdminId()));
                    userData.put("adminName", nullSafe(a.getAdminName()));
                    userData.put("emailAddress", nullSafe(a.getEmailAddress()));
                    userData.put("phoneNumber", nullSafe(a.getPhoneNumber()));
                    userData.put("city", nullSafe(a.getCity()));
                    userData.put("department", nullSafe(a.getDepartment()));
                    userData.put("dateOfBirth", a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : "");
                }
                break;

            case "company":
                Optional<Company> companyOpt = companyRepository.findByCompanyId(userId);
                if (companyOpt.isPresent()) {
                    Company c = companyOpt.get();

                    userData.put("companyId", nullSafe(c.getCompanyId()));
                    userData.put("companyName", nullSafe(c.getCompanyName()));
                    userData.put("hrName", nullSafe(c.getHrName()));
                    userData.put("hrEmail", nullSafe(c.getHrEmail()));
                    userData.put("hrPhone", nullSafe(c.getHrPhone()));
                    userData.put("photoLink", nullSafe(c.getPhotoLink()));
                    userData.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");
                    userData.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : "");
                }
                break;

            default:
                return null;
        }

        return userData.isEmpty() ? null : userData;
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}