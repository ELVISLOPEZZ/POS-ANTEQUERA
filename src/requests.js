// src/requests.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api' // Sin '/auth', porque esta instancia es para todas las rutas protegidas
});

// Interceptor para agregar el token a cada solicitud
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
