import React, { useState } from 'react';

const UploadHistory = ({ uploadedFiles, analysisHistory }) => {
  const [activeTab, setActiveTab] = useState('files');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

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

  const filteredFiles = uploadedFiles
    .filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.uploadDate) - new Date(a.uploadDate);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return b.size - a.size;
      return 0;
    });

  const filteredAnalyses = analysisHistory
    .filter(analysis => analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'name') return a.fileName.localeCompare(b.fileName);
      return 0;
    });

  const exportHistory = () => {
    const historyData = {
      exportDate: new Date().toISOString(),
      files: uploadedFiles,
      analyses: analysisHistory,
      summary: {
        totalFiles: uploadedFiles.length,
        totalAnalyses: analysisHistory.length,
        totalDataRows: uploadedFiles.reduce((total, file) => total + file.data.length, 0)
      }
    };

    const dataStr = JSON.stringify(historyData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `history-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  return (
    <div className="upload-history">
      <div className="history-header">
        <h2>📋 History</h2>
        <p>View your uploaded files and analysis history</p>
      </div>

      <div className="history-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search files and analyses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-section">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
          <button onClick={exportHistory} className="export-btn">
            📤 Export History
          </button>
        </div>
      </div>

      <div className="history-tabs">
        <button 
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          📁 Uploaded Files ({filteredFiles.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analyses' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyses')}
        >
          📊 Analyses ({filteredAnalyses.length})
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'files' && (
          <div className="files-history">
            {filteredFiles.length > 0 ? (
              <div className="history-list">
                {filteredFiles.map((file) => (
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
                      <button className="action-btn small">👀 View Data</button>
                      <button className="action-btn small secondary">📊 Analyze</button>
                      <button className="action-btn small secondary">📤 Export</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>{searchTerm ? 'No files match your search' : 'No files uploaded yet'}</h3>
                <p>{searchTerm ? 'Try adjusting your search terms' : 'Upload your first Excel file to get started'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analyses' && (
          <div className="analyses-history">
            {filteredAnalyses.length > 0 ? (
              <div className="history-list">
                {filteredAnalyses.map((analysis) => (
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
                      <button className="action-btn small">📊 View Chart</button>
                      <button className="action-btn small secondary">📄 Export Report</button>
                      <button className="action-btn small secondary">📷 Save Image</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>{searchTerm ? 'No analyses match your search' : 'No analyses created yet'}</h3>
                <p>{searchTerm ? 'Try adjusting your search terms' : 'Create your first chart analysis to see it here'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="history-summary">
        <h3>📈 Summary Statistics</h3>
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
          <div className="summary-item">
            <h4>Average File Size</h4>
            <span>
              {uploadedFiles.length > 0 
                ? formatFileSize(uploadedFiles.reduce((total, file) => total + file.size, 0) / uploadedFiles.length)
                : '0 Bytes'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadHistory;