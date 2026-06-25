import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadCSV } from '../services/api';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'text/csv') {
      setFile(selected);
      setMessage('');
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

    try {
      const result = await uploadCSV(file);
      setMessage(`✅ ${result.message} (${result.count} records)`);
      // After successful upload, navigate to dashboard
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setMessage('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📂 Upload Telecom Data</h1>
      <p>Upload a CSV file containing network performance metrics.</p>
      
      <form onSubmit={handleUpload} style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <button
          type="submit"
          disabled={!file || uploading}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default UploadPage;