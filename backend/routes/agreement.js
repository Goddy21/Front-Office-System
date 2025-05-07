const express = require('express');
const router = express.Router();

const {
  completeAgreementStep,
  declineVisitor,
  getContractSteps
} = require('../contract-agreement/contract_agreement');

router.post('/complete-step', completeAgreementStep);
router.post('/decline/:visitorId', declineVisitor);
router.get('/steps/:visitorId', getContractSteps);

module.exports = router;
