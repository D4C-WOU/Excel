import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const FileUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadStatus('Please upload only Excel files (.xlsx or .xls)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadStatus('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadStatus('Processing file...');
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('The Excel file appears to be empty or has no valid data');
      }

      const fileData = {
        name: file.name,
        size: file.size,
        data: jsonData,
        headers: Object.keys(jsonData[0] || {})
      };

      setUploadProgress(100);
      onFileUpload(fileData);
      setUploadStatus(`✅ File uploaded successfully! Found ${jsonData.length} rows of data.`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus('');
        setUploadProgress(0);
      }, 3000);
    } catch (error) {
      setUploadStatus(`❌ Error processing file: ${error.message}`);
      console.error('File processing error:', error);
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <div className="upload-header">
        <h2>📁 Upload Excel File</h2>
        <p>Upload your Excel files (.xlsx or .xls) for analysis</p>
      </div>

      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept=".xlsx,.xls"
          onChange={handleChange}
        />
        
        <div className="upload-content">
          {uploading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <p>Processing file... {uploadProgress}%</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <h3>📤 Drop your Excel file here</h3>
              <p>or click to browse files</p>
              <div className="file-types">
                <span>.xlsx</span>
                <span>.xls</span>
              </div>
              <div className="upload-limits">
                <small>Maximum file size: 10MB</small>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.includes('❌') ? 'error' : 'success'}`}>
          {uploadStatus}
        </div>
      )}

      <div className="upload-info">
        <h3>✨ Supported Features:</h3>
        <ul>
          <li>✅ Excel file parsing (.xlsx, .xls)</li>
          <li>✅ Automatic data extraction</li>
          <li>✅ Column header detection</li>
          <li>✅ Data validation</li>
          <li>✅ Chart generation ready</li>
          <li>✅ Statistical analysis</li>
          <li>✅ Report generation</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;