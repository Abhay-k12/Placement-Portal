package com.PlacementPortal.Placement.Sarthi.repository;

import com.PlacementPortal.Placement.Sarthi.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmailAddress(String emailAddress);
    boolean existsByEmailAddress(String emailAddress);
}
