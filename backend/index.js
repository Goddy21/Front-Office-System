const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(cors());

const visitorRoutes = require('./routes/visitors');
const stepRoutes = require('./routes/steps');


app.use('/api/visitors', visitorRoutes);
app.use('/api/steps', stepRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
