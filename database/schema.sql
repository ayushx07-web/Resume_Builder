-- Resume Builder Complete Database Schema
-- MySQL 8.0+
-- Version: 1.0.0

-- Drop existing database (use with caution in production)
-- DROP DATABASE IF EXISTS resumebuilder;

-- Create database
CREATE DATABASE IF NOT EXISTS resumebuilder
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE resumebuilder;

-- ============================================================================
-- Table: users
-- Description: Stores user account information and authentication data
-- ============================================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed password',
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(20),
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255) COMMENT 'Token for password reset',
    reset_token_expiry DATETIME COMMENT 'Expiry time for reset token',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_active (active),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts and authentication';

-- ============================================================================
-- Table: templates
-- Description: Resume templates (both free and premium)
-- ============================================================================
CREATE TABLE templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    preview_image_url VARCHAR(500) COMMENT 'URL to template preview image',
    category VARCHAR(100) NOT NULL COMMENT 'Template category (Professional, Creative, etc.)',
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    price DECIMAL(10, 2) COMMENT 'Price for premium templates in INR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    download_count BIGINT DEFAULT 0,
    configuration TEXT COMMENT 'JSON configuration for template styling',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_premium (is_premium),
    INDEX idx_is_active (is_active),
    INDEX idx_download_count (download_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Resume templates (free and premium)';

-- ============================================================================
-- Table: resumes
-- Description: User resumes with JSON content storage
-- ============================================================================
CREATE TABLE resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    user_id BIGINT NOT NULL,
    template_id BIGINT,
    content JSON NOT NULL COMMENT 'Resume content in JSON format',
    is_draft BOOLEAN DEFAULT TRUE,
    last_saved_at DATETIME COMMENT 'Last auto-save timestamp',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_template_id (template_id),
    INDEX idx_is_draft (is_draft),
    INDEX idx_updated_at (updated_at),
    INDEX idx_created_at (created_at),
    
    FULLTEXT INDEX idx_title_fulltext (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User resumes with JSON content';

-- ============================================================================
-- Table: subscriptions
-- Description: User subscription management
-- ============================================================================
CREATE TABLE subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    plan ENUM('MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2),
    razorpay_subscription_id VARCHAR(255) COMMENT 'Razorpay subscription ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date),
    INDEX idx_plan (plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User subscription management';

-- ============================================================================
-- Table: payments
-- Description: Payment transactions and history
-- ============================================================================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    razorpay_order_id VARCHAR(255) UNIQUE COMMENT 'Razorpay order ID',
    razorpay_payment_id VARCHAR(255) UNIQUE COMMENT 'Razorpay payment ID',
    razorpay_signature VARCHAR(500) COMMENT 'Payment signature for verification',
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_type ENUM('TEMPLATE_PURCHASE', 'SUBSCRIPTION') NOT NULL,
    template_id BIGINT COMMENT 'Template ID for template purchases',
    subscription_id BIGINT COMMENT 'Subscription ID for subscription payments',
    description VARCHAR(500),
    failure_reason VARCHAR(500) COMMENT 'Reason for payment failure',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME COMMENT 'Payment completion timestamp',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_razorpay_order_id (razorpay_order_id),
    INDEX idx_razorpay_payment_id (razorpay_payment_id),
    INDEX idx_status (status),
    INDEX idx_payment_type (payment_type),
    INDEX idx_created_at (created_at),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Payment transactions and history';

-- ============================================================================
-- Table: user_purchased_templates
-- Description: Junction table for user template purchases
-- ============================================================================
CREATE TABLE user_purchased_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    template_id BIGINT NOT NULL,
    payment_id BIGINT COMMENT 'Reference to payment transaction',
    purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user_template (user_id, template_id),
    INDEX idx_user_id (user_id),
    INDEX idx_template_id (template_id),
    INDEX idx_purchased_at (purchased_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User template purchase tracking';

-- ============================================================================
-- Table: audit_logs (Optional - for tracking important actions)
-- ============================================================================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL COMMENT 'Action performed',
    entity_type VARCHAR(50) COMMENT 'Type of entity affected',
    entity_id BIGINT COMMENT 'ID of affected entity',
    ip_address VARCHAR(45) COMMENT 'User IP address',
    user_agent VARCHAR(255) COMMENT 'User agent string',
    details TEXT COMMENT 'Additional details in JSON',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit log for tracking important actions';

-- ============================================================================
-- Views for Analytics
-- ============================================================================

-- View: Active subscriptions count
CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT 
    COUNT(*) as active_count,
    plan,
    SUM(price) as monthly_revenue
FROM subscriptions
WHERE status = 'ACTIVE' AND end_date > NOW()
GROUP BY plan;

-- View: Revenue statistics
CREATE OR REPLACE VIEW v_revenue_stats AS
SELECT 
    DATE_FORMAT(completed_at, '%Y-%m') as month,
    COUNT(*) as transaction_count,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_transaction_value
FROM payments
WHERE status = 'SUCCESS'
GROUP BY DATE_FORMAT(completed_at, '%Y-%m')
ORDER BY month DESC;

-- View: Popular templates
CREATE OR REPLACE VIEW v_popular_templates AS
SELECT 
    t.id,
    t.name,
    t.category,
    t.is_premium,
    t.price,
    t.download_count,
    COUNT(r.id) as usage_count,
    COUNT(DISTINCT upt.user_id) as purchase_count
FROM templates t
LEFT JOIN resumes r ON t.id = r.template_id
LEFT JOIN user_purchased_templates upt ON t.id = upt.template_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.category, t.is_premium, t.price, t.download_count
ORDER BY t.download_count DESC, usage_count DESC;

-- ============================================================================
-- Stored Procedures
-- ============================================================================

DELIMITER $$

-- Procedure: Check and expire subscriptions
CREATE PROCEDURE sp_expire_subscriptions()
BEGIN
    UPDATE subscriptions
    SET status = 'EXPIRED'
    WHERE status = 'ACTIVE'
    AND end_date < NOW();
    
    SELECT ROW_COUNT() as expired_count;
END$$

-- Procedure: Get user statistics
CREATE PROCEDURE sp_get_user_stats(IN p_user_id BIGINT)
BEGIN
    SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        COUNT(DISTINCT r.id) as total_resumes,
        COUNT(DISTINCT upt.template_id) as purchased_templates,
        SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END) as total_spent,
        s.status as subscription_status,
        s.end_date as subscription_end_date
    FROM users u
    LEFT JOIN resumes r ON u.id = r.user_id
    LEFT JOIN user_purchased_templates upt ON u.id = upt.user_id
    LEFT JOIN payments p ON u.id = p.user_id
    LEFT JOIN subscriptions s ON u.id = s.user_id
    WHERE u.id = p_user_id
    GROUP BY u.id, u.username, u.email, u.created_at, s.status, s.end_date;
END$$

DELIMITER ;

-- ============================================================================
-- Triggers
-- ============================================================================

DELIMITER $$

-- Trigger: Update template download count
CREATE TRIGGER tr_resume_created_update_template_count
AFTER INSERT ON resumes
FOR EACH ROW
BEGIN
    IF NEW.template_id IS NOT NULL THEN
        UPDATE templates
        SET download_count = download_count + 1
        WHERE id = NEW.template_id;
    END IF;
END$$

-- Trigger: Audit log for user actions
CREATE TRIGGER tr_audit_user_changes
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.active != NEW.active THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (NEW.id, 'USER_STATUS_CHANGE', 'USER', NEW.id, 
                JSON_OBJECT('old_active', OLD.active, 'new_active', NEW.active));
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- Initial Data (Optional - for testing)
-- ============================================================================

-- Admin user (password: admin123)
-- Note: This is a BCrypt hash - you should generate a proper one
INSERT INTO users (username, email, password, first_name, last_name, role, active, email_verified)
VALUES ('admin', 'admin@resumebuilder.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
        'Admin', 'User', 'ADMIN', TRUE, TRUE);

-- ============================================================================
-- Database Maintenance
-- ============================================================================

-- Event: Daily cleanup of expired reset tokens
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS ev_cleanup_expired_tokens
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    UPDATE users
    SET reset_token = NULL, reset_token_expiry = NULL
    WHERE reset_token_expiry < NOW();

-- Event: Daily subscription expiration check
CREATE EVENT IF NOT EXISTS ev_expire_subscriptions
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    CALL sp_expire_subscriptions();

-- ============================================================================
-- Performance Optimization
-- ============================================================================

-- Analyze tables for query optimization
ANALYZE TABLE users, templates, resumes, subscriptions, payments, user_purchased_templates;

-- Optimize tables
OPTIMIZE TABLE users, templates, resumes, subscriptions, payments, user_purchased_templates;

-- ============================================================================
-- End of Schema
-- ============================================================================
