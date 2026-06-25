const NetworkData = require('../models/NetworkData');
const parseCSV = require('../utils/csvParser');

// Upload and store CSV data
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname);
    console.log('File size:', req.file.size);

    // Parse the CSV buffer
    const rows = await parseCSV(req.file.buffer);
    console.log('Parsed rows:', rows.length);

    // Map CSV columns to schema fields
    const mappedData = rows.map(row => ({
      region: row.region || row.Region,
      baseStationId: row.baseStationId || row.base_station_id || row.BaseStationId,
      timestamp: new Date(row.timestamp || row.Timestamp),
      latencyMs: parseFloat(row.latencyMs || row.latency_ms || row.Latency),
      throughputMbps: parseFloat(row.throughputMbps || row.throughput_mbps || row.Throughput),
      signalStrengthDbm: parseFloat(row.signalStrengthDbm || row.signal_strength_dbm || row.SignalStrength)
    }));

    // Validate and insert into MongoDB
    const inserted = await NetworkData.insertMany(mappedData);

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