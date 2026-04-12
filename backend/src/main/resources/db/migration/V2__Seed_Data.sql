-- V2__Seed_Data.sql
-- Seed data for Resume Builder application

-- Insert Admin User (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, role, active, email_verified, created_at)
VALUES ('admin', 'admin@resumebuilder.com', '$2a$10$8JKH.nQJ4xKJ4lZ0qH4Lj.1YfZ4YWdZ4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4u', 'Admin', 'User', 'ADMIN', TRUE, TRUE, NOW());

-- Insert Sample User (password: user123)
INSERT INTO users (username, email, password, first_name, last_name, role, active, email_verified, created_at)
VALUES ('john.doe', 'john.doe@example.com', '$2a$10$8JKH.nQJ4xKJ4lZ0qH4Lj.1YfZ4YWdZ4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4u', 'John', 'Doe', 'USER', TRUE, TRUE, NOW());

-- Insert Free Templates
INSERT INTO templates (name, description, preview_image_url, category, is_premium, price, is_active, configuration, created_at)
VALUES 
('Classic Professional', 'A traditional, clean resume template perfect for any industry', 'https://via.placeholder.com/400x550/4A90E2/FFFFFF?text=Classic', 'Professional', FALSE, NULL, TRUE, '{"primaryColor": "#2C3E50", "secondaryColor": "#3498DB", "font": "Arial", "fontSize": 11}', NOW()),

('Modern Minimalist', 'Sleek and contemporary design with ample white space', 'https://via.placeholder.com/400x550/95A5A6/FFFFFF?text=Modern', 'Modern', FALSE, NULL, TRUE, '{"primaryColor": "#34495E", "secondaryColor": "#16A085", "font": "Helvetica", "fontSize": 10}', NOW()),

('Creative Designer', 'Bold and artistic template for creative professionals', 'https://via.placeholder.com/400x550/E74C3C/FFFFFF?text=Creative', 'Creative', FALSE, NULL, TRUE, '{"primaryColor": "#C0392B", "secondaryColor": "#F39C12", "font": "Georgia", "fontSize": 11}', NOW());

-- Insert Premium Templates
INSERT INTO templates (name, description, preview_image_url, category, is_premium, price, is_active, configuration, created_at)
VALUES 
('Executive Elite', 'Premium template designed for C-level executives and senior management', 'https://via.placeholder.com/400x550/1ABC9C/FFFFFF?text=Executive', 'Executive', TRUE, 499.00, TRUE, '{"primaryColor": "#16A085", "secondaryColor": "#F1C40F", "font": "Times New Roman", "fontSize": 12}', NOW()),

('Tech Innovator', 'Perfect for software engineers and tech professionals with modern aesthetics', 'https://via.placeholder.com/400x550/3498DB/FFFFFF?text=Tech', 'Technology', TRUE, 399.00, TRUE, '{"primaryColor": "#2980B9", "secondaryColor": "#27AE60", "font": "Courier New", "fontSize": 10}', NOW()),

('Medical Professional', 'Specialized template for healthcare and medical professionals', 'https://via.placeholder.com/400x550/9B59B6/FFFFFF?text=Medical', 'Medical', TRUE, 449.00, TRUE, '{"primaryColor": "#8E44AD", "secondaryColor": "#3498DB", "font": "Arial", "fontSize": 11}', NOW()),

('Finance Expert', 'Professional template tailored for finance and banking sector', 'https://via.placeholder.com/400x550/34495E/FFFFFF?text=Finance', 'Finance', TRUE, 499.00, TRUE, '{"primaryColor": "#2C3E50", "secondaryColor": "#1ABC9C", "font": "Calibri", "fontSize": 11}', NOW()),

('Marketing Maven', 'Dynamic template for marketing and communications professionals', 'https://via.placeholder.com/400x550/E67E22/FFFFFF?text=Marketing', 'Marketing', TRUE, 399.00, TRUE, '{"primaryColor": "#D35400", "secondaryColor": "#E74C3C", "font": "Verdana", "fontSize": 10}', NOW()),

('Academic Scholar', 'Comprehensive template for academic and research positions', 'https://via.placeholder.com/400x550/16A085/FFFFFF?text=Academic', 'Academic', TRUE, 449.00, TRUE, '{"primaryColor": "#138D75", "secondaryColor": "#2980B9", "font": "Times New Roman", "fontSize": 11}', NOW()),

('Sales Champion', 'Results-oriented template highlighting achievements and metrics', 'https://via.placeholder.com/400x550/C0392B/FFFFFF?text=Sales', 'Sales', TRUE, 399.00, TRUE, '{"primaryColor": "#A93226", "secondaryColor": "#F39C12", "font": "Arial", "fontSize": 11}', NOW()),

('Legal Professional', 'Formal and authoritative template for legal practitioners', 'https://via.placeholder.com/400x550/7F8C8D/FFFFFF?text=Legal', 'Legal', TRUE, 499.00, TRUE, '{"primaryColor": "#566573", "secondaryColor": "#34495E", "font": "Times New Roman", "fontSize": 12}', NOW()),

('Startup Founder', 'Entrepreneurial template showcasing innovation and leadership', 'https://via.placeholder.com/400x550/F39C12/FFFFFF?text=Startup', 'Startup', TRUE, 449.00, TRUE, '{"primaryColor": "#E67E22", "secondaryColor": "#3498DB", "font": "Helvetica", "fontSize": 11}', NOW()),

('Designer Portfolio', 'Visual-first template perfect for designers and artists', 'https://via.placeholder.com/400x550/E91E63/FFFFFF?text=Designer', 'Creative', TRUE, 549.00, TRUE, '{"primaryColor": "#C2185B", "secondaryColor": "#9C27B0", "font": "Georgia", "fontSize": 10}', NOW());

-- Insert Sample Resume for Demo User
INSERT INTO resumes (title, user_id, template_id, content, is_draft, last_saved_at, created_at)
VALUES (
    'Software Engineer Resume',
    2,
    1,
    '{"personal":{"name":"John Doe","email":"john.doe@example.com","phone":"+1 (555) 123-4567","address":"San Francisco, CA","summary":"Experienced Full Stack Developer with 5+ years of expertise in building scalable web applications"},"education":[{"institution":"Stanford University","degree":"Bachelor of Science","field":"Computer Science","startDate":"2015-09","endDate":"2019-05","gpa":"3.8"}],"experience":[{"company":"Tech Corp","position":"Senior Software Engineer","location":"San Francisco, CA","startDate":"2019-06","endDate":"Present","description":["Led development of microservices architecture serving 1M+ users","Implemented CI/CD pipeline reducing deployment time by 60%","Mentored team of 5 junior developers"]}],"skills":{"technical":["JavaScript","React","Node.js","Python","AWS","Docker"],"languages":["English (Native)","Spanish (Intermediate)"],"soft":["Leadership","Problem Solving","Communication"]},"projects":[{"name":"E-Commerce Platform","description":"Built full-stack e-commerce solution with payment integration","technologies":["React","Node.js","MongoDB","Stripe"],"link":"https://github.com/johndoe/ecommerce"}],"certifications":[{"name":"AWS Solutions Architect","issuer":"Amazon Web Services","date":"2022-03"}],"achievements":["Reduced application load time by 40%","Won company hackathon 2021","Published 3 technical articles"]}',
    FALSE,
    NOW(),
    NOW()
);

-- Insert Subscription Plans (for reference)
-- Monthly: 299 INR, Quarterly: 799 INR (10% discount), Yearly: 2999 INR (16% discount)
