const NetworkData = require('../models/NetworkData');
const parseCSV = require('../utils/csvParser');

// Track recent uploads to prevent duplicates
const uploadHistory = new Map();

// Upload and store CSV data
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileKey = `${req.file.originalname}-${req.file.size}`;
    const lastUpload = uploadHistory.get(fileKey);
    const now = Date.now();
    
    if (lastUpload && (now - lastUpload < 5000)) {
      console.log('Duplicate upload detected, skipping...');
      return res.status(200).json({ 
        message: 'Duplicate upload skipped', 
        count: 0 
      });
    }
    uploadHistory.set(fileKey, now);

    console.log('File received:', req.file.originalname);
    console.log('File size:', req.file.size);

    const rows = await parseCSV(req.file.buffer);
    console.log('Parsed rows:', rows.length);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    const mappedData = rows.map(row => ({
      region: row.region || row.Region,
      baseStationId: row.baseStationId || row.base_station_id || row.BaseStationId,
      timestamp: new Date(row.timestamp || row.Timestamp),
      latencyMs: parseFloat(row.latencyMs || row.latency_ms || row.Latency),
      throughputMbps: parseFloat(row.throughputMbps || row.throughput_mbps || row.Throughput),
      signalStrengthDbm: parseFloat(row.signalStrengthDbm || row.signal_strength_dbm || row.SignalStrength)
    }));

    const validData = mappedData.filter(item => 
      item.region && 
      item.baseStationId && 
      item.timestamp && 
      !isNaN(item.latencyMs) && 
      !isNaN(item.throughputMbps) && 
      !isNaN(item.signalStrengthDbm)
    );

    console.log(`Valid rows to insert: ${validData.length} of ${mappedData.length}`);

    if (validData.length === 0) {
      return res.status(400).json({ 
        error: 'No valid rows. Check column names: region, baseStationId, timestamp, latencyMs, throughputMbps, signalStrengthDbm' 
      });
    }

    const inserted = await NetworkData.insertMany(validData);
    console.log(`Inserted ${inserted.length} records`);

    res.status(201).json({
      message: `Successfully uploaded ${inserted.length} records`,
      count: inserted.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process CSV file',
      details: error.message 
    });
  }
};

// ============================================
// ADD THESE FUNCTIONS - MAKE SURE THEY ARE HERE
// ============================================

// Fetch all data with filters
exports.getData = async (req, res) => {
  try {
    console.log('GET /api/data called');
    const { region, startDate, endDate } = req.query;
    const filter = {};

    if (region) filter.region = region;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const data = await NetworkData.find(filter).sort({ timestamp: -1 });
    console.log(`Found ${data.length} records`);
    res.json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get summary statistics
exports.getSummary = async (req, res) => {
  try {
    console.log('GET /api/data/summary called');
    
    const stats = await NetworkData.aggregate([
      {
        $group: {
          _id: null,
          avgLatency: { $avg: '$latencyMs' },
          avgThroughput: { $avg: '$throughputMbps' },
          avgSignal: { $avg: '$signalStrengthDbm' },
          count: { $sum: 1 }
        }
      }
    ]);

    const regionStats = await NetworkData.aggregate([
      {
        $group: {
          _id: '$region',
          avgLatency: { $avg: '$latencyMs' },
          avgThroughput: { $avg: '$throughputMbps' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      global: stats[0] || { avgLatency: 0, avgThroughput: 0, avgSignal: 0, count: 0 },
      regions: regionStats
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: error.message });
  }
};