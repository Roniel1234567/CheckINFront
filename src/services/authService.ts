import api from './api';

interface LoginCredentials {
  dato_usuario: string;
  contrasena_usuario: string;
}

interface RegisterData extends LoginCredentials {
  rol_usuario: number;
  email_usuario?: string;
}

interface ForgotPasswordData {
  email?: string;
  usuario?: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    dato_usuario: string;
    rol: number;
    estado: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Determinar si el usuario está intentando iniciar sesión con un correo electrónico
    const isEmail = credentials.dato_usuario.includes('@');
    
    // Si parece ser un correo, pasarlo en un campo adicional para que el backend lo maneje
    const payload = isEmail ? 
      { email: credentials.dato_usuario, contrasena_usuario: credentials.contrasena_usuario } : 
      credentials;
    
    const response = await api.post('/auth/login', payload);
    return response.data as AuthResponse;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data as AuthResponse;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data as { message: string };
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data as { message: string };
  },

  // Guardar token en localStorage
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  // Obtener token de localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Eliminar token de localStorage (logout)
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // Verificar si hay un token (usuario autenticado)
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
}; 