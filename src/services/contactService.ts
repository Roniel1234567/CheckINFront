import api from '../config/api';

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
  createContacto: async (data: NuevoContacto): Promise<Contacto> => {
    const response = await api.post<Contacto>('/contactos', {
      ...data,
      estado_contacto: 'Activo'
    });
    return response.data;
  },
  getAllContactos: async (): Promise<Contacto[]> => {
    const response = await api.get<Contacto[]>('/contactos');
    return response.data;
  }
};

export default contactService; 