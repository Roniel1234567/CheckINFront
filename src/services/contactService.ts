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
}

const contactService = {
  createContacto: async (contactoData: NuevoContacto): Promise<Contacto> => {
    try {
      const response = await api.post<Contacto>('/contactos', contactoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear contacto:', error);
      throw new Error('No se pudo crear el contacto');
    }
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