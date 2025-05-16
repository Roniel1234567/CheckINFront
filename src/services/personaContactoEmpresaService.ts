import api from './api';

export const personaContactoEmpresaService = {
  createPersonaContactoEmpresa: async (data: {
    nombre_persona_contacto: string;
    apellido_persona_contacto: string;
    telefono: string;
    extension?: string;
    departamento?: string;
    centro_trabajo: number;
  }) => {
    const response = await api.post('/persona-contacto-empresa', data);
    return response.data;
  }
}; 