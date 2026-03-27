require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const {
  PORT = 3000,
  MONGODB_URI,
  JWT_SECRET,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST = 'smtp.gmail.com',
  EMAIL_PORT = 465,
} = process.env;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
let users;
let otpVerifications;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';
const OTP_EXPIRES_MS = 1000 * 60 * 10; // 10 minutes

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
  // DEBUG MODE: This prints the OTP to your terminal instead of sending an actual email
  console.log('--------------------------');
  console.log('📧 DEBUG EMAIL SENT TO:', to);
  console.log('🔢 YOUR OTP CODE IS:', text);
  console.log('--------------------------');
  return; // Skip the actual sending for now
}

async function connectDb() {
  await client.connect();
  const db = client.db();
  users = db.collection('users');
  otpVerifications = db.collection('otp_verifications');
  await users.createIndex({ email: 1 }, { unique: true });
  await otpVerifications.createIndex({ email: 1 });
  await otpVerifications.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
  console.log('Connected to MongoDB');
}

app.get('/', (req, res) => {
  res.json({ status: 'Authentication API is running' });
});

app.post('/auth/signup', async (req, res) => {
  const { email, password, profile } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !password || !profile) {
    return res.status(400).json({ message: 'Email, password, and profile are required' });
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
    const user = {
      email: normalizedEmail,
      password_hash,
      profile,
      is_verified: false,
      created_at: new Date(),
    };

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
  const { email, otp } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const user = await users.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or OTP' });
  }

  if (user.is_verified) {
    return res.status(400).json({ message: 'User is already verified' });
  }

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

  const payload = { userId: user._id.toString(), email: user.email, profile: user.profile };
  const access_token = createAccessToken(payload);
  const refresh_token = createRefreshToken(payload);

  return res.json({ access_token, refresh_token });
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

    const access_token = createAccessToken({ userId: payload.userId, email: payload.email, profile: payload.profile });
    return res.json({ access_token });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  const user = await users.findOne({ _id: new ObjectId(req.user.userId) });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ email: user.email, profile: user.profile, is_verified: user.is_verified, created_at: user.created_at });
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: 'Unexpected server error' });
});

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

