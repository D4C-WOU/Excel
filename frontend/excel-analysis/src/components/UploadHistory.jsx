import React, { useState } from 'react';

const UploadHistory = ({ uploadedFiles, analysisHistory }) => {
  const [activeTab, setActiveTab] = useState('files');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="upload-history">
      <div className="history-header">
        <h2>History</h2>
        <p>View your uploaded files and analysis history</p>
      </div>

      <div className="history-tabs">
        <button 
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          📁 Uploaded Files ({uploadedFiles.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analyses' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyses')}
        >
          📊 Analyses ({analysisHistory.length})
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'files' && (
          <div className="files-history">
            {uploadedFiles.length > 0 ? (
              <div className="history-list">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="history-item">
                    <div className="item-icon">📄</div>
                    <div className="item-details">
                      <h3>{file.name}</h3>
                      <div className="item-meta">
                        <span>Size: {formatFileSize(file.size)}</span>
                        <span>Rows: {file.data.length}</span>
                        <span>Columns: {file.headers.length}</span>
                      </div>
                      <div className="item-date">
                        Uploaded: {formatDate(file.uploadDate)}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="action-btn small">View Data</button>
                      <button className="action-btn small secondary">Analyze</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No files uploaded yet</h3>
                <p>Upload your first Excel file to get started</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analyses' && (
          <div className="analyses-history">
            {analysisHistory.length > 0 ? (
              <div className="history-list">
                {analysisHistory.map((analysis) => (
                  <div key={analysis.id} className="history-item">
                    <div className="item-icon">📊</div>
                    <div className="item-details">
                      <h3>{analysis.fileName}</h3>
                      <div className="item-meta">
                        <span>Chart: {analysis.chartType}</span>
                        <span>X-Axis: {analysis.xAxis}</span>
                        <span>Y-Axis: {analysis.yAxis}</span>
                      </div>
                      <div className="item-date">
                        Created: {formatDate(analysis.date)}
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="action-btn small">View Chart</button>
                      <button className="action-btn small secondary">Export</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No analyses created yet</h3>
                <p>Create your first chart analysis to see it here</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="history-summary">
        <div className="summary-stats">
          <div className="summary-item">
            <h4>Total Files</h4>
            <span>{uploadedFiles.length}</span>
          </div>
          <div className="summary-item">
            <h4>Total Analyses</h4>
            <span>{analysisHistory.length}</span>
          </div>
          <div className="summary-item">
            <h4>Total Data Rows</h4>
            <span>
              {uploadedFiles.reduce((total, file) => total + file.data.length, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadHistory;