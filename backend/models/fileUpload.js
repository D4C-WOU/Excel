const mongoose = require('mongoose');

const fileUploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  processedData: {
    headers: [String],
    rowCount: Number,
    columnCount: Number,
    data: mongoose.Schema.Types.Mixed,
    summary: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  analysisResults: {
    cleanedData: mongoose.Schema.Types.Mixed,
    statistics: mongoose.Schema.Types.Mixed,
    charts: [
      {
        type: String,
        title: String,
        config: mongoose.Schema.Types.Mixed,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'error'],
    default: 'uploaded'
  },
  errorMessage: String
});

// Index for faster queries
fileUploadSchema.index({ userId: 1, uploadDate: -1 });

module.exports = mongoose.model('FileUpload', fileUploadSchema);