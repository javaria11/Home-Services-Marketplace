const express = require('express');
const router = express.Router();

const { query } = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  try {
    const { provider_id, booking_id, rating, comment } = req.body;

    if (!provider_id || !booking_id || rating === undefined || rating === null) {
      return res.status(400).json({
        error: 'provider_id, booking_id, and rating are required',
        status_code: 400,
      });
    }

    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        error: 'rating must be between 1 and 5',
        status_code: 400,
      });
    }

    const bookingResult = await query(
      `
      SELECT
        id,
        customer_id,
        provider_id,
        status
      FROM bookings
      WHERE id = $1
      `,
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Booking not found',
        status_code: 404,
      });
    }

    const booking = bookingResult.rows[0];

    if (String(booking.customer_id) !== String(req.user.id)) {
      return res.status(403).json({
        error: 'You can only review your own bookings',
        status_code: 403,
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        error: 'You can only review a completed booking',
        status_code: 400,
      });
    }

    if (String(booking.provider_id) !== String(provider_id)) {
      return res.status(400).json({
        error: 'Provider does not match this booking',
        status_code: 400,
      });
    }

    const existingReview = await query(
      `
      SELECT id
      FROM reviews
      WHERE booking_id = $1
      `,
      [booking_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({
        error: 'You have already reviewed this booking',
        status_code: 409,
      });
    }

    const result = await query(
      `
      INSERT INTO reviews
        (customer_id, provider_id, booking_id, rating, comment)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        req.user.id,
        provider_id,
        booking_id,
        numericRating,
        comment ? comment.trim() : '',
      ]
    );

    await query(
      `
      UPDATE provider_profiles
      SET rating_avg = (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM reviews
        WHERE provider_id = $1
      )
      WHERE id = $1
      `,
      [provider_id]
    );

    return res.status(201).json({
      message: 'Review submitted successfully',
      review: result.rows[0],
    });

  } catch (err) {
    console.error('Submit review error:', err);

    return res.status(500).json({
      error: 'Something went wrong submitting the review',
      status_code: 500,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name AS customer_name,
        sc.name AS category
      FROM reviews r
      JOIN users u
        ON u.id = r.customer_id
      JOIN provider_profiles p
        ON p.id = r.provider_id
      LEFT JOIN service_categories sc
        ON sc.id = p.category_id
      ORDER BY r.created_at DESC
      LIMIT 6
      `
    );

    return res.json(result.rows);

  } catch (err) {
    console.error('Fetch homepage reviews error:', err);

    return res.status(500).json({
      error: 'Something went wrong fetching reviews',
      status_code: 500,
    });
  }
});

router.get('/:providerId', async (req, res) => {
  try {
    const providerId = req.params.providerId;

    const result = await query(
      `
      SELECT
        r.*,
        u.full_name AS customer_name
      FROM reviews r
      JOIN users u
        ON u.id = r.customer_id
      WHERE r.provider_id = $1
      ORDER BY r.created_at DESC
      `,
      [providerId]
    );

    const avgResult = await query(
      `
      SELECT
        ROUND(AVG(rating)::numeric, 2) AS avg_rating
      FROM reviews
      WHERE provider_id = $1
      `,
      [providerId]
    );

    return res.json({
      reviews: result.rows,
      count: result.rows.length,
      average_rating: avgResult.rows[0].avg_rating,
    });

  } catch (err) {
    console.error('Fetch reviews error:', err);

    return res.status(500).json({
      error: 'Something went wrong fetching reviews',
      status_code: 500,
    });
  }
});


module.exports = router;