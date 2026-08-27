const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

const VALID_STATUSES = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'];

router.post('/', verifyToken, async (req, res) => {
  try {
    const { provider_id, category_name, scheduled_date, address, price } = req.body;

    if (!provider_id || !category_name || !scheduled_date) {
      return res.status(400).json({
        error: 'provider_id, category_name, and scheduled_date are required',
        status_code: 400,
      });
    }

    const providerCheck = await query('SELECT id FROM provider_profiles WHERE id = $1', [
      provider_id,
    ]);
    if (providerCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found', status_code: 404 });
    }

    const categoryResult = await query('SELECT id FROM service_categories WHERE name = $1', [
      category_name,
    ]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: `Unknown category: ${category_name}`, status_code: 400 });
    }

    const result = await query(
      `INSERT INTO bookings (customer_id, provider_id, category_id, scheduled_date, address, estimated_price_min, estimated_price_max, status)
       VALUES ($1, $2, $3, $4, $5, $6, $6, 'requested')
       RETURNING *`,
      [req.user.id, provider_id, categoryResult.rows[0].id, scheduled_date, address || null, price || null]
    );

    res.status(201).json({ message: 'Booking created successfully', booking: result.rows[0] });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Something went wrong creating the booking', status_code: 500 });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, u.full_name AS provider_name, sc.name AS category
       FROM bookings b
       JOIN provider_profiles pp ON pp.id = b.provider_id
       JOIN users u ON u.id = pp.user_id
       JOIN service_categories sc ON sc.id = b.category_id
       WHERE b.customer_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ bookings: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Fetch my bookings error:', err);
    res.status(500).json({ error: 'Something went wrong fetching bookings', status_code: 500 });
  }
});

router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'You can only view your own bookings', status_code: 403 });
    }

    const result = await query(
      `SELECT b.*, u.full_name AS provider_name, sc.name AS category
       FROM bookings b
       JOIN provider_profiles pp ON pp.id = b.provider_id
       JOIN users u ON u.id = pp.user_id
       JOIN service_categories sc ON sc.id = b.category_id
       WHERE b.customer_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json({ bookings: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ error: 'Something went wrong fetching bookings', status_code: 500 });
  }
});

router.get('/provider/:providerId', verifyToken, async (req, res) => {
  try {
    const providerId = req.params.providerId;

    const result = await query(
      `SELECT b.*, u.full_name AS customer_name
       FROM bookings b
       JOIN users u ON u.id = b.customer_id
       WHERE b.provider_id = $1
       ORDER BY b.created_at DESC`,
      [providerId]
    );
    res.json({ bookings: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Fetch provider bookings error:', err);
    res
      .status(500)
      .json({ error: 'Something went wrong fetching provider bookings', status_code: 500 });
  }
});

router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}`, status_code: 400 });
    }

    const existing = await query(
      `SELECT b.*, pp.user_id AS provider_user_id
       FROM bookings b
       JOIN provider_profiles pp ON pp.id = b.provider_id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found', status_code: 404 });
    }

    const booking = existing.rows[0];
    const isOwningProvider = req.user.role === 'provider' && req.user.id === booking.provider_user_id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwningProvider && !isAdmin) {
      return res.status(403).json({
        error: 'Only the assigned provider or an admin can update this booking',
        status_code: 403,
      });
    }

    const result = await query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    res.json({ message: 'Booking status updated', booking: result.rows[0] });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ error: 'Something went wrong updating the booking', status_code: 500 });
  }
});

module.exports = router;