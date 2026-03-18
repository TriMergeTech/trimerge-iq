import request from 'supertest';
import app from '../src/app';
import axios from 'axios';

// Mock axios to prevent actual network requests during testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Gateway Integration Tests', () => {
  let token: string;

  it('1. Should return 200 OK on health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('2. Should authenticate admin and return a valid JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // Save token for protected routes
  });

  it('3. Should block unauthorized access to AI routes', async () => {
    const res = await request(app).get('/api/ai/search?query=test');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Unauthorized/);
  });

  it('4. Should allow authorized access and forward search to AI Engine', async () => {
    // Mock the Python AI Engine response
    mockedAxios.get.mockResolvedValueOnce({ data: { result: 'Mocked AI Python response' } });

    const res = await request(app)
      .get('/api/ai/search?query=kubernetes')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.result).toBe('Mocked AI Python response');
  });
});