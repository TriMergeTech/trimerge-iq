# Authentication & Resource Management API — TriMerge IQ

## Overview
A production-ready backend for the TriMerge IQ consulting platform. Built with Node.js, Express, and MongoDB (native driver). Handles authentication, RBAC, and full CRUD management for Positions, Services, Skills, and Clients.

**Production URL:** https://trimerge-iq.onrender.com
**API Docs (Swagger):** https://trimerge-iq.onrender.com/api-docs

---

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (native driver — no Mongoose)
- **Auth:** JWT (access + refresh tokens), bcrypt, Google OAuth
- **Email:** Mailgun (signup OTP, password reset)
- **Rate Limiting:** express-rate-limit
- **Docs:** Swagger UI (OpenAPI 3.0)
- **Testing:** Jest + Supertest (115 tests, real MongoDB)
- **Deployment:** Render

---

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

> **Note:** Mailgun sandbox accounts can only send to pre-authorized recipient emails. Add test emails to your authorized recipients list in the Mailgun dashboard.

3. Start the server:
```bash
npm start
```

4. Run tests:
```bash
npm test
```

API docs available at: `http://localhost:3000/api-docs`

---

## RBAC — Roles

| Role | Assigned at | Permissions |
|---|---|---|
| `client` | Signup | Read only on all CRUD endpoints |
| `staff` | Signup | Full CRUD on all resource endpoints |
| `admin` | Manual Atlas edit only | Full CRUD + user list |

> There is no API endpoint to promote a user to admin. Admin role must be set manually in MongoDB Atlas.

---

## Rate Limiting

| Endpoint | Limit |
|---|---|
| `POST /auth/login` | 10 requests per IP per 15 minutes |
| `POST /auth/refresh` | 30 requests per IP per 15 minutes |

Exceeding the limit returns `429 Too Many Requests`.

---

## All Endpoints (30 total)

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | public | Register, sends OTP email |
| POST | `/auth/verify` | public | Verify OTP, activate account |
| POST | `/auth/login` | public | Login, returns tokens |
| POST | `/auth/refresh` | public | Get new access token |
| POST | `/auth/forgot-password` | public | Request password reset OTP |
| POST | `/auth/reset-password` | public | Reset password with OTP |
| POST | `/auth/google` | public | Google OAuth login/signup |
| GET | `/auth/me` | any role | Get current user profile |
| GET | `/auth/dashboard` | staff / admin | Dashboard access |
| GET | `/auth/admin/users` | admin only | List all users |

### Positions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/positions` | any role | Get all positions |
| GET | `/positions/:id` | any role | Get one position |
| POST | `/positions` | staff / admin | Create a position |
| PUT | `/positions/:id` | staff / admin | Update a position |
| DELETE | `/positions/:id` | staff / admin | Delete a position |

### Services

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/services` | any role | Get all services |
| GET | `/services/:id` | any role | Get one service |
| POST | `/services` | staff / admin | Create a service |
| PUT | `/services/:id` | staff / admin | Update a service |
| DELETE | `/services/:id` | staff / admin | Delete a service |

### Skills

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/skills` | any role | Get all skills |
| GET | `/skills/:id` | any role | Get one skill |
| POST | `/skills` | staff / admin | Create a skill |
| PUT | `/skills/:id` | staff / admin | Update a skill |
| DELETE | `/skills/:id` | staff / admin | Delete a skill |

### Clients

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/clients` | any role | Get all clients |
| GET | `/clients/:id` | any role | Get one client |
| POST | `/clients` | staff / admin | Create a client |
| PUT | `/clients/:id` | staff / admin | Update a client |
| DELETE | `/clients/:id` | staff / admin | Delete a client |

---

## Request / Response Reference

### POST /auth/signup
```json
{
  "fullName": "Jane Doe",
  "email": "user@example.com",
  "profile": "staff",
  "password": "SecurePassword123"
}
```
Response `201`: `{ "message": "Signup successful. OTP sent to email." }`

---

### POST /auth/verify
```json
{ "email": "user@example.com", "otp": "123456" }
```
Response `200`: `{ "message": "Account verified", "refresh_token": "..." }`

---

### POST /auth/login
```json
{ "email": "user@example.com", "password": "SecurePassword123" }
```
Response `200`: `{ "access_token": "...", "refresh_token": "..." }`

---

### POST /auth/refresh
```json
{ "refresh_token": "..." }
```
Response `200`: `{ "access_token": "..." }`

---

### GET /auth/me
Header: `Authorization: Bearer <access_token>`

Response `200`:
```json
{
  "fullName": "Jane Doe",
  "email": "user@example.com",
  "profile": "staff",
  "role": "staff",
  "is_verified": true,
  "created_at": "..."
}
```

---

### POST /auth/forgot-password
```json
{ "email": "user@example.com" }
```
Response `200`: `{ "message": "If that email is registered, a reset OTP has been sent." }`

---

### POST /auth/reset-password
```json
{ "email": "user@example.com", "otp": "123456", "new_password": "NewPass123" }
```
Response `200`: `{ "message": "Password reset successful" }`

---

### POST /auth/google
```json
{ "id_token": "google_id_token", "profile": "staff" }
```
> `profile` required only for new users.

Response `200`: `{ "access_token": "...", "refresh_token": "..." }`

---

### POST /positions
```json
{
  "name": "Senior Accountant",
  "description": "Handles financial reporting",
  "responsibility": ["Prepare reports", "Review audits"],
  "skills": ["Excel", "GAAP"]
}
```
Response `201`: returns the created document with `_id`.

---

### POST /services
```json
{
  "title": "Tax Consulting",
  "descriptions": "End-to-end tax advisory",
  "skills": ["Tax Law", "IFRS"]
}
```
Response `201`: returns the created document with `_id`.

---

### POST /skills
```json
{ "name": "Financial Modelling", "description": "Building forecast models" }
```
Response `201`: returns the created document with `_id`.

---

### POST /clients
```json
{ "name": "Acme Corp", "about": "Global manufacturing company" }
```
Response `201`: returns the created document with `_id`.

---

## Database Collections

### `users`
| Field | Type | Notes |
|---|---|---|
| `fullName` | String | |
| `email` | String | Unique index |
| `password_hash` | String or null | null for Google users |
| `google_id` | String | Google OAuth users only |
| `profile` | String | `staff` or `client` |
| `role` | String | `staff`, `client`, or `admin` |
| `is_verified` | Boolean | Must be true to login |
| `created_at` | Date | |

### `positions`
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `description` | String | Required |
| `responsibility` | Array of Strings | Defaults to `[]` |
| `skills` | Array of Strings | Defaults to `[]` |
| `created_at` | Date | |

### `services`
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `descriptions` | String | Required |
| `skills` | Array of Strings | Defaults to `[]` |
| `created_at` | Date | |

### `skills`
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `description` | String | Required |
| `created_at` | Date | |

### `clients`
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `about` | String | Required |
| `created_at` | Date | |

### `otp_verifications`
| Field | Type | Notes |
|---|---|---|
| `email` | String | Indexed |
| `otp` | String | 6-digit code |
| `expires_at` | Date | TTL index — auto-deleted after 10 min |

### `password_resets`
Same structure as `otp_verifications`.

---

## Token Details
- `access_token` expires in **15 minutes**
- `refresh_token` expires in **30 days**
- Refresh tokens cannot be used as access tokens (enforced via `tokenType` claim)
- Email verification required before login

---

## Testing
115 tests across 5 test files, all hitting real MongoDB (no mocks).

```bash
npm test
```

| File | Tests |
|---|---|
| `tests/auth.test.js` | 25 |
| `tests/positions.test.js` | 25 |
| `tests/services.test.js` | 22 |
| `tests/skills.test.js` | 22 |
| `tests/clients.test.js` | 21 |

---

## Deployment
- **Production:** Render — https://trimerge-iq.onrender.com (auto-deploys on push to main)
- **Local:** `node index.js` — uses Mailgun for real email sending
- **CORS allowed origins:** `localhost:3000`, Firebase hosted UI, Render
