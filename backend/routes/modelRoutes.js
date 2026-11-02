// routes/modelRoutes.js
const express = require('express');
const router  = express.Router();
const { getModels } = require('../controllers/modelController');

router.get('/', getModels);

module.exports = router;
