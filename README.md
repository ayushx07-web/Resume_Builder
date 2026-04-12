# Resume Builder - Full Stack Application

A complete, production-ready resume builder application with premium templates, payment integration, and PDF export functionality.

## 🚀 Features

### Authentication & Authorization
- User registration and login with JWT authentication
- Role-based access control (USER / ADMIN)
- Password encryption using BCrypt
- Forgot password with email OTP
- Protected routes

### Resume Management
- Create, edit, and delete resumes
- Multiple sections: Personal Info, Education, Experience, Skills, Projects, Certifications
- Auto-save functionality
- Draft management
- Live preview
- Template selection

### Premium Templates
- 13 professional templates (3 free, 10 premium)
- Template gallery with categories
- Template preview
- Locked premium templates for non-subscribers
- Admin template management

### Payment Integration
- Razorpay payment gateway integration
- Template purchase (one-time payment)
- Subscription system (Monthly/Quarterly/Yearly)
- Payment verification and webhook handling
- Payment history
- Transaction management

### PDF Export
- High-quality PDF generation using iText
- Multiple template formats
- Download resume as PDF
- Professional layout rendering

### Admin Panel
- User management (view, block, activate)
- Template management (CRUD operations)
- Transaction monitoring
- Revenue analytics
- System statistics

## 🛠️ Tech Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.1** - Framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Data persistence
- **Hibernate** - ORM
- **MySQL 8.0** - Database
- **Flyway** - Database migrations
- **JWT (JJWT 0.12.3)** - Token-based auth
- **iText 8.0.2** - PDF generation
- **Razorpay 1.4.6** - Payment integration
- **Swagger/OpenAPI** - API documentation
- **Lombok** - Reduce boilerplate
- **Maven** - Build tool

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router 6** - Routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Material-UI** - Component library
- **React Hook Form** - Form management
- **React-PDF** - PDF preview
- **React-Toastify** - Notifications

### Database
- **MySQL 8.0** - Primary database
- Normalized schema with proper indexes
- Foreign key constraints
- JSON columns for flexible data storage

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 📋 Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- npm or yarn
- MySQL 8.0 or higher
- Docker & Docker Compose (for containerized setup)
- Razorpay account (for payment integration)

## 🔧 Installation & Setup

### Option 1: Local Development Setup

#### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/resume-builder.git
cd resume-builder
```

2. **Configure Database**
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE resumebuilder;
exit;
```

3. **Configure Environment Variables**
```bash
cd backend
cp src/main/resources/application.properties src/main/resources/application-dev.properties
```

Edit `application-dev.properties`:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/resumebuilder
spring.datasource.username=root
spring.datasource.password=your_password

# JWT Secret (generate a secure random string)
jwt.secret=your_jwt_secret_key_min_32_characters

# Razorpay Credentials
razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_key_secret

# Email Configuration (for password reset)
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_specific_password
```

4. **Build and Run Backend**
```bash
# Using Maven
./mvnw clean install
./mvnw spring-boot:run

# Or using Maven Wrapper
mvn clean install
mvn spring-boot:run
```

Backend will start on `http://localhost:8080/api`

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

4. **Run Development Server**
```bash
npm run dev
# or
yarn dev
```

Frontend will start on `http://localhost:3000`

### Option 2: Docker Setup

1. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` with your configurations.

2. **Build and Run with Docker Compose**
```bash
docker-compose up --build
```

This will start:
- MySQL database on port 3306
- Backend API on port 8080
- Frontend on port 3000

## 📊 Database Schema

The application uses a normalized MySQL schema with the following tables:

- **users** - User accounts and authentication
- **resumes** - Resume data with JSON content
- **templates** - Resume templates (free & premium)
- **subscriptions** - User subscriptions
- **payments** - Transaction records
- **user_purchased_templates** - Template purchase tracking

See `database/schema.sql` for complete schema definition.

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@resumebuilder.com`
- Password: `admin123`

**Test User:**
- Email: `john.doe@example.com`
- Password: `user123`

**⚠️ Change these credentials in production!**

## 📚 API Documentation

Once the backend is running, access the Swagger UI:
```
http://localhost:8080/api/swagger-ui.html
```

### Key Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### Resumes
- `GET /api/resumes` - Get user's resumes
- `GET /api/resumes/{id}` - Get resume by ID
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/{id}` - Update resume
- `DELETE /api/resumes/{id}` - Delete resume
- `GET /api/resumes/{id}/pdf` - Download resume as PDF

#### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/{id}` - Get template details
- `GET /api/templates/free` - Get free templates
- `GET /api/templates/premium` - Get premium templates

#### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

#### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}/block` - Block user
- `GET /api/admin/templates` - Manage templates
- `POST /api/admin/templates` - Create template
- `PUT /api/admin/templates/{id}` - Update template
- `DELETE /api/admin/templates/{id}` - Delete template
- `GET /api/admin/payments` - View all transactions
- `GET /api/admin/analytics` - Get system analytics

## 🎨 Frontend Features

### Pages
- **Home** - Landing page with features
- **Login/Signup** - Authentication pages
- **Dashboard** - User dashboard with resume list
- **Resume Editor** - Interactive resume builder
- **Template Gallery** - Browse and select templates
- **Payment** - Razorpay integration
- **Profile** - User profile management
- **Admin Panel** - Administrative interface

### Components
- Responsive design for all screen sizes
- Loading states and error handling
- Form validation
- Toast notifications
- Protected routes
- Modal dialogs
- PDF preview

## 💳 Payment Integration

### Razorpay Setup

1. Create a Razorpay account at https://razorpay.com
2. Get your API keys from the dashboard
3. Configure keys in `application.properties` and `.env`

### Subscription Plans

- **Monthly**: ₹299/month
- **Quarterly**: ₹799/3 months (10% discount)
- **Yearly**: ₹2999/year (16% discount)

### Premium Template Pricing

Individual premium templates: ₹399 - ₹549 each

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/resume-builder-backend-1.0.0.jar
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the dist folder using nginx or any static server
```

### Docker Production Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

Ensure you set proper production values for:
- Database credentials
- JWT secret (strong, random key)
- Razorpay production keys
- Email SMTP credentials
- CORS allowed origins
- Application URL

## 📁 Project Structure

```
resume-builder/
├── backend/                  # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/resumebuilder/
│   │   │   │   ├── config/          # Security, Swagger, CORS
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── repository/      # Data repositories
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── exception/       # Exception handling
│   │   │   │   ├── mapper/          # DTO mappers
│   │   │   │   └── util/            # Utility classes
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/    # Flyway migrations
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── redux/           # Redux store
│   │   ├── utils/           # Utilities
│   │   ├── hooks/           # Custom hooks
│   │   └── styles/          # CSS/Tailwind
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── database/               # Database scripts
│   ├── schema.sql
│   └── seed-data.sql
├── docker-compose.yml
└── README.md
```

## 🔒 Security Features

- Password hashing with BCrypt
- JWT-based authentication
- CORS configuration
- SQL injection prevention (prepared statements)
- XSS protection
- CSRF protection
- Rate limiting (configurable)
- Input validation
- Role-based authorization

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check credentials in application.properties
   - Ensure database exists

2. **Port Already in Use**
   - Change port in application.properties (backend)
   - Change port in vite.config.js (frontend)

3. **Flyway Migration Errors**
   - Clean database and restart: `./mvnw flyway:clean flyway:migrate`

4. **JWT Token Errors**
   - Ensure JWT secret is at least 32 characters
   - Check token expiration settings

5. **Payment Integration Issues**
   - Verify Razorpay credentials
   - Check webhook URL configuration
   - Test with Razorpay test mode first

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email kandpalayush4@gmail.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Spring Boot Team
- React Team
- Razorpay
- iText
- All open-source contributors

---

**Built with ❤️ by ayushx07-web**
