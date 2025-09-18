const FileUpload = require('../models/FileUpload');
const User = require('../models/User');
const xlsx = require('xlsx');
const fs = require('fs').promises;
const path = require('path');

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create file record
    const fileUpload = new FileUpload({
      userId: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filepath: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      status: 'processing'
    });

    await fileUpload.save();

    // Process the file
    try {
      const processedData = await processExcelFile(req.file.path, req.file.mimetype);
      
      fileUpload.processedData = processedData;
      fileUpload.status = 'processed';
      await fileUpload.save();

      // Add to user's upload history
      await User.findByIdAndUpdate(req.user._id, {
        $push: { uploadHistory: fileUpload._id }
      });

      res.status(200).json({
        success: true,
        message: 'File uploaded and processed successfully',
        fileId: fileUpload._id,
        data: {
          headers: processedData.headers,
          rowCount: processedData.rowCount,
          columnCount: processedData.columnCount
        }
      });
    } catch (processError) {
      fileUpload.status = 'error';
      fileUpload.errorMessage = processError.message;
      await fileUpload.save();
      
      throw processError;
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file'
    });
  }
};

// Get upload history
exports.getUploadHistory = async (req, res) => {
  try {
    const files = await FileUpload.find({ userId: req.user._id })
      .select('filename originalName size uploadDate status')
      .sort({ uploadDate: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      files
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upload history'
    });
  }
};

// Get file by ID
exports.getFileById = async (req, res) => {
  try {
    const file = await FileUpload.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.status(200).json({
      success: true,
      file
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file'
    });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const file = await FileUpload.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete physical file
    try {
      await fs.unlink(file.filepath);
    } catch (err) {
      console.log('Physical file already deleted or not found');
    }

    // Remove from user's history
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { uploadHistory: file._id }
    });

    // Delete database record
    await file.deleteOne();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
};

// Helper function to process Excel/CSV files
async function processExcelFile(filepath, mimetype) {
  try {
    // Read the file
    const workbook = xlsx.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (!data || data.length === 0) {
      throw new Error('File is empty or could not be read');
    }
    
    // Extract headers (first row)
    const headers = data[0].map(h => String(h || '').trim()).filter(h => h);
    
    // Extract data rows
    const rows = data.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
    
    // Basic statistics
    const columnStats = {};
    headers.forEach((header, index) => {
      const columnData = rows.map(row => row[index]).filter(val => val !== null && val !== undefined);
      
      // Check if numeric
      const numericData = columnData.filter(val => !isNaN(val) && val !== '');
      
      if (numericData.length > 0) {
        const numbers = numericData.map(Number);
        columnStats[header] = {
          type: 'numeric',
          count: numbers.length,
          min: Math.min(...numbers),
          max: Math.max(...numbers),
          mean: numbers.reduce((a, b) => a + b, 0) / numbers.length,
          nullCount: columnData.length - numericData.length
        };
      } else {
        // Categorical data
        const uniqueValues = [...new Set(columnData)];
        columnStats[header] = {
          type: 'categorical',
          count: columnData.length,
          unique: uniqueValues.length,
          nullCount: rows.length - columnData.length,
          topValues: uniqueValues.slice(0, 5)
        };
      }
    });
    
    return {
      headers,
      rowCount: rows.length,
      columnCount: headers.length,
      data: rows.slice(0, 100), // Store first 100 rows for preview
      summary: columnStats
    };
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to process file: ' + error.message);
  }
}