import axios from 'axios';
import toast from 'react-hot-toast';

// This is your deployed backend URL on Render
const API_URL = 'https://backend-ar2w.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check both potential storage keys
    const userData = localStorage.getItem('user') || localStorage.getItem('student');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user._id) {
          config.headers['X-User-ID'] = user._id;
        }
      } catch (e) {
        console.error('Auth header error:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('student');
      window.location.href = '/student/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);


export default api;