// stepController.js
const pool = require('../config/db');

exports.completeStep = async (req, res) => {
  const { id } = req.params;
  const { step_name } = req.body;

  // Add data validation here (e.g., using a library like Joi)

  try {
    // Check if the step is already completed
    const checkResult = await pool.query(
      'SELECT completed FROM agreement_steps WHERE visitor_id = $1 AND step_name = \$2',
      [id, step_name]
    );

    if (checkResult.rows.length > 0 && checkResult.rows[0].completed) {
      return res.status(200).json({ message: `Step '${step_name}' already completed.`, step: { visitor_id: id, step_name: step_name, completed: true } }); // Or 208 Already Reported
    }

    const result = await pool.query(
      'UPDATE agreement_steps SET completed = TRUE WHERE visitor_id = $1 AND step_name = $2 AND completed = FALSE RETURNING *',
      [id, step_name]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Step not found or already completed.' });
    }

    res.status(200).json({
      message: `Step '${step_name}' marked as completed.`,
      step: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSteps = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT step_name, completed FROM agreement_steps WHERE visitor_id = $1 ORDER BY id ASC',
      [id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching steps:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


