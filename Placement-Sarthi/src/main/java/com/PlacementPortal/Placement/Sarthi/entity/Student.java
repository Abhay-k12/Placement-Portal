package com.PlacementPortal.Placement.Sarthi.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "students")
public class Student {

    @Id
    private String studentAdmissionNumber;

    private String studentFirstName;

    private String studentLastName;

    private String fatherName;

    private String motherName;

    private LocalDate dateOfBirth;

    private Gender gender;

    private String mobileNo;

    private String emailId;

    private String collegeEmailId;

    private String department;

    private String batch;

    private Double cgpa;

    private Double tenthPercentage;

    private Double twelfthPercentage;

    private Integer backLogsCount = 0;

    private String address;

    private String resumeLink;

    private String photographLink;

    private String course;

    private String studentUniversityRollNo;

    private String studentEnrollmentNo;

    private String password;

    private LocalDateTime lastLogin;
}