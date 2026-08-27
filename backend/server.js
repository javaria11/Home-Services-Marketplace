require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { pool } = require('./db/pool');
const authRoutes = require('./routes/auth');
const bookingsRoutes = require('./routes/bookings');
const reviewsRoutes = require('./routes/reviews');
const providersRoutes = require('./routes/providers');
const adminRoutes = require('./routes/admin');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://home-services-marketplace-lime.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.options('*', cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Home Services Marketplace API is running' });
});

app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'unreachable', detail: err.message });
  }
});

app.use('/api/auth', authRoutes);

app.use('/api/providers', providersRoutes);

app.use('/api/bookings', bookingsRoutes);

app.use('/api/reviews', reviewsRoutes);

app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', status_code: 404 });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
