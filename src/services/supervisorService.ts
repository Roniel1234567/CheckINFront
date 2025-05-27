import api from './api';

export interface Contacto {
  id_contacto: number;
  telefono_contacto: string;
  email_contacto: string;
  estado_contacto: string;
  creacion_contacto: Date;
}

export interface CentroDeTrabajo {
  id_centro: number;
  nombre_centro: string;
  direccion_centro: string;
  estado_centro: string;
}

export type EstadoSupervisorType = 'Activo' | 'Inactivo';

export interface Supervisor {
  id_sup: number;
  nombre_sup: string;
  apellido_sup: string;
  contacto_sup: Contacto;
  centro_trabajo?: CentroDeTrabajo;
  estado_sup: EstadoSupervisorType;
  creacion_sup: Date;
}

export interface SupervisorCreateData {
  nombre_sup: string;
  apellido_sup: string;
  contacto_sup: number;
  id_centro?: number | null;
}

const supervisorService = {
  getAllSupervisores: async (): Promise<Supervisor[]> => {
    try {
      const response = await api.get<Supervisor[]>('/supervisores');
      return response.data;
    } catch (error) {
      console.error('Error al obtener supervisores:', error);
      throw error;
    }
  },

  getSupervisorById: async (id: number): Promise<Supervisor> => {
    try {
      const response = await api.get<Supervisor>(`/supervisores/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener supervisor:', error);
      throw error;
    }
  },

  getSupervisoresPorCentro: async (idCentro: number): Promise<Supervisor[]> => {
    try {
      const response = await api.get<Supervisor[]>(`/supervisores/porCentro/${idCentro}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener supervisores por centro:', error);
      throw error;
    }
  },

  createSupervisor: async (supervisorData: SupervisorCreateData): Promise<Supervisor> => {
    try {
      const response = await api.post<Supervisor>('/supervisores', supervisorData);
      return response.data;
    } catch (error) {
      console.error('Error al crear supervisor:', error);
      throw error;
    }
  },

  updateSupervisor: async (id: number, supervisorData: Partial<SupervisorCreateData>): Promise<Supervisor> => {
    try {
      const response = await api.put<Supervisor>(`/supervisores/${id}`, supervisorData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar supervisor:', error);
      throw error;
    }
  },

  updateEstadoSupervisor: async (id: number, estado: EstadoSupervisorType): Promise<Supervisor> => {
    try {
      const response = await api.patch<Supervisor>(`/supervisores/${id}/estado`, {
        estado_sup: estado
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado del supervisor:', error);
      throw error;
    }
  },

  deleteSupervisor: async (id: number): Promise<void> => {
    try {
      await api.delete(`/supervisores/${id}`);
    } catch (error) {
      console.error('Error al eliminar supervisor:', error);
      throw error;
    }
  }
};

export default supervisorService; 