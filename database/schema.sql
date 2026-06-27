CREATE DATABASE IF NOT EXISTS cogniguard_ai;
USE cogniguard_ai;

CREATE TABLE IF NOT EXISTS security_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    confidence INT NOT NULL,
    snapshot_url TEXT,
    reason TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_state (
    id INT AUTO_INCREMENT PRIMARY KEY,
    state_key VARCHAR(50) UNIQUE NOT NULL,
    state_value VARCHAR(255) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS authorized_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    employee_id VARCHAR(100),
    profile_picture LONGTEXT,
    face_descriptor JSON,
    enrollment_quality_score FLOAT,
    images_used INT,
    avg_detection_confidence FLOAT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_faces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    base64_image LONGTEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES authorized_users(id) ON DELETE CASCADE
);


-- Insert default config
INSERT IGNORE INTO configuration (config_key, config_value) VALUES 
('absence_timeout', '10'),
('confidence_threshold', '90'),
('observation_buffer_size', '5'),
('risk_threshold', '75'),
('demo_mode', 'false');
