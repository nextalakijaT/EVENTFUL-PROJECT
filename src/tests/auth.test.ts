import request from 'supertest';
import app from '../app';

describe('Auth routes', () => {
  const testUser = {
    name: 'Test Creator',
    email: 'creator@test.com',
    password: 'password123',
    role: 'creator',
  };

  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('rejects invalid role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'other@test.com', role: 'admin' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});