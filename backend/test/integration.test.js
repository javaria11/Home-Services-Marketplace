const path = require('path');
const assert = require('assert');
const fs = require('fs');

const { newDb } = require('pg-mem');
const db = newDb({ autoCreateForeignKeyIndices: true });

db.public.registerFunction({
  name: 'now',
  returns: 'timestamp',
  implementation: () => new Date(),
});

db.public.registerFunction({
  name: 'round',
  args: ['float', 'int'],
  returns: 'float',
  implementation: (val, precision) => Number(Number(val).toFixed(precision)),
});

const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
db.public.none(schema);

const { Pool } = db.adapters.createPg();
const fakePool = new Pool();

const Module = require('module');
const originalResolve = Module._resolveFilename;
const poolPath = require.resolve('../db/pool');
require.cache[poolPath] = {
  id: poolPath,
  filename: poolPath,
  loaded: true,
  exports: { pool: fakePool, query: (text, params) => fakePool.query(text, params) },
};

process.env.JWT_SECRET = 'test_secret';

const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth');
const bookingsRoutes = require('../routes/bookings');
const reviewsRoutes = require('../routes/reviews');
const providersRoutes = require('../routes/providers');
const adminRoutes = require('../routes/admin');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);

const request = require('supertest');

async function run() {
  let passed = 0;
  const check = (label, cond) => {
    assert.ok(cond, `FAILED: ${label}`);
    console.log(`  ok - ${label}`);
    passed++;
  };

  await fakePool.query(`INSERT INTO service_categories (name) VALUES ('Painter')`);

  console.log('1. Signup: customer');
  let res = await request(app).post('/api/auth/signup').send({
    name: 'Alice Customer', email: 'alice@test.com', password: 'pass1234', role: 'customer',
  });
  check('customer signup returns 201', res.status === 201);

  console.log('2. Signup: provider (auto-creates provider_profiles row)');
  res = await request(app).post('/api/auth/signup').send({
    name: 'Bob Painter', email: 'bob@test.com', password: 'pass1234', role: 'provider',
  });
  check('provider signup returns 201', res.status === 201);
  const providerUserId = res.body.user.id;

  console.log('3. Signup: admin');
  res = await request(app).post('/api/auth/signup').send({
    name: 'Carol Admin', email: 'carol@test.com', password: 'pass1234', role: 'admin',
  });
  check('admin signup returns 201', res.status === 201);

  console.log('4. Duplicate signup is rejected');
  res = await request(app).post('/api/auth/signup').send({
    name: 'Dup', email: 'alice@test.com', password: 'pass1234', role: 'customer',
  });
  check('duplicate email returns 400', res.status === 400);

  console.log('5. Login as each role');
  const loginAs = async (email) => {
    const r = await request(app).post('/api/auth/login').send({ email, password: 'pass1234' });
    check(`login ${email} returns token`, r.status === 200 && !!r.body.token);
    return r.body;
  };
  const customerAuth = await loginAs('alice@test.com');
  const providerAuth = await loginAs('bob@test.com');
  const adminAuth = await loginAs('carol@test.com');

  console.log('6. Wrong password rejected');
  res = await request(app).post('/api/auth/login').send({ email: 'alice@test.com', password: 'wrong' });
  check('bad password returns 401', res.status === 401);

  console.log('7. Provider sets up their profile');
  res = await request(app)
    .patch('/api/providers/me')
    .set('Authorization', `Bearer ${providerAuth.token}`)
    .send({ bio: 'Experienced painter', hourly_rate: 40, category_id: 1, is_available: true });
  check('provider profile update returns 200', res.status === 200);
  const providerId = res.body.provider.id;
  check('hourly_rate persisted', Number(res.body.provider.hourly_rate) === 40);

  console.log('8. Public provider search finds the provider');
  res = await request(app).get('/api/providers').query({ category: 'Painter', max_price: 50, min_rating: 0 });
  check('search returns the provider', res.status === 200 && res.body.providers.some(p => p.provider_id === providerId));

  console.log('9. Customer creates a booking');
  res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customerAuth.token}`)
    .send({ provider_id: providerId, service_type: 'Painter', booking_date: '2026-09-01', price: 120 });
  check('booking created returns 201', res.status === 201);
  const bookingId = res.body.booking.id;
  check('booking starts as requested', res.body.booking.status === 'requested');

  console.log('10. Customer CANNOT change booking status (authorization check)');
  res = await request(app)
    .patch(`/api/bookings/${bookingId}/status`)
    .set('Authorization', `Bearer ${customerAuth.token}`)
    .send({ status: 'completed' });
  check('customer blocked from updating status (403)', res.status === 403);

  console.log('11. Assigned provider CAN accept the booking');
  res = await request(app)
    .patch(`/api/bookings/${bookingId}/status`)
    .set('Authorization', `Bearer ${providerAuth.token}`)
    .send({ status: 'accepted' });
  check('provider accepts booking', res.status === 200 && res.body.booking.status === 'accepted');

  console.log('12. Provider marks booking completed');
  res = await request(app)
    .patch(`/api/bookings/${bookingId}/status`)
    .set('Authorization', `Bearer ${providerAuth.token}`)
    .send({ status: 'completed' });
  check('provider completes booking', res.status === 200 && res.body.booking.status === 'completed');

  console.log('13. Customer views "My Bookings"');
  res = await request(app).get('/api/bookings/me').set('Authorization', `Bearer ${customerAuth.token}`);
  check('my bookings returns 1 booking', res.status === 200 && res.body.count === 1);

  console.log('14. Provider dashboard lists their bookings');
  res = await request(app)
    .get(`/api/bookings/provider/${providerId}`)
    .set('Authorization', `Bearer ${providerAuth.token}`);
  check('provider bookings list works', res.status === 200 && res.body.count === 1);

  console.log('15. Provider checks earnings (should reflect the completed $120 job)');
  res = await request(app).get('/api/providers/me/earnings').set('Authorization', `Bearer ${providerAuth.token}`);
  check('earnings total is 120', res.status === 200 && Number(res.body.total_earnings) === 120);
  check('completed_jobs is 1', Number(res.body.completed_jobs) === 1);

  console.log('16. Provider sets calendar availability');
  res = await request(app)
    .post('/api/providers/me/availability')
    .set('Authorization', `Bearer ${providerAuth.token}`)
    .send({ dates: [{ date: '2026-09-05', is_available: false }] });
  check('availability update returns 200', res.status === 200);

  console.log('17. Customer leaves a review');
  res = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${customerAuth.token}`)
    .send({ provider_id: providerId, booking_id: bookingId, rating: 5, comment: 'Great work!' });
  check('review created', res.status === 201);

  console.log('18. Provider rating average updates automatically');
  res = await request(app).get(`/api/reviews/${providerId}`);
  check('average rating reflects the review', res.status === 200 && Number(res.body.average_rating) === 5);

  console.log('19. Admin verifies the provider');
  res = await request(app)
    .patch(`/api/providers/${providerId}/verify`)
    .set('Authorization', `Bearer ${adminAuth.token}`)
    .send({ is_verified: true });
  check('admin verification works', res.status === 200 && res.body.provider.is_verified === true);

  console.log('20. Non-admin CANNOT verify a provider');
  res = await request(app)
    .patch(`/api/providers/${providerId}/verify`)
    .set('Authorization', `Bearer ${providerAuth.token}`)
    .send({ is_verified: true });
  check('non-admin blocked from verifying (403)', res.status === 403);

  console.log('21. Admin views platform activity snapshot');
  res = await request(app).get('/api/admin/activity').set('Authorization', `Bearer ${adminAuth.token}`);
  check('activity snapshot returns totals', res.status === 200 && res.body.total_users === 3);
  check('bookings_by_status reflects completed booking', res.body.bookings_by_status.completed === 1);

  console.log('22. No token -> 401 on protected route');
  res = await request(app).post('/api/bookings').send({ provider_id: providerId, service_type: 'x', booking_date: '2026-01-01' });
  check('missing token returns 401', res.status === 401);

  console.log(`\nAll ${passed} checks passed.`);
}

run().catch((err) => {
  console.error('\nINTEGRATION TEST FAILED:', err);
  process.exitCode = 1;
});
