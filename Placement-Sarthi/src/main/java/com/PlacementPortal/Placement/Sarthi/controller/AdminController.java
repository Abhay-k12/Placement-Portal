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
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(@RequestBody Admin admin) {
        if (adminService.adminExists(admin.getEmailAddress())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false, "message", "Email already exists"));
        }
        Admin createdAdmin = adminService.createAdmin(admin);
        return ResponseEntity.ok(createdAdmin);
    }

    @GetMapping
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Admin> getAdminByEmail(@PathVariable String email) {
        Optional<Admin> admin = adminService.getAdminByEmail(email);
        return admin.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable String id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<Map<String, Object>> getAdminProfile(@PathVariable String adminId) {
        try {
            Optional<Admin> adminOptional = adminService.getAdminById(adminId);

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false, "message", "Admin not found"));
            }

            Admin admin = adminOptional.get();

            Map<String, Object> adminData = new HashMap<>();
            adminData.put("adminId", admin.getAdminId());
            adminData.put("adminName", admin.getAdminName());
            adminData.put("emailAddress", admin.getEmailAddress());
            adminData.put("phoneNumber", admin.getPhoneNumber());
            adminData.put("city", admin.getCity());
            adminData.put("department", admin.getDepartment());
            adminData.put("dateOfBirth", admin.getDateOfBirth());

            return ResponseEntity.ok(Map.of("success", true, "admin", adminData));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false, "message", "Error fetching admin profile: " + e.getMessage()));
        }
    }

    @PutMapping("/{adminId}/update")
    public ResponseEntity<Map<String, Object>> updateAdminProfile(
            @PathVariable String adminId,
            @RequestBody Admin updatedAdmin) {
        try {
            Optional<Admin> adminOptional = adminService.getAdminById(adminId);

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false, "message", "Admin not found"));
            }

            Admin admin = adminOptional.get();

            if (updatedAdmin.getAdminName() != null) admin.setAdminName(updatedAdmin.getAdminName());
            if (updatedAdmin.getEmailAddress() != null) admin.setEmailAddress(updatedAdmin.getEmailAddress());
            if (updatedAdmin.getPhoneNumber() != null) admin.setPhoneNumber(updatedAdmin.getPhoneNumber());
            if (updatedAdmin.getCity() != null) admin.setCity(updatedAdmin.getCity());
            if (updatedAdmin.getDepartment() != null) admin.setDepartment(updatedAdmin.getDepartment());

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
                    "admin", adminData));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false, "message", "Error updating profile: " + e.getMessage()));
        }
    }

    @PostMapping("/{adminId}/change-password")
    public ResponseEntity<Map<String, Object>> changeAdminPassword(
            @PathVariable String adminId,
            @RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "Both passwords required"));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false, "message", "New password must be at least 6 characters"));
            }

            boolean success = adminService.changePassword(adminId, currentPassword, newPassword);

            if (success) {
                return ResponseEntity.ok(Map.of(
                        "success", true, "message", "Password changed successfully"));
            } else {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false, "message", "Current password is incorrect"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false, "message", "Error changing password: " + e.getMessage()));
        }
    }
}