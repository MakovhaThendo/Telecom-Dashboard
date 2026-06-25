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
      setMessage('❌ Please upload a valid CSV file.');
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
      setMessage('❌ Please select a valid CSV file.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('⚠️ Please select a file first.');
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
      setMessage(`✅ ${result.message} (${result.count} records uploaded)`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsSuccess(false);
      setMessage('❌ Upload failed. Please check the file format and try again.');
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

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <div className="header-icon">📡</div>
          <h1>Telecom Data Upload</h1>
          <p>Upload network performance metrics in CSV format</p>
        </div>

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
                <div className="upload-icon">📂</div>
                <h3>Drag & drop your CSV file here</h3>
                <p>or click to browse files</p>
                <span className="file-format">Supported format: .csv</span>
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <strong>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    ✕
                  </button>
                </div>
                {uploading && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    />
                    <span className="progress-text">{progress}%</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {message && (
            <div className={`message ${isSuccess ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="upload-actions">
            <button
              type="submit"
              disabled={!file || uploading}
              className={`upload-btn ${uploading ? 'uploading' : ''}`}
            >
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  Uploading...
                </>
              ) : (
                '🚀 Upload Data'
              )}
            </button>
            
            {file && !uploading && (
              <button
                type="button"
                className="clear-btn"
                onClick={removeFile}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className="upload-footer">
          <div className="requirements">
            <h4>📋 File Requirements</h4>
            <ul>
              <li>CSV format with headers</li>
              <li>Columns: region, baseStationId, timestamp, latencyMs, throughputMbps, signalStrengthDbm</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
          <div className="sample-link">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              alert('Download sample CSV template');
            }}>
              📥 Download sample template
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;