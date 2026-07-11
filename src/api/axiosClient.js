import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://129.212.190.27:8001/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('teacher_token') || localStorage.getItem('student_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('teacher_token');
      localStorage.removeItem('student_token');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
