// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Role Selection
let currentRole = 'student';
const roleOptions = document.querySelectorAll('.role-option');
const roleInfos = document.querySelectorAll('.role-info');

// Helper functions for showing/hiding messages
function showLoginError(message) {
    const errorDiv = document.getElementById('loginErrorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.className = 'error-message show';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideLoginError();
        }, 5000);
    } else {
        // Fallback to alert if error div not found
        alert('Error: ' + message);
    }
}

function showLoginSuccess(message) {
    const errorDiv = document.getElementById('loginErrorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.className = 'success-message show';
    } else {
        alert(message);
    }
}

function hideLoginError() {
    const errorDiv = document.getElementById('loginErrorMessage');
    if (errorDiv) {
        errorDiv.className = 'error-message';
    }
}

// Function to load and display admin profile
// Update the loadAdminProfile function to include form population
async function loadAdminProfile() {
    const currentUser = sessionStorage.getItem('currentUser');

    if (!currentUser) {
        console.log('No user logged in');
        return;
    }

    const user = JSON.parse(currentUser);

    // Check if user is admin
    if (user.role !== 'admin') {
        console.log('User is not admin');
        return;
    }

    try {
        // Try to fetch fresh data from backend first
        let adminData = await fetchAdminProfile(user.id);

        // If backend fetch fails, use stored data
        if (!adminData) {
            adminData = user.adminData;
            console.log('Using stored admin data');
        } else {
            // Update session storage with fresh data
            user.adminData = adminData;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

        console.log('Loading admin profile:', adminData);

        // Update profile information in sidebar
        updateProfileElement('.admin-name', adminData.adminName || 'Administrator');
        updateProfileElement('.college-name', 'Graphic Era Hill University');
        updateProfileElement('.admin-role', 'Administrator');

        // Update personal information in sidebar
        updateDetailItem('Full Name', adminData.adminName || 'Not specified');
        updateDetailItem('Date of Birth', formatDate(adminData.dateOfBirth) || 'Not specified');
        updateDetailItem('Department', adminData.department || 'Not specified');

        // Update contact information in sidebar
        updateDetailItem('Email Address', adminData.emailAddress || 'Not specified');
        updateDetailItem('Contact Number', adminData.phoneNumber || 'Not specified');
        updateDetailItem('College', 'Graphic Era Hill University, Dehradun');
        updateDetailItem('City', adminData.city || 'Not specified');

        // Update the profile page form with actual data
        updateProfileForm(adminData);

    } catch (error) {
        console.error('Error loading admin profile:', error);
        // Fallback to stored data
        const user = JSON.parse(currentUser);
        if (user.adminData) {
            loadStoredAdminData(user.adminData);
            updateProfileForm(user.adminData);
        }
    }
}

// Function to update profile form with admin data
function updateProfileForm(adminData) {
    // Update profile overview section
    document.getElementById('profileName').textContent = adminData.adminName || 'Administrator';
    document.getElementById('profileEmailDisplay').textContent = adminData.emailAddress || 'Not specified';
    document.getElementById('profilePhoneDisplay').textContent = adminData.phoneNumber || 'Not specified';
    document.getElementById('profileLocationDisplay').textContent = adminData.city || 'Not specified';

    // Update admin ID (you might want to generate this or get from backend)
    const adminIdElement = document.querySelector('#profileInfo p:nth-child(2)');
    if (adminIdElement && adminData.adminId) {
        adminIdElement.textContent = `Admin ID: ADM-${adminData.adminId}`;
    }

    // Update edit form fields
    document.getElementById('fullName').value = adminData.adminName || '';
    document.getElementById('email').value = adminData.emailAddress || '';
    document.getElementById('phone').value = adminData.phoneNumber || '';
    document.getElementById('city').value = adminData.city || '';
    document.getElementById('department_edit').value = adminData.department || '';

    // Update last login time
    const lastLoginElement = document.querySelector('#profileInfo p:last-child');
    if (lastLoginElement) {
        const now = new Date();
        lastLoginElement.textContent = `Last Login: ${now.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })}, ${now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })}`;
    }
}

// Fallback function to load stored data
function loadStoredAdminData(adminData) {
    updateProfileElement('.admin-name', adminData.adminName || 'Administrator');
    updateProfileElement('.college-name', 'Graphic Era Hill University');
    updateProfileElement('.admin-role', 'Administrator');

    updateDetailItem('Full Name', adminData.adminName || 'Not specified');
    updateDetailItem('Date of Birth', formatDate(adminData.dateOfBirth) || 'Not specified');
    updateDetailItem('Department', adminData.department || 'Not specified');
    updateDetailItem('Email Address', adminData.emailAddress || 'Not specified');
    updateDetailItem('Contact Number', adminData.phoneNumber || 'Not specified');
    updateDetailItem('College', 'Graphic Era Hill University, Dehradun');
    updateDetailItem('City', adminData.city || 'Not specified');
}

roleOptions.forEach(option => {
    option.addEventListener('click', function() {
        const role = this.getAttribute('data-role');

        // Update active role option
        roleOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');

        // Update forms and info
        updateRole(role);
    });
});

function updateRole(role) {
    currentRole = role;

    // Remove required attribute from all inputs first
    const allInputs = document.querySelectorAll('#loginForm input[required]');
    allInputs.forEach(input => {
        input.removeAttribute('required');
        input.removeAttribute('aria-required');
    });

    // Hide all role info sections
    roleInfos.forEach(info => {
        info.classList.remove('active');
        info.style.display = 'none';
    });

    // Show active role info
    const activeForm = document.getElementById(`${role}Form`);
    const activeFeatures = document.getElementById(`${role}Features`);

    if (activeForm) {
        activeForm.classList.add('active');
        activeForm.style.display = 'block';
    }

    if (activeFeatures) {
        activeFeatures.classList.add('active');
        activeFeatures.style.display = 'block';
    }

    // Add required attribute only to active form inputs
    const activeInputs = activeForm.querySelectorAll('input');
    activeInputs.forEach(input => {
        input.setAttribute('required', '');
        input.setAttribute('aria-required', 'true');
    });

    // Update text content based on role
    const roleTitles = {
        student: 'Student',
        admin: 'Admin',
        company: 'Company'
    };

    const roleDescriptions = {
        student: 'Access your placement portal account to explore opportunities, apply for jobs, and track your applications.',
        admin: 'Manage the placement portal operations, oversee student and company accounts, and view placement statistics.',
        company: 'Access talented student profiles, schedule campus drives, and manage your recruitment process.'
    };

    const welcomeMessages = {
        student: 'Welcome Back, Student!',
        admin: 'Welcome, Administrator!',
        company: 'Welcome, Company Representative!'
    };

    const registerTexts = {
        student: 'New student? <a href="register.html">Create an account</a>',
        admin: 'Need admin access? <a href="contact.html">Contact super admin</a>',
        company: 'New company? <a href="company-register.html">Register your company</a>'
    };

    // Update UI elements
    document.getElementById('roleWelcome').textContent = welcomeMessages[role];
    document.getElementById('roleDescription').textContent = roleDescriptions[role];
    document.getElementById('formTitle').textContent = `${roleTitles[role]} Login`;
    document.getElementById('formDescription').textContent = `Enter your ${role.toLowerCase()} credentials to access your account`;
    document.getElementById('loginBtnText').textContent = `Login as ${roleTitles[role]}`;
    document.getElementById('registerText').innerHTML = registerTexts[role];

    // Reset form and hide any errors
    document.getElementById('loginForm').reset();
    hideLoginError();
}

// Login Form Submission with Real API Calls
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    let userId, password;

    // Get values based on current role
    if (currentRole === 'student') {
        userId = document.getElementById('studentId').value.trim();
        password = document.getElementById('studentPassword').value;
    } else if (currentRole === 'admin') {
        userId = document.getElementById('adminId').value.trim();
        password = document.getElementById('adminPassword').value;
    } else if (currentRole === 'company') {
        userId = document.getElementById('companyId').value.trim();
        password = document.getElementById('companyPassword').value;
    }

    // Hide any previous error messages
    hideLoginError();

    // Manual validation
    if (userId === '' || password === '') {
        showLoginError('Please fill in all fields');
        return;
    }

    // Show loading state
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="ri-loader-4-line"></i> Logging in...';
    loginBtn.disabled = true;

    try {
        const loginData = {
            userId: userId,
            password: password
        };

        // Make API call based on role
        let apiUrl = '';
        if (currentRole === 'student') {
            apiUrl = 'http://localhost:8081/api/students/login';
        } else if (currentRole === 'admin') {
            apiUrl = 'http://localhost:8081/api/admins/login';
        } else if (currentRole === 'company') {
            apiUrl = 'http://localhost:8081/api/companies/login';
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        // Check response status and success field properly
        // In the login success section - Update the student login part:
        if (response.ok && result.success === true) {
            // Store user data in session storage
            const userData = {
                id: result.user.studentAdmissionNumber || result.user.companyId || result.user.adminId,
                name: result.user.studentFirstName || result.user.companyName || result.user.adminName,
                role: currentRole,
                email: result.user.emailId || result.user.hrEmail || result.user.emailAddress,
            };

            // Store specific data based on role
            if (currentRole === 'student') {
                userData.studentData = {
                    studentAdmissionNumber: result.user.studentAdmissionNumber,
                    studentFirstName: result.user.studentFirstName,
                    studentLastName: result.user.studentLastName,
                    emailId: result.user.emailId,
                    department: result.user.department,
                    mobileNo: result.user.mobileNo,
                    dateOfBirth: result.user.dateOfBirth,
                    photographLink: result.user.photographLink,
                    studentUniversityRollNo: result.user.studentUniversityRollNo,
                    cgpa: result.user.cgpa
                    // Add other fields as needed
                };
            } else if (currentRole === 'company') {
                userData.companyData = {
                    companyId: result.user.companyId,
                    companyName: result.user.companyName,
                    hrName: result.user.hrName,
                    hrEmail: result.user.hrEmail,
                    hrPhone: result.user.hrPhone,
                    photoLink: result.user.photoLink
                };
            } else if (currentRole === 'admin') {
                userData.adminData = {
                    adminId: result.user.adminId,
                    adminName: result.user.adminName,
                    emailAddress: result.user.emailAddress,
                    phoneNumber: result.user.phoneNumber,
                    city: result.user.city,
                    department: result.user.department,
                    dateOfBirth: result.user.dateOfBirth
                };
            }

            sessionStorage.setItem('currentUser', JSON.stringify(userData));

            // Show success message
            const userName = result.user.studentFirstName || result.user.companyName || result.user.adminName || 'User';
            showLoginSuccess(`Login successful! Welcome back, ${userName}`);

            // Wait a moment before redirecting to show success message
            setTimeout(() => {
                const redirectUrls = {
                    student: 'student_dashboard.html',
                    admin: 'original-admin.html',
                    company: 'company_dashboard.html'
                };
                window.location.href = redirectUrls[currentRole];
            }, 1500);
        } else {

            let errorMessage = 'Login failed. Please check your credentials.';

            if (result.message) {
                errorMessage = result.message;
            } else if (response.status === 401) {
                errorMessage = 'Invalid credentials';
            } else if (response.status === 404) {
                errorMessage = 'User not found';
            } else if (!response.ok) {
                errorMessage = `Server error: ${response.status}`;
            }

            showLoginError(errorMessage);
        }

    } catch (error) {
        showLoginError('Network error. Please check your connection and try again.');
    } finally {
        // Reset button state
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
});

// Initialize the form on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state
    updateRole('student');

    // Check if user is already logged in
    checkExistingLogin();
});

// Forgot Password Modal
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModal = document.querySelector('.close-modal');
const successMessage = document.getElementById('successMessage');

forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();

    // Update modal content based on current role
    const roleLabels = {
        student: 'Student ID',
        admin: 'Admin ID',
        company: 'Company ID'
    };

    const rolePlaceholders = {
        student: 'Enter your student ID',
        admin: 'Enter your admin ID',
        company: 'Enter your company ID'
    };

    const modalTitles = {
        student: 'Reset Your Password',
        admin: 'Reset Admin Password',
        company: 'Reset Company Password'
    };

    const modalDescriptions = {
        student: 'Enter your student ID to receive a password reset link on your registered email.',
        admin: 'Enter your admin ID to receive a password reset link on your registered email.',
        company: 'Enter your company ID to receive a password reset link on your registered email.'
    };

    document.getElementById('modalTitle').textContent = modalTitles[currentRole];
    document.getElementById('modalDescription').textContent = modalDescriptions[currentRole];
    document.getElementById('modalLabel').textContent = roleLabels[currentRole];
    document.getElementById('resetUserId').placeholder = rolePlaceholders[currentRole];
    document.getElementById('resetBtnText').textContent = 'Send Reset Link';
    document.getElementById('successText').textContent = 'Password reset link has been sent to your registered email!';

    forgotPasswordModal.style.display = 'flex';
});

closeModal.addEventListener('click', function() {
    forgotPasswordModal.style.display = 'none';
    successMessage.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
        successMessage.style.display = 'none';
    }
});

// Forgot Password Form Submission
document.getElementById('forgotPasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const resetUserId = document.getElementById('resetUserId').value.trim();

    if (resetUserId === '') {
        alert('Please enter your ID');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/${currentRole}s/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: resetUserId })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            successMessage.style.display = 'block';

            // Reset form after 3 seconds and close modal
            setTimeout(function() {
                document.getElementById('forgotPasswordForm').reset();
                forgotPasswordModal.style.display = 'none';
                successMessage.style.display = 'none';
            }, 3000);
        } else {
            alert(result.message || 'Failed to send reset link. Please try again.');
        }

    } catch (error) {
        alert('Failed to send reset link. Please try again later.');
    }
});

// Mobile menu toggle
const mobileMenu = document.querySelector('.mobile-menu');
const nav = document.querySelector('nav ul');

if (mobileMenu && nav) {
    mobileMenu.addEventListener('click', function() {
        nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Function to fetch admin profile data from backend
async function fetchAdminProfile(adminId) {
    try {
        const response = await fetch(`http://localhost:8081/api/admins/${adminId}`);
        if (response.ok) {
            const adminData = await response.json();
            return adminData;
        } else {
            console.error('Failed to fetch admin profile');
            return null;
        }
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        return null;
    }
}
