require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const createPositionsRouter = require('../routes/positions');

// ─── Replicate the two middleware functions from index.js ─────────────────────
// They are not exported from index.js (they live next to the server bootstrap),
// so we define them here using the same logic and the same JWT_SECRET from .env.

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

// ─── Token helpers ────────────────────────────────────────────────────────────

function makeToken(role) {
  return jwt.sign(
    { userId: 'test-user-id', email: 'test@example.com', profile: role, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// ─── Test setup ───────────────────────────────────────────────────────────────

let mongoClient;
let positionsCollection;
let app;
const insertedIds = []; // track every document we create so we can clean up

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  positionsCollection = mongoClient.db().collection('positions');

  app = express();
  app.use(express.json());
  app.use('/positions', createPositionsRouter(positionsCollection, authMiddleware, requireRole));
});

afterAll(async () => {
  // Delete only the documents this test suite inserted — leaves any real data untouched
  if (insertedIds.length > 0) {
    await positionsCollection.deleteMany({ _id: { $in: insertedIds.map(id => new ObjectId(id)) } });
  }
  await mongoClient.close();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('POST /positions', () => {
  test('staff user can create a position with a responsibility array', async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Senior Accountant',
        description: 'Handles financial reporting and audits',
        responsibility: ['Prepare monthly reports', 'Review client audits', 'Coordinate with tax team'],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Senior Accountant');
    expect(Array.isArray(res.body.responsibility)).toBe(true);
    expect(res.body.responsibility).toHaveLength(3);
    expect(res.body.responsibility).toContain('Prepare monthly reports');
    expect(res.body._id).toBeDefined();

    insertedIds.push(res.body._id); // register for cleanup
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ description: 'Missing name field' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Name and description are required');
  });

  test('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No description here' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Name and description are required');
  });

  test('responsibility defaults to empty array when not provided', async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Junior Analyst', description: 'Entry level role' });

    expect(res.status).toBe(201);
    expect(res.body.responsibility).toEqual([]);

    insertedIds.push(res.body._id);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/positions')
      .send({ name: 'Ghost Role', description: 'No auth' });

    expect(res.status).toBe(401);
  });

  test('client user gets 403 when trying to create a position', async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Unauthorized Role', description: 'Should be blocked' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });
});

describe('GET /positions', () => {
  test('authenticated user retrieves all positions including the one just created', async () => {
    const res = await request(app)
      .get('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.positions)).toBe(true);

    // Confirm our inserted document is in the list
    const found = res.body.positions.find(p => p.name === 'Senior Accountant');
    expect(found).toBeDefined();
    expect(found.responsibility).toContain('Prepare monthly reports');
  });

  test('client can also read all positions', async () => {
    const res = await request(app)
      .get('/positions')
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(200);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/positions');
    expect(res.status).toBe(401);
  });
});

describe('GET /positions/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Tax Specialist',
        description: 'Handles tax filings',
        responsibility: ['File quarterly taxes', 'Advise on deductions'],
      });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('retrieves the correct position by ID', async () => {
    const res = await request(app)
      .get(`/positions/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Tax Specialist');
    expect(res.body.responsibility).toContain('File quarterly taxes');
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .get(`/positions/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 400 for a malformed ID', async () => {
    const res = await request(app)
      .get('/positions/not-a-real-id')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(400);
  });
});

describe('PUT /positions/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Payroll Clerk',
        description: 'Manages payroll processing',
        responsibility: ['Run payroll'],
      });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('staff can update a position', async () => {
    const res = await request(app)
      .put(`/positions/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Payroll Manager',
        responsibility: ['Run payroll', 'Approve timesheets', 'Handle disputes'],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Position updated');
  });

  test('updated fields are persisted in the database', async () => {
    const res = await request(app)
      .get(`/positions/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.body.name).toBe('Payroll Manager');
    expect(res.body.responsibility).toHaveLength(3);
    expect(res.body.responsibility).toContain('Approve timesheets');
  });

  test('client user gets 403 when trying to update', async () => {
    const res = await request(app)
      .put(`/positions/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Should not work' });

    expect(res.status).toBe(403);
  });

  test('returns 400 when body has no valid fields', async () => {
    const res = await request(app)
      .put(`/positions/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /positions — skills field', () => {
  test('skills array is stored when provided', async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Data Analyst',
        description: 'Analyses business data',
        responsibility: ['Build dashboards'],
        skills: ['SQL', 'Power BI', 'Python'],
      });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills).toHaveLength(3);
    expect(res.body.skills).toContain('SQL');

    insertedIds.push(res.body._id);
  });

  test('skills defaults to empty array when not provided', async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Office Admin', description: 'General administration' });

    expect(res.status).toBe(201);
    expect(res.body.skills).toEqual([]);

    insertedIds.push(res.body._id);
  });
});

describe('PUT /positions/:id — skills field', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'IT Support', description: 'Handles internal IT requests' });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('staff can add skills to a position that had none', async () => {
    const res = await request(app)
      .put(`/positions/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ skills: ['Linux', 'Networking', 'Helpdesk'] });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Position updated');
  });

  test('updated skills are persisted in the database', async () => {
    const res = await request(app)
      .get(`/positions/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(Array.isArray(res.body.skills)).toBe(true);
    expect(res.body.skills).toHaveLength(3);
    expect(res.body.skills).toContain('Networking');
  });
});

describe('DELETE /positions/:id', () => {
  let targetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/positions')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'To Be Deleted', description: 'This position will be deleted in tests' });
    targetId = res.body._id;
    // No push to insertedIds — this test deletes it, so cleanup is not needed
  });

  test('client user gets 403 Forbidden when trying to delete', async () => {
    const res = await request(app)
      .delete(`/positions/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });

  test('staff user can delete a position', async () => {
    const res = await request(app)
      .delete(`/positions/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Position deleted');
  });

  test('deleted position is no longer retrievable', async () => {
    const res = await request(app)
      .get(`/positions/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 404 when trying to delete an already-deleted position', async () => {
    const res = await request(app)
      .delete(`/positions/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });
});
