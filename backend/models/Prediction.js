// models/Prediction.js — Mongoose schema for prediction history
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    predictionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    modelName: {
      type: String,
      required: true,
      enum: ['xgboost', 'gbm', 'rf'],
      index: true,
    },
    inputFeatures: {
      Age: { type: Number, required: true },
      Diabetes: { type: Number, required: true },
      BloodPressureProblems: { type: Number, required: true },
      AnyTransplants: { type: Number, required: true },
      AnyChronicDiseases: { type: Number, required: true },
      Height: { type: Number, required: true },
      Weight: { type: Number, required: true },
      KnownAllergies: { type: Number, required: true },
      HistoryOfCancerInFamily: { type: Number, required: true },
      NumberOfMajorSurgeries: { type: Number, required: true },
    },
    bmi: {
      type: Number,
      required: true,
    },
    predictedPremium: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Indexes for common query patterns
predictionSchema.index({ createdAt: -1 });
predictionSchema.index({ modelName: 1, createdAt: -1 });
predictionSchema.index({ predictedPremium: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
