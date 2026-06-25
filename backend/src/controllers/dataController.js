const NetworkData = require('../models/NetworkData');
const parseCSV = require('../utils/csvParser');

// Upload and store CSV data
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 File received:', req.file.originalname);
    console.log('📊 File size:', req.file.size);

    // Parse the CSV buffer
    const rows = await parseCSV(req.file.buffer);
    console.log('📋 Parsed rows:', rows.length);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    // Map CSV columns to schema fields
    const mappedData = rows.map(row => ({
      region: row.region || row.Region,
      baseStationId: row.baseStationId || row.base_station_id || row.BaseStationId,
      timestamp: new Date(row.timestamp || row.Timestamp),
      latencyMs: parseFloat(row.latencyMs || row.latency_ms || row.Latency),
      throughputMbps: parseFloat(row.throughputMbps || row.throughput_mbps || row.Throughput),
      signalStrengthDbm: parseFloat(row.signalStrengthDbm || row.signal_strength_dbm || row.SignalStrength)
    }));

    // ✅ NEW: Filter out rows with missing required fields
    const validData = mappedData.filter(item => 
      item.region && 
      item.baseStationId && 
      item.timestamp && 
      !isNaN(item.latencyMs) && 
      !isNaN(item.throughputMbps) && 
      !isNaN(item.signalStrengthDbm)
    );

    console.log(`✅ Valid rows to insert: ${validData.length} of ${mappedData.length}`);

    if (validData.length === 0) {
      return res.status(400).json({ 
        error: 'No valid rows. Check column names: region, baseStationId, timestamp, latencyMs, throughputMbps, signalStrengthDbm' 
      });
    }

    // Insert into MongoDB
    const inserted = await NetworkData.insertMany(validData);
    console.log(`✅ Inserted ${inserted.length} records`);

    res.status(201).json({
      message: `Successfully uploaded ${inserted.length} records`,
      count: inserted.length
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process CSV file',
      details: error.message 
    });
  }
};