const pool = require('../config/db');
const renderContractsOverviewHTML = require('../views/renderContractsOverviewHTML');

// Start new contract
const startContract = async (req, res) => {
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
             <h2>New Contract Agreement</h2>
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
}

// Update contract status
const updateContractStatus = async (visitorId) => {
    const result = await pool.query(
      'SELECT completed FROM agreement_steps WHERE visitor_id = $1',
      [visitorId]
    );
  
    const steps = result.rows;
  
    if (steps.length === 0) return; 
  
    if (steps.every(step => step.completed)) {
      await pool.query(
        'UPDATE visitors SET contract_status = $1 WHERE id = $2',
        ['registered', visitorId]
      );
    } else {
      await pool.query(
        'UPDATE visitors SET contract_status = $1 WHERE id = $2',
        ['pending', visitorId]
      );
    }
  };
  

  const completeAgreementStep = async (req, res) => {
    const { visitorId, stepName, id_number } = req.body;
    const files = req.files;
    console.log("Received form data:", req.body);
    console.log("Step Name Received:", stepName);
  
    try {
      // 1. Update main step
      const update = await pool.query(
        'UPDATE agreement_steps SET completed = true WHERE visitor_id = $1 AND step_name = $2 RETURNING *',
        [visitorId, stepName]
      );
  
      if (update.rowCount === 0) {
        return res.status(404).json({ error: 'Step not found for this visitor' });
      }
  
      // 2. Process uploaded files
      const songs = files && files['songs'] ? files['songs'].map(f => f.path) : [];
      const artwork = files && files['artwork'] ? files['artwork'][0].path : null;
  
      console.log("Uploaded Songs:", songs);
      console.log("Uploaded Artwork:", artwork);
  
      // 3. Mark songs and artwork as completed if they exist
      if (songs.length > 0) {
        await pool.query(
          'UPDATE agreement_steps SET completed = true WHERE visitor_id = $1 AND step_name = $2',
          [visitorId, 'songs_submitted']
        );
      }
  
      if (artwork) {
        await pool.query(
          'UPDATE agreement_steps SET completed = true WHERE visitor_id = $1 AND step_name = $2',
          [visitorId, 'artwork_submitted']
        );
      }
  
      // 4. Mark ID input as completed if an ID was provided
      if (id_number && id_number.trim() !== "") {
        await pool.query(
          'UPDATE agreement_steps SET completed = true WHERE visitor_id = $1 AND step_name = $2',
          [visitorId, 'id_input']
        );
      }
  
      // 5. Update visitor status
      await updateContractStatus(visitorId);
  
      // 6. Final response
      //res.status(200).json({ message: `Step "${stepName}" marked as completed.` });
      return res.redirect('http://localhost:5000/contracts-overview');
    } catch (err) {
      console.error('Error completing step:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  

  // contract_agreement.js
const getContractSteps = async (req, res) => {
    const { visitorId } = req.params;
  
    try {
      const result = await pool.query(
        'SELECT * FROM agreement_steps WHERE visitor_id = $1',
        [visitorId]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching steps:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const declineVisitor = async (req, res) => {
    const { visitorId } = req.params;
  
    try {
      await pool.query(
        'UPDATE visitors SET contract_status = $1 WHERE id = $2',
        ['declined', visitorId]
      );
  
      res.status(200).json({ message: 'Visitor contract declined.' });
    } catch (err) {
      console.error('Error declining visitor:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const markAsServed = async (req, res) => {
    const visitorId = parseInt(req.params.id, 10); // Ensure it's an integer

    if (isNaN(visitorId)) {
        return res.status(400).json({ error: 'Invalid visitor ID.' });
    }

    try {
        const checkResult = await pool.query('SELECT * FROM visitors WHERE id = $1', [visitorId]);

        if (checkResult.rowCount === 0) {
            return res.status(404).json({ error: 'Visitor not found.' });
        }

        if (checkResult.rows[0].served) {
            return res.status(400).json({ error: 'Visitor has already been marked as served.' });
        }

        const result = await pool.query(
            'UPDATE visitors SET served = TRUE WHERE id = $1 RETURNING *',
            [visitorId]
        );

        res.status(200).json({
            message: 'Visitor marked as served successfully!',
            visitor: result.rows[0],
        });
    } catch (error) {
        console.error('Error confirming visitor:', error);
        res.status(500).json({ error: 'Error confirming visitor.', details: error.message });
    }
};

const terminateContract = async (req, res) => {
    const visitorId = req.params.visitorId;
  try {
    await pool.query(`
      UPDATE visitors
      SET contract_status = 'pending', served = false
      WHERE id = $1
    `, [visitorId]);

    await pool.query(`
      DELETE FROM agreement_steps
      WHERE visitor_id = $1
    `, [visitorId]);

    res.status(200).send({ message: 'Contract terminated.' });
  } catch (err) {
    console.error('Error terminating contract:', err);
    res.status(500).send({ error: 'Failed to terminate contract.' });
  }
}

const deleteContract = async (req, res) => {
  const visitorId = req.params.visitorId;
  try {
    await pool.query(`
      DELETE FROM agreement_steps
      WHERE visitor_id = $1
    `, [visitorId]);

    await pool.query(`
      DELETE FROM visitors
      WHERE id = $1
    `, [visitorId]);

    res.status(200).send({ message: 'Contract and visitor deleted.' });
  } catch (err) {
    console.error('Error deleting contract:', err);
    res.status(500).send({ error: 'Failed to delete contract.' });
  }
}

  const getAllContractStatuses = async () => {
    try {
      const result = await pool.query(`
        SELECT 
          v.id AS visitor_id, 
          v.first_name || ' ' || v.last_name AS full_name, 
          v.email, 
          v.contract_status,
          v.served,
          a.step_name, 
          a.completed, 
          a.timestamp
        FROM visitors v
        JOIN agreement_steps a ON v.id = a.visitor_id
        ORDER BY v.id, a.timestamp
      `);
  
      console.log("Database result:", result.rows);
  
      if (!result.rows || result.rows.length === 0) {
        console.log('No contract statuses found');
        return [];
      }
  
      // Use reduce to group the steps by visitor_id
      const contracts = result.rows.reduce((acc, row) => {
        const visitorId = row.visitor_id;
  
        if (!acc[visitorId]) {
          acc[visitorId] = {
            visitor_id: visitorId,
            id: visitorId,
            full_name: row.full_name,
            email: row.email,
            contract_status: row.contract_status,
            served: row.served,
            steps: []
          };
        }
  
        // Create the step object separately
        const step = {
          step_name: row.step_name,
          completed: row.completed,
          timestamp: row.timestamp
        };
  
        acc[visitorId].steps.push(step);
  
        return acc;
      }, {});
  
      console.log("Transformed contracts:", Object.values(contracts));
  
      return Object.values(contracts);
    } catch (err) {
      console.error('Error fetching contract statuses:', err);
      throw err;
    }
  };
  

  const getAllContractStatusesRaw = async () => {
    const result = await pool.query(`
      SELECT 
        v.id AS visitor_id, 
        v.first_name || ' ' || v.last_name AS full_name,  
        v.email, 
        v.contract_status,
        a.step_name, 
        a.completed, 
        a.timestamp
      FROM visitors v
      JOIN agreement_steps a ON v.id = a.visitor_id
      ORDER BY v.id, a.timestamp
    `);
    console.log(result); 
  
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.visitor_id]) {
        grouped[row.visitor_id] = {
          visitor_id: row.visitor_id,
          full_name: row.full_name,
          email: row.email,
          contract_status: row.contract_status,
          steps: []
        };
      }
      grouped[row.visitor_id].steps.push({
        step_name: row.step_name,
        completed: row.completed,
        timestamp: row.timestamp
      });
    });
  
    return Object.values(grouped);
  };

  const contractsOverview = async (req, res) => {
    try {
      const result = await getAllContractStatuses();
    
      if (!result || result.length === 0) {
       return res.status(404).send("No contract statuses available");
      }
      console.log("Fetched Contract Statuses:", result);
      res.send(renderContractsOverviewHTML(result));
     } catch (error) {
      console.error("Failed to load contracts overview:", error);
      res.status(500).send('Internal Server Error');
     }
  }

  const contractStatus = async (req, res) => {
    try {
      const query = `
        SELECT 
          v.id AS visitor_id, 
          v.first_name || ' ' || v.last_name AS full_name, 
          v.email, 
          v.contract_status, 
          a.step_name, 
          a.completed, 
          a.timestamp
        FROM visitors v
        JOIN agreement_steps a ON v.id = a.visitor_id
        ORDER BY v.id, a.timestamp;
      `;
  
      const { rows } = await pool.query(query);
  
      // Group by visitor_id
      const contracts = {};
      rows.forEach(row => {
        if (!contracts[row.visitor_id]) {
          contracts[row.visitor_id] = {
            visitor_id: row.visitor_id,
            full_name: row.full_name,
            email: row.email,
            contract_status: row.contract_status,
            steps: []
          };
        }
        contracts[row.visitor_id].steps.push({
          step_name: row.step_name,
          completed: row.completed,
          timestamp: row.timestamp
        });
      });
  
      res.json(Object.values(contracts));
    } catch (err) {
      console.error('Error fetching contract statuses:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  

  module.exports = {
    completeAgreementStep,
    declineVisitor,
    getContractSteps,
    getAllContractStatuses,
    getAllContractStatusesRaw,
    startContract,
    contractsOverview,
    contractStatus,
    markAsServed,
    terminateContract,
    deleteContract 
  };
  
  