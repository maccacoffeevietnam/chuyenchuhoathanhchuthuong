const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize SQLite database
const db = new sqlite3.Database('./database.db');

// Simple authentication middleware
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'admin-secret-token-2024'; // Change this in production!

function authenticateAdmin(req, res, next) {
    const token = req.headers['authorization'];
    if (!token || token !== `Bearer ${AUTH_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// Create tables if they don't exist
db.serialize(() => {
    // Admin users table
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    // Products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            image TEXT,
            link TEXT
        )
    `);

    // Tours table
    db.run(`
        CREATE TABLE IF NOT EXISTS tours (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT,
            departure TEXT,
            transport TEXT,
            date TEXT,
            price INTEGER
        )
    `);

    // Cars table
    db.run(`
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT,
            origin TEXT,
            year TEXT,
            engine TEXT,
            price INTEGER
        )
    `);

    // Links table
    db.run(`
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            url TEXT NOT NULL
        )
    `);

    // Settings table
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT
        )
    `);

    // Popup settings table
    db.run(`
        CREATE TABLE IF NOT EXISTS popup_settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            enabled INTEGER DEFAULT 0,
            delay INTEGER DEFAULT 5,
            type TEXT DEFAULT 'text',
            imageUrl TEXT,
            imageLink TEXT,
            textContent TEXT,
            videoUrl TEXT,
            videoLink TEXT
        )
    `);

    // Bookings table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemName TEXT NOT NULL,
            itemType TEXT NOT NULL,
            customerName TEXT NOT NULL,
            customerPhone TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )
    `);

    // Insert default admin user (username: admin, password: admin123)
    db.get("SELECT COUNT(*) as count FROM admin_users", (err, row) => {
        if (row && row.count === 0) {
            const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const hashedPassword = crypto.createHash('sha256').update(defaultPassword).digest('hex');
            const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
            db.run("INSERT INTO admin_users (username, password) VALUES (?, ?)", [defaultUsername, hashedPassword]);
            console.log(`Default admin user created - Username: ${defaultUsername}, Password: ${defaultPassword}`);
            console.log('⚠️  PLEASE CHANGE THE DEFAULT PASSWORD!');
        }
    });

    // Insert default data if tables are empty
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row && row.count === 0) {
            const defaultProducts = [
                { title: 'Laptop Gaming MSI', image: 'https://via.placeholder.com/220x150', link: 'https://example.com/laptop1' },
                { title: 'Điện thoại iPhone 15', image: 'https://via.placeholder.com/220x150', link: 'https://example.com/phone1' },
                { title: 'Máy ảnh Canon EOS', image: 'https://via.placeholder.com/220x150', link: 'https://example.com/camera1' },
                { title: 'Tai nghe Sony WH-1000XM5', image: 'https://via.placeholder.com/220x150', link: 'https://example.com/headphone1' },
                { title: 'Smart TV Samsung 55"', image: 'https://via.placeholder.com/220x150', link: 'https://example.com/tv1' }
            ];
            
            const stmt = db.prepare("INSERT INTO products (title, image, link) VALUES (?, ?, ?)");
            defaultProducts.forEach(product => {
                stmt.run(product.title, product.image, product.link);
            });
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM tours", (err, row) => {
        if (row && row.count === 0) {
            const defaultTours = [
                { name: 'Tour Phú Quốc 3N2Đ', image: 'https://via.placeholder.com/220x150', departure: 'TP.HCM', transport: 'Máy bay', date: '15/03/2024', price: 4500000 },
                { name: 'Tour Đà Lạt 2N1Đ', image: 'https://via.placeholder.com/220x150', departure: 'TP.HCM', transport: 'Xe khách', date: '20/03/2024', price: 2500000 },
                { name: 'Tour Nha Trang 3N3Đ', image: 'https://via.placeholder.com/220x150', departure: 'Hà Nội', transport: 'Máy bay', date: '25/03/2024', price: 5500000 },
                { name: 'Tour Sa Pa 4N3Đ', image: 'https://via.placeholder.com/220x150', departure: 'Hà Nội', transport: 'Xe khách', date: '01/04/2024', price: 3500000 },
                { name: 'Tour Hạ Long 2N1Đ', image: 'https://via.placeholder.com/220x150', departure: 'Hà Nội', transport: 'Xe khách', date: '05/04/2024', price: 2800000 }
            ];
            
            const stmt = db.prepare("INSERT INTO tours (name, image, departure, transport, date, price) VALUES (?, ?, ?, ?, ?, ?)");
            defaultTours.forEach(tour => {
                stmt.run(tour.name, tour.image, tour.departure, tour.transport, tour.date, tour.price);
            });
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM cars", (err, row) => {
        if (row && row.count === 0) {
            const defaultCars = [
                { name: 'Toyota Camry 2024', image: 'https://via.placeholder.com/220x150', origin: 'Nhật Bản', year: '2024', engine: '2.5L', price: 1200000000 },
                { name: 'Honda CR-V 2024', image: 'https://via.placeholder.com/220x150', origin: 'Nhật Bản', year: '2024', engine: '1.5L Turbo', price: 1100000000 },
                { name: 'Mazda CX-5 2024', image: 'https://via.placeholder.com/220x150', origin: 'Nhật Bản', year: '2024', engine: '2.0L', price: 900000000 },
                { name: 'VinFast VF8', image: 'https://via.placeholder.com/220x150', origin: 'Việt Nam', year: '2024', engine: 'Điện', price: 1200000000 },
                { name: 'Mercedes C200', image: 'https://via.placeholder.com/220x150', origin: 'Đức', year: '2024', engine: '1.5L Turbo', price: 1800000000 }
            ];
            
            const stmt = db.prepare("INSERT INTO cars (name, image, origin, year, engine, price) VALUES (?, ?, ?, ?, ?, ?)");
            defaultCars.forEach(car => {
                stmt.run(car.name, car.image, car.origin, car.year, car.engine, car.price);
            });
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM links", (err, row) => {
        if (row && row.count === 0) {
            const defaultLinks = [
                { text: 'Google', url: 'https://google.com' },
                { text: 'Facebook', url: 'https://facebook.com' },
                { text: 'YouTube', url: 'https://youtube.com' }
            ];
            
            const stmt = db.prepare("INSERT INTO links (text, url) VALUES (?, ?)");
            defaultLinks.forEach(link => {
                stmt.run(link.text, link.url);
            });
            stmt.finalize();
        }
    });

    // Insert default settings
    db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
        if (row && row.count === 0) {
            const defaultSettings = [
                { key: 'pageTitle', value: 'Công Cụ Chuyển Đổi Văn Bản Online' },
                { key: 'metaDescription', value: 'Công cụ chuyển đổi văn bản miễn phí - chuyển chữ hoa thành chữ thường và nhiều tính năng khác' },
                { key: 'h1', value: 'Công Cụ Chuyển Đổi Văn Bản Chuyên Nghiệp' },
                { key: 'h2Converter', value: 'Chuyển Đổi Văn Bản' },
                { key: 'h2Affiliate', value: 'Sản Phẩm Đề Xuất' },
                { key: 'h2Tours', value: 'Tour Du Lịch Hot' },
                { key: 'h2Cars', value: 'Ô Tô Khuyến Mãi' }
            ];
            
            const stmt = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
            defaultSettings.forEach(setting => {
                stmt.run(setting.key, setting.value);
            });
            stmt.finalize();
        }
    });

    // Insert default popup settings
    db.get("SELECT COUNT(*) as count FROM popup_settings", (err, row) => {
        if (row && row.count === 0) {
            db.run("INSERT INTO popup_settings (enabled, delay, type, textContent) VALUES (1, 5, 'text', 'Chào mừng bạn đến với website của chúng tôi!')");
        }
    });
});

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    db.get("SELECT * FROM admin_users WHERE username = ? AND password = ?", [username, hashedPassword], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row) {
            res.json({ success: true, token: AUTH_TOKEN });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

// PUBLIC ROUTES (No authentication needed)

// Get all products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows || []);
    });
});

// Get all tours
app.get('/api/tours', (req, res) => {
    db.all("SELECT * FROM tours", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows || []);
    });
});

// Get all cars
app.get('/api/cars', (req, res) => {
    db.all("SELECT * FROM cars", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows || []);
    });
});

// Get all links
app.get('/api/links', (req, res) => {
    db.all("SELECT * FROM links", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows || []);
    });
});

// Get settings
app.get('/api/settings', (req, res) => {
    db.all("SELECT key, value FROM settings", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const settings = {};
        if (rows) {
            rows.forEach(row => {
                settings[row.key] = row.value;
            });
        }
        res.json(settings);
    });
});

// Get popup settings
app.get('/api/popup-settings', (req, res) => {
    db.get("SELECT * FROM popup_settings WHERE id = 1", (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row || {});
    });
});

// Create booking (public)
app.post('/api/bookings', (req, res) => {
    const { itemName, itemType, customerName, customerPhone, createdAt } = req.body;
    
    db.run(
        "INSERT INTO bookings (itemName, itemType, customerName, customerPhone, createdAt) VALUES (?, ?, ?, ?, ?)",
        [itemName, itemType, customerName, customerPhone, createdAt],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Booking created successfully' });
        }
    );
});

// ADMIN ROUTES (Authentication required)

// Get all bookings (admin only)
app.get('/api/bookings', authenticateAdmin, (req, res) => {
    db.all("SELECT * FROM bookings ORDER BY createdAt DESC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows || []);
    });
});

// Update product
app.put('/api/products/:id', authenticateAdmin, (req, res) => {
    const { title, image, link } = req.body;
    db.run(
        "UPDATE products SET title = ?, image = ?, link = ? WHERE id = ?",
        [title, image, link, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ changes: this.changes });
        }
    );
});

// Add new product
app.post('/api/products', authenticateAdmin, (req, res) => {
    const { title, image, link } = req.body;
    db.run(
        "INSERT INTO products (title, image, link) VALUES (?, ?, ?)",
        [title, image, link],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Delete product
app.delete('/api/products/:id', authenticateAdmin, (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Update tour
app.put('/api/tours/:id', authenticateAdmin, (req, res) => {
    const { name, image, departure, transport, date, price } = req.body;
    db.run(
        "UPDATE tours SET name = ?, image = ?, departure = ?, transport = ?, date = ?, price = ? WHERE id = ?",
        [name, image, departure, transport, date, price, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ changes: this.changes });
        }
    );
});

// Add new tour
app.post('/api/tours', authenticateAdmin, (req, res) => {
    const { name, image, departure, transport, date, price } = req.body;
    db.run(
        "INSERT INTO tours (name, image, departure, transport, date, price) VALUES (?, ?, ?, ?, ?, ?)",
        [name, image, departure, transport, date, price],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Delete tour
app.delete('/api/tours/:id', authenticateAdmin, (req, res) => {
    db.run("DELETE FROM tours WHERE id = ?", req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Update car
app.put('/api/cars/:id', authenticateAdmin, (req, res) => {
    const { name, image, origin, year, engine, price } = req.body;
    db.run(
        "UPDATE cars SET name = ?, image = ?, origin = ?, year = ?, engine = ?, price = ? WHERE id = ?",
        [name, image, origin, year, engine, price, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ changes: this.changes });
        }
    );
});

// Add new car
app.post('/api/cars', authenticateAdmin, (req, res) => {
    const { name, image, origin, year, engine, price } = req.body;
    db.run(
        "INSERT INTO cars (name, image, origin, year, engine, price) VALUES (?, ?, ?, ?, ?, ?)",
        [name, image, origin, year, engine, price],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Delete car
app.delete('/api/cars/:id', authenticateAdmin, (req, res) => {
    db.run("DELETE FROM cars WHERE id = ?", req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Update link
app.put('/api/links/:id', authenticateAdmin, (req, res) => {
    const { text, url } = req.body;
    db.run(
        "UPDATE links SET text = ?, url = ? WHERE id = ?",
        [text, url, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ changes: this.changes });
        }
    );
});

// Add new link
app.post('/api/links', authenticateAdmin, (req, res) => {
    const { text, url } = req.body;
    db.run(
        "INSERT INTO links (text, url) VALUES (?, ?)",
        [text, url],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Delete link
app.delete('/api/links/:id', authenticateAdmin, (req, res) => {
    db.run("DELETE FROM links WHERE id = ?", req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ changes: this.changes });
    });
});

// Update settings
app.put('/api/settings', authenticateAdmin, (req, res) => {
    const updates = Object.entries(req.body);
    let completed = 0;
    
    updates.forEach(([key, value]) => {
        db.run(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            [key, value],
            (err) => {
                completed++;
                if (completed === updates.length) {
                    res.json({ message: 'Settings updated successfully' });
                }
            }
        );
    });
});

// Change password
app.put('/api/change-password', authenticateAdmin, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ mật khẩu' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    
    // For simplicity, we're using a fixed username 'admin'
    const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
    
    db.get("SELECT * FROM admin_users WHERE username = 'admin' AND password = ?", [hashedCurrentPassword], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
            return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
        }
        
        // Update password
        const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
        db.run("UPDATE admin_users SET password = ? WHERE username = 'admin'", [hashedNewPassword], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ message: 'Đổi mật khẩu thành công!' });
        });
    });
});

// Update popup settings
app.put('/api/popup-settings', authenticateAdmin, (req, res) => {
    const { enabled, delay, type, imageUrl, imageLink, textContent, videoUrl, videoLink } = req.body;
    
    db.run(
        `UPDATE popup_settings SET 
            enabled = ?, delay = ?, type = ?, imageUrl = ?, imageLink = ?, 
            textContent = ?, videoUrl = ?, videoLink = ?
        WHERE id = 1`,
        [enabled ? 1 : 0, delay, type, imageUrl, imageLink, textContent, videoUrl, videoLink],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Popup settings updated successfully' });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`\n⚠️  DEFAULT ADMIN LOGIN:`);
    console.log(`Username: admin`);
    console.log(`Password: admin123`);
    console.log(`\nPLEASE CHANGE THE DEFAULT PASSWORD!`);
});