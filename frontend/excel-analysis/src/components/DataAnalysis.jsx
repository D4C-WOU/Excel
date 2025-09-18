import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { generatePDFReport, downloadCSVReport, generateAnalysisReport } from '../utils/reportGenerator';

const DataAnalysis = ({ uploadedFiles, onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedData, setSelectedData] = useState(null);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [chart, setChart] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [chart]);

  const handleFileSelect = (fileId) => {
    const file = uploadedFiles.find(f => f.id.toString() === fileId);
    if (file) {
      setSelectedFile(fileId);
      setSelectedData(file);
      setXAxis('');
      setYAxis('');
      setCurrentAnalysis(null);
      
      // Destroy existing chart
      if (chart) {
        chart.destroy();
        setChart(null);
      }
    }
  };

  const generateChart = () => {
    if (!selectedData || !xAxis || !yAxis) return;

    setIsGenerating(true);

    // Destroy existing chart
    if (chart) {
      chart.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const data = selectedData.data;

    // Prepare chart data
    const processedData = {};
    
    data.forEach(row => {
      const xValue = row[xAxis];
      const yValue = parseFloat(row[yAxis]) || 0;
      
      if (processedData[xValue]) {
        processedData[xValue].push(yValue);
      } else {
        processedData[xValue] = [yValue];
      }
    });
    
    const labels = Object.keys(processedData);
    const values = labels.map(label => {
      const vals = processedData[label];
      return vals.reduce((a, b) => a + b, 0) / vals.length; // Average
    });

    const colors = [
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(255, 205, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(199, 199, 199, 0.8)',
      'rgba(83, 102, 255, 0.8)'
    ];

    const chartConfig = {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: yAxis,
          data: values,
          backgroundColor: chartType === 'pie' ? colors : colors[0],
          borderColor: chartType === 'pie' ? colors.map(c => c.replace('0.8', '1')) : colors[0].replace('0.8', '1'),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${yAxis} by ${xAxis}`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: chartType !== 'pie' ? {
          x: {
            title: {
              display: true,
              text: xAxis
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: yAxis
            }
          }
        } : {}
      }
    };

    const newChart = new Chart(ctx, chartConfig);
    setChart(newChart);

    const stats = calculateStats();
    const analysisData = {
      fileName: selectedData.name,
      chartType,
      xAxis,
      yAxis,
      data: { labels, values },
      stats
    };

    setCurrentAnalysis(analysisData);

    // Save analysis
    onAnalysisComplete(analysisData);

    setIsGenerating(false);
  };

  const calculateStats = () => {
    if (!selectedData || !yAxis) return null;

    const values = selectedData.data
      .map(row => parseFloat(row[yAxis]))
      .filter(val => !isNaN(val));

    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];

    return { sum, avg, min, max, median, count: values.length };
  };

  const downloadPDFReport = async () => {
    if (!currentAnalysis || !chart) return;

    try {
      const pdf = await generatePDFReport(currentAnalysis, chartRef.current);
      pdf.save(`analysis-report-${currentAnalysis.fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const downloadJSONReport = () => {
    if (!currentAnalysis) return;

    const fullReport = generateAnalysisReport(currentAnalysis);
    const dataStr = JSON.stringify(fullReport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analysis-report-${currentAnalysis.fileName}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadCSVData = () => {
    if (!selectedData) return;
    
    downloadCSVReport(
      selectedData.data,
      `data-export-${selectedData.name}-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const downloadChartImage = () => {
    if (!chart) return;

    const link = document.createElement('a');
    link.download = `chart-${selectedData.name}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = chart.toBase64Image();
    link.click();
  };
  const stats = calculateStats();

  return (
    <div className="data-analysis">
      <div className="analysis-header">
        <h2>Data Analysis</h2>
        <p>Create charts and analyze your Excel data</p>
      </div>

      <div className="analysis-controls">
        <div className="control-group">
          <label>Select File:</label>
          <select 
            value={selectedFile} 
            onChange={(e) => handleFileSelect(e.target.value)}
            className="control-select"
          >
            <option value="">Choose a file...</option>
            {uploadedFiles.map((file) => (
              <option key={file.id} value={file.id}>
                {file.name}
              </option>
            ))}
          </select>
        </div>

        {selectedData && (
          <>
            <div className="control-group">
              <label>X-Axis (Categories):</label>
              <select 
                value={xAxis} 
                onChange={(e) => setXAxis(e.target.value)}
                className="control-select"
              >
                <option value="">Select column...</option>
                {selectedData.headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Y-Axis (Values):</label>
              <select 
                value={yAxis} 
                onChange={(e) => setYAxis(e.target.value)}
                className="control-select"
              >
                <option value="">Select column...</option>
                {selectedData.headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Chart Type:</label>
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
                className="control-select"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">🍩 Doughnut Chart</option>
                <option value="radar">🎯 Radar Chart</option>
              </select>
            </div>

            <button 
              onClick={generateChart}
              disabled={!xAxis || !yAxis}
              className="generate-btn"
            >
              {isGenerating ? '⏳ Generating...' : '🎨 Generate Chart'}
            </button>
          </>
        )}
      </div>

      {selectedData && (
        <div className="analysis-content">
          {chart && (
            <div className="chart-section">
              <div className="chart-header">
                <h3>📊 Chart Visualization</h3>
                <div className="chart-actions">
                  <button onClick={downloadChartImage} className="action-btn small">
                    📷 Download Image
                  </button>
                  <button onClick={downloadPDFReport} className="action-btn small primary">
                    📄 PDF Report
                  </button>
                  <button onClick={downloadJSONReport} className="action-btn small">
                    📋 JSON Report
                  </button>
                  <button onClick={downloadCSVData} className="action-btn small secondary">
                    📊 Export CSV
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          )}

          {stats && (
            <div className="stats-section">
              <h3>📊 Statistical Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Count:</span>
                  <span className="stat-value">{stats.count}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sum:</span>
                  <span className="stat-value">{stats.sum.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average:</span>
                  <span className="stat-value">{stats.avg.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Median:</span>
                  <span className="stat-value">{stats.median?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Min:</span>
                  <span className="stat-value">{stats.min}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Max:</span>
                  <span className="stat-value">{stats.max}</span>
                </div>
              </div>
              
              {currentAnalysis && (
                <div className="insights-section">
                  <h4>💡 Insights & Recommendations</h4>
                  <div className="insights-list">
                    {generateAnalysisReport(currentAnalysis).insights.map((insight, index) => (
                      <div key={index} className="insight-item">
                        <span className="insight-icon">💡</span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                  <div className="recommendations-list">
                    {generateAnalysisReport(currentAnalysis).recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <span className="recommendation-icon">💡</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="data-preview">
            <h3>👀 Data Preview</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {selectedData.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedData.data.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {selectedData.headers.map((header) => (
                        <td key={header}>{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedData.data.length > 10 && (
              <p className="table-note">
                Showing first 10 rows of {selectedData.data.length} total rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis;