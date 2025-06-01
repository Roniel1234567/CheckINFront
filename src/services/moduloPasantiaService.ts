import api from './api';

export interface ModuloPasantia {
  id_modulo: number;
  estado_modulo: 'Aprobado' | 'Reprobado';
  pasantia: any; // Puedes tipar mejor si tienes la interfaz
  calificacion_estudiante: any; // Puedes tipar mejor si tienes la interfaz
}

const moduloPasantiaService = {
  getAll: async (): Promise<ModuloPasantia[]> => {
    const res = await api.get('/modulos-pasantia');
    return res.data;
  },
  getById: async (id: number): Promise<ModuloPasantia> => {
    const res = await api.get(`/modulos-pasantia/${id}`);
    return res.data;
  },
  create: async (data: Partial<ModuloPasantia>): Promise<ModuloPasantia> => {
    const res = await api.post('/modulos-pasantia', data);
    return res.data;
  },
  update: async (id: number, data: Partial<ModuloPasantia>): Promise<ModuloPasantia> => {
    const res = await api.put(`/modulos-pasantia/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/modulos-pasantia/${id}`);
  },
};

export default moduloPasantiaService; 