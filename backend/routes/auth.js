const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/pool');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_later';

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: 'name, email, password, and role are all required', status_code: 400 });
    }

    if (!['customer', 'provider', 'admin'].includes(role)) {
      return res
        .status(400)
        .json({ error: 'role must be one of: customer, provider, admin', status_code: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'An account with this email already exists', status_code: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [name, email, hashedPassword, role]
    );

    const newUser = result.rows[0];

    if (role === 'provider') {
      const categoryResult = await query('SELECT id FROM service_categories LIMIT 1');
      if (categoryResult.rows.length > 0) {
        await query(
          `INSERT INTO provider_profiles (user_id, category_id, hourly_rate, is_available)
           VALUES ($1, $2, 0, true)`,
          [newUser.id, categoryResult.rows[0].id]
        );
      }
    }

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: newUser.id, name: newUser.full_name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Something went wrong during signup', status_code: 500 });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required', status_code: 400 });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password', status_code: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password', status_code: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong during login', status_code: 500 });
  }
});

module.exports = router;