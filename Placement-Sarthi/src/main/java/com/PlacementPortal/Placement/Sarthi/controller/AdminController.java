package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Admin;
import com.PlacementPortal.Placement.Sarthi.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "http://localhost:8081")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/create")
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        if (adminService.adminExists(admin.getEmailAddress())) {
            return ResponseEntity.badRequest().body(null);
        }
        Admin createdAdmin = adminService.createAdmin(admin);
        return ResponseEntity.ok(createdAdmin);
    }

    @GetMapping
    public ResponseEntity<List<Admin>> getAllAdmins() {
        List<Admin> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }


    @GetMapping("/email/{email}")
    public ResponseEntity<Admin> getAdminByEmail(@PathVariable String email) {
        Optional<Admin> admin = adminService.getAdminByEmail(email);
        return admin.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/update-last-login")
    public ResponseEntity<Void> updateLastLogin(@PathVariable Long id) {
        adminService.updateLastLogin(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<Map<String, Object>> getAdminProfile(@PathVariable Long adminId) {
        try {
            Optional<Admin> adminOptional = adminService.getAdminById(adminId);

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Admin not found"
                ));
            }

            Admin admin = adminOptional.get();

            // Return admin profile data
            Map<String, Object> adminData = new HashMap<>();
            adminData.put("adminId", admin.getAdminId());
            adminData.put("adminName", admin.getAdminName());
            adminData.put("emailAddress", admin.getEmailAddress());
            adminData.put("phoneNumber", admin.getPhoneNumber());
            adminData.put("city", admin.getCity());
            adminData.put("department", admin.getDepartment());
            adminData.put("dateOfBirth", admin.getDateOfBirth());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "admin", adminData
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error fetching admin profile: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginAdmin(@RequestBody Map<String, String> loginData) {
        try {
            String adminId = loginData.get("userId");
            String password = loginData.get("password");

            Optional<Admin> adminOptional = Optional.empty();

            // Find admin by email or ID
            adminOptional = adminService.getAdminByEmail(adminId);
            if (adminOptional.isEmpty()) {
                // Try finding by admin ID
                try {
                    Long id = Long.parseLong(adminId);
                    adminOptional = adminService.getAdminById(id);
                } catch (NumberFormatException e) {
                    // Not a numeric ID
                }
            }

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Admin not found"
                ));
            }

            Admin admin = adminOptional.get();

            // Check password
            if (!admin.getPassword().equals(password)) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Invalid password"
                ));
            }

            // Update last login
            adminService.updateLastLogin(admin.getAdminId());

            // Login successful - return ALL admin details
            Map<String, Object> userData = new HashMap<>();
            userData.put("adminId", admin.getAdminId());
            userData.put("adminName", admin.getAdminName() != null ? admin.getAdminName() : "");
            userData.put("emailAddress", admin.getEmailAddress() != null ? admin.getEmailAddress() : "");
            userData.put("phoneNumber", admin.getPhoneNumber() != null ? admin.getPhoneNumber() : "");
            userData.put("city", admin.getCity() != null ? admin.getCity() : "");
            userData.put("department", admin.getDepartment() != null ? admin.getDepartment() : "");
            userData.put("dateOfBirth", admin.getDateOfBirth() != null ? admin.getDateOfBirth().toString() : "");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Login successful",
                    "user", userData
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Login failed: " + e.getMessage()
            ));
        }
    }

    // Update admin profile - CORRECTED VERSION
    @PutMapping("/{adminId}/update")
    public ResponseEntity<Map<String, Object>> updateAdminProfile(
            @PathVariable Long adminId,
            @RequestBody Admin updatedAdmin) {
        try {
            Optional<Admin> adminOptional = adminService.getAdminById(adminId);

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Admin not found"
                ));
            }

            Admin admin = getAdmin(updatedAdmin, adminOptional);

            // Save updated admin - CORRECTED: pass both adminId and admin
            Admin savedAdmin = adminService.updateAdmin(adminId, admin);

            Map<String, Object> adminData = new HashMap<>();
            adminData.put("adminId", savedAdmin.getAdminId());
            adminData.put("adminName", savedAdmin.getAdminName());
            adminData.put("emailAddress", savedAdmin.getEmailAddress());
            adminData.put("phoneNumber", savedAdmin.getPhoneNumber());
            adminData.put("city", savedAdmin.getCity());
            adminData.put("department", savedAdmin.getDepartment());
            adminData.put("dateOfBirth", savedAdmin.getDateOfBirth());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "admin", adminData
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error updating profile: " + e.getMessage()
            ));
        }
    }

    private static Admin getAdmin(Admin updatedAdmin, Optional<Admin> adminOptional) {
        Admin admin = adminOptional.get();

        // Update fields
        if (updatedAdmin.getAdminName() != null) {
            admin.setAdminName(updatedAdmin.getAdminName());
        }
        if (updatedAdmin.getEmailAddress() != null) {
            admin.setEmailAddress(updatedAdmin.getEmailAddress());
        }
        if (updatedAdmin.getPhoneNumber() != null) {
            admin.setPhoneNumber(updatedAdmin.getPhoneNumber());
        }
        if (updatedAdmin.getCity() != null) {
            admin.setCity(updatedAdmin.getCity());
        }
        if (updatedAdmin.getDepartment() != null) {
            admin.setDepartment(updatedAdmin.getDepartment());
        }
        return admin;
    }

    @PostMapping("/{adminId}/change-password")
    public ResponseEntity<Map<String, Object>> changeAdminPassword(
            @PathVariable Long adminId,
            @RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            Optional<Admin> adminOptional = adminService.getAdminById(adminId);

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Admin not found"
                ));
            }

            Admin admin = adminOptional.get();

            // Check current password
            if (!admin.getPassword().equals(currentPassword)) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Current password is incorrect"
                ));
            }

            // Update password - CORRECTED: pass both adminId and admin
            admin.setPassword(newPassword);
            Admin updatedAdmin = adminService.updateAdmin(adminId, admin);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password changed successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error changing password: " + e.getMessage()
            ));
        }
    }
}