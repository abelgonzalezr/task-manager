import axios from 'axios';

// Define the API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hqiey3eg22.execute-api.us-east-1.amazonaws.com/dev';

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('id_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 