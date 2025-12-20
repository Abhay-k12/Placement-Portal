# 🎓 Placement Sarthi — Smart Campus Placement Management System

<p align="center">
  🚀 A comprehensive Spring Boot web application that automates and streamlines the entire campus placement process, eliminating manual coordination through a centralized platform for students, companies, and administrators.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white"/>
</p>

<br>

---

## 📖 Problem Statement
The conventional campus placement system suffers from significant inefficiencies due to its reliance on fragmented, manual processes:

## 📧Communication Bottlenecks
- **Email Overload**: Placement cells exchange 100+ emails per company, creating communication chaos and missed information
- **Information Delays**: Critical updates about tests, interviews, and results take days to reach all stakeholders
- **Platform Fragmentation**: Communication happens across emails, WhatsApp, phone calls, and physical notice boards

## 📊Administrative Overhead
- **Data Duplication**: Students re-enter identical information across multiple Google Forms for different companies
- **Time Consumption**: Placement officers spend 60-70% of their time on administrative coordination rather than strategy
- **Manual Processes**: Every placement drive requires creating new forms, spreadsheets, and communication templates

## 💾Data Management Challenges
- **Siloed Information**: Student data resides in separate Excel sheets, email attachments, and paper records
- **Error-Prone Updates**: Manual data entry leads to incorrect eligibility lists and missed opportunities
- **Poor Analytics**: No centralized system to track placement trends, success rates, or student performance

## ⚠️Process Inefficiencies
- **Limited Scalability**: Manual systems struggle to handle multiple placement drives simultaneously
- **Repetitive Work**: The same administrative tasks repeat for every company visit
- **Compliance Risks**: Manual processes increase chances of errors in critical placement documentation

These inefficiencies result in delayed placements, reduced company participation, student frustration, and suboptimal placement outcomes that directly impact institutional reputation and student career prospects.

<br>

---

## 💡 Our Solution
Placement Sarthi revolutionizes campus recruitment by providing an integrated, automated platform that eliminates fragmentation and manual inefficiencies. Our solution delivers:

### 🎓 **For Students: Comprehensive Career Management**
- **Single-Source Profile Management**: Create and maintain one comprehensive profile accessible to all incoming recruiters.
- **Intelligent Event Discovery**: Single click apply option for matching placement drives based on eligibility, interests, and skills.
- **Real-time Application Tracking**: Monitor application status from registration to final selection.
- **Resume Management**: Google Drive integration for centralized resume storage and sharing.

### 🏢 **For Companies: Streamlined Recruitment Operations**
- **Simplified Registration**: Single-point registration with approval workflow and verification.
- **Targeted Job Postings**: Create detailed position descriptions with specific eligibility criteria.
- **Smart Candidate Filtering**: AI-powered shortlisting based on CGPA, skills, department, and other parameters.
- **Smart Scheduling**: Schedule Online Assesments and Interviews efficiently.
- **Compliance Management**: Ensure adherence to institutional placement policies and procedures.

### 👨‍💼 **For Administrators: Centralized Placement Governance**
- **Complete User Management**: Approve, monitor, and manage all student and company accounts.
- **Event Orchestration**: End-to-end coordination of placement drives from announcement to completion.
- **Policy Enforcement**: Configure and enforce institutional placement rules and eligibility criteria.
- **Student Management**: Management of Students with various placement related metrics.

### 📊 **Enterprise-Grade Operations Management**
- **Bulk Data Processing**: Excel/CSV import/export for student registrations, company data, and event management
- **Role-Based Messaging**: Secure communication channels between companies, and administrators
- **Audit Trail**: Complete logging of all communications and transactions for transparency and compliance
- **Modern Technology Stack**: Built with Spring Boot, MySQL, and responsive frontend technologies
- **Security First**: Role-based access control, data encryption, and secure authentication
- **API-First Design**: RESTful APIs enabling future integrations with HR systems and educational platforms

This holistic solution transforms campus placement from a fragmented, manual process into a streamlined, automated ecosystem where technology enhances human potential rather than complicating it.

<br>

---

## 🏗️ System Architecture

Placement Sarthi follows a modern **three-tier architecture** with clear separation of concerns, ensuring scalability, maintainability, and security.

### 🎯 High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[Student Portal<br/>HTML • CSS • JavaScript]
        B[Company Portal<br/>HTML • CSS • JavaScript]
        C[Admin Portal<br/>HTML • CSS • JavaScript]
        D[Placement Cell<br/>Placement Portal Frontend]
    end
    
    A --> F[Web Browser]
    B --> F
    C --> F
    D --> F
    
    subgraph "Application Layer"
        F --> G[RESTful API Gateway]
        G --> H[Spring Boot Server]
        H --> I[Business Logic Layer]
    end
    
    subgraph "Data Layer"
        I --> J[(MySQL Database)]
    end
    
    subgraph "Support Services"
        K[Authentication Service]
        L[Email Notification Service]
        M[File Processing Service]
    end
    
    I --> K
    I --> L
    I --> M
    
    style D fill:#e1f5fe
    style A fill:#f3e5f5
    style B fill:#e8f5e8
    style H fill:#fff3e0
```

<p align="center">
  <b>Figure 1: High-level system architecture showing interaction between presentation, application, and data layers</b>
</p>


<br>

### 🔄 Detailed Service Architecture

```mermaid
graph LR
    subgraph "Client Layer"
        A[Student Browser]
        B[Company Browser]
        C[Admin Browser]
    end
    
    subgraph "Controller Layer"
        D[Student Controller]
        E[Company Controller]
        F[Admin Controller]
        G[Event Controller]
        H[Participation Controller]
    end
    
    subgraph "Service Layer"
        I[Student Service]
        J[Company Service]
        K[Admin Service]
        L[Event Service]
        M[Excel Processing Service]
    end
    
    subgraph "Repository Layer"
        N[Student Repository]
        O[Company Repository]
        P[Admin Repository]
        Q[Event Repository]
        R[JPA / Spring Data]
    end
    
    subgraph "Data Layer"
        S[(MySQL Database)]
    end
    
    A --> D
    B --> E
    C --> F
    
    D --> I
    E --> J
    F --> K
    G --> L
    H --> M
    
    I --> N
    J --> O
    K --> P
    L --> Q
    M --> R
    
    N --> S
    O --> S
    P --> S
    Q --> S
    R --> S
    
    style I fill:#e1f5fe
    style J fill:#e1f5fe
    style K fill:#e1f5fe
    style L fill:#e1f5fe
    style M fill:#e1f5fe
    style N fill:#f3e5f5
    style O fill:#f3e5f5
    style P fill:#f3e5f5
    style Q fill:#f3e5f5
    style R fill:#f3e5f5
```

<p align="center">
  <b>Figure 2: Detailed service architecture showing dependency injection and layered design</b>
</p>

<br>

---

## 🏛️ Architectural Components

### **Presentation Layer**
- **Student Portal**: Responsive interface for profile management and application tracking
- **Company Portal**: Dashboard for recruitment activities and candidate management
- **Admin Portal**: Comprehensive control panel for system administration
- **Placement Cell Interface**: Central coordination hub for placement officers

### **Application Layer**
- **Spring Boot Backend**: Robust REST API server handling business logic
- **Controller Classes**: Handle HTTP requests and responses with proper validation
- **Service Classes**: Implement business logic and transaction management
- **Dependency Injection**: Spring Framework's IoC container for loose coupling

### **Data Layer**
- **Repository Pattern**: Abstraction layer for database operations
- **JPA/Hibernate**: Object-Relational Mapping for database interactions
- **MySQL Database**: Relational database with optimized schemas
- **Data Transfer Objects**: Secure data transfer between layers

### **Support Services**
- **Authentication Service**: Role-based access control and session management
- **Email Notification**: Automated alerts and communication
- **File Processing**: Excel/CSV import/export for bulk operations
- **CORS Configuration**: Secure cross-origin resource sharing

### Data Flow Process

1. **Request Initiation**: Client sends HTTP request to specific endpoint
2. **Controller Handling**: Request validated and forwarded to appropriate service
3. **Business Logic**: Service layer processes request, applies business rules
4. **Data Access**: Repository interfaces with database via JPA
5. **Response Building**: Data transformed to DTOs and sent back to client
6. **Presentation**: Frontend renders response in appropriate format


**This architecture ensures:**
- **Scalability**: Horizontal scaling capability for growing user base
- **Maintainability**: Clear separation of concerns and modular design
- **Security**: Multiple layers of protection against vulnerabilities
- **Performance**: Optimized database queries and efficient API design
- **Reliability**: Transaction management and error handling mechanisms

<br>

---

## 🚀 Key Features

### 🎓 Student Module
- ✅ **Profile Management**: Complete academic and personal information
- ✅ **Event Registration**: Register for placement drives
- ✅ **Application Tracking**: Monitor application status
- ✅ **Resume Management**: Google Drive integration for resume storage
- ✅ **Dashboard Analytics**: Performance metrics and progress tracking

### 🏢 Company Module
- ✅ **Registration & Approval**: Company onboarding workflow
- ✅ **Job Postings**: Create and manage placement opportunities
- ✅ **Candidate Search**: Filter and shortlist eligible students
- ✅ **Event Management**: Schedule and manage placement drives

### 👨‍💼 Admin Module
- ✅ **User Management**: Approve/disable student and company accounts
- ✅ **Event Coordination**: Create and manage all placement events
- ✅ **Bulk Operations**: Import/export data via Excel/CSV
- ✅ **Analytics Dashboard**: Placement statistics and reports
- ✅ **System Configuration**: Manage platform settings

### 🔧 Technical Features
- ✅ **Role-based Authentication**: Secure access for all user types
- ✅ **RESTful APIs**: Complete CRUD operations for all entities
- ✅ **Excel Processing**: Bulk data import/export functionality
- ✅ **Real-time Messaging**: Communication between stakeholders
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Database Relationships**: Optimized MySQL schema

<br>

---

## 🛠️ Tech Stack

<div align="center">

<table>
<thead>
<tr>
<th>🖥️ Technology</th>
<th>⚙️ Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/></td>
<td>Backend framework with embedded Tomcat</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white"/></td>
<td>Core backend language (Java 17+)</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/></td>
<td>Relational database management</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Spring%20Data%20JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white"/></td>
<td>Database access and ORM</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/></td>
<td>Structure of web pages</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/></td>
<td>Styling web pages</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/></td>
<td>Client-side interactions</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white"/></td>
<td>Authentication and authorization</td>
</tr>
</tbody>
</table>

</div>

<br>

---

## 📁 Project Directory Structure

```
Placement-Sarthi/
├── 📁 src/
│   └── 📁 main/
│       ├── 📁 java/
│       │   └── 📁 com/placementPortal/placement/Sarthi/
│       │       ├── 📄 PlacementSarthiApplication.java          # Spring Boot main class - starts the application
│       │       ├── 📁 config/
│       │       │   └── 📄 CordConfig.java                      # CORS configuration for frontend-backend communication
│       │       ├── 📁 controller/                              # REST API endpoints
│       │       │   ├── 📄 StudentController.java               # Handles student profile and application APIs
│       │       │   ├── 📄 CompanyController.java               # Manages company registration and job posting APIs
│       │       │   ├── 📄 AdminController.java                 # Administrative functions and user management APIs
│       │       │   ├── 📄 EventController.java                 # Event creation and management APIs
│       │       │   ├── 📄 WebController.java                   # Serves static pages and general web requests
│       │       │   ├── 📄 MessageController.java               # Handles messaging system between users
│       │       │   ├── 📄 ParticipationController.java         # Manages event participation registrations
│       │       │   └── 📄 BulkOperationController.java         # Handles bulk data import/export operations
│       │       ├── 📁 entity/                                  # Database models (JPA entities)
│       │       │   ├── 📄 Student.java                         # Student entity with profile and academic details
│       │       │   ├── 📄 Company.java                         # Company entity with profile and job postings
│       │       │   ├── 📄 Admin.java                           # Administrator entity with system privileges
│       │       │   ├── 📄 Event.java                           # Placement event entity with details and dates
│       │       │   ├── 📄 Message.java                         # Message entity for communication system
│       │       │   └── 📄 Participation.java                   # Tracks student participation in events
│       │       ├── 📁 repository/                              # Data access layer (JPA repositories)
│       │       │   ├── 📄 StudentRepository.java               # Database operations for students
│       │       │   ├── 📄 CompanyRepository.java               # Database operations for companies
│       │       │   ├── 📄 AdminRepository.java                 # Database operations for admins
│       │       │   ├── 📄 EventRepository.java                 # Database operations for events
│       │       │   ├── 📄 MessageRepository.java               # Database operations for messages
│       │       │   └── 📄 ParticipationRepository.java         # Database operations for participations
│       │       ├── 📁 service/                                 # Business logic layer
│       │       │   ├── 📄 StudentService.java                  # Interface for student business operations
│       │       │   ├── 📄 CompanyService.java                  # Interface for company business logic
│       │       │   ├── 📄 AdminService.java                    # Interface for admin system operations
│       │       │   ├── 📄 EventService.java                    # Interface for event management
│       │       │   ├── 📄 ExcelProcessingService.java          # Handles Excel file parsing and data extraction
│       │       │   ├── 📄 BulkOperationService.java            # Manages bulk data operations
│       │       │   ├── 📄 MessageService.java                  # Interface for messaging system
│       │       │   ├── 📄 ParticipationService.java            # Interface for participation tracking
│       │       │   └── 📁 impl/                                # Service implementations
│       │       │       ├── 📄 StudentServiceImpl.java          # Concrete implementation of student service
│       │       │       ├── 📄 CompanyServiceImpl.java          # Concrete implementation of company service
│       │       │       ├── 📄 AdminServiceImpl.java            # Concrete implementation of admin service
│       │       │       └── 📄 EventServiceImpl.java            # Concrete implementation of event service
│       │       └── 📁 dto/                                     # Data Transfer Objects
│       │           ├── 📄 BulkOperationRequest.java            # Request DTO for bulk operations
│       │           └── 📄 ParticipationDTO.java                # DTO for participation data transfer
│       └── 📁 resources/                                       # Application resources
│           ├── 📄 application.properties                       # Spring Boot configuration (database, server settings)
│           └── 📁 static/                                      # Frontend static assets
│               ├── 📁 css/                                     # Stylesheets
│               │   ├── 📄 student_dashboard.css                # Student dashboard styling
│               │   ├── 📄 company_dashboard.css                # Company dashboard styling
│               │   ├── 📄 admin_page.css                       # Admin interface styling
│               │   ├── 📄 login_page.css                       # Login page design
│               │   └── 📄 index.css                            # Main landing page styling
│               ├── 📁 js/                                      # Client-side JavaScript
│               │   ├── 📄 student_dashboard.js                 # Student dashboard functionality
│               │   ├── 📄 company_dashboard.js                 # Company dashboard functionality
│               │   ├── 📄 admin_page.js                        # Admin interface functionality
│               │   ├── 📄 login_page.js                        # Login form validation
│               │   └── 📄 index.js                             # Main page interactivity
│               ├── 📁 images/                                  # Visual assets (logos, icons, etc.)
│               ├── 📄 index.html                               # Main landing page
│               ├── 📄 login_page.html                          # User authentication page
│               ├── 📄 student_dashboard.html                   # Student portal interface
│               ├── 📄 company_dashboard.html                   # Company portal interface
│               └── 📄 original-admin.html                      # Administrative control panel
├── 📄 pom.xml                                                  # Maven configuration with dependencies
└── 📄 README.md                                                # Project documentation and setup guide
```

<br>

---

## 📸 Application Screenshots

### 🏠 Home Page
<p align="center">
  <img src="screenshots/home-page-1.png" width="45%" alt="Home Page 1"/>
  <img src="screenshots/home-page-2.png" width="45%" alt="Home Page 2"/>
</p>

### 🔐 Login Page
<p align="center">
  <img src="screenshots/login-page.png" width="90%" alt="Login Page"/>
</p>

### 🎓 Student Portal
<p align="center">
  <img src="screenshots/student-dashboard.png" width="45%" alt="Student Dashboard"/>
  <img src="screenshots/student-profile.png" width="45%" alt="Student Profile"/>
  <br>
  <img src="screenshots/student-events.png" width="45%" alt="Student Events"/>
  <img src="screenshots/student-records.png" width="45%" alt="Student Records"/>
</p>

### 🏢 Company Portal
<p align="center">
  <img src="screenshots/company-dashboard.png" width="45%" alt="Company Dashboard"/>
  <img src="screenshots/company-events.png" width="45%" alt="Company Events"/>
  <br>
  <img src="screenshots/company-students.png" width="45%" alt="Company Students"/>
  <img src="screenshots/company-analytics.png" width="45%" alt="Company Analytics"/>
</p>

### 👨‍💼 Admin Portal
<p align="center">
  <img src="screenshots/admin-dashboard.png" width="45%" alt="Admin Dashboard"/>
  <img src="screenshots/admin-users.png" width="45%" alt="Admin User Management"/>
  <br>
  <img src="screenshots/admin-events.png" width="45%" alt="Admin Events"/>
  <img src="screenshots/admin-analytics.png" width="45%" alt="Admin Analytics"/>
</p>

<br>

---

## 🚀 Quick Start Guide

### 📌 Prerequisites
- ✅ **Java 17** or higher
- ✅ **Maven 3.6** or higher
- ✅ **MySQL 8.0** or higher
- ✅ **Modern web browser** (Chrome, Firefox, Edge)

### 📥 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhay-k12/Placement-Portal.git
   cd Placement-Portal
   ```

2. **Configure database**
   ```sql
   CREATE DATABASE placement_portal;
   ```

3. **Update application properties**
   ```properties
   # src/main/resources/application.properties
   spring.datasource.url=jdbc:mysql://localhost:3306/placement_portal
   spring.datasource.username=your-username
   spring.datasource.password=your-password
   spring.jpa.hibernate.ddl-auto=update
   ```

4. **Build and run the application**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

5. **Access the application**
   ```
   http://localhost:8080
   ```

<br>

---

## 🔌 API Endpoints

### 🎓 Student Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students` | Get all students |
| `GET` | `/api/students/{id}` | Get student by ID |
| `POST` | `/api/students` | Create new student |
| `PUT` | `/api/students/{id}` | Update student |
| `GET` | `/api/students/{id}/participations` | Get student participations |

### 🏢 Company Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/companies` | Get all companies |
| `POST` | `/api/companies` | Register company |
| `PUT` | `/api/companies/{id}/approve` | Approve company |
| `GET` | `/api/companies/{id}/events` | Get company events |

### 📅 Event Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | Get all events |
| `POST` | `/api/events` | Create event |
| `GET` | `/api/events/{id}/participants` | Get event participants |
| `POST` | `/api/events/{id}/register` | Register for event |

### 📝 Participation Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/participations/register` | Register participation |
| `GET` | `/api/participations/student/{id}` | Get student participations |
| `PUT` | `/api/participations/{id}/status` | Update participation status |

### 📊 Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bulk/upload-students` | Upload students via Excel |
| `POST` | `/api/bulk/upload-events` | Upload events via Excel |
| `GET` | `/api/bulk/export-students` | Export students to Excel |

<br>

---

## 🗄️ Database Schema

### Core Tables
```sql
-- Students Table
CREATE TABLE student (
    student_admission_number VARCHAR(20) PRIMARY KEY,
    student_first_name VARCHAR(50),
    student_last_name VARCHAR(50),
    email_id VARCHAR(100),
    mobile_no VARCHAR(15),
    department VARCHAR(100),
    cgpa DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE company (
    company_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100),
    email VARCHAR(100),
    status ENUM('PENDING', 'APPROVED', 'REJECTED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE event (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255),
    organizing_company VARCHAR(255),
    expected_cgpa DOUBLE,
    job_role VARCHAR(100),
    registration_start DATETIME,
    registration_end DATETIME,
    event_mode ENUM('ONLINE', 'OFFLINE', 'HYBRID'),
    status ENUM('UPCOMING', 'ONGOING', 'COMPLETED')
);

-- Participations Table
CREATE TABLE participation (
    participation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_admission_number VARCHAR(20),
    event_id BIGINT,
    participation_status ENUM('REGISTERED', 'SELECTED', 'REJECTED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_admission_number) REFERENCES student(student_admission_number),
    FOREIGN KEY (event_id) REFERENCES event(event_id)
);
```

<br>

---

## 🧪 Testing & Validation

| Test Type | Status | Notes |
|-----------|--------|-------|
| Unit Testing | ✅ Pass | Spring Boot's built-in testing framework |
| Integration Testing | ✅ Pass | API endpoints validated through Postman |
| Database Testing | ✅ Pass | Schema and relationships verified |
| Frontend UI Testing | ✅ Pass | All functionality verified across browsers |
| Security Testing | ✅ Pass | Authentication flow tested |
| Performance Testing | ✅ Pass | Optimized database queries and indexing |

<br>

---

## 🔧 Challenges & Solutions

| Challenge | Solution Implemented |
|-----------|---------------------|
| **CORS Configuration** | Created dedicated `CordConfig.java` with comprehensive settings |
| **File Upload Handling** | Implemented robust exception handling and validation in `ExcelProcessingService` |
| **Database Relationships** | Used `@JsonIgnore` and DTO patterns to handle circular dependencies |
| **Frontend-Backend Integration** | Established clear API contracts and error handling standards |
| **Bulk Data Processing** | Implemented streaming Excel processing for large datasets |

<br>

---

## 📊 Project Progress & Deliverables

### ✅ Completed Modules (100%)
- 🎓 **Student Module**: Complete with profile, events, and resume management
- 🏢 **Company Module**: Full registration and job posting workflow
- 👨‍💼 **Admin Module**: Comprehensive user and event management
- 📅 **Event Management**: End-to-end event creation and tracking
- 📊 **Bulk Operations**: Excel import/export functionality

### 🔄 Advanced Stages
- 💬 **Message System**: 80% complete - Real-time communication
- 📝 **Participation Tracking**: 75% complete - Application status management

<br>

---

## 🌱 Future Enhancements

- 🔔 **Notification System**: Email/SMS alerts for events and updates
- 📱 **Mobile Application**: React Native cross-platform app
- 🎯 **Advanced Analytics**: Machine learning for placement predictions
- 🔍 **Resume Parser**: Automated extraction of skills and experience
- 💳 **Interview Scheduling**: Automated calendar integration
- 📈 **Placement Analytics**: Detailed metrics and reporting dashboard
- 🤖 **Chatbot Support**: AI-powered assistance for students
- 🌍 **Multi-language Support**: International student accessibility

<br>

---

## 📞 Help & Contact

> 💬 *Need help with Placement Sarthi or want to contribute?*  
> We're always open to collaboration and feedback!

<div align="center">

### 👤 Abhay Kanojia (Team Lead & Backend Developer)
<a href="https://www.linkedin.com/in/abhay-kanojia-0461a3341">
  <img src="https://img.shields.io/badge/Connect%20on-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn - Abhay Kanojia"/>
</a>

### 👤 Anvesha Rawat (Frontend Developer & Database)
<a href="https://www.linkedin.com/in/anvesha-rawat-b9a1a0308">
  <img src="https://img.shields.io/badge/Connect%20on-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn - Anvesha Rawat"/>
</a>

### 👤 Kartik Chadda (Frontend & UI/UX)
<a href="https://www.linkedin.com/in/kartik-chadda-547a2a2b6">
  <img src="https://img.shields.io/badge/Connect%20on-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="LinkedIn - Kartik Chadda"/>
</a>

</div>

<br>

---

<div align="center">

### 🎉 Acknowledgments
Special thanks to **Graphic Era Hill University** for providing the opportunity to develop this project and all stakeholders who contributed valuable feedback during development.

### ⭐ Support the Project
If you find Placement Sarthi helpful, please consider giving it a star on GitHub!

[![Star on GitHub](https://img.shields.io/github/stars/Abhay-k12/Placement-Portal?style=social)](https://github.com/Abhay-k12/Placement-Portal)

### 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

</div>

---

<p align="center">
  <i>"Streamlining campus placements, one connection at a time."</i>
</p>
