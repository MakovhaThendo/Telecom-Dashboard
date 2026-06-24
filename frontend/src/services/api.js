import axios from 'axios';

// Use production URL if available, otherwise local dev proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload CSV
export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/data/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Fetch data with filters
export const fetchData = async (filters = {}) => {
  const response = await api.get('/data', { params: filters });
  return response.data;
};

// Fetch summary KPIs
export const fetchSummary = async () => {
  const response = await api.get('/data/summary');
  return response.data;
};

export default api;