// Mobile menu toggle
        document.getElementById('mobile-menu-btn').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
        });

        // Page navigation
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.style.display = 'none';
            });
            
            // Show selected page
            document.getElementById(pageId).style.display = 'block';
            
            // Update active nav item
            document.querySelectorAll('.navbar-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Close mobile menu
            document.getElementById('mobile-menu').style.display = 'none';
            
            // Set the active nav item based on the page
            const navItems = document.querySelectorAll('.navbar-item');
            for (let item of navItems) {
                if (item.textContent.trim().toLowerCase().includes(pageId.toLowerCase().replace('studentFilter', 'filter').replace('bulkOperations', 'upload'))) {
                    item.classList.add('active');
                    break;
                }
            }
        }

        // Event form toggle
        document.getElementById('createRecruitment').addEventListener('click', function() {
            const eventForm = document.getElementById('eventForm');
            eventForm.style.display = eventForm.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('cancelEvent').addEventListener('click', function() {
            document.getElementById('eventForm').style.display = 'none';
        });

        // File upload
        document.getElementById('selectFileBtn').addEventListener('click', function() {
            document.getElementById('excelUpload').click();
        });

        // Global search function
        function globalSearch(event) {
            event.preventDefault();
            const query = document.getElementById('globalSearchInput').value;
            alert(`Searching for: ${query}`);
            // In a real implementation, you would perform a global search
        }

        // Logout function
        function logoutCompany() {
            if (confirm('Are you sure you want to logout?')) {
                alert('Logging out...');
                // In a real implementation, you would redirect to logout endpoint
            }
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            // Set the dashboard as active by default
            showPage('dashboard');
        });


// Function to load and display company profile
async function loadCompanyProfile() {
    const currentUser = sessionStorage.getItem('currentUser');

    if (!currentUser) {
        console.log('No user logged in');
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
            console.log('Using stored company data');
        } else {
            // Update session storage with fresh data
            user.companyData = companyData;
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }

        console.log('Loading company profile:', companyData);

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

// Update the DOMContentLoaded event listener in company_dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Set the dashboard as active by default
    showPage('dashboard');

    // Load company profile
    loadCompanyProfile();
});

// Also update the logout function to clear session
function logoutCompany() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session storage
        sessionStorage.removeItem('currentUser');
        // Redirect to login page
        window.location.href = 'login_page.html';
    }
}