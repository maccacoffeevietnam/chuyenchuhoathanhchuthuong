// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Text Converter Functions
function updateCounter() {
    const text = document.getElementById('inputText').value;
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    document.getElementById('charCount').textContent = charCount;
    document.getElementById('wordCount').textContent = wordCount;
}

// Add event listener for real-time counter update
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('inputText').addEventListener('input', updateCounter);
    
    // Load initial data
    loadAffiliateProducts();
    loadTours();
    loadCars();
    loadAnchorLinks();
    loadSiteSettings();
    checkAndShowPopup();
});

// Text conversion functions
function convertToLowercase() {
    const input = document.getElementById('inputText');
    input.value = input.value.toLowerCase();
    updateCounter();
}

function convertToUppercase() {
    const input = document.getElementById('inputText');
    input.value = input.value.toUpperCase();
    updateCounter();
}

function convertToTitleCase() {
    const input = document.getElementById('inputText');
    input.value = input.value.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    updateCounter();
}

function convertToSentenceCase() {
    const input = document.getElementById('inputText');
    let text = input.value.toLowerCase();
    input.value = text.replace(/(^\s*\w|[.!?]\s*\w)/g, function(c) {
        return c.toUpperCase();
    });
    updateCounter();
}

function convertToToggleCase() {
    const input = document.getElementById('inputText');
    input.value = input.value.split('').map(char => {
        return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    }).join('');
    updateCounter();
}

// Utility functions
function copyText() {
    const input = document.getElementById('inputText');
    input.select();
    document.execCommand('copy');
    
    // Show success message
    showNotification('Đã sao chép văn bản!');
}

function clearText() {
    if (confirm('Bạn có chắc muốn xóa tất cả văn bản?')) {
        document.getElementById('inputText').value = '';
        updateCounter();
    }
}

function downloadText() {
    const text = document.getElementById('inputText').value;
    if (!text) {
        showNotification('Không có văn bản để tải xuống!', 'error');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'van-ban-da-chuyen-doi.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Đã tải xuống file!');
}

// File upload handler
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/plain') {
        showNotification('Vui lòng chọn file .txt!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('inputText').value = e.target.result;
        updateCounter();
        showNotification('Đã tải file thành công!');
    };
    reader.readAsText(file);
}

// Load data functions
async function loadAffiliateProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const products = await response.json();
        
        const container = document.getElementById('affiliateProducts');
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/220x150'">
                <h3>${product.title}</h3>
                <a href="${product.link}" target="_blank" rel="noopener">Xem chi tiết</a>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadTours() {
    try {
        const response = await fetch(`${API_BASE_URL}/tours`);
        const tours = await response.json();
        
        const container = document.getElementById('toursList');
        container.innerHTML = tours.map(tour => `
            <div class="tour-card">
                <img src="${tour.image}" alt="${tour.name}" onerror="this.src='https://via.placeholder.com/220x150'">
                <h3>${tour.name}</h3>
                <div class="info-item">
                    <span class="info-label">Khởi hành:</span>
                    <span>${tour.departure}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phương tiện:</span>
                    <span>${tour.transport}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ngày đi:</span>
                    <span>${tour.date}</span>
                </div>
                <div class="price">${formatPrice(tour.price)} VNĐ</div>
                <button class="btn btn-primary" onclick="openBookingModal('${tour.name}', 'tour')">
                    Tư vấn / Đặt tour
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tours:', error);
    }
}

async function loadCars() {
    try {
        const response = await fetch(`${API_BASE_URL}/cars`);
        const cars = await response.json();
        
        const container = document.getElementById('carsList');
        container.innerHTML = cars.map(car => `
            <div class="car-card">
                <img src="${car.image}" alt="${car.name}" onerror="this.src='https://via.placeholder.com/220x150'">
                <h3>${car.name}</h3>
                <div class="info-item">
                    <span class="info-label">Xuất xứ:</span>
                    <span>${car.origin}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Năm SX:</span>
                    <span>${car.year}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Động cơ:</span>
                    <span>${car.engine}</span>
                </div>
                <div class="price">${formatPrice(car.price)} VNĐ</div>
                <button class="btn btn-primary" onclick="openBookingModal('${car.name}', 'car')">
                    Tư vấn / Đặt xe
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

async function loadAnchorLinks() {
    try {
        const response = await fetch(`${API_BASE_URL}/links`);
        const links = await response.json();
        
        const container = document.getElementById('anchorLinks');
        container.innerHTML = links.map(link => `
            <a href="${link.url}" target="_blank" rel="noopener">${link.text}</a>
        `).join('');
    } catch (error) {
        console.error('Error loading links:', error);
    }
}

async function loadSiteSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        const settings = await response.json();
        
        // Update page title and meta
        if (settings.pageTitle) document.title = settings.pageTitle;
        if (settings.metaDescription) {
            document.querySelector('meta[name="description"]').content = settings.metaDescription;
        }
        
        // Update H1 and H2 tags
        if (settings.h1) document.getElementById('main-title').textContent = settings.h1;
        if (settings.h2Converter) document.getElementById('converter-heading').textContent = settings.h2Converter;
        if (settings.h2Affiliate) document.getElementById('affiliate-heading').textContent = settings.h2Affiliate;
        if (settings.h2Tours) document.getElementById('tours-heading').textContent = settings.h2Tours;
        if (settings.h2Cars) document.getElementById('cars-heading').textContent = settings.h2Cars;
        
        // Add tracking scripts
        if (settings.ga4) addScript(settings.ga4);
        if (settings.gtm) addGTM(settings.gtm);
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Popup functions
async function checkAndShowPopup() {
    try {
        const response = await fetch(`${API_BASE_URL}/popup-settings`);
        const settings = await response.json();
        
        if (!settings.enabled) return;
        
        // Check if popup was already shown in this session
        const popupShown = sessionStorage.getItem('popupShown');
        if (popupShown) return;
        
        setTimeout(() => {
            showPopup(settings);
            sessionStorage.setItem('popupShown', 'true');
        }, settings.delay * 1000);
    } catch (error) {
        console.error('Error loading popup settings:', error);
    }
}

function showPopup(settings) {
    const popupBody = document.getElementById('popupBody');
    let content = '';
    
    if (settings.type === 'image' && settings.imageUrl) {
        content = `<img src="${settings.imageUrl}" alt="Popup" style="width: 100%; height: auto;">`;
        if (settings.imageLink) {
            content = `<a href="${settings.imageLink}" target="_blank">${content}</a>`;
        }
    } else if (settings.type === 'text' && settings.textContent) {
        content = `<div>${settings.textContent}</div>`;
    } else if (settings.type === 'video' && settings.videoUrl) {
        content = `
            <video controls style="width: 100%; height: auto;">
                <source src="${settings.videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        if (settings.videoLink) {
            content += `<a href="${settings.videoLink}" target="_blank" class="btn btn-primary" style="margin-top: 10px;">Xem thêm</a>`;
        }
    }
    
    popupBody.innerHTML = content;
    document.getElementById('popupModal').style.display = 'block';
}

function closePopup() {
    document.getElementById('popupModal').style.display = 'none';
}

// Booking modal functions
function openBookingModal(itemName, itemType) {
    document.getElementById('bookingItemName').value = itemName;
    document.getElementById('bookingItemType').value = itemType;
    document.getElementById('bookingItemDisplay').textContent = itemName;
    document.getElementById('bookingModal').style.display = 'block';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('bookingForm').reset();
}

async function submitBooking(event) {
    event.preventDefault();
    
    const formData = {
        itemName: document.getElementById('bookingItemName').value,
        itemType: document.getElementById('bookingItemType').value,
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        createdAt: new Date().toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Đã gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
            closeBookingModal();
        } else {
            showNotification('Có lỗi xảy ra, vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        showNotification('Có lỗi xảy ra, vui lòng thử lại!', 'error');
    }
}

// Helper functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function addScript(scriptContent) {
    const script = document.createElement('script');
    script.innerHTML = scriptContent;
    document.head.appendChild(script);
}

function addGTM(gtmId) {
    // Add GTM script
    const script = document.createElement('script');
    script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);
    
    // Add GTM noscript
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target == document.getElementById('popupModal')) {
        closePopup();
    }
    if (event.target == document.getElementById('bookingModal')) {
        closeBookingModal();
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);