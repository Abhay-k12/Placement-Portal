package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Admin;
import com.PlacementPortal.Placement.Sarthi.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin createAdmin(Admin admin) {
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.onCreate();
        return adminRepository.save(admin);
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(String adminId) {
        return adminRepository.findById(adminId);
    }

    public Optional<Admin> getAdminByEmail(String emailAddress) {
        return adminRepository.findByEmailAddress(emailAddress);
    }

    public Admin updateAdmin(String adminId, Admin adminDetails) {
        Optional<Admin> optionalAdmin = adminRepository.findById(adminId);
        if (optionalAdmin.isPresent()) {
            Admin admin = optionalAdmin.get();
            admin.setAdminName(adminDetails.getAdminName());
            admin.setEmailAddress(adminDetails.getEmailAddress());
            admin.setPhoneNumber(adminDetails.getPhoneNumber());
            admin.setCity(adminDetails.getCity());
            admin.setDepartment(adminDetails.getDepartment());
            admin.setDateOfBirth(adminDetails.getDateOfBirth());

            // Only update password if provided and different
            if (adminDetails.getPassword() != null && !adminDetails.getPassword().isEmpty()) {
                if (!adminDetails.getPassword().startsWith("$2a$")) {
                    admin.setPassword(passwordEncoder.encode(adminDetails.getPassword()));
                }
            }

            admin.onUpdate();
            return adminRepository.save(admin);
        }
        return null;
    }

    public void deleteAdmin(String adminId) {
        adminRepository.deleteById(adminId);
    }

    public boolean adminExists(String emailAddress) {
        return adminRepository.existsByEmailAddress(emailAddress);
    }

    public void updateLastLogin(String adminId) {
        Optional<Admin> optionalAdmin = adminRepository.findById(adminId);
        if (optionalAdmin.isPresent()) {
            Admin admin = optionalAdmin.get();
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.save(admin);
        }
    }

    public boolean changePassword(String adminId, String currentPassword, String newPassword) {
        Optional<Admin> adminOpt = adminRepository.findById(adminId);
        if (adminOpt.isEmpty()) {
            throw new RuntimeException("Admin not found");
        }

        Admin admin = adminOpt.get();
        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            return false;
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.onUpdate();
        adminRepository.save(admin);
        return true;
    }
}