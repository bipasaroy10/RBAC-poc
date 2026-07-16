# RBAC POC (Role-Based Access Control)

A Proof of Concept (POC) demonstrating a secure **Role-Based Access Control (RBAC)** system using **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication**.

The project implements user authentication and authorization where users are assigned specific roles, and access to protected APIs is granted based on those roles.

---

# Features

- User Registration
- User Login
- JWT Authentication
- Password Hashing using bcrypt
- Access Token Generation
- Refresh Token Support (if implemented)
- Protected Routes
- Role-Based Authorization
- Admin and User Roles
- Secure Middleware for Authentication
- MongoDB Database Integration
- Environment Variable Configuration
- RESTful API Design
- Error Handling

---

# Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- bcrypt
- dotenv
- cookie-parser
- nodemon

---

# Project Structure

```
RBAC-poc
│
├── controllers/
│      Authentication Controllers
│
├── middleware/
│      JWT Authentication
│      Role Authorization
│
├── models/
│      User Model
│      Refresh Token Model (if used)
│
├── routes/
│      Authentication Routes
│      Protected Routes
│
├── utils/
│      JWT Utilities
│      Cookie Utilities
│      Error Handling
│
├── config/
│      Database Configuration
│
├── .env
├── package.json
└── server.js
```

---

# RBAC Overview

RBAC (Role-Based Access Control) is an authorization mechanism that determines what actions a user can perform based on their assigned role.

Instead of checking permissions individually for every user, permissions are assigned to roles, and users inherit those permissions through their roles.

Example:

```
Admin
 ├── Create Users
 ├── Update Users
 ├── Delete Users
 ├── View All Users

User
 ├── View Own Profile
 ├── Update Own Profile
```

---

# Authentication Flow

1. User registers.
2. Password is hashed using bcrypt.
3. User logs in using email and password.
4. Server validates credentials.
5. JWT Access Token is generated.
6. Refresh Token is generated (if implemented).
7. Protected APIs verify the JWT.
8. Authorization middleware checks the user's role.
9. API is executed only if the role has permission.

---

# RBAC Implementation

## Step 1 - User Roles

Each user has a role stored in the database.

Example:

```json
{
    "name":"John",
    "email":"john@gmail.com",
    "role":"admin"
}
```

Possible roles:

- Admin
- User

---

## Step 2 - Authentication Middleware

Authentication middleware performs the following:

- Reads JWT token
- Verifies JWT
- Decodes user information
- Attaches user to the request object
- Allows request to continue

If the token is invalid:

```
401 Unauthorized
```

---

## Step 3 - Authorization Middleware

After authentication, authorization middleware checks the user's role.

Example:

```javascript
authorize("admin")
```

Only Admin users can access the route.

If the role does not match:

```
403 Forbidden
```

---

## Step 4 - Protected Routes

Example:

```
GET /users
```

Accessible only by:

```
Admin
```

Example:

```
GET /profile
```

Accessible by:

```
Authenticated Users
```

---

# API Flow

```
Client

   │

Register
   │

MongoDB

   │

Login

   │

JWT Token

   │

Protected Route

   │

Authentication Middleware

   │

Authorization Middleware

   │

Controller

   │

Response
```

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/bipasaroy10/RBAC-poc.git
```

---

## 2. Move Inside Project

```bash
cd RBAC-poc
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Create .env File

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_secret

REFRESH_TOKEN_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_EXPIRY=7d
```

Update the values according to your environment.

---

## 5. Start Server

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

# API Endpoints

## Authentication

### Register

```
POST /api/auth/register
```

Request Body

```json
{
    "name":"John",
    "email":"john@gmail.com",
    "password":"123456",
    "role":"user"
}
```

---

### Login

```
POST /api/auth/login
```

Request

```json
{
    "email":"john@gmail.com",
    "password":"123456"
}
```

Returns

- Access Token
- Refresh Token (if implemented)

---

### Logout

```
POST /api/auth/logout
```

Invalidates the refresh token or clears authentication cookies.

---

### Refresh Token

```
POST /api/auth/refresh-token
```

Generates a new access token using a valid refresh token.

---

# Authorization Examples

| Endpoint | User | Admin |
|----------|------|-------|
| Register | ✅ | ✅ |
| Login | ✅ | ✅ |
| View Profile | ✅ | ✅ |
| Get All Users | ❌ | ✅ |
| Delete User | ❌ | ✅ |
| Update User | ❌ | ✅ |

---

# Security Features

- Password Hashing using bcrypt
- JWT Authentication
- Role-Based Authorization
- Protected APIs
- Environment Variables
- Secure Middleware
- Input Validation
- Error Handling
- Token Expiration
- Refresh Token Mechanism (if implemented)

---

# Testing

Use Postman or Thunder Client.

Typical testing flow:

1. Register a User
2. Login
3. Copy Access Token
4. Add Header

```
Authorization: Bearer <token>
```

5. Access Protected APIs
6. Verify role restrictions by logging in as different users.

---

# Future Improvements

- Multiple Roles per User
- Permission-Based Authorization
- Email Verification
- Forgot Password
- OTP Verification
- Account Lock after Multiple Failed Attempts
- Audit Logs
- Admin Dashboard
- API Rate Limiting

---

# Learning Outcomes

This project demonstrates:

- JWT Authentication
- Secure Password Storage
- MongoDB Integration
- Express Middleware
- REST API Development
- Authentication Flow
- Authorization Flow
- Role-Based Access Control (RBAC)
- Backend Security Best Practices

---

# Author

**Bipasa Roy**

Backend Developer | Node.js | Express.js | MongoDB | JWT Authentication

GitHub:
https://github.com/bipasaroy10

---

# License

This project is developed for educational purposes and as a Proof of Concept (POC) for implementing secure Role-Based Access Control (RBAC) in a Node.js application.