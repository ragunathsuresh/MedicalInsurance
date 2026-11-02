// src/services/api.js — Axios instance pointing at Express backend
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.detail ||
      err.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Health ────────────────────────────────────────────────────────────────
export const getHealth = () => api.get('/health').then((r) => r.data);

// ── Models ────────────────────────────────────────────────────────────────
export const getModels = () => api.get('/models').then((r) => r.data);

// ── Predict ───────────────────────────────────────────────────────────────
export const predict = (model, features) =>
  api.post('/predictions', { model, features }).then((r) => r.data);

// ── Prediction history ────────────────────────────────────────────────────
export const getPredictions = (params = {}) =>
  api.get('/predictions', { params }).then((r) => r.data);

export const getPredictionById = (id) =>
  api.get(`/predictions/${id}`).then((r) => r.data);

export const deletePrediction = (id) =>
  api.delete(`/predictions/${id}`).then((r) => r.data);

// ── Analytics ────────────────────────────────────────────────────────────
export const getAnalyticsSummary = () =>
  api.get('/predictions/analytics/summary').then((r) => r.data);

// ── Explainability ────────────────────────────────────────────────────────
export const getGlobalExplainability = (model = 'xgboost') =>
  api.get('/explainability/global', { params: { model } }).then((r) => r.data);

export const getLocalExplainability = (model, features) =>
  api.post('/explainability/local', { model, features }).then((r) => r.data);

export default api;
