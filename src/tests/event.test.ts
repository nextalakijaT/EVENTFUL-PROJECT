import request from 'supertest';
import app from '../app';

async function registerAndLogin(role: 'creator' | 'eventee', email: string) {
  await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email,
    password: 'password123',
    role,
  });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  return res.body.accessToken as string;
}

describe('Event routes', () => {
  it('allows a creator to create an event', async () => {
    const token = await registerAndLogin('creator', 'creator1@test.com');
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Concert',
        description: 'A great show',
        date: '2026-12-01T18:00:00Z',
        venue: 'Test Arena',
        price: 5000,
        capacity: 100,
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Concert');
  });

  it('blocks an eventee from creating an event', async () => {
    const token = await registerAndLogin('eventee', 'eventee1@test.com');
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Should Fail',
        description: 'Not allowed',
        date: '2026-12-01T18:00:00Z',
        venue: 'Nowhere',
        price: 1000,
        capacity: 10,
      });
    expect(res.status).toBe(403);
  });

  it('allows public browsing without a token', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  it("blocks a non-owner creator from updating someone else's event", async () => {
    const ownerToken = await registerAndLogin('creator', 'owner@test.com');
    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Owned Event',
        description: 'desc',
        date: '2026-12-01T18:00:00Z',
        venue: 'Venue',
        price: 1000,
        capacity: 10,
      });
    const eventId = createRes.body._id;

    const otherToken = await registerAndLogin('creator', 'intruder@test.com');
    const updateRes = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hijacked Title' });

    expect(updateRes.status).toBe(403);
  });
});