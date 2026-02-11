// =============================================
// ROLE SELECTION
// =============================================
let currentRole = 'student';
const roleOptions = document.querySelectorAll('.role-option');
const roleInfos = document.querySelectorAll('.role-info');

// Helper functions for showing/hiding messages
function showLoginError(message) {
    const errorDiv = document.getElementById('loginErrorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.className = 'error-message show';
        setTimeout(() => { hideLoginError(); }, 5000);
    } else {
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

// =============================================
// ROLE UI SWITCHING
// =============================================
roleOptions.forEach(option => {
    option.addEventListener('click', function () {
        const role = this.getAttribute('data-role');
        roleOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        updateRole(role);
    });
});

function updateRole(role) {
    currentRole = role;

    // Remove required from all inputs first
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

    // Add required to active form inputs
    if (activeForm) {
        const activeInputs = activeForm.querySelectorAll('input');
        activeInputs.forEach(input => {
            input.setAttribute('required', '');
            input.setAttribute('aria-required', 'true');
        });
    }

    // Update UI text based on role
    const roleTitles = { student: 'Student', admin: 'Admin', company: 'Company' };

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

    const el = (id) => document.getElementById(id);
    if (el('roleWelcome')) el('roleWelcome').textContent = welcomeMessages[role];
    if (el('roleDescription')) el('roleDescription').textContent = roleDescriptions[role];
    if (el('formTitle')) el('formTitle').textContent = `${roleTitles[role]} Login`;
    if (el('formDescription')) el('formDescription').textContent = `Enter your ${role.toLowerCase()} credentials to access your account`;
    if (el('loginBtnText')) el('loginBtnText').textContent = `Login as ${roleTitles[role]}`;
    if (el('registerText')) el('registerText').innerHTML = registerTexts[role];

    // Reset form and hide any errors
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
    hideLoginError();
}

// =============================================
// LOGIN FORM SUBMISSION
// Uses /api/login (LoginController) which is permitAll
// Sends as form-urlencoded with username, password, role
// =============================================
document.getElementById('loginForm').addEventListener('submit', async function (e) {
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

    hideLoginError();

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
        // ===================================================
        // Send to /api/login (permitAll in SecurityConfig)
        // Must be form-urlencoded because LoginController uses @RequestParam
        // ===================================================
        const formBody = new URLSearchParams();
        formBody.append('username', userId);
        formBody.append('password', password);
        formBody.append('role', currentRole);

        const loginResponse = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody.toString(),
            credentials: 'same-origin'
        });

        // Try to parse response as JSON
        let result;
        try {
            result = await loginResponse.json();
        } catch (parseError) {
            showLoginError('Server returned invalid response. Please try again.');
            return;
        }

        if (!loginResponse.ok || !result.success) {
            showLoginError(result.message || 'Invalid credentials. Please try again.');
            return;
        }

        // ===================================================
        // Store user data in sessionStorage for dashboard JS
        // ===================================================
        const userData = {
            id: userId,
            name: '',
            role: currentRole
        };

        if (currentRole === 'student') {
            userData.id = result.user.studentAdmissionNumber || userId;
            userData.name = (result.user.studentFirstName || '') + ' ' + (result.user.studentLastName || '');
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
                cgpa: result.user.cgpa,
                batch: result.user.batch,
                course: result.user.course
            };
        } else if (currentRole === 'company') {
            userData.id = result.user.companyId || userId;
            userData.name = result.user.companyName || 'Company';
            userData.companyData = {
                companyId: result.user.companyId,
                companyName: result.user.companyName,
                hrName: result.user.hrName,
                hrEmail: result.user.hrEmail,
                hrPhone: result.user.hrPhone,
                photoLink: result.user.photoLink,
                createdAt: result.user.createdAt,
                updatedAt: result.user.updatedAt
            };
        } else if (currentRole === 'admin') {
            userData.id = result.user.adminId || userId;
            userData.name = result.user.adminName || 'Admin';
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

        // ===================================================
        // Show success and redirect
        // ===================================================
        const userName = result.user.studentFirstName || result.user.companyName || result.user.adminName || 'User';
        showLoginSuccess('Login successful! Welcome back, ' + userName);

        setTimeout(() => {
            const redirectUrls = {
                student: 'student_dashboard.html',
                admin: 'original-admin.html',
                company: 'company_dashboard.html'
            };
            window.location.href = redirectUrls[currentRole];
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Network error. Please check your connection and try again.');
    } finally {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
});

// =============================================
// FORGOT PASSWORD
// =============================================
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeModalBtn = document.querySelector('.close-modal');
const successMessage = document.getElementById('successMessage');

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function (e) {
        e.preventDefault();

        const roleLabels = { student: 'Student ID', admin: 'Admin ID', company: 'Company ID' };
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

        const el = (id) => document.getElementById(id);
        if (el('modalTitle')) el('modalTitle').textContent = modalTitles[currentRole];
        if (el('modalDescription')) el('modalDescription').textContent = modalDescriptions[currentRole];
        if (el('modalLabel')) el('modalLabel').textContent = roleLabels[currentRole];
        if (el('resetUserId')) el('resetUserId').placeholder = rolePlaceholders[currentRole];
        if (el('resetBtnText')) el('resetBtnText').textContent = 'Send Reset Link';
        if (el('successText')) el('successText').textContent = 'Password reset link has been sent to your registered email!';

        if (forgotPasswordModal) forgotPasswordModal.style.display = 'flex';
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function () {
        if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
    });
}

window.addEventListener('click', function (e) {
    if (e.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
    }
});

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const resetUserId = document.getElementById('resetUserId').value.trim();

        if (resetUserId === '') {
            alert('Please enter your ID');
            return;
        }

        try {
            const response = await fetch('/api/' + currentRole + 's/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: resetUserId })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                if (successMessage) successMessage.style.display = 'block';

                setTimeout(function () {
                    forgotPasswordForm.reset();
                    if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
                    if (successMessage) successMessage.style.display = 'none';
                }, 3000);
            } else {
                alert(result.message || 'Failed to send reset link. Please try again.');
            }

        } catch (error) {
            console.error('Forgot password error:', error);
            alert('Failed to send reset link. Please try again later.');
        }
    });
}

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    updateRole('student');
    checkExistingLogin();
});

// Check if user is already logged in
function checkExistingLogin() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            const redirectUrls = {
                student: 'student_dashboard.html',
                admin: 'original-admin.html',
                company: 'company_dashboard.html'
            };

            if (user.role && redirectUrls[user.role]) {
                // Verify session is still valid on server
                fetch('/api/check-session', {
                    credentials: 'same-origin'
                }).then(response => {
                    if (response.ok) {
                        // Session valid, redirect to dashboard
                        window.location.href = redirectUrls[user.role];
                    } else {
                        // Session expired, clear local data
                        sessionStorage.clear();
                    }
                }).catch(() => {
                    // Network error, don't redirect
                    sessionStorage.clear();
                });
            }
        } catch (e) {
            sessionStorage.clear();
        }
    }
}