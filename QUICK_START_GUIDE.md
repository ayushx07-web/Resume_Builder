# 🚀 Resume Builder - Quick Start Guide

## Prerequisites Installation

### 1. Install Required Software

#### For Windows:

**Java 17:**
```
1. Download from: https://adoptium.net/
2. Download "OpenJDK 17 (LTS)" for Windows
3. Run installer and follow instructions
4. Verify: Open Command Prompt and type: java -version
```

**Maven:**
```
1. Download from: https://maven.apache.org/download.cgi
2. Extract to C:\Program Files\Maven
3. Add to PATH: System Properties > Environment Variables > Path > Add: C:\Program Files\Maven\bin
4. Verify: mvn -version
```

**Node.js 18+:**
```
1. Download from: https://nodejs.org/
2. Install LTS version
3. Verify: node -version and npm -version
```

**MySQL 8.0:**
```
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Install MySQL Community Server
3. Remember your root password!
4. Verify: Open MySQL Workbench or Command Line
```

**Git (optional):**
```
Download from: https://git-scm.com/download/win
```

#### For Mac:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Java 17
brew install openjdk@17

# Install Maven
brew install maven

# Install Node.js
brew install node

# Install MySQL
brew install mysql
brew services start mysql

# Set MySQL root password
mysql_secure_installation
```

#### For Linux (Ubuntu/Debian):

```bash
# Update package list
sudo apt update

# Install Java 17
sudo apt install openjdk-17-jdk

# Install Maven
sudo apt install maven

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server
sudo mysql_secure_installation
```

---

## 🎯 Method 1: Quick Start with Docker (EASIEST - RECOMMENDED)

### Step 1: Install Docker

**Windows/Mac:**
- Download Docker Desktop from: https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Step 2: Extract Project
```bash
# Extract the downloaded file
tar -xzf resume-builder-project.tar.gz
cd resume-builder
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings (use any text editor)
# For Windows: notepad .env
# For Mac/Linux: nano .env or vim .env
```

**Minimum Required Configuration:**
```env
# Database
DB_PASSWORD=your_secure_password_here
DB_NAME=resumebuilder

# JWT Secret (must be at least 32 characters)
JWT_SECRET=MyVeryLongSecretKeyForJWTTokenGeneration123456789012345

# Razorpay (Get from https://razorpay.com - you can use test keys for now)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXX

# Email (Optional - for password reset)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### Step 4: Start All Services
```bash
# Start everything with one command
docker-compose up -d

# Wait 30-60 seconds for services to start
# Check if services are running
docker-compose ps
```

### Step 5: Access the Application
```
✅ Frontend:  http://localhost:3000
✅ Backend:   http://localhost:8080/api
✅ Swagger:   http://localhost:8080/api/swagger-ui.html
✅ Database:  localhost:3306 (root password from .env)
```

### Step 6: Login
```
Admin Account:
Email: admin@resumebuilder.com
Password: admin123

Test User:
Email: john.doe@example.com
Password: user123
```

### Docker Commands (Useful)
```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Stop and remove everything (fresh start)
docker-compose down -v
docker-compose up -d --build
```

---

## 🎯 Method 2: Manual Setup (For Development)

### Step 1: Extract Project
```bash
tar -xzf resume-builder-project.tar.gz
cd resume-builder
```

### Step 2: Setup Database

**Option A: Using MySQL Workbench (Windows/Mac)**
```
1. Open MySQL Workbench
2. Connect to localhost with root user
3. Click "File" > "Open SQL Script"
4. Select: resume-builder/database/schema.sql
5. Click Execute (lightning bolt icon)
```

**Option B: Using Command Line**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE resumebuilder;
exit;

# Import schema
mysql -u root -p resumebuilder < database/schema.sql
```

### Step 3: Configure Backend

```bash
cd backend

# Edit application.properties
# Windows: notepad src/main/resources/application.properties
# Mac/Linux: nano src/main/resources/application.properties
```

**Update these values:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/resumebuilder
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_ROOT_PASSWORD

jwt.secret=MyVeryLongSecretKeyForJWTTokenGeneration123456789012345

razorpay.key.id=rzp_test_XXXXXXXXXXXX
razorpay.key.secret=XXXXXXXXXXXXXXXXXXXX
```

### Step 4: Start Backend

**Using Maven Wrapper (Recommended):**
```bash
# Windows
mvnw.cmd clean install
mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw clean install
./mvnw spring-boot:run
```

**Using Maven directly:**
```bash
mvn clean install
mvn spring-boot:run
```

**Wait for this message:**
```
Started ResumeBuilderApplication in X seconds
```

**Backend is now running at:** http://localhost:8080/api

### Step 5: Start Frontend (New Terminal)

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Create .env file
# Windows: copy .env.example .env
# Mac/Linux: cp .env.example .env

# Edit .env
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Update .env:**
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
```

**Start development server:**
```bash
npm run dev
```

**Frontend is now running at:** http://localhost:3000

---

## 🧪 Testing the Application

### 1. Test Backend API

Open browser and go to:
```
http://localhost:8080/api/swagger-ui.html
```

Try the Login endpoint:
```json
POST /api/auth/login
{
  "emailOrUsername": "admin@resumebuilder.com",
  "password": "admin123"
}
```

You should get a JWT token back.

### 2. Test Frontend

Open browser:
```
http://localhost:3000
```

1. Click "Login"
2. Use: admin@resumebuilder.com / admin123
3. You should see the dashboard

### 3. Test Database

```bash
# Connect to MySQL
mysql -u root -p

# Use database
USE resumebuilder;

# Check tables
SHOW TABLES;

# Check users
SELECT * FROM users;

# Check templates
SELECT id, name, is_premium, price FROM templates;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:** "Port 8080 is already in use"

**Solution:**
```bash
# Find what's using the port
# Windows:
netstat -ano | findstr :8080

# Mac/Linux:
lsof -i :8080

# Kill the process or change port in application.properties
server.port=8081
```

### Issue 2: Database Connection Failed

**Error:** "Could not connect to database"

**Solutions:**
1. Check MySQL is running:
   ```bash
   # Windows: Open Services, look for MySQL
   # Mac: brew services list
   # Linux: sudo systemctl status mysql
   ```

2. Verify credentials in application.properties

3. Check database exists:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

### Issue 3: Maven Build Failed

**Error:** "Could not resolve dependencies"

**Solution:**
```bash
# Clear Maven cache
mvn clean
rm -rf ~/.m2/repository

# Rebuild
mvn clean install -U
```

### Issue 4: Frontend Won't Start

**Error:** "Cannot find module" or "npm ERR!"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue 5: JWT Token Invalid

**Error:** "Invalid JWT token"

**Solution:**
- Ensure JWT_SECRET in .env is at least 32 characters
- Restart backend after changing JWT_SECRET
- Clear browser cookies

---

## 📱 Access Points Summary

### Local Development
```
Frontend:        http://localhost:3000
Backend API:     http://localhost:8080/api
Swagger UI:      http://localhost:8080/api/swagger-ui.html
Database:        localhost:3306
```

### Default Accounts
```
Admin:
  Email: admin@resumebuilder.com
  Password: admin123

Test User:
  Email: john.doe@example.com
  Password: user123
```

---

## 🎨 What You Can Do Now

### As Admin:
1. **User Management**
   - Go to http://localhost:3000/admin/users
   - View all users, block/unblock users

2. **Template Management**
   - Go to http://localhost:3000/admin/templates
   - Create, edit, delete templates
   - Set pricing

3. **View Analytics**
   - Go to http://localhost:3000/admin/analytics
   - See revenue, user stats

### As User:
1. **Create Resume**
   - Click "Create Resume"
   - Fill in your information
   - Choose a template
   - Download as PDF

2. **Browse Templates**
   - View all templates
   - Purchase premium templates

3. **Manage Subscription**
   - Subscribe to premium access
   - View payment history

---

## 🔄 Stopping the Application

### Docker Method:
```bash
# Stop services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

### Manual Method:
```bash
# Stop Backend: Press Ctrl+C in backend terminal
# Stop Frontend: Press Ctrl+C in frontend terminal
```

---

## 📚 Next Steps

1. **Read Full Documentation**
   - See README.md for detailed features
   - Check API_DOCUMENTATION.md for all endpoints

2. **Configure Razorpay**
   - Sign up at https://razorpay.com
   - Get test API keys
   - Update in .env file

3. **Setup Email**
   - Use Gmail with App Password
   - Or use SendGrid, Mailgun, etc.

4. **Customize**
   - Add your own templates
   - Modify frontend styling
   - Add new features

5. **Deploy to Production**
   - See DEPLOYMENT_GUIDE.md
   - Use Docker or cloud services

---

## 💡 Pro Tips

1. **Use Docker Desktop Dashboard** (Windows/Mac)
   - Visual interface to manage containers
   - View logs easily
   - Restart services with one click

2. **Install MySQL Workbench**
   - Visual database management
   - Easy to browse data
   - Run queries with GUI

3. **Use Postman or Thunder Client**
   - Test API endpoints
   - Save requests
   - Import Swagger JSON

4. **Enable Auto-reload**
   - Backend: Spring DevTools (already included)
   - Frontend: Vite auto-reloads (default)

---

## 📞 Need Help?

1. Check the error logs:
   ```bash
   # Docker
   docker-compose logs backend
   docker-compose logs frontend
   
   # Manual
   Check terminal output
   ```

2. Review documentation:
   - README.md
   - API_DOCUMENTATION.md
   - DEPLOYMENT_GUIDE.md

3. Common issues are usually:
   - Wrong database credentials
   - MySQL not running
   - Port conflicts
   - Missing environment variables

---

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can login with admin credentials
- [ ] Swagger UI accessible
- [ ] Can see templates in gallery
- [ ] Database has seed data
- [ ] Can create a resume
- [ ] PDF download works (may need additional setup)

---

**🎉 You're ready to go! Happy coding!**
