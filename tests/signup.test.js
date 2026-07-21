import request from 'supertest';
import app from '../app.js';
import './setup.js';

describe('signup', () => {
  test('account should created', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toBeDefined();
  });
});
