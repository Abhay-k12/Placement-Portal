package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Admin;
import com.PlacementPortal.Placement.Sarthi.entity.Company;
import com.PlacementPortal.Placement.Sarthi.entity.Student;
import com.PlacementPortal.Placement.Sarthi.repository.AdminRepository;
import com.PlacementPortal.Placement.Sarthi.repository.CompanyRepository;
import com.PlacementPortal.Placement.Sarthi.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public UserDetails loadUserByUsername(String compositeUsername) throws UsernameNotFoundException {
        if (compositeUsername == null || !compositeUsername.contains(":")) {
            throw new UsernameNotFoundException("Invalid username format. Expected role:userId");
        }

        String[] parts = compositeUsername.split(":", 2);
        String role = parts[0].trim().toLowerCase();
        String userId = parts[1].trim();

        switch (role) {
            case "student":
                return loadStudent(userId);
            case "admin":
                return loadAdmin(userId);
            case "company":
                return loadCompany(userId);
            default:
                throw new UsernameNotFoundException("Unknown role: " + role);
        }
    }

    private UserDetails loadStudent(String admissionNumber) {
        Optional<Student> studentOpt = studentRepository.findByStudentAdmissionNumber(admissionNumber);

        if (studentOpt.isEmpty()) {
            throw new UsernameNotFoundException("Student not found: " + admissionNumber);
        }

        Student student = studentOpt.get();

        if (student.getPassword() == null || student.getPassword().isEmpty()) {
            throw new UsernameNotFoundException("Student account not properly configured");
        }

        return new User(
                "student:" + student.getStudentAdmissionNumber(),
                student.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT"))
        );
    }

    private UserDetails loadAdmin(String identifier) {
        // Try by email first
        Optional<Admin> adminOpt = adminRepository.findByEmailAddress(identifier);

        // If not found by email, try by ID (String in MongoDB)
        if (adminOpt.isEmpty()) {
            adminOpt = adminRepository.findById(identifier);
        }

        if (adminOpt.isEmpty()) {
            throw new UsernameNotFoundException("Admin not found: " + identifier);
        }

        Admin admin = adminOpt.get();

        if (admin.getPassword() == null || admin.getPassword().isEmpty()) {
            throw new UsernameNotFoundException("Admin account not properly configured");
        }

        return new User(
                "admin:" + admin.getAdminId(),
                admin.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }

    private UserDetails loadCompany(String companyId) {
        Optional<Company> companyOpt = companyRepository.findByCompanyId(companyId);

        if (companyOpt.isEmpty()) {
            throw new UsernameNotFoundException("Company not found: " + companyId);
        }

        Company company = companyOpt.get();

        if (company.getPassword() == null || company.getPassword().isEmpty()) {
            throw new UsernameNotFoundException("Company account not properly configured");
        }

        return new User(
                "company:" + company.getCompanyId(),
                company.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_COMPANY"))
        );
    }
}