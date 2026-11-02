// server.js — Express application entry point
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const predictionRoutes     = require('./routes/predictionRoutes');
const modelRoutes          = require('./routes/modelRoutes');
const explainabilityRoutes = require('./routes/explainabilityRoutes');
const mlService            = require('./services/mlService');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & Logging ────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Health ────────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const mlHealth = await mlService.healthCheck();
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mlService: mlHealth,
  });
});

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/predictions',     predictionRoutes);
app.use('/api/predict',         predictionRoutes);   // alias: POST /api/predict -> predictionRoutes POST /
app.use('/api/models',          modelRoutes);
app.use('/api/explainability',  explainabilityRoutes);
app.use('/api/analytics',       predictionRoutes);   // analytics/summary is registered inside

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Error handler (must be last)
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Backend] Listening on http://localhost:${PORT}`);
    console.log(`[Backend] ML service: ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
  });
};

start();

module.exports = app;
