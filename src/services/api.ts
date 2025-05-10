import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
console.log('Configurando API con URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => {
    console.log('Respuesta exitosa:', response.config.url);
    return response;
  },
  error => {
    console.error('Error en la petición:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api; 