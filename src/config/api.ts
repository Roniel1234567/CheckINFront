import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición:', error);
    if (error.response) {
      console.error('Datos del error:', error.response.data);
      console.error('Estado del error:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export default api; 