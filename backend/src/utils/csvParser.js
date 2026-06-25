const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Parses a CSV buffer into an array of objects.
 * @param {Buffer} buffer - CSV file buffer
 * @returns {Promise<Array>} Array of parsed rows
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

module.exports = parseCSV;