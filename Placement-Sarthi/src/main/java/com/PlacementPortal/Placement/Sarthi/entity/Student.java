package com.PlacementPortal.Placement.Sarthi.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "students")
public class Student {

    @Id
    @Column(name = "student_admission_number", length = 20)
    private String studentAdmissionNumber;

    @Column(name = "student_first_name", nullable = false, length = 50)
    private String studentFirstName;

    @Column(name = "student_last_name", nullable = false, length = 50)
    private String studentLastName;

    @Column(name = "father_name", length = 100)
    private String fatherName;

    @Column(name = "mother_name", length = 100)
    private String motherName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    @Column(name = "mobile_no", length = 15)
    private String mobileNo;

    @Column(name = "email_id", length = 100)
    private String emailId;

    @Column(name = "college_email_id", length = 100)
    private String collegeEmailId;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "batch", length = 10)
    private String batch;

    @Column(name = "cgpa")
    private Double cgpa; // Remove precision and scale for Double

    @Column(name = "tenth_percentage")
    private Double tenthPercentage; // Remove precision and scale for Double

    @Column(name = "twelfth_percentage")
    private Double twelfthPercentage; // Remove precision and scale for Double

    @Column(name = "back_logs_count")
    private Integer backLogsCount = 0;

    @Lob
    @Column(name = "address")
    private String address;

    @Column(name = "resume_link", length = 255)
    private String resumeLink;

    @Column(name = "photograph_link", length = 255)
    private String photographLink;

    @Column(name = "course", length = 100)
    private String course;

    @Column(name = "student_university_roll_no", length = 20)
    private String studentUniversityRollNo;

    @Column(name = "student_enrollment_no", length = 20)
    private String studentEnrollmentNo;

    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}