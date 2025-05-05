const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const contractAgreement = require('../contract-agreement/contract_agreement');

// visitors operation
router.post('/', visitorController.createVisitor);
router.get('/', visitorController.getAllVisitors);
router.delete('/:id', visitorController.deleteVisitor);
router.patch('/confirm-visit/:id', visitorController.confirmVisit);
router.get('/view-issue-type/:issueType', visitorController.getVisitorsByIssueType);

//contract management operations
router.post('/agreement/complete-step', contractAgreement.completeAgreementStep);
router.patch('/agreement/decline/:visitorId', contractAgreement.declineVisitor);
router.get('/agreement/steps/:visitorId', contractAgreement.getContractSteps);


router.get('/start-contract/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Fetching contract steps for visitor ID:', id);  
  
    try {
        const result = await pool.query('SELECT * FROM agreement_steps WHERE visitor_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).send('No agreement steps found for this visitor.');
        }

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Contract Steps</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    ul { list-style: none; padding: 0; }
                    li { margin-bottom: 10px; }
                    .completed { color: green; }
                    .pending { color: red; }
                </style>
            </head>
            <body>
                <h2>Contract Agreement Steps</h2>
                <ul>
        `;

        result.rows.forEach(step => {
            html += `<li class="${step.completed ? 'completed' : 'pending'}">
              ${step.step_name.replace('_', ' ')} - ${step.completed ? '✅ Completed' : '❌ Pending'}
            </li>`;
        });

        html += `
            </ul>
            </body>
            </html>
        `;

        res.send(html);
    } catch (err) {
        console.error('Error loading contract steps:', err);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
