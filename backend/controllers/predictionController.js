// controllers/predictionController.js
const { v4: uuidv4 } = require('uuid');
const mlService = require('../services/mlService');
const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');

// POST /api/predict
const createPrediction = async (req, res, next) => {
  try {
    const { model, features } = req.body;

    // Call ML service
    const result = await mlService.predict(model, features);

    // Save to MongoDB (silently skip if DB unavailable)
    let predictionId = uuidv4();
    let saved = false;
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Prediction.create({
          predictionId,
          modelName:        result.model,
          inputFeatures:    features,
          bmi:              result.bmi,
          predictedPremium: result.predicted_premium,
        });
        predictionId = doc.predictionId;
        saved = true;
      } catch (dbErr) {
        console.warn('[DB] Could not save prediction:', dbErr.message);
      }
    }

    res.status(200).json({
      success: true,
      predictionId,
      saved,
      prediction: result.predicted_premium,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/predictions
const getPredictions = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }

    const { page = 1, limit = 20, model: modelFilter, sort = 'createdAt', order = 'desc' } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = modelFilter ? { modelName: modelFilter } : {};
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const [predictions, total] = await Promise.all([
      Prediction.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Prediction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: predictions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/predictions/:id
const getPredictionById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }
    const prediction = await Prediction.findOne({ predictionId: req.params.id }).lean();
    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }
    res.json({ success: true, data: prediction });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/predictions/:id
const deletePrediction = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database unavailable' });
    }
    const result = await Prediction.deleteOne({ predictionId: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }
    res.json({ success: true, message: 'Prediction deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/summary
const getAnalyticsSummary = async (req, res, next) => {
  try {
    let dbAvailable = mongoose.connection.readyState === 1;
    if (!dbAvailable) {
      return res.json({
        success: true,
        dbAvailable: false,
        totalPredictions: 0,
        byModel: [],
        avgPremium: 0,
        minPremium: 0,
        maxPremium: 0,
      });
    }

    const [total, byModel, premiumStats] = await Promise.all([
      Prediction.countDocuments(),
      Prediction.aggregate([
        { $group: { _id: '$modelName', count: { $sum: 1 }, avgPremium: { $avg: '$predictedPremium' } } },
        { $sort: { count: -1 } },
      ]),
      Prediction.aggregate([
        {
          $group: {
            _id: null,
            avg:  { $avg:  '$predictedPremium' },
            min:  { $min:  '$predictedPremium' },
            max:  { $max:  '$predictedPremium' },
          },
        },
      ]),
    ]);

    const stats = premiumStats[0] || { avg: 0, min: 0, max: 0 };
    res.json({
      success:          true,
      dbAvailable:      true,
      totalPredictions: total,
      byModel,
      avgPremium:       Math.round(stats.avg || 0),
      minPremium:       Math.round(stats.min || 0),
      maxPremium:       Math.round(stats.max || 0),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPrediction, getPredictions, getPredictionById, deletePrediction, getAnalyticsSummary };
