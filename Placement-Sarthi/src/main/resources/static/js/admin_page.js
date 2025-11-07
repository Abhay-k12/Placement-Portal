// =============================================
// 1. AUTHENTICATION & SESSION MANAGEMENT
// =============================================

// Authentication check for admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Skip authentication check if we're on login page
    const isLoginPage = window.location.pathname.includes('login_page.html') ||
                        window.location.pathname.includes('index.html') ||
                        window.location.pathname === '/';

    if (isLoginPage) {
        return;
    }

    const currentUser = sessionStorage.getItem('currentUser');

    if (!currentUser) {
        alert('Please login first');
        window.location.href = 'login_page.html';
        return;
    }

    const user = JSON.parse(currentUser);

    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'login_page.html';
        return;
    }

    // Initialize all admin dashboard functionalities
    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    loadAdminProfile();
    initializeProfilePage();
    loadProfileSettings();
    setupPageNavigation();
    loadEventsByTab('upcoming');
    loadCompanies();

    // Setup profile page click listener
    const profileLink = document.querySelector('a[onclick*="profile"]');
    if (profileLink) {
        profileLink.addEventListener('click', function() {
            setTimeout(() => {
                loadAdminProfile();
                loadProfileSettings();
            }, 100);
        });
    }
}

// =============================================
// 2. PAGE NAVIGATION SYSTEM
// =============================================

const pages = {
    'dashboard': document.getElementById('dashboard'),
    'register-students': document.getElementById('register-students'),
    'profile': document.getElementById('profile'),
    'messages': document.getElementById('messages'),
    'events': document.getElementById('events'),
    'announcements': document.getElementById('announcements'),
    'analytics': document.getElementById('analytics'),
    'settings': document.getElementById('settings')
};

function showPage(pageId) {
    // Hide all pages
    Object.values(pages).forEach(page => {
        if (page) page.style.display = 'none';
    });

    // Remove active class from all sidebar links
    document.querySelectorAll('aside .sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected page
    if (pages[pageId]) {
        pages[pageId].style.display = 'block';
    }
}

function setupPageNavigation() {
    // Initialize page
    showPage('dashboard');
}

// =============================================
// 3. ADMIN PROFILE MANAGEMENT
// =============================================

// Profile API functions
async function fetchAdminProfile(adminId) {
    try {
        const response = await fetch(`http://localhost:8081/api/admins/${adminId}`);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                return result.admin;
            }
        }
        console.error('Failed to fetch admin profile');
        return null;
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        return null;
    }
}

async function updateAdminProfile(profileData) {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        const user = JSON.parse(currentUser);

        const response = await fetch(`http://localhost:8081/api/admins/${user.id}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, data: result };
        } else {
            const error = await response.text();
            return { success: false, error: error };
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }
}

async function changeAdminPassword(passwordData) {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        const user = JSON.parse(currentUser);

        const response = await fetch(`http://localhost:8081/api/admins/${user.id}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(passwordData)
        });

        if (response.ok) {
            const result = await response.json();
            return { success: true, data: result };
        } else {
            const error = await response.text();
            return { success: false, error: error };
        }
    } catch (error) {
        console.error('Error changing password:', error);
        return { success: false, error: error.message };
    }
}

// Profile UI functions
async function loadAdminProfile() {
    const currentUser = sessionStorage.getItem('currentUser');

    if (!currentUser) {
        console.log('No user logged in');
        return;
    }

    const user = JSON.parse(currentUser);

    if (user.role !== 'admin') {
        console.log('User is not admin');
        return;
    }

    try {
        let adminData = await fetchAdminProfile(user.id);

        if (!adminData) {
            adminData = user.adminData;
            console.log('Using stored admin data');
        } else {
            user.adminData = adminData;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

        console.log('Loading admin profile:', adminData);

        // Update sidebar profile
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

        // Update profile page
        updateProfileForm(adminData);

    } catch (error) {
        console.error('Error loading admin profile:', error);
        const user = JSON.parse(currentUser);
        if (user.adminData) {
            loadStoredAdminData(user.adminData);
            updateProfileForm(user.adminData);
        }
    }
}

function updateProfileForm(adminData) {
    // Update profile overview section
    const profileName = document.getElementById('profileName');
    const profileEmailDisplay = document.getElementById('profileEmailDisplay');
    const profilePhoneDisplay = document.getElementById('profilePhoneDisplay');
    const profileLocationDisplay = document.getElementById('profileLocationDisplay');

    if (profileName) profileName.textContent = adminData.adminName || 'Administrator';
    if (profileEmailDisplay) profileEmailDisplay.textContent = adminData.emailAddress || 'Not specified';
    if (profilePhoneDisplay) profilePhoneDisplay.textContent = adminData.phoneNumber || 'Not specified';
    if (profileLocationDisplay) profileLocationDisplay.textContent = adminData.city || 'Not specified';

    // Update admin ID
    const adminIdElement = document.querySelector('#profileInfo p:nth-child(2)');
    if (adminIdElement && adminData.adminId) {
        adminIdElement.textContent = `Admin ID: ADM-${adminData.adminId}`;
    }

    // Update edit form fields
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const city = document.getElementById('city');
    const department_edit = document.getElementById('department_edit');

    if (fullName) fullName.value = adminData.adminName || '';
    if (email) email.value = adminData.emailAddress || '';
    if (phone) phone.value = adminData.phoneNumber || '';
    if (city) city.value = adminData.city || '';
    if (department_edit) department_edit.value = adminData.department || '';

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

// Profile helper functions
function updateProfileElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

function updateDetailItem(label, value) {
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        const labelElement = item.querySelector('.label');
        if (labelElement && labelElement.textContent === label) {
            const valueElement = item.querySelector('.value');
            if (valueElement) {
                valueElement.textContent = value;
            }
        }
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Profile event handlers
function initializeProfilePage() {
    // Save Profile Button
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleProfileSave);
    }

    // Cancel Profile Button
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener('click', handleProfileCancel);
    }

    // Change Password Button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handlePasswordChange);
    }

    // Save Settings Button
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', handleSettingsSave);
    }

    // Reset Defaults Button
    const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
    if (resetDefaultsBtn) {
        resetDefaultsBtn.addEventListener('click', handleResetDefaults);
    }

    // Photo Upload
    const photoUploadBtn = document.getElementById('photoUploadBtn');
    const photoUpload = document.getElementById('photoUpload');
    if (photoUploadBtn && photoUpload) {
        photoUploadBtn.addEventListener('click', () => photoUpload.click());
        photoUpload.addEventListener('change', handlePhotoUpload);
    }
}

async function handleProfileSave() {
    const saveBtn = document.getElementById('saveProfileBtn');
    if (!saveBtn) return;

    const originalText = saveBtn.textContent;

    try {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const profileData = {
            adminName: document.getElementById('fullName').value.trim(),
            emailAddress: document.getElementById('email').value.trim(),
            phoneNumber: document.getElementById('phone').value.trim(),
            city: document.getElementById('city').value.trim(),
            department: document.getElementById('department_edit').value.trim()
        };

        // Validation
        if (!profileData.adminName) {
            alert('Please enter your full name');
            return;
        }

        if (!profileData.emailAddress) {
            alert('Please enter your email address');
            return;
        }

        const result = await updateAdminProfile(profileData);

        if (result.success) {
            const currentUser = sessionStorage.getItem('currentUser');
            const user = JSON.parse(currentUser);
            user.adminData = { ...user.adminData, ...profileData };
            sessionStorage.setItem('currentUser', JSON.stringify(user));

            updateProfileForm(user.adminData);
            loadAdminProfile();

            showMessage('Profile updated successfully!', 'success');
        } else {
            showMessage('Failed to update profile: ' + result.error, 'error');
        }

    } catch (error) {
        showMessage('Error updating profile: ' + error.message, 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

function handleProfileCancel() {
    const currentUser = sessionStorage.getItem('currentUser');
    const user = JSON.parse(currentUser);
    if (user.adminData) {
        updateProfileForm(user.adminData);
    }
    showMessage('Changes discarded', 'info');
}

async function handlePasswordChange() {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm your new password:');
    if (!confirmPassword) return;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    try {
        const passwordData = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        const result = await changeAdminPassword(passwordData);

        if (result.success) {
            alert('Password changed successfully!');
        } else {
            alert('Failed to change password: ' + result.error);
        }
    } catch (error) {
        alert('Error changing password: ' + error.message);
    }
}

function handleSettingsSave() {
    const emailToggle = document.getElementById('emailToggle');
    if (!emailToggle) return;

    const emailNotifications = emailToggle.checked;
    const settings = {
        emailNotifications: emailNotifications
    };

    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showMessage('Settings saved successfully!', 'success');
}

function handleResetDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        const emailToggle = document.getElementById('emailToggle');
        if (emailToggle) {
            emailToggle.checked = true;
        }

        localStorage.removeItem('adminSettings');
        showMessage('Settings reset to defaults', 'info');
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.src = e.target.result;
        }

        localStorage.setItem('adminProfileImage', e.target.result);
        showMessage('Profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
}

function loadProfileSettings() {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const emailToggle = document.getElementById('emailToggle');
        if (emailToggle) {
            emailToggle.checked = settings.emailNotifications;
        }
    }

    const savedImage = localStorage.getItem('adminProfileImage');
    if (savedImage) {
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
            profileImage.src = savedImage;
        }
    }
}

// =============================================
// 4. STUDENT REGISTRATION MANAGEMENT
// =============================================

// Individual Student Registration
async function registerStudent() {
    const requiredFields = ['admissionNumber', 'firstName', 'lastName'];
    const missingFields = [];

    requiredFields.forEach(field => {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            missingFields.push(field);
        }
    });

    if (missingFields.length > 0) {
        const fieldNames = {
            'admissionNumber': 'Admission Number',
            'firstName': 'First Name',
            'lastName': 'Last Name'
        };
        alert('Please fill in all required fields: ' + missingFields.map(field => fieldNames[field] || field).join(', '));
        return;
    }

    const studentData = {
        studentAdmissionNumber: document.getElementById('admissionNumber').value.trim(),
        studentFirstName: document.getElementById('firstName').value.trim(),
        studentLastName: document.getElementById('lastName').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim() || null,
        motherName: document.getElementById('motherName').value.trim() || null,
        dateOfBirth: document.getElementById('dateOfBirth').value || null,
        gender: document.getElementById('gender').value || null,
        mobileNo: document.getElementById('mobileNo').value.trim() || null,
        emailId: document.getElementById('emailId').value.trim() || null,
        collegeEmailId: document.getElementById('collegeEmailId').value.trim() || null,
        department: document.getElementById('department').value || null,
        batch: document.getElementById('batch').value || null,
        cgpa: parseFloat(document.getElementById('cgpa').value) || null,
        tenthPercentage: parseFloat(document.getElementById('tenthPercentage').value) || null,
        twelfthPercentage: parseFloat(document.getElementById('twelfthPercentage').value) || null,
        backLogsCount: parseInt(document.getElementById('backLogsCount').value) || 0,
        address: document.getElementById('address').value.trim() || null,
        course: document.getElementById('course').value || null,
        studentUniversityRollNo: document.getElementById('universityRollNo').value.trim() || null,
        studentEnrollmentNo: document.getElementById('enrollmentNo').value.trim() || null,
        resumeLink: document.getElementById('resume').files[0] ? 'resume_uploaded' : null,
        photographLink: document.getElementById('photograph').files[0] ? 'photo_uploaded' : null
    };

    // Validation
    if (studentData.cgpa && (studentData.cgpa < 0 || studentData.cgpa > 10)) {
        alert('CGPA must be between 0 and 10');
        return;
    }

    if (studentData.tenthPercentage && (studentData.tenthPercentage < 0 || studentData.tenthPercentage > 100)) {
        alert('10th Percentage must be between 0 and 100');
        return;
    }

    if (studentData.twelfthPercentage && (studentData.twelfthPercentage < 0 || studentData.twelfthPercentage > 100)) {
        alert('12th Percentage must be between 0 and 100');
        return;
    }

    if (studentData.backLogsCount < 0) {
        alert('Backlogs count cannot be negative');
        return;
    }

    if (studentData.emailId && !isValidEmail(studentData.emailId)) {
        alert('Please enter a valid email address');
        return;
    }

    if (studentData.collegeEmailId && !isValidEmail(studentData.collegeEmailId)) {
        alert('Please enter a valid college email address');
        return;
    }

    if (studentData.mobileNo && !isValidMobile(studentData.mobileNo)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }

    const registerBtn = document.getElementById('registerBtn');
    const originalText = registerBtn.textContent;
    registerBtn.textContent = 'Registering...';
    registerBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:8081/api/students/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        alert('Student registered successfully!');

        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.reset();
        }

    } catch (error) {
        console.error('Full error details:', error);
        alert('Registration failed: ' + error.message);
    } finally {
        registerBtn.textContent = originalText;
        registerBtn.disabled = false;
    }
}

// Bulk Student Upload
function setupBulkUpload() {
    const fileInput = document.getElementById('bulkFileInput');
    const uploadArea = document.getElementById('uploadArea');

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                displaySelectedFile(file);
            }
        });
    }

    if (uploadArea) {
        setupDragAndDrop(uploadArea, fileInput);
    }
}

function setupDragAndDrop(uploadArea, fileInput) {
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.background = '#f8fafc';
        uploadArea.style.borderColor = '#3b82f6';
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.background = '';
        uploadArea.style.borderColor = '';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.background = '';
        uploadArea.style.borderColor = '';

        const files = e.dataTransfer.files;
        if (files.length > 0 && fileInput) {
            fileInput.files = files;
            displaySelectedFile(files[0]);
        }
    });
}

function displaySelectedFile(file) {
    const fileInfoContainer = document.getElementById('fileInfoContainer');
    if (!fileInfoContainer) return;

    fileInfoContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; padding:0.75rem; background:#f0f9ff; border-radius:8px; border:1px solid #bae6fd;">
            <span class="material-symbols-outlined" style="color:#3b82f6;">description</span>
            <div style="flex:1;">
                <div style="font-weight:500; color:#0369a1;">${file.name}</div>
                <div style="font-size:0.875rem; color:#64748b;">${(file.size / 1024).toFixed(2)} KB</div>
            </div>
            <button type="button" onclick="removeSelectedFile()" style="background:none; border:none; color:#64748b; cursor:pointer; padding:4px;">
                <span class="material-symbols-outlined" style="font-size:1.25rem;">close</span>
            </button>
        </div>
    `;

    showMessage(`File selected: ${file.name}`, 'info');
}

function removeSelectedFile() {
    const fileInput = document.getElementById('bulkFileInput');
    const fileInfoContainer = document.getElementById('fileInfoContainer');

    if (fileInput) fileInput.value = '';
    if (fileInfoContainer) fileInfoContainer.innerHTML = '';

    showMessage('File removed', 'info');
}

async function handleBulkUpload() {
    const fileInput = document.getElementById('bulkFileInput');
    if (!fileInput) {
        showMessage('Error: File input not found', 'error');
        return;
    }

    const file = fileInput.files[0];
    if (!file) {
        showMessage('Please select a file first!', 'error');
        return;
    }

    const fileName = file.name.toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidFile) {
        showMessage('Please upload an Excel file (.xlsx, .xls) or CSV file', 'error');
        return;
    }

    showMessage('Processing file...', 'info');

    const uploadBtn = document.querySelector('button[onclick="handleUploadProcess()"]');
    const originalText = uploadBtn.textContent;
    uploadBtn.textContent = 'Processing...';
    uploadBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/students/bulk-upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            showUploadResult(result);
            removeSelectedFile();
            updateStatistics(result.successfulCount);
        } else {
            showMessage(`Upload failed: ${result.message}`, 'error');
        }

    } catch (error) {
        console.error('Upload error:', error);
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        if (uploadBtn) {
            uploadBtn.textContent = originalText;
            uploadBtn.disabled = false;
        }
    }
}

function showUploadResult(result) {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) return;

    let errorsHtml = '';
    if (result.errors && result.errors.length > 0) {
        errorsHtml = `
            <div style="margin-top:1rem;">
                <h4 style="color:#dc2626; margin-bottom:0.5rem;">Errors (${result.errorCount}):</h4>
                <div style="max-height:200px; overflow-y:auto; border:1px solid #e5e7eb; border-radius:8px; padding:1rem; background:#fef2f2;">
                    ${result.errors.map(error => `
                        <div style="padding:0.5rem; border-bottom:1px solid #fecaca;">
                            <strong style="color:#dc2626;">Row ${error.row}:</strong> ${Object.entries(error)
                                .filter(([key]) => key !== 'row')
                                .map(([field, msg]) => `<span style="color:#7f1d1d;">${field}: ${msg}</span>`)
                                .join(', ')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    messageContainer.innerHTML = `
        <div style="padding:1.5rem; border-radius:12px; background:#f0f9ff; border:1px solid #bae6fd; margin:1rem 0;">
            <div style="display:flex; align-items:center; gap:0.5rem; color:#0369a1; margin-bottom:1rem;">
                <span class="material-symbols-outlined" style="font-size:1.5rem;">check_circle</span>
                <h3 style="margin:0; font-size:1.125rem;">Upload Complete!</h3>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:1rem; margin-bottom:1rem;">
                <div style="text-align:center; padding:1rem; background:white; border-radius:8px; border:1px solid #bbf7d0;">
                    <div style="font-size:1.5rem; font-weight:bold; color:#10b981;">${result.successfulCount}</div>
                    <div style="font-size:0.875rem; color:#64748b;">Successful</div>
                </div>
                <div style="text-align:center; padding:1rem; background:white; border-radius:8px; border:1px solid #fecaca;">
                    <div style="font-size:1.5rem; font-weight:bold; color:#dc2626;">${result.errorCount}</div>
                    <div style="font-size:0.875rem; color:#64748b;">Errors</div>
                </div>
            </div>
            <p style="margin:0; color:#64748b; font-weight:500;">${result.message}</p>
            ${errorsHtml}
        </div>
    `;
}

function downloadTemplate() {
    showMessage('Downloading template...', 'info');

    const link = document.createElement('a');
    link.href = '/api/students/download-template';
    link.download = 'student_bulk_upload_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        showMessage('Template downloaded successfully!', 'success');
    }, 1500);
}

// =============================================
// 5. EVENT MANAGEMENT
// =============================================

// Event Tab Management
async function switchEventTab(button, tabType) {
    const tabs = document.querySelectorAll('.event-tab');
    tabs.forEach(tab => {
        tab.style.background = 'white';
        tab.style.color = '#6b7280';
        tab.style.border = '1px solid #e5e7eb';
        tab.style.boxShadow = 'none';
        tab.style.fontWeight = '500';
    });

    button.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
    button.style.fontWeight = '600';

    await loadEventsByTab(tabType);
}

async function loadEventsByTab(tabType) {
    try {
        const urlMap = {
            'upcoming': '/api/events/upcoming',
            'ongoing': '/api/events/ongoing',
            'past': '/api/events/past'
        };

        const url = urlMap[tabType] || '/api/events';

        const response = await fetch(url);

        if (response.ok) {
            const events = await response.json();
            updateEventCards(events);
        } else {
            await loadAllEventsAndFilter(tabType);
        }
    } catch (error) {
        console.error('Error loading events:', error);
        await loadAllEventsAndFilter(tabType);
    }
}

async function loadAllEventsAndFilter(tabType) {
    try {
        const response = await fetch('/api/events');
        if (response.ok) {
            const allEvents = await response.json();
            const filteredEvents = filterEventsByDate(allEvents, tabType);
            updateEventCards(filteredEvents);

            const eventCards = document.getElementById('eventCards');
            if (eventCards && eventCards.querySelector('.event-card')) {
                const infoDiv = document.createElement('div');
                infoDiv.style.cssText = 'background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;';
                infoDiv.innerHTML = `<strong>Info:</strong> Showing ${filteredEvents.length} ${tabType} events (using client-side filtering)`;
                eventCards.insertBefore(infoDiv, eventCards.firstChild);
            }
        } else {
            throw new Error('Failed to load events');
        }
    } catch (error) {
        console.error('Error in fallback loading:', error);
        showNoEventsMessage(tabType);
    }
}

function filterEventsByDate(events, tabType) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return events.filter(event => {
        const regStart = new Date(event.registrationStart);
        const regEnd = new Date(event.registrationEnd);

        const startDate = new Date(regStart.getFullYear(), regStart.getMonth(), regStart.getDate());
        const endDate = new Date(regEnd.getFullYear(), regEnd.getMonth(), regEnd.getDate());

        switch(tabType) {
            case 'upcoming':
                return startDate > today;
            case 'ongoing':
                return startDate <= today && endDate >= today;
            case 'past':
                return endDate < today;
            default:
                return true;
        }
    });
}

function showNoEventsMessage(tabType) {
    const eventCards = document.getElementById('eventCards');
    if (eventCards) {
        eventCards.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📅</div>
                <h3>No ${tabType} events found</h3>
                <p>There are currently no ${tabType} events available.</p>
            </div>
        `;
    }
}

// Event Form Management
function showEventForm() {
    const form = document.getElementById('event-creation-form');
    const eventCards = document.getElementById('eventCards');

    if (!form || !eventCards) {
        alert('Form element not found!');
        return;
    }

    if (form.style.display === 'none') {
        form.style.display = 'block';
        eventCards.style.display = 'none';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
        eventCards.style.display = 'grid';
    }
}

function closeEventForm() {
    document.getElementById('event-creation-form').style.display = 'none';
    document.getElementById('eventCards').style.display = 'grid';
    document.getElementById('addEventForm').reset();
}

async function submitEventForm() {
    const selectedDepartments = getSelectedDepartments();

    const eventData = {
        eventName: document.getElementById('eventName').value.trim(),
        organizingCompany: document.getElementById('organizingCompany').value.trim(),
        expectedCgpa: parseFloat(document.getElementById('expectedCgpa').value) || 0,
        jobRole: document.getElementById('jobRole').value.trim() || null,
        registrationStart: document.getElementById('registrationStart').value + ':00',
        registrationEnd: document.getElementById('registrationEnd').value + ':00',
        eventMode: document.getElementById('eventMode').value.toUpperCase(),
        expectedPackage: parseFloat(document.getElementById('expectedPackage').value) || null,
        eventDescription: document.getElementById('eventDescription').value.trim(),
        eligibleDepartments: selectedDepartments ? JSON.stringify(selectedDepartments) : null
    };

    // Validation
    if (!eventData.eventName || !eventData.organizingCompany || !eventData.registrationStart ||
        !eventData.registrationEnd || !eventData.eventDescription) {
        alert('Please fill in all required fields');
        return;
    }

    const regStart = new Date(eventData.registrationStart);
    const regEnd = new Date(eventData.registrationEnd);

    if (regEnd <= regStart) {
        alert('Registration end date must be after registration start date');
        return;
    }

    try {
        const response = await fetch('http://localhost:8081/api/events/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            const createdEvent = await response.json();
            alert('Event created successfully!');
            closeEventForm();

            const activeTab = document.querySelector('.event-tab[style*="background: linear-gradient"]');
            if (activeTab) {
                const tabType = activeTab.textContent.toLowerCase().includes('upcoming') ? 'upcoming' :
                              activeTab.textContent.toLowerCase().includes('ongoing') ? 'ongoing' : 'past';
                await loadEventsByTab(tabType);
            } else {
                await loadEventsByTab('upcoming');
            }
        } else {
            const error = await response.text();
            alert('Error creating event: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create event: ' + error.message);
    }
}

function getSelectedDepartments() {
    const checkboxes = document.querySelectorAll('input[name="eligibleDepartments"]:checked');
    const departments = Array.from(checkboxes).map(cb => cb.value);
    return departments.length > 0 ? departments : null;
}

// Event Cards Management
function updateEventCards(events) {
    const eventCardsContainer = document.getElementById('eventCards');
    if (!eventCardsContainer) return;

    eventCardsContainer.innerHTML = '';

    if (events.length === 0) {
        eventCardsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #6b7280;">
                <h3>No events found</h3>
                <p>There are no events in this category.</p>
            </div>
        `;
        return;
    }

    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventCardsContainer.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.style = 'background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.3s ease;';
    card.onmouseover = function() {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    };
    card.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    };

    const regStart = new Date(event.registrationStart).toLocaleString();
    const regEnd = new Date(event.registrationEnd).toLocaleString();
    const now = new Date();
    const eventRegStart = new Date(event.registrationStart);
    const eventRegEnd = new Date(event.registrationEnd);

    let statusStyle = '';
    let statusText = '';
    if (eventRegStart > now) {
        statusStyle = 'background: #fef3c7; color: #d97706;';
        statusText = 'UPCOMING';
    } else if (eventRegStart <= now && eventRegEnd >= now) {
        statusStyle = 'background: #dcfce7; color: #16a34a;';
        statusText = 'ONGOING';
    } else {
        statusStyle = 'background: #e5e7eb; color: #6b7280;';
        statusText = 'COMPLETED';
    }

    const companyInitial = event.organizingCompany.charAt(0).toUpperCase();

    card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">
                ${companyInitial}
            </div>
            <div style="flex: 1;">
                <h3 style="margin: 0 0 0.25rem 0; color: #1e293b; font-size: 1.125rem; font-weight: 600;">${event.organizingCompany}</h3>
                <p style="margin: 0; color: #64748b; font-size: 0.875rem;">${event.jobRole || 'Not specified'}</p>
            </div>
            <span style="${statusStyle} padding: 0.375rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">${statusText}</span>
        </div>
        <div style="margin-bottom: 1rem;">
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>Event:</strong> ${event.eventName}</p>
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>Reg Start:</strong> ${regStart}</p>
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>Reg End:</strong> ${regEnd}</p>
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>Mode:</strong> ${event.eventMode}</p>
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>CGPA:</strong> ${event.expectedCgpa || 'Not specified'}</p>
            <p style="margin: 0; color: #374151; font-size: 0.875rem;"><strong>Package:</strong> ${event.expectedPackage ? '₹' + event.expectedPackage + ' LPA' : 'Not specified'}</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
            <button onclick="viewEvent(${event.eventId})" style="flex: 1; background: #3b82f6; color: white; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500;">View</button>
            <button onclick="editEvent(${event.eventId})" style="flex: 1; background: #f59e0b; color: white; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500;">Edit</button>
            <button onclick="manageStudents(${event.eventId})" style="flex: 1; background: #10b981; color: white; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500;">Manage</button>
        </div>
    `;

    return card;
}

// Event Action Functions
async function viewEvent(eventId) {
    try {
        const response = await fetch(`http://localhost:8081/api/events/${eventId}`);
        if (response.ok) {
            const event = await response.json();
            alert(`Event Details:\nName: ${event.eventName}\nCompany: ${event.organizingCompany}\nDescription: ${event.eventDescription}`);
        }
    } catch (error) {
        console.error('Error viewing event:', error);
    }
}

async function editEvent(eventId) {
    alert('Edit event with ID: ' + eventId);
}

async function manageStudents(eventId) {
    alert('Manage students for event ID: ' + eventId);
}

// Event Search and Filter
function searchEvents(query) {
    const cards = document.querySelectorAll('.event-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterEventsByCompany(company) {
    const cards = document.querySelectorAll('.event-card');
    cards.forEach(card => {
        if (company === 'all') {
            card.style.display = 'block';
        } else {
            const companyName = card.querySelector('h3').textContent.toLowerCase();
            if (companyName.includes(company.toLowerCase())) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// =============================================
// 6. COMPANY MANAGEMENT
// =============================================

// Company Tab Management
function switchCompanyTab(button, tabType) {
    const tabs = document.querySelectorAll('.company-tab');
    tabs.forEach(tab => {
        tab.style.background = 'transparent';
        tab.style.color = '#64748b';
        tab.style.fontWeight = '500';
    });

    button.style.background = 'white';
    button.style.color = '#1e293b';
    button.style.fontWeight = '600';
    button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

    const tabContents = document.querySelectorAll('.company-tab-content');
    tabContents.forEach(tab => tab.style.display = 'none');

    switch(tabType) {
        case 'directory':
            document.getElementById('company-directory').style.display = 'block';
            loadCompanies();
            break;
        case 'add':
            document.getElementById('company-add').style.display = 'block';
            break;
        case 'drives':
            document.getElementById('company-drives').style.display = 'block';
            loadCompanyDrives();
            break;
        case 'analytics':
            document.getElementById('company-analytics').style.display = 'block';
            break;
    }
}

// Company Data Management
async function loadCompanies() {
    try {
        const response = await fetch('http://localhost:8081/api/companies');
        if (response.ok) {
            const companies = await response.json();
            updateCompanyTable(companies);
        }
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

function updateCompanyTable(companies) {
    const tableBody = document.querySelector('#company-directory tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    companies.forEach(company => {
        const row = document.createElement('tr');
        row.style.transition = 'all 0.2s ease';
        row.onmouseover = function() { this.style.background = '#f8fafc'; };
        row.onmouseout = function() { this.style.background = 'white'; };

        const companyInitial = company.companyName.charAt(0).toUpperCase();

        row.innerHTML = `
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div style="width:40px; height:40px; border-radius:8px; background:#4285f4; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.25rem;">
                        ${companyInitial}
                    </div>
                    <div>
                        <div style="font-weight:600; color:#1e293b;">${company.companyName}</div>
                        <div style="font-size:0.75rem; color:#64748b;">ID: ${company.companyId}</div>
                    </div>
                </div>
            </td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; color:#64748b;">IT & Software</td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; color:#64748b;">${company.hrName}</td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; color:#64748b;">${company.hrEmail}</td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; color:#64748b;">0</td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9;">
                <span style="background:#dcfce7; color:#16a34a; padding:0.25rem 0.75rem; border-radius:12px; font-size:0.75rem; font-weight:500;">Active</span>
            </td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; gap:0.25rem; flex-wrap:wrap;">
                    <button onclick="viewCompanyDetails('${company.companyId}')" style="background:#3b82f6; color:white; padding:0.25rem 0.5rem; border:none; border-radius:4px; cursor:pointer; font-size:0.7rem; font-weight:500; white-space:nowrap;" title="View Details">View</button>
                    <button onclick="editCompany('${company.companyId}')" style="background:#f59e0b; color:white; padding:0.25rem 0.5rem; border:none; border-radius:4px; cursor:pointer; font-size:0.7rem; font-weight:500; white-space:nowrap;" title="Edit">Edit</button>
                    <button onclick="terminateCompany('${company.companyId}')" style="background:#dc2626; color:white; padding:0.25rem 0.5rem; border:none; border-radius:4px; cursor:pointer; font-size:0.7rem; font-weight:500; white-space:nowrap;" title="Terminate Access">Terminate</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function submitCompanyForm() {
    const companyName = document.getElementById('companyName').value.trim();
    const hrName = document.getElementById('hrName').value.trim();
    const hrEmail = document.getElementById('hrEmail').value.trim();
    const hrPhone = document.getElementById('hrPhone').value.trim();
    const photoLink = document.getElementById('photoLink').value.trim();

    const now = new Date();
    const dateStr = now.getDate().toString().padStart(2, '0') + (now.getMonth() + 1).toString().padStart(2, '0');

    const companyData = {
        companyName: companyName,
        hrName: hrName,
        hrEmail: hrEmail,
        hrPhone: hrPhone,
        photoLink: photoLink || null,
        companyId: companyName.replace(/\s+/g, '').toUpperCase() + dateStr,
        password: companyName.replace(/\s+/g, '') + '@gehu'
    };

    if (!companyData.companyName || !companyData.hrName || !companyData.hrEmail || !companyData.hrPhone) {
        alert('Please fill in all required fields');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyData.hrEmail)) {
        alert('Please enter a valid email address');
        return;
    }

    try {
        const response = await fetch('http://localhost:8081/api/companies/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(companyData)
        });

        if (response.ok) {
            const createdCompany = await response.json();
            alert(`Company created successfully!\n\nCompany ID: ${createdCompany.companyId}\nPassword: ${createdCompany.password}\n\nPlease note these credentials for future reference.`);
            resetCompanyForm();
            switchCompanyTab(document.querySelector('.company-tab[onclick*="directory"]'), 'directory');
        } else {
            const errorText = await response.text();
            if (response.status === 400) {
                alert('Error creating company: Company name or email already exists. Please use different details.');
            } else {
                alert('Error creating company: ' + errorText);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create company. Please check your connection and try again.');
    }
}

function resetCompanyForm() {
    document.getElementById('addCompanyForm').reset();
}

async function terminateCompany(companyId) {
    if (confirm('Are you sure you want to terminate this company\'s access? This action cannot be undone.')) {
        try {
            const response = await fetch(`http://localhost:8081/api/companies/${companyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Company access terminated successfully');
                loadCompanies();
            } else {
                alert('Error terminating company access');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to terminate company: ' + error.message);
        }
    }
}

async function loadCompanyDrives() {
    try {
        const eventsResponse = await fetch('http://localhost:8081/api/events');
        const companiesResponse = await fetch('http://localhost:8081/api/companies');

        if (!eventsResponse.ok || !companiesResponse.ok) {
            throw new Error('Failed to load data');
        }

        const events = await eventsResponse.json();
        const companies = await companiesResponse.json();

        const companyNames = new Set(companies.map(company => company.companyName));
        updateDrivesTable(events, companyNames);
    } catch (error) {
        console.error('Error loading company drives:', error);
        const tableBody = document.querySelector('#company-drives tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="padding:2rem; text-align:center; color:#dc2626;">
                        Error loading drives: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

function updateDrivesTable(events, companyNames) {
    const tableBody = document.querySelector('#company-drives tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!events || events.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding:2rem; text-align:center; color:#64748b;">
                    No events found.
                </td>
            </tr>
        `;
        return;
    }

    events.forEach(event => {
        const row = document.createElement('tr');
        row.style.transition = 'all 0.2s ease';
        row.onmouseover = function() { this.style.background = '#f8fafc'; };
        row.onmouseout = function() { this.style.background = 'white'; };

        const companyExists = companyNames.has(event.organizingCompany);
        const companyNote = companyExists ? '' : '<div style="font-size:0.7rem; color:#dc2626; margin-top:2px;">* External Source</div>';

        let eventDate = 'Not set';
        try {
            if (event.registrationStart) {
                eventDate = new Date(event.registrationStart).toLocaleDateString();
            }
        } catch (dateError) {
            console.warn('Invalid date for event:', event.eventId);
        }

        const eventId = event.eventId || 'unknown';
        const safeEventId = String(eventId).replace(/'/g, "\\'").replace(/"/g, '&quot;');

        row.innerHTML = `
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; font-weight:500;">
                ${event.eventName || 'Unnamed Event'}
                ${companyNote}
            </td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; color:#64748b;">
                ${event.organizingCompany || 'Unknown Company'}
            </td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; color:#64748b;">
                ${event.jobRole || 'Not specified'}
            </td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; color:#64748b;">
                ${eventDate}
            </td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9; color:#64748b;">-</td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9;">
                <span style="background:#fef3c7; color:#d97706; padding:0.25rem 0.75rem; border-radius:12px; font-size:0.75rem; font-weight:500;">
                    ${event.status || 'Upcoming'}
                </span>
            </td>
            <td style="padding:1rem; border-bottom:1px solid #f1f5f9;">
                <div style="display:flex; gap:0.25rem;">
                    <button onclick="editDrive('${safeEventId}')" style="background:#f59e0b; color:white; padding:0.5rem 0.75rem; border:none; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:500;" title="Edit">Edit</button>
                    <button onclick="manageStudents('${safeEventId}')" style="background:#10b981; color:white; padding:0.5rem 0.75rem; border:none; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:500;" title="Manage Students">Manage</button>
                    <button onclick="viewResults('${safeEventId}')" style="background:#3b82f6; color:white; padding:0.5rem 0.75rem; border:none; border-radius:6px; cursor:pointer; font-size:0.75rem; font-weight:500;" title="View Results">Results</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function searchCompanies(query) {
    const rows = document.querySelectorAll('#company-directory tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Company Action Functions
function viewCompanyDetails(companyId) {
    alert('View details for company: ' + companyId);
}

function editCompany(companyId) {
    alert('Edit company: ' + companyId);
}

function createNewDrive() {
    alert('Create new drive functionality');
}

function editDrive(driveId) {
    alert('Edit drive: ' + driveId);
}

function manageStudents(driveId) {
    alert('Manage students for drive: ' + driveId);
}

function viewResults(driveId) {
    alert('View results for drive: ' + driveId);
}

// =============================================
// 7. UTILITY FUNCTIONS
// =============================================

// Message Display
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) {
        console.error('Message container not found');
        return;
    }

    messageContainer.innerHTML = '';

    const colors = {
        error: { bg: '#fee2e2', color: '#dc2626', icon: 'error' },
        success: { bg: '#dcfce7', color: '#16a34a', icon: 'check_circle' },
        info: { bg: '#dbeafe', color: '#1d4ed8', icon: 'info' }
    };

    const style = colors[type] || colors.info;

    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; padding:1rem; border-radius:8px;
                    background:${style.bg}; color:${style.color}; margin:1rem 0;">
            <span class="material-symbols-outlined" style="font-size:1.25rem;">${style.icon}</span>
            <span style="font-weight:500;">${message}</span>
        </div>
    `;

    messageContainer.appendChild(messageDiv);
}

// Validation Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidMobile(mobile) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
}

// Statistics Update
function updateStatistics(newRegistrations) {
    if (!newRegistrations || newRegistrations === 0) return;

    const totalElement = document.querySelector('.stat-item:first-child .stat-number');
    const approvedElement = document.querySelector('.stat-item:nth-child(2) .stat-number');

    if (totalElement && approvedElement) {
        const currentTotal = parseInt(totalElement.textContent) || 0;
        const currentApproved = parseInt(approvedElement.textContent) || 0;

        totalElement.textContent = currentTotal + newRegistrations;
        approvedElement.textContent = currentApproved + newRegistrations;
    }
}

// Tab Switching Functions
function showTab(tabId, button) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    button.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
}

window.switchTab = function(btn, type) {
    document.querySelectorAll('.msg-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = 'white';
        tab.style.color = '#6b7280';
    });
    btn.classList.add('active');
    btn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    btn.style.color = 'white';
}

// Mobile Menu
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if(mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if(mobileMenu.style.display === 'none' || !mobileMenu.style.display) {
                mobileMenu.style.display = 'block';
            } else {
                mobileMenu.style.display = 'none';
            }
        });
    }
});

// Logout Function
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = 'login_page.html';
    }
}

// Form Handlers
function handleFormSubmit(event) {
    event.preventDefault();
    registerStudent();
}

function handleChooseFile() {
    const fileInput = document.getElementById('bulkFileInput');
    if (fileInput) {
        fileInput.click();
    } else {
        showMessage('Error: File input not found', 'error');
    }
}

function handleUploadProcess() {
    handleBulkUpload();
}

function handleDownloadTemplate() {
    downloadTemplate();
}

function initializeBulkUploadTab() {
    setupBulkUpload();
}

// =============================================
// 8. INITIALIZATION
// =============================================

// Initialize bulk upload when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupBulkUpload();
});