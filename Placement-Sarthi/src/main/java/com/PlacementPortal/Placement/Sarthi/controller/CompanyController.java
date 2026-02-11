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
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping("/create")
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        if (companyService.companyExists(company.getCompanyName())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false, "message", "Company name already exists"));
        }
        if (companyService.emailExists(company.getHrEmail())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false, "message", "HR email already exists"));
        }

        Company createdCompany = companyService.createCompany(company);
        return ResponseEntity.ok(createdCompany);
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<?> getCompanyById(@PathVariable String companyId) {
        try {
            Company company = companyService.getCompanyById(companyId);
            if (company != null) {
                return ResponseEntity.ok(company);
            }
            return ResponseEntity.status(404).body(Map.of(
                    "success", false, "message", "Company not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false, "message", "Error fetching company: " + e.getMessage()));
        }
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Company> getCompanyByName(@PathVariable String name) {
        Company company = companyService.getCompanyByName(name);
        if (company != null) return ResponseEntity.ok(company);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable String id, @RequestBody Company companyDetails) {
        Company updatedCompany = companyService.updateCompany(id, companyDetails);
        if (updatedCompany != null) return ResponseEntity.ok(updatedCompany);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable String id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check/{companyName}")
    public ResponseEntity<Boolean> checkCompanyExists(@PathVariable String companyName) {
        return ResponseEntity.ok(companyService.companyExists(companyName));
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        return ResponseEntity.ok(companyService.emailExists(email));
    }
}