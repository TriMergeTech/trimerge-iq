require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ─── Replicate helpers from index.js ─────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET;

function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

function createRefreshToken(payload) {
  return jwt.sign({ ...payload, tokenType: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.tokenType === 'refresh') {
      return res.status(401).json({ message: 'Access token required' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

// ─── Test users ───────────────────────────────────────────────────────────────

const VERIFIED_EMAIL = 'test-auth-verified@trimerge-test.local';
const UNVERIFIED_EMAIL = 'test-auth-unverified@trimerge-test.local';
const TEST_PASSWORD = 'TestPassword123';

// ─── Setup ────────────────────────────────────────────────────────────────────

let mongoClient;
let users;
let app;
let verifiedUserId;

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  users = mongoClient.db().collection('users');

  // Clean up any leftover test users from a previous interrupted run
  await users.deleteMany({ email: { $in: [VERIFIED_EMAIL, UNVERIFIED_EMAIL] } });

  const password_hash = await bcrypt.hash(TEST_PASSWORD, 12);

  const verifiedResult = await users.insertOne({
    fullName: 'Test Verified User',
    email: VERIFIED_EMAIL,
    password_hash,
    profile: 'staff',
    role: 'staff',
    is_verified: true,
    created_at: new Date(),
  });
  verifiedUserId = verifiedResult.insertedId;

  await users.insertOne({
    fullName: 'Test Unverified User',
    email: UNVERIFIED_EMAIL,
    password_hash,
    profile: 'staff',
    role: 'staff',
    is_verified: false,
    created_at: new Date(),
  });

  // Build the mini app — same route logic as index.js, no email dependencies
  app = express();
  app.use(express.json());

  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your account before logging in' });
    }

    const payload = { userId: user._id.toString(), email: user.email, profile: user.profile, role: user.role || user.profile || 'client' };
    return res.json({ access_token: createAccessToken(payload), refresh_token: createRefreshToken(payload) });
  });

  app.post('/auth/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    try {
      const payload = jwt.verify(refresh_token, JWT_SECRET);
      if (payload.tokenType !== 'refresh') {
        throw new Error('Token is not a refresh token');
      }
      return res.json({ access_token: createAccessToken({ userId: payload.userId, email: payload.email, profile: payload.profile, role: payload.role }) });
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  });

  app.get('/auth/me', authMiddleware, async (req, res) => {
    const user = await users.findOne({ _id: new ObjectId(req.user.userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ fullName: user.fullName, email: user.email, profile: user.profile, role: user.role, is_verified: user.is_verified, created_at: user.created_at });
  });

  app.get('/auth/dashboard', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
    return res.json({ message: `Welcome to the dashboard, ${req.user.email}`, role: req.user.role });
  });

  app.get('/auth/admin/users', authMiddleware, requireRole('admin'), async (req, res) => {
    const allUsers = await users.find({}, { projection: { password_hash: 0 } }).toArray();
    return res.json({ users: allUsers });
  });
});

afterAll(async () => {
  await users.deleteMany({ email: { $in: [VERIFIED_EMAIL, UNVERIFIED_EMAIL] } });
  await mongoClient.close();
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  test('valid credentials return access_token and refresh_token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VERIFIED_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
  });

  test('returned access_token contains correct email and role', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VERIFIED_EMAIL, password: TEST_PASSWORD });

    const decoded = jwt.verify(res.body.access_token, JWT_SECRET);
    expect(decoded.email).toBe(VERIFIED_EMAIL);
    expect(decoded.role).toBe('staff');
  });

  test('wrong password returns 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VERIFIED_EMAIL, password: 'WrongPassword999' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('non-existent email returns 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@nowhere.com', password: TEST_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('unverified account returns 403', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: UNVERIFIED_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Please verify your account before logging in');
  });

  test('missing email returns 400', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: TEST_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  test('missing password returns 400', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: VERIFIED_EMAIL });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

describe('POST /auth/refresh', () => {
  test('valid refresh token returns a new access_token', async () => {
    const refresh_token = createRefreshToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'staff', role: 'staff' });

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
  });

  test('new access_token carries the correct payload', async () => {
    const refresh_token = createRefreshToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'staff', role: 'staff' });

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token });

    const decoded = jwt.verify(res.body.access_token, JWT_SECRET);
    expect(decoded.email).toBe(VERIFIED_EMAIL);
    expect(decoded.role).toBe('staff');
  });

  test('passing an access token instead of refresh token returns 401', async () => {
    const access_token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'staff', role: 'staff' });

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token: access_token });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired refresh token');
  });

  test('garbage token returns 401', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token: 'this.is.garbage' });

    expect(res.status).toBe(401);
  });

  test('missing refresh_token in body returns 400', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Refresh token is required');
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

describe('GET /auth/me', () => {
  test('valid token returns the correct user profile', async () => {
    const token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'staff', role: 'staff' });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(VERIFIED_EMAIL);
    expect(res.body.role).toBe('staff');
    expect(res.body.is_verified).toBe(true);
    expect(res.body.password_hash).toBeUndefined();
  });

  test('returns 401 with no token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer this.is.garbage');

    expect(res.status).toBe(401);
  });

  test('returns 404 when userId in token does not exist in DB', async () => {
    const fakeId = new ObjectId().toString();
    const token = createAccessToken({ userId: fakeId, email: 'ghost@example.com', profile: 'staff', role: 'staff' });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ─── GET /auth/dashboard ──────────────────────────────────────────────────────

describe('GET /auth/dashboard', () => {
  test('staff token returns 200 with welcome message', async () => {
    const token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'staff', role: 'staff' });

    const res = await request(app)
      .get('/auth/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain(VERIFIED_EMAIL);
    expect(res.body.role).toBe('staff');
  });

  test('admin token also returns 200', async () => {
    const token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'admin', role: 'admin' });

    const res = await request(app)
      .get('/auth/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('client token returns 403', async () => {
    const token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'client', role: 'client' });

    const res = await request(app)
      .get('/auth/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });

  test('returns 401 with no token', async () => {
    const res = await request(app).get('/auth/dashboard');
    expect(res.status).toBe(401);
  });
});

// ─── GET /auth/admin/users ────────────────────────────────────────────────────

describe('GET /auth/admin/users', () => {
  test('admin token returns 200 with user list', async () => {
    const token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'admin', role: 'admin' });

    const res = await request(app)
      .get('/auth/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  test('user list never exposes password_hash', async () => {
    const token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'admin', role: 'admin' });

    const res = await request(app)
      .get('/auth/admin/users')
      .set('Authorization', `Bearer ${token}`);

    res.body.users.forEach(u => {
      expect(u.password_hash).toBeUndefined();
    });
  });

  test('staff token returns 403', async () => {
    const token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'staff', role: 'staff' });

    const res = await request(app)
      .get('/auth/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });

  test('client token returns 403', async () => {
    const token = createAccessToken({ userId: verifiedUserId.toString(), email: VERIFIED_EMAIL, profile: 'client', role: 'client' });

    const res = await request(app)
      .get('/auth/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test('returns 401 with no token', async () => {
    const res = await request(app).get('/auth/admin/users');
    expect(res.status).toBe(401);
  });
});
