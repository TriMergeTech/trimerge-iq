const { onRequest } = require('firebase-functions/https');
const { setGlobalOptions } = require('firebase-functions');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // eslint-disable-line
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const swaggerUi = require('swagger-ui-express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');

setGlobalOptions({ maxInstances: 10 });

const allowedOrigins = [
  'http://localhost:3000',
  'https://trimerge-backend--trimerge-nextjs-app.us-central1.hosted.app',
  'https://trimerge-iq.onrender.com',
];

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy does not allow access from this origin'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

const swaggerSpec = {
  openapi: '3.0.0',
  info: { title: 'Auth System API', version: '1.0.0' },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      SignupRequest: {
        type: 'object',
        required: ['fullName', 'email', 'profile', 'password'],
        properties: {
          fullName: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', example: 'user@example.com' },
          profile: { type: 'string', enum: ['staff', 'client'] },
          password: { type: 'string', example: 'SecurePassword123' },
        },
      },
      VerifyRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', example: 'user@example.com' },
          otp: { type: 'string', example: '123456' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'SecurePassword123' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
          refresh_token: { type: 'string' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', example: 'user@example.com' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'new_password'],
        properties: {
          email: { type: 'string', example: 'user@example.com' },
          otp: { type: 'string', example: '123456' },
          new_password: { type: 'string', example: 'NewSecurePass123' },
        },
      },
      GoogleRequest: {
        type: 'object',
        required: ['id_token'],
        properties: {
          id_token: { type: 'string', description: 'Google ID token from the client-side Google Sign-In' },
          profile: { type: 'string', enum: ['staff', 'client'], description: 'Required only for new users' },
        },
      },
    },
  },
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } } },
        responses: {
          201: { description: 'Signup successful, OTP sent' },
          400: { description: 'Missing or invalid fields' },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/auth/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP and activate account',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyRequest' } } } },
        responses: {
          200: { description: 'Account verified, returns refresh_token' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive tokens',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: {
          200: { description: 'Returns access_token and refresh_token' },
          401: { description: 'Invalid credentials' },
          403: { description: 'Account not verified' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } } },
        responses: {
          200: { description: 'Returns new access_token' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset OTP',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } } },
        responses: {
          200: { description: 'Reset OTP sent if email is registered' },
          400: { description: 'Email is required' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using OTP',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } } },
        responses: {
          200: { description: 'Password reset successful' },
          400: { description: 'Invalid or expired OTP' },
        },
      },
    },
    '/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Sign up or log in with Google',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GoogleRequest' } } } },
        responses: {
          200: { description: 'Returns access_token and refresh_token' },
          400: { description: 'Missing token or profile for new user' },
          401: { description: 'Invalid Google token' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns user profile' },
          401: { description: 'Unauthorized' },
          404: { description: 'User not found' },
        },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const {
  MONGODB_URI,
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST = 'smtp.gmail.com',
  EMAIL_PORT = 465,
} = process.env;

let mongoClient;
let users;
let otpVerifications;
let passwordResets;
let dbConnected = false;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';
const OTP_EXPIRES_MS = 1000 * 60 * 10;

function createOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function createRefreshToken(payload) {
  return jwt.sign({ ...payload, tokenType: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
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
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: Number(EMAIL_PORT) === 465,
  auth: EMAIL_USER && EMAIL_PASS ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined,
});

async function sendEmail({ to, subject, text, html }) {
  console.log('--------------------------');
  console.log('DEBUG EMAIL SENT TO:', to);
  console.log('YOUR OTP CODE IS:', text);
  console.log('--------------------------');
  return;
}

async function connectDb() {
  if (dbConnected) return;
  if (!mongoClient) mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db();
  users = db.collection('users');
  otpVerifications = db.collection('otp_verifications');
  passwordResets = db.collection('password_resets');
  await users.createIndex({ email: 1 }, { unique: true });
  await otpVerifications.createIndex({ email: 1 });
  await otpVerifications.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
  await passwordResets.createIndex({ email: 1 });
  await passwordResets.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
  dbConnected = true;
  console.log('Connected to MongoDB');
}

app.get('/', (req, res) => {
  res.json({ status: 'Authentication API is running' });
});

app.post('/auth/signup', async (req, res) => {
  await connectDb();
  const { fullName, email, profile, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedFullName = typeof fullName === 'string' ? fullName.trim() : '';

  if (!normalizedFullName || !normalizedEmail || !profile || !password) {
    return res.status(400).json({ message: 'Full name, email, profile, and password are required' });
  }

  if (!['staff', 'client'].includes(profile)) {
    return res.status(400).json({ message: 'Profile must be "staff" or "client"' });
  }

  try {
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = { fullName: normalizedFullName, email: normalizedEmail, password_hash, profile, is_verified: false, created_at: new Date() };
    await users.insertOne(user);

    const otp = createOtp();
    const expires_at = new Date(Date.now() + OTP_EXPIRES_MS);
    await otpVerifications.deleteMany({ email: normalizedEmail });
    await otpVerifications.insertOne({ email: normalizedEmail, otp, expires_at, created_at: new Date() });

    await sendEmail({
      to: normalizedEmail,
      subject: 'Your verification OTP',
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
    });

    return res.status(201).json({ message: 'Signup successful. OTP sent to email.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to complete signup' });
  }
});

app.post('/auth/verify', async (req, res) => {
  await connectDb();
  const { email, otp } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const user = await users.findOne({ email: normalizedEmail });
  if (!user) return res.status(400).json({ message: 'Invalid email or OTP' });
  if (user.is_verified) return res.status(400).json({ message: 'User is already verified' });

  const otpRecord = await otpVerifications.findOne({ email: normalizedEmail, otp });
  if (!otpRecord || otpRecord.expires_at < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  await users.updateOne({ _id: user._id }, { $set: { is_verified: true } });
  await otpVerifications.deleteMany({ email: normalizedEmail });

  const refresh_token = createRefreshToken({ userId: user._id.toString(), email: user.email, profile: user.profile });
  return res.json({ message: 'Account verified', refresh_token });
});

app.post('/auth/login', async (req, res) => {
  await connectDb();
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await users.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return res.status(401).json({ message: 'Invalid email or password' });
  if (!user.is_verified) return res.status(403).json({ message: 'Please verify your account before logging in' });

  const payload = { userId: user._id.toString(), email: user.email, profile: user.profile };
  return res.json({ access_token: createAccessToken(payload), refresh_token: createRefreshToken(payload) });
});

app.post('/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ message: 'Refresh token is required' });

  try {
    const payload = jwt.verify(refresh_token, JWT_SECRET);
    if (payload.tokenType !== 'refresh') throw new Error('Not a refresh token');
    return res.json({ access_token: createAccessToken({ userId: payload.userId, email: payload.email, profile: payload.profile }) });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  await connectDb();
  const user = await users.findOne({ _id: new ObjectId(req.user.userId) });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ fullName: user.fullName, email: user.email, profile: user.profile, is_verified: user.is_verified, created_at: user.created_at });
});

app.post('/auth/forgot-password', async (req, res) => {
  await connectDb();
  const { email } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' });

  const user = await users.findOne({ email: normalizedEmail });
  if (!user) return res.json({ message: 'If that email is registered, a reset OTP has been sent.' });

  const otp = createOtp();
  const expires_at = new Date(Date.now() + OTP_EXPIRES_MS);
  await passwordResets.deleteMany({ email: normalizedEmail });
  await passwordResets.insertOne({ email: normalizedEmail, otp, expires_at, created_at: new Date() });

  await sendEmail({
    to: normalizedEmail,
    subject: 'Password reset OTP',
    text: `Your password reset OTP is: ${otp}`,
    html: `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
  });

  return res.json({ message: 'If that email is registered, a reset OTP has been sent.' });
});

app.post('/auth/reset-password', async (req, res) => {
  await connectDb();
  const { email, otp, new_password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !otp || !new_password) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  const resetRecord = await passwordResets.findOne({ email: normalizedEmail, otp });
  if (!resetRecord || resetRecord.expires_at < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  const password_hash = await bcrypt.hash(new_password, 12);
  await users.updateOne({ email: normalizedEmail }, { $set: { password_hash } });
  await passwordResets.deleteMany({ email: normalizedEmail });

  return res.json({ message: 'Password reset successful' });
});

app.post('/auth/google', async (req, res) => {
  await connectDb();
  const { id_token, profile } = req.body;

  if (!id_token) return res.status(400).json({ message: 'Google ID token is required' });
  if (!GOOGLE_CLIENT_ID) return res.status(500).json({ message: 'Google login is not configured on this server' });

  try {
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID });
    const googlePayload = ticket.getPayload();
    const email = googlePayload.email.toLowerCase();

    let user = await users.findOne({ email });

    if (!user) {
      if (!profile || !['staff', 'client'].includes(profile)) {
        return res.status(400).json({ message: 'Profile ("staff" or "client") is required for new users' });
      }
      const result = await users.insertOne({
        email, password_hash: null, profile, is_verified: true,
        google_id: googlePayload.sub, created_at: new Date(),
      });
      user = await users.findOne({ _id: result.insertedId });
    }

    const tokenPayload = { userId: user._id.toString(), email: user.email, profile: user.profile };
    return res.json({ access_token: createAccessToken(tokenPayload), refresh_token: createRefreshToken(tokenPayload) });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: 'Unexpected server error' });
});

exports.api = onRequest(app);
