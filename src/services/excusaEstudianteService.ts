import api from './api';

export interface ExcusaEstudiante {
  id_excusa?: number;
  justificacion_excusa: string;
  fecha_creacion_excusa?: string;
  pasantia: number; // id_pasantia
  tutor: number;    // id_tutor
  estudiante: string; // documento_id_est
}

const excusaEstudianteService = {
  getAll: async () => {
    const res = await api.get('/excusas-estudiante');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get(`/excusas-estudiante/${id}`);
    return res.data;
  },
  create: async (excusa: ExcusaEstudiante) => {
    const res = await api.post('/excusas-estudiante', excusa);
    return res.data;
  }
};

export default excusaEstudianteService; 