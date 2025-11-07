package com.PlacementPortal.Placement.Sarthi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {
    @Id
    @Column(name = "company_id")
    private String companyId;

    @Column(name = "company_name", nullable = false, unique = true)
    private String companyName;

    @Column(name = "hr_name", nullable = false)
    private String hrName;

    @Column(name = "hr_email", nullable = false)
    private String hrEmail;

    @Column(name = "hr_phone")
    private String hrPhone;

    @Column(name = "photo_link")
    private String photoLink;

    @Column(name = "password")
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Company() {}

    public Company(String companyId, String companyName, String hrName, String hrEmail,
                   String hrPhone, String photoLink, String password) {
        this.companyId = companyId;
        this.companyName = companyName;
        this.hrName = hrName;
        this.hrEmail = hrEmail;
        this.hrPhone = hrPhone;
        this.photoLink = photoLink;
        this.password = password;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getHrName() { return hrName; }
    public void setHrName(String hrName) { this.hrName = hrName; }

    public String getHrEmail() { return hrEmail; }
    public void setHrEmail(String hrEmail) { this.hrEmail = hrEmail; }

    public String getHrPhone() { return hrPhone; }
    public void setHrPhone(String hrPhone) { this.hrPhone = hrPhone; }

    public String getPhotoLink() { return photoLink; }
    public void setPhotoLink(String photoLink) { this.photoLink = photoLink; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}