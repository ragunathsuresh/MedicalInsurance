// services/mlService.js — Communicates with the Python FastAPI inference service
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlClient = axios.create({
  baseURL: ML_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Forward a prediction request to FastAPI.
 * @param {string} model - 'xgboost' | 'gbm' | 'rf'
 * @param {object} features - raw input features (no BMI — FastAPI computes it)
 */
const predict = async (model, features) => {
  try {
    const { data } = await mlClient.post('/predict', { model, features });
    return data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      throw Object.assign(new Error('ML inference service is unavailable. Please ensure the Python FastAPI service is running.'), { statusCode: 503 });
    }
    if (err.response) {
      const detail = err.response.data?.detail || err.response.data?.error || 'Prediction failed';
      throw Object.assign(new Error(detail), { statusCode: err.response.status });
    }
    throw err;
  }
};

/**
 * Get list of available models and their metrics.
 */
const getModels = async () => {
  try {
    const { data } = await mlClient.get('/models');
    return data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw Object.assign(new Error('ML service unavailable'), { statusCode: 503 });
    }
    throw err;
  }
};

/**
 * Health-check the ML service.
 */
const healthCheck = async () => {
  try {
    const { data } = await mlClient.get('/health');
    return { available: true, ...data };
  } catch {
    return { available: false };
  }
};

/**
 * Get global SHAP explanations.
 */
const getGlobalExplainability = async (model = 'xgboost') => {
  const { data } = await mlClient.get(`/explain/global?model=${model}`);
  return data;
};

/**
 * Get local SHAP explanation for a single prediction.
 */
const getLocalExplainability = async (model, features) => {
  const { data } = await mlClient.post('/explain/local', { model, features });
  return data;
};

module.exports = { predict, getModels, healthCheck, getGlobalExplainability, getLocalExplainability };
