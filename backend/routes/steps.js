const express = require('express');
const router = express.Router();
const { completeStep, getSteps } = require('../controllers/stepController');

router.post('/:id/complete-step', completeStep);
router.get('/:id/steps', getSteps);

module.exports = router;
