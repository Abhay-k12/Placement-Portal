package com.PlacementPortal.Placement.Sarthi.controller;

import com.PlacementPortal.Placement.Sarthi.entity.Company;
import com.PlacementPortal.Placement.Sarthi.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "http://localhost:8081")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping("/create")
    public ResponseEntity<Company> createCompany(@RequestBody Company company) {
        // Check if company already exists
        if (companyService.companyExists(company.getCompanyName())) {
            return ResponseEntity.badRequest().body(null);
        }

        // Check if email already exists
        if (companyService.emailExists(company.getHrEmail())) {
            return ResponseEntity.badRequest().body(null);
        }

        Company createdCompany = companyService.createCompany(company);
        return ResponseEntity.ok(createdCompany);
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        List<Company> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<?> getCompanyById(@PathVariable String companyId) {
        try {
            Optional<Company> company = Optional.ofNullable(companyService.getCompanyById(companyId));
            if (company.isPresent()) {
                return ResponseEntity.ok(company);
            } else {
                return ResponseEntity.status(404).body("Company not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching company: " + e.getMessage());
        }
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Company> getCompanyByName(@PathVariable String name) {
        Company company = companyService.getCompanyByName(name);
        if (company != null) {
            return ResponseEntity.ok(company);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable String id, @RequestBody Company companyDetails) {
        Company updatedCompany = companyService.updateCompany(id, companyDetails);
        if (updatedCompany != null) {
            return ResponseEntity.ok(updatedCompany);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable String id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check/{companyName}")
    public ResponseEntity<Boolean> checkCompanyExists(@PathVariable String companyName) {
        boolean exists = companyService.companyExists(companyName);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = companyService.emailExists(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginCompany(@RequestBody Map<String, String> loginData) {
        System.out.println("COMPANY LOGIN START");

        try {
            // Check if request body is null
            if (loginData == null) {
                System.out.println("Login data is null");
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Login data is required"
                ));
            }

            String companyId = loginData.get("userId");
            String password = loginData.get("password");

            System.out.println("Received - Company ID: " + companyId + ", Password: " + (password != null ? "[PROVIDED]" : "null"));

            // Check if required fields are present
            if (companyId == null || companyId.trim().isEmpty()) {
                System.out.println("Company ID is missing or empty");
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Company ID is required"
                ));
            }

            if (password == null || password.trim().isEmpty()) {
                System.out.println("Password is missing or empty");
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Password is required"
                ));
            }

            // Trim the inputs
            companyId = companyId.trim();
            password = password.trim();

            System.out.println("Attempting to login company with ID: " + companyId);

            // Use the service method for login
            Company company = companyService.loginCompany(companyId, password);

            if (company == null) {
                System.out.println("Login failed - Invalid credentials for company ID: " + companyId);
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Invalid credentials"
                ));
            }

            System.out.println("Login successful for company: " + company.getCompanyName());

            // Login successful - return user data
            Map<String, Object> userData = new HashMap<>();
            userData.put("companyId", company.getCompanyId() != null ? company.getCompanyId() : "");
            userData.put("companyName", company.getCompanyName() != null ? company.getCompanyName() : "");
            userData.put("hrName", company.getHrName() != null ? company.getHrName() : "");
            userData.put("hrEmail", company.getHrEmail() != null ? company.getHrEmail() : "");
            userData.put("hrPhone", company.getHrPhone() != null ? company.getHrPhone() : "");
            userData.put("photoLink", company.getPhotoLink() != null ? company.getPhotoLink() : "");
            userData.put("createdAt", company.getCreatedAt() != null ? company.getCreatedAt().toString() : "");
            userData.put("updatedAt", company.getUpdatedAt() != null ? company.getUpdatedAt().toString() : "");

            Map<String, Object> response = Map.of(
                    "success", true,
                    "message", "Login successful",
                    "user", userData
            );

            System.out.println("Sending successful login response");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error during company login:");
            e.printStackTrace();

            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Login failed: " + (e.getMessage() != null ? e.getMessage() : "Unknown error")
            ));
        } finally {
            System.out.println("COMPANY LOGIN END");
        }
    }
}