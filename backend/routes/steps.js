// routes/stepRoutes.js
const express = require('express');
const router = express.Router();
const { completeStep, getSteps } = require('../controllers/stepController');

// Add data validation middleware here (e.g., using express-validator)

router.post('/:id/complete-step', completeStep);
router.get('/:id/steps', getSteps);

module.exports = router;