// =============================================
// MODAL NOTIFICATION SYSTEM
// =============================================

// Inject modal animation keyframes
(function injectModalStyles() {
    if (document.getElementById('adminModalStyles')) return;
    const style = document.createElement('style');
    style.id = 'adminModalStyles';
    style.textContent = `
        @keyframes adminModalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes adminModalSlideIn {
            from { transform: translateY(-20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
})();

// Toast notification — replaces simple alert() for status messages
function showNotification(message, type = 'info', duration = 4000) {
    let container = document.getElementById('adminToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'adminToastContainer';
        container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:0.75rem; max-width:420px;';
        document.body.appendChild(container);
    }

    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
    const bgColors = {
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        info: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${bgColors[type] || bgColors.info}; color: white;
        padding: 1rem 1.25rem; border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        display: flex; align-items: center; gap: 0.75rem;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        font-family: 'Inter', sans-serif; font-size: 0.875rem; font-weight: 500;
        cursor: pointer;
    `;

    toast.innerHTML = `
        <span class="material-symbols-outlined" style="font-size:1.25rem; flex-shrink:0;">${icons[type] || icons.info}</span>
        <span style="flex:1;">${message}</span>
        <button style="background:none; border:none; color:white; cursor:pointer; font-size:1.25rem; padding:0; opacity:0.8; flex-shrink:0;" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });

    const timeout = setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, duration);

    toast.addEventListener('click', () => {
        clearTimeout(timeout);
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    });
}

// Alert modal — replaces alert(), returns Promise
function showAlertModal(message, title = 'Notice', type = 'info') {
    return new Promise(resolve => {
        const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };
        const iconColors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };

        const overlay = document.createElement('div');
        overlay.id = 'adminAlertModal';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 99999; padding: 2rem; animation: adminModalFadeIn 0.25s ease;
        `;

        overlay.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 450px; width: 100%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: adminModalSlideIn 0.3s ease; font-family: 'Inter', sans-serif;">
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
                    <div style="width:48px; height:48px; border-radius:12px; background:${iconColors[type] || iconColors.info}15;
                        display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span class="material-symbols-outlined" style="font-size:1.5rem; color:${iconColors[type] || iconColors.info};">${icons[type] || icons.info}</span>
                    </div>
                    <h3 style="margin:0; font-size:1.125rem; font-weight:700; color:#1e293b;">${title}</h3>
                </div>
                <div style="color:#374151; font-size:0.9rem; line-height:1.6; margin-bottom:2rem; white-space:pre-wrap;">${message}</div>
                <div style="display:flex; justify-content:flex-end;">
                    <button id="adminAlertOkBtn" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        color: white; padding: 0.75rem 2rem; border: none; border-radius: 10px;
                        font-weight: 600; font-size: 0.875rem; cursor: pointer;
                        box-shadow: 0 4px 12px rgba(59,130,246,0.3); transition: all 0.2s ease;">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const okBtn = document.getElementById('adminAlertOkBtn');
        const close = () => { overlay.remove(); resolve(); };
        okBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Enter' || e.key === 'Escape') { document.removeEventListener('keydown', handler); close(); }
        });
        okBtn.focus();
    });
}

// Confirm modal — replaces confirm(), returns Promise<boolean>
function showConfirmModal(message, title = 'Confirm Action', type = 'warning') {
    return new Promise(resolve => {
        const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info', danger: 'dangerous' };
        const iconColors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6', danger: '#ef4444' };

        const confirmBtnBg = (type === 'danger' || type === 'error')
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';

        const overlay = document.createElement('div');
        overlay.id = 'adminConfirmModal';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 99999; padding: 2rem; animation: adminModalFadeIn 0.25s ease;
        `;

        overlay.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 480px; width: 100%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: adminModalSlideIn 0.3s ease; font-family: 'Inter', sans-serif;">
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
                    <div style="width:48px; height:48px; border-radius:12px; background:${iconColors[type] || iconColors.warning}15;
                        display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span class="material-symbols-outlined" style="font-size:1.5rem; color:${iconColors[type] || iconColors.warning};">${icons[type] || icons.warning}</span>
                    </div>
                    <h3 style="margin:0; font-size:1.125rem; font-weight:700; color:#1e293b;">${title}</h3>
                </div>
                <div style="color:#374151; font-size:0.9rem; line-height:1.6; margin-bottom:2rem; white-space:pre-wrap;">${message}</div>
                <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                    <button id="adminConfirmCancelBtn" style="background: #f1f5f9; color: #64748b; padding: 0.75rem 1.5rem;
                        border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer;">Cancel</button>
                    <button id="adminConfirmOkBtn" style="background: ${confirmBtnBg}; color: white; padding: 0.75rem 1.5rem;
                        border: none; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer;
                        box-shadow: 0 4px 12px rgba(59,130,246,0.3);">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const okBtn = document.getElementById('adminConfirmOkBtn');
        const cancelBtn = document.getElementById('adminConfirmCancelBtn');
        const close = (result) => { overlay.remove(); resolve(result); };
        okBtn.addEventListener('click', () => close(true));
        cancelBtn.addEventListener('click', () => close(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') { document.removeEventListener('keydown', handler); close(false); }
            if (e.key === 'Enter') { document.removeEventListener('keydown', handler); close(true); }
        });
        okBtn.focus();
    });
}

// Prompt modal — replaces prompt(), returns Promise<string|null>
function showPromptModal(message, title = 'Input Required', defaultValue = '', inputType = 'text') {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.id = 'adminPromptModal';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 99999; padding: 2rem; animation: adminModalFadeIn 0.25s ease;
        `;

        overlay.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 450px; width: 100%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: adminModalSlideIn 0.3s ease; font-family: 'Inter', sans-serif;">
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
                    <div style="width:48px; height:48px; border-radius:12px; background:rgba(59,130,246,0.1);
                        display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span class="material-symbols-outlined" style="font-size:1.5rem; color:#3b82f6;">edit</span>
                    </div>
                    <h3 style="margin:0; font-size:1.125rem; font-weight:700; color:#1e293b;">${title}</h3>
                </div>
                <div style="color:#374151; font-size:0.9rem; line-height:1.6; margin-bottom:1rem;">${message}</div>
                <input id="adminPromptInput" type="${inputType}" value="${defaultValue}" style="
                    width: 100%; padding: 0.875rem 1rem; border: 2px solid #e5e7eb; border-radius: 10px;
                    font-size: 0.9rem; outline: none; transition: all 0.2s ease;
                    font-family: 'Inter', sans-serif; margin-bottom: 1.5rem; box-sizing: border-box;
                " onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 4px rgba(59,130,246,0.1)';"
                  onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';" />
                <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
                    <button id="adminPromptCancelBtn" style="background: #f1f5f9; color: #64748b; padding: 0.75rem 1.5rem;
                        border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer;">Cancel</button>
                    <button id="adminPromptOkBtn" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 10px;
                        font-weight: 600; font-size: 0.875rem; cursor: pointer;
                        box-shadow: 0 4px 12px rgba(59,130,246,0.3);">Submit</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const input = document.getElementById('adminPromptInput');
        const okBtn = document.getElementById('adminPromptOkBtn');
        const cancelBtn = document.getElementById('adminPromptCancelBtn');
        const close = (value) => { overlay.remove(); resolve(value); };
        okBtn.addEventListener('click', () => close(input.value));
        cancelBtn.addEventListener('click', () => close(null));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') close(input.value); });
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') { document.removeEventListener('keydown', handler); close(null); }
        });
        input.focus();
        input.select();
    });
}


// =============================================
// HELPER: Authenticated fetch wrapper
// =============================================
function apiFetch(url, options = {}) {
    // Merge headers separately to avoid overwrite
    const mergedHeaders = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const defaultOptions = {
        credentials: 'same-origin',
        ...options,
        headers: mergedHeaders
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
document.addEventListener('DOMContentLoaded', async function () {
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
        await showAlertModal('Access denied. Company privileges required.');
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
            mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
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
            if (pageId) showPage(pageId);
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

    if (pageId === 'recruitment') initializeRecruitmentPage();
    else if (pageId === 'studentFilter') initializeStudentFilterPage();
}

function findNavItemForPage(pageId) {
    const navItems = document.querySelectorAll('.navbar-item');
    for (let item of navItems) {
        const t = item.textContent.trim().toLowerCase();
        if (pageId === 'dashboard' && t.includes('dashboard')) return item;
        if (pageId === 'recruitment' && t.includes('recruitment')) return item;
        if (pageId === 'profile' && t.includes('profile')) return item;
        if (pageId === 'studentFilter' && (t.includes('student') || t.includes('filter'))) return item;
        if (pageId === 'bulkOperations' && (t.includes('bulk') || t.includes('upload'))) return item;
    }
    return null;
}

// =============================================
// EVENT FORM HANDLERS
// =============================================
function setupEventFormHandlers() {
    const createBtn = document.getElementById('createRecruitment');
    if (createBtn) createBtn.addEventListener('click', showEventForm);

    const cancelBtn = document.getElementById('cancelEvent');
    if (cancelBtn) cancelBtn.addEventListener('click', closeEventForm);
}

// =============================================
// GLOBAL SEARCH
// =============================================
function setupGlobalSearch() {
    const form = document.querySelector('.search-form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const input = document.getElementById('globalSearchInput');
            if (input) await showAlertModal(`Searching for: ${input.value}`);
        });
    }
}

async function globalSearch(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('globalSearchInput');
    if (input) await showAlertModal(`Searching for: ${input.value}`);
}

// =============================================
// LOGOUT
// =============================================
async function logoutCompany() {
    if (await showConfirmModal('Are you sure you want to logout?')) {
        apiFetch('/api/logout', { method: 'POST' })
            .then(() => { sessionStorage.clear(); window.location.href = 'login_page.html'; })
            .catch(() => { sessionStorage.clear(); window.location.href = 'login_page.html'; });
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
        if (companyData.photoLink) updateCompanyProfileImage(companyData.photoLink);
        updateCompanyDetailItem('Email Address', companyData.hrEmail || 'Not specified');
        updateCompanyDetailItem('Phone Number', companyData.hrPhone || 'Not specified');
        updateCompanyDetailItem('Location', companyData.location || 'Not specified');
    } catch (error) {
        console.error('Error loading company profile:', error);
        if (user.companyData) loadStoredCompanyData(user.companyData);
    }
}

async function fetchCompanyProfile(companyId) {
    try {
        const response = await apiFetch(`/api/companies/${companyId}`);
        if (response.ok) return await response.json();
        return null;
    } catch (error) {
        console.error('Error fetching company profile:', error);
        return null;
    }
}

function updateCompanyProfileElement(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}

function updateCompanyProfileImage(imageUrl) {
    const img = document.querySelector('.profile-img');
    if (img && imageUrl) img.src = imageUrl;
}

function updateCompanyDetailItem(label, value) {
    document.querySelectorAll('.detail-item').forEach(item => {
        const labelEl = item.querySelector('.label');
        if (labelEl && labelEl.textContent === label) {
            const valueEl = item.querySelector('.value');
            if (valueEl) valueEl.textContent = value;
        }
    });
}

function loadStoredCompanyData(d) {
    updateCompanyProfileElement('.admin-name', d.hrName || 'HR Manager');
    updateCompanyProfileElement('.college-name', d.companyName || 'Company');
    updateCompanyProfileElement('.admin-role', 'HR Manager');
    if (d.photoLink) updateCompanyProfileImage(d.photoLink);
    updateCompanyDetailItem('Email Address', d.hrEmail || 'Not specified');
    updateCompanyDetailItem('Phone Number', d.hrPhone || 'Not specified');
    updateCompanyDetailItem('Location', d.location || 'Not specified');
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
            events = events.map(event => ({ ...event, status: classifyEventStatus(event) }));
            currentEvents = events;

            // Fetch registration counts for each event
            await Promise.all(currentEvents.map(async (event) => {
                try {
                    const countResp = await apiFetch(`/api/events/${event.eventId}/registrations/count`);
                    if (countResp.ok) {
                        const data = await countResp.json();
                        event.registrationCount = data.count || 0;
                    }
                } catch (e) {
                    event.registrationCount = 0;
                }
            }));

            displayEvents(currentEvents);
        } else {
            displayEvents([]);
            showRecruitmentMessage('No events found for your company', 'info');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        displayEvents([]);
        showRecruitmentMessage('Error loading events.', 'error');
    }
}

function classifyEventStatus(event) {
    const now = new Date();
    const start = new Date(event.registrationStart);
    const end = new Date(event.registrationEnd);
    if (event.status === 'CANCELLED') return 'CANCELLED';
    if (now < start) return 'UPCOMING';
    if (now >= start && now <= end) return 'ONGOING';
    if (now > end) return 'COMPLETED';
    return 'UPCOMING';
}

function displayEvents(events) {
    const container = document.getElementById('recruitmentCards');
    if (!container) return;

    if (!events || events.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #64748b;">
                <span class="material-symbols-outlined" style="font-size: 4rem; margin-bottom: 1rem;">event</span>
                <h3>No Events Created</h3>
                <p>Create your first recruitment event to get started.</p>
            </div>`;
        return;
    }

    container.innerHTML = events.map(event => {
        const safeId = String(event.eventId).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const regCount = event.registrationCount || 0;
        return `
        <div class="event-card" data-event-id="${event.eventId}">
            <div class="event-card-header">
                <div class="event-company-logo">${getCompanyInitials(event.organizingCompany)}</div>
                <div class="event-info">
                    <h3>${event.eventName}</h3>
                    <p class="event-role">${event.jobRole || 'Various Roles'}</p>
                </div>
                <span class="event-status ${getStatusClass(event.status)}">${event.status}</span>
            </div>
            <div class="event-details">
                <p class="event-detail"><strong>Event ID:</strong> <code style="background:#f1f5f9; padding:0.125rem 0.5rem; border-radius:4px; font-size:0.8rem; color:#1e293b; font-weight:600;">${event.eventId}</code></p>
                <p class="event-detail"><strong>Registration:</strong> ${formatDateTime(event.registrationStart)} - ${formatDateTime(event.registrationEnd)}</p>
                <p class="event-detail"><strong>Mode:</strong> ${event.eventMode}</p>
                <p class="event-detail"><strong>CGPA Required:</strong> ${event.expectedCgpa ? event.expectedCgpa + '+' : 'Not specified'}</p>
                <p class="event-detail"><strong>Package:</strong> ${event.expectedPackage ? '₹' + event.expectedPackage + ' LPA' : 'Not specified'}</p>
                <p class="event-detail"><strong>Departments:</strong> ${getEligibleDepartmentsDisplay(event.eligibleDepartments)}</p>
                <p class="event-detail">
                    <strong>Registered Students:</strong>
                    <span style="background:#dbeafe; color:#1e40af; padding:0.125rem 0.5rem; border-radius:12px; font-weight:600; font-size:0.8rem;">${regCount}</span>
                </p>
            </div>
            <div class="event-actions">
                <button class="event-action-btn" onclick="viewEventDetails('${safeId}')">View</button>
                <button class="event-action-btn edit" onclick="editEvent('${safeId}')">Edit</button>
                <button class="event-action-btn" onclick="exportEventStudents('${safeId}')" style="background:#10b981;">Export</button>
                <button class="event-action-btn delete" onclick="deleteEvent('${safeId}')">Delete</button>
            </div>
        </div>`;
    }).join('');
}

// Export registered students for an event
async function exportEventStudents(eventId) {
    try {
        showRecruitmentMessage('Downloading...', 'info');
        const response = await apiFetch(`/api/events/${eventId}/registrations/export`);

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `registered_students_${eventId}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showRecruitmentMessage('Export downloaded!', 'success');
        } else {
            showRecruitmentMessage('Failed to export', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showRecruitmentMessage('Network error', 'error');
    }
}

function getStatusClass(status) {
    return { 'UPCOMING': 'upcoming', 'ONGOING': 'ongoing', 'COMPLETED': 'completed', 'CANCELLED': 'cancelled' }[status] || 'upcoming';
}

function getStatusDescription(status) {
    return { 'UPCOMING': 'Registration will start soon', 'ONGOING': 'Registration is currently open', 'COMPLETED': 'Registration has ended', 'CANCELLED': 'Event has been cancelled' }[status] || '';
}

// =============================================
// EVENT FORM (CREATE/EDIT)
// =============================================
function showEventForm() {
    const form = document.getElementById('event-creation-form');
    const btn = document.getElementById('createRecruitment');
    if (!form || !btn) return;

    form.style.display = 'block';
    btn.style.display = 'none';

    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const companyName = user.companyData?.companyName || user.name;
        const input = document.getElementById('organizingCompany');
        if (input) input.value = companyName;
    }

    const now = new Date().toISOString().slice(0, 16);
    const startInput = document.getElementById('registrationStart');
    const endInput = document.getElementById('registrationEnd');
    if (startInput) startInput.min = now;
    if (endInput) endInput.min = now;
}

function closeEventForm() {
    const form = document.getElementById('event-creation-form');
    const btn = document.getElementById('createRecruitment');
    if (!form || !btn) return;

    form.style.display = 'none';
    btn.style.display = 'flex';
    resetEventForm();

    const submitBtn = document.querySelector('#event-creation-form button[onclick*="submitEventForm"], #event-creation-form button[onclick*="updateEvent"]');
    if (submitBtn) {
        submitBtn.textContent = 'Create Event';
        submitBtn.setAttribute('onclick', 'submitEventForm()');
    }
}

function resetEventForm() {
    const form = document.getElementById('addEventForm');
    if (form) form.reset();
    document.querySelectorAll('input[name="eligibleDepartments"]').forEach(cb => cb.checked = false);
}

async function submitEventForm() {
    try {
        const formData = getEventFormData();
        if (!validateEventForm(formData)) return;

        // DO NOT send eventId — backend will generate it
        delete formData.eventId;

        const response = await apiFetch('/api/events/create', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const created = await response.json();
            showRecruitmentMessage(`Event created! ID: ${created.eventId}`, 'success');
            closeEventForm();
            loadCompanyEvents();
        } else {
            showRecruitmentMessage('Failed to create event.', 'error');
        }
    } catch (error) {
        showRecruitmentMessage('Network error.', 'error');
    }
}

function getEventFormData() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const companyName = currentUser.companyData?.companyName || currentUser.name;
    const selectedDepts = Array.from(document.querySelectorAll('input[name="eligibleDepartments"]:checked')).map(cb => cb.value);

    return {
        eventName: document.getElementById('eventName')?.value || '',
        organizingCompany: companyName,
        expectedCgpa: parseFloat(document.getElementById('expectedCgpa')?.value) || 0,
        jobRole: document.getElementById('jobRole')?.value || '',
        registrationStart: document.getElementById('registrationStart')?.value || '',
        registrationEnd: document.getElementById('registrationEnd')?.value || '',
        eventMode: document.getElementById('eventMode')?.value || 'ONLINE',
        expectedPackage: parseFloat(document.getElementById('expectedPackage')?.value) || null,
        eventDescription: document.getElementById('eventDescription')?.value || '',
        eligibleDepartments: selectedDepts
    };
}

function validateEventForm(formData) {
    if (!formData.eventName.trim()) { showRecruitmentMessage('Event name required', 'error'); return false; }
    if (!formData.registrationStart || !formData.registrationEnd) { showRecruitmentMessage('Dates required', 'error'); return false; }
    if (new Date(formData.registrationEnd) <= new Date(formData.registrationStart)) { showRecruitmentMessage('End date must be after start', 'error'); return false; }
    if (!formData.eventDescription.trim()) { showRecruitmentMessage('Description required', 'error'); return false; }
    return true;
}

// =============================================
// EVENT ACTIONS
// =============================================
async function viewEventDetails(eventId) {
    const event = currentEvents.find(e => String(e.eventId) === String(eventId));
    if (event) {
        await showAlertModal(
            `Event Details:\n\n` +
            `ID: ${event.eventId}\n` +
            `Name: ${event.eventName}\n` +
            `Company: ${event.organizingCompany}\n` +
            `Role: ${event.jobRole}\n` +
            `Description: ${event.eventDescription}\n` +
            `Registration: ${formatDateTime(event.registrationStart)} to ${formatDateTime(event.registrationEnd)}\n` +
            `Registered: ${event.registrationCount || 0} students`
        );
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

    let departments = [];
    if (event.eligibleDepartments) {
        try {
            departments = typeof event.eligibleDepartments === 'string'
                ? JSON.parse(event.eligibleDepartments)
                : Array.isArray(event.eligibleDepartments)
                    ? event.eligibleDepartments
                    : [];
        } catch (e) { departments = []; }
    }
    document.querySelectorAll('input[name="eligibleDepartments"]').forEach(cb => {
        cb.checked = departments.includes(cb.value);
    });

    showEventForm();

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
            showRecruitmentMessage('Event updated!', 'success');
            closeEventForm();
            loadCompanyEvents();
        } else {
            showRecruitmentMessage('Failed to update', 'error');
        }
    } catch (error) {
        showRecruitmentMessage('Network error', 'error');
    }
}

async function deleteEvent(eventId) {
    if (await showConfirmModal('Delete this event? This cannot be undone.')) {
        try {
            const response = await apiFetch(`/api/events/${eventId}`, { method: 'DELETE' });
            if (response.ok) {
                showRecruitmentMessage('Event deleted!', 'success');
                loadCompanyEvents();
            } else {
                showRecruitmentMessage('Failed to delete', 'error');
            }
        } catch (error) {
            showRecruitmentMessage('Network error', 'error');
        }
    }
}

function startEventStatusAutoRefresh() {
    setInterval(() => {
        if (currentEvents.length > 0) {
            currentEvents = currentEvents.map(e => ({ ...e, status: classifyEventStatus(e) }));
            displayEvents(currentEvents);
        }
    }, 60000);
}

// =============================================
// HELPER FUNCTIONS
// =============================================
function getCompanyInitials(name) {
    if (!name) return 'CO';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
}

function formatDateTime(s) {
    if (!s) return 'Not specified';
    try {
        const d = new Date(s);
        return isNaN(d.getTime()) ? 'Not specified' : d.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch (e) { return 'Not specified'; }
}

function formatDateTimeForInput(s) {
    if (!s) return '';
    try {
        const d = new Date(s);
        return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
    } catch (e) { return ''; }
}

function getEligibleDepartmentsDisplay(deps) {
    if (!deps) return 'All departments';
    try {
        let d = typeof deps === 'string' ? JSON.parse(deps) : Array.isArray(deps) ? deps : [];
        return d.length > 0 ? d.join(', ') : 'All departments';
    } catch { return 'All departments'; }
}

function showRecruitmentMessage(message, type) {
    let div = document.getElementById('recruitmentMessage');
    if (!div) {
        div = document.createElement('div');
        div.id = 'recruitmentMessage';
        div.style.cssText = 'position:fixed;top:20px;right:20px;padding:1rem 1.5rem;border-radius:12px;color:white;font-weight:600;z-index:10000;max-width:450px;box-shadow:0 10px 30px rgba(0,0,0,0.2);transition:all 0.3s ease;font-size:0.9rem;';
        document.body.appendChild(div);
    }
    div.textContent = message;
    div.style.background = type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
        type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
            'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    div.style.display = 'block';
    setTimeout(() => { div.style.display = 'none'; }, 5000);
}

// =============================================
// STUDENT FILTER PAGE
// =============================================
function initializeStudentFilterPage() {
    loadAllStudents();
}

window.applyFilters = async function () {
    try {
        const f = getCurrentFilters();
        const q = new URLSearchParams();
        if (f.department) q.append('department', f.department);
        if (f.minCgpa) q.append('minCgpa', f.minCgpa);
        if (f.maxBacklogs !== null) q.append('maxBacklogs', f.maxBacklogs);
        if (f.batch) q.append('batch', f.batch);

        const response = await apiFetch(`/api/students/filter?${q}`);
        if (response.ok) {
            const students = await response.json();
            displayFilteredStudents(students);
            updateResultsSummary(students.length);
            showStudentFilterMessage(`Found ${students.length} students`, 'success');
        } else {
            showStudentFilterMessage('Error applying filters', 'error');
        }
    } catch (error) {
        showStudentFilterMessage('Network error', 'error');
    }
};

window.resetFilters = function () {
    ['departmentFilter', 'cgpaFilter', 'batchFilter', 'backlogsFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    loadAllStudents();
    showStudentFilterMessage('Filters reset', 'success');
};

window.exportFilteredStudents = async function () {
    try {
        const f = getCurrentFilters();
        const q = new URLSearchParams();
        if (f.department) q.append('department', f.department);
        if (f.minCgpa) q.append('minCgpa', f.minCgpa);
        if (f.maxBacklogs !== null) q.append('maxBacklogs', f.maxBacklogs);
        if (f.batch) q.append('batch', f.batch);

        const response = await apiFetch(`/api/students/export/filtered?${q}`);
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
            showStudentFilterMessage('Downloaded!', 'success');
        } else {
            showStudentFilterMessage('Export failed', 'error');
        }
    } catch (error) {
        showStudentFilterMessage('Network error', 'error');
    }
};

window.getCurrentFilters = function () {
    return {
        department: document.getElementById('departmentFilter')?.value || null,
        minCgpa: document.getElementById('cgpaFilter')?.value ? parseFloat(document.getElementById('cgpaFilter').value) : null,
        batch: document.getElementById('batchFilter')?.value || null,
        maxBacklogs: document.getElementById('backlogsFilter')?.value !== '' && document.getElementById('backlogsFilter')?.value !== undefined
            ? parseInt(document.getElementById('backlogsFilter').value) : null
    };
};

window.displayFilteredStudents = function (students) {
    const grid = document.getElementById('studentsGrid');
    if (!grid) return;

    if (!students || students.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <span class="material-symbols-outlined">search_off</span>
                <h3>No Students Found</h3>
                <p>Try adjusting your filters to see more results.</p>
            </div>`;
        return;
    }

    grid.innerHTML = students.map(s => `
        <div class="student-card">
            <div class="student-header">
                <div class="student-avatar">${getStudentInitials(s.studentFirstName, s.studentLastName)}</div>
                <div class="student-info">
                    <h3>${s.studentFirstName || ''} ${s.studentLastName || ''}</h3>
                    <p class="student-id">${s.studentAdmissionNumber || ''}</p>
                </div>
            </div>
            <div class="student-details">
                <div class="detail-row"><span class="label">Department:</span><span class="value">${s.department || 'N/A'}</span></div>
                <div class="detail-row"><span class="label">Batch:</span><span class="value">${s.batch || 'N/A'}</span></div>
                <div class="detail-row"><span class="label">CGPA:</span><span class="value ${getCgpaClass(s.cgpa)}">${s.cgpa || 'N/A'}</span></div>
                <div class="detail-row"><span class="label">Backlogs:</span><span class="value ${getBacklogsClass(s.backLogsCount)}">${s.backLogsCount || 0}</span></div>
                <div class="detail-row"><span class="label">Email:</span><span class="value">${s.emailId || 'N/A'}</span></div>
                <div class="detail-row"><span class="label">Mobile:</span><span class="value">${s.mobileNo || 'N/A'}</span></div>
                ${s.resumeLink ? `<div class="detail-row"><span class="label">Resume:</span><a href="${s.resumeLink}" target="_blank" class="resume-link">View Resume</a></div>` : ''}
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
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
};

window.showStudentFilterMessage = function (message, type) {
    let div = document.getElementById('studentFilterMessage');
    if (!div) {
        div = document.createElement('div');
        div.id = 'studentFilterMessage';
        div.style.cssText = 'position:fixed;top:20px;right:20px;padding:1rem 1.5rem;border-radius:12px;color:white;font-weight:600;z-index:10000;max-width:400px;box-shadow:0 10px 30px rgba(0,0,0,0.2);';
        document.body.appendChild(div);
    }
    div.textContent = message;
    div.style.background = type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
        type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
            'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    div.style.display = 'block';
    setTimeout(() => { div.style.display = 'none'; }, 5000);
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
    const finalSelectionBtn = document.getElementById('finalSelection');

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

    if (finalSelectionBtn) {
        finalSelectionBtn.addEventListener('click', function () {
            if (uploadedAdmissionNumbers.length === 0) {
                showNotification('Please upload a student list first', 'warning');
                return;
            }
            showFinalSelectionModal();
        });
    }

    // ---- File Upload Handler ----
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
                    updateUploadArea(`Loaded ${data.count} students from file`);
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
                <h4 style="color:#10b981; margin-bottom:0.5rem;">✓ Student List Ready</h4>
                <p style="font-weight:600; color:#1e293b;">${message}</p>
                <p class="text-sm" style="color:#64748b;">Click "Select File" to upload a different file</p>
            `;
        }
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
        uploadedAdmissionNumbers = [];
    }

    // ---- Build Event ID Dropdown ----
    function buildEventIdField() {
        if (currentEvents.length === 0) {
            return `
                <div class="form-group">
                    <label>Event ID *</label>
                    <input type="text" id="bulkEventId" required placeholder="Enter Event ID (e.g., GOOGLE-110226153045)">
                    <p style="font-size:0.75rem; color:#ef4444; margin-top:0.25rem;">No events loaded. Type the Event ID manually.</p>
                </div>
            `;
        }

        const options = currentEvents.map(e =>
            `<option value="${e.eventId}">${e.eventId} — ${e.eventName} (${e.jobRole || 'N/A'})</option>`
        ).join('');

        return `
            <div class="form-group">
                <label>Select Event *</label>
                <select id="bulkEventId" required>
                    <option value="">-- Choose an Event --</option>
                    ${options}
                </select>
                <p style="font-size:0.75rem; color:#64748b; margin-top:0.25rem;">Select the event for which this action applies</p>
            </div>
        `;
    }

    // ---- OA Modal ----
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
                            ${buildEventIdField()}
                            <div class="form-group">
                                <label>OA Link *</label>
                                <input type="url" id="oaLink" required placeholder="https://assessment-platform.com/test/abc123">
                            </div>
                            <div class="form-group">
                                <label>Description / Instructions</label>
                                <textarea id="oaDescription" rows="3" placeholder="Instructions for the online assessment..."></textarea>
                            </div>
                            <div class="form-info">
                                <p><strong>Students in uploaded list:</strong> ${uploadedAdmissionNumbers.length}</p>
                                <p style="font-size:0.75rem; color:#dc2626; margin-top:0.5rem;">
                                    ⚠ Students registered for this event but NOT in the uploaded list will be marked as <strong>REJECTED</strong>.
                                </p>
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
        setTimeout(() => setupOAModal(), 10);
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
            const eventId = document.getElementById('bulkEventId')?.value;
            const oaLink = document.getElementById('oaLink')?.value;

            if (!eventId) {
                showNotification('Please select or enter an Event ID', 'error');
                return;
            }
            if (!oaLink) {
                showNotification('Please enter the OA Link', 'error');
                return;
            }

            const requestData = {
                eventId: eventId,
                studentAdmissionNumbers: uploadedAdmissionNumbers,
                oaLink: oaLink,
                eventDescription: document.getElementById('oaDescription')?.value || 'OA Link sent'
            };

            sendOALinksRequest(requestData);
            closeModal();
        });
    }

    function sendOALinksRequest(requestData) {
        showLoading('Sending OA links & updating statuses...');

        apiFetch('/api/bulk-operations/send-oa-links', {
            method: 'POST',
            headers: { 'Company-Name': getCurrentCompanyName() },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.success) {
                    showNotification(data.message, 'success');
                    resetUploadArea();
                    // Refresh recruitment page if visible
                    if (currentEvents.length > 0) loadCompanyEvents();
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

    // ---- Interview Modal ----
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
                            ${buildEventIdField()}
                            <div class="form-group">
                                <label>Interview Link / Venue *</label>
                                <input type="text" id="interviewLink" required placeholder="https://meet.google.com/abc-xyz OR Conference Room A">
                            </div>
                            <div class="form-group">
                                <label>Description / Instructions</label>
                                <textarea id="interviewDescription" rows="3" placeholder="Interview instructions, what to prepare..."></textarea>
                            </div>
                            <div class="form-info">
                                <p><strong>Students in uploaded list:</strong> ${uploadedAdmissionNumbers.length}</p>
                                <p style="font-size:0.75rem; color:#dc2626; margin-top:0.5rem;">
                                    ⚠ Students not in this list (who were previously ATTEMPTED/REGISTERED) will be marked as <strong>REJECTED</strong>.
                                </p>
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
        setTimeout(() => setupInterviewModal(), 10);
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
            const eventId = document.getElementById('bulkEventId')?.value;
            const interviewLink = document.getElementById('interviewLink')?.value;

            if (!eventId) {
                showNotification('Please select or enter an Event ID', 'error');
                return;
            }
            if (!interviewLink) {
                showNotification('Please enter the Interview Link / Venue', 'error');
                return;
            }

            const requestData = {
                eventId: eventId,
                studentAdmissionNumbers: uploadedAdmissionNumbers,
                oaLink: interviewLink,
                eventDescription: document.getElementById('interviewDescription')?.value || 'Interview scheduled'
            };

            scheduleInterviewsRequest(requestData);
            closeModal();
        });
    }

    function scheduleInterviewsRequest(requestData) {
        showLoading('Scheduling interviews & updating statuses...');

        apiFetch('/api/bulk-operations/schedule-interviews', {
            method: 'POST',
            headers: { 'Company-Name': getCurrentCompanyName() },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.success) {
                    showNotification(data.message, 'success');
                    resetUploadArea();
                    if (currentEvents.length > 0) loadCompanyEvents();
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

    // ---- Final Selection Modal ----
    function showFinalSelectionModal() {
        const modalHtml = `
            <div class="modal-overlay active" id="finalSelectionModal">
                <div class="modal-content">
                    <div class="modal-header" style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);">
                        <h3 style="color: #166534;">🎉 Final Selection</h3>
                        <button class="modal-close" id="finalSelectionClose">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="finalSelectionForm">
                            ${buildEventIdField()}
                            <div class="form-info" style="background:#f0fdf4; border-color:#86efac;">
                                <p style="color:#166534;"><strong>Students to be marked as SELECTED:</strong> ${uploadedAdmissionNumbers.length}</p>
                                <p style="font-size:0.75rem; color:#dc2626; margin-top:0.5rem;">
                                    ⚠ All other students who participated in this event but are NOT in this list will be marked as <strong>REJECTED</strong>.
                                </p>
                                <p style="font-size:0.75rem; color:#166534; margin-top:0.25rem;">
                                    ✓ This action marks the final outcome of the recruitment drive.
                                </p>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelFinalSelectionBtn">Cancel</button>
                        <button class="btn btn-success" id="confirmFinalSelectionBtn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            ✓ Confirm Final Selection
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        setTimeout(() => setupFinalSelectionModal(), 10);
    }

    function setupFinalSelectionModal() {
        const modal = document.getElementById('finalSelectionModal');
        const closeBtn = document.getElementById('finalSelectionClose');
        const cancelBtn = document.getElementById('cancelFinalSelectionBtn');
        const confirmBtn = document.getElementById('confirmFinalSelectionBtn');

        if (!modal || !closeBtn || !cancelBtn || !confirmBtn) return;

        function closeModal() { modal.remove(); }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

        confirmBtn.addEventListener('click', async function () {
            const eventId = document.getElementById('bulkEventId')?.value;

            if (!eventId) {
                showNotification('Please select or enter an Event ID', 'error');
                return;
            }

            const shouldProceed = await showConfirmModal(
                `Are you sure you want to finalize selection for event ${eventId}?\n\n${uploadedAdmissionNumbers.length} students will be marked as SELECTED.\nAll others will be marked as REJECTED.\n\nThis action cannot be easily undone.`
            );

            if (!shouldProceed) {
                return;
            }

            const requestData = {
                eventId: eventId,
                studentAdmissionNumbers: uploadedAdmissionNumbers
            };

            finalSelectionRequest(requestData);
            closeModal();
        });
    }

    function finalSelectionRequest(requestData) {
        showLoading('Processing final selection...');

        apiFetch('/api/bulk-operations/final-selection', {
            method: 'POST',
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                if (data.success) {
                    showNotification(data.message, 'success');
                    resetUploadArea();
                    if (currentEvents.length > 0) loadCompanyEvents();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                hideLoading();
                showNotification('Error processing final selection', 'error');
                console.error('Error:', error);
            });
    }

    // ---- Shared Utilities ----
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

    function showLoading(message) {
        let loadingDiv = document.getElementById('loadingIndicator');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loadingIndicator';
            loadingDiv.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 2rem 3rem; border-radius: 16px;
                z-index: 99999; font-weight: 600;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                display: flex; align-items: center; gap: 1rem; font-size: 1.1rem;
            `;
            document.body.appendChild(loadingDiv);
        }

        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <span>${message || 'Loading...'}</span>
        `;
        loadingDiv.style.display = 'flex';
    }

    function hideLoading() {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) loadingDiv.style.display = 'none';
    }

    function showNotification(message, type) {
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
            color: white; font-weight: 600; z-index: 100000; max-width: 450px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border-left: 4px solid ${borderColors[type] || borderColors.info};
            background: ${bgColors[type] || bgColors.info};
            transform: translateX(120%); transition: transform 0.3s ease;
            font-size: 0.9rem;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Slide in
        setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 50);

        // Slide out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }, 6000);
    }
})();