import api from './api';

export interface Administrador {
  id_adm: number;
  nombre_adm: string;
  apellido_adm: string;
  puesto_adm: string;
  usuario_adm: {
    id_usuario: number;
    dato_usuario: string;
    estado_usuario: string;
  };
  contacto_adm: {
    id_contacto: number;
    telefono_contacto: string;
    email_contacto: string;
  };
  creacion_adm: Date;
}

export const administradorService = {
  getAllAdministradores: async (): Promise<Administrador[]> => {
    const response = await api.get('/administradores');
    return response.data;
  },

  getAdministradorById: async (id: number): Promise<Administrador> => {
    const response = await api.get(`/administradores/${id}`);
    return response.data;
  },

  createAdministrador: async (administrador: Partial<Administrador>): Promise<Administrador> => {
    const response = await api.post('/administradores', administrador);
    return response.data;
  },

  updateAdministrador: async (id: number, administrador: Partial<Administrador>): Promise<Administrador> => {
    const response = await api.put(`/administradores/${id}`, administrador);
    return response.data;
  },

  deleteAdministrador: async (id: number): Promise<void> => {
    await api.delete(`/administradores/${id}`);
  }
}; 