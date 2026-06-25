import axios from 'axios';

// HARDCODED FOR PRODUCTION - Points to your Render backend
const API_URL = 'https://telecom-dashboard-4ge2.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload CSV - with proper error handling
export const uploadCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Upload response:', response.data);

    return {
      success: true,
      message: response.data.message || 'Upload successful',
      count: response.data.count || 0,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Upload error:', error);

    const errorMessage = error.response?.data?.error || error.message || 'Upload failed';

    return {
      success: false,
      message: errorMessage,
      count: 0,
      error: error,
    };
  }
};

// Fetch data with filters
export const fetchData = async (filters = {}) => {
  try {
    const response = await api.get('/data', { params: filters });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};

// Fetch summary KPIs
export const fetchSummary = async () => {
  try {
    const response = await api.get('/data/summary');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Summary error:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Health check error:', error);
    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

export default api;