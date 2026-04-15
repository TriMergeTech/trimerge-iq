require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const createSkillsRouter = require('../routes/skills');

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
let skillsCollection;
let app;
const insertedIds = [];

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  skillsCollection = mongoClient.db().collection('skills');

  app = express();
  app.use(express.json());
  app.use('/skills', createSkillsRouter(skillsCollection, authMiddleware, requireRole));
});

afterAll(async () => {
  if (insertedIds.length > 0) {
    await skillsCollection.deleteMany({ _id: { $in: insertedIds.map(id => new ObjectId(id)) } });
  }
  await mongoClient.close();
});

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /skills', () => {
  test('staff user can create a skill with name and description', async () => {
    const res = await request(app)
      .post('/skills')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Financial Modelling',
        description: 'Building forecast models in Excel and Python',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Financial Modelling');
    expect(res.body.description).toBe('Building forecast models in Excel and Python');
    expect(res.body._id).toBeDefined();

    insertedIds.push(res.body._id);
  });

  test('admin user can also create a skill', async () => {
    const res = await request(app)
      .post('/skills')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'IFRS Reporting', description: 'International financial reporting standards' });

    expect(res.status).toBe(201);
    insertedIds.push(res.body._id);
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/skills')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ description: 'Missing name field' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Name and description are required');
  });

  test('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/skills')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No description here' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Name and description are required');
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/skills')
      .send({ name: 'Ghost Skill', description: 'No auth' });

    expect(res.status).toBe(401);
  });

  test('client user gets 403 when trying to create a skill', async () => {
    const res = await request(app)
      .post('/skills')
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Blocked', description: 'Should be blocked' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });
});

// ─── GET all ──────────────────────────────────────────────────────────────────

describe('GET /skills', () => {
  test('authenticated staff retrieves all skills including the one just created', async () => {
    const res = await request(app)
      .get('/skills')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.skills)).toBe(true);

    const found = res.body.skills.find(s => s.name === 'Financial Modelling');
    expect(found).toBeDefined();
    expect(found.description).toBe('Building forecast models in Excel and Python');
  });

  test('client can also read all skills', async () => {
    const res = await request(app)
      .get('/skills')
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.skills)).toBe(true);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/skills');
    expect(res.status).toBe(401);
  });
});

// ─── GET by ID ────────────────────────────────────────────────────────────────

describe('GET /skills/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/skills')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'VAT Compliance', description: 'Managing VAT returns and filings' });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('retrieves the correct skill by ID', async () => {
    const res = await request(app)
      .get(`/skills/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('VAT Compliance');
    expect(res.body.description).toBe('Managing VAT returns and filings');
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .get(`/skills/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 400 for a malformed ID', async () => {
    const res = await request(app)
      .get('/skills/not-a-real-id')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(400);
  });
});

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /skills/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/skills')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Data Entry', description: 'Basic data entry and spreadsheet work' });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('staff can update the name of a skill', async () => {
    const res = await request(app)
      .put(`/skills/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Advanced Data Entry' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Skill updated');
  });

  test('staff can update the description of a skill', async () => {
    const res = await request(app)
      .put(`/skills/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ description: 'Advanced data entry, validation, and reporting' });

    expect(res.status).toBe(200);
  });

  test('updated fields are persisted in the database', async () => {
    const res = await request(app)
      .get(`/skills/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.body.name).toBe('Advanced Data Entry');
    expect(res.body.description).toBe('Advanced data entry, validation, and reporting');
  });

  test('client user gets 403 when trying to update', async () => {
    const res = await request(app)
      .put(`/skills/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Should not work' });

    expect(res.status).toBe(403);
  });

  test('returns 400 when body has no valid fields', async () => {
    const res = await request(app)
      .put(`/skills/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .put(`/skills/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Ghost update' });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /skills/:id', () => {
  let targetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/skills')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'To Be Deleted', description: 'This skill will be deleted in tests' });
    targetId = res.body._id;
    // No push to insertedIds — test deletes it directly
  });

  test('client user gets 403 when trying to delete', async () => {
    const res = await request(app)
      .delete(`/skills/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });

  test('staff user can delete a skill', async () => {
    const res = await request(app)
      .delete(`/skills/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Skill deleted');
  });

  test('deleted skill is no longer retrievable', async () => {
    const res = await request(app)
      .get(`/skills/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 404 when trying to delete an already-deleted skill', async () => {
    const res = await request(app)
      .delete(`/skills/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });
});
