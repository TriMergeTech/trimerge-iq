require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const createProjectsRouter = require('../routes/projects');

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

// Sample UUIDs reused across tests
const sampleProjectManager = randomUUID();
const sampleClient = randomUUID();
const sampleService = randomUUID();
const sampleTeam = [randomUUID(), randomUUID()];

let mongoClient;
let projectsCollection;
let app;
const insertedIds = [];

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  projectsCollection = mongoClient.db().collection('projects');

  app = express();
  app.use(express.json());
  app.use('/projects', createProjectsRouter(projectsCollection, authMiddleware, requireRole));
});

afterAll(async () => {
  if (insertedIds.length > 0) {
    await projectsCollection.deleteMany({ _id: { $in: insertedIds.map(id => new ObjectId(id)) } });
  }
  await mongoClient.close();
});

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /projects', () => {
  test('staff user can create a project with all required fields', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Q3 Audit',
        description: 'Quarterly audit for Acme Corp',
        project_manager: sampleProjectManager,
        team: sampleTeam,
        client: sampleClient,
        service: sampleService,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Q3 Audit');
    expect(res.body.project_manager).toBe(sampleProjectManager);
    expect(Array.isArray(res.body.team)).toBe(true);
    expect(res.body.team).toHaveLength(2);
    expect(res.body.client).toBe(sampleClient);
    expect(res.body.service).toBe(sampleService);
    expect(res.body._id).toBeDefined();

    insertedIds.push(res.body._id);
  });

  test('admin user can also create a project', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({
        name: 'Tax Filing 2026',
        description: 'Annual tax filing project',
        project_manager: randomUUID(),
        team: [randomUUID()],
        client: randomUUID(),
        service: randomUUID(),
      });

    expect(res.status).toBe(201);
    insertedIds.push(res.body._id);
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ description: 'Missing name', project_manager: sampleProjectManager, team: sampleTeam, client: sampleClient, service: sampleService });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('required');
  });

  test('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No desc', project_manager: sampleProjectManager, team: sampleTeam, client: sampleClient, service: sampleService });

    expect(res.status).toBe(400);
  });

  test('returns 400 when project_manager is missing', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No PM', description: 'Missing PM', team: sampleTeam, client: sampleClient, service: sampleService });

    expect(res.status).toBe(400);
  });

  test('returns 400 when team is not an array', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Bad Team', description: 'Team is a string', project_manager: sampleProjectManager, team: 'not-an-array', client: sampleClient, service: sampleService });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Team must be an array');
  });

  test('returns 400 when client is missing', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No Client', description: 'Missing client', project_manager: sampleProjectManager, team: sampleTeam, service: sampleService });

    expect(res.status).toBe(400);
  });

  test('returns 400 when service is missing', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'No Service', description: 'Missing service', project_manager: sampleProjectManager, team: sampleTeam, client: sampleClient });

    expect(res.status).toBe(400);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/projects')
      .send({ name: 'Ghost', description: 'No auth', project_manager: sampleProjectManager, team: sampleTeam, client: sampleClient, service: sampleService });

    expect(res.status).toBe(401);
  });

  test('client user gets 403 when trying to create a project', async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Blocked', description: 'Should be blocked', project_manager: sampleProjectManager, team: sampleTeam, client: sampleClient, service: sampleService });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });
});

// ─── GET all ──────────────────────────────────────────────────────────────────

describe('GET /projects', () => {
  test('authenticated staff retrieves all projects including the one just created', async () => {
    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.projects)).toBe(true);

    const found = res.body.projects.find(p => p.name === 'Q3 Audit');
    expect(found).toBeDefined();
    expect(found.client).toBe(sampleClient);
  });

  test('client can also read all projects', async () => {
    const res = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.projects)).toBe(true);
  });

  test('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/projects');
    expect(res.status).toBe(401);
  });
});

// ─── GET by ID ────────────────────────────────────────────────────────────────

describe('GET /projects/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'Payroll Review',
        description: 'Annual payroll review project',
        project_manager: sampleProjectManager,
        team: sampleTeam,
        client: sampleClient,
        service: sampleService,
      });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('retrieves the correct project by ID', async () => {
    const res = await request(app)
      .get(`/projects/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Payroll Review');
    expect(res.body.project_manager).toBe(sampleProjectManager);
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .get(`/projects/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 400 for a malformed ID', async () => {
    const res = await request(app)
      .get('/projects/not-a-real-id')
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(400);
  });
});

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /projects/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'VAT Filing',
        description: 'Quarterly VAT filing',
        project_manager: sampleProjectManager,
        team: sampleTeam,
        client: sampleClient,
        service: sampleService,
      });
    createdId = res.body._id;
    insertedIds.push(createdId);
  });

  test('staff can update the name and description', async () => {
    const res = await request(app)
      .put(`/projects/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'VAT Filing 2026', description: 'Updated quarterly VAT filing' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Project updated');
  });

  test('staff can update the team array', async () => {
    const newTeam = [randomUUID(), randomUUID(), randomUUID()];
    const res = await request(app)
      .put(`/projects/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ team: newTeam });

    expect(res.status).toBe(200);
  });

  test('updated fields are persisted in the database', async () => {
    const res = await request(app)
      .get(`/projects/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.body.name).toBe('VAT Filing 2026');
    expect(res.body.team).toHaveLength(3);
  });

  test('client user gets 403 when trying to update', async () => {
    const res = await request(app)
      .put(`/projects/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`)
      .send({ name: 'Should not work' });

    expect(res.status).toBe(403);
  });

  test('returns 400 when body has no valid fields', async () => {
    const res = await request(app)
      .put(`/projects/${createdId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .put(`/projects/${fakeId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'Ghost update' });

    expect(res.status).toBe(404);
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /projects/:id', () => {
  let targetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({
        name: 'To Be Deleted',
        description: 'This project will be deleted in tests',
        project_manager: sampleProjectManager,
        team: sampleTeam,
        client: sampleClient,
        service: sampleService,
      });
    targetId = res.body._id;
    // No push to insertedIds — test deletes it directly
  });

  test('client user gets 403 when trying to delete', async () => {
    const res = await request(app)
      .delete(`/projects/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('client')}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Forbidden: insufficient permissions');
  });

  test('staff user can delete a project', async () => {
    const res = await request(app)
      .delete(`/projects/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Project deleted');
  });

  test('deleted project is no longer retrievable', async () => {
    const res = await request(app)
      .get(`/projects/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });

  test('returns 404 when trying to delete an already-deleted project', async () => {
    const res = await request(app)
      .delete(`/projects/${targetId}`)
      .set('Authorization', `Bearer ${makeToken('staff')}`);

    expect(res.status).toBe(404);
  });
});
