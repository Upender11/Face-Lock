import axios from 'axios';

const api = axios.create({
  baseURL: "https://face-lock-3og9.vercel.app/api",
  withCredentials: true,
});

// Interceptor to automatically add the JWT token to the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
