const { Pool } = require('pg');

const useConnectionString = !!process.env.DATABASE_URL;

const sslConfig =
  process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false;

const pool = useConnectionString
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'home_services',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      ssl: sslConfig,
    });

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error on idle client', err);
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
