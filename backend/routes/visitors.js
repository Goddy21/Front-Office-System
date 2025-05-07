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
           <title>Contract Agreement Form</title>
           <style>
             body {
               font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
               background: #f9f9f9;
               margin: 0;
               padding: 40px;
               display: flex;
               justify-content: center;
               align-items: flex-start;
             }
             .container {
               background: white;
               padding: 30px;
               border-radius: 10px;
               box-shadow: 0 4px 12px rgba(0,0,0,0.1);
               width: 600px;
             }
             h2 {
               margin-top: 0;
               text-align: center;
               color: #333;
             }
             form {
               display: flex;
               flex-direction: column;
               gap: 15px;
             }
             label {
               font-weight: 600;
               color: #555;
             }
             input[type="text"],
             input[type="email"],
             input[type="file"],
             select {
               padding: 10px;
               border: 1px solid #ccc;
               border-radius: 6px;
               font-size: 14px;
               width: 100%;
             }
             input[type="checkbox"] {
               margin-right: 10px;
             }
             button {
               background-color: #4CAF50;
               color: white;
               padding: 12px;
               border: none;
               border-radius: 6px;
               cursor: pointer;
               font-size: 16px;
               transition: background 0.3s;
             }
             button:hover {
               background-color: #45a049;
             }
             ul {
               list-style: none;
               padding: 0;
               margin-bottom: 30px;
             }
             li {
               padding: 8px 0;
               border-bottom: 1px solid #eee;
               color: #666;
             }
             .completed {
               color: green;
               font-weight: 600;
             }
             .pending {
               color: red;
               font-weight: 600;
             }
           </style>
         </head>
         <body>
           <div class="container">
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
             <form method="POST" action="/api/visitors/agreement/complete-step" enctype="multipart/form-data">
               <input type="hidden" name="visitorId" value="${id}" />
               <input type="hidden" name="stepName" value="contract_signed" />


               <label for="email">Email Address:</label>
               <input type="email" id="email" name="email" required>

               <label for="id_number">ID Number:</label>
               <input type="text" id="id_number" name="id_number" required>

               <label for="contract_signed">
                 <input type="checkbox" id="contract_signed" name="contract_signed" value="true">
                 Contract Signed
               </label>

               <label for="songs">Upload Songs:</label>
               <input type="file" id="songs" name="songs" multiple accept=".mp3,.wav">

               <label for="artwork">Upload Artwork:</label>
               <input type="file" id="artwork" name="artwork" accept="image/*">

               <label for="status">Final Status:</label>
               <select name="status" id="status" required>
                 <option value="">Select status</option>
                 <option value="pending">Pending</option>
                 <option value="registered">Registered</option>
                 <option value="declined">Declined</option>
               </select>

               <button type="submit">Submit Contract</button>
             </form>
           </div>
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
