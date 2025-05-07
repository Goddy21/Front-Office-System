const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {
  completeAgreementStep,
  declineVisitor,
  getContractSteps,
  contractsOverview,
  contractStatus
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

app.get('/contracts-overview', contractsOverview);
app.get('/api/contract/status', contractStatus);

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
