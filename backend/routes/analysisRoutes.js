const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const analysisController = require('../controllers/analysisController');

// Analysis routes
router.post('/clean/:fileId', protect, analysisController.cleanData);
router.post('/eda/:fileId', protect, analysisController.performEDA);
router.post('/chart/:fileId', protect, analysisController.generateChart);
router.get('/charts/:fileId', protect, analysisController.getCharts);
router.post('/export/:fileId', protect, analysisController.exportChart);

module.exports = router;