package com.PlacementPortal.Placement.Sarthi.service.impl;

import com.PlacementPortal.Placement.Sarthi.entity.Admin;
import com.PlacementPortal.Placement.Sarthi.repository.AdminRepository;
import com.PlacementPortal.Placement.Sarthi.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public Admin createAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    @Override
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Override
    public Optional<Admin> getAdminById(Long adminId) {
        return adminRepository.findById(adminId);
    }

    @Override
    public Optional<Admin> getAdminByEmail(String emailAddress) {
        return adminRepository.findByEmailAddress(emailAddress);
    }

    @Override
    public Admin updateAdmin(Long adminId, Admin adminDetails) {
        Optional<Admin> optionalAdmin = adminRepository.findById(adminId);
        if (optionalAdmin.isPresent()) {
            Admin admin = optionalAdmin.get();
            admin.setAdminName(adminDetails.getAdminName());
            admin.setEmailAddress(adminDetails.getEmailAddress());
            admin.setPhoneNumber(adminDetails.getPhoneNumber());
            admin.setCity(adminDetails.getCity());
            admin.setDepartment(adminDetails.getDepartment());
            admin.setDateOfBirth(adminDetails.getDateOfBirth());
            admin.setPassword(adminDetails.getPassword());
            return adminRepository.save(admin);
        }
        return null;
    }

    @Override
    public void deleteAdmin(Long adminId) {
        adminRepository.deleteById(adminId);
    }

    @Override
    public boolean adminExists(String emailAddress) {
        return adminRepository.existsByEmailAddress(emailAddress);
    }

    @Override
    public void updateLastLogin(Long adminId) {
        Optional<Admin> optionalAdmin = adminRepository.findById(adminId);
        if (optionalAdmin.isPresent()) {
            Admin admin = optionalAdmin.get();
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.save(admin);
        }
    }
}