# ReWear Backend API Documentation

## Overview

The ReWear Backend is a Spring Boot application that provides a complete authentication and user management system with Google OAuth2 support and JWT token-based authentication.

## Features

- ✅ Email/Password Registration and Login
- ✅ Google OAuth2 Authentication
- ✅ JWT Token-based Authorization
- ✅ Token Refresh Mechanism
- ✅ User Profile Management
- ✅ Comprehensive Error Handling
- ✅ CORS Configuration for Frontend Integration
- ✅ Database Transaction Management
- ✅ Request/Response Logging

## Technology Stack

- **Framework**: Spring Boot 3.x
- **Security**: Spring Security 6.x, JWT (JSON Web Tokens)
- **Database**: MySQL
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven
- **Authentication**: OAuth2, JWT

## Prerequisites

- Java 21 or later
- Maven 3.8+
- MySQL 8.0+
- Google Cloud Console Account (for OAuth2)

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `backend` directory:

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/rewear
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Logging
JPA_SHOW_SQL=false
```

### 2. Database Setup

```sql
CREATE DATABASE IF NOT EXISTS rewear;
USE rewear;
```

The application will automatically create the `users` table via Hibernate DDL.

### 3. Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID (Web Application)
5. Add authorized redirect URI:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
6. For production, also add:
   ```
   https://yourdomain.com/login/oauth2/code/google
   ```

### 4. Build and Run

```bash
cd backend

# Build
mvn clean package

# Run
mvn spring-boot:run

# Or run the JAR
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

## API Endpoints

### Authentication Endpoints

#### 1. User Signup

**Endpoint**: `POST /api/auth/signup`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

**Response** (201 Created):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "isActive": true,
    "createdAt": "2026-05-19T10:30:00",
    "updatedAt": "2026-05-19T10:30:00"
  }
}
```

#### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "isActive": true,
    "createdAt": "2026-05-19T10:30:00",
    "updatedAt": "2026-05-19T10:30:00"
  }
}
```

#### 3. Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "isActive": true,
    "createdAt": "2026-05-19T10:30:00",
    "updatedAt": "2026-05-19T10:30:00"
  }
}
```

#### 4. Google OAuth2 Login

**Endpoint**: `GET /oauth2/authorization/google`

Redirects to Google consent screen. After user authorizes, Google redirects to:

```
/login/oauth2/code/google
```

Backend processes and redirects to:

```
http://localhost:3000/oauth2/callback?accessToken=...&refreshToken=...&userId=...&fullName=...&email=...&expiresIn=...
```

### User Management Endpoints

#### 1. Get Current User

**Endpoint**: `GET /api/users/me`

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "isActive": true,
  "createdAt": "2026-05-19T10:30:00",
  "updatedAt": "2026-05-19T10:30:00"
}
```

#### 2. Get User by ID

**Endpoint**: `GET /api/users/{id}`

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "isActive": true,
  "createdAt": "2026-05-19T10:30:00",
  "updatedAt": "2026-05-19T10:30:00"
}
```

#### 3. Update User

**Endpoint**: `PATCH /api/users/{id}`

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Request Body**:

```json
{
  "fullName": "Jane Doe",
  "email": "newemail@example.com",
  "password": "newPassword123"
}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "email": "newemail@example.com",
  "fullName": "Jane Doe",
  "isActive": true,
  "createdAt": "2026-05-19T10:30:00",
  "updatedAt": "2026-05-19T11:00:00"
}
```

#### 4. Get All Users

**Endpoint**: `GET /api/users`

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "isActive": true,
    "createdAt": "2026-05-19T10:30:00",
    "updatedAt": "2026-05-19T10:30:00"
  }
]
```

#### 5. Deactivate User

**Endpoint**: `PATCH /api/users/{id}/deactivate`

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):

```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "isActive": false,
  "createdAt": "2026-05-19T10:30:00",
  "updatedAt": "2026-05-19T11:00:00"
}
```

#### 6. Delete User

**Endpoint**: `DELETE /api/users/{id}`

**Headers**:

```
Authorization: Bearer {accessToken}
```

**Response** (204 No Content)

### Health Check Endpoints

#### 1. Basic Health Check

**Endpoint**: `GET /health`

**Response** (200 OK):

```json
{
  "status": "UP",
  "timestamp": "2026-05-19T10:30:00",
  "application": "ReWear Backend",
  "environment": "default"
}
```

#### 2. Detailed Health Check

**Endpoint**: `GET /health/detailed`

**Response** (200 OK):

```json
{
  "status": "UP",
  "timestamp": "2026-05-19T10:30:00",
  "application": "ReWear Backend",
  "environment": "default",
  "version": "1.0.0",
  "apiEndpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "oauth2": "/oauth2/authorization/google"
  }
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "timestamp": "2026-05-19T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Error description",
  "path": "/api/auth/signup",
  "validationErrors": {
    "email": "Invalid email format",
    "password": "Password must be between 6 and 72 characters"
  }
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content to return
- `400 Bad Request`: Invalid request parameters or validation failed
- `401 Unauthorized`: Invalid credentials or missing/invalid token
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Email already registered
- `500 Internal Server Error`: Server error

## Security Features

1. **JWT Authentication**: Access tokens expire after 15 minutes
2. **Refresh Tokens**: Long-lived tokens (7 days) for refreshing access
3. **Password Encryption**: BCrypt with salt
4. **CORS Protection**: Restricted to frontend URL
5. **OAuth2 with Google**: Secure third-party authentication
6. **CSRF Protection**: Disabled for stateless JWT (CORS handles protection)
7. **Error Handling**: Secure error messages (no stack traces exposed)

## Development

### Project Structure

```
backend/
├── src/main/java/com/rewear/backend/
│   ├── controller/          # REST endpoints
│   ├── service/             # Business logic
│   ├── repository/          # Database access
│   ├── model/               # JPA entities
│   ├── dto/                 # Data transfer objects
│   ├── security/            # JWT and OAuth2
│   ├── config/              # Spring configuration
│   ├── exception/           # Custom exceptions
│   └── mapper/              # Entity to DTO mapping
├── src/main/resources/
│   ├── application.properties
│   └── .env
└── pom.xml
```

### Building

```bash
# Build JAR
mvn clean package

# Run tests
mvn test

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

## Troubleshooting

### 1. JWT Token Validation Fails

- Check JWT_SECRET is at least 32 characters
- Ensure token hasn't expired
- Verify Bearer token format in Authorization header

### 2. OAuth2 Redirect Error

- Configure redirect URI in Google Cloud Console
- Ensure frontend URL matches app.frontend-url
- Check CORS configuration

### 3. Database Connection Error

- Verify MySQL is running
- Check DB_URL, DB_USERNAME, DB_PASSWORD
- Ensure database exists

### 4. CORS Issues

- Verify Frontend URL in SecurityConfig
- Check Origin header matches allowed origins
- Ensure Authorization header is included in requests

## Support

For issues or questions, please check:

1. Application logs in `target/` directory
2. Database tables in MySQL
3. Google Cloud Console credentials
4. Frontend .env configuration

## License

This project is part of the ReWear ecosystem.
