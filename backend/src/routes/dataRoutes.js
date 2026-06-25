const express = require('express');
const router = express.Router();
const { uploadCSV } = require('../controllers/dataController');
const upload = require('../middleware/upload');

// POST /api/data/upload – upload CSV file
router.post('/upload', upload.single('file'), uploadCSV);

module.exports = router;