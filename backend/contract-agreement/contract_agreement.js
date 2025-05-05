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
  
    try {
      const update = await pool.query(
        'UPDATE agreement_steps SET completed = true WHERE visitor_id = $1 AND step_name = $2 RETURNING *',
        [visitorId, stepName]
      );
  
      if (update.rowCount === 0) {
        return res.status(404).json({ error: 'Step not found for this visitor' });
      }
  
      await updateContractStatus(visitorId);
  
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

  module.exports = {
    completeAgreementStep,
    declineVisitor,
    getContractSteps
  };
  
  