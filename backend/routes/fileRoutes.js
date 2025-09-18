const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const fileController = require('../controllers/fileController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only excel and csv files
  const allowedTypes = /xlsx|xls|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Routes
router.post('/upload', protect, upload.single('file'), fileController.uploadFile);
router.get('/history', protect, fileController.getUploadHistory);
router.get('/:id', protect, fileController.getFileById);
router.delete('/:id', protect, fileController.deleteFile);

module.exports = router;