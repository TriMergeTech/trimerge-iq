# Authentication System

## Overview
This project implements a secure authentication backend using Node.js, Express, MongoDB, bcrypt, jsonwebtoken, nodemailer, and dotenv.

Supported flows:
- Signup with email OTP verification
- Verify OTP to activate account
- Login with JWT access and refresh tokens
- Refresh access token
- Authenticated user profile fetch

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root with:
```dotenv
PORT=3000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=a_very_long_random_string_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
```

3. Start the server:
```bash
npm start
```

## Endpoints

### 1. Signup
`POST /auth/signup`

Request body:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "profile": "client"
}
```

Response:
```json
{
  "message": "Signup successful. OTP sent to email."
}
```

### 2. Verify OTP
`POST /auth/verify`

Request body:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "message": "Account verified",
  "refresh_token": "..."
}
```

### 3. Login
`POST /auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

### 4. Refresh access token
`POST /auth/refresh`

Request body:
```json
{
  "refresh_token": "..."
}
```

Response:
```json
{
  "access_token": "..."
}
```

### 5. Get authenticated profile
`GET /auth/me`

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "email": "user@example.com",
  "profile": "client",
  "is_verified": true,
  "created_at": "..."
}
```

## Database Collections

### `users`
- `_id`
- `email`
- `password_hash`
- `profile` (`staff` or `client`)
- `is_verified`
- `created_at`

### `otp_verifications`
- `_id`
- `email`
- `otp`
- `expires_at`
- `created_at`

## Notes
- Use a valid SMTP email account for OTP delivery.
- `access_token` expires in 15 minutes.
- `refresh_token` expires in 30 days.
- The app enforces email verification before login.
