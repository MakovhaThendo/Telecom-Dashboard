const express = require('express');
const router = express.Router();
const { uploadCSV, getData, getSummary } = require('../controllers/dataController');
const upload = require('../middleware/upload');

// POST /api/data/upload – upload CSV file
router.post('/upload', upload.single('file'), uploadCSV);

// GET /api/data – fetch all data (with optional filters)
router.get('/', getData);

// GET /api/data/summary – get KPI summary
router.get('/summary', getSummary);

module.exports = router;