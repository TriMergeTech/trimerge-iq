# Authentication System — TriMerge IQ

## Overview
A production-ready authentication backend using Node.js, Express, MongoDB, bcrypt, jsonwebtoken, Mailgun, and Google OAuth.

Supported flows:
- Signup with email OTP verification
- Verify OTP to activate account
- Login with JWT access and refresh tokens
- Refresh access token
- Authenticated user profile fetch
- Forgot password / Reset password via OTP
- Google OAuth login and signup

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root (see `.env.shared` for the template):
```dotenv
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/auth_task
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_sandbox_or_sending_domain
MAILGUN_SENDER=Your Name <you@yourdomain.com>
```

> **Note:** Mailgun sandbox accounts can only send to pre-authorized recipient emails. Add test emails to your authorized recipients list in the Mailgun dashboard, or upgrade to a sending domain to remove this restriction.

3. Start the server:
```bash
npm start
```

API docs available at: `http://localhost:3000/api-docs`

---

## Endpoints

### 1. Signup
`POST /auth/signup`

Request body:
```json
{
  "fullName": "Jane Doe",
  "email": "user@example.com",
  "profile": "client",
  "password": "SecurePassword123"
}
```

Response `201`:
```json
{
  "message": "Signup successful. OTP sent to email."
}
```

---

### 2. Verify OTP
`POST /auth/verify`

Request body:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response `200`:
```json
{
  "message": "Account verified",
  "refresh_token": "..."
}
```

---

### 3. Login
`POST /auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

Response `200`:
```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

---

### 4. Refresh Access Token
`POST /auth/refresh`

Request body:
```json
{
  "refresh_token": "..."
}
```

Response `200`:
```json
{
  "access_token": "..."
}
```

---

### 5. Get Authenticated Profile
`GET /auth/me`

Headers:
```
Authorization: Bearer <access_token>
```

Response `200`:
```json
{
  "fullName": "Jane Doe",
  "email": "user@example.com",
  "profile": "client",
  "is_verified": true,
  "created_at": "..."
}
```

---

### 6. Forgot Password
`POST /auth/forgot-password`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response `200` (always the same message regardless of whether the email exists):
```json
{
  "message": "If that email is registered, a reset OTP has been sent."
}
```

---

### 7. Reset Password
`POST /auth/reset-password`

Request body:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass123"
}
```

Response `200`:
```json
{
  "message": "Password reset successful"
}
```

---

### 8. Google OAuth Login / Signup
`POST /auth/google`

Request body:
```json
{
  "id_token": "google_id_token_from_client",
  "profile": "client"
}
```

> `profile` is required only for new users (staff or client). Existing users will retain their stored profile.

Response `200`:
```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

---

## Database Collections

### `users`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `fullName` | String | |
| `email` | String | Unique index |
| `password_hash` | String or null | null for Google users |
| `google_id` | String | Optional, Google OAuth users only |
| `profile` | String | `staff` or `client` |
| `is_verified` | Boolean | Must be true to login |
| `created_at` | Date | |

### `otp_verifications`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `email` | String | Indexed |
| `otp` | String | 6-digit code |
| `expires_at` | Date | TTL index — auto-deleted after 10 min |
| `created_at` | Date | |

### `password_resets`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `email` | String | Indexed |
| `otp` | String | 6-digit code |
| `expires_at` | Date | TTL index — auto-deleted after 10 min |
| `created_at` | Date | |

---

## Token Details
- `access_token` expires in **15 minutes**
- `refresh_token` expires in **30 days**
- Refresh tokens cannot be used as access tokens (enforced via `tokenType` claim)
- Email verification is required before login

## Deployment
- **Local:** `node index.js` (root) — uses Mailgun for real email sending
- **Firebase:** `functions/index.js` — deployed as a Cloud Function, email is logged to console in debug mode
