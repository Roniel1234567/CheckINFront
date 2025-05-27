import api from './api';

export interface PersonaContactoEstudiante {
  id_contacto_estudiante?: number;
  nombre: string;
  apellido: string;
  relacion: 'Padre' | 'Madre' | 'Tutor';
  telefono: string;
  correo?: string;
  estudiante: string; // documento_id_est
}

const personaContactoEstudianteService = {
  async createPersonaContactoEst(data: PersonaContactoEstudiante): Promise<PersonaContactoEstudiante> {
    const response = await api.post<PersonaContactoEstudiante>('/persona-contacto-estudiante', data);
    return response.data;
  },

  async getPersonaContactoByDocumento(documento: string): Promise<PersonaContactoEstudiante> {
    const response = await api.get<PersonaContactoEstudiante>(`/persona-contacto-estudiante/estudiante/${documento}`);
    return response.data;
  },

  updatePersonaContactoEst: async (documento: string, data: Partial<PersonaContactoEstudiante>): Promise<PersonaContactoEstudiante> => {
    const response = await api.put(`/persona-contacto-estudiante/${documento}`, data);
    return response.data;
  }
};

export default personaContactoEstudianteService; 