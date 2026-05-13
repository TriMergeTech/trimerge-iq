require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const createToolsRouter = require('../routes/tools');

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) { next(); }
function requireRole(...roles) { return (req, res, next) => next(); }

function makeToken(role) {
  return jwt.sign(
    { userId: 'test-user-id', email: 'test@example.com', profile: role, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

const sampleArgs = {
  route: { type: 'string', description: 'API route path' },
  method: { type: 'string', description: 'HTTP method such as GET or POST' },
};

let mongoClient;
let toolsCollection;
let staffCollection;
let app;
const insertedToolIds = [];
const insertedStaffIds = [];

beforeAll(async () => {
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  toolsCollection = mongoClient.db().collection('tools');
  staffCollection = mongoClient.db().collection('staff_members');

  app = express();
  app.use(express.json());
  app.use('/', createToolsRouter(toolsCollection, staffCollection, authMiddleware, requireRole));
});

afterAll(async () => {
  if (insertedToolIds.length > 0) {
    await toolsCollection.deleteMany({ _id: { $in: insertedToolIds.map(id => new ObjectId(id)) } });
  }
  if (insertedStaffIds.length > 0) {
    await staffCollection.deleteMany({ _id: { $in: insertedStaffIds.map(id => new ObjectId(id)) } });
  }
  await mongoClient.close();
});

// ─── POST /tools ──────────────────────────────────────────────────────────────

describe('POST /tools', () => {
  test('creates a tool with all required fields', async () => {
    const res = await request(app)
      .post('/tools')
      .set('Authorization', `Bearer ${makeToken('staff')}`)
      .send({ name: 'create_api_endpoint', description: 'Creates a new backend API endpoint.', arguments: sampleArgs });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('create_api_endpoint');
    expect(res.body.arguments).toEqual(sampleArgs);
    expect(res.body._id).toBeDefined();
    insertedToolIds.push(res.body._id);
  });

  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/tools')
      .send({ description: 'Missing name', arguments: sampleArgs });
    expect(res.status).toBe(400);
  });

  test('returns 400 when description is missing', async () => {
    const res = await request(app)
      .post('/tools')
      .send({ name: 'no-desc', arguments: sampleArgs });
    expect(res.status).toBe(400);
  });

  test('returns 400 when arguments is missing', async () => {
    const res = await request(app)
      .post('/tools')
      .send({ name: 'no-args', description: 'Missing arguments' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when arguments is not an object', async () => {
    const res = await request(app)
      .post('/tools')
      .send({ name: 'bad-args', description: 'Bad args', arguments: 'not-an-object' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Arguments must be an object');
  });

  test('returns 400 when arguments is an array', async () => {
    const res = await request(app)
      .post('/tools')
      .send({ name: 'array-args', description: 'Array args', arguments: [] });
    expect(res.status).toBe(400);
  });
});

// ─── GET /tools ───────────────────────────────────────────────────────────────

describe('GET /tools', () => {
  test('retrieves all tools', async () => {
    const res = await request(app).get('/tools');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tools)).toBe(true);
    const found = res.body.tools.find(t => t.name === 'create_api_endpoint');
    expect(found).toBeDefined();
  });
});

// ─── GET /tools/:id ───────────────────────────────────────────────────────────

describe('GET /tools/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/tools')
      .send({ name: 'delete_record', description: 'Deletes a record from DB.', arguments: sampleArgs });
    createdId = res.body._id;
    insertedToolIds.push(createdId);
  });

  test('retrieves the correct tool by ID', async () => {
    const res = await request(app).get(`/tools/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('delete_record');
  });

  test('returns 404 for a valid but non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app).get(`/tools/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test('returns 400 for a malformed ID', async () => {
    const res = await request(app).get('/tools/not-a-real-id');
    expect(res.status).toBe(400);
  });
});

// ─── PUT /tools/:id ───────────────────────────────────────────────────────────

describe('PUT /tools/:id', () => {
  let createdId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/tools')
      .send({ name: 'update_record', description: 'Updates a record.', arguments: sampleArgs });
    createdId = res.body._id;
    insertedToolIds.push(createdId);
  });

  test('updates the name and description', async () => {
    const res = await request(app)
      .put(`/tools/${createdId}`)
      .send({ name: 'update_record_v2', description: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tool updated');
  });

  test('updates the arguments object', async () => {
    const newArgs = { table: { type: 'string', description: 'Table name' } };
    const res = await request(app)
      .put(`/tools/${createdId}`)
      .send({ arguments: newArgs });
    expect(res.status).toBe(200);
  });

  test('updated fields are persisted', async () => {
    const res = await request(app).get(`/tools/${createdId}`);
    expect(res.body.name).toBe('update_record_v2');
  });

  test('returns 400 when body is empty', async () => {
    const res = await request(app).put(`/tools/${createdId}`).send({});
    expect(res.status).toBe(400);
  });

  test('returns 404 for non-existent ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app).put(`/tools/${fakeId}`).send({ name: 'ghost' });
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /tools/:id ────────────────────────────────────────────────────────

describe('DELETE /tools/:id', () => {
  let targetId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/tools')
      .send({ name: 'to_be_deleted', description: 'Will be deleted.', arguments: sampleArgs });
    targetId = res.body._id;
  });

  test('deletes a tool', async () => {
    const res = await request(app).delete(`/tools/${targetId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tool deleted');
  });

  test('deleted tool is no longer retrievable', async () => {
    const res = await request(app).get(`/tools/${targetId}`);
    expect(res.status).toBe(404);
  });

  test('returns 404 when deleting already-deleted tool', async () => {
    const res = await request(app).delete(`/tools/${targetId}`);
    expect(res.status).toBe(404);
  });
});

// ─── POST /assign_tools_to_staff ──────────────────────────────────────────────

describe('POST /assign_tools_to_staff', () => {
  let staffId;
  let toolId;

  beforeAll(async () => {
    const staffRes = await staffCollection.insertOne({
      name: 'Test Staff Member',
      email: 'teststaff@trimergecpa.com',
      position: 'some-uuid',
      created_at: new Date(),
    });
    staffId = staffRes.insertedId.toString();
    insertedStaffIds.push(staffId);

    const toolRes = await request(app)
      .post('/tools')
      .send({ name: 'assign_test_tool', description: 'Tool for assign test.', arguments: sampleArgs });
    toolId = toolRes.body._id;
    insertedToolIds.push(toolId);
  });

  test('assigns tools to a staff member', async () => {
    const res = await request(app)
      .post('/assign_tools_to_staff')
      .send({ staff: staffId, tools: [toolId] });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tools assigned');
  });

  test('returns 400 when staff ID is missing', async () => {
    const res = await request(app)
      .post('/assign_tools_to_staff')
      .send({ tools: [toolId] });
    expect(res.status).toBe(400);
  });

  test('returns 400 when tools is not an array', async () => {
    const res = await request(app)
      .post('/assign_tools_to_staff')
      .send({ staff: staffId, tools: 'not-an-array' });
    expect(res.status).toBe(400);
  });

  test('returns 404 for non-existent staff ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app)
      .post('/assign_tools_to_staff')
      .send({ staff: fakeId, tools: [toolId] });
    expect(res.status).toBe(404);
  });
});

// ─── GET /get_staff_tools/:staff_id ───────────────────────────────────────────

describe('GET /get_staff_tools/:staff_id', () => {
  let staffId;
  let toolId;

  beforeAll(async () => {
    const toolRes = await request(app)
      .post('/tools')
      .send({ name: 'get_staff_tool_test', description: 'Tool for get_staff_tools test.', arguments: sampleArgs });
    toolId = toolRes.body._id;
    insertedToolIds.push(toolId);

    const staffRes = await staffCollection.insertOne({
      name: 'Staff With Tools',
      email: 'staffwithtools@trimergecpa.com',
      position: 'some-uuid',
      tools: [toolId],
      created_at: new Date(),
    });
    staffId = staffRes.insertedId.toString();
    insertedStaffIds.push(staffId);
  });

  test('returns the full tool objects for a staff member', async () => {
    const res = await request(app).get(`/get_staff_tools/${staffId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('get_staff_tool_test');
    expect(res.body[0].arguments).toEqual(sampleArgs);
  });

  test('returns empty array when staff has no tools', async () => {
    const staffRes = await staffCollection.insertOne({
      name: 'Staff No Tools',
      email: 'notools@trimergecpa.com',
      position: 'some-uuid',
      created_at: new Date(),
    });
    const noToolsStaffId = staffRes.insertedId.toString();
    insertedStaffIds.push(noToolsStaffId);

    const res = await request(app).get(`/get_staff_tools/${noToolsStaffId}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 404 for non-existent staff ID', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app).get(`/get_staff_tools/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test('returns 400 for malformed staff ID', async () => {
    const res = await request(app).get('/get_staff_tools/not-a-real-id');
    expect(res.status).toBe(400);
  });
});
