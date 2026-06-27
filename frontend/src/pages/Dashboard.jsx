import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData, fetchSummary } from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ region: '', startDate: '', endDate: '' });
  const [regions, setRegions] = useState([]);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const [dataRes, summaryRes] = await Promise.all([
        fetchData(filterParams),
        fetchSummary()
      ]);
      
      if (dataRes.success) {
        setData(dataRes.data || []);
        const uniqueRegions = [...new Set(dataRes.data.map(item => item.region))];
        setRegions(uniqueRegions);
      } else {
        setError('Failed to load data');
      }
      
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      setError('Error loading dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const activeFilters = {};
    if (filters.region) activeFilters.region = filters.region;
    if (filters.startDate) activeFilters.startDate = filters.startDate;
    if (filters.endDate) activeFilters.endDate = filters.endDate;
    loadDashboard(activeFilters);
  };

  const clearFilters = () => {
    setFilters({ region: '', startDate: '', endDate: '' });
    loadDashboard({});
  };

  // Export PDF only
  const exportPDF = async () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    setExporting(true);

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');

      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(18);
      doc.setTextColor(10, 22, 40);
      doc.text('Network Performance Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(10, 22, 40);
      doc.text('KPI Summary', 14, 40);

      const kpiRows = [
        ['Metric', 'Value'],
        ['Average Latency', `${summary?.global?.avgLatency?.toFixed(1) || 0} ms`],
        ['Average Throughput', `${summary?.global?.avgThroughput?.toFixed(1) || 0} Mbps`],
        ['Average Signal', `${summary?.global?.avgSignal?.toFixed(1) || 0} dBm`],
        ['Total Records', `${summary?.global?.count || 0}`]
      ];

      let y = 48;
      kpiRows.forEach((row, index) => {
        doc.setFontSize(10);
        doc.setTextColor(index === 0 ? 55 : 26, index === 0 ? 65 : 26, index === 0 ? 81 : 26);
        doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
        doc.text(row[0], 14, y);
        doc.text(row[1], 60, y);
        y += 7;
      });

      const chartCards = document.querySelectorAll('.chart-card');
      let chartImages = [];

      for (let i = 0; i < Math.min(chartCards.length, 4); i++) {
        const canvas = await html2canvas.default(chartCards[i], {
          scale: 1.5,
          useCORS: true,
          logging: false,
        });
        chartImages.push(canvas.toDataURL('image/png'));
      }

      const chartsPerRow = 2;
      const chartWidth = (pageWidth - 40) / chartsPerRow;
      const chartHeight = 65;

      for (let i = 0; i < chartImages.length; i++) {
        const col = i % chartsPerRow;
        const row = Math.floor(i / chartsPerRow);
        const x = 14 + col * (chartWidth + 10);
        let yPos = 90 + row * (chartHeight + 15);

        if (yPos + chartHeight > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }

        doc.addImage(chartImages[i], 'PNG', x, yPos, chartWidth, chartHeight);
      }

      doc.addPage();
      doc.setFontSize(12);
      doc.setTextColor(10, 22, 40);
      doc.text('Data Records', 14, 20);

      const tableHeaders = ['Region', 'BS', 'Timestamp', 'Latency', 'Throughput', 'Signal'];
      const tableData = data.slice(0, 30).map(item => [
        item.region || '',
        item.baseStationId || '',
        new Date(item.timestamp).toLocaleDateString() || '',
        item.latencyMs !== undefined ? item.latencyMs.toString() : '',
        item.throughputMbps !== undefined ? item.throughputMbps.toString() : '',
        item.signalStrengthDbm !== undefined ? item.signalStrengthDbm.toString() : ''
      ]);

      let tableY = 30;
      const colWidths = [25, 20, 35, 25, 30, 25];

      tableHeaders.forEach((header, i) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(55, 65, 81);
        doc.text(header, 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), tableY);
      });

      tableY += 6;

      tableData.forEach((row) => {
        if (tableY > pageHeight - 20) {
          doc.addPage();
          tableY = 20;
          tableHeaders.forEach((header, i) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(55, 65, 81);
            doc.text(header, 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), tableY);
          });
          tableY += 6;
        }

        row.forEach((cell, i) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(26, 26, 26);
          doc.text(cell, 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), tableY);
        });
        tableY += 5;
      });

      doc.save(`network_report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const kpiData = summary?.global || { avgLatency: 0, avgThroughput: 0, avgSignal: 0, count: 0 };
  const regionData = summary?.regions || [];

  const getRegionStatus = (region) => {
    const regionInfo = regionData.find(r => r._id === region);
    if (!regionInfo) return null;

    const isHighLatency = regionInfo.avgLatency > 60;
    const isLowThroughput = regionInfo.avgThroughput < 100;
    const isPoorSignal = (regionInfo.avgSignal || 0) < -70;

    if (isHighLatency && isLowThroughput && isPoorSignal) {
      return { status: 'critical', label: 'Critical', color: '#ef4444' };
    } else if (isHighLatency || isLowThroughput || isPoorSignal) {
      return { status: 'warning', label: 'Warning', color: '#f59e0b' };
    } else {
      return { status: 'good', label: 'Good', color: '#22c55e' };
    }
  };

  const prepareLineChartData = () => {
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const labels = sortedData.map(item => new Date(item.timestamp).toLocaleDateString());
    const latencyData = sortedData.map(item => item.latencyMs);
    const throughputData = sortedData.map(item => item.throughputMbps);

    return {
      labels: labels.slice(0, 20),
      datasets: [
        {
          label: 'Latency (ms)',
          data: latencyData.slice(0, 20),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Throughput (Mbps)',
          data: throughputData.slice(0, 20),
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const prepareBarChartData = () => {
    const regions = regionData.map(item => item._id);
    const avgLatency = regionData.map(item => item.avgLatency);
    const avgThroughput = regionData.map(item => item.avgThroughput);

    return {
      labels: regions,
      datasets: [
        {
          label: 'Avg Latency (ms)',
          data: avgLatency,
          backgroundColor: 'rgba(37, 99, 235, 0.7)',
          borderColor: '#2563eb',
          borderWidth: 1,
        },
        {
          label: 'Avg Throughput (Mbps)',
          data: avgThroughput,
          backgroundColor: 'rgba(22, 163, 74, 0.7)',
          borderColor: '#16a34a',
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareSignalBarChart = () => {
    const regions = regionData.map(item => item._id);
    const avgSignal = regionData.map(item => item.avgSignal || 0);

    const sortedData = regions.map((region, index) => ({
      region,
      signal: avgSignal[index]
    })).sort((a, b) => b.signal - a.signal);

    return {
      labels: sortedData.map(item => item.region),
      datasets: [
        {
          label: 'Signal Strength (dBm)',
          data: sortedData.map(item => item.signal),
          backgroundColor: sortedData.map(item => {
            if (item.signal > -55) return 'rgba(34, 197, 94, 0.7)';
            if (item.signal > -60) return 'rgba(74, 222, 128, 0.7)';
            if (item.signal > -65) return 'rgba(234, 179, 8, 0.7)';
            if (item.signal > -70) return 'rgba(251, 146, 60, 0.7)';
            return 'rgba(239, 68, 68, 0.7)';
          }),
          borderColor: sortedData.map(item => {
            if (item.signal > -55) return '#22c55e';
            if (item.signal > -60) return '#4ade80';
            if (item.signal > -65) return '#eab308';
            if (item.signal > -70) return '#fb923c';
            return '#ef4444';
          }),
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Network Performance Trends' },
    },
    scales: { y: { beginAtZero: true } },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Regional Performance Comparison' },
    },
  };

  const signalChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 } } },
      title: { display: true, text: 'Signal Quality by Region', font: { size: 14, weight: 'bold' } },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Signal: ' + context.parsed.y + ' dBm';
          },
        },
      },
    },
    scales: {
      y: {
        min: -100,
        max: -40,
        ticks: {
          stepSize: 10,
          callback: function(value) {
            return value + ' dBm';
          },
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
    },
  };

  const getKpiIcon = (type) => {
    const icons = {
      latency: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      throughput: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      signal: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
          <path d="M2 20l3-3" />
          <path d="M6 16l3-3" />
          <path d="M10 12l3-3" />
          <path d="M14 8l3-3" />
          <path d="M18 4l3-3" />
        </svg>
      ),
      records: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    };
    return icons[type] || null;
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-brand">
            <span className="brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4z" />
                <path d="M8 16l4-4 4 4" />
                <path d="M12 12v4" />
                <path d="M16 8h.01" />
              </svg>
            </span>
            <span className="brand-name">Network Analytics</span>
          </div>
          <nav className="header-nav">
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Upload</a>
            <a href="#" className="nav-item active">Dashboard</a>
          </nav>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header-section">
            <div className="header-top">
              <div>
                <h1 className="dashboard-title">Network Performance Dashboard</h1>
                <p className="dashboard-subtitle">Real-time analytics and monitoring</p>
              </div>
              <div className="export-actions">
                <button className="export-btn pdf-btn" onClick={exportPDF} disabled={exporting || data.length === 0}>
                  {exporting ? 'Generating...' : 'Export PDF'}
                </button>
              </div>
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-group">
              <label>Region</label>
              <select name="region" value={filters.region} onChange={handleFilterChange}>
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>From</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </div>
            <div className="filter-group">
              <label>To</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </div>
            <div className="filter-actions">
              <button className="filter-btn" onClick={applyFilters}>Apply</button>
              <button className="filter-btn clear" onClick={clearFilters}>Clear</button>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon latency">{getKpiIcon('latency')}</div>
              <div className="kpi-content">
                <span className="kpi-label">Average Latency</span>
                <span className="kpi-value">{kpiData.avgLatency.toFixed(1)} ms</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon throughput">{getKpiIcon('throughput')}</div>
              <div className="kpi-content">
                <span className="kpi-label">Average Throughput</span>
                <span className="kpi-value">{kpiData.avgThroughput.toFixed(1)} Mbps</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon signal">{getKpiIcon('signal')}</div>
              <div className="kpi-content">
                <span className="kpi-label">Average Signal</span>
                <span className="kpi-value">{kpiData.avgSignal.toFixed(1)} dBm</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon records">{getKpiIcon('records')}</div>
              <div className="kpi-content">
                <span className="kpi-label">Total Records</span>
                <span className="kpi-value">{kpiData.count}</span>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              {data.length > 1 ? (
                <Line data={prepareLineChartData()} options={lineChartOptions} />
              ) : (
                <div className="chart-placeholder"><p>Upload more data to see trends</p></div>
              )}
            </div>
            <div className="chart-card">
              {regionData.length > 0 ? (
                <Bar data={prepareBarChartData()} options={barChartOptions} />
              ) : (
                <div className="chart-placeholder"><p>Upload data to see regional comparison</p></div>
              )}
            </div>
            <div className="chart-card">
              {regionData.length > 0 ? (
                <div className="region-table-container">
                  <h4 className="region-table-title">Region Performance</h4>
                  <table className="region-performance-table">
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Status</th>
                        <th>Latency (ms)</th>
                        <th>Throughput (Mbps)</th>
                        <th>Signal (dBm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionData.map((region, index) => {
                        const status = getRegionStatus(region._id);
                        return (
                          <tr key={index}>
                            <td className="region-name-cell">{region._id}</td>
                            <td>
                              <span className={`status-badge ${status?.status || ''}`}>
                                {status?.label || 'Unknown'}
                              </span>
                            </td>
                            <td>{region.avgLatency.toFixed(1)}</td>
                            <td>{region.avgThroughput.toFixed(1)}</td>
                            <td>{(region.avgSignal || 0).toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="chart-placeholder"><p>Upload data to see region status</p></div>
              )}
            </div>
            <div className="chart-card">
              {regionData.length > 0 ? (
                <Bar data={prepareSignalBarChart()} options={signalChartOptions} />
              ) : (
                <div className="chart-placeholder"><p>Upload data to see signal quality</p></div>
              )}
            </div>
          </div>

          <div className="table-section">
            <div className="table-header">
              <h3>Network Data Records</h3>
              <span className="record-count">{data.length} records</span>
            </div>
            {loading ? (
              <div className="loading-state">Loading data...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : data.length === 0 ? (
              <div className="empty-state">
                <p>No data available</p>
                <button className="upload-link" onClick={() => navigate('/')}>Upload a CSV file</button>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Base Station</th>
                      <th>Timestamp</th>
                      <th>Latency (ms)</th>
                      <th>Throughput (Mbps)</th>
                      <th>Signal (dBm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 50).map((item, index) => (
                      <tr key={index}>
                        <td>{item.region}</td>
                        <td>{item.baseStationId}</td>
                        <td>{new Date(item.timestamp).toLocaleString()}</td>
                        <td>{item.latencyMs}</td>
                        <td>{item.throughputMbps}</td>
                        <td>{item.signalStrengthDbm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 50 && (
                  <div className="table-footer">Showing 50 of {data.length} records</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-container">
          <span>© 2026 Network Analytics Platform</span>
          <span>Version 1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;