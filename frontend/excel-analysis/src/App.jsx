import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import DataAnalysis from './components/DataAnalysis';
import UploadHistory from './components/UploadHistory';
import authService from './services/authService';
import './App.css';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const handleFileUpload = (fileData) => {
    const newFile = {
      id: Date.now(),
      name: fileData.name,
      data: fileData.data,
      uploadDate: new Date().toISOString(),
      size: fileData.size,
      headers: fileData.headers
    };
    setUploadedFiles(prev => [newFile, ...prev]);
  };

  const handleAnalysisComplete = (analysis) => {
    const newAnalysis = {
      id: Date.now(),
      fileName: analysis.fileName,
      chartType: analysis.chartType,
      xAxis: analysis.xAxis,
      yAxis: analysis.yAxis,
      date: new Date().toISOString(),
      data: analysis.data,
      stats: analysis.stats
    };
    setAnalysisHistory(prev => [newAnalysis, ...prev]);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUploadedFiles([]);
    setAnalysisHistory([]);
  };

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Header onLogout={handleLogout} />}
        <main className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Dashboard 
                  uploadedFiles={uploadedFiles}
                  analysisHistory={analysisHistory}
                /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard 
                    uploadedFiles={uploadedFiles}
                    analysisHistory={analysisHistory}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <FileUpload 
                    onFileUpload={handleFileUpload}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <ProtectedRoute>
                  <DataAnalysis 
                    uploadedFiles={uploadedFiles}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <UploadHistory 
                    uploadedFiles={uploadedFiles}
                    analysisHistory={analysisHistory}
                  />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;