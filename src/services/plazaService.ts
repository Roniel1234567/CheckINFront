import api from './api';

export type EstadoPlaza = 'Activa' | 'Inactiva';
export type GeneroPermitido = 'Masculino' | 'Femenino' | 'Ambos';

export interface Taller {
  id_taller: number;
  nombre_taller: string;
  cod_titulo_taller: string;
  estado_taller: string;
}

export interface CentroDeTrabajo {
  id_centro: number;
  nombre_centro: string;
  estado_centro: string;
}

export interface PlazaCentro {
  id_plaza: number;
  centro_plaza: CentroDeTrabajo;
  taller_plaza: Taller;
  plazas_centro: number;
  creacion_plaza: Date;
  estado: EstadoPlaza;
  edad_minima?: number;
  genero: GeneroPermitido;
  observacion?: string;
}

export interface NuevaPlazaCentro {
  centro_plaza: number;
  taller_plaza: number;
  plazas_centro: number;
  estado?: EstadoPlaza;
  edad_minima?: number;
  genero?: GeneroPermitido;
  observacion?: string;
}

const plazaService = {
  getAllPlazas: async (): Promise<PlazaCentro[]> => {
    try {
      const response = await api.get<PlazaCentro[]>('/plazas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener plazas:', error);
      throw error;
    }
  },

  getPlazaById: async (id: number): Promise<PlazaCentro> => {
    try {
      const response = await api.get<PlazaCentro>(`/plazas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener plaza por ID:', error);
      throw error;
    }
  },

  getPlazasByCentro: async (idCentro: number): Promise<PlazaCentro[]> => {
    try {
      const response = await api.get<PlazaCentro[]>('/plazas');
      return response.data.filter(
        (plaza) => plaza.centro_plaza.id_centro === idCentro
      );
    } catch (error) {
      console.error('Error al obtener plazas por centro:', error);
      throw error;
    }
  },

  getPlazasByTaller: async (idTaller: number): Promise<PlazaCentro[]> => {
    try {
      const response = await api.get<PlazaCentro[]>('/plazas');
      return response.data.filter(
        (plaza) => plaza.taller_plaza.id_taller === idTaller
      );
    } catch (error) {
      console.error('Error al obtener plazas por taller:', error);
      throw error;
    }
  },

  createPlaza: async (plazaData: NuevaPlazaCentro): Promise<PlazaCentro> => {
    try {
      const response = await api.post<PlazaCentro>('/plazas', plazaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear plaza:', error);
      throw error;
    }
  },

  updatePlaza: async (id: number, plazaData: Partial<NuevaPlazaCentro>): Promise<PlazaCentro> => {
    try {
      const response = await api.put<PlazaCentro>(`/plazas/${id}`, plazaData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar plaza:', error);
      throw error;
    }
  },

  deletePlaza: async (id: number): Promise<void> => {
    try {
      await api.delete(`/plazas/${id}`);
    } catch (error) {
      console.error('Error al eliminar plaza:', error);
      throw error;
    }
  },

  // Obtiene el total de plazas disponibles por taller en un centro específico
  getPlazasDisponiblesByCentroYTaller: async (idCentro: number, idTaller: number): Promise<number> => {
    try {
      const plazas = await plazaService.getAllPlazas();
      const plazaFiltrada = plazas.find(
        (plaza) => 
          plaza.centro_plaza.id_centro === idCentro && 
          plaza.taller_plaza.id_taller === idTaller &&
          plaza.estado === 'Activa'
      );
      return plazaFiltrada ? plazaFiltrada.plazas_centro : 0;
    } catch (error) {
      console.error('Error al obtener plazas disponibles:', error);
      throw error;
    }
  }
};

export default plazaService; 