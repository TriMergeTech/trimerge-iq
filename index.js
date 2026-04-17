require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const swaggerUi = require('swagger-ui-express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

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
          200: { description: 'Returns user profile including role' },
          401: { description: 'Unauthorized' },
          404: { description: 'User not found' },
        },
      },
    },
    '/positions': {
      post: {
        tags: ['Positions'],
        summary: 'Create a new position',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description'],
                properties: {
                  name: { type: 'string', example: 'Senior Accountant' },
                  description: { type: 'string', example: 'Handles financial reporting' },
                  responsibility: { type: 'array', items: { type: 'string' }, example: ['Prepare reports', 'Review audits'] },
                  skills: { type: 'array', items: { type: 'string' }, example: ['Excel', 'GAAP'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Position created' },
          400: { description: 'Missing required fields' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
        },
      },
      get: {
        tags: ['Positions'],
        summary: 'Retrieve all positions',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns array of all positions' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/positions/{id}': {
      get: {
        tags: ['Positions'],
        summary: 'Retrieve a single position by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Returns the position' },
          400: { description: 'Invalid ID' },
          401: { description: 'Unauthorized' },
          404: { description: 'Position not found' },
        },
      },
      put: {
        tags: ['Positions'],
        summary: 'Update a position by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  responsibility: { type: 'array', items: { type: 'string' } },
                  skills: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Position updated' },
          400: { description: 'Invalid ID or no valid fields' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
          404: { description: 'Position not found' },
        },
      },
      delete: {
        tags: ['Positions'],
        summary: 'Delete a position by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Position deleted' },
          400: { description: 'Invalid ID' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
          404: { description: 'Position not found' },
        },
      },
    },
    '/auth/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List all users — admin only',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns array of all users (passwords excluded)' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: admin role required' },
        },
      },
    },
    '/auth/dashboard': {
      get: {
        tags: ['Auth'],
        summary: 'Staff/Admin dashboard',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Welcome message for staff and admin users' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin role required' },
        },
      },
    },
    '/services': {
      post: {
        tags: ['Services'],
        summary: 'Create a new service',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'descriptions'],
                properties: {
                  title: { type: 'string', example: 'Tax Consulting' },
                  descriptions: { type: 'string', example: 'End-to-end tax advisory service' },
                  skills: { type: 'array', items: { type: 'string' }, example: ['Tax Law', 'IFRS'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Service created' },
          400: { description: 'Missing required fields' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
        },
      },
      get: {
        tags: ['Services'],
        summary: 'Retrieve all services',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns array of all services' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/services/{id}': {
      get: {
        tags: ['Services'],
        summary: 'Retrieve a single service by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Returns the service' },
          400: { description: 'Invalid ID' },
          401: { description: 'Unauthorized' },
          404: { description: 'Service not found' },
        },
      },
      put: {
        tags: ['Services'],
        summary: 'Update a service by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  descriptions: { type: 'string' },
                  skills: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Service updated' },
          400: { description: 'Invalid ID or no valid fields' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
          404: { description: 'Service not found' },
        },
      },
      delete: {
        tags: ['Services'],
        summary: 'Delete a service by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Service deleted' },
          400: { description: 'Invalid ID' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
          404: { description: 'Service not found' },
        },
      },
    },
    '/skills': {
      post: {
        tags: ['Skills'],
        summary: 'Create a new skill',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'description'],
                properties: {
                  name: { type: 'string', example: 'Financial Modelling' },
                  description: { type: 'string', example: 'Building forecast models in Excel' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Skill created' },
          400: { description: 'Missing required fields' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
        },
      },
      get: {
        tags: ['Skills'],
        summary: 'Retrieve all skills',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns array of all skills' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/skills/{id}': {
      get: {
        tags: ['Skills'],
        summary: 'Retrieve a single skill by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Returns the skill' },
          400: { description: 'Invalid ID' },
          401: { description: 'Unauthorized' },
          404: { description: 'Skill not found' },
        },
      },
      put: {
        tags: ['Skills'],
        summary: 'Update a skill by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Skill updated' },
          400: { description: 'Invalid ID or no valid fields' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
          404: { description: 'Skill not found' },
        },
      },
      delete: {
        tags: ['Skills'],
        summary: 'Delete a skill by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Skill deleted' },
          400: { description: 'Invalid ID' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
          404: { description: 'Skill not found' },
        },
      },
    },
    '/clients': {
      post: {
        tags: ['Clients'],
        summary: 'Create a new client',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'about'],
                properties: {
                  name: { type: 'string', example: 'Acme Corp' },
                  about: { type: 'string', example: 'Global manufacturing company' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Client created' },
          400: { description: 'Missing required fields' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
        },
      },
      get: {
        tags: ['Clients'],
        summary: 'Retrieve all clients',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Returns array of all clients' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/clients/{id}': {
      get: {
        tags: ['Clients'],
        summary: 'Retrieve a single client by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Returns the client' },
          400: { description: 'Invalid ID' },
          401: { description: 'Unauthorized' },
          404: { description: 'Client not found' },
        },
      },
      put: {
        tags: ['Clients'],
        summary: 'Update a client by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  about: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Client updated' },
          400: { description: 'Invalid ID or no valid fields' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
          404: { description: 'Client not found' },
        },
      },
      delete: {
        tags: ['Clients'],
        summary: 'Delete a client by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Client deleted' },
          400: { description: 'Invalid ID' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: staff or admin required' },
          404: { description: 'Client not found' },
        },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const {
  PORT = 3000,
  MONGODB_URI,
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_SENDER,
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
let passwordResets;
let positions;
let services;
let skills;
let clients;

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

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: MAILGUN_API_KEY });

async function sendEmail({ to, subject, text, html }) {
  await mg.messages.create(MAILGUN_DOMAIN, {
    from: `TriMerge IQ <${MAILGUN_SENDER}>`,
    to,
    subject,
    text,
    html,
  });
}

async function connectDb() {
  await client.connect();
  const db = client.db();
  users = db.collection('users');
  otpVerifications = db.collection('otp_verifications');
  passwordResets = db.collection('password_resets');
  positions = db.collection('positions');
  services = db.collection('services');
  skills = db.collection('skills');
  clients = db.collection('clients');
  await users.createIndex({ email: 1 }, { unique: true });
  await otpVerifications.createIndex({ email: 1 });
  await otpVerifications.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
  await passwordResets.createIndex({ email: 1 });
  await passwordResets.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
  console.log('Connected to MongoDB');
}

const createPositionsRouter = require('./routes/positions');
const createServicesRouter = require('./routes/services');
const createSkillsRouter = require('./routes/skills');
const createClientsRouter = require('./routes/clients');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many login attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many refresh attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/', (req, res) => {
  res.json({ status: 'Authentication API is running' });
});

app.post('/auth/signup', async (req, res) => {
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
    const user = {
      fullName: normalizedFullName,
      email: normalizedEmail,
      password_hash,
      profile,
      role: profile,
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

  const refresh_token = createRefreshToken({ userId: user._id.toString(), email: user.email, profile: user.profile, role: user.role });
  return res.json({ message: 'Account verified', refresh_token });
});

app.post('/auth/login', loginLimiter, async (req, res) => {
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
  const access_token = createAccessToken(payload);
  const refresh_token = createRefreshToken(payload);

  return res.json({ access_token, refresh_token });
});

app.post('/auth/refresh', refreshLimiter, async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const payload = jwt.verify(refresh_token, JWT_SECRET);
    if (payload.tokenType !== 'refresh') {
      throw new Error('Token is not a refresh token');
    }

    const access_token = createAccessToken({ userId: payload.userId, email: payload.email, profile: payload.profile, role: payload.role });
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

  return res.json({ fullName: user.fullName, email: user.email, profile: user.profile, role: user.role, is_verified: user.is_verified, created_at: user.created_at });
});

app.get('/auth/admin/users', authMiddleware, requireRole('admin'), async (req, res) => {
  const allUsers = await users.find({}, { projection: { password_hash: 0 } }).toArray();
  return res.json({ users: allUsers });
});

app.get('/auth/dashboard', authMiddleware, requireRole('admin', 'staff'), async (req, res) => {
  return res.json({ message: `Welcome to the dashboard, ${req.user.email}`, role: req.user.role });
});

app.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await users.findOne({ email: normalizedEmail });
  if (!user) {
    return res.json({ message: 'If that email is registered, a reset OTP has been sent.' });
  }

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
  const { id_token, profile } = req.body;

  if (!id_token) {
    return res.status(400).json({ message: 'Google ID token is required' });
  }

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google login is not configured on this server' });
  }

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
        email,
        password_hash: null,
        profile,
        role: profile,
        is_verified: true,
        google_id: googlePayload.sub,
        created_at: new Date(),
      });
      user = await users.findOne({ _id: result.insertedId });
    }

    const tokenPayload = { userId: user._id.toString(), email: user.email, profile: user.profile, role: user.role };
    const access_token = createAccessToken(tokenPayload);
    const refresh_token = createRefreshToken(tokenPayload);

    return res.json({ access_token, refresh_token });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ message: 'Unexpected server error' });
});

connectDb()
  .then(() => {
    app.use('/positions', createPositionsRouter(positions, authMiddleware, requireRole));
    app.use('/services', createServicesRouter(services, authMiddleware, requireRole));
    app.use('/skills', createSkillsRouter(skills, authMiddleware, requireRole));
    app.use('/clients', createClientsRouter(clients, authMiddleware, requireRole));
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

