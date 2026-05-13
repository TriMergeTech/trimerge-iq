# Authentication & Resource Management API — TriMerge IQ

## Overview
A production-ready backend for the TriMerge IQ consulting platform. Built with Node.js, Express, and MongoDB (native driver). Handles authentication, RBAC, and full CRUD management for Positions, Services, Skills, Clients, Projects, Staff, and Tools.

**Production URL:** https://trimerge-iq.onrender.com
**API Docs (Swagger):** https://trimerge-iq.onrender.com/api-docs
**GitHub:** https://github.com/TriMergeTech/trimerge-iq (branch: `task-001-auth`)

---

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (native driver — no Mongoose)
- **Auth:** JWT (access + refresh tokens), bcrypt, Google OAuth
- **Email:** Mailgun (signup OTP, password reset)
- **Rate Limiting:** express-rate-limit
- **Docs:** Swagger UI (OpenAPI 3.0)
- **Testing:** Jest + Supertest (191 tests, real MongoDB)
- **Deployment:** Render

> **Auth currently disabled:** `authMiddleware` and `requireRole` are commented out on all endpoints — all routes are fully public. Re-enable by uncommenting `/* authMiddleware, ... */` in each route file and `index.js`.

---

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root:
```dotenv
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/auth_task
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_sandbox_or_sending_domain
MAILGUN_SENDER=Your Name <you@yourdomain.com>
```

3. Start the server:
```bash
node index.js
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

> Admin role must be set manually in MongoDB Atlas — no API endpoint exists for this.

---

## Rate Limiting

| Endpoint | Limit |
|---|---|
| `POST /auth/login` | 10 requests per IP per 15 minutes |
| `POST /auth/refresh` | 30 requests per IP per 15 minutes |

---

## All Endpoints (47 total)

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

### Projects

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/projects` | any role | Get all projects |
| GET | `/projects/:id` | any role | Get one project |
| POST | `/projects` | staff / admin | Create a project |
| PUT | `/projects/:id` | staff / admin | Update a project |
| DELETE | `/projects/:id` | staff / admin | Delete a project |

### Staff

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/staff` | any role | Get all staff members |
| GET | `/staff/:id` | any role | Get one staff member |
| POST | `/staff` | staff / admin | Create a staff member |
| PUT | `/staff/:id` | staff / admin | Update a staff member |
| DELETE | `/staff/:id` | staff / admin | Delete a staff member |

### Tools

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/tools` | any role | Get all tools |
| GET | `/tools/:id` | any role | Get one tool |
| POST | `/tools` | staff / admin | Create a tool |
| PUT | `/tools/:id` | staff / admin | Update a tool |
| DELETE | `/tools/:id` | staff / admin | Delete a tool |
| POST | `/assign_tools_to_staff` | staff / admin | Assign tools to a staff member |
| GET | `/get_staff_tools/:staff_id` | any role | Get full tool objects for a staff member |

---

## Request / Response Reference

### POST /auth/signup
```json
{ "fullName": "Jane Doe", "email": "user@example.com", "profile": "staff", "password": "SecurePassword123" }
```
Response `201`: `{ "message": "Signup successful. OTP sent to email." }`

---

### POST /auth/login
```json
{ "email": "user@example.com", "password": "SecurePassword123" }
```
Response `200`: `{ "access_token": "...", "refresh_token": "..." }`

---

### POST /positions
```json
{
  "name": "Senior Accountant",
  "description": "Handles financial reporting",
  "responsibility": ["Prepare reports", "Review audits"],
  "skills": ["<skill _id>", "<skill _id>"]
}
```
> `skills` stores MongoDB `_id` strings of skill documents — not plain names.

Response `201`: returns the created document with `_id`.

---

### POST /services
```json
{
  "title": "Tax Consulting",
  "descriptions": "End-to-end tax advisory",
  "skills": ["<skill _id>", "<skill _id>"]
}
```
> `skills` stores MongoDB `_id` strings of skill documents — not plain names.

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

### POST /projects
```json
{
  "name": "Q3 Audit",
  "description": "Quarterly audit for Acme Corp",
  "project_manager": "<uuid>",
  "team": ["<uuid>", "<uuid>"],
  "client": "<uuid>",
  "service": "<uuid>"
}
```
> All ID fields are UUID strings (`crypto.randomUUID()`) — not MongoDB ObjectIds.

Response `201`: returns the created document with `_id`.

---

### POST /staff
```json
{ "name": "Alice Ramirez", "email": "alice@trimergecpa.com", "position": "<position _id>" }
```
> `position` is a UUID string referencing a position document. Email is normalized to lowercase.

Response `201`: returns the created document with `_id`.

---

### POST /tools
```json
{
  "name": "create_api_endpoint",
  "description": "Creates a new backend API endpoint.",
  "arguments": {
    "route": { "type": "string", "description": "API route path" },
    "method": { "type": "string", "description": "HTTP method such as GET or POST" }
  }
}
```
Response `201`: returns the created document with `_id`.

---

### POST /assign_tools_to_staff
```json
{ "staff": "<staff _id>", "tools": ["<tool _id>", "<tool _id>"] }
```
> Replaces the existing tools array on the staff member.

Response `200`: `{ "message": "Tools assigned" }`

---

### GET /get_staff_tools/:staff_id
Returns the full tool objects assigned to a staff member:
```json
[
  {
    "_id": "...",
    "name": "create_api_endpoint",
    "description": "Creates a new backend API endpoint.",
    "arguments": { ... }
  }
]
```

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
| `skills` | Array of Strings | MongoDB `_id` refs to skills collection |
| `created_at` | Date | |

### `services`
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `descriptions` | String | Required |
| `skills` | Array of Strings | MongoDB `_id` refs to skills collection |
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

### `projects`
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `description` | String | Required |
| `project_manager` | String (UUID) | Required |
| `team` | Array of Strings (UUID) | Required |
| `client` | String (UUID) | Required |
| `service` | String (UUID) | Required |
| `created_at` | Date | |

### `staff_members`
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Required — normalized lowercase |
| `position` | String (UUID) | Required — ref to positions collection |
| `tools` | Array of Strings | Tool `_id` refs — set via `/assign_tools_to_staff` |
| `created_at` | Date | |

### `tools`
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `description` | String | Required |
| `arguments` | Object | Required — flexible nested object |
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
191 tests across 8 test files, all hitting real MongoDB (no mocks).

> Note: 401/403 auth tests will fail while auth middleware is disabled — this is expected.

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
| `tests/projects.test.js` | 26 |
| `tests/staff.test.js` | 24 |
| `tests/tools.test.js` | 26 |

---

## CORS Allowed Origins
- `http://localhost:3000`
- `https://trimergenextjs.web.app`
- `https://trimerge-nextjs-app.web.app`
- `https://trimerge-backend--trimerge-nextjs-app.us-central1.hosted.app`
- `https://trimerge-iq.onrender.com`

---

## Deployment
- **Production:** Render — https://trimerge-iq.onrender.com (auto-deploys on push to `task-001-auth`)
- **Local:** `node index.js`
