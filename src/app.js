/**
 * Express application factory.
 * 
 * Creates and configures the Express app with all middleware and routes.
 * Exported separately from server.js so supertest can import the app
 * without starting the HTTP listener.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const graphRoutes = require('./routes/graphRoutes');

const app = express();

// ── Security ────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ── Body parsing ────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Request logging (skip in test) ──────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BFHL Graph API is running',
    version: '1.0.0',
  });
});

// ── API routes ──────────────────────────────────────────
app.use('/bfhl', graphRoutes);

// ── 404 catch-all ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global error handler (must be last) ─────────────────
app.use(errorHandler);

module.exports = app;
