// src/services/apiClient.js
import axios from 'axios';

// Si en tu AuthContext guardas el usuario en localStorage como { token, ... }
const getToken = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const { token } = JSON.parse(raw);
    return token || null;
  } catch {
    return null;
  }
};

const API = axios.create({
  baseURL: '/api', // tienes proxy en package.json -> http://localhost:5000
});

// Adjunta Authorization en cada request
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo básico de 401 -> redirigir a login (opcional)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Opcional: limpia sesión y redirige
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
