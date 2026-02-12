// =============================================
// MODAL NOTIFICATION SYSTEM
// =============================================

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
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', async function () {
    const isLoginPage = window.location.pathname.includes('login_page.html') ||
        window.location.pathname.includes('index.html') ||
        window.location.pathname === '/';

    if (isLoginPage) {
        return;
    }

    const currentUser = sessionStorage.getItem('currentUser');

    if (!currentUser) {
        window.location.href = 'login_page.html';
        return;
    }

    const user = JSON.parse(currentUser);

    if (user.role !== 'admin') {
        await showAlertModal('Access denied. Admin privileges required.');
        window.location.href = 'login_page.html';
        return;
    }

    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    loadAdminProfile();
    initializeProfilePage();
    loadProfileSettings();
    setupPageNavigation();
    loadEventsByTab('upcoming');
    loadCompanies();
    setupBulkUpload();
    setupRegisterButton();

    // Setup profile page click listener
    const profileLink = document.querySelector('a[onclick*="profile"]');
    if (profileLink) {
        profileLink.addEventListener('click', function () {
            setTimeout(() => {
                loadAdminProfile();
                loadProfileSettings();
            }, 100);
        });
    }
}

// Setup register button
function setupRegisterButton() {
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', registerStudent);
    }
}

// =============================================
// 1. MESSAGES FUNCTIONALITY
// =============================================
let currentMessages = [];
let currentFilter = 'all';
let selectedMessageId = null;

function initializeMessagesSection() {
    loadMessages('all');
}

async function loadMessages(filter = 'all') {
    currentFilter = filter;

    // Update active tab styling
    document.querySelectorAll('.msg-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.style.background = 'white';
        tab.style.color = '#6b7280';
        tab.style.border = '1px solid #e5e7eb';
        tab.style.boxShadow = 'none';
        tab.style.fontWeight = '500';
    });

    const activeTab = document.querySelector(`.msg-tab[onclick*="${filter}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
        activeTab.style.color = 'white';
        activeTab.style.border = 'none';
        activeTab.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
        activeTab.style.fontWeight = '600';
    }

    const titles = {
        'all': 'All Messages',
        'unread': 'Unread Messages',
        'read': 'Read Messages',
        'archived': 'Archived Messages'
    };
    document.getElementById('messagesTitle').textContent = titles[filter] || 'Messages';

    try {
        let url = '/api/messages';
        if (filter !== 'all') {
            url = `/api/messages/status/${filter}`;
        }

        const response = await apiFetch(url);
        const result = await response.json();

        if (result.success) {
            currentMessages = result.messages || [];
            renderMessages(currentMessages);

            if (filter === 'all') {
                updateMessageCounts(result.unreadCount || 0, currentMessages.length);
            }
        } else {
            console.error('API returned error:', result.message);
            showAdminMessage('Failed to load messages: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function renderMessages(messages) {
    const container = document.getElementById('messagesList');

    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; color:#6b7280;">
                <span class="material-symbols-outlined" style="font-size:3rem; display:block; margin-bottom:1rem;">email</span>
                <h3>No messages found</h3>
                <p>There are no ${currentFilter} messages.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(message => `
        <div class="message-item" onclick="openMessage('${message.id}')"
             style="padding:1.25rem; border:1px solid #e5e7eb; cursor:pointer; transition:all 0.3s ease; border-radius:12px; margin-bottom:1rem; background:white; box-shadow:0 1px 3px rgba(0,0,0,0.05);"
             onmouseover="this.style.background='#f8fafc'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.borderColor='#cbd5e1';"
             onmouseout="this.style.background='white'; this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'; this.style.borderColor='#e5e7eb';">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.75rem;">
                <div style="font-weight:600; color:#1f2937; font-size:0.95rem;">${message.senderName}</div>
                <div style="font-size:0.8rem; color:#6b7280;">${formatMessageDate(message.createdAt)}</div>
            </div>
            <div style="font-size:0.875rem; color:#374151; margin-bottom:0.75rem; line-height:1.4;">
                <strong>${message.subject}</strong>
            </div>
            <div style="font-size:0.8rem; color:#6b7280; margin-bottom:0.75rem; line-height:1.4;">
                ${message.message.length > 100 ? message.message.substring(0, 100) + '...' : message.message}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="${getStatusStyle(message.status)} padding:0.375rem 0.75rem; border-radius:6px; font-size:0.75rem; font-weight:500;">
                    ${message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                </span>
                <span style="color:#6b7280; font-size:0.75rem; font-weight:500;">${message.senderEmail}</span>
            </div>
        </div>
    `).join('');
}

async function openMessage(messageId) {
    selectedMessageId = messageId;

    try {
        const response = await apiFetch(`/api/messages/${messageId}`);
        const result = await response.json();

        if (result.success) {
            const message = result.message;
            document.getElementById('modalTitle').textContent = message.subject;
            document.getElementById('modalContent').innerHTML = `
                <div style="margin-bottom:1.5rem;">
                    <strong>From:</strong> ${message.senderName} (${message.senderEmail})
                </div>
                <div style="margin-bottom:1.5rem;">
                    <strong>Date:</strong> ${formatMessageDate(message.createdAt)}
                </div>
                <div style="margin-bottom:1.5rem;">
                    <strong>Status:</strong> <span style="${getStatusStyle(message.status)} padding:0.25rem 0.5rem; border-radius:4px; font-size:0.75rem; font-weight:500;">
                        ${message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                </div>
                <div style="border-top:1px solid #e5e7eb; padding-top:1.5rem;">
                    <strong>Message:</strong>
                    <div style="margin-top:0.5rem; padding:1rem; background:#f8fafc; border-radius:8px; white-space:pre-wrap;">${message.message}</div>
                </div>
            `;
            document.getElementById('messageModal').style.display = 'flex';

            if (message.status === 'unread') {
                await updateMessageStatusAPI(messageId, 'read');
            }
        } else {
            showAdminMessage('Failed to load message details', 'error');
        }
    } catch (error) {
        console.error('Error opening message:', error);
        showAdminMessage('Network error loading message', 'error');
    }
}

function closeMessage() {
    document.getElementById('messageModal').style.display = 'none';
    selectedMessageId = null;
}

async function updateMessageStatusAPI(messageId, status) {
    try {
        const response = await apiFetch(`/api/messages/${messageId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });

        const result = await response.json();

        if (result.success) {
            loadMessages(currentFilter);
            return true;
        } else {
            showAdminMessage('Failed to update message status', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error updating message status:', error);
        showAdminMessage('Network error updating message', 'error');
        return false;
    }
}

async function markAsRead() {
    if (selectedMessageId && await updateMessageStatusAPI(selectedMessageId, 'read')) {
        closeMessage();
        showAdminMessage('Message marked as read', 'success');
    }
}

async function archiveMessage() {
    if (selectedMessageId && await updateMessageStatusAPI(selectedMessageId, 'archived')) {
        closeMessage();
        showAdminMessage('Message archived', 'success');
    }
}

async function deleteMessage() {
    if (selectedMessageId && await showConfirmModal('Are you sure you want to delete this message?')) {
        try {
            const response = await apiFetch(`/api/messages/${selectedMessageId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                closeMessage();
                loadMessages(currentFilter);
                showAdminMessage('Message deleted successfully', 'success');
            } else {
                showAdminMessage('Failed to delete message', 'error');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showAdminMessage('Network error deleting message', 'error');
        }
    }
}

function replyToMessage() {
    if (selectedMessageId) {
        const message = currentMessages.find(m => m.id === selectedMessageId);
        if (message) {
            const emailUrl = `mailto:${message.senderEmail}?subject=Re: ${message.subject}`;
            window.open(emailUrl, '_blank');
        }
    }
}

async function searchMessages(query) {
    if (!query.trim()) {
        loadMessages(currentFilter);
        return;
    }

    try {
        const response = await apiFetch(`/api/messages/search?query=${encodeURIComponent(query)}`);
        const result = await response.json();

        if (result.success) {
            renderMessages(result.messages);
        } else {
            showAdminMessage('Search failed', 'error');
        }
    } catch (error) {
        console.error('Error searching messages:', error);
        showAdminMessage('Network error during search', 'error');
    }
}

function sortMessages(criteria) {
    console.log('Sorting by:', criteria);
    if (criteria === 'all') {
        loadMessages('all');
    } else {
        loadMessages(criteria);
    }
}

function updateMessageCounts(unreadCount, totalCount) {
    const allCountEl = document.getElementById('allCount');
    const unreadCountEl = document.getElementById('unreadCount');
    const readCountEl = document.getElementById('readCount');
    const archivedCountEl = document.getElementById('archivedCount');

    if (allCountEl) allCountEl.textContent = totalCount;
    if (unreadCountEl) unreadCountEl.textContent = unreadCount;
    if (readCountEl) readCountEl.textContent = '0';
    if (archivedCountEl) archivedCountEl.textContent = '0';
}

function formatMessageDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function getStatusStyle(status) {
    const styles = {
        'unread': 'background:#fef3c7; color:#d97706;',
        'read': 'background:#dcfce7; color:#16a34a;',
        'archived': 'background:#e5e7eb; color:#6b7280;'
    };
    return styles[status] || styles.read;
}

async function showAdminMessage(message, type) {
    await showAlertModal(`${type.toUpperCase()}: ${message}`, 'Notice', type);
}

async function composeMessage() {
    await showAlertModal('Compose message functionality would open here');
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
    'companies': document.getElementById('companies'),
    'settings': document.getElementById('settings')
};

function showPage(pageId) {
    Object.values(pages).forEach(page => {
        if (page) page.style.display = 'none';
    });

    document.querySelectorAll('aside .sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    if (pages[pageId]) {
        pages[pageId].style.display = 'block';

        if (pageId === 'messages') {
            initializeMessagesSection();
        } else if (pageId === 'events') {
            loadEventsByTab('upcoming');
        } else if (pageId === 'profile') {
            loadAdminProfile();
            loadProfileSettings();
        } else if (pageId === 'companies') {
            loadCompanies();
        }
    }
}

function setupPageNavigation() {
    showPage('dashboard');
}

// =============================================
// 3. ADMIN PROFILE MANAGEMENT
// =============================================

async function fetchAdminProfile(adminId) {
    try {
        const response = await apiFetch(`/api/admins/${adminId}`);
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

async function updateAdminProfileAPI(profileData) {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        const user = JSON.parse(currentUser);

        const response = await apiFetch(`/api/admins/${user.id}/update`, {
            method: 'PUT',
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

async function changeAdminPasswordAPI(passwordData) {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        const user = JSON.parse(currentUser);

        const response = await apiFetch(`/api/admins/${user.id}/change-password`, {
            method: 'POST',
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

        updateProfileForm(adminData);

    } catch (error) {
        console.error('Error loading admin profile:', error);
        const userData = JSON.parse(currentUser);
        if (userData.adminData) {
            loadStoredAdminData(userData.adminData);
            updateProfileForm(userData.adminData);
        }
    }
}

function updateProfileForm(adminData) {
    const profileName = document.getElementById('profileName');
    const profileEmailDisplay = document.getElementById('profileEmailDisplay');
    const profilePhoneDisplay = document.getElementById('profilePhoneDisplay');
    const profileLocationDisplay = document.getElementById('profileLocationDisplay');

    if (profileName) profileName.textContent = adminData.adminName || 'Administrator';
    if (profileEmailDisplay) profileEmailDisplay.textContent = adminData.emailAddress || 'Not specified';
    if (profilePhoneDisplay) profilePhoneDisplay.textContent = adminData.phoneNumber || 'Not specified';
    if (profileLocationDisplay) profileLocationDisplay.textContent = adminData.city || 'Not specified';

    const adminIdElement = document.querySelector('#profileInfo p:nth-child(2)');
    if (adminIdElement && adminData.adminId) {
        adminIdElement.textContent = `Admin ID: ADM-${adminData.adminId}`;
    }

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

// =============================================
// 3b. PROFILE EVENT HANDLERS
// =============================================

function initializeProfilePage() {
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', handleProfileSave);
    }

    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener('click', handleProfileCancel);
    }

    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handlePasswordChange);
    }

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', handleSettingsSave);
    }

    const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
    if (resetDefaultsBtn) {
        resetDefaultsBtn.addEventListener('click', handleResetDefaults);
    }

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

        if (!profileData.adminName) {
            await showAlertModal('Please enter your full name');
            return;
        }

        if (!profileData.emailAddress) {
            await showAlertModal('Please enter your email address');
            return;
        }

        const result = await updateAdminProfileAPI(profileData);

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
    const currentPassword = await showPromptModal('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = await showPromptModal('Enter your new password:');
    if (!newPassword) return;

    const confirmPassword = await showPromptModal('Confirm your new password:');
    if (!confirmPassword) return;

    if (newPassword !== confirmPassword) {
        await showAlertModal('New passwords do not match!');
        return;
    }

    if (newPassword.length < 6) {
        await showAlertModal('Password must be at least 6 characters long');
        return;
    }

    try {
        const passwordData = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        const result = await changeAdminPasswordAPI(passwordData);

        if (result.success) {
            await showAlertModal('Password changed successfully!');
        } else {
            await showAlertModal('Failed to change password: ' + result.error);
        }
    } catch (error) {
        await showAlertModal('Error changing password: ' + error.message);
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

async function handleResetDefaults() {
    if (await showConfirmModal('Are you sure you want to reset all settings to defaults?')) {
        const emailToggle = document.getElementById('emailToggle');
        if (emailToggle) {
            emailToggle.checked = true;
        }

        localStorage.removeItem('adminSettings');
        showMessage('Settings reset to defaults', 'info');
    }
}

async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        await showAlertModal('Please select an image file');
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        await showAlertModal('Image size should be less than 2MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
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

async function registerStudent() {
    const requiredFields = ['admissionNumber', 'firstName', 'lastName'];
    const missingFields = [];

    requiredFields.forEach(field => {
        const el = document.getElementById(field);
        const value = el ? el.value.trim() : '';
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
        await showAlertModal('Please fill in all required fields: ' + missingFields.map(field => fieldNames[field] || field).join(', '));
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
        resumeLink: null,
        photographLink: null
    };

    // Validation
    if (studentData.cgpa && (studentData.cgpa < 0 || studentData.cgpa > 10)) {
        await showAlertModal('CGPA must be between 0 and 10');
        return;
    }

    if (studentData.tenthPercentage && (studentData.tenthPercentage < 0 || studentData.tenthPercentage > 100)) {
        await showAlertModal('10th Percentage must be between 0 and 100');
        return;
    }

    if (studentData.twelfthPercentage && (studentData.twelfthPercentage < 0 || studentData.twelfthPercentage > 100)) {
        await showAlertModal('12th Percentage must be between 0 and 100');
        return;
    }

    if (studentData.backLogsCount < 0) {
        await showAlertModal('Backlogs count cannot be negative');
        return;
    }

    if (studentData.emailId && !isValidEmail(studentData.emailId)) {
        await showAlertModal('Please enter a valid email address');
        return;
    }

    if (studentData.collegeEmailId && !isValidEmail(studentData.collegeEmailId)) {
        await showAlertModal('Please enter a valid college email address');
        return;
    }

    if (studentData.mobileNo && !isValidMobile(studentData.mobileNo)) {
        await showAlertModal('Please enter a valid 10-digit mobile number');
        return;
    }

    const registerBtn = document.getElementById('registerBtn');
    const originalText = registerBtn.textContent;
    registerBtn.textContent = 'Registering...';
    registerBtn.disabled = true;

    try {
        const response = await apiFetch('/api/students/register', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        await showAlertModal('Student registered successfully!');

        // Reset form fields
        const formFields = [
            'admissionNumber', 'firstName', 'lastName', 'fatherName', 'motherName',
            'dateOfBirth', 'gender', 'mobileNo', 'emailId', 'collegeEmailId',
            'department', 'batch', 'cgpa', 'tenthPercentage', 'twelfthPercentage',
            'backLogsCount', 'address', 'course', 'universityRollNo', 'enrollmentNo'
        ];
        formFields.forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el) el.value = '';
        });

    } catch (error) {
        console.error('Full error details:', error);
        await showAlertModal('Registration failed: ' + error.message);
    } finally {
        registerBtn.textContent = originalText;
        registerBtn.disabled = false;
    }
}

// =============================================
// 5. BULK UPLOAD
// =============================================

function setupBulkUpload() {
    const fileInput = document.getElementById('bulkFileInput');
    const uploadArea = document.getElementById('uploadArea');

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
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
    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadArea.style.background = '#f8fafc';
        uploadArea.style.borderColor = '#3b82f6';
    });

    uploadArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        uploadArea.style.background = '';
        uploadArea.style.borderColor = '';
    });

    uploadArea.addEventListener('drop', function (e) {
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
    let originalText = '';
    if (uploadBtn) {
        originalText = uploadBtn.textContent;
        uploadBtn.textContent = 'Processing...';
        uploadBtn.disabled = true;
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiFetch('/api/students/bulk-upload', {
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
// 6. EVENTS MANAGEMENT
// =============================================

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
        const response = await apiFetch(url);

        if (response.ok) {
            const events = await response.json();
            await updateEventCards(events);
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
        const response = await apiFetch('/api/events');
        if (response.ok) {
            const allEvents = await response.json();
            const filteredEvents = filterEventsByDate(allEvents, tabType);
            await updateEventCards(filteredEvents);
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

        switch (tabType) {
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

async function showEventForm() {
    const form = document.getElementById('event-creation-form');
    const eventCards = document.getElementById('eventCards');

    if (!form || !eventCards) {
        await showAlertModal('Form element not found!');
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
        eligibleDepartments: selectedDepartments || null
    };

    if (!eventData.eventName || !eventData.organizingCompany || !eventData.registrationStart ||
        !eventData.registrationEnd || !eventData.eventDescription) {
        await showAlertModal('Please fill in all required fields');
        return;
    }

    const regStart = new Date(eventData.registrationStart);
    const regEnd = new Date(eventData.registrationEnd);

    if (regEnd <= regStart) {
        await showAlertModal('Registration end date must be after registration start date');
        return;
    }

    try {
        const response = await apiFetch('/api/events/create', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            await showAlertModal('Event created successfully!');
            closeEventForm();

            const activeTab = document.querySelector('.event-tab[style*="background: linear-gradient"]');
            if (activeTab) {
                const tabText = activeTab.textContent.toLowerCase().trim();
                const tabType = tabText.includes('upcoming') ? 'upcoming' :
                    tabText.includes('ongoing') ? 'ongoing' : 'past';
                await loadEventsByTab(tabType);
            } else {
                await loadEventsByTab('upcoming');
            }
        } else {
            const error = await response.text();
            await showAlertModal('Error creating event: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        await showAlertModal('Failed to create event: ' + error.message);
    }
}

function getSelectedDepartments() {
    const checkboxes = document.querySelectorAll('input[name="eligibleDepartments"]:checked');
    const departments = Array.from(checkboxes).map(cb => cb.value);
    return departments.length > 0 ? departments : null;
}

// --- REPLACED: Now async, fetches eligible/registered counts for each event ---
async function updateEventCards(events) {
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

    const cardPromises = events.map(async (event) => {
        const [eligibleCount, registeredCount] = await Promise.all([
            fetchEligibleCount(event),
            fetchRegisteredCount(event.eventId)
        ]);
        return createEventCard(event, eligibleCount, registeredCount);
    });

    const cards = await Promise.all(cardPromises);
    cards.forEach(card => eventCardsContainer.appendChild(card));
}

function createEventCard(event, eligibleCount, registeredCount) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.style = 'background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; transition: all 0.3s ease;';
    card.onmouseover = function () {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    };
    card.onmouseout = function () {
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

    const companyInitial = event.organizingCompany ? event.organizingCompany.charAt(0).toUpperCase() : 'C';
    const safeEventId = String(event.eventId).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    const regPercent = eligibleCount > 0 ? Math.min(100, Math.round((registeredCount / eligibleCount) * 100)) : 0;
    let progressColor = '#3b82f6';
    if (regPercent >= 80) progressColor = '#10b981';
    else if (regPercent >= 50) progressColor = '#f59e0b';
    else if (regPercent >= 25) progressColor = '#3b82f6';
    else progressColor = '#6b7280';

    card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">
                ${companyInitial}
            </div>
            <div style="flex: 1;">
                <h3 style="margin: 0 0 0.25rem 0; color: #1e293b; font-size: 1.125rem; font-weight: 600;">${event.organizingCompany || 'Unknown'}</h3>
                <p style="margin: 0; color: #64748b; font-size: 0.875rem;">${event.jobRole || 'Not specified'}</p>
            </div>
            <span style="${statusStyle} padding: 0.375rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">${statusText}</span>
        </div>

        <div style="margin-bottom: 1rem;">
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>Event:</strong> ${event.eventName || 'N/A'}</p>
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>Reg Start:</strong> ${regStart}</p>
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>Reg End:</strong> ${regEnd}</p>
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>Mode:</strong> ${event.eventMode || 'N/A'}</p>
            <p style="margin: 0 0 0.5rem 0; color: #374151; font-size: 0.875rem;"><strong>CGPA:</strong> ${event.expectedCgpa || 'No barrier'}</p>
            <p style="margin: 0; color: #374151; font-size: 0.875rem;"><strong>Package:</strong> ${event.expectedPackage ? '₹' + event.expectedPackage + ' LPA' : 'Not specified'}</p>
        </div>

        <!-- Eligible / Registered Counts -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #0369a1;">${eligibleCount}</div>
                    <div style="font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Eligible</div>
                </div>
                <div style="width: 1px; height: 40px; background: #bae6fd;"></div>
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #16a34a;">${registeredCount}</div>
                    <div style="font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Registered</div>
                </div>
                <div style="width: 1px; height: 40px; background: #bae6fd;"></div>
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #7c3aed;">${regPercent}%</div>
                    <div style="font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Fill Rate</div>
                </div>
            </div>
            <div style="height: 6px; background: #e0e7ff; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ${regPercent}%; background: ${progressColor}; border-radius: 3px; transition: width 1s ease;"></div>
            </div>
        </div>

        <div style="display: flex; gap: 0.5rem;">
            <button onclick="viewEvent('${safeEventId}')" style="flex: 1; background: #3b82f6; color: white; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500;">View</button>
            <button onclick="editEvent('${safeEventId}')" style="flex: 1; background: #f59e0b; color: white; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500;">Edit</button>
            <button onclick="openDriveStats('${safeEventId}', '${(event.eventName || '').replace(/'/g, "\\'")}', '${(event.organizingCompany || '').replace(/'/g, "\\'")}')" style="flex: 1; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600; box-shadow: 0 2px 4px rgba(124,58,237,0.3);">
                Drive Stats
            </button>
            <button onclick="manageStudents('${safeEventId}')" style="flex: 1; background: #10b981; color: white; padding: 0.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 500;">Manage</button>
        </div>
    `;

    return card;
}

async function viewEvent(eventId) {
    try {
        const response = await apiFetch(`/api/events/${eventId}`);
        if (response.ok) {
            const event = await response.json();
            await showAlertModal(`Event Details:\nName: ${event.eventName}\nCompany: ${event.organizingCompany}\nDescription: ${event.eventDescription}`);
        }
    } catch (error) {
        console.error('Error viewing event:', error);
    }
}

async function editEvent(eventId) {
    await showAlertModal('Edit event with ID: ' + eventId);
}

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
// 6b. NEW HELPER FUNCTIONS (Eligible/Registered counts)
// =============================================

async function fetchEligibleCount(event) {
    try {
        const queryParams = new URLSearchParams();
        if (event.expectedCgpa) queryParams.append('minCgpa', event.expectedCgpa);
        if (event.eligibleDepartments) {
            let depts = event.eligibleDepartments;
            if (typeof depts === 'string') {
                try { depts = JSON.parse(depts); } catch (e) { depts = []; }
            }
            if (Array.isArray(depts) && depts.length > 0) {
                queryParams.append('department', depts[0]);
            }
        }

        const response = await apiFetch(`/api/students/filter?${queryParams}`);
        if (response.ok) {
            const students = await response.json();
            return Array.isArray(students) ? students.length : 0;
        }
        return 0;
    } catch (error) {
        console.error('Error fetching eligible count:', error);
        return 0;
    }
}

async function fetchRegisteredCount(eventId) {
    try {
        const response = await apiFetch(`/api/participations/event/${eventId}`);
        if (response.ok) {
            const participations = await response.json();
            return Array.isArray(participations) ? participations.length : 0;
        }
        return 0;
    } catch (error) {
        console.error('Error fetching registered count for event', eventId, ':', error);
        return 0;
    }
}

// Add this to fetchDriveStats to resolve student names
async function fetchDriveStats(eventId) {
    try {
        const response = await apiFetch(`/api/participations/event/${eventId}`);
        if (!response.ok) {
            return { registered: 0, oaSent: 0, interview: 0, selected: 0, rejected: 0, total: 0, participations: [] };
        }
        const participations = await response.json();

        // If student names are missing, fetch them individually
        const needsStudentData = participations.some(p => {
            const s = p.student || {};
            return !s.studentFirstName && !p.studentFirstName && !p.firstName;
        });

        if (needsStudentData) {
            // Batch fetch all students
            try {
                const studentsResponse = await apiFetch('/api/students');
                if (studentsResponse.ok) {
                    const allStudents = await studentsResponse.json();
                    const studentMap = {};
                    allStudents.forEach(s => {
                        studentMap[s.studentAdmissionNumber] = s;
                    });

                    // Attach student data to participations
                    participations.forEach(p => {
                        const admNo = p.studentAdmissionNumber || (p.student && p.student.studentAdmissionNumber);
                        if (admNo && studentMap[admNo]) {
                            p.student = studentMap[admNo];
                        }
                    });
                }
            } catch (e) {
                console.warn('Could not fetch student details:', e);
            }
        }

        const stats = {
            registered: 0, oaSent: 0, interview: 0, selected: 0, rejected: 0,
            total: participations.length, participations: participations
        };

        participations.forEach(p => {
            const status = (p.participationStatus || p.status || 'REGISTERED').toUpperCase();
            switch (status) {
                case 'REGISTERED': stats.registered++; break;
                case 'OA_SENT': case 'ATTEMPTED': stats.oaSent++; break;
                case 'INTERVIEW': stats.interview++; break;
                case 'SELECTED': stats.selected++; break;
                case 'REJECTED': case 'ABSENT': stats.rejected++; break;
                default: stats.registered++; break;
            }
        });

        return stats;
    } catch (error) {
        console.error('Error fetching drive stats:', error);
        return { registered: 0, oaSent: 0, interview: 0, selected: 0, rejected: 0, total: 0, participations: [] };
    }
}

// =============================================
// 6c. DRIVE STATS MODAL (FIXED)
// =============================================

async function openDriveStats(eventId, eventName, companyName) {
    const loadingModalHtml = `
        <div class="modal-overlay active" id="driveStatsModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:2rem;">
            <div style="background:white; border-radius:16px; width:100%; max-width:750px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="display:flex; align-items:center; justify-content:center; padding:3rem;">
                    <div style="text-align:center; color:#64748b;">
                        <span class="material-symbols-outlined" style="font-size:3rem; display:block; margin-bottom:1rem; animation:spin 1s linear infinite;">refresh</span>
                        <h3 style="margin:0;">Loading Drive Statistics...</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingModalHtml);

    try {
        const stats = await fetchDriveStats(eventId);
        const modal = document.getElementById('driveStatsModal');
        if (!modal) return;

        const funnelStages = [
            { label: 'Registered', count: stats.total, color: '#3b82f6', bgColor: '#dbeafe' },
            { label: 'OA Sent', count: stats.oaSent, color: '#f59e0b', bgColor: '#fef3c7' },
            { label: 'Interview', count: stats.interview, color: '#8b5cf6', bgColor: '#ede9fe' },
            { label: 'Selected', count: stats.selected, color: '#10b981', bgColor: '#dcfce7' },
            { label: 'Rejected', count: stats.rejected, color: '#ef4444', bgColor: '#fee2e2' }
        ];

        const maxCount = Math.max(stats.total, 1);

        // FIX 1: Removed ${stage.icon} — no icon property exists
        const funnelHtml = funnelStages.map(stage => {
            const widthPercent = Math.max(20, Math.round((stage.count / maxCount) * 100));
            return `
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.75rem;">
                    <div style="width:100px; text-align:right; font-size:0.8rem; font-weight:600; color:#374151;">
                        ${stage.label}
                    </div>
                    <div style="flex:1; position:relative;">
                        <div style="height:36px; background:${stage.bgColor}; border-radius:8px; overflow:hidden; border:1px solid ${stage.color}20;">
                            <div style="height:100%; width:${widthPercent}%; background:linear-gradient(135deg, ${stage.color}dd, ${stage.color}); border-radius:7px; display:flex; align-items:center; justify-content:center; transition:width 1s ease; min-width:40px;">
                                <span style="color:white; font-weight:700; font-size:0.875rem; text-shadow:0 1px 2px rgba(0,0,0,0.2);">${stage.count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const oaRate = stats.total > 0 ? Math.round((stats.oaSent / stats.total) * 100) : 0;
        const interviewRate = stats.oaSent > 0 ? Math.round((stats.interview / stats.oaSent) * 100) : 0;
        const selectionRate = stats.total > 0 ? Math.round((stats.selected / stats.total) * 100) : 0;

        modal.innerHTML = `
            <div style="background:white; border-radius:16px; width:100%; max-width:750px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:1.5rem 2rem; border-bottom:1px solid #e5e7eb; background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius:16px 16px 0 0;">
                    <div>
                        <h3 style="margin:0 0 0.25rem 0; font-size:1.25rem; font-weight:700; color:#1e293b;">Drive Statistics</h3>
                        <p style="margin:0; color:#64748b; font-size:0.875rem;">${companyName} — ${eventName}</p>
                    </div>
                    <button onclick="closeDriveStats()" style="background:none; border:none; font-size:1.5rem; color:#64748b; cursor:pointer; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:8px;">×</button>
                </div>

                <div style="padding:1.5rem 2rem;">
                    <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:0.75rem; margin-bottom:2rem;">
                        <div style="text-align:center; padding:1rem 0.5rem; background:#dbeafe; border-radius:12px; border:1px solid #93c5fd;">
                            <div style="font-size:1.5rem; font-weight:800; color:#1d4ed8;">${stats.total}</div>
                            <div style="font-size:0.65rem; color:#1e40af; font-weight:600; text-transform:uppercase;">Total</div>
                        </div>
                        <div style="text-align:center; padding:1rem 0.5rem; background:#fef3c7; border-radius:12px; border:1px solid #fcd34d;">
                            <div style="font-size:1.5rem; font-weight:800; color:#b45309;">${stats.oaSent}</div>
                            <div style="font-size:0.65rem; color:#92400e; font-weight:600; text-transform:uppercase;">OA Sent</div>
                        </div>
                        <div style="text-align:center; padding:1rem 0.5rem; background:#ede9fe; border-radius:12px; border:1px solid #c4b5fd;">
                            <div style="font-size:1.5rem; font-weight:800; color:#6d28d9;">${stats.interview}</div>
                            <div style="font-size:0.65rem; color:#5b21b6; font-weight:600; text-transform:uppercase;">Interview</div>
                        </div>
                        <div style="text-align:center; padding:1rem 0.5rem; background:#dcfce7; border-radius:12px; border:1px solid #86efac;">
                            <div style="font-size:1.5rem; font-weight:800; color:#16a34a;">${stats.selected}</div>
                            <div style="font-size:0.65rem; color:#166534; font-weight:600; text-transform:uppercase;">Selected</div>
                        </div>
                        <div style="text-align:center; padding:1rem 0.5rem; background:#fee2e2; border-radius:12px; border:1px solid #fca5a5;">
                            <div style="font-size:1.5rem; font-weight:800; color:#dc2626;">${stats.rejected}</div>
                            <div style="font-size:0.65rem; color:#991b1b; font-weight:600; text-transform:uppercase;">Rejected</div>
                        </div>
                    </div>

                    <div style="background:#f8fafc; border-radius:12px; padding:1.5rem; border:1px solid #e2e8f0; margin-bottom:1.5rem;">
                        <h4 style="margin:0 0 1rem 0; color:#1e293b; font-size:1rem; font-weight:600;">Recruitment Funnel</h4>
                        ${funnelHtml}
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; margin-bottom:1.5rem;">
                        <div style="background:white; border:1px solid #e2e8f0; border-radius:10px; padding:1rem; text-align:center;">
                            <div style="font-size:1.25rem; font-weight:700; color:#f59e0b;">${oaRate}%</div>
                            <div style="font-size:0.7rem; color:#64748b; font-weight:500;">OA Conversion</div>
                        </div>
                        <div style="background:white; border:1px solid #e2e8f0; border-radius:10px; padding:1rem; text-align:center;">
                            <div style="font-size:1.25rem; font-weight:700; color:#8b5cf6;">${interviewRate}%</div>
                            <div style="font-size:0.7rem; color:#64748b; font-weight:500;">Interview Conversion</div>
                        </div>
                        <div style="background:white; border:1px solid #e2e8f0; border-radius:10px; padding:1rem; text-align:center;">
                            <div style="font-size:1.25rem; font-weight:700; color:#10b981;">${selectionRate}%</div>
                            <div style="font-size:0.7rem; color:#64748b; font-weight:500;">Selection Rate</div>
                        </div>
                    </div>

                    ${stats.participations.length > 0 ? `
                    <div style="background:white; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; margin-bottom:1rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.5rem; background:#1a1a1a; color:white;">
                            <h4 style="margin:0; font-size:0.9rem; font-weight:600;">Student Participation Details</h4>
                            <select id="driveStatsFilter" onchange="filterDriveStatsTable(this.value)" style="padding:0.375rem 0.75rem; border-radius:6px; border:1px solid #4b5563; background:#374151; color:white; font-size:0.75rem; cursor:pointer;">
                                <option value="all">All Status</option>
                                <option value="REGISTERED">Registered</option>
                                <option value="OA_SENT">OA Sent</option>
                                <option value="INTERVIEW">Interview</option>
                                <option value="SELECTED">Selected</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                        <div style="max-height:300px; overflow-y:auto;">
                            <table style="width:100%; border-collapse:collapse;" id="driveStatsTable">
                                <thead>
                                    <tr style="background:#f8fafc; position:sticky; top:0;">
                                        <th style="padding:0.75rem 1rem; text-align:left; font-size:0.75rem; font-weight:600; color:#374151; border-bottom:1px solid #e5e7eb;">Student</th>
                                        <th style="padding:0.75rem 1rem; text-align:left; font-size:0.75rem; font-weight:600; color:#374151; border-bottom:1px solid #e5e7eb;">Admission No</th>
                                        <th style="padding:0.75rem 1rem; text-align:left; font-size:0.75rem; font-weight:600; color:#374151; border-bottom:1px solid #e5e7eb;">Status</th>
                                        <th style="padding:0.75rem 1rem; text-align:left; font-size:0.75rem; font-weight:600; color:#374151; border-bottom:1px solid #e5e7eb;">Registered On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.participations.map(p => {
                                        // FIX 2: Robust student name resolution
                                        // Try nested student object first, then top-level fields
                                        const student = p.student || {};
                                        const firstName = student.studentFirstName || p.studentFirstName || p.firstName || '';
                                        const lastName = student.studentLastName || p.studentLastName || p.lastName || '';
                                        const studentName = (firstName + ' ' + lastName).trim();

                                        const admNo = student.studentAdmissionNumber
                                            || p.studentAdmissionNumber
                                            || p.admissionNumber
                                            || 'N/A';

                                        const status = (p.participationStatus || p.status || 'REGISTERED').toUpperCase();

                                        const registeredDate = (p.createdAt || p.registeredAt)
                                            ? new Date(p.createdAt || p.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : 'N/A';

                                        const statusColors = {
                                            'REGISTERED': 'background:#dbeafe; color:#1d4ed8;',
                                            'OA_SENT': 'background:#fef3c7; color:#b45309;',
                                            'ATTEMPTED': 'background:#fef3c7; color:#b45309;',
                                            'INTERVIEW': 'background:#ede9fe; color:#6d28d9;',
                                            'SELECTED': 'background:#dcfce7; color:#16a34a;',
                                            'REJECTED': 'background:#fee2e2; color:#dc2626;',
                                            'ABSENT': 'background:#f3f4f6; color:#374151;'
                                        };
                                        const sStyle = statusColors[status] || statusColors['REGISTERED'];

                                        // Use admission number as fallback display name
                                        const displayName = studentName || admNo || 'Unknown';

                                        return `
                                            <tr data-status="${status}" style="transition:all 0.2s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                                                <td style="padding:0.625rem 1rem; border-bottom:1px solid #f1f5f9; font-size:0.8rem; font-weight:500; color:#1e293b;">${displayName}</td>
                                                <td style="padding:0.625rem 1rem; border-bottom:1px solid #f1f5f9; font-size:0.8rem; color:#64748b;">${admNo}</td>
                                                <td style="padding:0.625rem 1rem; border-bottom:1px solid #f1f5f9;">
                                                    <span style="${sStyle} padding:0.25rem 0.625rem; border-radius:6px; font-size:0.7rem; font-weight:600;">${status}</span>
                                                </td>
                                                <td style="padding:0.625rem 1rem; border-bottom:1px solid #f1f5f9; font-size:0.8rem; color:#64748b;">${registeredDate}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : `
                    <div style="text-align:center; padding:2rem; color:#64748b; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0;">
                        <span class="material-symbols-outlined" style="font-size:2.5rem; display:block; margin-bottom:0.5rem; opacity:0.5;">group_off</span>
                        <h4 style="margin:0 0 0.25rem 0;">No Participants Yet</h4>
                        <p style="margin:0; font-size:0.875rem;">No students have registered for this event.</p>
                    </div>
                    `}
                </div>

                <div style="display:flex; align-items:center; justify-content:flex-end; gap:1rem; padding:1.25rem 2rem; border-top:1px solid #e5e7eb; background:#f8fafc; border-radius:0 0 16px 16px;">
                    <button onclick="exportDriveStats('${eventId.replace(/'/g, "\\'")}')" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; padding:0.75rem 1.5rem; border:none; border-radius:8px; font-weight:600; font-size:0.875rem; cursor:pointer; box-shadow:0 2px 8px rgba(16,185,129,0.3); display:flex; align-items:center; gap:0.5rem;">
                        <span class="material-symbols-outlined" style="font-size:1.1rem;">download</span>
                        Export Excel
                    </button>
                    <button onclick="closeDriveStats()" style="background:#f1f5f9; color:#64748b; padding:0.75rem 1.5rem; border:1px solid #e2e8f0; border-radius:8px; font-weight:600; font-size:0.875rem; cursor:pointer;">
                        Close
                    </button>
                </div>
            </div>
        `;

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeDriveStats();
        });

    } catch (error) {
        console.error('Error opening drive stats:', error);
        closeDriveStats();
        await showAlertModal('Error loading drive statistics. Please try again.');
    }
}

function closeDriveStats() {
    const modal = document.getElementById('driveStatsModal');
    if (modal) modal.remove();
}

function filterDriveStatsTable(status) {
    const rows = document.querySelectorAll('#driveStatsTable tbody tr');
    rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        if (status === 'all' || rowStatus === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

async function exportDriveStats(eventId) {
    try {
        const response = await apiFetch(`/api/participations/event/${eventId}/export`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `drive_stats_${eventId}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return;
        }
    } catch (error) {
        console.warn('Backend export not available, falling back to CSV:', error);
    }

    // Fallback: Generate CSV from table data
    try {
        const stats = await fetchDriveStats(eventId);
        if (!stats.participations || stats.participations.length === 0) {
            await showAlertModal('No data to export.');
            return;
        }

        const headers = ['Student Name', 'Admission Number', 'Department', 'Batch', 'CGPA', 'Email', 'Mobile', 'Status', 'Registered Date'];
        const rows = stats.participations.map(p => {
            const s = p.student || {};
            const name = ((s.studentFirstName || '') + ' ' + (s.studentLastName || '')).trim();
            const admNo = s.studentAdmissionNumber || p.studentAdmissionNumber || '';
            const dept = s.department || '';
            const batch = s.batch || '';
            const cgpa = s.cgpa || '';
            const email = s.emailId || '';
            const mobile = s.mobileNo || '';
            const status = p.participationStatus || p.status || 'REGISTERED';
            const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '';
            return [name, admNo, dept, batch, cgpa, email, mobile, status, date];
        });

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `drive_stats_${eventId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Error exporting drive stats:', error);
        await showAlertModal('Failed to export. Please try again.');
    }
}

// =============================================
// 7. COMPANY MANAGEMENT
// =============================================

async function loadCompanies() {
    try {
        const response = await apiFetch('/api/companies');
        if (response.ok) {
            const companies = await response.json();
            updateCompanyTable(companies);
        }
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

function switchCompanyTab(button, tabType) {
    const tabs = document.querySelectorAll('.company-tab');
    tabs.forEach(tab => {
        tab.style.background = 'transparent';
        tab.style.color = '#64748b';
        tab.style.fontWeight = '500';
        tab.style.boxShadow = 'none';
    });

    button.style.background = 'white';
    button.style.color = '#1e293b';
    button.style.fontWeight = '600';
    button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

    const tabContents = document.querySelectorAll('.company-tab-content');
    tabContents.forEach(tab => tab.style.display = 'none');

    switch (tabType) {
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

function updateCompanyTable(companies) {
    const tableBody = document.querySelector('#company-directory tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    companies.forEach(company => {
        const row = document.createElement('tr');
        row.style.transition = 'all 0.2s ease';
        row.onmouseover = function () { this.style.background = '#f8fafc'; };
        row.onmouseout = function () { this.style.background = 'white'; };

        const companyInitial = company.companyName.charAt(0).toUpperCase();
        const safeCompanyId = String(company.companyId).replace(/'/g, "\\'").replace(/"/g, '&quot;');

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
                    <button onclick="viewCompanyDetails('${safeCompanyId}')" style="background:#3b82f6; color:white; padding:0.25rem 0.5rem; border:none; border-radius:4px; cursor:pointer; font-size:0.7rem; font-weight:500; white-space:nowrap;" title="View Details">View</button>
                    <button onclick="editCompany('${safeCompanyId}')" style="background:#f59e0b; color:white; padding:0.25rem 0.5rem; border:none; border-radius:4px; cursor:pointer; font-size:0.7rem; font-weight:500; white-space:nowrap;" title="Edit">Edit</button>
                    <button onclick="terminateCompany('${safeCompanyId}')" style="background:#dc2626; color:white; padding:0.25rem 0.5rem; border:none; border-radius:4px; cursor:pointer; font-size:0.7rem; font-weight:500; white-space:nowrap;" title="Terminate Access">Terminate</button>
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
        await showAlertModal('Please fill in all required fields');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyData.hrEmail)) {
        await showAlertModal('Please enter a valid email address');
        return;
    }

    try {
        const response = await apiFetch('/api/companies/create', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });

        if (response.ok) {
            const createdCompany = await response.json();
            await showAlertModal(`Company created successfully!\n\nCompany ID: ${createdCompany.companyId}\nPassword: ${companyData.password}\n\nPlease note these credentials for future reference.`);
            resetCompanyForm();
            switchCompanyTab(document.querySelector('.company-tab[onclick*="directory"]'), 'directory');
        } else {
            const errorText = await response.text();
            if (response.status === 400) {
                await showAlertModal('Error creating company: Company name or email already exists. Please use different details.');
            } else {
                await showAlertModal('Error creating company: ' + errorText);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        await showAlertModal('Failed to create company. Please check your connection and try again.');
    }
}

function resetCompanyForm() {
    const form = document.getElementById('addCompanyForm');
    if (form) form.reset();
}

async function terminateCompany(companyId) {
    if (await showConfirmModal('Are you sure you want to terminate this company\'s access? This action cannot be undone.')) {
        try {
            const response = await apiFetch(`/api/companies/${companyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await showAlertModal('Company access terminated successfully');
                loadCompanies();
            } else {
                await showAlertModal('Error terminating company access');
            }
        } catch (error) {
            console.error('Error:', error);
            await showAlertModal('Failed to terminate company: ' + error.message);
        }
    }
}

async function loadCompanyDrives() {
    try {
        const eventsResponse = await apiFetch('/api/events');
        const companiesResponse = await apiFetch('/api/companies');

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
        row.onmouseover = function () { this.style.background = '#f8fafc'; };
        row.onmouseout = function () { this.style.background = 'white'; };

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

function filterCompaniesByIndustry(industry) {
    console.log('Filter by industry:', industry);
}

function filterCompaniesByStatus(status) {
    console.log('Filter by status:', status);
}

async function exportCompanyList() {
    await showAlertModal('Export company list functionality');
}

async function viewCompanyDetails(companyId) {
    await showAlertModal('View details for company: ' + companyId);
}

async function editCompany(companyId) {
    await showAlertModal('Edit company: ' + companyId);
}

async function toggleCompanyStatus(companyName) {
    await showAlertModal('Toggle status for: ' + companyName);
}

async function approveCompany(companyName) {
    await showAlertModal('Approve company: ' + companyName);
}

async function rejectCompany(companyName) {
    await showAlertModal('Reject company: ' + companyName);
}

async function createNewDrive() {
    await showAlertModal('Create new drive functionality');
}

async function editDrive(driveId) {
    await showAlertModal('Edit drive: ' + driveId);
}

async function manageStudents(driveId) {
    await showAlertModal('Manage students for drive: ' + driveId);
}

async function viewResults(driveId) {
    await showAlertModal('View results for drive: ' + driveId);
}

// =============================================
// 8. ANALYTICS PLACEHOLDERS
// =============================================

function filterAnalyticsByYear(year) {
    console.log('Filter analytics by year:', year);
}

function filterAnalyticsByBranch(branch) {
    console.log('Filter analytics by branch:', branch);
}

async function exportAnalyticsReport() {
    await showAlertModal('Export analytics report');
}

async function exportReport(format) {
    await showAlertModal('Export report as ' + format);
}

async function exportCompanyReport(format) {
    await showAlertModal('Export company report as ' + format);
}

async function shareReport() {
    await showAlertModal('Share report functionality');
}

async function showPlacementDetails() {
    await showAlertModal('Show placement details');
}

async function showOfferDetails() {
    await showAlertModal('Show offer details');
}

async function showPackageDetails() {
    await showAlertModal('Show package details');
}

async function showTopOffers() {
    await showAlertModal('Show top offers');
}

async function showCompanyStats() {
    await showAlertModal('Show company stats');
}

async function showYearlyComparison() {
    await showAlertModal('Show yearly comparison');
}

// =============================================
// 9. UTILITY FUNCTIONS
// =============================================

function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    if (!messageContainer) {
        console.log(`[${type.toUpperCase()}] ${message}`);
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

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode === messageContainer) {
            messageContainer.removeChild(messageDiv);
        }
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidMobile(mobile) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
}

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

// =============================================
// 10. TAB SWITCHING
// =============================================

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

// =============================================
// 11. GLOBAL SEARCH
// =============================================

async function globalSearch(event) {
    if (event) event.preventDefault();
    const query = document.getElementById('globalSearchInput').value.trim();
    if (!query) return;
    await showAlertModal('Search for: ' + query + '\n\nGlobal search functionality coming soon.');
}

// =============================================
// 12. MOBILE MENU
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if (mobileMenu.style.display === 'none' || !mobileMenu.style.display) {
                mobileMenu.style.display = 'block';
            } else {
                mobileMenu.style.display = 'none';
            }
        });
    }
});

// =============================================
// 13. LOGOUT
// =============================================

async function logoutAdmin() {
    if (await showConfirmModal('Are you sure you want to logout?')) {
        apiFetch('/api/logout', { method: 'POST' })
            .then(() => {
                sessionStorage.clear();
                localStorage.removeItem('adminSettings');
                localStorage.removeItem('adminProfileImage');
                window.location.href = 'login_page.html';
            })
            .catch(() => {
                // Even if server logout fails, clear local and redirect
                sessionStorage.clear();
                localStorage.removeItem('adminSettings');
                localStorage.removeItem('adminProfileImage');
                window.location.href = 'login_page.html';
            });
    }
}

// =============================================
// 14. FORM HANDLERS (called from HTML onclick)
// =============================================

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

function handleFormSubmit(event) {
    event.preventDefault();
    registerStudent();
}

// =============================================
// 15. STUDENT HISTORY REPORT
// =============================================

let currentHistoryData = null;

async function searchStudentHistory() {
    const admissionInput = document.getElementById('historyAdmissionNumber');
    if (!admissionInput) return;

    const admissionNumber = admissionInput.value.trim();

    if (!admissionNumber) {
        showHistoryMessage('Please enter a student admission number', 'error');
        return;
    }

    // Hide previous results
    document.getElementById('historyStudentInfo').style.display = 'none';
    document.getElementById('historySummary').style.display = 'none';
    document.getElementById('historyTableContainer').style.display = 'none';

    // Show loading
    document.getElementById('historyLoading').style.display = 'block';

    try {
        const response = await apiFetch(`/api/reports/student/${encodeURIComponent(admissionNumber)}`);
        const result = await response.json();

        document.getElementById('historyLoading').style.display = 'none';

        if (!result.success) {
            showHistoryMessage(result.message || 'Student not found', 'error');
            return;
        }

        currentHistoryData = result;

        // Display student info
        displayHistoryStudentInfo(result.student);

        // Display summary
        displayHistorySummary(result.summary);

        // Display event table
        displayHistoryTable(result.events);

        if (result.events.length === 0) {
            showHistoryMessage('This student has not registered for any events yet.', 'info');
        } else {
            showHistoryMessage(`Found ${result.events.length} event(s) for this student`, 'success');
        }

    } catch (error) {
        document.getElementById('historyLoading').style.display = 'none';
        console.error('Error loading student history:', error);
        showHistoryMessage('Error loading report. Please try again.', 'error');
    }
}

function displayHistoryStudentInfo(student) {
    const container = document.getElementById('historyStudentInfo');
    container.style.display = 'block';

    const initials = ((student.name || '').split(' ').map(w => w[0] || '').join('')).toUpperCase() || 'ST';

    document.getElementById('historyStudentAvatar').textContent = initials;
    document.getElementById('historyStudentName').textContent = student.name || 'Unknown';
    document.getElementById('historyStudentDetails').textContent =
        `${student.department || 'N/A'} | Batch ${student.batch || 'N/A'} | CGPA: ${student.cgpa || 'N/A'} | ${student.course || ''} | 10th: ${student.tenthPercentage || 'N/A'}% | 12th: ${student.twelfthPercentage || 'N/A'}%`;
    document.getElementById('historyStudentEmail').textContent = student.email || 'No email';
    document.getElementById('historyStudentPhone').textContent = student.phone || 'No phone';
}

function displayHistorySummary(summary) {
    const container = document.getElementById('historySummary');
    container.style.display = 'block';

    document.getElementById('summaryEligible').textContent = summary.totalRegistered || 0;
    document.getElementById('summaryParticipated').textContent = summary.totalAttempted || 0;
    document.getElementById('summaryMissed').textContent = summary.totalAbsent || 0;
    document.getElementById('summarySelected').textContent = summary.totalSelected || 0;
    document.getElementById('summaryRate').textContent = summary.totalPending || 0;
}

function displayHistoryTable(events) {
    const container = document.getElementById('historyTableContainer');
    const tbody = document.getElementById('historyTableBody');

    container.style.display = 'block';
    tbody.innerHTML = '';

    if (!events || events.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 3rem; text-align: center; color: #64748b;">
                    <span class="material-symbols-outlined" style="font-size: 3rem; display: block; margin-bottom: 0.5rem; opacity: 0.5;">event_busy</span>
                    This student has not registered for any events yet.
                </td>
            </tr>
        `;
        return;
    }

    events.forEach(event => {
        const row = document.createElement('tr');
        row.setAttribute('data-status', event.status || 'REGISTERED');

        let eventDate = 'N/A';
        if (event.registrationStart) {
            try {
                eventDate = new Date(event.registrationStart).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
            } catch (e) { eventDate = 'N/A'; }
        }

        let registeredDate = 'N/A';
        if (event.registeredAt) {
            try {
                registeredDate = new Date(event.registeredAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
            } catch (e) { registeredDate = 'N/A'; }
        }

        const status = event.status || 'REGISTERED';

        row.innerHTML = `
            <td>
                <div class="history-company-cell">
                    <div class="history-company-logo">
                        ${(event.organizingCompany || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span class="history-company-name">${event.organizingCompany || 'Unknown'}</span>
                </div>
            </td>
            <td>${event.eventName || 'N/A'}</td>
            <td>${event.jobRole || 'Not specified'}</td>
            <td>${eventDate}</td>
            <td>${registeredDate}</td>
            <td>${event.expectedPackage ? '₹' + event.expectedPackage + ' LPA' : 'N/A'}</td>
            <td>
                <span class="history-status-badge ${status}">${status}</span>
            </td>
            <td>
                <span class="history-remarks" title="${event.description || ''}">${event.description || '-'}</span>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function filterHistory(type) {
    document.querySelectorAll('.history-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const btnId = type === 'all' ? 'filterAll' :
                  type === 'selected' ? 'filterSelected' :
                  type === 'pending' ? 'filterPending' :
                  type === 'rejected' ? 'filterRejected' : 'filterAll';

    const activeBtn = document.getElementById(btnId);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    const rows = document.querySelectorAll('#historyTableBody tr');
    rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        if (!rowStatus) {
            row.style.display = '';
            return;
        }

        if (type === 'all') {
            row.style.display = '';
        } else if (type === 'selected' && rowStatus === 'SELECTED') {
            row.style.display = '';
        } else if (type === 'pending' && (rowStatus === 'REGISTERED' || rowStatus === 'ATTEMPTED')) {
            row.style.display = '';
        } else if (type === 'rejected' && (rowStatus === 'REJECTED' || rowStatus === 'ABSENT')) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function showHistoryMessage(message, type) {
    const messageDiv = document.getElementById('historySearchMessage');
    if (!messageDiv) return;

    const colors = {
        error: { bg: '#fee2e2', color: '#dc2626', icon: 'error' },
        success: { bg: '#dcfce7', color: '#16a34a', icon: 'check_circle' },
        info: { bg: '#dbeafe', color: '#1d4ed8', icon: 'info' }
    };

    const style = colors[type] || colors.info;

    messageDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 8px; background: ${style.bg}; color: ${style.color};">
            <span class="material-symbols-outlined" style="font-size: 1.1rem;">${style.icon}</span>
            <span style="font-weight: 500; font-size: 0.875rem;">${message}</span>
        </div>
    `;
    messageDiv.style.display = 'block';

    setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
}

// Enter key support
document.addEventListener('DOMContentLoaded', function () {
    const historyInput = document.getElementById('historyAdmissionNumber');
    if (historyInput) {
        historyInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchStudentHistory();
            }
        });
    }
});