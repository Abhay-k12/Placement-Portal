// =============================================
// HELPER: Authenticated fetch wrapper
// Sends session cookie with every request
// =============================================
function apiFetch(url, options = {}) {
    const mergedHeaders = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const defaultOptions = {
        credentials: 'same-origin',
        ...options,
        headers: mergedHeaders
    };

    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    }

    return fetch(url, defaultOptions).then(response => {
        if (response.status === 401) {
            sessionStorage.clear();
            window.location.href = 'login_page.html';
            throw new Error('Session expired. Redirecting to login...');
        }
        return response;
    });
}

// =============================================
// GLOBAL VARIABLES
// =============================================
let isEditMode = false;
let currentStudentData = null;
let currentEventsTab = 'upcoming';
let allEvents = [];
let studentParticipations = [];
let currentRecords = [];

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    const isLoginPage = window.location.pathname.includes('login_page.html') ||
        window.location.pathname.includes('index.html') ||
        window.location.pathname === '/';

    if (isLoginPage) return;

    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login_page.html';
        return;
    }

    const user = JSON.parse(currentUser);
    if (user.role !== 'student') {
        alert('Access denied. Student privileges required.');
        window.location.href = 'login_page.html';
        return;
    }

    showSection('dashboard');
    loadStudentProfile();
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
        });
    }
});

// =============================================
// SECTION NAVIGATION
// =============================================
function showSection(sectionId) {
    document.querySelectorAll('.page-content').forEach(section => {
        section.style.display = 'none';
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    document.querySelectorAll('.navbar-item').forEach(item => {
        item.classList.remove('active');
    });

    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.style.display = 'none';

    const navItems = document.querySelectorAll('.navbar-item');
    for (let item of navItems) {
        if (item.textContent.trim().toLowerCase().includes(sectionId)) {
            item.classList.add('active');
            break;
        }
    }

    if (sectionId === 'profile') {
        loadProfileSection();
    } else if (sectionId === 'events') {
        initializeEventsSection();
    } else if (sectionId === 'records') {
        loadRecordsSection();
    } else if (sectionId === 'resume') {
        loadResumeSection();
    }
}

// =============================================
// EVENTS SECTION
// =============================================

async function initializeEventsSection() {
    showEventsLoading();

    try {
        await loadEventsFromAPI();
        await loadParticipations();
        showEventsForCurrentTab();
    } catch (error) {
        console.error('Error initializing events:', error);
        showEventsError('Failed to load events');
    }
}

async function loadEventsFromAPI() {
    try {
        const response = await apiFetch('/api/events');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        allEvents = await response.json();
    } catch (error) {
        console.error('Failed to load events:', error);
        allEvents = [];
        throw error;
    }
}

async function loadParticipations() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            studentParticipations = [];
            return;
        }

        const response = await apiFetch(`/api/participations/student/${currentUser.id}`);
        if (response.ok) {
            studentParticipations = await response.json();
        } else {
            studentParticipations = [];
        }
    } catch (error) {
        studentParticipations = [];
    }
}

function showEventsForCurrentTab() {
    let filteredEvents = [];

    switch (currentEventsTab) {
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

    renderEventCards(filteredEvents);
}

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

function renderEventCards(events) {
    const container = document.getElementById('dynamicEventCards');
    if (!container) {
        console.error('Event cards container not found!');
        return;
    }

    if (events.length === 0) {
        container.innerHTML = createNoEventsMessage();
        return;
    }

    container.innerHTML = '';

    events.forEach(event => {
        const card = createEventCardElement(event);
        container.appendChild(card);
    });
}

function createEventCardElement(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    const isRegistered = isStudentRegistered(event.eventId);
    const canRegister = checkEligibility(event);
    const status = getEventStatus(event);
    const safeEventId = String(event.eventId).replace(/'/g, "\\'").replace(/"/g, '&quot;');

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
            <button class="event-action-btn" onclick="viewEventDetails('${safeEventId}')">
                View Details
            </button>
            ${isRegistered ?
            `<button class="event-action-btn registered" onclick="viewParticipationDetails('${safeEventId}')">
                    Already Registered
                </button>` :
            `<button class="event-action-btn edit" onclick="registerForEvent('${safeEventId}')" ${!canRegister ? 'disabled' : ''}>
                    ${canRegister ? 'Register' : 'Not Eligible'}
                </button>`
        }
        </div>
    `;

    return card;
}

function isStudentRegistered(eventId) {
    return studentParticipations.some(p => {
        const pEventId = p.eventId || (p.event && p.event.eventId);
        return String(pEventId) === String(eventId);
    });
}

function checkEligibility(event) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser?.studentData) return false;

    const student = currentUser.studentData;

    if (event.expectedCgpa && student.cgpa < event.expectedCgpa) {
        return false;
    }

    if (event.eligibleDepartments) {
        try {
            let depts;
            if (typeof event.eligibleDepartments === 'string') {
                depts = JSON.parse(event.eligibleDepartments);
            } else if (Array.isArray(event.eligibleDepartments)) {
                depts = event.eligibleDepartments;
            } else {
                depts = [];
            }
            if (depts.length > 0 && !depts.includes(student.department)) {
                return false;
            }
        } catch (e) {
            console.error('Error parsing departments:', e);
        }
    }

    if (isStudentRegistered(event.eventId)) {
        return false;
    }

    const now = new Date();
    const regEnd = new Date(event.registrationEnd);
    if (now > regEnd) {
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

function formatEventDate(dateInput) {
    if (!dateInput) return 'Date TBA';

    try {
        let date;

        if (dateInput instanceof Date) {
            date = dateInput;
        } else if (typeof dateInput === 'string') {
            date = new Date(dateInput);
        } else if (typeof dateInput === 'number') {
            date = new Date(dateInput);
        } else {
            date = new Date(String(dateInput));
        }

        if (isNaN(date.getTime())) {
            return 'Date TBA';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Date TBA';
    }
}

function getEligibleDepartmentsText(eligibleDepartments) {
    if (!eligibleDepartments) return 'All Departments';
    try {
        let depts;
        if (typeof eligibleDepartments === 'string') {
            depts = JSON.parse(eligibleDepartments);
        } else if (Array.isArray(eligibleDepartments)) {
            depts = eligibleDepartments;
        } else {
            return 'All Departments';
        }
        return depts.length > 0 ? depts.join(', ') : 'All Departments';
    } catch (e) {
        return 'All Departments';
    }
}

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

function switchEventTab(button, tabType) {
    document.querySelectorAll('.event-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    button.classList.add('active');

    currentEventsTab = tabType;
    showEventsForCurrentTab();
}

async function registerForEvent(eventId) {
    const event = allEvents.find(e => String(e.eventId) === String(eventId));
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
            const response = await apiFetch('/api/participations/register', {
                method: 'POST',
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
                const errorData = await response.json();
                alert(errorData.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error registering for event:', error);
            alert('Network error. Please try again.');
        }
    }
}

async function viewEventDetails(eventId) {
    try {
        const response = await apiFetch(`/api/events/${eventId}`);
        if (response.ok) {
            const event = await response.json();
            alert(`Event Details:\n\nName: ${event.eventName}\nCompany: ${event.organizingCompany}\nRole: ${event.jobRole || 'Not specified'}\nMode: ${event.eventMode || 'Not specified'}\nPackage: ${event.expectedPackage ? '₹' + event.expectedPackage + ' LPA' : 'Not specified'}\n\nDescription: ${event.eventDescription}`);
        }
    } catch (error) {
        console.error('Error loading event details:', error);
        alert('Error loading event details');
    }
}

function viewParticipationDetails(eventId) {
    const participation = studentParticipations.find(p => {
        const pEventId = p.eventId || (p.event && p.event.eventId);
        return String(pEventId) === String(eventId);
    });

    if (participation) {
        alert(`Participation Details:\n\nStatus: ${participation.status || 'REGISTERED'}\nRegistered on: ${formatEventDate(participation.createdAt)}\nDescription: ${participation.eventDescription || 'No description'}`);
    } else {
        alert('Participation details not found');
    }
}

function searchEvents(query) {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query.toLowerCase()) ? 'block' : 'none';
    });
}

function filterEventsByCompany(company) {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        if (company === 'all') {
            card.style.display = 'block';
        } else {
            const companyName = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = companyName.includes(company.toLowerCase()) ? 'block' : 'none';
        }
    });
}

function showEventForm() {
    alert('Please use the "Register" button on individual event cards to register for events.');
}

// =============================================
// PROFILE SECTION
// =============================================

async function loadStudentProfile() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;

    const user = JSON.parse(currentUser);
    if (user.role !== 'student') return;

    try {
        let studentData = await fetchStudentProfile(user.id);

        if (!studentData) {
            studentData = user.studentData;
        } else {
            user.studentData = studentData;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

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

    } catch (error) {
        console.error('Error loading student profile:', error);
        if (user.studentData) {
            loadStoredStudentData(user.studentData);
        }
    }
}

async function fetchStudentProfile(studentAdmissionNumber) {
    try {
        const response = await apiFetch(`/api/students/${studentAdmissionNumber}`);
        if (response.ok) {
            return await response.json();
        }
        console.error('Failed to fetch student profile');
        return null;
    } catch (error) {
        console.error('Error fetching student profile:', error);
        return null;
    }
}

async function loadProfileSection() {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            showMessage('Please login first', 'error');
            return;
        }

        const user = JSON.parse(currentUser);
        if (user.role !== 'student') return;

        const profileFullName = document.getElementById('profileFullName');
        if (profileFullName) profileFullName.textContent = 'Loading...';

        const studentData = await fetchStudentProfile(user.id);
        if (studentData) {
            currentStudentData = studentData;
            updateProfileSection(studentData);
        } else if (user.studentData) {
            currentStudentData = user.studentData;
            updateProfileSection(user.studentData);
        } else {
            console.error('No student data available');
            showMessage('No profile data found', 'error');
        }
    } catch (error) {
        console.error('Error loading profile section:', error);
        showMessage('Error loading profile data', 'error');
    }
}

function updateProfileSection(studentData) {
    if (!studentData) return;

    const fields = {
        'profileFullName': getFullName(studentData) || 'Not specified',
        'profileDob': formatDate(studentData.dateOfBirth) || 'Not specified',
        'profilePhone': studentData.mobileNo || 'Not specified',
        'profileEmail': studentData.emailId || 'Not specified',
        'profileGender': studentData.gender || 'Not specified',
        'profileAddress': studentData.address || 'Not specified',
        'profileStudentId': studentData.studentAdmissionNumber || 'Not specified',
        'profileRollNumber': studentData.studentUniversityRollNo || 'Not specified',
        'profileDepartment': studentData.department || 'Not specified',
        'profileCgpa': studentData.cgpa ? studentData.cgpa.toString() : 'Not specified',
        'profileBatch': studentData.batch || 'Not specified',
        'profileCourse': studentData.course || 'Not specified',
        'profileTenthPercent': studentData.tenthPercentage ? studentData.tenthPercentage + '%' : 'Not specified',
        'profileTwelfthPercent': studentData.twelfthPercentage ? studentData.twelfthPercentage + '%' : 'Not specified',
        'profileBacklogs': studentData.backLogsCount !== null ? studentData.backLogsCount : '0'
    };

    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

function toggleEditMode() {
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

function populateEditForm() {
    if (!currentStudentData) {
        console.error('No student data available');
        showMessage('Error: No student data found. Please refresh the page.', 'error');
        return;
    }

    try {
        // EDITABLE fields (students CAN change these)
        const editableFields = {
            'editPhone': currentStudentData.mobileNo || '',
            'editEmail': currentStudentData.emailId || '',
            'editCollegeEmail': currentStudentData.collegeEmailId || '',
            'editAddress': currentStudentData.address || '',
            'editGender': currentStudentData.gender || ''
        };

        for (const [id, value] of Object.entries(editableFields)) {
            const el = document.getElementById(id);
            if (el) {
                el.value = value;
                el.disabled = false;
            }
        }

        // READ-ONLY fields (students CANNOT change these — display but disable)
        const readOnlyFields = {
            'editFirstName': currentStudentData.studentFirstName || '',
            'editLastName': currentStudentData.studentLastName || '',
            'editDob': currentStudentData.dateOfBirth || '',
            'editStudentId': currentStudentData.studentAdmissionNumber || '',
            'editRollNumber': currentStudentData.studentUniversityRollNo || '',
            'editEnrollmentNo': currentStudentData.studentEnrollmentNo || '',
            'editDepartment': currentStudentData.department || '',
            'editCourse': currentStudentData.course || '',
            'editBatch': currentStudentData.batch || '',
            'editCgpa': currentStudentData.cgpa || '',
            'editTenthPercent': currentStudentData.tenthPercentage || '',
            'editTwelfthPercent': currentStudentData.twelfthPercentage || '',
            'editBacklogs': currentStudentData.backLogsCount || 0
        };

        for (const [id, value] of Object.entries(readOnlyFields)) {
            const el = document.getElementById(id);
            if (el) {
                el.value = value;
                el.disabled = true;
                el.style.backgroundColor = '#f1f5f9';
                el.style.color = '#64748b';
                el.style.cursor = 'not-allowed';
            }
        }

        // Setup department dropdown as read-only display
        const deptEl = document.getElementById('editDepartment');
        if (deptEl && deptEl.tagName === 'SELECT') {
            deptEl.disabled = true;
            deptEl.style.backgroundColor = '#f1f5f9';
            deptEl.style.cursor = 'not-allowed';
        }

    } catch (error) {
        console.error('Error populating form:', error);
        showMessage('Error loading form data. Please try again.', 'error');
    }
}

async function saveProfile() {
    const saveBtn = document.querySelector('.save-profile-btn');
    if (!saveBtn) return;
    const originalText = saveBtn.innerHTML;

    try {
        saveBtn.innerHTML = '<span class="material-symbols-outlined">pending</span> Saving...';
        saveBtn.disabled = true;

        // ONLY send editable fields — prevent students from changing restricted data
        const updateData = {};

        const phone = document.getElementById('editPhone');
        const email = document.getElementById('editEmail');
        const collegeEmail = document.getElementById('editCollegeEmail');
        const address = document.getElementById('editAddress');
        const gender = document.getElementById('editGender');

        if (phone) updateData.mobileNo = phone.value.trim();
        if (email) updateData.emailId = email.value.trim();
        if (collegeEmail) updateData.collegeEmailId = collegeEmail.value.trim();
        if (address) updateData.address = address.value.trim();
        if (gender) updateData.gender = gender.value;

        // Password change (optional)
        const currentPasswordEl = document.getElementById('editCurrentPassword');
        const newPasswordEl = document.getElementById('editNewPassword');
        const confirmPasswordEl = document.getElementById('editConfirmPassword');

        const currentPassword = currentPasswordEl ? currentPasswordEl.value : '';
        const newPassword = newPasswordEl ? newPasswordEl.value : '';
        const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : '';

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
            updateData.currentPassword = currentPassword;
            updateData.newPassword = newPassword;
        }

        // Validation
        if (updateData.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.emailId)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (updateData.mobileNo && !/^[6-9]\d{9}$/.test(updateData.mobileNo)) {
            showMessage('Please enter a valid 10-digit mobile number', 'error');
            return;
        }

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const studentId = currentUser.id;

        const response = await apiFetch(`/api/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const updatedStudent = await response.json();

            currentStudentData = { ...currentStudentData, ...updatedStudent };

            currentUser.studentData = currentStudentData;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

            updateProfileSection(currentStudentData);
            toggleEditMode();
            showMessage('Profile updated successfully!', 'success');

            loadStudentProfile();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Failed to update profile.', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Network error. Please check your connection.', 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}



// =============================================
// RESUME SECTION
// =============================================

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

async function handleResumeUpload(file) {
    const uploadBtn = document.querySelector('.upload-resume-btn');
    if (!uploadBtn) return;
    const originalText = uploadBtn.innerHTML;

    try {
        uploadBtn.innerHTML = '<span class="material-symbols-outlined">pending</span> Uploading...';
        uploadBtn.disabled = true;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('Please upload a PDF or Word document (.pdf, .doc, .docx)', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage('File size should be less than 5MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const studentId = currentUser.id;

        const response = await apiFetch(`/api/students/${studentId}/resume`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            showMessage('Resume uploaded successfully!', 'success');

            if (currentStudentData) {
                currentStudentData.resumeLink = result.resumeLink;
            }
        } else {
            const error = await response.json();
            showMessage(error.message || 'Failed to upload resume. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error uploading resume:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        uploadBtn.innerHTML = originalText;
        uploadBtn.disabled = false;
    }
}

function downloadResume(resumeUrl) {
    if (resumeUrl) {
        window.open(resumeUrl, '_blank');
    }
}

async function loadResumeSection() {
    try {
        await loadCurrentResumeLink();
    } catch (error) {
        console.error('Error loading resume section:', error);
        showResumeMessage('Failed to load resume information', 'error');
    }
}

async function loadCurrentResumeLink() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) return;

        const response = await apiFetch(`/api/students/${currentUser.id}/resume-drive-link`);

        if (response.ok) {
            const data = await response.json();

            const noResume = document.getElementById('noResume');
            const resumeDetails = document.getElementById('resumeDetails');
            const addResumeSection = document.getElementById('addResumeSection');

            if (data.hasResume && data.resumeLink) {
                if (noResume) noResume.style.display = 'none';
                if (resumeDetails) resumeDetails.style.display = 'block';
                if (addResumeSection) addResumeSection.style.display = 'none';

                const resumeLink = data.resumeLink;
                const displayLink = resumeLink.length > 50
                    ? resumeLink.substring(0, 50) + '...'
                    : resumeLink;
                const linkEl = document.getElementById('currentResumeLink');
                if (linkEl) {
                    linkEl.textContent = displayLink;
                    linkEl.title = resumeLink;
                }
            } else {
                if (noResume) noResume.style.display = 'block';
                if (resumeDetails) resumeDetails.style.display = 'none';
                if (addResumeSection) addResumeSection.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading resume link:', error);
    }
}

function showResumeForm() {
    const formSection = document.getElementById('resumeFormSection');
    const addSection = document.getElementById('addResumeSection');
    const linkInput = document.getElementById('resumeDriveLink');

    if (formSection) formSection.style.display = 'block';
    if (addSection) addSection.style.display = 'none';
    if (linkInput) linkInput.value = '';
}

function hideResumeForm() {
    const formSection = document.getElementById('resumeFormSection');
    const addSection = document.getElementById('addResumeSection');

    if (formSection) formSection.style.display = 'none';
    if (addSection) addSection.style.display = 'block';
}

async function saveResumeLink() {
    const driveLinkEl = document.getElementById('resumeDriveLink');
    if (!driveLinkEl) return;

    const driveLink = driveLinkEl.value.trim();

    if (!driveLink) {
        showResumeMessage('Please enter a Google Drive link', 'error');
        return;
    }

    if (!driveLink.includes('drive.google.com') && !driveLink.includes('docs.google.com')) {
        showResumeMessage('Please provide a valid Google Drive link', 'error');
        return;
    }

    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            showResumeMessage('Please login first', 'error');
            return;
        }

        const response = await apiFetch(`/api/students/${currentUser.id}/resume-drive-link`, {
            method: 'POST',
            body: JSON.stringify({ driveLink: driveLink })
        });

        const result = await response.json();

        if (result.success) {
            showResumeMessage('Resume link saved successfully!', 'success');
            hideResumeForm();
            await loadCurrentResumeLink();
        } else {
            showResumeMessage(result.message || 'Failed to save resume link', 'error');
        }
    } catch (error) {
        console.error('Error saving resume link:', error);
        showResumeMessage('Network error. Please try again.', 'error');
    }
}

function viewResume() {
    const resumeLinkElement = document.getElementById('currentResumeLink');
    if (!resumeLinkElement) return;

    const resumeLink = resumeLinkElement.title || resumeLinkElement.textContent;

    if (resumeLink && resumeLink.startsWith('http')) {
        window.open(resumeLink, '_blank');
    } else {
        showResumeMessage('Invalid resume link', 'error');
    }
}

function showResumeMessage(message, type = 'info') {
    const messageDiv = document.getElementById('resumeMessage');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// =============================================
// RECORDS SECTION
// =============================================

async function loadRecordsSection() {
    showRecordsLoading();

    try {
        const participations = await fetchStudentParticipations();

        if (participations.length === 0) {
            showNoRecords();
        } else {
            renderRecordsTable(participations);
            currentRecords = participations;
        }
    } catch (error) {
        console.error('Error loading records:', error);
        showRecordsError('Failed to load your application history');
    }
}

async function fetchStudentParticipations() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    const response = await apiFetch(`/api/participations/student/${currentUser.id}`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

function renderRecordsTable(participations) {
    const tableBody = document.getElementById('recordsTableBody');
    const table = document.getElementById('recordsTable');
    const noRecords = document.getElementById('noRecords');

    if (!tableBody || !table) return;

    tableBody.innerHTML = '';

    participations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    participations.forEach(participation => {
        const row = createRecordRow(participation);
        tableBody.appendChild(row);
    });

    table.style.display = 'table';
    if (noRecords) noRecords.style.display = 'none';
    hideRecordsLoading();
}

function createRecordRow(participation) {
    const row = document.createElement('tr');

    let eventData = participation.event || participation.eventDto || {};
    if (!eventData.organizingCompany && participation.organizingCompany) {
        eventData = participation;
    }

    const status = participation.participationStatus || participation.status || 'REGISTERED';
    const createdAt = new Date(participation.createdAt);
    const eventDate = eventData.registrationStart ? new Date(eventData.registrationStart) : null;

    const companyName = eventData.organizingCompany || participation.organizingCompany || eventData.companyName || 'Unknown Company';
    const jobRole = eventData.jobRole || participation.jobRole || eventData.role || 'Not specified';
    const eventDescription = participation.eventDescription || eventData.eventDescription || getDefaultRemarks(status);

    row.innerHTML = `
        <td class="company-cell">
            <div class="company-info">
                <div class="company-logo">${companyName.charAt(0).toUpperCase()}</div>
                <div class="company-details">
                    <div class="company-name">${companyName}</div>
                    <div class="job-role">${jobRole}</div>
                </div>
            </div>
        </td>
        <td class="date-cell">${eventDate ? formatTableDate(eventDate) : 'TBA'}</td>
        <td class="date-cell">${formatTableDate(createdAt)}</td>
        <td class="status-cell">
            <span class="status-badge status-${status.toLowerCase()}">${formatStatus(status)}</span>
        </td>
        <td class="remarks-cell">${eventDescription}</td>
    `;

    return row;
}

function formatTableDate(dateInput) {
    if (!dateInput) return 'TBA';

    try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'TBA';

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'Short',
            day: 'numeric'
        });
    } catch (error) {
        return 'TBA';
    }
}

function formatStatus(status) {
    const statusMap = {
        'REGISTERED': 'Registered',
        'SELECTED': 'Selected',
        'ATTEMPTED': 'Attempted',
        'COMPLETED': 'Completed',
        'REJECTED': 'Rejected',
        'ABSENT': 'Absent'
    };
    return statusMap[status] || status;
}

function getDefaultRemarks(status) {
    const remarksMap = {
        'REGISTERED': 'Application submitted',
        'SELECTED': 'Congratulations! Offer received',
        'ATTEMPTED': 'Assessment completed',
        'COMPLETED': 'Process completed',
        'REJECTED': 'Application not selected',
        'ABSENT': 'Did not attend'
    };
    return remarksMap[status] || 'No remarks';
}

function searchRecords() {
    const searchTerm = document.getElementById('recordsSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    filterAndDisplayRecords(searchTerm, statusFilter);
}

function filterRecords() {
    const searchTerm = document.getElementById('recordsSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    filterAndDisplayRecords(searchTerm, statusFilter);
}

function filterAndDisplayRecords(searchTerm, statusFilter) {
    if (!currentRecords) return;

    const filtered = currentRecords.filter(participation => {
        const event = participation.event || {};
        const companyName = event.organizingCompany || participation.organizingCompany || '';
        const jobRole = event.jobRole || participation.jobRole || '';

        const matchesSearch = !searchTerm ||
            companyName.toLowerCase().includes(searchTerm) ||
            jobRole.toLowerCase().includes(searchTerm);

        const pStatus = participation.participationStatus || participation.status || '';
        const matchesStatus = statusFilter === 'all' || pStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        showNoRecords();
    } else {
        renderRecordsTable(filtered);
    }
}

function showRecordsLoading() {
    const el = document.getElementById('recordsLoading');
    const err = document.getElementById('recordsError');
    const tbl = document.getElementById('recordsTable');
    const noRec = document.getElementById('noRecords');

    if (el) el.style.display = 'block';
    if (err) err.style.display = 'none';
    if (tbl) tbl.style.display = 'none';
    if (noRec) noRec.style.display = 'none';
}

function hideRecordsLoading() {
    const el = document.getElementById('recordsLoading');
    if (el) el.style.display = 'none';
}

function showRecordsError(message) {
    const el = document.getElementById('recordsLoading');
    const err = document.getElementById('recordsError');
    const tbl = document.getElementById('recordsTable');
    const noRec = document.getElementById('noRecords');
    const msg = document.getElementById('errorMessage');

    if (el) el.style.display = 'none';
    if (err) err.style.display = 'block';
    if (tbl) tbl.style.display = 'none';
    if (noRec) noRec.style.display = 'none';
    if (msg) msg.textContent = message;
}

function showNoRecords() {
    const el = document.getElementById('recordsLoading');
    const err = document.getElementById('recordsError');
    const tbl = document.getElementById('recordsTable');
    const noRec = document.getElementById('noRecords');

    if (el) el.style.display = 'none';
    if (err) err.style.display = 'none';
    if (tbl) tbl.style.display = 'none';
    if (noRec) noRec.style.display = 'block';
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function updateStudentProfileElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

function updateStudentProfileImage(imageUrl) {
    const profileImg = document.querySelector('.profile-img');
    if (profileImg && imageUrl) profileImg.src = imageUrl;
}

function updateStudentDetailItem(label, value) {
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        const labelElement = item.querySelector('.label');
        if (labelElement && labelElement.textContent === label) {
            const valueElement = item.querySelector('.value');
            if (valueElement) valueElement.textContent = value;
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
    const fields = ['editCurrentPassword', 'editNewPassword', 'editConfirmPassword'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

// =============================================
// MESSAGE DISPLAY
// =============================================

function showMessage(message, type = 'info', duration = 5000) {
    const messageDiv = document.getElementById('profileMessage');
    if (!messageDiv) {
        alert(`${type.toUpperCase()}: ${message}`);
        return;
    }

    messageDiv.className = 'message ' + type;

    messageDiv.innerHTML = `
        <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 0.5rem;">
            ${getMessageIcon(type)}
        </span>
        ${message}
    `;

    messageDiv.style.display = 'block';
    messageDiv.style.animation = 'slideIn 0.3s ease-out';

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
    if (!messageDiv) return;

    messageDiv.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 300);
}

// =============================================
// LOGOUT
// =============================================

function logoutStudent() {
    if (confirm('Are you sure you want to logout?')) {
        apiFetch('/api/logout', { method: 'POST' })
            .then(() => {
                sessionStorage.clear();
                window.location.href = 'login_page.html';
            })
            .catch(() => {
                sessionStorage.clear();
                window.location.href = 'login_page.html';
            });
    }
}

// =============================================
// GLOBAL SEARCH
// =============================================

function globalSearch(event) {
    if (event) event.preventDefault();
    const searchInput = document.getElementById('globalSearchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim();
    if (!query) return;

    showSection('events');

    const eventSearchInput = document.querySelector('.event-search');
    if (eventSearchInput) {
        eventSearchInput.value = query;
        searchEvents(query);
    }
}

// =============================================
// DEBUG
// =============================================

function checkDataLoading() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        console.log('User data:', user);
        console.log('Student data:', user.studentData);
        console.log('Current student data:', currentStudentData);
    }
}

// =============================================
// CSS ANIMATIONS & STYLES
// =============================================

(function () {
    if (!document.querySelector('#student-dashboard-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'student-dashboard-styles';
        styleElement.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes slideIn {
                from { transform: translateY(-10px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-10px); opacity: 0; }
            }

            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.875rem;
                font-weight: 500;
                text-transform: capitalize;
            }

            .status-registered { background-color: #dbeafe; color: #1e40af; }
            .status-selected { background-color: #dcfce7; color: #166534; }
            .status-attempted { background-color: #fef3c7; color: #92400e; }
            .status-completed { background-color: #dcfce7; color: #166534; }
            .status-rejected { background-color: #fee2e2; color: #991b1b; }
            .status-absent { background-color: #f3f4f6; color: #374151; }

            .records-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 3rem;
                color: #64748b;
            }

            .records-loading .spin {
                animation: spin 1s linear infinite;
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .records-error {
                text-align: center;
                padding: 2rem;
                color: #ef4444;
            }

            .records-error .material-symbols-outlined {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .retry-btn {
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
            }

            .no-records {
                text-align: center;
                padding: 3rem;
                color: #64748b;
            }

            .no-records .material-symbols-outlined {
                font-size: 4rem;
                margin-bottom: 1rem;
                opacity: 0.5;
            }

            .browse-events-btn {
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background: #10b981;
                color: white;
                border: none;
                border-radius: 0.5rem;
                cursor: pointer;
            }

            .message {
                padding: 1rem;
                border-radius: 8px;
                margin: 1rem 0;
                display: none;
            }

            .message.success { background: #dcfce7; color: #166534; }
            .message.error { background: #fee2e2; color: #991b1b; }
            .message.info { background: #dbeafe; color: #1e40af; }
        `;
        document.head.appendChild(styleElement);
    }
})();