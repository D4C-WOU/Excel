import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ uploadedFiles, analysisHistory }) => {
  const totalDataRows = uploadedFiles.reduce((total, file) => total + (file.data?.length || 0), 0);
  const recentFiles = uploadedFiles.slice(0, 3);
  const recentAnalyses = analysisHistory.slice(0, 3);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <p>Welcome to your Excel Analytics Platform</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>{uploadedFiles.length}</h3>
            <p>Files Uploaded</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{analysisHistory.length}</h3>
            <p>Analyses Created</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{totalDataRows.toLocaleString()}</h3>
            <p>Data Rows Processed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>Active</h3>
            <p>System Status</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-section">
          <h3>📁 Recent Files</h3>
          <div className="recent-list">
            {recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <div key={file.id} className="recent-item">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <h4>{file.name}</h4>
                    <p>{file.data?.length || 0} rows • {new Date(file.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No files uploaded yet</div>
            )}
          </div>
        </div>

        <div className="recent-section">
          <h3>📊 Recent Analyses</h3>
          <div className="recent-list">
            {recentAnalyses.length > 0 ? (
              recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="recent-item">
                  <div className="analysis-icon">📈</div>
                  <div className="analysis-info">
                    <h4>{analysis.fileName}</h4>
                    <p>{analysis.chartType} chart • {analysis.xAxis} vs {analysis.yAxis}</p>
                    <div className="analysis-date">{new Date(analysis.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No analyses created yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>🚀 Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/upload" className="action-btn primary">
            📁 Upload File
          </Link>
          <Link to="/analysis" className="action-btn secondary">
            📊 Create Analysis
          </Link>
          <Link to="/history" className="action-btn secondary">
            📋 View History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;