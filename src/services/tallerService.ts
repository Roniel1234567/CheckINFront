import api from './api';

export interface FamiliaProfesional {
  id_fam: string;
  nombre_fam: string;
  estado_fam: string;
}

export interface Taller {
  id_taller: number;
  nombre_taller: string;
  familia_taller: string;
  cod_titulo_taller: string;
  horaspas_taller: number;
  estado_taller: string;
  familia?: FamiliaProfesional;
}

export interface NuevoTaller {
  nombre_taller: string;
  familia_taller: string;
  cod_titulo_taller: string;
  horaspas_taller: number;
}

export interface NuevaFamilia {
  id_fam: string;
  nombre_fam: string;
}

const tallerService = {
  // Talleres
  getAllTalleres: async (): Promise<Taller[]> => {
    const response = await api.get('/talleres');
    return response.data;
  },

  createTaller: async (taller: NuevoTaller): Promise<Taller> => {
    const response = await api.post('/talleres', taller);
    return response.data;
  },

  updateTaller: async (id: number, taller: Partial<NuevoTaller>): Promise<Taller> => {
    const response = await api.put(`/talleres/${id}`, taller);
    return response.data;
  },

  deleteTaller: async (id: number): Promise<void> => {
    await api.delete(`/talleres/${id}`);
  },

  // Familias Profesionales
  getAllFamilias: async (): Promise<FamiliaProfesional[]> => {
    const response = await api.get('/familias-profesionales');
    return response.data;
  },

  createFamilia: async (familia: NuevaFamilia): Promise<FamiliaProfesional> => {
    const response = await api.post('/familias-profesionales', familia);
    return response.data;
  },

  updateFamilia: async (id: string, familia: Partial<NuevaFamilia>): Promise<FamiliaProfesional> => {
    const response = await api.put(`/familias-profesionales/${id}`, familia);
    return response.data;
  },

  deleteFamilia: async (id: string): Promise<void> => {
    await api.delete(`/familias-profesionales/${id}`);
  }
};

export default tallerService; 