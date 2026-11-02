// routes/predictionRoutes.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const {
  createPrediction,
  getPredictions,
  getPredictionById,
  deletePrediction,
  getAnalyticsSummary,
} = require('../controllers/predictionController');

const predictionValidation = [
  body('model')
    .isIn(['xgboost', 'gbm', 'rf'])
    .withMessage('model must be one of: xgboost, gbm, rf'),
  body('features.Age')
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be an integer between 18 and 100'),
  body('features.Height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  body('features.Weight')
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be between 30 and 300 kg'),
  body('features.Diabetes')
    .isInt({ min: 0, max: 1 })
    .withMessage('Diabetes must be 0 or 1'),
  body('features.BloodPressureProblems')
    .isInt({ min: 0, max: 1 })
    .withMessage('BloodPressureProblems must be 0 or 1'),
  body('features.AnyTransplants')
    .isInt({ min: 0, max: 1 })
    .withMessage('AnyTransplants must be 0 or 1'),
  body('features.AnyChronicDiseases')
    .isInt({ min: 0, max: 1 })
    .withMessage('AnyChronicDiseases must be 0 or 1'),
  body('features.KnownAllergies')
    .isInt({ min: 0, max: 1 })
    .withMessage('KnownAllergies must be 0 or 1'),
  body('features.HistoryOfCancerInFamily')
    .isInt({ min: 0, max: 1 })
    .withMessage('HistoryOfCancerInFamily must be 0 or 1'),
  body('features.NumberOfMajorSurgeries')
    .isInt({ min: 0, max: 20 })
    .withMessage('NumberOfMajorSurgeries must be a non-negative integer up to 20'),
];

router.post('/', validate(predictionValidation), createPrediction);
router.get('/', getPredictions);
router.get('/analytics/summary', getAnalyticsSummary);
router.get('/:id', getPredictionById);
router.delete('/:id', deletePrediction);

module.exports = router;
