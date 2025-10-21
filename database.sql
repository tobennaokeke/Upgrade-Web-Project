drop database upgrade2025_db;

CREATE DATABASE upgrade2025_db;

USE upgrade2025_db;

CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL, 
    phone_number VARCHAR(20) NOT NULL,
    contact_method VARCHAR(20) NOT NULL,
    age INT,
    skill_category VARCHAR(100) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    employment_status VARCHAR(50) NOT NULL,
    lecture_time VARCHAR(20) NOT NULL,
    learning_method VARCHAR(20) NOT NULL,
    motivation TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gallery_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(255) NOT NULL,
    caption VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select *
from admin_users;

select *
from gallery_images