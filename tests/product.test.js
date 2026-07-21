import './setup.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './Config/config.env', quiet: true });
import request from 'supertest';
import app from '../app.js';

let token;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/v1/auth/signup')
    .send({
      name: 'Test Vendor',
      email: `vendor${Date.now()}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'vendor',
    });
  token = res.body.token;
  const vendorId = res.body.data.user._id;

  const adminRes = await request(app)
    .post('/api/v1/auth/signin')
    .send({
      email: 'admin@shelflife.com',
      password: 'passlogin123',
    });
  const adminToken = adminRes.body.token;

  await request(app)
    .patch(`/api/v1/auth/${vendorId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`);
});

// test('vendor cannot create product before approval', async () => {
//   const res = await request(app)
//     .post('/api/v1/products')
//     .set('Authorization', `Bearer ${token}`)
//     .send({ name: 'Test Product', price: 100 });

//   expect(res.statusCode).toBe(403);
// });

describe('create product', () => {
  test('should create a product', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        price: 100,
        stock: 10,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toBeDefined();
  });
});

describe('Products', () => {
  test('should get all product', async () => {
    const res = await request(app).get('/api/v1/products');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
