import api from './api';

export interface User {
  id?: number;
  id_usuario?: number;
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

export interface NuevoUsuario {
  dato_usuario: string;
  contrasena_usuario: string;
  rol_usuario: number;
}

export const userService = {
  async updateUser(id_usuario: number, data: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/usuarios/${id_usuario}`, data);
    return response.data;
  },
  createUser: async (data: NuevoUsuario) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },
  getUserByUsername: async (username: string) => {
    const response = await api.get(`/usuarios/buscar/${username}`);
    return response.data;
  }
}; 