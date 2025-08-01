// Admin JavaScript
const API_BASE_URL = 'http://localhost:3000/api';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return token;
}

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Show section function
function showSection(sectionId) {
    // Check auth first
    if (!checkAuth()) return;
    
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked link
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
    
    // Load section data
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'tours':
            loadTours();
            break;
        case 'cars':
            loadCars();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'links':
            loadLinks();
            break;
        case 'seo':
            loadSeoSettings();
            break;
        case 'popup':
            loadPopupSettings();
            break;
        case 'tracking':
            loadTrackingSettings();
            break;
        case 'password':
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            break;
    }
}

// Load dashboard data
async function loadDashboard() {
    try {
        // Load products count
        const productsRes = await fetch(`${API_BASE_URL}/products`);
        const products = await productsRes.json();
        document.getElementById('totalProducts').textContent = products.length;
        
        // Load tours count
        const toursRes = await fetch(`${API_BASE_URL}/tours`);
        const tours = await toursRes.json();
        document.getElementById('totalTours').textContent = tours.length;
        
        // Load cars count
        const carsRes = await fetch(`${API_BASE_URL}/cars`);
        const cars = await carsRes.json();
        document.getElementById('totalCars').textContent = cars.length;
        
        // Load bookings count (requires auth)
        const bookingsRes = await fetch(`${API_BASE_URL}/bookings`, {
            headers: getAuthHeaders()
        });
        if (bookingsRes.ok) {
            const bookings = await bookingsRes.json();
            document.getElementById('totalBookings').textContent = bookings.length;
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Products Management
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        const tbody = document.getElementById('productsTable');
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td><img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/50'"></td>
                <td><a href="${product.link}" target="_blank">Xem</a></td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})">Sửa</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Lỗi khi tải danh sách sản phẩm', 'error');
    }
}

function showProductForm() {
    document.getElementById('productForm').style.display = 'block';
    document.getElementById('productId').value = '';
    document.getElementById('productTitle').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productLink').value = '';
}

function hideProductForm() {
    document.getElementById('productForm').style.display = 'none';
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        const product = products.find(p => p.id === id);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productTitle').value = product.title;
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productLink').value = product.link;
            document.getElementById('productForm').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const id = document.getElementById('productId').value;
    const data = {
        title: document.getElementById('productTitle').value,
        image: document.getElementById('productImage').value,
        link: document.getElementById('productLink').value
    };
    
    try {
        const url = id ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Lưu sản phẩm thành công!', 'success');
            hideProductForm();
            loadProducts();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('Lỗi khi lưu sản phẩm', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showMessage('Xóa sản phẩm thành công!', 'success');
            loadProducts();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Lỗi khi xóa sản phẩm', 'error');
    }
}

// Tours Management
async function loadTours() {
    try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        const tours = await response.json();
        
        const tbody = document.getElementById('toursTable');
        tbody.innerHTML = tours.map(tour => `
            <tr>
                <td>${tour.id}</td>
                <td>${tour.name}</td>
                <td>${tour.departure}</td>
                <td>${tour.transport}</td>
                <td>${tour.date}</td>
                <td>${formatPrice(tour.price)} VNĐ</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editTour(${tour.id})">Sửa</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTour(${tour.id})">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading tours:', error);
    }
}

function showTourForm() {
    document.getElementById('tourForm').style.display = 'block';
    // Clear form
    document.getElementById('tourId').value = '';
    document.getElementById('tourName').value = '';
    document.getElementById('tourImage').value = '';
    document.getElementById('tourDeparture').value = '';
    document.getElementById('tourTransport').value = '';
    document.getElementById('tourDate').value = '';
    document.getElementById('tourPrice').value = '';
}

function hideTourForm() {
    document.getElementById('tourForm').style.display = 'none';
}

async function editTour(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        const tours = await response.json();
        const tour = tours.find(t => t.id === id);
        
        if (tour) {
            document.getElementById('tourId').value = tour.id;
            document.getElementById('tourName').value = tour.name;
            document.getElementById('tourImage').value = tour.image || '';
            document.getElementById('tourDeparture').value = tour.departure;
            document.getElementById('tourTransport').value = tour.transport;
            document.getElementById('tourDate').value = tour.date;
            document.getElementById('tourPrice').value = tour.price;
            document.getElementById('tourForm').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading tour:', error);
    }
}

async function saveTour(event) {
    event.preventDefault();
    
    const id = document.getElementById('tourId').value;
    const data = {
        name: document.getElementById('tourName').value,
        image: document.getElementById('tourImage').value,
        departure: document.getElementById('tourDeparture').value,
        transport: document.getElementById('tourTransport').value,
        date: document.getElementById('tourDate').value,
        price: parseInt(document.getElementById('tourPrice').value)
    };
    
    try {
        const url = id ? `${API_BASE_URL}/tours/${id}` : `${API_BASE_URL}/tours`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Lưu tour thành công!', 'success');
            hideTourForm();
            loadTours();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error saving tour:', error);
        showMessage('Lỗi khi lưu tour', 'error');
    }
}

async function deleteTour(id) {
    if (!confirm('Bạn có chắc muốn xóa tour này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/tours/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showMessage('Xóa tour thành công!', 'success');
            loadTours();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error deleting tour:', error);
        showMessage('Lỗi khi xóa tour', 'error');
    }
}

// Cars Management
async function loadCars() {
    try {
        const response = await fetch(`${API_BASE_URL}/cars`);
        const cars = await response.json();
        
        const tbody = document.getElementById('carsTable');
        tbody.innerHTML = cars.map(car => `
            <tr>
                <td>${car.id}</td>
                <td>${car.name}</td>
                <td>${car.origin}</td>
                <td>${car.year}</td>
                <td>${car.engine}</td>
                <td>${formatPrice(car.price)} VNĐ</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editCar(${car.id})">Sửa</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCar(${car.id})">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

function showCarForm() {
    document.getElementById('carForm').style.display = 'block';
    // Clear form
    document.getElementById('carId').value = '';
    document.getElementById('carName').value = '';
    document.getElementById('carImage').value = '';
    document.getElementById('carOrigin').value = '';
    document.getElementById('carYear').value = '';
    document.getElementById('carEngine').value = '';
    document.getElementById('carPrice').value = '';
}

function hideCarForm() {
    document.getElementById('carForm').style.display = 'none';
}

async function editCar(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/cars`);
        const cars = await response.json();
        const car = cars.find(c => c.id === id);
        
        if (car) {
            document.getElementById('carId').value = car.id;
            document.getElementById('carName').value = car.name;
            document.getElementById('carImage').value = car.image || '';
            document.getElementById('carOrigin').value = car.origin;
            document.getElementById('carYear').value = car.year;
            document.getElementById('carEngine').value = car.engine;
            document.getElementById('carPrice').value = car.price;
            document.getElementById('carForm').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading car:', error);
    }
}

async function saveCar(event) {
    event.preventDefault();
    
    const id = document.getElementById('carId').value;
    const data = {
        name: document.getElementById('carName').value,
        image: document.getElementById('carImage').value,
        origin: document.getElementById('carOrigin').value,
        year: document.getElementById('carYear').value,
        engine: document.getElementById('carEngine').value,
        price: parseInt(document.getElementById('carPrice').value)
    };
    
    try {
        const url = id ? `${API_BASE_URL}/cars/${id}` : `${API_BASE_URL}/cars`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Lưu xe thành công!', 'success');
            hideCarForm();
            loadCars();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error saving car:', error);
        showMessage('Lỗi khi lưu xe', 'error');
    }
}

async function deleteCar(id) {
    if (!confirm('Bạn có chắc muốn xóa xe này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showMessage('Xóa xe thành công!', 'success');
            loadCars();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error deleting car:', error);
        showMessage('Lỗi khi xóa xe', 'error');
    }
}

// Bookings Management
async function loadBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                logout();
                return;
            }
            throw new Error('Failed to load bookings');
        }
        
        const bookings = await response.json();
        
        const tbody = document.getElementById('bookingsTable');
        tbody.innerHTML = bookings.map(booking => `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.itemName}</td>
                <td>${booking.itemType === 'tour' ? 'Tour' : 'Ô tô'}</td>
                <td>${booking.customerName}</td>
                <td>${booking.customerPhone}</td>
                <td>${new Date(booking.createdAt).toLocaleString('vi-VN')}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading bookings:', error);
        showMessage('Lỗi khi tải danh sách đặt hàng', 'error');
    }
}

// Links Management
async function loadLinks() {
    try {
        const response = await fetch(`${API_BASE_URL}/links`);
        const links = await response.json();
        
        const tbody = document.getElementById('linksTable');
        tbody.innerHTML = links.map(link => `
            <tr>
                <td>${link.id}</td>
                <td>${link.text}</td>
                <td><a href="${link.url}" target="_blank">${link.url}</a></td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="editLink(${link.id})">Sửa</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLink(${link.id})">Xóa</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading links:', error);
    }
}

function showLinkForm() {
    document.getElementById('linkForm').style.display = 'block';
    document.getElementById('linkId').value = '';
    document.getElementById('linkText').value = '';
    document.getElementById('linkUrl').value = '';
}

function hideLinkForm() {
    document.getElementById('linkForm').style.display = 'none';
}

async function editLink(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/links`);
        const links = await response.json();
        const link = links.find(l => l.id === id);
        
        if (link) {
            document.getElementById('linkId').value = link.id;
            document.getElementById('linkText').value = link.text;
            document.getElementById('linkUrl').value = link.url;
            document.getElementById('linkForm').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading link:', error);
    }
}

async function saveLink(event) {
    event.preventDefault();
    
    const id = document.getElementById('linkId').value;
    const data = {
        text: document.getElementById('linkText').value,
        url: document.getElementById('linkUrl').value
    };
    
    try {
        const url = id ? `${API_BASE_URL}/links/${id}` : `${API_BASE_URL}/links`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Lưu liên kết thành công!', 'success');
            hideLinkForm();
            loadLinks();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error saving link:', error);
        showMessage('Lỗi khi lưu liên kết', 'error');
    }
}

async function deleteLink(id) {
    if (!confirm('Bạn có chắc muốn xóa liên kết này?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/links/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showMessage('Xóa liên kết thành công!', 'success');
            loadLinks();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error deleting link:', error);
        showMessage('Lỗi khi xóa liên kết', 'error');
    }
}

// SEO Settings
async function loadSeoSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        const settings = await response.json();
        
        document.getElementById('pageTitle').value = settings.pageTitle || '';
        document.getElementById('metaDescription').value = settings.metaDescription || '';
        document.getElementById('h1').value = settings.h1 || '';
        document.getElementById('h2Converter').value = settings.h2Converter || '';
        document.getElementById('h2Affiliate').value = settings.h2Affiliate || '';
        document.getElementById('h2Tours').value = settings.h2Tours || '';
        document.getElementById('h2Cars').value = settings.h2Cars || '';
    } catch (error) {
        console.error('Error loading SEO settings:', error);
    }
}

async function saveSeoSettings(event) {
    event.preventDefault();
    
    const settings = {
        pageTitle: document.getElementById('pageTitle').value,
        metaDescription: document.getElementById('metaDescription').value,
        h1: document.getElementById('h1').value,
        h2Converter: document.getElementById('h2Converter').value,
        h2Affiliate: document.getElementById('h2Affiliate').value,
        h2Tours: document.getElementById('h2Tours').value,
        h2Cars: document.getElementById('h2Cars').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showMessage('Lưu cài đặt SEO thành công!', 'success');
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error saving SEO settings:', error);
        showMessage('Lỗi khi lưu cài đặt SEO', 'error');
    }
}

// Popup Settings
async function loadPopupSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/popup-settings`);
        const settings = await response.json();
        
        document.getElementById('popupEnabled').checked = settings.enabled;
        document.getElementById('popupDelay').value = settings.delay || 5;
        document.getElementById('popupType').value = settings.type || 'text';
        document.getElementById('popupTextContent').value = settings.textContent || '';
        document.getElementById('popupImageUrl').value = settings.imageUrl || '';
        document.getElementById('popupImageLink').value = settings.imageLink || '';
        document.getElementById('popupVideoUrl').value = settings.videoUrl || '';
        document.getElementById('popupVideoLink').value = settings.videoLink || '';
        
        togglePopupFields();
    } catch (error) {
        console.error('Error loading popup settings:', error);
    }
}

function togglePopupFields() {
    const type = document.getElementById('popupType').value;
    
    document.getElementById('textFields').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('imageFields').style.display = type === 'image' ? 'block' : 'none';
    document.getElementById('videoFields').style.display = type === 'video' ? 'block' : 'none';
}

async function savePopupSettings(event) {
    event.preventDefault();
    
    const settings = {
        enabled: document.getElementById('popupEnabled').checked,
        delay: parseInt(document.getElementById('popupDelay').value),
        type: document.getElementById('popupType').value,
        textContent: document.getElementById('popupTextContent').value,
        imageUrl: document.getElementById('popupImageUrl').value,
        imageLink: document.getElementById('popupImageLink').value,
        videoUrl: document.getElementById('popupVideoUrl').value,
        videoLink: document.getElementById('popupVideoLink').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/popup-settings`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showMessage('Lưu cài đặt popup thành công!', 'success');
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error saving popup settings:', error);
        showMessage('Lỗi khi lưu cài đặt popup', 'error');
    }
}

// Tracking Settings
async function loadTrackingSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        const settings = await response.json();
        
        document.getElementById('ga4Code').value = settings.ga4 || '';
        document.getElementById('gtmId').value = settings.gtm || '';
        document.getElementById('searchConsoleCode').value = settings.searchConsole || '';
        document.getElementById('otherTrackingCode').value = settings.otherTracking || '';
    } catch (error) {
        console.error('Error loading tracking settings:', error);
    }
}

async function saveTrackingSettings(event) {
    event.preventDefault();
    
    const settings = {
        ga4: document.getElementById('ga4Code').value,
        gtm: document.getElementById('gtmId').value,
        searchConsole: document.getElementById('searchConsoleCode').value,
        otherTracking: document.getElementById('otherTrackingCode').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showMessage('Lưu tracking code thành công!', 'success');
        } else if (response.status === 401) {
            alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
            logout();
        }
    } catch (error) {
        console.error('Error saving tracking settings:', error);
        showMessage('Lỗi khi lưu tracking code', 'error');
    }
}

// Helper functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of active section
    const activeSection = document.querySelector('.admin-section.active');
    activeSection.insertBefore(messageDiv, activeSection.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) return;
    
    // Load dashboard by default
    loadDashboard();
    
    // Add logout button to sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-danger';
        logoutBtn.textContent = 'Đăng xuất';
        logoutBtn.onclick = logout;
        logoutBtn.style.marginTop = '20px';
        logoutBtn.style.width = '100%';
        sidebar.appendChild(logoutBtn);
    }
});