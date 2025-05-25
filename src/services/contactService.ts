import api from './api';

export interface Contacto {
  id_contacto: number;
  telefono_contacto: string;
  email_contacto: string;
  estado_contacto?: string;
  creacion_contacto?: string;
}

export interface NuevoContacto {
  telefono_contacto: string;
  email_contacto: string;
  estado_contacto?: string;
}

const contactService = {
  createContacto: async (data: NuevoContacto): Promise<Contacto> => {
    const response = await api.post('/contactos', data);
    return response.data;
  },

  getContactoById: async (id: number): Promise<Contacto> => {
    const response = await api.get(`/contactos/${id}`);
    return response.data;
  },

  updateContacto: async (id: number, data: Partial<NuevoContacto>): Promise<Contacto> => {
    const response = await api.put(`/contactos/${id}`, data);
    return response.data;
  },

  getAllContactos: async (): Promise<Contacto[]> => {
    const response = await api.get<Contacto[]>('/contactos');
    return response.data;
  },
  // Validación en tiempo real de email
  existeEmailContacto: async (email: string): Promise<{ exists: boolean }> => {
    const response = await api.get<{ exists: boolean }>(`/contactos/existe-email/${encodeURIComponent(email)}`);
    return response.data;
  },
  // Validación en tiempo real de teléfono
  existeTelefonoContacto: async (telefono: string): Promise<{ exists: boolean }> => {
    const response = await api.get<{ exists: boolean }>(`/contactos/existe-telefono/${encodeURIComponent(telefono)}`);
    return response.data;
  }
};

export default contactService; 