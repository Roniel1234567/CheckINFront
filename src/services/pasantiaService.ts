import api from './api';

export enum EstadoPasantia {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  TERMINADA = 'Terminada',
  CANCELADA = 'Cancelada'
}

export interface Estudiante {
  documento_id_est: string;
  nombre_est: string;
  apellido_est: string;
}

export interface CentroDeTrabajo {
  id_centro: number;
  nombre_centro: string;
}

export interface Supervisor {
  id_sup: number;
  nombre_sup: string;
  apellido_sup: string;
  contacto_sup: {
    id_contacto: number;
    telefono_contacto: string;
    email_contacto: string;
  };
}

export interface Taller {
  id_taller: number;
  nombre_taller: string;
}

export interface Pasantia {
  id_pas: number;
  estudiante_pas: Estudiante;
  centro_pas: CentroDeTrabajo;
  supervisor_pas: Supervisor;
  inicio_pas: Date;
  fin_pas?: Date;
  estado_pas: EstadoPasantia;
  creacion_pas: Date;
}

export interface NuevaPasantia {
  estudiante_pas: string; // documento_id_est
  centro_pas: number;     // id_centro
  supervisor_pas: number; // id_sup
  inicio_pas: string;     // fecha en formato ISO
  fin_pas?: string;       // fecha en formato ISO (opcional)
  estado_pas?: EstadoPasantia;
}

const pasantiaService = {
  getAllPasantias: async (): Promise<Pasantia[]> => {
    try {
      const response = await api.get<Pasantia[]>('/pasantias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pasantías:', error);
      throw error;
    }
  },

  getPasantiaById: async (id: number): Promise<Pasantia> => {
    try {
      const response = await api.get<Pasantia>(`/pasantias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pasantía por ID:', error);
      throw error;
    }
  },

  getPasantiasPendientesEvaluacion: async (): Promise<Pasantia[]> => {
    try {
      const response = await api.get<Pasantia[]>('/pasantias/pendientesEvaluacion');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pasantías pendientes de evaluación:', error);
      throw error;
    }
  },

  createPasantia: async (pasantia: NuevaPasantia): Promise<Pasantia> => {
    try {
      const response = await api.post<Pasantia>('/pasantias', pasantia);
      return response.data;
    } catch (error) {
      console.error('Error al crear pasantía:', error);
      throw error;
    }
  },

  updatePasantia: async (id: number, pasantia: Partial<NuevaPasantia>): Promise<Pasantia> => {
    try {
      const response = await api.put<Pasantia>(`/pasantias/${id}`, pasantia);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pasantía:', error);
      throw error;
    }
  },

  deletePasantia: async (id: number): Promise<void> => {
    try {
      await api.delete(`/pasantias/${id}`);
    } catch (error) {
      console.error('Error al eliminar pasantía:', error);
      throw error;
    }
  },

  // Método para cambiar el estado de una pasantía
  cambiarEstadoPasantia: async (id: number, estado: EstadoPasantia): Promise<Pasantia> => {
    try {
      const response = await api.put<Pasantia>(`/pasantias/${id}`, { estado_pas: estado });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de la pasantía:', error);
      throw error;
    }
  },

  // Métodos específicos
  getPasantiasByEstudiante: async (documentoEstudiante: string): Promise<Pasantia[]> => {
    try {
      const pasantias = await pasantiaService.getAllPasantias();
      return pasantias.filter(p => p.estudiante_pas.documento_id_est === documentoEstudiante);
    } catch (error) {
      console.error('Error al obtener pasantías del estudiante:', error);
      throw error;
    }
  },

  getPasantiasByCentro: async (idCentro: number): Promise<Pasantia[]> => {
    try {
      const pasantias = await pasantiaService.getAllPasantias();
      return pasantias.filter(p => p.centro_pas.id_centro === idCentro);
    } catch (error) {
      console.error('Error al obtener pasantías del centro:', error);
      throw error;
    }
  },

  getPasantiasBySupervisor: async (idSupervisor: number): Promise<Pasantia[]> => {
    try {
      const pasantias = await pasantiaService.getAllPasantias();
      return pasantias.filter(p => p.supervisor_pas.id_sup === idSupervisor);
    } catch (error) {
      console.error('Error al obtener pasantías del supervisor:', error);
      throw error;
    }
  }
};

export default pasantiaService; 