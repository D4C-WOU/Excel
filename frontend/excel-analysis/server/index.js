const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// In-memory storage for demo (replace with MongoDB in production)
let uploadHistory = [];
let analysisResults = [];

// Routes
app.post('/api/upload', upload.single('excelFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Store upload history
    const uploadRecord = {
      id: Date.now(),
      filename: req.file.originalname,
      uploadDate: new Date(),
      rowCount: data.length,
      columns: Object.keys(data[0] || {}),
      filePath: req.file.path
    };

    uploadHistory.push(uploadRecord);

    res.json({
      success: true,
      data: data,
      uploadInfo: uploadRecord
    });

  } catch (error) {
    res.status(500).json({ error: 'Error processing Excel file: ' + error.message });
  }
});

app.get('/api/upload-history', (req, res) => {
  res.json(uploadHistory);
});

app.post('/api/analyze', (req, res) => {
  try {
    const { data, xAxis, yAxis, chartType } = req.body;

    if (!data || !xAxis || !yAxis) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Perform basic analysis
    const analysis = {
      id: Date.now(),
      timestamp: new Date(),
      xAxis,
      yAxis,
      chartType,
      summary: {
        totalRecords: data.length,
        xAxisValues: [...new Set(data.map(row => row[xAxis]))].length,
        yAxisStats: calculateStats(data, yAxis)
      },
      chartData: prepareChartData(data, xAxis, yAxis, chartType)
    };

    analysisResults.push(analysis);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    res.status(500).json({ error: 'Error analyzing data: ' + error.message });
  }
});

app.get('/api/analysis-history', (req, res) => {
  res.json(analysisResults);
});

// Helper functions
function calculateStats(data, column) {
  const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val));
  
  if (values.length === 0) return { error: 'No numeric values found' };

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { sum, avg: avg.toFixed(2), min, max, count: values.length };
}

function prepareChartData(data, xAxis, yAxis, chartType) {
  const groupedData = {};
  
  data.forEach(row => {
    const xValue = row[xAxis];
    const yValue = parseFloat(row[yAxis]);
    
    if (!isNaN(yValue)) {
      if (!groupedData[xValue]) {
        groupedData[xValue] = [];
      }
      groupedData[xValue].push(yValue);
    }
  });

  const labels = Object.keys(groupedData);
  const values = labels.map(label => {
    const vals = groupedData[label];
    return vals.reduce((a, b) => a + b, 0) / vals.length; // Average
  });

  return {
    labels,
    datasets: [{
      label: yAxis,
      data: values,
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }]
  };
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});