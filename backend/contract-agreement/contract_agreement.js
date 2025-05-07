const pool = require('../config/db');

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
    const { visitorId, stepName } = req.body;
    const files = req.files;
    console.log("Received form data:", req.body);
    console.log("Step Name Received:", stepName);


  
    try {
      // 1. Update agreement steps
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
  
      // Log file details for debugging
      console.log("Uploaded Songs:", songs);
      console.log("Uploaded Artwork:", artwork);
  
      // 3. Update visitor status
      await updateContractStatus(visitorId);
  
      // 4. Respond with success message
      res.status(200).json({ message: `Step "${stepName}" marked as completed.` });
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

  const getAllContractStatuses = async () => {
    try {
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
  
      console.log("Database result:", result.rows);
  
      if (!result.rows || result.rows.length === 0) {
        throw new Error('No contract statuses found');
      }
  
      // Use reduce to group the steps by visitor_id
      const contracts = result.rows.reduce((acc, row) => {
        const visitorId = row.visitor_id;
  
        if (!acc[visitorId]) {
          acc[visitorId] = {
            visitor_id: visitorId,
            full_name: row.full_name,
            email: row.email,
            contract_status: row.contract_status,
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
        v.first_name || ' ' || v.last_name AS full_name,  -- Concatenate first_name and last_name
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
  
  

  module.exports = {
    completeAgreementStep,
    declineVisitor,
    getContractSteps,
    getAllContractStatuses,
    getAllContractStatusesRaw 
  };
  
  