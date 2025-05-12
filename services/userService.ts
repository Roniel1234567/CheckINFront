/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Custom type definition for AxiosError
interface AxiosError<T = any> extends Error {
  response?: {
    data: T;
    status?: number;
    headers?: any;
  };
  request?: any;
  config?: any;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función para obtener el token del localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configuración del interceptor
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  dato_usuario: string;
  nombre_usuario: string;
  seg_nombre_usuario: string;
  apellido_usuario: string;
  seg_apellido_usuario: string;
  correo_usuario: string;
  telefono_usuario: string;
  rol_usuario: number;
  estado_usuario: string;
}

interface ApiError {
  message: string;
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const { data } = await axios.get<User[]>(`${API_URL}/usuarios`);
      return data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  },

  searchUsers: async (searchTerm: string): Promise<User[]> => {
    try {
      const { data } = await axios.get<User[]>(`${API_URL}/usuarios/search?q=${searchTerm}`);
      return data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      const dataToSend = {
        ...userData,
        rol_usuario: Number(userData.rol_usuario)
      };

      const { data } = await axios.put<User>(`${API_URL}/usuarios/${id}`, dataToSend);
      return data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/usuarios/${id}`);
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  },

  createUser: async (userData: Partial<User> & { contrasena_usuario: string }): Promise<User> => {
    try {
      const { data } = await axios.post<User>(`${API_URL}/usuarios`, userData);
      return data;
    } catch (error) {
      return handleApiError(error as AxiosError<ApiError>);
    }
  }
};

// Función auxiliar para manejar errores
const handleApiError = (error: AxiosError<ApiError>): never => {
  console.error('Error en la operación:', error);
  
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  const errorMessage = error.response?.data?.message || 'Error en la operación';
  throw new Error(errorMessage);
};