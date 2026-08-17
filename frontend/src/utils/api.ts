import axios from 'axios';

const api = axios.create({
  baseURL: "https://face-lock-3og9.vercel.app/api",
  withCredentials: true,
});

export default api;
