const express = require('express');
const cors = require('cors');
require('dotenv').config();

const dataRoutes = require('./routes/dataRoutes');

const app = express();

// Restrict CORS to only your frontend domains
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'https://telecom-dashboard-25883.web.app',  // Firebase Hosting
  'https://telecom-dashboard-25883.firebaseapp.com' // Alternative Firebase domain
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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