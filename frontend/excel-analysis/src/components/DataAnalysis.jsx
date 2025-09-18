import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DataAnalysis = ({ uploadedFiles, onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedData, setSelectedData] = useState(null);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [chart, setChart] = useState(null);
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
      
      // Destroy existing chart
      if (chart) {
        chart.destroy();
        setChart(null);
      }
    }
  };

  const generateChart = () => {
    if (!selectedData || !xAxis || !yAxis) return;

    // Destroy existing chart
    if (chart) {
      chart.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const data = selectedData.data;

    // Prepare chart data
    const labels = data.map(row => row[xAxis]);
    const values = data.map(row => parseFloat(row[yAxis]) || 0);

    const chartConfig = {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: yAxis,
          data: values,
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${yAxis} by ${xAxis}`
          },
          legend: {
            display: chartType === 'pie'
          }
        },
        scales: chartType !== 'pie' ? {
          y: {
            beginAtZero: true
          }
        } : {}
      }
    };

    const newChart = new Chart(ctx, chartConfig);
    setChart(newChart);

    // Save analysis
    onAnalysisComplete({
      fileName: selectedData.name,
      chartType,
      xAxis,
      yAxis,
      data: { labels, values }
    });
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

    return { sum, avg, min, max, count: values.length };
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
              </select>
            </div>

            <button 
              onClick={generateChart}
              disabled={!xAxis || !yAxis}
              className="generate-btn"
            >
              Generate Chart
            </button>
          </>
        )}
      </div>

      {selectedData && (
        <div className="analysis-content">
          <div className="chart-section">
            <h3>Chart Visualization</h3>
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          {stats && (
            <div className="stats-section">
              <h3>Statistics</h3>
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
                  <span className="stat-label">Min:</span>
                  <span className="stat-value">{stats.min}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Max:</span>
                  <span className="stat-value">{stats.max}</span>
                </div>
              </div>
            </div>
          )}

          <div className="data-preview">
            <h3>Data Preview</h3>
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