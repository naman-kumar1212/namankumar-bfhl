/**
 * Server entry point.
 * 
 * This file's ONLY job is to start the HTTP listener.
 * All app configuration lives in src/app.js.
 */

const app = require('./src/app');
const config = require('./src/config');

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`
  ┌──────────────────────────────────────────┐
  │  BFHL Graph API                          │
  │  Environment : ${config.nodeEnv.padEnd(24)}│
  │  Port        : ${String(config.port).padEnd(24)}│
  │  CORS Origin : ${config.corsOrigin.padEnd(24)}│
  └──────────────────────────────────────────┘
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

module.exports = server;
