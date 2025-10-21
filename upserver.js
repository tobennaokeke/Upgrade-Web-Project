// upserver.js

const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based pool
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// --- NEW/UPDATED REQUIRES ---
const session = require('express-session');
const bcrypt = require('bcrypt'); // For password hashing
const cors = require('cors'); // For Cross-Origin Resource Sharing
const saltRounds = 10; // Hashing complexity

const app = express();
const PORT = 3000;

// 🚨 FIX 1: Explicitly define allowed origins to handle 127.0.0.1 vs. localhost ambiguity
const allowedOrigins = [
    'http://localhost:3000',      
    'http://localhost:5500',      // Common Live Server address
    'http://127.0.0.1:5500'       // Common Live Server address
];


// --- Database Connection (Updated to use Pool) ---
const pool = mysql.createPool({ 
    host: 'localhost', 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    // 🚨 FIX 2: Corrected DB variable name to match your .env file
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- Database Connection Test Function ---
async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Pool connection successful!');
        connection.release();
    } catch (err) {
        console.error('❌ FATAL: MySQL Connection Error. Please check .env file and MySQL service.', err.message);
        // Important: Exit the application if we can't connect to the database
        process.exit(1);
    }
}


// --- Middleware Setup ---

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Crucial for session cookies
}));

app.use(express.json()); // To parse JSON bodies
// Serve static files from 'public'. Make sure your admin-login.html is in this folder!
app.use(express.static(path.join(__dirname, 'public'))); 

// Session Middleware (Setup to manage user state)
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-secret-key-for-admin-session',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 3600000, // 1 hour
        secure: false,   // Should be true in production with HTTPS
        httpOnly: true 
    }
}));


// --- Multer Setup for File Upload ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this directory exists!
        cb(null, 'public/uploads/'); 
    },
    filename: (req, file, cb) => {
        // Use a unique name to prevent collisions
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// --- Authentication Middleware ---
const requireAuth = (req, res, next) => {
    // Check if the user is logged in via session
    if (req.session.userId) {
        next(); // User is authenticated, proceed
    } else {
        // User is not authenticated, send a 401 response
        res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
};


// 🔓 PUBLIC REGISTRATION ENDPOINT
app.post('/api/register', async (req, res) => {
    // Collect all data fields sent from registration.js
    const { 
        fullName, 
        email, 
        phoneNumber, 
        contactMethod, 
        age, 
        skillCategory, 
        experience, 
        employmentStatus, 
        lectureTime, 
        learningMethod, 
        motivation 
    } = req.body;

    // Basic validation
    if (!fullName || !email || !phoneNumber) {
        return res.status(400).json({ success: false, message: 'Full name, email, and phone number are required.' });
    }

    try {
        // SQL query to insert registration data into the 'registrations' table
        const sql = `
            INSERT INTO registrations 
            (full_name, email, phone_number, contact_method, age, skill_category, experience, employment_status, lecture_time, learning_method, motivation) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            fullName, email, phoneNumber, contactMethod, age, skillCategory, experience, employmentStatus, lectureTime, learningMethod, motivation
        ];

        // Execute the query
        await pool.execute(sql, values);
        
        console.log(`[DB] New registration successful for: ${fullName}`);
        
        // Respond with success JSON
        res.status(201).json({ 
            success: true, 
            message: 'Registration successful! We will contact you soon.' 
        });

    } catch (err) {
        console.error('❌ FATAL Registration Error:', err.message);
        console.error('❌ Stack trace:', err.stack);
        
        // Check for specific MySQL errors (e.g., table missing)
        let message = 'Server error during registration.';
        if (err.code === 'ER_NO_SUCH_TABLE') {
             message = 'Database error: The "registrations" table does not exist.';
        }
        if (err.code === 'ER_BAD_FIELD_ERROR') {
             message = 'Database error: Column mismatch. Check the fields in your "registrations" table.';
        }

        res.status(500).json({ success: false, message: message });
    }
});


// 🔓 Admin Sign Up (Temporarily re-enabled to ensure a hashed user exists)
app.post('/api/admin/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await pool.execute('SELECT username FROM admin_users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: 'Username already exists. Please login.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        const sql = 'INSERT INTO admin_users (username, password) VALUES (?, ?)';
        await pool.execute(sql, [username, hashedPassword]);

        // Do NOT log the user in immediately after signup (they should log in via the login page)
        
        res.status(201).json({ success: true, message: 'Admin account created successfully. Please login.' });

    } catch (err) {
        console.error('❌ Error during signup:', err);
        // This often happens if admin_users table is missing
        res.status(500).json({ success: false, message: 'Server error during account creation. Check if admin_users table exists.' });
    }
});


// 🔒 Admin Login (Revised to handle missing user/password)
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        const sql = 'SELECT username, password FROM admin_users WHERE username = ?';
        // 🚨 ENHANCED LOGGING: Log the query execution
        console.log(`[DB] Executing query: ${sql} with user: ${username}`);
        const [results] = await pool.execute(sql, [username]);

        // 1. Check if the user was found
        if (results.length === 0) {
            console.log(`Login attempt failed: User ${username} not found in DB.`);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' }); 
        }

        const user = results[0];
        const storedHash = user.password;
        
        // 2. CRITICAL CHECK: Ensure storedHash is NOT null/undefined
        if (!storedHash) {
             console.error(`Login failed: User ${username} found, but password hash is NULL/missing in table. Please create a new user.`);
             return res.status(500).json({ success: false, message: 'Server error: Missing password hash for user. Please re-register.' });
        }

        // Compare the plain-text password with the stored hash
        const match = await bcrypt.compare(password, storedHash);

        if (match) {
            // Success: Create a session
            req.session.userId = user.username;
            res.status(200).json({ success: true, message: 'Login successful!' });
        } else {
            // Failure: Passwords do not match
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

    } catch (err) {
        // This block catches DB errors (e.g., table not found, connection lost) or bcrypt errors
        console.error('❌ FATAL Login Error:', err.message); 
        console.error('❌ Stack trace:', err.stack);
        // Send a generic 500 error back to the client
        res.status(500).json({ success: false, message: 'Internal Server Error during authentication.' });
    }
});


// Admin Logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, message: 'Could not log out.' });
        }
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    });
});


// --- UPLOAD ENDPOINT (Protected) ---
// Note: You must be logged in to access this
app.post('/api/upload', requireAuth, upload.single('imageFile'), async (req, res) => {
    // ... (rest of upload endpoint remains the same)
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { imageCaption, imageCategory } = req.body;
    const filePath = '/uploads/' + req.file.filename; 
    
    const sql = 'INSERT INTO gallery_images (file_path, caption, category) VALUES (?, ?, ?)';
    
    try {
        await pool.execute(sql, [filePath, imageCaption, imageCategory]);
        
        res.status(200).json({ 
            success: true,
            message: 'Image uploaded successfully!', 
            src: filePath
        });
    } catch (err) {
        console.error('❌ Error saving to DB:', err);
        return res.status(500).json({ success: false, message: 'Database error. Image not saved.' });
    }
});


// Endpoint to fetch all gallery images (GET)
app.get('/api/gallery-images', async (req, res) => {
    // ... (rest of gallery endpoint remains the same)
    const sql = 'SELECT id, file_path AS src, caption, category FROM gallery_images ORDER BY uploaded_at DESC';
    
    try {
        const [results] = await pool.execute(sql);
        res.json(results);
    } catch (err) {
        console.error('❌ Error fetching gallery images:', err);
        res.status(500).json({ success: false, message: 'Error fetching images from database.' });
    }
});


// --- SERVER START ---
async function startServer() {
    await testDbConnection(); // Test connection before starting to listen
    app.listen(PORT, () => {
        console.log(`✅ Server is running on http://localhost:${PORT}`);
        console.log(`If you need to create an admin account, visit: http://localhost:3000/admin-signup.html`);
    });
}

startServer();
