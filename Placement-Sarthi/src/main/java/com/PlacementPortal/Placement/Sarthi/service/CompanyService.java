package com.PlacementPortal.Placement.Sarthi.service;

import com.PlacementPortal.Placement.Sarthi.entity.Company;
import java.util.List;
import java.util.Optional;

public interface CompanyService {
    Company getCompanyById(String companyId);
    Company getCompanyByName(String companyName);
    Company createCompany(Company company);
    List<Company> getAllCompanies();
    Company updateCompany(String companyId, Company companyDetails);
    void deleteCompany(String companyId);
    boolean companyExists(String companyName);
    boolean emailExists(String hrEmail);
    List<Company> searchCompaniesByName(String companyName);
    Company loginCompany(String companyId, String password);
}