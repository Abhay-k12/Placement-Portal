// Global variables
let currentEvents = [];
let isEditMode = false;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {

    // Load company profile first
    loadCompanyProfile();

    // Setup mobile menu toggle
    setupMobileMenu();

    // Setup page navigation
    setupPageNavigation();

    // Setup event form handlers
    setupEventFormHandlers();

    // Setup global search
    setupGlobalSearch();

    // Show dashboard by default
    showPage('dashboard');
}

// Setup mobile menu toggle
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const currentDisplay = mobileMenu.style.display;
            mobileMenu.style.display = currentDisplay === 'block' ? 'none' : 'block';
        });
    } else {
        console.warn('Mobile menu elements not found');
    }
}

// Setup page navigation
function setupPageNavigation() {
    // Add click listeners to all navbar items
    const navItems = document.querySelectorAll('.navbar-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = getPageIdFromNavItem(this.textContent);
            if (pageId) {
                showPage(pageId);
            }
        });
    });
}

// Get page ID from navigation item text
function getPageIdFromNavItem(navText) {
    const text = navText.trim().toLowerCase();
    if (text.includes('dashboard')) return 'dashboard';
    if (text.includes('recruitment')) return 'recruitment';
    if (text.includes('profile')) return 'profile';
    if (text.includes('student') || text.includes('filter')) return 'studentFilter';
    if (text.includes('bulk') || text.includes('upload')) return 'bulkOperations';
    return 'dashboard'; // default fallback
}

// SINGLE Page navigation function
function showPage(pageId) {
    console.log('Showing page:', pageId);

    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
    } else {
        console.error('Page not found:', pageId);
        // Fallback to dashboard if page doesn't exist
        const dashboard = document.getElementById('dashboard');
        if (dashboard) dashboard.style.display = 'block';
    }

    // Update active nav item
    document.querySelectorAll('.navbar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.style.display = 'none';
    }

    // Set active nav item
    const activeNavItem = findNavItemForPage(pageId);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Initialize specific page functionality
    if (pageId === 'recruitment') {
        initializeRecruitmentPage();
    } else if (pageId === 'studentFilter') {
        initializeStudentFilterPage();
    }
}

// Find navigation item for a page
function findNavItemForPage(pageId) {
    const navItems = document.querySelectorAll('.navbar-item');
    for (let item of navItems) {
        const itemText = item.textContent.trim().toLowerCase();
        const pageText = pageId.toLowerCase();

        if (pageId === 'dashboard' && itemText.includes('dashboard')) {
            return item;
        }
        if (pageId === 'recruitment' && itemText.includes('recruitment')) {
            return item;
        }
        if (pageId === 'profile' && itemText.includes('profile')) {
            return item;
        }
        if (pageId === 'studentFilter' && (itemText.includes('student') || itemText.includes('filter'))) {
            return item;
        }
        if (pageId === 'bulkOperations' && (itemText.includes('bulk') || itemText.includes('upload'))) {
            return item;
        }
    }
    return null;
}

// Setup event form handlers
function setupEventFormHandlers() {
    const createRecruitmentBtn = document.getElementById('createRecruitment');
    if (createRecruitmentBtn) {
        createRecruitmentBtn.addEventListener('click', showEventForm);
    } else {
        console.warn('Create recruitment button not found');
    }

    // Also setup the cancel button if it exists
    const cancelEventBtn = document.getElementById('cancelEvent');
    if (cancelEventBtn) {
        cancelEventBtn.addEventListener('click', closeEventForm);
    }
}

// Setup global search
function setupGlobalSearch() {
    const globalSearchForm = document.querySelector('.search-form');
    if (globalSearchForm) {
        globalSearchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchInput = document.getElementById('globalSearchInput');
            if (searchInput) {
                const query = searchInput.value;
                alert(`Searching for: ${query}`);
            }
        });
    }
}

// Global search function
function globalSearch(event) {
    event.preventDefault();
    const query = document.getElementById('globalSearchInput').value;
    alert(`Searching for: ${query}`);
}

// Logout function
function logoutCompany() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login_page.html';
    }
}

// Function to load and display company profile
async function loadCompanyProfile() {
    const currentUser = sessionStorage.getItem('currentUser');

    if (!currentUser) {
        return;
    }

    const user = JSON.parse(currentUser);

    // Check if user is company
    if (user.role !== 'company') {
        console.log('User is not a company');
        return;
    }

    try {
        // Try to fetch fresh data from backend first
        let companyData = await fetchCompanyProfile(user.id);

        // If backend fetch fails, use stored data
        if (!companyData) {
            companyData = user.companyData;
        } else {
            // Update session storage with fresh data
            user.companyData = companyData;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

        // Update profile information in sidebar
        updateCompanyProfileElement('.admin-name', companyData.hrName || 'HR Manager');
        updateCompanyProfileElement('.college-name', companyData.companyName || 'Company');
        updateCompanyProfileElement('.admin-role', 'HR Manager');

        // Update profile image if available
        if (companyData.photoLink) {
            updateCompanyProfileImage(companyData.photoLink);
        }

        // Update contact information in sidebar
        updateCompanyDetailItem('Email Address', companyData.hrEmail || 'Not specified');
        updateCompanyDetailItem('Phone Number', companyData.hrPhone || 'Not specified');
        updateCompanyDetailItem('Location', companyData.location || 'Not specified');

    } catch (error) {
        console.error('Error loading company profile:', error);
        // Fallback to stored data
        if (user.companyData) {
            loadStoredCompanyData(user.companyData);
        }
    }
}

// Function to fetch company profile data from backend
async function fetchCompanyProfile(companyId) {
    try {
        const response = await fetch(`http://localhost:8081/api/companies/${companyId}`);
        if (response.ok) {
            const companyData = await response.json();
            return companyData;
        } else {
            console.error('Failed to fetch company profile');
            return null;
        }
    } catch (error) {
        console.error('Error fetching company profile:', error);
        return null;
    }
}

// Helper functions for updating company profile
function updateCompanyProfileElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

function updateCompanyProfileImage(imageUrl) {
    const profileImg = document.querySelector('.profile-img');
    if (profileImg && imageUrl) {
        profileImg.src = imageUrl;
    }
}

function updateCompanyDetailItem(label, value) {
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

// Fallback function to load stored company data
function loadStoredCompanyData(companyData) {
    updateCompanyProfileElement('.admin-name', companyData.hrName || 'HR Manager');
    updateCompanyProfileElement('.college-name', companyData.companyName || 'Company');
    updateCompanyProfileElement('.admin-role', 'HR Manager');

    if (companyData.photoLink) {
        updateCompanyProfileImage(companyData.photoLink);
    }

    updateCompanyDetailItem('Email Address', companyData.hrEmail || 'Not specified');
    updateCompanyDetailItem('Phone Number', companyData.hrPhone || 'Not specified');
    updateCompanyDetailItem('Location', companyData.location || 'Not specified');
}

function initializeRecruitmentPage() {
    loadCompanyEvents();
    startEventStatusAutoRefresh();
}

async function loadCompanyEvents() {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            return;
        }

        const user = JSON.parse(currentUser);
        const companyName = user.companyData?.companyName || user.name;

        const response = await fetch(`http://localhost:8081/api/events/company/${encodeURIComponent(companyName)}`);

        if (response.ok) {
            let events = await response.json();

            // Classify events based on current date
            events = events.map(event => {
                return {
                    ...event,
                    status: classifyEventStatus(event)
                };
            });

            currentEvents = events;
            displayEvents(currentEvents);
        } else {
            console.error('Failed to load events. Status:', response.status);
            displayEvents([]);
            showRecruitmentMessage('No events found for your company', 'info');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        displayFallbackEvents();
        showRecruitmentMessage('Error loading events. Using demo data.', 'info');
    }
}

// Function to classify event status based on dates
function classifyEventStatus(event) {
    const now = new Date();
    const registrationStart = new Date(event.registrationStart);
    const registrationEnd = new Date(event.registrationEnd);

    // If event is cancelled, keep it as cancelled
    if (event.status === 'CANCELLED') {
        return 'CANCELLED';
    }

    // If registration hasn't started yet
    if (now < registrationStart) {
        return 'UPCOMING';
    }

    // If registration is ongoing (current time is between start and end)
    if (now >= registrationStart && now <= registrationEnd) {
        return 'ONGOING';
    }

    // If registration has ended
    if (now > registrationEnd) {
        return 'COMPLETED';
    }

    // Default fallback
    return 'UPCOMING';
}


function displayEvents(events) {
    const recruitmentCards = document.getElementById('recruitmentCards');
    if (!recruitmentCards) return;

    if (!events || events.length === 0) {
        recruitmentCards.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #64748b;">
                <span class="material-symbols-outlined" style="font-size: 4rem; margin-bottom: 1rem;">event</span>
                <h3>No Events Created</h3>
                <p>Create your first recruitment event to get started.</p>
            </div>
        `;
        return;
    }

    recruitmentCards.innerHTML = events.map(event => `
        <div class="event-card" data-event-id="${event.eventId}">
            <div class="event-card-header">
                <div class="event-company-logo">
                    ${getCompanyInitials(event.organizingCompany)}
                </div>
                <div class="event-info">
                    <h3>${event.eventName}</h3>
                    <p class="event-role">${event.jobRole || 'Various Roles'}</p>
                </div>
                <span class="event-status ${getStatusClass(event.status)}">${event.status}</span>
            </div>
            <div class="event-details">
                <p class="event-detail"><strong>Registration:</strong> ${formatDateTime(event.registrationStart)} - ${formatDateTime(event.registrationEnd)}</p>
                <p class="event-detail"><strong>Mode:</strong> ${event.eventMode}</p>
                <p class="event-detail"><strong>CGPA Required:</strong> ${event.expectedCgpa ? event.expectedCgpa + '+' : 'Not specified'}</p>
                <p class="event-detail"><strong>Package:</strong> ${event.expectedPackage ? '₹' + event.expectedPackage + ' LPA' : 'Not specified'}</p>
                <p class="event-detail"><strong>Departments:</strong> ${getEligibleDepartmentsDisplay(event.eligibleDepartments)}</p>
                <p class="event-detail"><strong>Status:</strong> ${getStatusDescription(event.status)}</p>
            </div>
            <div class="event-actions">
                <button class="event-action-btn" onclick="viewEventDetails(${event.eventId})">View Details</button>
                <button class="event-action-btn edit" onclick="editEvent(${event.eventId})">Edit</button>
                <button class="event-action-btn delete" onclick="deleteEvent(${event.eventId})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Helper function to get status description
function getStatusDescription(status) {
    const statusDescriptions = {
        'UPCOMING': 'Registration will start soon',
        'ONGOING': 'Registration is currently open',
        'COMPLETED': 'Registration has ended',
        'CANCELLED': 'Event has been cancelled'
    };
    return statusDescriptions[status] || 'Status not specified';
}

function getStatusClass(status) {
    const statusClasses = {
        'UPCOMING': 'upcoming',
        'ONGOING': 'ongoing',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled'
    };
    return statusClasses[status] || 'upcoming';
}

// Display fallback events
function displayFallbackEvents() {
    const recruitmentCards = document.getElementById('recruitmentCards');
    if (!recruitmentCards) return;

    recruitmentCards.innerHTML = `
        <div class="event-card">
            <div class="event-card-header">
                <div class="event-company-logo">
                    CO
                </div>
                <div class="event-info">
                    <h3>Sample Recruitment Drive</h3>
                    <p class="event-role">Software Engineer</p>
                </div>
                <span class="event-status upcoming">UPCOMING</span>
            </div>
            <div class="event-details">
                <p class="event-detail"><strong>Registration:</strong> Jan 15, 2024 - Jan 30, 2024</p>
                <p class="event-detail"><strong>Mode:</strong> ONLINE</p>
                <p class="event-detail"><strong>CGPA Required:</strong> 7.5+</p>
                <p class="event-detail"><strong>Package:</strong> ₹12 LPA</p>
                <p class="event-detail"><strong>Departments:</strong> Computer Science, Electronics</p>
            </div>
            <div class="event-actions">
                <button class="event-action-btn" onclick="viewEventDetails(1)">View Details</button>
                <button class="event-action-btn edit" onclick="editEvent(1)">Edit</button>
                <button class="event-action-btn delete" onclick="deleteEvent(1)">Delete</button>
            </div>
        </div>
    `;
}

// Show event creation form
function showEventForm() {
    const eventForm = document.getElementById('event-creation-form');
    const createBtn = document.getElementById('createRecruitment');

    if (!eventForm || !createBtn) {
        console.error('Event form elements not found');
        return;
    }

    eventForm.style.display = 'block';
    createBtn.style.display = 'none';

    // Auto-fill company name
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const companyName = user.companyData?.companyName || user.name;
        const companyInput = document.getElementById('organizingCompany');
        if (companyInput) {
            companyInput.value = companyName;
        }
    }

    // Set minimum dates
    const now = new Date();
    const minDate = now.toISOString().slice(0, 16);
    const startInput = document.getElementById('registrationStart');
    const endInput = document.getElementById('registrationEnd');

    if (startInput) startInput.min = minDate;
    if (endInput) endInput.min = minDate;
}

// Close event form
function closeEventForm() {
    const eventForm = document.getElementById('event-creation-form');
    const createBtn = document.getElementById('createRecruitment');

    if (!eventForm || !createBtn) {
        console.error('Event form elements not found');
        return;
    }

    eventForm.style.display = 'none';
    createBtn.style.display = 'flex';
    resetEventForm();
}

// Reset event form
function resetEventForm() {
    const form = document.getElementById('addEventForm');
    if (form) form.reset();

    const checkboxes = document.querySelectorAll('input[name="eligibleDepartments"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
}

// Submit event form - USING EXISTING /create ENDPOINT
async function submitEventForm() {
    try {
        const formData = getEventFormData();

        if (!validateEventForm(formData)) {
            return;
        }

        const response = await fetch('http://localhost:8081/api/events/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });


        if (response.ok) {
            const newEvent = await response.json();
            showRecruitmentMessage('Event created successfully!', 'success');
            closeEventForm();
            loadCompanyEvents();
        } else {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            showRecruitmentMessage('Failed to create event. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showRecruitmentMessage('Network error. Please try again.', 'error');
    }
}

// Update the getEventFormData function
function getEventFormData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const companyName = currentUser.companyData?.companyName || currentUser.name;

    // Get selected departments
    const selectedDepartments = Array.from(document.querySelectorAll('input[name="eligibleDepartments"]:checked'))
        .map(checkbox => checkbox.value);

    const registrationStart = document.getElementById('registrationStart')?.value;
    const registrationEnd = document.getElementById('registrationEnd')?.value;

    // Determine initial status based on dates
    let status = 'UPCOMING';
    if (registrationStart && registrationEnd) {
        const now = new Date();
        const startDate = new Date(registrationStart);
        const endDate = new Date(registrationEnd);

        if (now >= startDate && now <= endDate) {
            status = 'ONGOING';
        } else if (now > endDate) {
            status = 'COMPLETED';
        }
    }

    return {
        eventName: document.getElementById('eventName')?.value || '',
        organizingCompany: companyName,
        expectedCgpa: parseFloat(document.getElementById('expectedCgpa')?.value) || 0,
        jobRole: document.getElementById('jobRole')?.value || '',
        registrationStart: registrationStart || '',
        registrationEnd: registrationEnd || '',
        eventMode: document.getElementById('eventMode')?.value || 'ONLINE',
        expectedPackage: parseFloat(document.getElementById('expectedPackage')?.value) || null,
        eventDescription: document.getElementById('eventDescription')?.value || '',
        eligibleDepartments: JSON.stringify(selectedDepartments),
        status: status // Auto-determined status
    };
}

// Validate event form
function validateEventForm(formData) {
    if (!formData.eventName.trim()) {
        showRecruitmentMessage('Event name is required', 'error');
        return false;
    }

    if (!formData.registrationStart || !formData.registrationEnd) {
        showRecruitmentMessage('Registration dates are required', 'error');
        return false;
    }

    const startDate = new Date(formData.registrationStart);
    const endDate = new Date(formData.registrationEnd);

    if (endDate <= startDate) {
        showRecruitmentMessage('Registration end date must be after start date', 'error');
        return false;
    }

    if (!formData.eventDescription.trim()) {
        showRecruitmentMessage('Event description is required', 'error');
        return false;
    }

    return true;
}

// View event details
function viewEventDetails(eventId) {
    const event = currentEvents.find(e => e.eventId === eventId);
    if (event) {
        alert(`Event Details:\n\nName: ${event.eventName}\nCompany: ${event.organizingCompany}\nRole: ${event.jobRole}\nDescription: ${event.eventDescription}\nRegistration: ${formatDateTime(event.registrationStart)} to ${formatDateTime(event.registrationEnd)}`);
    } else {
        alert('Event details not available');
    }
}

// Edit event
function editEvent(eventId) {
    const event = currentEvents.find(e => e.eventId === eventId);
    if (event) {
        // Populate form with event data
        document.getElementById('eventName').value = event.eventName;
        document.getElementById('organizingCompany').value = event.organizingCompany;
        document.getElementById('expectedCgpa').value = event.expectedCgpa || '';
        document.getElementById('jobRole').value = event.jobRole || '';
        document.getElementById('registrationStart').value = formatDateTimeForInput(event.registrationStart);
        document.getElementById('registrationEnd').value = formatDateTimeForInput(event.registrationEnd);
        document.getElementById('eventMode').value = event.eventMode;
        document.getElementById('expectedPackage').value = event.expectedPackage || '';
        document.getElementById('eventDescription').value = event.eventDescription;

        // Set departments checkboxes
        const departments = JSON.parse(event.eligibleDepartments || '[]');
        const checkboxes = document.querySelectorAll('input[name="eligibleDepartments"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = departments.includes(checkbox.value);
        });

        showEventForm();

        // Change submit button to update
        const submitBtn = document.querySelector('#event-creation-form button[onclick="submitEventForm()"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Event';
            submitBtn.setAttribute('onclick', `updateEvent(${eventId})`);
        }
    }
}

// Update event - USING EXISTING PUT ENDPOINT
async function updateEvent(eventId) {
    try {
        const formData = getEventFormData();

        if (!validateEventForm(formData)) {
            return;
        }

        const response = await fetch(`http://localhost:8081/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const updatedEvent = await response.json();
            showRecruitmentMessage('Event updated successfully!', 'success');
            closeEventForm();
            loadCompanyEvents();
        } else {
            showRecruitmentMessage('Failed to update event', 'error');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        showRecruitmentMessage('Network error. Please try again.', 'error');
    }
}

// Delete event - USING EXISTING DELETE ENDPOINT
async function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        try {
            const response = await fetch(`http://localhost:8081/api/events/${eventId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showRecruitmentMessage('Event deleted successfully!', 'success');
                loadCompanyEvents();
            } else {
                showRecruitmentMessage('Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            showRecruitmentMessage('Network error. Please try again.', 'error');
        }
    }
}

// Helper functions
function getCompanyInitials(companyName) {
    if (!companyName) return 'CO';
    return companyName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
}

function getStatusClass(status) {
    const statusClasses = {
        'UPCOMING': 'upcoming',
        'ONGOING': 'ongoing',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled'
    };
    return statusClasses[status] || 'upcoming';
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'Not specified';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTimeForInput(dateTimeString) {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16);
}

function getEligibleDepartmentsDisplay(departmentsJson) {
    if (!departmentsJson) return 'All departments';
    try {
        const departments = JSON.parse(departmentsJson);
        return departments.length > 0 ? departments.join(', ') : 'All departments';
    } catch {
        return 'All departments';
    }
}

function showRecruitmentMessage(message, type) {
    let messageDiv = document.getElementById('recruitmentMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'recruitmentMessage';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(messageDiv);
    }

    messageDiv.textContent = message;
    messageDiv.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}


function initializeStudentFilterPage() {
    console.log('🚀 STUDENT FILTER PAGE INITIALIZED');

    // Check if all required elements exist
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const exportResultsBtn = document.getElementById('exportResults');
    const studentsGrid = document.getElementById('studentsGrid');

    console.log('📋 Element check:');
    console.log('- applyFiltersBtn:', applyFiltersBtn);
    console.log('- resetFiltersBtn:', resetFiltersBtn);
    console.log('- exportResultsBtn:', exportResultsBtn);
    console.log('- studentsGrid:', studentsGrid);

    // Load students immediately
    loadAllStudents();
}

// Student Filter Functions - GLOBAL SCOPE
window.applyFilters = async function() {

    try {
        const filters = getCurrentFilters();

        const queryParams = new URLSearchParams();
        if (filters.department) queryParams.append('department', filters.department);
        if (filters.minCgpa) queryParams.append('minCgpa', filters.minCgpa);
        if (filters.maxBacklogs !== null) queryParams.append('maxBacklogs', filters.maxBacklogs);
        if (filters.batch) queryParams.append('batch', filters.batch);

        const url = `http://localhost:8081/api/students/filter?${queryParams}`;

        const response = await fetch(url);

        if (response.ok) {
            const students = await response.json();
            console.log('Students received:', students);
            displayFilteredStudents(students);
            updateResultsSummary(students.length);
            showStudentFilterMessage(`Found ${students.length} students`, 'success');
        } else {
            console.error('Server error:', response.status);
            showStudentFilterMessage('Error applying filters', 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        showStudentFilterMessage('Network error', 'error');
    }
};

window.resetFilters = function() {
    document.getElementById('departmentFilter').value = '';
    document.getElementById('cgpaFilter').value = '';
    document.getElementById('batchFilter').value = '';
    document.getElementById('backlogsFilter').value = '';

    loadAllStudents();
    showStudentFilterMessage('Filters reset', 'success');
};

window.exportFilteredStudents = async function() {

    try {
        const filters = getCurrentFilters();
        const queryParams = new URLSearchParams();

        if (filters.department) queryParams.append('department', filters.department);
        if (filters.minCgpa) queryParams.append('minCgpa', filters.minCgpa);
        if (filters.maxBacklogs !== null) queryParams.append('maxBacklogs', filters.maxBacklogs);
        if (filters.batch) queryParams.append('batch', filters.batch);

        const response = await fetch(`http://localhost:8081/api/students/export/filtered?${queryParams}`);

        if (response.ok) {
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'filtered_students.xlsx';

            // Append to body, click, and remove
            document.body.appendChild(a);
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showStudentFilterMessage('Excel file downloaded successfully!', 'success');
        } else {
            const errorText = await response.text();
            console.error('Export failed:', errorText);
            showStudentFilterMessage('Failed to export students. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error exporting students:', error);
        showStudentFilterMessage('Network error while exporting. Please try again.', 'error');
    }
};

// Helper functions also need to be global
window.getCurrentFilters = function() {
    const department = document.getElementById('departmentFilter').value;
    const cgpaFilter = document.getElementById('cgpaFilter').value;
    const batch = document.getElementById('batchFilter').value;
    const backlogsFilter = document.getElementById('backlogsFilter').value;

    return {
        department: department || null,
        minCgpa: cgpaFilter ? parseFloat(cgpaFilter) : null,
        batch: batch || null,
        maxBacklogs: backlogsFilter !== '' ? parseInt(backlogsFilter) : null
    };
};

window.displayFilteredStudents = function(students) {
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) {
        console.error('studentsGrid element not found');
        return;
    }

    if (!students || students.length === 0) {
        studentsGrid.innerHTML = `
            <div class="no-results">
                <span class="material-symbols-outlined">search_off</span>
                <h3>No Students Found</h3>
                <p>Try adjusting your filters to see more results.</p>
            </div>
        `;
        return;
    }

    studentsGrid.innerHTML = students.map(student => `
        <div class="student-card">
            <div class="student-header">
                <div class="student-avatar">
                    ${getStudentInitials(student.studentFirstName, student.studentLastName)}
                </div>
                <div class="student-info">
                    <h3>${student.studentFirstName} ${student.studentLastName}</h3>
                    <p class="student-id">${student.studentAdmissionNumber}</p>
                </div>
            </div>
            <div class="student-details">
                <div class="detail-row">
                    <span class="label">Department:</span>
                    <span class="value">${student.department || 'Not specified'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Batch:</span>
                    <span class="value">${student.batch || 'Not specified'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">CGPA:</span>
                    <span class="value ${getCgpaClass(student.cgpa)}">${student.cgpa || 'Not specified'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Backlogs:</span>
                    <span class="value ${getBacklogsClass(student.backLogsCount)}">${student.backLogsCount || 0}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">${student.emailId || 'Not specified'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Mobile:</span>
                    <span class="value">${student.mobileNo || 'Not specified'}</span>
                </div>
                ${student.resumeLink ? `
                <div class="detail-row">
                    <span class="label">Resume:</span>
                    <a href="${student.resumeLink}" target="_blank" class="resume-link">View Resume</a>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
};

window.getStudentInitials = function(firstName, lastName) {
    if (!firstName && !lastName) return 'ST';
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
};

window.getCgpaClass = function(cgpa) {
    if (!cgpa) return '';
    if (cgpa >= 8.5) return 'excellent';
    if (cgpa >= 7.5) return 'good';
    if (cgpa >= 6.5) return 'average';
    return 'low';
};

window.getBacklogsClass = function(backlogs) {
    if (!backlogs) return '';
    if (backlogs === 0) return 'no-backlogs';
    if (backlogs <= 2) return 'few-backlogs';
    return 'many-backlogs';
};

window.updateResultsSummary = function(count) {
    const resultsSummary = document.getElementById('resultsSummary');
    const totalStudents = document.getElementById('totalStudents');

    if (resultsSummary && totalStudents) {
        totalStudents.textContent = count;
        resultsSummary.style.display = 'block';
    }
};

window.loadAllStudents = async function() {
    try {
        const response = await fetch('http://localhost:8081/api/students');
        if (response.ok) {
            const students = await response.json();
            displayFilteredStudents(students);
            updateResultsSummary(students.length);
        } else {
            console.error('Failed to load students');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        displayFallbackStudents();
    }
};

window.displayFallbackStudents = function() {
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) return;

    studentsGrid.innerHTML = `
        <div class="student-card">
            <div class="student-header">
                <div class="student-avatar">
                    JD
                </div>
                <div class="student-info">
                    <h3>John Doe</h3>
                    <p class="student-id">STU001</p>
                </div>
            </div>
            <div class="student-details">
                <div class="detail-row">
                    <span class="label">Department:</span>
                    <span class="value">Computer Science</span>
                </div>
                <div class="detail-row">
                    <span class="label">Batch:</span>
                    <span class="value">2024</span>
                </div>
                <div class="detail-row">
                    <span class="label">CGPA:</span>
                    <span class="value excellent">8.7</span>
                </div>
                <div class="detail-row">
                    <span class="label">Backlogs:</span>
                    <span class="value no-backlogs">0</span>
                </div>
                <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">john.doe@example.com</span>
                </div>
            </div>
        </div>
    `;
};

window.showStudentFilterMessage = function(message, type) {
    let messageDiv = document.getElementById('studentFilterMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'studentFilterMessage';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(messageDiv);
    }

    messageDiv.textContent = message;
    messageDiv.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
};

// Auto-refresh event status every minute
function startEventStatusAutoRefresh() {
    setInterval(() => {
        if (currentEvents.length > 0) {
            currentEvents = currentEvents.map(event => ({
                ...event,
                status: classifyEventStatus(event)
            }));
            displayEvents(currentEvents);
        }
    }, 60000); // Refresh every 60 seconds
}
