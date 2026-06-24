const mongoose = require('mongoose');

const networkDataSchema = new mongoose.Schema({
  region: { type: String, required: true },
  baseStationId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  latencyMs: { type: Number, required: true },
  throughputMbps: { type: Number, required: true },
  signalStrengthDbm: { type: Number, required: true },
  // Optional: packetLoss, jitter, etc.
}, { timestamps: true });

module.exports = mongoose.model('NetworkData', networkDataSchema);