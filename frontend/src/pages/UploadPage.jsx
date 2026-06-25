import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadCSV } from '../services/api';
import './UploadPage.css';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setMessage('');
      setIsSuccess(false);
    } else {
      setMessage('Please upload a valid CSV file.');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && (selected.type === 'text/csv' || selected.name.endsWith('.csv'))) {
      setFile(selected);
      setMessage('');
      setIsSuccess(false);
    } else {
      setFile(null);
      setMessage('Please select a valid CSV file.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    setUploading(true);
    setMessage('');
    setIsSuccess(false);
    setProgress(10);

    try {
      setProgress(30);
      const result = await uploadCSV(file);
      setProgress(100);
      
      setIsSuccess(true);
      setMessage(`${result.message} (${result.count} records uploaded)`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsSuccess(false);
      setMessage('Upload failed. Please check the file format and try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setMessage('');
    setIsSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadTemplate = () => {
    const template = 'region,baseStationId,timestamp,latencyMs,throughputMbps,signalStrengthDbm\nNorth,BS001,2025-01-01T10:00:00Z,45,120,-65\nNorth,BS001,2025-01-01T10:05:00Z,52,110,-70';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_telecom_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="upload-page">
      <header className="app-header">
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
            <a href="#" className="nav-item active">Upload</a>
            <a href="#" className="nav-item">Dashboard</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="content-grid">
          <section className="intro-section">
            <div className="intro-wrapper">
              <div className="intro-header">
                <span className="section-badge">Data Import</span>
                <h1 className="page-title">Upload Network Performance Data</h1>
                <p className="page-description">
                  Import your CSV files to visualize key performance indicators, 
                  monitor network health, and identify optimization opportunities 
                  across your infrastructure.
                </p>
              </div>

              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h4>Real-Time Monitoring</h4>
                    <p>Track network performance metrics as they are uploaded</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h4>KPI Dashboards</h4>
                    <p>Visualize latency, throughput, and signal quality</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h4>Region Comparison</h4>
                    <p>Identify underperforming regions and base stations</p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="feature-content">
                    <h4>Exportable Reports</h4>
                    <p>Generate CSV and PDF reports for stakeholders</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="upload-section">
            <div className="upload-card">
              <h2 className="upload-heading">Import CSV Data</h2>
              <p className="upload-subheading">
                Upload a CSV file containing network performance metrics
              </p>

              <form onSubmit={handleUpload}>
                <div 
                  className={`upload-box ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  
                  {!file ? (
                    <div className="upload-placeholder">
                      <p className="placeholder-main">Drag and drop your CSV file here</p>
                      <p className="placeholder-sub">or click to browse files</p>
                      <span className="placeholder-format">Supported format: CSV</span>
                    </div>
                  ) : (
                    <div className="file-display">
                      <div className="file-row">
                        <div className="file-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6" />
                          </svg>
                        </div>
                        <div className="file-meta">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                        <button 
                          type="button" 
                          className="file-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                      {uploading && (
                        <div className="progress-container">
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="progress-text">{progress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message && (
                  <div className={`form-feedback ${isSuccess ? 'feedback-success' : 'feedback-error'}`}>
                    {message}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className={`btn-primary ${uploading ? 'btn-loading' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Uploading...
                      </>
                    ) : (
                      'Upload Data'
                    )}
                  </button>
                  
                  {file && !uploading && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={removeFile}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              <div className="upload-footer">
                <div className="requirements">
                  <h4>File Requirements</h4>
                  <ul>
                    <li>CSV format with headers</li>
                    <li>Required columns: region, baseStationId, timestamp, latencyMs, throughputMbps, signalStrengthDbm</li>
                    <li>Maximum file size: 10MB</li>
                  </ul>
                </div>
                <button onClick={downloadTemplate} className="template-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Sample Template
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <span>© 2026 Network Analytics Platform</span>
          <span>Version 1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default UploadPage;