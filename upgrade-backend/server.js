// server.js (using MySQL)
const express = require('express');
const mysql = require('mysql2/promise'); // Using the promise-based version for async/await
const cors = require('cors');

const app = express();
const PORT = 3000; // You can change this if 3000 is in use

// --- 1. MySQL Database Configuration (!!! CHANGE THIS !!!) ---
const dbConfig = {
    host: 'localhost',
    user: 'root', // <--- REPLACE with your actual MySQL username (e.g., 'root')
    password: '150396', // <--- REPLACE with your actual MySQL password
    database: 'upgrade2025_db', // Ensure this database exists
};

// Create a connection pool for efficient database handling
const pool = mysql.createPool(dbConfig);

// Test the database connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the MySQL database.');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('MySQL database connection error:', err.stack);
    process.exit(1); // Exit if the database connection fails
  });

// --- 2. Middleware ---
app.use(cors());
app.use(express.json()); // Essential for parsing the JSON data from the client

// --- 3. The Registration API Endpoint ---
// The full API Endpoint is: http://localhost:3000/api/register
app.post('/api/register', async (req, res) => {
    
    const formData = req.body;
    
    // Server-Side Validation: Ensure all required fields are present
    const requiredFields = ['fullName', 'email', 'phoneNumber', 'skillCategory', 'employmentStatus'];
    for (const field of requiredFields) {
        if (!formData[field]) {
            return res.status(400).json({ 
                error: `Missing required field: ${field}` 
            });
        }
    }

    try {
        // Database Action: Define the SQL query for insertion
        const sql = `
            INSERT INTO registrations (
                full_name, email, phone_number, contact_method, age, skill_category, 
                experience, employment_status, lecture_time, learning_method, motivation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Map the form data to an array of values
        const values = [
            formData.fullName, 
            formData.email, 
            formData.phoneNumber, 
            formData.contactMethod, 
            formData.age || null, 
            formData.skillCategory, 
            formData.experience, 
            formData.employmentStatus, 
            formData.lectureTime, 
            formData.learningMethod, 
            formData.motivation
        ];

        // Execute the query
        const [result] = await pool.query(sql, values);
        
        // Send a success response (HTTP 201 Created)
        res.status(201).json({ 
            message: 'Registration successful!', 
            id: result.insertId 
        });

    } catch (error) {
        console.error('MySQL insertion error:', error.stack);
        
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ // HTTP 409 Conflict
                error: 'Registration failed: This email address is already registered.'
            });
        }
        
        res.status(500).json({ 
            error: 'An internal server error occurred during registration.' 
        });
    }
});

// --- 4. Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});