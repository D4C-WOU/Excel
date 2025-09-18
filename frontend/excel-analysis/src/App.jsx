import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import DataAnalysis from './components/DataAnalysis';
import UploadHistory from './components/UploadHistory';
import './App.css';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const handleFileUpload = (fileData) => {
    const newFile = {
      id: Date.now(),
      name: fileData.name,
      data: fileData.data,
      uploadDate: new Date().toISOString(),
      size: fileData.size
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
      data: analysis.data
    };
    setAnalysisHistory(prev => [newAnalysis, ...prev]);
  };

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  uploadedFiles={uploadedFiles}
                  analysisHistory={analysisHistory}
                />
              } 
            />
            <Route 
              path="/upload" 
              element={
                <FileUpload 
                  onFileUpload={handleFileUpload}
                />
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <DataAnalysis 
                  uploadedFiles={uploadedFiles}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              } 
            />
            <Route 
              path="/history" 
              element={
                <UploadHistory 
                  uploadedFiles={uploadedFiles}
                  analysisHistory={analysisHistory}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;