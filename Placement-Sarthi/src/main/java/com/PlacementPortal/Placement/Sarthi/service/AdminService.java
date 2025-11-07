package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Admin;
import java.util.List;
import java.util.Optional;

public interface AdminService {
    Admin createAdmin(Admin admin);
    List<Admin> getAllAdmins();
    Optional<Admin> getAdminById(Long adminId);
    Optional<Admin> getAdminByEmail(String emailAddress);
    Admin updateAdmin(Long adminId, Admin adminDetails);
    void deleteAdmin(Long adminId);
    boolean adminExists(String emailAddress);
    void updateLastLogin(Long adminId);

}