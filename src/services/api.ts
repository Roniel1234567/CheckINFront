import axios from 'axios';

// Determinar la URL de la API dependiendo del entorno
let API_URL = 'http://localhost:5000/api'; // Valor por defecto

// Intenta obtener la URL según el entorno
try {
  if (import.meta.env.DEV) {
    API_URL = 'http://localhost:5000/api';
  } else {
    API_URL = '/api'; // URL relativa para despliegue en el mismo servidor
  }
} catch {
  // Si hay algún error, se usa el valor por defecto
}

console.log('Configurando API con URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Tiempo máximo de espera para la solicitud (5 segundos)
  timeout: 5000
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
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api; 