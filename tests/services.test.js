require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const createServicesRouter = require('../routes/services');

const JWT_SECRET = process.env.JWT_SECRET;

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

function makeToken(role) {
  return jwt.sign(
    { userId: 'test-user-id', email: 'test@example.com', profile: role, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

let mongoClient;
let servicesCollection;
let app;
const insertedIds = [];

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  servicesCollection = mongoClient.db().collection('services');

  app = express();
  app.use(express.json());
  app.use('/services', createServicesRouter(servicesCollection, authMiddleware, requireRole));
});

afterAll(async () => {
  if (insertedIds.length > 0) {
    await servicesCollection.deleteMany({ _id: { $in: insertedIds.map(id => new ObjectId(id)) } });
  }
  await mongoClient.close();
});

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /services', () => {
  test('staff user can create a service with a skills array', async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        title: 'Tax Consulting',
        descriptions: 'End-to-end tax advisory service',
        skills: ['Tax Law', 'IFRS', 'VAT'],
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Tax Consulting');
    expect(res.body.descriptions).toBe('End-to-end tax advisory service');
    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills).toHaveLength(3);
    expect(res.body.skills).toContain('Tax Law');
    expect(res.body._id).toBeDefined();

    insertedIds.push(res.body._id);
  });

  test('skills defaults to empty array when not provided', async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ title: 'Audit Service', descriptions: 'External audit support' });

    expect(res.status).toBe(201);
    expect(res.body.skills).toEqual([]);

    insertedIds.push(res.body._id);
  });

  test('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ descriptions: 'Missing title' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Title and descriptions are required');
  });

  test('returns 400 when descriptions is missing', async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ title: 'No description here' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Title and descriptions are required');
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/services')
      .send({ title: 'Ghost Service', descriptions: 'No auth' });

    expect(res.status).toBe(401);
  });

  test('client user gets 403 when trying to create a service', async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ title: 'Blocked', descriptions: 'Should be blocked' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });
});

// ─── GET all ──────────────────────────────────────────────────────────────────

describe('GET /services', () => {
  test('authenticated staff retrieves all services including the one just created', async () => {
    const res = await request(app)
      .get('/services')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.services)).toBe(true);

    const found = res.body.services.find(s => s.title === 'Tax Consulting');
    expect(found).toBeDefined();
    expect(found.skills).toContain('Tax Law');
  });

  test('client can also read all services', async () => {
    const res = await request(app)
      .get('/services')
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(200);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/services');
    expect(res.status).toBe(401);
  });
});

// ─── GET by ID ────────────────────────────────────────────────────────────────

describe('GET /services/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        title: 'Payroll Processing',
        descriptions: 'Full payroll management',
        skills: ['Excel', 'QuickBooks'],
      });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('retrieves the correct service by ID', async () => {
    const res = await request(app)
      .get(`/services/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Payroll Processing');
    expect(res.body.skills).toContain('QuickBooks');
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .get(`/services/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 400 for a malformed ID', async () => {
    const res = await request(app)
      .get('/services/not-a-real-id')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(400);
  });
});

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /services/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        title: 'Bookkeeping',
        descriptions: 'Monthly bookkeeping service',
        skills: ['Xero'],
      });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('staff can update title and descriptions', async () => {
    const res = await request(app)
      .put(`/services/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ title: 'Advanced Bookkeeping', descriptions: 'Monthly and quarterly bookkeeping' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Service updated');
  });

  test('staff can update the skills array', async () => {
    const res = await request(app)
      .put(`/services/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ skills: ['Xero', 'MYOB', 'Sage'] });

    expect(res.status).toBe(200);
  });

  test('updated fields are persisted in the database', async () => {
    const res = await request(app)
      .get(`/services/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.body.title).toBe('Advanced Bookkeeping');
    expect(res.body.skills).toHaveLength(3);
    expect(res.body.skills).toContain('MYOB');
  });

  test('client user gets 403 when trying to update', async () => {
    const res = await request(app)
      .put(`/services/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ title: 'Should not work' });

    expect(res.status).toBe(403);
  });

  test('returns 400 when body has no valid fields', async () => {
    const res = await request(app)
      .put(`/services/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .put(`/services/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ title: 'Ghost update' });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /services/:id', () => {
  let targetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/services')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ title: 'To Be Deleted', descriptions: 'This service will be deleted in tests' });
    targetId = res.body._id;
    // No push to insertedIds — test deletes it directly
  });

  test('client user gets 403 when trying to delete', async () => {
    const res = await request(app)
      .delete(`/services/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });

  test('staff user can delete a service', async () => {
    const res = await request(app)
      .delete(`/services/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Service deleted');
  });

  test('deleted service is no longer retrievable', async () => {
    const res = await request(app)
      .get(`/services/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 404 when trying to delete an already-deleted service', async () => {
    const res = await request(app)
      .delete(`/services/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });
});
