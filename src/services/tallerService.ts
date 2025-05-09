import api from '../config/api';

export interface FamiliaProfesional {
  id_fam: string;
  nombre_fam: string;
  estado_fam: string;
}

export interface Taller {
  id_taller: number;
  nombre_taller: string;
  cod_titulo_taller: string;
  estado_taller: string;
  familia_taller: FamiliaProfesional;
}

const tallerService = {
  // Obtener todos los talleres
  getAllTalleres: async (): Promise<Taller[]> => {
    try {
      console.log('Solicitando talleres...');
      const response = await api.get<Taller[]>('/talleres');
      console.log('Respuesta de talleres:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener talleres:', error);
      throw error;
    }
  }
};

export default tallerService; 