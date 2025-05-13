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
};

export default personaContactoEstudianteService; 