import api from './api';

export interface FamiliaProfesional {
  id_fam: string;
  nombre_fam: string;
  estado_fam: string;
}

export interface Taller {
  id_taller: string;
  nombre_taller: string;
  familia_taller: {
    id_fam: string;
    nombre_fam: string;
  };
  cod_titulo_taller: string;
  estado_taller: 'Activo' | 'Inactivo';
}

export interface NuevoTaller {
  id_taller?: string;
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
    try {
      console.log('TallerService: Iniciando getAllTalleres...');
      const response = await api.get<Taller[]>('/talleres');
      console.log('TallerService: Respuesta de talleres:', response.data);
      return response.data;
    } catch (error) {
      console.error('TallerService: Error al obtener talleres:', error);
      throw new Error('No se pudieron cargar los talleres');
    }
  },

  getTallerById: async (id: string): Promise<Taller> => {
    try {
      const response = await api.get<Taller>(`/talleres/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener taller:', error);
      throw new Error('No se pudo cargar el taller');
    }
  },

  createTaller: async (taller: NuevoTaller): Promise<Taller> => {
    // Transformar el formato para que sea compatible con el backend
    const tallerData = {
      nombre_taller: taller.nombre_taller,
      familia_taller: { id_fam: taller.familia_taller },
      cod_titulo_taller: taller.cod_titulo_taller,
      horaspas_taller: taller.horaspas_taller
    };
    
    const response = await api.post('/talleres', tallerData);
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