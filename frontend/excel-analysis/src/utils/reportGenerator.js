import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFReport = async (analysisData, chartCanvas) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Title
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Excel Analytics Report', pageWidth / 2, 30, { align: 'center' });
  
  // Report details
  pdf.setFontSize(12);
  pdf.text(`File: ${analysisData.fileName}`, 20, 50);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 60);
  pdf.text(`Chart Type: ${analysisData.chartType}`, 20, 70);
  pdf.text(`X-Axis: ${analysisData.xAxis}`, 20, 80);
  pdf.text(`Y-Axis: ${analysisData.yAxis}`, 20, 90);
  
  // Statistics section
  if (analysisData.stats) {
    pdf.setFontSize(14);
    pdf.text('Statistical Summary:', 20, 110);
    
    pdf.setFontSize(10);
    const stats = analysisData.stats;
    let yPos = 125;
    
    pdf.text(`Count: ${stats.count}`, 20, yPos);
    pdf.text(`Sum: ${stats.sum.toFixed(2)}`, 20, yPos + 10);
    pdf.text(`Average: ${stats.avg.toFixed(2)}`, 20, yPos + 20);
    pdf.text(`Median: ${stats.median?.toFixed(2) || 'N/A'}`, 20, yPos + 30);
    pdf.text(`Minimum: ${stats.min}`, 20, yPos + 40);
    pdf.text(`Maximum: ${stats.max}`, 20, yPos + 50);
  }
  
  // Chart image
  if (chartCanvas) {
    try {
      const chartImage = chartCanvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (imgWidth * 3) / 4; // 4:3 aspect ratio
      
      // Add new page if needed
      if (yPos + imgHeight > pageHeight - 40) {
        pdf.addPage();
        yPos = 30;
      } else {
        yPos = 180;
      }
      
      pdf.addImage(chartImage, 'PNG', 20, yPos, imgWidth, imgHeight);
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
    }
  }
  
  return pdf;
};

export const downloadCSVReport = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateAnalysisReport = (analysisData) => {
  return {
    reportId: `RPT-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    fileName: analysisData.fileName,
    analysisType: analysisData.chartType,
    axes: {
      x: analysisData.xAxis,
      y: analysisData.yAxis
    },
    statistics: analysisData.stats,
    dataPoints: analysisData.data?.labels?.length || 0,
    insights: generateInsights(analysisData.stats),
    recommendations: generateRecommendations(analysisData)
  };
};

const generateInsights = (stats) => {
  if (!stats) return [];
  
  const insights = [];
  
  if (stats.avg && stats.median) {
    const skew = stats.avg - stats.median;
    if (Math.abs(skew) > stats.avg * 0.1) {
      insights.push(skew > 0 ? 'Data shows positive skew (right-tailed distribution)' : 'Data shows negative skew (left-tailed distribution)');
    } else {
      insights.push('Data appears to be normally distributed');
    }
  }
  
  if (stats.max && stats.min) {
    const range = stats.max - stats.min;
    insights.push(`Data range spans ${range.toFixed(2)} units`);
  }
  
  if (stats.count) {
    insights.push(`Analysis based on ${stats.count} data points`);
  }
  
  return insights;
};

const generateRecommendations = (analysisData) => {
  const recommendations = [];
  
  if (analysisData.chartType === 'pie' && analysisData.data?.labels?.length > 8) {
    recommendations.push('Consider using a bar chart for better readability with many categories');
  }
  
  if (analysisData.stats?.count < 10) {
    recommendations.push('Consider collecting more data points for more reliable statistical analysis');
  }
  
  recommendations.push('Export this analysis for further processing in other tools');
  recommendations.push('Create additional visualizations to explore different aspects of your data');
  
  return recommendations;
};