const express = require('express');
const router = express.Router();

const { query } = require('../db/pool');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const {
      category,
      max_price,
      min_rating,
    } = req.query;

    const conditions = [];
    const values = [];

    if (category && category.trim() !== '') {
      values.push(category.trim());
      conditions.push(`sc.name ILIKE $${values.length}`);
    }

    if (max_price !== undefined && max_price !== '') {
      const maxPrice = Number(max_price);

      if (Number.isNaN(maxPrice) || maxPrice < 0) {
        return res.status(400).json({
          error: 'max_price must be a valid positive number',
          status_code: 400,
        });
      }

      values.push(maxPrice);
      conditions.push(`pp.hourly_rate <= $${values.length}`);
    }

    if (min_rating !== undefined && min_rating !== '') {
      const minRating = Number(min_rating);

      if (Number.isNaN(minRating) || minRating < 0 || minRating > 5) {
        return res.status(400).json({
          error: 'min_rating must be a number between 0 and 5',
          status_code: 400,
        });
      }

      values.push(minRating);
      conditions.push(`COALESCE(pp.rating_avg, 0) >= $${values.length}`);
    }

    let sql = `
      SELECT
        pp.id AS provider_id,
        pp.user_id,
        u.full_name AS name,
        u.email,
        pp.bio,
        pp.hourly_rate,
        COALESCE(pp.rating_avg, 0) AS rating,
        pp.is_available,
        pp.skill_tags,
        pp.pricing_tier,
        pp.is_verified,
        sc.id AS category_id,
        sc.name AS category
      FROM provider_profiles pp
      JOIN users u
        ON u.id = pp.user_id
      LEFT JOIN service_categories sc
        ON sc.id = pp.category_id
    `;

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += `
      ORDER BY
        pp.is_verified DESC,
        COALESCE(pp.rating_avg, 0) DESC,
        pp.hourly_rate ASC,
        u.full_name ASC
    `;

    const result = await query(sql, values);

    res.json({
      providers: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('Provider search error:', err);

    res.status(500).json({
      error: 'Something went wrong searching providers',
      status_code: 500,
    });
  }
});

router.get('/me', verifyToken, requireRole('provider'), async (req, res) => {
  try {
    const result = await query(
      `SELECT pp.*, sc.name AS category
       FROM provider_profiles pp
       LEFT JOIN service_categories sc ON sc.id = pp.category_id
       WHERE pp.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Provider profile not found',
        status_code: 404,
      });
    }

    res.json({
      provider: result.rows[0],
    });
  } catch (err) {
    console.error('Fetch own provider profile error:', err);

    res.status(500).json({
      error: 'Something went wrong fetching your profile',
      status_code: 500,
    });
  }
});

router.patch('/me', verifyToken, requireRole('provider'), async (req, res) => {
  try {
    const {
      bio,
      hourly_rate,
      category_id,
      is_available,
      skill_tags,
      pricing_tier,
    } = req.body;

    const result = await query(
      `UPDATE provider_profiles
       SET bio = COALESCE($1, bio),
           hourly_rate = COALESCE($2, hourly_rate),
           category_id = COALESCE($3, category_id),
           is_available = COALESCE($4, is_available),
           skill_tags = COALESCE($5, skill_tags),
           pricing_tier = COALESCE($6, pricing_tier)
       WHERE user_id = $7
       RETURNING *`,
      [
        bio,
        hourly_rate,
        category_id,
        is_available,
        skill_tags,
        pricing_tier,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Provider profile not found',
        status_code: 404,
      });
    }

    res.json({
      message: 'Profile updated',
      provider: result.rows[0],
    });
  } catch (err) {
    console.error('Update provider profile error:', err);

    res.status(500).json({
      error: 'Something went wrong updating your profile',
      status_code: 500,
    });
  }
});

router.get('/me/earnings', verifyToken, requireRole('provider'), async (req, res) => {
  try {
    const providerResult = await query(
      'SELECT id FROM provider_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Provider profile not found',
        status_code: 404,
      });
    }

    const providerId = providerResult.rows[0].id;

    const summaryResult = await query(
      `SELECT
         COALESCE(SUM(estimated_price_max), 0) AS total_earnings,
         COUNT(*) AS completed_jobs
       FROM bookings
       WHERE provider_id = $1
         AND status = 'completed'`,
      [providerId]
    );

    const historyResult = await query(
      `SELECT
         b.id,
         b.scheduled_date,
         b.estimated_price_max AS amount,
         u.full_name AS customer_name,
         sc.name AS category
       FROM bookings b
       JOIN users u
         ON u.id = b.customer_id
       LEFT JOIN service_categories sc
         ON sc.id = b.category_id
       WHERE b.provider_id = $1
         AND b.status = 'completed'
       ORDER BY b.scheduled_date DESC`,
      [providerId]
    );

    res.json({
      total_earnings: summaryResult.rows[0].total_earnings,
      completed_jobs: Number(summaryResult.rows[0].completed_jobs),
      history: historyResult.rows,
    });

  } catch (err) {
    console.error('Fetch earnings error:', err);

    res.status(500).json({
      error: 'Something went wrong fetching earnings',
      status_code: 500,
    });
  }
});

router.get('/categories-list', verifyToken, async (req, res) => {
  try {
    const result = await query(`SELECT id, name FROM service_categories ORDER BY name ASC`);
    res.json({ categories: result.rows });
  } catch (err) {
    console.error('Fetch categories list error:', err);
    res.status(500).json({ error: 'Something went wrong fetching categories', status_code: 500 });
  }
});

router.get(
  '/categories',
  verifyToken,
  requireRole('admin'),
  async (req, res) => {
    try {
      const result = await query(
        `SELECT
           id,
           name,
           base_commission_percent
         FROM service_categories
         ORDER BY name ASC`
      );

      res.json({
        categories: result.rows,
        count: result.rows.length,
      });
    } catch (err) {
      console.error('Fetch service categories error:', err);

      res.status(500).json({
        error: 'Something went wrong fetching service categories',
        status_code: 500,
      });
    }
  }
);

router.patch('/:id/verify', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { is_verified } = req.body;

    const result = await query(
      `UPDATE provider_profiles
       SET is_verified = $1
       WHERE id = $2
       RETURNING *`,
      [!!is_verified, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Provider not found',
        status_code: 404,
      });
    }

    res.json({
      message: 'Provider verification updated',
      provider: result.rows[0],
    });
  } catch (err) {
    console.error('Verify provider error:', err);

    res.status(500).json({
      error: 'Something went wrong updating verification',
      status_code: 500,
    });
  }
});

router.patch(
  '/categories/:id/commission',
  verifyToken,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { base_commission_percent } = req.body;

      if (base_commission_percent === undefined) {
        return res.status(400).json({
          error: 'base_commission_percent is required',
          status_code: 400,
        });
      }

      const result = await query(
        `UPDATE service_categories
         SET base_commission_percent = $1
         WHERE id = $2
         RETURNING *`,
        [base_commission_percent, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Category not found',
          status_code: 404,
        });
      }

      res.json({
        message: 'Commission rate updated',
        category: result.rows[0],
      });
    } catch (err) {
      console.error('Update commission error:', err);

      res.status(500).json({
        error: 'Something went wrong updating commission',
        status_code: 500,
      });
    }
  }
);


module.exports = router;