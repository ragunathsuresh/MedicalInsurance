// routes/explainabilityRoutes.js
const express = require('express');
const router  = express.Router();
const { getGlobalExplanation, getLocalExplanation } = require('../controllers/explainabilityController');

router.get('/global', getGlobalExplanation);
router.post('/local', getLocalExplanation);

module.exports = router;
