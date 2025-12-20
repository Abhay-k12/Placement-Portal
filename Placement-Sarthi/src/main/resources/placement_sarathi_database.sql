-- Create Database
CREATE DATABASE IF NOT EXISTS placement_sarthi;

USE placement_sarthi;

-- ADMINISTRATORS TABLE
CREATE TABLE admins (
    admin_id BIGINT NOT NULL AUTO_INCREMENT,
    admin_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255),
    city VARCHAR(255),
    department VARCHAR(255),
    date_of_birth DATE,
    last_login TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id),
    UNIQUE (email_address)
);


-- COMPANIES TABLE
CREATE TABLE companies (
    company_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    hr_name VARCHAR(255) NOT NULL,
    hr_email VARCHAR(255) NOT NULL,
    hr_phone VARCHAR(255),
    photo_link VARCHAR(255),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (company_id),
    UNIQUE (company_name)
);


-- STUDENTS TABLE
CREATE TABLE students (
    student_admission_number VARCHAR(20) NOT NULL,
    student_first_name VARCHAR(50) NOT NULL,
    student_last_name VARCHAR(50) NOT NULL,
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    date_of_birth DATE,
    gender ENUM('Female', 'Male', 'Others'),
    mobile_no VARCHAR(15),
    email_id VARCHAR(100),
    college_email_id VARCHAR(100),
    department VARCHAR(100),
    batch VARCHAR(10),
    cgpa DOUBLE,
    tenth_percentage DOUBLE,
    twelfth_percentage DOUBLE,
    back_logs_count INT DEFAULT 0,
    address TINYTEXT,
    resume_link VARCHAR(255),
    photograph_link VARCHAR(255),
    course VARCHAR(100),
    student_university_roll_no VARCHAR(20),
    student_enrollment_no VARCHAR(20),
    password VARCHAR(255) DEFAULT 'gehu@123',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (student_admission_number)
);


-- EVENTS TABLE
CREATE TABLE events (
    event_id BIGINT NOT NULL AUTO_INCREMENT,
    event_name VARCHAR(255) NOT NULL,
    organizing_company VARCHAR(255) NOT NULL,
    expected_cgpa DOUBLE,
    job_role VARCHAR(100),
    registration_start DATETIME NOT NULL,
    registration_end DATETIME NOT NULL,
    event_mode ENUM('ONLINE', 'OFFLINE', 'HYBRID') DEFAULT 'ONLINE',
    expected_package DOUBLE,
    event_description TEXT NOT NULL,
    eligible_departments LONGTEXT,
    status ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id)
);


-- PARTICIPATION TABLE (Junction Table)
CREATE TABLE participation (
    student_admission_number VARCHAR(20) NOT NULL,
    event_id BIGINT NOT NULL,
    event_description TEXT,
    participation_status ENUM('REGISTERED', 'ATTEMPTED', 'COMPLETED', 'ABSENT', 'SELECTED', 'REJECTED') DEFAULT 'REGISTERED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (student_admission_number, event_id),
    FOREIGN KEY (student_admission_number)
        REFERENCES students(student_admission_number)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (event_id)
        REFERENCES events(event_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


-- MESSAGES TABLE
CREATE TABLE messages (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);


-- Student indexes
CREATE INDEX idx_student_name ON students(student_first_name, student_last_name);
CREATE INDEX idx_student_department_cgpa ON students(department, cgpa);

-- Event indexes
CREATE INDEX idx_event_company_status ON events(organizing_company, status);
CREATE INDEX idx_event_dates ON events(registration_start, registration_end);

-- Message indexes
CREATE INDEX idx_message_sender_date ON messages(sender_email, created_at);

-- Participation indexes
CREATE INDEX idx_participation_student ON participation(student_admission_number);
CREATE INDEX idx_participation_event ON participation(event_id);