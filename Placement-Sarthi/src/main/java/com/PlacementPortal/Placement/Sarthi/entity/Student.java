package com.PlacementPortal.Placement.Sarthi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    // Default constructor (required by JPA)
    public Student() {}

    // Parameterized constructor
    public Student(String studentAdmissionNumber, String studentFirstName, String studentLastName) {
        this.studentAdmissionNumber = studentAdmissionNumber;
        this.studentFirstName = studentFirstName;
        this.studentLastName = studentLastName;
        this.password = "gehu@123";
    }

    // constructor that initializes all fields
    public Student(String studentAdmissionNumber, String studentFirstName, String studentLastName,
                   String fatherName, String motherName, LocalDate dateOfBirth, Gender gender,
                   String mobileNo, String emailId, String collegeEmailId, String department,
                   String batch, Double cgpa, Double tenthPercentage, Double twelfthPercentage,
                   Integer backLogsCount, String address, String resumeLink, String photographLink,
                   String course, String studentUniversityRollNo, String studentEnrollmentNo,
                   String password, LocalDateTime lastLogin) {

        this.studentAdmissionNumber = studentAdmissionNumber;
        this.studentFirstName = studentFirstName;
        this.studentLastName = studentLastName;
        this.fatherName = fatherName;
        this.motherName = motherName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.mobileNo = mobileNo;
        this.emailId = emailId;
        this.collegeEmailId = collegeEmailId;
        this.department = department;
        this.batch = batch;
        this.cgpa = cgpa;
        this.tenthPercentage = tenthPercentage;
        this.twelfthPercentage = twelfthPercentage;
        this.backLogsCount = backLogsCount != null ? backLogsCount : 0;
        this.address = address;
        this.resumeLink = resumeLink;
        this.photographLink = photographLink;
        this.course = course;
        this.studentUniversityRollNo = studentUniversityRollNo;
        this.studentEnrollmentNo = studentEnrollmentNo;
        this.password = password != null ? password : "gehu@123";
        this.lastLogin = lastLogin;
    }

    // Getters and Setters (same as before)
    public String getStudentAdmissionNumber() { return studentAdmissionNumber; }
    public void setStudentAdmissionNumber(String studentAdmissionNumber) { this.studentAdmissionNumber = studentAdmissionNumber; }

    public String getStudentFirstName() { return studentFirstName; }
    public void setStudentFirstName(String studentFirstName) { this.studentFirstName = studentFirstName; }

    public String getStudentLastName() { return studentLastName; }
    public void setStudentLastName(String studentLastName) { this.studentLastName = studentLastName; }

    public String getFatherName() { return fatherName; }
    public void setFatherName(String fatherName) { this.fatherName = fatherName; }

    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public String getMobileNo() { return mobileNo; }
    public void setMobileNo(String mobileNo) { this.mobileNo = mobileNo; }

    public String getEmailId() { return emailId; }
    public void setEmailId(String emailId) { this.emailId = emailId; }

    public String getCollegeEmailId() { return collegeEmailId; }
    public void setCollegeEmailId(String collegeEmailId) { this.collegeEmailId = collegeEmailId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public Double getTenthPercentage() { return tenthPercentage; }
    public void setTenthPercentage(Double tenthPercentage) { this.tenthPercentage = tenthPercentage; }

    public Double getTwelfthPercentage() { return twelfthPercentage; }
    public void setTwelfthPercentage(Double twelfthPercentage) { this.twelfthPercentage = twelfthPercentage; }

    public Integer getBackLogsCount() { return backLogsCount; }
    public void setBackLogsCount(Integer backLogsCount) { this.backLogsCount = backLogsCount; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }

    public String getPhotographLink() { return photographLink; }
    public void setPhotographLink(String photographLink) { this.photographLink = photographLink; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getStudentUniversityRollNo() { return studentUniversityRollNo; }
    public void setStudentUniversityRollNo(String studentUniversityRollNo) { this.studentUniversityRollNo = studentUniversityRollNo; }

    public String getStudentEnrollmentNo() { return studentEnrollmentNo; }
    public void setStudentEnrollmentNo(String studentEnrollmentNo) { this.studentEnrollmentNo = studentEnrollmentNo; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
}