        // Mobile menu toggle
        document.getElementById('mobile-menu-btn').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
        });

        // Section navigation
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.page-content').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected section
            document.getElementById(sectionId).style.display = 'block';
            
            // Update active nav item
            document.querySelectorAll('.navbar-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Close mobile menu
            document.getElementById('mobile-menu').style.display = 'none';
            
            // Set the active nav item based on the section
            const navItems = document.querySelectorAll('.navbar-item');
            for (let item of navItems) {
                if (item.textContent.trim().toLowerCase().includes(sectionId)) {
                    item.classList.add('active');
                    break;
                }
            }
        }

        // Event tab switching
        function switchEventTab(button, tabName) {
            // Update active tab
            document.querySelectorAll('.event-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            button.classList.add('active');
            
            // In a real implementation, you would filter events based on the selected tab
            console.log(`Switched to ${tabName} events tab`);
        }

        // Global search function
        function globalSearch(event) {
            event.preventDefault();
            const query = document.getElementById('globalSearchInput').value;
            alert(`Searching for: ${query}`);
            // In a real implementation, you would perform a global search
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            // Set the dashboard as active by default
            showSection('dashboard');
        });



// Function to load and display student profile
async function loadStudentProfile() {
    const currentUser = sessionStorage.getItem('currentUser');

    if (!currentUser) {
        console.log('No user logged in');
        return;
    }

    const user = JSON.parse(currentUser);

    // Check if user is student
    if (user.role !== 'student') {
        console.log('User is not a student');
        return;
    }

    try {
        // Try to fetch fresh data from backend first
        let studentData = await fetchStudentProfile(user.id);

        // If backend fetch fails, use stored data
        if (!studentData) {
            studentData = user.studentData;
            console.log('Using stored student data');
        } else {
            // Update session storage with fresh data
            user.studentData = studentData;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

        console.log('Loading student profile:', studentData);

        // Update profile information in sidebar
        updateStudentProfileElement('.admin-name', studentData.studentFirstName || 'Student');
        updateStudentProfileElement('.college-name', 'Graphic Era Hill University');
        updateStudentProfileElement('.admin-role', 'Student');

        // Update profile image if available
        if (studentData.photographLink) {
            updateStudentProfileImage(studentData.photographLink);
        }

        // Update personal information in sidebar
        updateStudentDetailItem('Full Name', getFullName(studentData) || 'Not specified');
        updateStudentDetailItem('Date of Birth', formatDate(studentData.dateOfBirth) || 'Not specified');
        updateStudentDetailItem('Department', studentData.department || 'Not specified');

        // Update contact information in sidebar
        updateStudentDetailItem('Email Address', studentData.emailId || 'Not specified');
        updateStudentDetailItem('Contact Number', studentData.mobileNo || 'Not specified');
        updateStudentDetailItem('College', 'Graphic Era Hill University, Dehradun');
        updateStudentDetailItem('City', 'Dehradun'); // You might want to add city field to student entity

        // Update academic information
        updateStudentDetailItem('Student ID', studentData.studentAdmissionNumber || 'Not specified');
        updateStudentDetailItem('Roll Number', studentData.studentUniversityRollNo || 'Not specified');
        updateStudentDetailItem('Current CGPA', studentData.cgpa ? studentData.cgpa.toString() : 'Not specified');

    } catch (error) {
        console.error('Error loading student profile:', error);
        // Fallback to stored data
        if (user.studentData) {
            loadStoredStudentData(user.studentData);
        }
    }
}

// Function to fetch student profile data from backend
async function fetchStudentProfile(studentAdmissionNumber) {
    try {
        const response = await fetch(`http://localhost:8081/api/students/${studentAdmissionNumber}`);
        if (response.ok) {
            const studentData = await response.json();
            return studentData;
        } else {
            console.error('Failed to fetch student profile');
            return null;
        }
    } catch (error) {
        console.error('Error fetching student profile:', error);
        return null;
    }
}

// Helper functions for updating student profile
function updateStudentProfileElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

function updateStudentProfileImage(imageUrl) {
    const profileImg = document.querySelector('.profile-img');
    if (profileImg && imageUrl) {
        profileImg.src = imageUrl;
    }
}

function updateStudentDetailItem(label, value) {
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

function getFullName(studentData) {
    const firstName = studentData.studentFirstName || '';
    const lastName = studentData.studentLastName || '';
    return `${firstName} ${lastName}`.trim();
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Fallback function to load stored student data
function loadStoredStudentData(studentData) {
    updateStudentProfileElement('.admin-name', studentData.studentFirstName || 'Student');
    updateStudentProfileElement('.college-name', 'Graphic Era Hill University');
    updateStudentProfileElement('.admin-role', 'Student');

    if (studentData.photographLink) {
        updateStudentProfileImage(studentData.photographLink);
    }

    updateStudentDetailItem('Full Name', getFullName(studentData) || 'Not specified');
    updateStudentDetailItem('Date of Birth', formatDate(studentData.dateOfBirth) || 'Not specified');
    updateStudentDetailItem('Department', studentData.department || 'Not specified');
    updateStudentDetailItem('Email Address', studentData.emailId || 'Not specified');
    updateStudentDetailItem('Contact Number', studentData.mobileNo || 'Not specified');
    updateStudentDetailItem('College', 'Graphic Era Hill University, Dehradun');
    updateStudentDetailItem('City', 'Dehradun');
    updateStudentDetailItem('Student ID', studentData.studentAdmissionNumber || 'Not specified');
    updateStudentDetailItem('Roll Number', studentData.studentUniversityRollNo || 'Not specified');
    updateStudentDetailItem('Current CGPA', studentData.cgpa ? studentData.cgpa.toString() : 'Not specified');
}

function logoutStudent() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session storage
        sessionStorage.removeItem('currentUser');
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

let isEditMode = false;
let currentStudentData = null;

// Function to load student profile data for the profile section
async function loadProfileSection() {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            console.log('No user logged in');
            return;
        }

        const user = JSON.parse(currentUser);
        if (user.role !== 'student') {
            console.log('User is not a student');
            return;
        }

        // Fetch fresh data from backend
        const studentData = await fetchStudentProfile(user.id);
        if (studentData) {
            currentStudentData = studentData;
            updateProfileSection(studentData);
            updateResumeSection(studentData);
        } else {
            // Fallback to stored data
            if (user.studentData) {
                currentStudentData = user.studentData;
                updateProfileSection(user.studentData);
                updateResumeSection(user.studentData);
            }
        }
    } catch (error) {
        console.error('Error loading profile section:', error);
        showMessage('Error loading profile data', 'error');
    }
}


// Function to update the profile view with actual data
function updateProfileSection(studentData) {
    if (!studentData) return;

    // Personal Information
    document.getElementById('profileFullName').textContent = getFullName(studentData) || 'Not specified';
    document.getElementById('profileDob').textContent = formatDate(studentData.dateOfBirth) || 'Not specified';
    document.getElementById('profilePhone').textContent = studentData.mobileNo || 'Not specified';
    document.getElementById('profileEmail').textContent = studentData.emailId || 'Not specified';
    document.getElementById('profileGender').textContent = studentData.gender || 'Not specified';
    document.getElementById('profileAddress').textContent = studentData.address || 'Not specified';

    // Academic Information
    document.getElementById('profileStudentId').textContent = studentData.studentAdmissionNumber || 'Not specified';
    document.getElementById('profileRollNumber').textContent = studentData.studentUniversityRollNo || 'Not specified';
    document.getElementById('profileDepartment').textContent = studentData.department || 'Not specified';
    document.getElementById('profileCgpa').textContent = studentData.cgpa ? studentData.cgpa.toString() : 'Not specified';
    document.getElementById('profileBatch').textContent = studentData.batch || 'Not specified';
    document.getElementById('profileCourse').textContent = studentData.course || 'Not specified';

    // Academic Performance
    document.getElementById('profileTenthPercent').textContent = studentData.tenthPercentage ?
        studentData.tenthPercentage + '%' : 'Not specified';
    document.getElementById('profileTwelfthPercent').textContent = studentData.twelfthPercentage ?
        studentData.twelfthPercentage + '%' : 'Not specified';
    document.getElementById('profileBacklogs').textContent = studentData.backLogsCount !== null ?
        studentData.backLogsCount : '0';
}

// Function to update resume section
function updateResumeSection(studentData) {
    const resumeFileName = document.getElementById('resumeFileName');
    const resumeStatus = document.getElementById('resumeStatus');
    const downloadBtn = document.getElementById('downloadResumeBtn');

    if (studentData.resumeLink) {
        // Extract filename from URL
        const fileName = studentData.resumeLink.split('/').pop() || 'Resume.pdf';
        resumeFileName.textContent = fileName;
        resumeStatus.textContent = 'Uploaded';
        resumeStatus.style.color = '#27ae60';
        downloadBtn.style.display = 'flex';

        // Add download functionality
        downloadBtn.onclick = () => downloadResume(studentData.resumeLink);
    } else {
        resumeFileName.textContent = 'No resume uploaded';
        resumeStatus.textContent = 'Not uploaded';
        resumeStatus.style.color = '#e74c3c';
        downloadBtn.style.display = 'none';
    }
}

// Function to download resume
function downloadResume(resumeUrl) {
    if (resumeUrl) {
        window.open(resumeUrl, '_blank');
    }
}

// Function to upload resume
function uploadResume() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleResumeUpload(file);
        }
    };

    input.click();
}

// Enhanced message functions
function showMessage(message, type = 'info', duration = 5000) {
    const messageDiv = document.getElementById('profileMessage');

    // Clear existing classes
    messageDiv.className = 'message';

    // Add type class
    messageDiv.classList.add(type);

    // Set message content
    messageDiv.innerHTML = `
        <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem;">
            ${getMessageIcon(type)}
        </span>
        ${message}
    `;

    messageDiv.style.display = 'block';

    // Add entrance animation
    messageDiv.style.animation = 'slideIn 0.3s ease-out';

    // Auto-hide after duration
    setTimeout(() => {
        hideMessage();
    }, duration);
}

function getMessageIcon(type) {
    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info'
    };
    return icons[type] || 'info';
}

function hideMessage() {
    const messageDiv = document.getElementById('profileMessage');
    messageDiv.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 300);
}

// Add this CSS animation for message hide
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Enhanced saveProfile function with better feedback
async function saveProfile() {
    const saveBtn = document.querySelector('.save-profile-btn');
    const originalText = saveBtn.innerHTML;

    try {
        // Show loading state
        saveBtn.innerHTML = '<span class="material-symbols-outlined">pending</span> Saving...';
        saveBtn.disabled = true;

        const form = document.getElementById('profileEditForm');
        const formData = new FormData(form);
        const updateData = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (value) updateData[key] = value;
        }

        // Password validation
        const currentPassword = updateData.currentPassword;
        const newPassword = updateData.newPassword;
        const confirmPassword = updateData.confirmPassword;

        if (newPassword || confirmPassword) {
            if (!currentPassword) {
                showMessage('Please enter current password to change password', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                showMessage('New passwords do not match', 'error');
                return;
            }
            if (newPassword.length < 6) {
                showMessage('New password must be at least 6 characters long', 'error');
                return;
            }
        }

        // Remove password fields if not changing password
        if (!newPassword) {
            delete updateData.currentPassword;
            delete updateData.newPassword;
            delete updateData.confirmPassword;
        }

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const studentId = currentUser.id;

        const response = await fetch(`http://localhost:8081/api/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const updatedStudent = await response.json();

            // Update current data
            currentStudentData = { ...currentStudentData, ...updatedStudent };

            // Update session storage
            currentUser.studentData = currentStudentData;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update UI
            updateProfileSection(currentStudentData);
            toggleEditMode();
            showMessage('Profile updated successfully! Your changes have been saved.', 'success');

            // Also update the aside bar
            loadStudentProfile();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Failed to update profile. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Enhanced upload resume function
async function handleResumeUpload(file) {
    const uploadBtn = document.querySelector('.upload-resume-btn');
    const originalText = uploadBtn.innerHTML;

    try {
        // Show loading state
        uploadBtn.innerHTML = '<span class="material-symbols-outlined">pending</span> Uploading...';
        uploadBtn.disabled = true;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('Please upload a PDF or Word document (.pdf, .doc, .docx)', 'error');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('File size should be less than 5MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const studentId = currentUser.id;

        const response = await fetch(`http://localhost:8081/api/students/${studentId}/resume`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            showMessage('Resume uploaded successfully!', 'success');

            // Update the resume section
            if (currentStudentData) {
                currentStudentData.resumeLink = result.resumeLink;
                updateResumeSection(currentStudentData);
            }
        } else {
            const error = await response.json();
            showMessage(error.message || 'Failed to upload resume. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error uploading resume:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Reset button state
        uploadBtn.innerHTML = originalText;
        uploadBtn.disabled = false;
    }
}

// Add these missing functions to your student_dashboard.js

// Function to reset form
function resetForm() {
    document.getElementById('editCurrentPassword').value = '';
    document.getElementById('editNewPassword').value = '';
    document.getElementById('editConfirmPassword').value = '';
}

// Debug function to check if data is loading
function debugStudentData() {
    const currentUser = sessionStorage.getItem('currentUser');

    if (currentUser) {
        const user = JSON.parse(currentUser);
    }
}

// Enhanced loadProfileSection with better error handling
async function loadProfileSection() {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            showMessage('Please login first', 'error');
            return;
        }

        const user = JSON.parse(currentUser);
        if (user.role !== 'student') {
            return;
        }

        // Show loading state
        document.getElementById('profileFullName').textContent = 'Loading...';

        // Fetch fresh data from backend
        const studentData = await fetchStudentProfile(user.id);
        if (studentData) {
            currentStudentData = studentData;
            updateProfileSection(studentData);
            updateResumeSection(studentData);
        } else {
            if (user.studentData) {
                currentStudentData = user.studentData;
                updateProfileSection(user.studentData);
                updateResumeSection(user.studentData);
            } else {
                console.error('No student data available');
                showMessage('No profile data found', 'error');
            }
        }
    } catch (error) {
        console.error('Error loading profile section:', error);
        showMessage('Error loading profile data', 'error');
    }
}


// Update the section navigation to load profile data when profile section is shown
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.page-content').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    document.getElementById(sectionId).style.display = 'block';

    // Update active nav item
    document.querySelectorAll('.navbar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Close mobile menu
    document.getElementById('mobile-menu').style.display = 'none';

    // Set the active nav item based on the section
    const navItems = document.querySelectorAll('.navbar-item');
    for (let item of navItems) {
        if (item.textContent.trim().toLowerCase().includes(sectionId)) {
            item.classList.add('active');
            break;
        }
    }

    // Load profile data when profile section is shown
    if (sectionId === 'profile') {
        loadProfileSection();
    }
}


// Enhanced toggleEditMode function
function toggleEditMode() {
    console.log('Toggle Edit Mode called');

    isEditMode = !isEditMode;
    const profileView = document.getElementById('profileView');
    const profileEdit = document.getElementById('profileEdit');

    if (isEditMode) {
        profileView.style.display = 'none';
        profileEdit.style.display = 'block';
        populateEditForm();
    } else {
        profileView.style.display = 'block';
        profileEdit.style.display = 'none';
        resetForm();
    }
}

// Enhanced populateEditForm function
function populateEditForm() {
    console.log('Populating edit form with:', currentStudentData);

    if (!currentStudentData) {
        console.error('No student data available');
        showMessage('Error: No student data found. Please refresh the page.', 'error');
        return;
    }

    try {
        // Personal Information
        document.getElementById('editFirstName').value = currentStudentData.studentFirstName || '';
        document.getElementById('editLastName').value = currentStudentData.studentLastName || '';
        document.getElementById('editDob').value = currentStudentData.dateOfBirth || '';
        document.getElementById('editGender').value = currentStudentData.gender || '';
        document.getElementById('editPhone').value = currentStudentData.mobileNo || '';
        document.getElementById('editEmail').value = currentStudentData.emailId || '';
        document.getElementById('editCollegeEmail').value = currentStudentData.collegeEmailId || '';
        document.getElementById('editAddress').value = currentStudentData.address || '';

        // Academic Information
        document.getElementById('editStudentId').value = currentStudentData.studentAdmissionNumber || '';
        document.getElementById('editRollNumber').value = currentStudentData.studentUniversityRollNo || '';
        document.getElementById('editEnrollmentNo').value = currentStudentData.studentEnrollmentNo || '';
        document.getElementById('editDepartment').value = currentStudentData.department || '';
        document.getElementById('editCourse').value = currentStudentData.course || '';
        document.getElementById('editBatch').value = currentStudentData.batch || '';
        document.getElementById('editCgpa').value = currentStudentData.cgpa || '';

        // Academic Performance
        document.getElementById('editTenthPercent').value = currentStudentData.tenthPercentage || '';
        document.getElementById('editTwelfthPercent').value = currentStudentData.twelfthPercentage || '';
        document.getElementById('editBacklogs').value = currentStudentData.backLogsCount || 0;

        console.log('Form populated successfully');
    } catch (error) {
        console.error('Error populating form:', error);
        showMessage('Error loading form data. Please try again.', 'error');
    }
}

// Add debug function to check data loading
function checkDataLoading() {
    const currentUser = sessionStorage.getItem('currentUser');
    console.log('Current User in session:', currentUser);

    if (currentUser) {
        const user = JSON.parse(currentUser);
        console.log('User data:', user);
        console.log('Student data:', user.studentData);
        console.log('Current student data:', currentStudentData);
    }
}

// Call this in your DOMContentLoaded to debug
document.addEventListener('DOMContentLoaded', function() {
    // Set the dashboard as active by default
    showSection('dashboard');

    // Load student profile for aside bar
    loadStudentProfile();

    // Debug data loading
    setTimeout(checkDataLoading, 1000);
});

