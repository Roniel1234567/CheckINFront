import api from './api';
import { jwtDecode } from 'jwt-decode';

// Tipos que coinciden con el backend
export type EstadoUsuarioType = 'Activo' | 'Inactivo' | 'Eliminado';

interface LoginCredentials {
  dato_usuario: string;
  contrasena_usuario: string;
}

interface RegisterData {
  dato_usuario: string;
  contrasena_usuario: string;
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
  message?: string;
  token: string;
  user: {
    id_usuario: number;
    dato_usuario: string;
    rol: number;
    estado_usuario: EstadoUsuarioType;
  };
}

interface DecodedToken {
  id: number;
  rol: number;
  estado: EstadoUsuarioType;
  email?: string;
  dato_usuario: string;
  id_centro?: number;
  iat: number;
  exp: number;
}

class AuthService {
  private tokenKey = 'token';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Determinar si el usuario está intentando iniciar sesión con un correo electrónico
    const isEmail = credentials.dato_usuario.includes('@');
    
    // Crear el payload según el tipo de dato
    const payload = {
      contrasena_usuario: credentials.contrasena_usuario,
      // Si es email, enviar solo el email, sino el dato_usuario
      ...(isEmail ? { email: credentials.dato_usuario } : { dato_usuario: credentials.dato_usuario })
    };

    try {
      console.log('Enviando payload:', payload);
      const response = await api.post<AuthResponse>('/auth/login', payload);
      
      // Verificar el estado del usuario
      if (response.data.user.estado_usuario !== 'Activo') {
        throw new Error(response.data.user.estado_usuario === 'Eliminado' 
          ? 'Usuario no disponible' 
          : 'Usuario inactivo');
      }
      
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      // Manejar errores específicos
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status: number; data?: { message?: string } } };
        if (errorResponse.response) {
          const status = errorResponse.response.status;
          const message = errorResponse.response.data?.message;

          switch (status) {
            case 400:
              throw new Error(message || 'Credenciales inválidas');
            case 403:
              throw new Error('Usuario inactivo o eliminado');
            case 404:
              throw new Error('Usuario no encontrado');
            default:
              throw new Error('Error en el inicio de sesión');
          }
        }
      }
      throw new Error('Error de conexión');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Verificar que el token no haya expirado y que el usuario esté activo
      return decoded.exp * 1000 > Date.now() && decoded.estado === 'Activo';
    } catch {
      return false;
    }
  }

  getCurrentUser(): { id_usuario: number; dato_usuario: string; rol: number; email?: string; id_centro?: number } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Verificar si el usuario no está activo
      if (decoded.estado !== 'Activo') {
        this.logout(); // Eliminar el token
        return null;
      }

      return {
        id_usuario: decoded.id,
        dato_usuario: decoded.dato_usuario,
        rol: decoded.rol,
        email: decoded.email,
        id_centro: decoded.id_centro
      };
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService(); 