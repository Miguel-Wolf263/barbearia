'use strict';
const mysql = require('mysql2/promise');
const cfg = require('./config');

const pool = mysql.createPool({
  host: cfg.DB_HOST,
  port: cfg.DB_PORT,
  user: cfg.DB_USER,
  password: cfg.DB_PASS,
  database: cfg.DB_NAME,
  charset: 'utf8mb4',
  dateStrings: true,        
  waitForConnections: true,
  connectionLimit: 10,
});

async function q(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { pool, q };
