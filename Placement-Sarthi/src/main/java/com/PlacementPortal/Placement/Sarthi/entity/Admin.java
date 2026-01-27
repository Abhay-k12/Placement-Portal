package com.PlacementPortal.Placement.Sarthi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@Entity
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_id")
    private Long adminId;

    @Column(name = "admin_name", nullable = false)
    private String adminName;

    @Column(name = "email_address", nullable = false, unique = true)
    private String emailAddress;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "city")
    private String city;

    @Column(name = "department")
    private String department;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // PrePersist and PreUpdate methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}