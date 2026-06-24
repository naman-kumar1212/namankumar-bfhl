/**
 * Centralised configuration — all env vars read in one place.
 * Every other module imports config from here instead of touching process.env directly.
 */

require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = config;
