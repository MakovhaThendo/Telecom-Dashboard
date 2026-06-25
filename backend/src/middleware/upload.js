const multer = require('multer');
const path = require('path');

// Configure storage (in memory)
const storage = multer.memoryStorage();

// File filter to accept only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

module.exports = upload;