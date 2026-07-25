// src/api/axios.js
// Centralized Axios instance — automatically attaches JWT from localStorage

import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // proxied to http://localhost:5000 via Vite
});

// Attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('skillswap_token');
      localStorage.removeItem('skillswap_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
