package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Company;
import com.PlacementPortal.Placement.Sarthi.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Company getCompanyById(String companyId) {
        return companyRepository.findByCompanyId(companyId).orElse(null);
    }

    public Company getCompanyByName(String companyName) {
        return companyRepository.findByCompanyName(companyName).orElse(null);
    }

    public Company createCompany(Company company) {
        company.setPassword(passwordEncoder.encode(company.getPassword()));
        company.onCreate();
        return companyRepository.save(company);
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company updateCompany(String companyId, Company companyDetails) {
        Optional<Company> optionalCompany = companyRepository.findByCompanyId(companyId);
        if (optionalCompany.isPresent()) {
            Company company = optionalCompany.get();
            company.setCompanyName(companyDetails.getCompanyName());
            company.setHrName(companyDetails.getHrName());
            company.setHrEmail(companyDetails.getHrEmail());
            company.setHrPhone(companyDetails.getHrPhone());
            company.setPhotoLink(companyDetails.getPhotoLink());

            if (companyDetails.getPassword() != null && !companyDetails.getPassword().isEmpty()) {
                if (!companyDetails.getPassword().startsWith("$2a$")) {
                    company.setPassword(passwordEncoder.encode(companyDetails.getPassword()));
                }
            }

            company.onUpdate();
            return companyRepository.save(company);
        }
        return null;
    }

    public void deleteCompany(String companyId) {
        Optional<Company> company = companyRepository.findByCompanyId(companyId);
        company.ifPresent(companyRepository::delete);
    }

    public boolean companyExists(String companyName) {
        return companyRepository.existsByCompanyName(companyName);
    }

    public boolean emailExists(String hrEmail) {
        return companyRepository.existsByHrEmail(hrEmail);
    }

    public List<Company> searchCompaniesByName(String companyName) {
        return companyRepository.findByCompanyNameContainingIgnoreCase(companyName);
    }
}