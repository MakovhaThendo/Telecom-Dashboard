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
      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M4 4h16v16H4z" />
              <path d="M8 16l4-4 4 4" />
              <path d="M12 12v4" />
              <path d="M16 8h.01" />
            </svg>
            <span className="brand-text">Telecom Analytics</span>
          </div>
          <div className="nav-links">
            <a href="#" className="nav-link active">Upload</a>
            <a href="#" className="nav-link">Dashboard</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="upload-main">
        <div className="upload-grid">
          {/* Left Column - Introduction */}
          <div className="intro-section">
            <div className="intro-content">
              <div className="intro-badge">Network Performance Analytics</div>
              <h1 className="intro-title">Upload Your Telecom Data</h1>
              <p className="intro-description">
                Import network performance metrics to visualize KPIs, identify 
                underperforming regions, and make data-driven decisions. 
                Our platform analyzes latency, throughput, and signal quality 
                across your entire network infrastructure.
              </p>
              <div className="intro-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Real-time network monitoring</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>KPI dashboards and analytics</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Region and base station comparison</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>Exportable reports and insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upload Form */}
          <div className="upload-section">
            <div className="upload-form-container">
              <h2 className="upload-title">Import CSV Data</h2>
              <p className="upload-subtitle">
                Upload a CSV file with your network performance metrics
              </p>

              <form onSubmit={handleUpload}>
                <div 
                  className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'file-selected' : ''}`}
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
                    <div className="drop-content">
                      <div className="drop-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                          <path d="M12 4v12m0 0l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                        </svg>
                      </div>
                      <div className="drop-text">
                        <h4>Drag and drop your CSV file here</h4>
                        <p>or click to browse files</p>
                      </div>
                      <span className="drop-format">Supported format: CSV</span>
                    </div>
                  ) : (
                    <div className="file-preview">
                      <div className="file-info">
                        <div className="file-type">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6" />
                          </svg>
                        </div>
                        <div className="file-details">
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
                        <div className="upload-progress">
                          <div className="progress-track">
                            <div className="progress-bar" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="progress-label">{progress}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {message && (
                  <div className={`form-message ${isSuccess ? 'success' : 'error'}`}>
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

              <div className="upload-requirements">
                <div className="req-section">
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <span className="footer-text">© 2026 Telecom Analytics. All rights reserved.</span>
          <span className="footer-text">Version 1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

export default UploadPage;