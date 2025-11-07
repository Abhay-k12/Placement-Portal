package com.PlacementPortal.Placement.Sarthi.service.impl;

import com.PlacementPortal.Placement.Sarthi.entity.Company;
import com.PlacementPortal.Placement.Sarthi.repository.CompanyRepository;
import com.PlacementPortal.Placement.Sarthi.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyServiceImpl implements CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Override
    public Company getCompanyById(String companyId) {
        Optional<Company> companyOptional = companyRepository.findByCompanyId(companyId);
        return companyOptional.orElse(null);
    }

    @Override
    public Company getCompanyByName(String companyName) {
        // Implement this properly
        Optional<Company> company = companyRepository.findByCompanyName(companyName); // Add this method to repository
        return company.orElse(null);
    }

    @Override
    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }

    @Override
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @Override
    public Company updateCompany(String companyId, Company companyDetails) {
        Optional<Company> optionalCompany = companyRepository.findByCompanyId(companyId); // Remove Optional.ofNullable
        if (optionalCompany.isPresent()) {
            Company company = optionalCompany.get();
            company.setCompanyName(companyDetails.getCompanyName());
            company.setHrName(companyDetails.getHrName());
            company.setHrEmail(companyDetails.getHrEmail());
            company.setHrPhone(companyDetails.getHrPhone());
            company.setPhotoLink(companyDetails.getPhotoLink());
            company.setPassword(companyDetails.getPassword());
            return companyRepository.save(company);
        }
        return null;
    }

    @Override
    public void deleteCompany(String companyId) {
        Optional<Company> company = companyRepository.findByCompanyId(companyId);
        company.ifPresent(companyRepository::delete);
    }

    @Override
    public boolean companyExists(String companyName) {
        return companyRepository.existsByCompanyName(companyName);
    }

    @Override
    public boolean emailExists(String hrEmail) {
        return companyRepository.existsByHrEmail(hrEmail);
    }

    @Override
    public List<Company> searchCompaniesByName(String companyName) {
        return companyRepository.findByCompanyNameContainingIgnoreCase(companyName);
    }

    @Override
    public Company loginCompany(String companyId, String password) {
        Optional<Company> companyOptional = companyRepository.findByCompanyId(companyId);

        if (companyOptional.isPresent()) {
            Company company = companyOptional.get();
            if (password.equals(company.getPassword())) {
                return company;
            }
        }
        return null;
    }
}