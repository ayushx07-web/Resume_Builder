-- Fix admin password
-- This sets the password to: admin123
-- BCrypt hash for "admin123"

USE resumebuilder;

UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@resumebuilder.com';

-- Verify the update
SELECT id, username, email, role, active FROM users WHERE email = 'admin@resumebuilder.com';
