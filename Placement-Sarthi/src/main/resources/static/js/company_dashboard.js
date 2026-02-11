// =============================================
// HELPER: Authenticated fetch wrapper
// =============================================
function apiFetch(url, options = {}) {
    const defaultOptions = {
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // Don't set Content-Type for FormData (file uploads)
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
let currentEvents = [];
let isEditMode = false;

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
    if (user.role !== 'company') {
        alert('Access denied. Company privileges required.');
        window.location.href = 'login_page.html';
        return;
    }

    initializeDashboard();
});

function initializeDashboard() {
    loadCompanyProfile();
    setupMobileMenu();
    setupPageNavigation();
    setupEventFormHandlers();
    setupGlobalSearch();
    showPage('dashboard');
}

// =============================================
// MOBILE MENU
// =============================================
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            const currentDisplay = mobileMenu.style.display;
            mobileMenu.style.display = currentDisplay === 'block' ? 'none' : 'block';
        });
    }
}

// =============================================
// PAGE NAVIGATION
// =============================================
function setupPageNavigation() {
    const navItems = document.querySelectorAll('.navbar-item');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const pageId = getPageIdFromNavItem(this.textContent);
            if (pageId) {
                showPage(pageId);
            }
        });
    });
}

function getPageIdFromNavItem(navText) {
    const text = navText.trim().toLowerCase();
    if (text.includes('dashboard')) return 'dashboard';
    if (text.includes('recruitment')) return 'recruitment';
    if (text.includes('profile')) return 'profile';
    if (text.includes('student') || text.includes('filter')) return 'studentFilter';
    if (text.includes('bulk') || text.includes('upload')) return 'bulkOperations';
    return 'dashboard';
}

function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
    } else {
        console.error('Page not found:', pageId);
        const dashboard = document.getElementById('dashboard');
        if (dashboard) dashboard.style.display = 'block';
    }

    document.querySelectorAll('.navbar-item').forEach(item => {
        item.classList.remove('active');
    });

    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.style.display = 'none';

    const activeNavItem = findNavItemForPage(pageId);
    if (activeNavItem) activeNavItem.classList.add('active');

    // Initialize specific page functionality
    if (pageId === 'recruitment') {
        initializeRecruitmentPage();
    } else if (pageId === 'studentFilter') {
        initializeStudentFilterPage();
    } else if (pageId === 'messages') {
        initializeMessagesSection();
    }
}

function findNavItemForPage(pageId) {
    const navItems = document.querySelectorAll('.navbar-item');
    for (let item of navItems) {
        const itemText = item.textContent.trim().toLowerCase();

        if (pageId === 'dashboard' && itemText.includes('dashboard')) return item;
        if (pageId === 'recruitment' && itemText.includes('recruitment')) return item;
        if (pageId === 'profile' && itemText.includes('profile')) return item;
        if (pageId === 'studentFilter' && (itemText.includes('student') || itemText.includes('filter'))) return item;
        if (pageId === 'bulkOperations' && (itemText.includes('bulk') || itemText.includes('upload'))) return item;
    }
    return null;
}

// =============================================
// EVENT FORM HANDLERS
// =============================================
function setupEventFormHandlers() {
    const createRecruitmentBtn = document.getElementById('createRecruitment');
    if (createRecruitmentBtn) {
        createRecruitmentBtn.addEventListener('click', showEventForm);
    }

    const cancelEventBtn = document.getElementById('cancelEvent');
    if (cancelEventBtn) {
        cancelEventBtn.addEventListener('click', closeEventForm);
    }
}

// =============================================
// GLOBAL SEARCH
// =============================================
function setupGlobalSearch() {
    const globalSearchForm = document.querySelector('.search-form');
    if (globalSearchForm) {
        globalSearchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const searchInput = document.getElementById('globalSearchInput');
            if (searchInput) {
                const query = searchInput.value;
                alert(`Searching for: ${query}`);
            }
        });
    }
}

function globalSearch(event) {
    if (event) event.preventDefault();
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        alert(`Searching for: ${searchInput.value}`);
    }
}

// =============================================
// LOGOUT
// =============================================
function logoutCompany() {
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
// COMPANY PROFILE
// =============================================
async function loadCompanyProfile() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;

    const user = JSON.parse(currentUser);
    if (user.role !== 'company') return;

    try {
        let companyData = await fetchCompanyProfile(user.id);

        if (!companyData) {
            companyData = user.companyData;
        } else {
            user.companyData = companyData;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

        updateCompanyProfileElement('.admin-name', companyData.hrName || 'HR Manager');
        updateCompanyProfileElement('.college-name', companyData.companyName || 'Company');
        updateCompanyProfileElement('.admin-role', 'HR Manager');

        if (companyData.photoLink) {
            updateCompanyProfileImage(companyData.photoLink);
        }

        updateCompanyDetailItem('Email Address', companyData.hrEmail || 'Not specified');
        updateCompanyDetailItem('Phone Number', companyData.hrPhone || 'Not specified');
        updateCompanyDetailItem('Location', companyData.location || 'Not specified');

    } catch (error) {
        console.error('Error loading company profile:', error);
        if (user.companyData) {
            loadStoredCompanyData(user.companyData);
        }
    }
}

async function fetchCompanyProfile(companyId) {
    try {
        const response = await apiFetch(`/api/companies/${companyId}`);
        if (response.ok) {
            return await response.json();
        }
        console.error('Failed to fetch company profile');
        return null;
    } catch (error) {
        console.error('Error fetching company profile:', error);
        return null;
    }
}

function updateCompanyProfileElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
}

function updateCompanyProfileImage(imageUrl) {
    const profileImg = document.querySelector('.profile-img');
    if (profileImg && imageUrl) profileImg.src = imageUrl;
}

function updateCompanyDetailItem(label, value) {
    const detailItems = document.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        const labelElement = item.querySelector('.label');
        if (labelElement && labelElement.textContent === label) {
            const valueElement = item.querySelector('.value');
            if (valueElement) valueElement.textContent = value;
        }
    });
}

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

// =============================================
// RECRUITMENT PAGE
// =============================================
function initializeRecruitmentPage() {
    loadCompanyEvents();
    startEventStatusAutoRefresh();
}

async function loadCompanyEvents() {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) return;

        const user = JSON.parse(currentUser);
        const companyName = user.companyData?.companyName || user.name;

        const response = await apiFetch(`/api/events/company/${encodeURIComponent(companyName)}`);

        if (response.ok) {
            let events = await response.json();

            events = events.map(event => ({
                ...event,
                status: classifyEventStatus(event)
            }));

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

function classifyEventStatus(event) {
    const now = new Date();
    const registrationStart = new Date(event.registrationStart);
    const registrationEnd = new Date(event.registrationEnd);

    if (event.status === 'CANCELLED') return 'CANCELLED';
    if (now < registrationStart) return 'UPCOMING';
    if (now >= registrationStart && now <= registrationEnd) return 'ONGOING';
    if (now > registrationEnd) return 'COMPLETED';
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

    recruitmentCards.innerHTML = events.map(event => {
        const safeEventId = String(event.eventId).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `
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
                <button class="event-action-btn" onclick="viewEventDetails('${safeEventId}')">View Details</button>
                <button class="event-action-btn edit" onclick="editEvent('${safeEventId}')">Edit</button>
                <button class="event-action-btn delete" onclick="deleteEvent('${safeEventId}')">Delete</button>
            </div>
        </div>
        `;
    }).join('');
}

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

function displayFallbackEvents() {
    const recruitmentCards = document.getElementById('recruitmentCards');
    if (!recruitmentCards) return;

    recruitmentCards.innerHTML = `
        <div class="event-card">
            <div class="event-card-header">
                <div class="event-company-logo">CO</div>
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

// =============================================
// EVENT FORM (CREATE/EDIT)
// =============================================
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
        if (companyInput) companyInput.value = companyName;
    }

    // Set minimum dates
    const now = new Date();
    const minDate = now.toISOString().slice(0, 16);
    const startInput = document.getElementById('registrationStart');
    const endInput = document.getElementById('registrationEnd');

    if (startInput) startInput.min = minDate;
    if (endInput) endInput.min = minDate;
}

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

    // Reset submit button back to "Create Event"
    const submitBtn = document.querySelector('#event-creation-form button[onclick*="submitEventForm"], #event-creation-form button[onclick*="updateEvent"]');
    if (submitBtn) {
        submitBtn.textContent = 'Create Event';
        submitBtn.setAttribute('onclick', 'submitEventForm()');
    }
}

function resetEventForm() {
    const form = document.getElementById('addEventForm');
    if (form) form.reset();

    const checkboxes = document.querySelectorAll('input[name="eligibleDepartments"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
}

async function submitEventForm() {
    try {
        const formData = getEventFormData();

        if (!validateEventForm(formData)) return;

        const response = await apiFetch('/api/events/create', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        if (response.ok) {
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

function getEventFormData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const companyName = currentUser.companyData?.companyName || currentUser.name;

    const selectedDepartments = Array.from(document.querySelectorAll('input[name="eligibleDepartments"]:checked'))
        .map(checkbox => checkbox.value);

    const registrationStart = document.getElementById('registrationStart')?.value;
    const registrationEnd = document.getElementById('registrationEnd')?.value;

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
        eligibleDepartments: selectedDepartments,  // Array, NOT JSON.stringify
        status: status
    };
}

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

// =============================================
// EVENT ACTIONS
// =============================================
function viewEventDetails(eventId) {
    const event = currentEvents.find(e => String(e.eventId) === String(eventId));
    if (event) {
        alert(`Event Details:\n\nName: ${event.eventName}\nCompany: ${event.organizingCompany}\nRole: ${event.jobRole}\nDescription: ${event.eventDescription}\nRegistration: ${formatDateTime(event.registrationStart)} to ${formatDateTime(event.registrationEnd)}`);
    } else {
        alert('Event details not available');
    }
}

function editEvent(eventId) {
    const event = currentEvents.find(e => String(e.eventId) === String(eventId));
    if (!event) return;

    const fields = {
        'eventName': event.eventName,
        'organizingCompany': event.organizingCompany,
        'expectedCgpa': event.expectedCgpa || '',
        'jobRole': event.jobRole || '',
        'registrationStart': formatDateTimeForInput(event.registrationStart),
        'registrationEnd': formatDateTimeForInput(event.registrationEnd),
        'eventMode': event.eventMode,
        'expectedPackage': event.expectedPackage || '',
        'eventDescription': event.eventDescription
    };

    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }

    // Set departments checkboxes
    let departments = [];
    if (event.eligibleDepartments) {
        try {
            if (typeof event.eligibleDepartments === 'string') {
                departments = JSON.parse(event.eligibleDepartments);
            } else if (Array.isArray(event.eligibleDepartments)) {
                departments = event.eligibleDepartments;
            }
        } catch (e) {
            departments = [];
        }
    }

    const checkboxes = document.querySelectorAll('input[name="eligibleDepartments"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = departments.includes(checkbox.value);
    });

    showEventForm();

    // Change submit button to update
    const submitBtn = document.querySelector('#event-creation-form button[onclick*="submitEventForm"], #event-creation-form button[onclick*="updateEvent"]');
    if (submitBtn) {
        submitBtn.textContent = 'Update Event';
        submitBtn.setAttribute('onclick', `updateEvent('${eventId}')`);
    }
}

async function updateEvent(eventId) {
    try {
        const formData = getEventFormData();
        if (!validateEventForm(formData)) return;

        const response = await apiFetch(`/api/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });

        if (response.ok) {
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

async function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        try {
            const response = await apiFetch(`/api/events/${eventId}`, {
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
    }, 60000);
}

// =============================================
// HELPER FUNCTIONS
// =============================================
function getCompanyInitials(companyName) {
    if (!companyName) return 'CO';
    return companyName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'Not specified';
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return 'Not specified';
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Not specified';
    }
}

function formatDateTimeForInput(dateTimeString) {
    if (!dateTimeString) return '';
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
}

function getEligibleDepartmentsDisplay(departmentsJson) {
    if (!departmentsJson) return 'All departments';
    try {
        let departments;
        if (typeof departmentsJson === 'string') {
            departments = JSON.parse(departmentsJson);
        } else if (Array.isArray(departmentsJson)) {
            departments = departmentsJson;
        } else {
            return 'All departments';
        }
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
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

// =============================================
// STUDENT FILTER PAGE
// =============================================
function initializeStudentFilterPage() {
    loadAllStudents();
}

window.applyFilters = async function () {
    try {
        const filters = getCurrentFilters();

        const queryParams = new URLSearchParams();
        if (filters.department) queryParams.append('department', filters.department);
        if (filters.minCgpa) queryParams.append('minCgpa', filters.minCgpa);
        if (filters.maxBacklogs !== null) queryParams.append('maxBacklogs', filters.maxBacklogs);
        if (filters.batch) queryParams.append('batch', filters.batch);

        const response = await apiFetch(`/api/students/filter?${queryParams}`);

        if (response.ok) {
            const students = await response.json();
            displayFilteredStudents(students);
            updateResultsSummary(students.length);
            showStudentFilterMessage(`Found ${students.length} students`, 'success');
        } else {
            showStudentFilterMessage('Error applying filters', 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        showStudentFilterMessage('Network error', 'error');
    }
};

window.resetFilters = function () {
    const fields = ['departmentFilter', 'cgpaFilter', 'batchFilter', 'backlogsFilter'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    loadAllStudents();
    showStudentFilterMessage('Filters reset', 'success');
};

window.exportFilteredStudents = async function () {
    try {
        const filters = getCurrentFilters();
        const queryParams = new URLSearchParams();

        if (filters.department) queryParams.append('department', filters.department);
        if (filters.minCgpa) queryParams.append('minCgpa', filters.minCgpa);
        if (filters.maxBacklogs !== null) queryParams.append('maxBacklogs', filters.maxBacklogs);
        if (filters.batch) queryParams.append('batch', filters.batch);

        const response = await apiFetch(`/api/students/export/filtered?${queryParams}`);

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'filtered_students.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showStudentFilterMessage('Excel file downloaded successfully!', 'success');
        } else {
            showStudentFilterMessage('Failed to export students. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error exporting students:', error);
        showStudentFilterMessage('Network error while exporting. Please try again.', 'error');
    }
};

window.getCurrentFilters = function () {
    const department = document.getElementById('departmentFilter')?.value || '';
    const cgpaFilter = document.getElementById('cgpaFilter')?.value || '';
    const batch = document.getElementById('batchFilter')?.value || '';
    const backlogsFilter = document.getElementById('backlogsFilter')?.value || '';

    return {
        department: department || null,
        minCgpa: cgpaFilter ? parseFloat(cgpaFilter) : null,
        batch: batch || null,
        maxBacklogs: backlogsFilter !== '' ? parseInt(backlogsFilter) : null
    };
};

window.displayFilteredStudents = function (students) {
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) return;

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
                    <h3>${student.studentFirstName || ''} ${student.studentLastName || ''}</h3>
                    <p class="student-id">${student.studentAdmissionNumber || ''}</p>
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

window.getStudentInitials = function (firstName, lastName) {
    if (!firstName && !lastName) return 'ST';
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
};

window.getCgpaClass = function (cgpa) {
    if (!cgpa) return '';
    if (cgpa >= 8.5) return 'excellent';
    if (cgpa >= 7.5) return 'good';
    if (cgpa >= 6.5) return 'average';
    return 'low';
};

window.getBacklogsClass = function (backlogs) {
    if (!backlogs) return '';
    if (backlogs === 0) return 'no-backlogs';
    if (backlogs <= 2) return 'few-backlogs';
    return 'many-backlogs';
};

window.updateResultsSummary = function (count) {
    const resultsSummary = document.getElementById('resultsSummary');
    const totalStudents = document.getElementById('totalStudents');

    if (resultsSummary && totalStudents) {
        totalStudents.textContent = count;
        resultsSummary.style.display = 'block';
    }
};

window.loadAllStudents = async function () {
    try {
        const response = await apiFetch('/api/students');
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

window.displayFallbackStudents = function () {
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) return;

    studentsGrid.innerHTML = `
        <div class="student-card">
            <div class="student-header">
                <div class="student-avatar">JD</div>
                <div class="student-info">
                    <h3>John Doe</h3>
                    <p class="student-id">STU001</p>
                </div>
            </div>
            <div class="student-details">
                <div class="detail-row"><span class="label">Department:</span><span class="value">Computer Science</span></div>
                <div class="detail-row"><span class="label">Batch:</span><span class="value">2024</span></div>
                <div class="detail-row"><span class="label">CGPA:</span><span class="value excellent">8.7</span></div>
                <div class="detail-row"><span class="label">Backlogs:</span><span class="value no-backlogs">0</span></div>
                <div class="detail-row"><span class="label">Email:</span><span class="value">john.doe@example.com</span></div>
            </div>
        </div>
    `;
};

window.showStudentFilterMessage = function (message, type) {
    let messageDiv = document.getElementById('studentFilterMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'studentFilterMessage';
        messageDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
            border-radius: 8px; color: white; font-weight: 500;
            z-index: 1000; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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

// =============================================
// BULK OPERATIONS
// =============================================
(function initializeBulkOperations() {
    const uploadArea = document.getElementById('uploadArea');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const excelUpload = document.getElementById('excelUpload');
    const sendOALinksBtn = document.getElementById('sendOALinks');
    const scheduleInterviewsBtn = document.getElementById('scheduleInterviews');

    let uploadedAdmissionNumbers = [];

    // File upload handling
    if (selectFileBtn && excelUpload) {
        selectFileBtn.addEventListener('click', function () {
            excelUpload.click();
        });
    }

    if (excelUpload) {
        excelUpload.addEventListener('change', function (e) {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
    }

    if (uploadArea) {
        uploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function () {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    if (sendOALinksBtn) {
        sendOALinksBtn.addEventListener('click', function () {
            if (uploadedAdmissionNumbers.length === 0) {
                showNotification('Please upload a student list first', 'warning');
                return;
            }
            showOAModal();
        });
    }

    if (scheduleInterviewsBtn) {
        scheduleInterviewsBtn.addEventListener('click', function () {
            if (uploadedAdmissionNumbers.length === 0) {
                showNotification('Please upload a student list first', 'warning');
                return;
            }
            showInterviewModal();
        });
    }

    function handleFileUpload(file) {
        const formData = new FormData();
        formData.append('file', file);

        showLoading('Processing student list...');

        apiFetch('/api/bulk-operations/extract-admission-numbers', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.success) {
                    uploadedAdmissionNumbers = data.admissionNumbers;
                    showNotification(`Successfully loaded ${data.count} students`, 'success');
                    updateUploadArea(`Loaded ${data.count} students`);
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                hideLoading();
                showNotification('Error processing file', 'error');
                console.error('Error:', error);
            });
    }

    function updateUploadArea(message) {
        const uploadText = uploadArea?.querySelector('.upload-text');
        if (uploadText) {
            uploadText.innerHTML = `
                <h4>Student List Ready</h4>
                <p>${message}</p>
                <p class="text-sm">Click "Select File" to upload a different file</p>
            `;
        }
    }

    function showOAModal() {
        const modalHtml = `
            <div class="modal-overlay active" id="oaModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Send Online Assessment Links</h3>
                        <button class="modal-close" id="oaModalClose">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="oaForm">
                            <div class="form-group">
                                <label>Event Name *</label>
                                <input type="text" id="oaEventName" required placeholder="e.g., Google Online Assessment Round 1">
                            </div>
                            <div class="form-group">
                                <label>OA Link *</label>
                                <input type="url" id="oaLink" required placeholder="https://assessment-platform.com/test/abc123">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="oaDescription" rows="4" placeholder="Instructions for the online assessment..."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Start Date & Time *</label>
                                    <input type="datetime-local" id="oaStartDate" required>
                                </div>
                                <div class="form-group">
                                    <label>End Date & Time *</label>
                                    <input type="datetime-local" id="oaEndDate" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Job Role</label>
                                    <input type="text" id="oaJobRole" placeholder="e.g., Software Engineer Intern">
                                </div>
                                <div class="form-group">
                                    <label>Expected CGPA</label>
                                    <input type="number" id="oaExpectedCgpa" step="0.1" min="0" max="10" placeholder="7.5">
                                </div>
                            </div>
                            <div class="form-info">
                                <p><strong>Students to receive OA:</strong> ${uploadedAdmissionNumbers.length}</p>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelOABtn">Cancel</button>
                        <button class="btn btn-success" id="confirmOABtn">Send OA Links</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const now = new Date();
        const minDateTime = now.toISOString().slice(0, 16);
        setTimeout(() => {
            const startDateInput = document.getElementById('oaStartDate');
            const endDateInput = document.getElementById('oaEndDate');
            if (startDateInput) startDateInput.min = minDateTime;
            if (endDateInput) endDateInput.min = minDateTime;
            setupOAModal();
        }, 10);
    }

    function showInterviewModal() {
        const modalHtml = `
            <div class="modal-overlay active" id="interviewModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Schedule Interviews</h3>
                        <button class="modal-close" id="interviewModalClose">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="interviewForm">
                            <div class="form-group">
                                <label>Event Name *</label>
                                <input type="text" id="interviewEventName" required placeholder="e.g., Google Technical Interview Round 1">
                            </div>
                            <div class="form-group">
                                <label>Interview Link / Venue *</label>
                                <input type="text" id="interviewLink" required placeholder="https://meet.google.com/abc-xyz OR Conference Room A">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="interviewDescription" rows="4" placeholder="Interview instructions..."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Start Date & Time *</label>
                                    <input type="datetime-local" id="interviewStartDate" required>
                                </div>
                                <div class="form-group">
                                    <label>End Date & Time *</label>
                                    <input type="datetime-local" id="interviewEndDate" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Job Role</label>
                                    <input type="text" id="interviewJobRole" placeholder="e.g., Senior Software Engineer">
                                </div>
                                <div class="form-group">
                                    <label>Expected CGPA</label>
                                    <input type="number" id="interviewExpectedCgpa" step="0.1" min="0" max="10" placeholder="8.0">
                                </div>
                            </div>
                            <div class="form-info">
                                <p><strong>Students to schedule interviews:</strong> ${uploadedAdmissionNumbers.length}</p>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelInterviewBtn">Cancel</button>
                        <button class="btn btn-primary" id="confirmInterviewBtn">Schedule Interviews</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const now = new Date();
        const minDateTime = now.toISOString().slice(0, 16);
        setTimeout(() => {
            const startDateInput = document.getElementById('interviewStartDate');
            const endDateInput = document.getElementById('interviewEndDate');
            if (startDateInput) startDateInput.min = minDateTime;
            if (endDateInput) endDateInput.min = minDateTime;
            setupInterviewModal();
        }, 10);
    }

    function setupOAModal() {
        const modal = document.getElementById('oaModal');
        const closeBtn = document.getElementById('oaModalClose');
        const cancelBtn = document.getElementById('cancelOABtn');
        const confirmBtn = document.getElementById('confirmOABtn');

        if (!modal || !closeBtn || !cancelBtn || !confirmBtn) return;

        function closeModal() { modal.remove(); }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

        confirmBtn.addEventListener('click', function () {
            const form = document.getElementById('oaForm');
            if (!form || !form.checkValidity()) {
                if (form) form.reportValidity();
                return;
            }

            const startDate = new Date(document.getElementById('oaStartDate').value);
            const endDate = new Date(document.getElementById('oaEndDate').value);
            if (endDate <= startDate) {
                showNotification('End date must be after start date', 'error');
                return;
            }

            const requestData = {
                studentAdmissionNumbers: uploadedAdmissionNumbers,
                eventName: document.getElementById('oaEventName').value,
                eventDescription: document.getElementById('oaDescription').value,
                oaLink: document.getElementById('oaLink').value,
                startDate: document.getElementById('oaStartDate').value + ':00',
                endDate: document.getElementById('oaEndDate').value + ':00',
                jobRole: document.getElementById('oaJobRole').value || null,
                expectedCgpa: document.getElementById('oaExpectedCgpa').value ?
                    parseFloat(document.getElementById('oaExpectedCgpa').value) : null
            };

            sendOALinksRequest(requestData);
            closeModal();
        });
    }

    function setupInterviewModal() {
        const modal = document.getElementById('interviewModal');
        const closeBtn = document.getElementById('interviewModalClose');
        const cancelBtn = document.getElementById('cancelInterviewBtn');
        const confirmBtn = document.getElementById('confirmInterviewBtn');

        if (!modal || !closeBtn || !cancelBtn || !confirmBtn) return;

        function closeModal() { modal.remove(); }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

        confirmBtn.addEventListener('click', function () {
            const form = document.getElementById('interviewForm');
            if (!form || !form.checkValidity()) {
                if (form) form.reportValidity();
                return;
            }

            const startDate = new Date(document.getElementById('interviewStartDate').value);
            const endDate = new Date(document.getElementById('interviewEndDate').value);
            if (endDate <= startDate) {
                showNotification('End date must be after start date', 'error');
                return;
            }

            const requestData = {
                studentAdmissionNumbers: uploadedAdmissionNumbers,
                eventName: document.getElementById('interviewEventName').value,
                eventDescription: document.getElementById('interviewDescription').value,
                oaLink: document.getElementById('interviewLink').value,
                startDate: document.getElementById('interviewStartDate').value + ':00',
                endDate: document.getElementById('interviewEndDate').value + ':00',
                jobRole: document.getElementById('interviewJobRole').value || null,
                expectedCgpa: document.getElementById('interviewExpectedCgpa').value ?
                    parseFloat(document.getElementById('interviewExpectedCgpa').value) : null
            };

            scheduleInterviewsRequest(requestData);
            closeModal();
        });
    }

    function sendOALinksRequest(requestData) {
        showLoading('Sending OA links and registering students...');

        apiFetch('/api/bulk-operations/send-oa-links', {
            method: 'POST',
            headers: {
                'Company-Name': getCurrentCompanyName()
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.success) {
                    showNotification(data.message, 'success');
                    uploadedAdmissionNumbers = [];
                    resetUploadArea();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                hideLoading();
                showNotification('Error sending OA links', 'error');
                console.error('Error:', error);
            });
    }

    function scheduleInterviewsRequest(requestData) {
        showLoading('Scheduling interviews and registering students...');

        apiFetch('/api/bulk-operations/schedule-interviews', {
            method: 'POST',
            headers: {
                'Company-Name': getCurrentCompanyName()
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.success) {
                    showNotification(data.message, 'success');
                    uploadedAdmissionNumbers = [];
                    resetUploadArea();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                hideLoading();
                showNotification('Error scheduling interviews', 'error');
                console.error('Error:', error);
            });
    }

    function resetUploadArea() {
        const uploadText = uploadArea?.querySelector('.upload-text');
        if (uploadText) {
            uploadText.innerHTML = `
                <h4>Upload Student List</h4>
                <p>Drag & drop your Excel file here or click to browse</p>
                <p class="text-sm">Supported formats: .xlsx, .xls, .csv</p>
            `;
        }
    }

    function getCurrentCompanyName() {
        try {
            const currentUser = sessionStorage.getItem('currentUser');
            if (currentUser) {
                const user = JSON.parse(currentUser);
                return user.companyData?.companyName || user.name || 'Default Company';
            }
        } catch (error) {
            console.error('Error getting company name:', error);
        }
        return 'Default Company';
    }

    function showLoading(message = 'Loading...') {
        let loadingDiv = document.getElementById('loadingIndicator');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loadingIndicator';
            loadingDiv.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 2rem 3rem; border-radius: 16px;
                z-index: 9999; font-weight: 600;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                display: flex; align-items: center; gap: 1rem; font-size: 1.1rem;
            `;
            document.body.appendChild(loadingDiv);
        }

        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <span>${message}</span>
        `;
        loadingDiv.style.display = 'flex';
    }

    function hideLoading() {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) loadingDiv.style.display = 'none';
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColors = {
            success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            info: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
        };
        const borderColors = {
            success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6'
        };

        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            padding: 1rem 1.5rem; border-radius: 12px;
            color: white; font-weight: 600; z-index: 1000; max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border-left: 4px solid ${borderColors[type] || borderColors.info};
            background: ${bgColors[type] || bgColors.info};
            transform: translateX(100%); transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }, 5000);
    }
})();