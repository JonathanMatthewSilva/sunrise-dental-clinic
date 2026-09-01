CREATE DATABASE sunrise_dental;
USE sunrise_dental;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE dentists (
    dentist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE treatments (
    treatment_code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    treatment_fee DECIMAL(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_number VARCHAR(30) NOT NULL UNIQUE,
    patient_id INT NOT NULL,
    dentist_id INT NOT NULL,
    treatment_code VARCHAR(20) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (dentist_id) REFERENCES dentists(dentist_id),
    FOREIGN KEY (treatment_code) REFERENCES treatments(treatment_code),
    UNIQUE (dentist_id, appointment_date, appointment_time)
);
CREATE TABLE bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(30) NOT NULL UNIQUE,
    appointment_id INT NOT NULL UNIQUE,
    consultation_fee DECIMAL(10,2) NOT NULL,
    treatment_fee DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (generated_by) REFERENCES users(user_id)
);
CREATE TABLE audit_log (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
INSERT INTO dentists (name, specialization) VALUES
('Dr. Nimal Perera', 'General Dentistry'),
('Dr. Ishani Silva', 'Orthodontics'),
('Dr. Kavindu Fernando', 'Periodontics');
INSERT INTO treatments (treatment_code, name, treatment_fee) VALUES
('CONSULT', 'Consultation', 2500.00),
('CLEAN', 'Dental Cleaning', 4500.00),
('FILL', 'Dental Filling', 6500.00),
('EXTRACT', 'Tooth Extraction', 8000.00),
('ROOTCANAL', 'Root Canal Treatment', 18000.00),
('BRACES', 'Orthodontic Braces', 120000.00);
INSERT INTO users (username, password, full_name, role)
VALUES ('admin', 'admin123', 'Clinic Administrator', 'ADMIN');
SELECT * FROM users;
UPDATE users
SET password = '$2a$10$nnVVKLR2uu7aJBhB3Iy7YO1ftrg4J050gm0vRFc7rCiNasQMBOMwy'
WHERE username = 'admin';