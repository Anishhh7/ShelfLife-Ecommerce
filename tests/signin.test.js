import request from "supertest";
import app from "../app.js";
import "./setup.js";


describe('login', () => {
  test('login accepted', async () => {
    const res = await request(app).post('/api/v1/auth/signin').send({
      email: 'test@example.com',
      password: 'password123',
    });
 
    expect(res.statusCode).toBe(200);
  });
});