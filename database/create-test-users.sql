USE resumebuilder;

-- Delete existing users first
DELETE FROM users;

-- Create admin user with password: admin123
INSERT INTO users (username, email, password, first_name, last_name, role, active, email_verified, created_at, updated_at)
VALUES (
    'admin',
    'admin@resumebuilder.com',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'Admin',
    'User',
    'ADMIN',
    1,
    1,
    NOW(),
    NOW()
);

-- Create test user with password: test123
INSERT INTO users (username, email, password, first_name, last_name, role, active, email_verified, created_at, updated_at)
VALUES (
    'testuser',
    'test@test.com',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'Test',
    'User',
    'USER',
    1,
    1,
    NOW(),
    NOW()
);

-- Verify users created
SELECT id, username, email, role, active FROM users;
