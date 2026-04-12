# Resume Builder API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "type": "Bearer",
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "hasPremiumAccess": false
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "emailOrUsername": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "type": "Bearer",
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "hasPremiumAccess": false
  }
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## Resume Endpoints

### Get All User Resumes
```http
GET /api/resumes
```

**Query Parameters:**
- `page` (optional, default: 0)
- `size` (optional, default: 10)
- `search` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Software Engineer Resume",
        "userId": 1,
        "templateId": 2,
        "templateName": "Modern Professional",
        "content": "{...}",
        "isDraft": false,
        "lastSavedAt": "2024-01-15T10:30:00",
        "createdAt": "2024-01-10T08:00:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

### Get Resume by ID
```http
GET /api/resumes/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Software Engineer Resume",
    "content": "{...}",
    "templateId": 2
  }
}
```

### Create Resume
```http
POST /api/resumes
```

**Request Body:**
```json
{
  "title": "My Resume",
  "templateId": 1,
  "content": "{\"personal\":{\"name\":\"John Doe\",...}}",
  "isDraft": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume created successfully",
  "data": {
    "id": 2,
    "title": "My Resume",
    "userId": 1,
    "templateId": 1,
    "isDraft": true
  }
}
```

### Update Resume
```http
PUT /api/resumes/{id}
```

**Request Body:** Same as Create Resume

**Response:**
```json
{
  "success": true,
  "message": "Resume updated successfully",
  "data": {...}
}
```

### Delete Resume
```http
DELETE /api/resumes/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

### Download Resume as PDF
```http
GET /api/resumes/{id}/pdf
```

**Response:** PDF file download

---

## Template Endpoints

### Get All Templates
```http
GET /api/templates
```

**Query Parameters:**
- `page` (optional)
- `size` (optional)
- `category` (optional)
- `premium` (optional, true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Classic Professional",
        "description": "A traditional, clean resume template",
        "previewImageUrl": "https://...",
        "category": "Professional",
        "isPremium": false,
        "price": null,
        "isActive": true,
        "downloadCount": 1523,
        "configuration": "{...}"
      }
    ],
    "totalElements": 13,
    "totalPages": 2
  }
}
```

### Get Template by ID
```http
GET /api/templates/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Classic Professional",
    "description": "...",
    "isPremium": false
  }
}
```

### Get Free Templates
```http
GET /api/templates/free
```

### Get Premium Templates
```http
GET /api/templates/premium
```

---

## Payment Endpoints

### Create Payment Order
```http
POST /api/payments/create-order
```

**Request Body:**
```json
{
  "amount": 499.00,
  "currency": "INR",
  "paymentType": "TEMPLATE_PURCHASE",
  "templateId": 5,
  "description": "Purchase Executive Elite Template"
}
```

or for subscription:

```json
{
  "amount": 299.00,
  "currency": "INR",
  "paymentType": "SUBSCRIPTION",
  "subscriptionPlan": "MONTHLY",
  "description": "Monthly Premium Subscription"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "orderId": "order_MN1234567890",
    "amount": 499.00,
    "currency": "INR",
    "razorpayKeyId": "rzp_test_..."
  }
}
```

### Verify Payment
```http
POST /api/payments/verify
```

**Request Body:**
```json
{
  "razorpayOrderId": "order_MN1234567890",
  "razorpayPaymentId": "pay_MN1234567890",
  "razorpaySignature": "signature_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "status": "SUCCESS",
    "paymentId": 1
  }
}
```

### Get Payment History
```http
GET /api/payments/history
```

**Query Parameters:**
- `page` (optional)
- `size` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "amount": 499.00,
        "currency": "INR",
        "status": "SUCCESS",
        "paymentType": "TEMPLATE_PURCHASE",
        "description": "Purchase Executive Elite Template",
        "createdAt": "2024-01-15T14:30:00",
        "completedAt": "2024-01-15T14:30:45"
      }
    ]
  }
}
```

---

## Admin Endpoints

### Get All Users
```http
GET /api/admin/users
```

**Query Parameters:**
- `page` (optional)
- `size` (optional)
- `search` (optional)
- `role` (optional: USER, ADMIN)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "role": "USER",
        "active": true,
        "hasPremiumAccess": true,
        "createdAt": "2024-01-01T00:00:00"
      }
    ]
  }
}
```

### Block/Unblock User
```http
PUT /api/admin/users/{id}/block
```

**Request Body:**
```json
{
  "active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

### Create Template (Admin)
```http
POST /api/admin/templates
```

**Request Body:**
```json
{
  "name": "New Template",
  "description": "Description",
  "previewImageUrl": "https://...",
  "category": "Professional",
  "isPremium": true,
  "price": 499.00,
  "configuration": "{...}",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {...}
}
```

### Update Template (Admin)
```http
PUT /api/admin/templates/{id}
```

**Request Body:** Same as Create Template

### Delete Template (Admin)
```http
DELETE /api/admin/templates/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Get All Transactions
```http
GET /api/admin/payments
```

**Query Parameters:**
- `page` (optional)
- `size` (optional)
- `status` (optional: PENDING, SUCCESS, FAILED)

### Get Analytics
```http
GET /api/admin/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1523,
    "activeUsers": 1450,
    "totalResumes": 3245,
    "totalRevenue": 125000.00,
    "activeSubscriptions": 234,
    "templatePurchases": 456,
    "popularTemplates": [...]
  }
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details (only in development)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## Rate Limiting

API rate limits (configurable):
- **Anonymous**: 100 requests per hour
- **Authenticated**: 1000 requests per hour
- **Admin**: Unlimited

---

## Webhooks

### Razorpay Webhook
```http
POST /api/webhooks/razorpay
```

Handles payment notifications from Razorpay for:
- Payment success
- Payment failure
- Subscription renewal
- Subscription cancellation

---

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"john@example.com","password":"password123"}'
```

### Get Resumes (with auth)
```bash
curl -X GET http://localhost:8080/api/resumes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

For complete interactive API documentation, visit:
**http://localhost:8080/api/swagger-ui.html**
