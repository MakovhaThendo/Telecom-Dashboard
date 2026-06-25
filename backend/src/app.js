const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dataRoutes = require('./routes/dataRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Telecom API is running' });
});

// Data routes
app.use('/api/data', dataRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;