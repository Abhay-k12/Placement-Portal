package com.PlacementPortal.Placement.Sarthi.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "admins")
public class Admin {

    @Id
    private String adminId;

    private String adminName;

    @Indexed(unique = true)
    private String emailAddress;

    private String phoneNumber;

    private String city;

    private String department;

    private LocalDate dateOfBirth;

    private LocalDateTime lastLogin;

    private String password;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}