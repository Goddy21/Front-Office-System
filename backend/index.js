const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getAllContractStatuses } = require('./contract-agreement/contract_agreement');
const renderContractsOverviewHTML = require('./views/renderContractsOverviewHTML');
const {
  completeAgreementStep,
  declineVisitor,
  getContractSteps
} = require('./contract-agreement/contract_agreement');
const agreementRoutes = require('./routes/agreement');



const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(cors());

const visitorRoutes = require('./routes/visitors');
const stepRoutes = require('./routes/steps');

app.use('/api/visitors', visitorRoutes);

app.use('/api/steps', stepRoutes);

app.use('/api/visitors/agreement', agreementRoutes);

// Routes for contracts overview
app.get('/contracts-overview', async (req, res) => {
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
 });
 



// Example of another route to fetch contract statuses as JSON (API route)
app.get('/api/contracts/status', async (req, res) => {
  try {
    const query = `
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
});

// Other routes for handling agreement steps and updates (as previously defined)
app.post('/complete-agreement-step', completeAgreementStep);
app.post('/decline-visitor/:visitorId', declineVisitor);
app.get('/contract-steps/:visitorId', getContractSteps);



app.get('/', (req, res) => {
  res.send('API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
