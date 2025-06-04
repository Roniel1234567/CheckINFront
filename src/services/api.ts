import axios from 'axios';
import { authService } from './authService';

// Determinar la URL de la API dependiendo del entorno
let API_URL = 'https://checkinback-production.up.railway.app/api'; // Valor por defecto

// Intenta obtener la URL según el entorno
try {
  if (import.meta.env.DEV) {
    API_URL = 'https://checkinback-production.up.railway.app/api';
  } else {
    API_URL = 'https://checkinback-production.up.railway.app/api'; // URL relativa para despliegue en el mismo servidor
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
  // Tiempo máximo de espera para la solicitud (30 segundos)
  timeout: 30000
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      authService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Interceptor para depurar las peticiones salientes
api.interceptors.request.use(
  request => {
    console.log('Enviando petición:', {
      url: request.url,
      method: request.method,
      data: request.data,
      headers: request.headers
    });
    return request;
  },
  error => {
    console.error('Error al preparar la petición:', error);
    return Promise.reject(error);
  }
);

// Obtener tutor por id_usuario
export const getTutorByUsuario = async (id_usuario: number) => {
  const response = await api.get(`/tutores/usuario/${id_usuario}`);
  return response.data;
};

export default api; 