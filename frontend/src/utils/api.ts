import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'https://face-lock-3og9.vercel.app/api',
  withCredentials: true,
});

export default api;
