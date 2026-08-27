const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/activity', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [users, providers, bookings, reviews, pendingVerifications] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COUNT(*) FROM provider_profiles'),
      query(`SELECT status, COUNT(*) FROM bookings GROUP BY status`),
      query('SELECT COUNT(*) FROM reviews'),
      query('SELECT COUNT(*) FROM provider_profiles WHERE is_verified = false'),
    ]);
    res.json({
      total_users: Number(users.rows[0].count),
      total_providers: Number(providers.rows[0].count),
      total_reviews: Number(reviews.rows[0].count),
      pending_verifications: Number(pendingVerifications.rows[0].count),
      bookings_by_status: bookings.rows.reduce((acc, row) => {
        acc[row.status] = Number(row.count);
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error('Fetch admin activity error:', err);
    res.status(500).json({ error: 'Something went wrong fetching activity', status_code: 500 });
  }
});


router.get('/providers/pending', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT pp.id AS provider_id, u.full_name, u.email, sc.name AS category, pp.created_at
       FROM provider_profiles pp
       JOIN users u ON u.id = pp.user_id
       LEFT JOIN service_categories sc ON sc.id = pp.category_id
       WHERE pp.is_verified = false
       ORDER BY pp.created_at ASC`
    );
    res.json({ providers: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Fetch pending providers error:', err);
    res
      .status(500)
      .json({ error: 'Something went wrong fetching pending providers', status_code: 500 });
  }
});

module.exports = router;