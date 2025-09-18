import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get user data
    const userData = authService.getUser();
    setUser(userData);
    
    // Fetch upload history
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    try {
      const data = await authService.authRequest('/files/history');
      setUploadHistory(data.files || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setMessage('');
      } else {
        setMessage('Please select a valid Excel or CSV file');
        setFile(null);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('File uploaded successfully!');
        setFile(null);
        fetchUploadHistory();
        // Redirect to analysis page
        setTimeout(() => {
          window.location.href = `/analysis/${data.fileId}`;
        }, 1500);
      } else {
        setMessage(data.message || 'Upload failed');
      }
    } catch (error) {
      setMessage('Error uploading file');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Excel Analytics Platform</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="upload-section">
          <h2>Upload Excel/CSV File</h2>
          <div className="upload-box">
            <input
              type="file"
              id="file-input"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="file-label">
              {file ? file.name : 'Choose File'}
            </label>
            <button
              onClick={handleFileUpload}
              disabled={!file || loading}
              className="upload-btn"
            >
              {loading ? 'Uploading...' : 'Upload & Analyze'}
            </button>
          </div>
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="history-section">
          <h2>Upload History</h2>
          {uploadHistory.length === 0 ? (
            <p>No files uploaded yet</p>
          ) : (
            <div className="history-grid">
              {uploadHistory.map((item) => (
                <div key={item._id} className="history-item">
                  <h3>{item.filename}</h3>
                  <p>Uploaded: {new Date(item.uploadDate).toLocaleDateString()}</p>
                  <p>Size: {(item.size / 1024).toFixed(2)} KB</p>
                  <button
                    onClick={() => window.location.href = `/analysis/${item._id}`}
                    className="view-btn"
                  >
                    View Analysis
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;