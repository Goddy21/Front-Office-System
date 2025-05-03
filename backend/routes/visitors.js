const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

// CORRECT: These paths are relative to /api/visitors
router.post('/', visitorController.createVisitor);
router.get('/', visitorController.getAllVisitors);
router.delete('/:id', visitorController.deleteVisitor);
router.patch('/confirm-visit/:id', visitorController.confirmVisit);
router.get('/view-issue-type/:issueType', visitorController.getVisitorsByIssueType);

module.exports = router;
