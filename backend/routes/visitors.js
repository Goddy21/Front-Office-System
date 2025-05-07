const pool = require('../config/db');
const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const contractAgreement = require('../contract-agreement/contract_agreement');
const multer = require('multer');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// visitors operation
router.post('/', visitorController.createVisitor);
router.get('/', visitorController.getAllVisitors);
router.delete('/:id', visitorController.deleteVisitor);
router.patch('/confirm-visit/:id', visitorController.confirmVisit);
router.get('/view-issue-type/:issueType', visitorController.getVisitorsByIssueType);

//contract management operations
router.patch('/agreement/decline/:visitorId', contractAgreement.declineVisitor);
router.get('/agreement/steps/:visitorId', contractAgreement.getContractSteps);

router.post(
  '/agreement/complete-step',
  upload.fields([
    { name: 'songs', maxCount: 5 },
    { name: 'artwork', maxCount: 1 },
  ]),
  contractAgreement.completeAgreementStep
);


router.patch('/agreement/decline/:visitorId', contractAgreement.declineVisitor);
router.get('/agreement/steps/:visitorId', contractAgreement.getContractSteps);
router.get('/start-contract/:id', contractAgreement.startContract);


module.exports = router;
