package com.PlacementPortal.Placement.Sarthi.repository;

import com.PlacementPortal.Placement.Sarthi.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {
    Optional<Company> findByCompanyName(String companyName);
    List<Company> findByCompanyNameContainingIgnoreCase(String companyName);
    boolean existsByCompanyName(String companyName);
    boolean existsByHrEmail(String hrEmail);
    Optional<Company> findByCompanyId(String companyId);
}
