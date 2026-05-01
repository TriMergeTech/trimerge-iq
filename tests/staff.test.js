require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const createStaffRouter = require('../routes/staff');

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

const samplePosition = randomUUID();

let mongoClient;
let staffCollection;
let app;
const insertedIds = [];

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  staffCollection = mongoClient.db().collection('staff_members');

  app = express();
  app.use(express.json());
  app.use('/staff', createStaffRouter(staffCollection, authMiddleware, requireRole));
});

afterAll(async () => {
  if (insertedIds.length > 0) {
    await staffCollection.deleteMany({ _id: { $in: insertedIds.map(id => new ObjectId(id)) } });
  }
  await mongoClient.close();
});

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /staff', () => {
  test('staff user can create a staff member with all required fields', async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Alice Ramirez',
        email: 'alice@trimergecpa.com',
        position: samplePosition,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alice Ramirez');
    expect(res.body.email).toBe('alice@trimergecpa.com');
    expect(res.body.position).toBe(samplePosition);
    expect(res.body._id).toBeDefined();

    insertedIds.push(res.body._id);
  });

  test('admin user can also create a staff member', async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({
        name: 'Bob Torres',
        email: 'bob@trimergecpa.com',
        position: randomUUID(),
      });

    expect(res.status).toBe(201);
    insertedIds.push(res.body._id);
  });

  test('email is normalized to lowercase on create', async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Carol Smith',
        email: 'CAROL@TrimergeCPA.COM',
        position: randomUUID(),
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('carol@trimergecpa.com');
    insertedIds.push(res.body._id);
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ email: 'test@trimergecpa.com', position: samplePosition });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('required');
  });

  test('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No Email', position: samplePosition });

    expect(res.status).toBe(400);
  });

  test('returns 400 when position is missing', async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No Position', email: 'nopos@trimergecpa.com' });

    expect(res.status).toBe(400);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/staff')
      .send({ name: 'Ghost', email: 'ghost@trimergecpa.com', position: samplePosition });

    expect(res.status).toBe(401);
  });

  test('client user gets 403 when trying to create a staff member', async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Blocked', email: 'blocked@trimergecpa.com', position: samplePosition });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });
});

// ─── GET all ──────────────────────────────────────────────────────────────────

describe('GET /staff', () => {
  test('authenticated staff retrieves all staff members', async () => {
    const res = await request(app)
      .get('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.staff)).toBe(true);

    const found = res.body.staff.find(s => s.name === 'Alice Ramirez');
    expect(found).toBeDefined();
    expect(found.position).toBe(samplePosition);
  });

  test('client can also read all staff members', async () => {
    const res = await request(app)
      .get('/staff')
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.staff)).toBe(true);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/staff');
    expect(res.status).toBe(401);
  });
});

// ─── GET by ID ────────────────────────────────────────────────────────────────

describe('GET /staff/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Diana Cruz',
        email: 'diana@trimergecpa.com',
        position: samplePosition,
      });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('retrieves the correct staff member by ID', async () => {
    const res = await request(app)
      .get(`/staff/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Diana Cruz');
    expect(res.body.position).toBe(samplePosition);
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .get(`/staff/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 400 for a malformed ID', async () => {
    const res = await request(app)
      .get('/staff/not-a-real-id')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(400);
  });
});

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /staff/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Eduardo Vega',
        email: 'eduardo@trimergecpa.com',
        position: samplePosition,
      });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('staff can update the name', async () => {
    const res = await request(app)
      .put(`/staff/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Eduardo Vega Jr.' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Staff member updated');
  });

  test('staff can update the position', async () => {
    const newPosition = randomUUID();
    const res = await request(app)
      .put(`/staff/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ position: newPosition });

    expect(res.status).toBe(200);
  });

  test('updated fields are persisted in the database', async () => {
    const res = await request(app)
      .get(`/staff/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.body.name).toBe('Eduardo Vega Jr.');
  });

  test('client user gets 403 when trying to update', async () => {
    const res = await request(app)
      .put(`/staff/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Should not work' });

    expect(res.status).toBe(403);
  });

  test('returns 400 when body has no valid fields', async () => {
    const res = await request(app)
      .put(`/staff/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .put(`/staff/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Ghost update' });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /staff/:id', () => {
  let targetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/staff')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'To Be Deleted',
        email: 'delete@trimergecpa.com',
        position: samplePosition,
      });
    targetId = res.body._id;
  });

  test('client user gets 403 when trying to delete', async () => {
    const res = await request(app)
      .delete(`/staff/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });

  test('staff user can delete a staff member', async () => {
    const res = await request(app)
      .delete(`/staff/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Staff member deleted');
  });

  test('deleted staff member is no longer retrievable', async () => {
    const res = await request(app)
      .get(`/staff/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 404 when trying to delete an already-deleted staff member', async () => {
    const res = await request(app)
      .delete(`/staff/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });
});
