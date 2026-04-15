require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const createClientsRouter = require('../routes/clients');

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
let clientsCollection;
let app;
const insertedIds = [];

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  clientsCollection = mongoClient.db().collection('clients');

  app = express();
  app.use(express.json());
  app.use('/clients', createClientsRouter(clientsCollection, authMiddleware, requireRole));
});

afterAll(async () => {
  if (insertedIds.length > 0) {
    await clientsCollection.deleteMany({ _id: { $in: insertedIds.map(id => new ObjectId(id)) } });
  }
  await mongoClient.close();
});

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /clients', () => {
  test('staff user can create a client with name and about', async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Acme Corp',
        about: 'Global manufacturing company specialising in industrial equipment',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Acme Corp');
    expect(res.body.about).toBe('Global manufacturing company specialising in industrial equipment');
    expect(res.body._id).toBeDefined();

    insertedIds.push(res.body._id);
  });

  test('admin user can also create a client', async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ name: 'Beta Ltd', about: 'Retail chain operating across 5 countries' });

    expect(res.status).toBe(201);
    insertedIds.push(res.body._id);
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ about: 'Missing name field' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Name and about are required');
  });

  test('returns 400 when about is missing', async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No about here' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Name and about are required');
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/clients')
      .send({ name: 'Ghost Client', about: 'No auth' });

    expect(res.status).toBe(401);
  });

  test('client role gets 403 when trying to create a client record', async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Blocked', about: 'Should be blocked' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });
});

// ─── GET all ──────────────────────────────────────────────────────────────────

describe('GET /clients', () => {
  test('authenticated staff retrieves all clients including the one just created', async () => {
    const res = await request(app)
      .get('/clients')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.clients)).toBe(true);

    const found = res.body.clients.find(c => c.name === 'Acme Corp');
    expect(found).toBeDefined();
    expect(found.about).toContain('manufacturing');
  });

  test('client role can also read all clients', async () => {
    const res = await request(app)
      .get('/clients')
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.clients)).toBe(true);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/clients');
    expect(res.status).toBe(401);
  });
});

// ─── GET by ID ────────────────────────────────────────────────────────────────

describe('GET /clients/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Gamma Holdings', about: 'Investment holding company with diverse portfolio' });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('retrieves the correct client by ID', async () => {
    const res = await request(app)
      .get(`/clients/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Gamma Holdings');
    expect(res.body.about).toContain('Investment');
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .get(`/clients/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 400 for a malformed ID', async () => {
    const res = await request(app)
      .get('/clients/not-a-real-id')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(400);
  });
});

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /clients/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Delta Ventures', about: 'Early-stage startup accelerator' });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('staff can update the name of a client', async () => {
    const res = await request(app)
      .put(`/clients/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Delta Ventures International' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Client updated');
  });

  test('staff can update the about field', async () => {
    const res = await request(app)
      .put(`/clients/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ about: 'Global startup accelerator with offices in 10 countries' });

    expect(res.status).toBe(200);
  });

  test('updated fields are persisted in the database', async () => {
    const res = await request(app)
      .get(`/clients/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.body.name).toBe('Delta Ventures International');
    expect(res.body.about).toContain('Global startup accelerator');
  });

  test('client role gets 403 when trying to update', async () => {
    const res = await request(app)
      .put(`/clients/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Should not work' });

    expect(res.status).toBe(403);
  });

  test('returns 400 when body has no valid fields', async () => {
    const res = await request(app)
      .put(`/clients/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .put(`/clients/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Ghost update' });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /clients/:id', () => {
  let targetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/clients')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'To Be Deleted', about: 'This client will be deleted in tests' });
    targetId = res.body._id;
    // No push to insertedIds — test deletes it directly
  });

  test('client role gets 403 when trying to delete', async () => {
    const res = await request(app)
      .delete(`/clients/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });

  test('staff user can delete a client', async () => {
    const res = await request(app)
      .delete(`/clients/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Client deleted');
  });

  test('deleted client is no longer retrievable', async () => {
    const res = await request(app)
      .get(`/clients/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 404 when trying to delete an already-deleted client', async () => {
    const res = await request(app)
      .delete(`/clients/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });
});
