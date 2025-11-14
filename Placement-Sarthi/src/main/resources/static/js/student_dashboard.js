// Global variables
let isEditMode = false;
let currentStudentData = null;
let currentEventsTab = 'upcoming';
let allEvents = [];
let studentParticipations = [];

// Initialize the dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard initialized');
    showSection('dashboard');
    loadStudentProfile();
});

// Mobile menu toggle
document.getElementById('mobile-menu-btn').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
});

// Section navigation
function showSection(sectionId) {
    console.log('📱 Switching to section:', sectionId);

    // Hide all sections
    document.querySelectorAll('.page-content').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Update active nav item
    document.querySelectorAll('.navbar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Close mobile menu
    document.getElementById('mobile-menu').style.display = 'none';

    // Set the active nav item
    const navItems = document.querySelectorAll('.navbar-item');
    for (let item of navItems) {
        if (item.textContent.trim().toLowerCase().includes(sectionId)) {
            item.classList.add('active');
            break;
        }
    }

    // Load specific section data
    if (sectionId === 'profile') {
        loadProfileSection();
    } else if (sectionId === 'events') {
        console.log('🎯 Loading events section...');
        initializeEventsSection();
    } else if (sectionId === 'records') {
        loadRecordsSection();
    }
}

// ========== EVENTS SECTION ==========

// Initialize events section
async function initializeEventsSection() {
    console.log('🎯 initializeEventsSection() called');

    // Show loading state immediately
    showEventsLoading();

    try {
        // Load events from API
        await loadEventsFromAPI();

        // Load participations (if available)
        await loadParticipations();

        // Show events for current tab
        showEventsForCurrentTab();

    } catch (error) {
        console.error('❌ Error initializing events:', error);
        showEventsError('Failed to load events');
    }
}

// Load events from API
async function loadEventsFromAPI() {
    console.log('📡 Loading events from API...');

    try {
        const response = await fetch('http://localhost:8081/api/events');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        allEvents = await response.json();
        console.log('✅ Events loaded successfully:', allEvents.length, 'events found');

        if (allEvents.length === 0) {
            console.log('ℹ️ No events found in database');
        }

    } catch (error) {
        console.error('❌ Failed to load events:', error);
        allEvents = [];
        throw error;
    }
}

// Load participations
async function loadParticipations() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            studentParticipations = [];
            return;
        }

        const response = await fetch(`http://localhost:8081/api/participations/student/${currentUser.id}`);
        if (response.ok) {
            studentParticipations = await response.json();
            console.log('✅ Participations loaded:', studentParticipations.length, 'participations found');
        } else {
            studentParticipations = [];
            console.log('ℹ️ No participations found');
        }
    } catch (error) {
        console.log('ℹ️ Could not load participations:', error);
        studentParticipations = [];
    }
}

// Show events for current tab
function showEventsForCurrentTab() {
    console.log('📊 Showing events for tab:', currentEventsTab);

    let filteredEvents = [];

    switch(currentEventsTab) {
        case 'upcoming':
            filteredEvents = filterUpcomingEvents();
            break;
        case 'ongoing':
            filteredEvents = filterOngoingEvents();
            break;
        case 'past':
            filteredEvents = filterPastEvents();
            break;
        default:
            filteredEvents = allEvents;
    }

    console.log('📋 Filtered events:', filteredEvents.length);
    renderEventCards(filteredEvents);
}

// Filter functions
function filterUpcomingEvents() {
    const now = new Date();
    return allEvents.filter(event => {
        const start = new Date(event.registrationStart);
        return start > now;
    });
}

function filterOngoingEvents() {
    const now = new Date();
    return allEvents.filter(event => {
        const start = new Date(event.registrationStart);
        const end = new Date(event.registrationEnd);
        return start <= now && end >= now;
    });
}

function filterPastEvents() {
    const now = new Date();
    return allEvents.filter(event => {
        const end = new Date(event.registrationEnd);
        return end < now;
    });
}

// Render event cards
function renderEventCards(events) {
    const container = document.getElementById('dynamicEventCards');
    if (!container) {
        console.error('❌ Event cards container not found!');
        return;
    }

    console.log('🎨 Rendering', events.length, 'event cards');

    if (events.length === 0) {
        container.innerHTML = createNoEventsMessage();
        return;
    }

    // Clear container
    container.innerHTML = '';

    // Add each event card
    events.forEach(event => {
        const card = createEventCardElement(event);
        container.appendChild(card);
    });
}

// Create event card element
function createEventCardElement(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const isRegistered = isStudentRegistered(event.eventId);
    const canRegister = checkEligibility(event);
    const status = getEventStatus(event);

    card.innerHTML = `
        <div class="event-card-header">
            <div class="event-company-logo">
                ${event.organizingCompany?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div class="event-info">
                <h3>${event.organizingCompany || 'Unknown Company'}</h3>
                <p class="event-role">${event.jobRole || 'Not specified'}</p>
            </div>
            <span class="event-status ${status.class}">${status.text}</span>
        </div>
        <div class="event-details">
            <p class="event-detail"><strong>Event:</strong> ${event.eventName || 'Not specified'}</p>
            <p class="event-detail"><strong>Date:</strong> ${formatEventDate(event.registrationStart)}</p>
            <p class="event-detail"><strong>Mode:</strong> ${event.eventMode || 'Not specified'}</p>
            <p class="event-detail"><strong>Eligibility:</strong> CGPA ≥ ${event.expectedCgpa || 'Not specified'}</p>
            <p class="event-detail"><strong>Package:</strong> ${event.expectedPackage ? '₹' + event.expectedPackage + ' LPA' : 'Not specified'}</p>
            <p class="event-detail"><strong>Departments:</strong> ${getEligibleDepartmentsText(event.eligibleDepartments)}</p>
        </div>
        <div class="event-actions">
            <button class="event-action-btn" onclick="viewEventDetails(${event.eventId})">
                View Details
            </button>
            ${isRegistered ?
                `<button class="event-action-btn registered" onclick="viewParticipationDetails(${event.eventId})">
                    Already Registered
                </button>` :
                `<button class="event-action-btn edit" onclick="registerForEvent(${event.eventId})" ${!canRegister ? 'disabled' : ''}>
                    ${canRegister ? 'Register' : 'Not Eligible'}
                </button>`
            }
        </div>
    `;

    return card;
}

// Helper functions for events
function isStudentRegistered(eventId) {
    return studentParticipations.some(p => p.event?.eventId === eventId);
}

function checkEligibility(event) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser?.studentData) return false;

    const student = currentUser.studentData;

    // Check CGPA
    if (event.expectedCgpa && student.cgpa < event.expectedCgpa) {
        return false;
    }

    // Check department
    if (event.eligibleDepartments) {
        try {
            const depts = JSON.parse(event.eligibleDepartments);
            if (depts.length > 0 && !depts.includes(student.department)) {
                return false;
            }
        } catch (e) {
            console.error('Error parsing departments:', e);
        }
    }

    // Check if already registered
    if (isStudentRegistered(event.eventId)) {
        return false;
    }

    return true;
}

function getEventStatus(event) {
    const now = new Date();
    const start = new Date(event.registrationStart);
    const end = new Date(event.registrationEnd);

    if (start > now) return { class: 'upcoming', text: 'Upcoming' };
    if (start <= now && end >= now) return { class: 'ongoing', text: 'Ongoing' };
    return { class: 'past', text: 'Completed' };
}

function formatEventDate(dateString) {
    if (!dateString) return 'Not specified';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

function getEligibleDepartmentsText(eligibleDepartments) {
    if (!eligibleDepartments) return 'All Departments';
    try {
        const depts = JSON.parse(eligibleDepartments);
        return depts.length > 0 ? depts.join(', ') : 'All Departments';
    } catch (e) {
        return 'All Departments';
    }
}

// UI State functions
function showEventsLoading() {
    const container = document.getElementById('dynamicEventCards');
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b;">
            <span class="material-symbols-outlined" style="font-size: 3rem; display: block; margin-bottom: 1rem; animation: spin 1s linear infinite;">
                refresh
            </span>
            <h3>Loading Events</h3>
            <p>Please wait while we load the latest events...</p>
        </div>
    `;
}

function showEventsError(message) {
    const container = document.getElementById('dynamicEventCards');
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b;">
            <span class="material-symbols-outlined" style="font-size: 3rem; display: block; margin-bottom: 1rem; color: #ef4444;">
                error
            </span>
            <h3>Unable to Load Events</h3>
            <p>${message}</p>
            <button onclick="initializeEventsSection()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Try Again
            </button>
        </div>
    `;
}

function createNoEventsMessage() {
    return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b;">
            <span class="material-symbols-outlined" style="font-size: 3rem; display: block; margin-bottom: 1rem;">
                event_busy
            </span>
            <h3>No ${currentEventsTab} Events</h3>
            <p>There are currently no ${currentEventsTab} events available.</p>
            <button onclick="initializeEventsSection()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Refresh
            </button>
        </div>
    `;
}

// Event tab switching
function switchEventTab(button, tabType) {
    console.log('🔀 Switching to tab:', tabType);

    // Update active tab
    document.querySelectorAll('.event-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    button.classList.add('active');

    // Update current tab and show events
    currentEventsTab = tabType;
    showEventsForCurrentTab();
}

// Event actions
async function registerForEvent(eventId) {
    const event = allEvents.find(e => e.eventId === eventId);
    if (!event) {
        alert('Event not found');
        return;
    }

    if (!checkEligibility(event)) {
        alert('You are not eligible for this event');
        return;
    }

    if (confirm(`Register for ${event.organizingCompany} - ${event.jobRole}?`)) {
        try {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            const response = await fetch('http://localhost:8081/api/participations/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentAdmissionNumber: currentUser.id,
                    eventId: eventId,
                    eventDescription: `Registered for ${event.organizingCompany} - ${event.jobRole}`
                })
            });

            if (response.ok) {
                alert('Successfully registered!');
                await loadParticipations();
                showEventsForCurrentTab();
            } else {
                alert('Registration failed');
            }
        } catch (error) {
            alert('Network error');
        }
    }
}

async function viewEventDetails(eventId) {
    try {
        const response = await fetch(`http://localhost:8081/api/events/${eventId}`);
        if (response.ok) {
            const event = await response.json();
            alert(`Event Details:\n\nCompany: ${event.organizingCompany}\nRole: ${event.jobRole}\nDescription: ${event.eventDescription}`);
        }
    } catch (error) {
        alert('Error loading event details');
    }
}

function viewParticipationDetails(eventId) {
    alert('Participation details would show here');
}

// ========== PROFILE SECTION ==========

// Function to load and display student profile in sidebar
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

// Function to load student profile data for the profile section
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

// Toggle between view and edit modes
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

// Populate edit form with current data
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

// Save profile data
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

// Resume upload functionality
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

// Handle resume upload
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

// Download resume
function downloadResume(resumeUrl) {
    if (resumeUrl) {
        window.open(resumeUrl, '_blank');
    }
}

// Helper functions
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
    updateStudentDetailItem('Student ID', studentData.studentAdmissionNumber || 'Not specified');
    updateStudentDetailItem('Roll Number', studentData.studentUniversityRollNo || 'Not specified');
    updateStudentDetailItem('Current CGPA', studentData.cgpa ? studentData.cgpa.toString() : 'Not specified');
}

function resetForm() {
    document.getElementById('editCurrentPassword').value = '';
    document.getElementById('editNewPassword').value = '';
    document.getElementById('editConfirmPassword').value = '';
}

// Message display functions
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

// Debug function
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

// Logout function
function logoutStudent() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session storage
        sessionStorage.removeItem('currentUser');
        // Redirect to login page
        window.location.href = 'login_page.html';
    }
}

// Global search function
function globalSearch(event) {
    event.preventDefault();
    const query = document.getElementById('globalSearchInput').value;
    alert(`Searching for: ${query}`);
}

// Event search and filter functions
function searchEvents(query) {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterEventsByCompany(company) {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
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

function showEventForm() {
    alert('Please use the "Register" button on individual event cards');
}

// Records Section
async function loadRecordsSection() {
    // Simple implementation for now
    console.log('Loading records section');
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Event Form Management
function showEventForm() {
    alert('Please use the "Register" button on individual event cards to register for events.');
}

// Event Search and Filter
function searchEvents(query) {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterEventsByCompany(company) {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
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

// Event Tab Switching
function switchEventTab(button, tabType) {
    console.log('🔀 Switching to tab:', tabType);

    // Update active tab styling
    document.querySelectorAll('.event-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    button.classList.add('active');

    // Update current tab and show events
    currentEventsTab = tabType;
    showEventsForCurrentTab();
}

// Global search function
function globalSearch(event) {
    event.preventDefault();
    const query = document.getElementById('globalSearchInput').value.trim();

    if (!query) {
        return;
    }

    console.log('🔍 Global search for:', query);

    // Show events section and search there
    showSection('events');

    // Set search query in events search
    const eventSearchInput = document.querySelector('.event-search');
    if (eventSearchInput) {
        eventSearchInput.value = query;
        searchEvents(query);
    }

    // Show message
    alert(`Searching for "${query}" in events...`);
}