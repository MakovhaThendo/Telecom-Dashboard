import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData, fetchSummary } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ region: '', startDate: '', endDate: '' });
  const [regions, setRegions] = useState([]);
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

  const kpiData = summary?.global || { avgLatency: 0, avgThroughput: 0, avgSignal: 0, count: 0 };

  const getKpiIcon = (type) => {
    if (type === 'latency') return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
    if (type === 'throughput') return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
    if (type === 'signal') return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
        <path d="M2 20l3-3" />
        <path d="M6 16l3-3" />
        <path d="M10 12l3-3" />
        <path d="M14 8l3-3" />
        <path d="M18 4l3-3" />
      </svg>
    );
    if (type === 'records') return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
    return null;
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
            <h1 className="dashboard-title">Network Performance Dashboard</h1>
            <p className="dashboard-subtitle">Real-time analytics and monitoring</p>
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