import api from '../config/api';

export interface Provincia {
  id_prov: number;
  provincia: string;
}

export interface Ciudad {
  id_ciu: number;
  ciudad: string;
  provincia_ciu: number;
  provincia?: Provincia;
}

export interface Sector {
  id_sec: number;
  nombre_sec: string;
  ciudad_sec: number;
}

export interface Direccion {
  id_dir?: number;
  calle_dir: string;
  num_res_dir: string;
  estado_dir: string;
  creacion_dir: string;
  sector_dir: number;
}

export interface Contacto {
  id_contacto?: number;
  telefono_contacto: string;
  email_contacto: string;
  estado_contacto: string;
  creacion_contacto: string;
}

export interface CentroTrabajo {
  id_centro: number;
  nombre_centro: string;
  estado_centro: string;
  creacion_centro?: Date;
  direccion: Direccion;
  contacto: Contacto;
}

export interface FamiliaProfesional {
  id_fam: number;
  nombre_fam: string;
  estado_fam: string;
}

export interface Taller {
  id_taller: string;
  nombre_taller: string;
  cod_titulo_taller: string;
  estado_taller: string;
  familia_taller: FamiliaProfesional;
}

export interface Pasantia {
  id_pasantia: number;
  estudiante: string;
  centro: CentroTrabajo;
  supervisor: string;
  fecha_inicio: Date;
  dias_pasantia: string[];
  estado_pasantia: 'Activo' | 'Completada' | 'Cancelada';
}

export const internshipService = {
  // Provincias
  getAllProvincias: async (): Promise<Provincia[]> => {
    try {
      console.log('Solicitando provincias...');
      const response = await api.get<Provincia[]>('/provincias');
      console.log('Respuesta de provincias:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      throw error;
    }
  },

  // Ciudades
  getCiudadesByProvincia: async (provinciaId: number): Promise<Ciudad[]> => {
    try {
      console.log('Solicitando ciudades para provincia:', provinciaId);
      const response = await api.get<Ciudad[]>(`/ciudades/provincia/${provinciaId}`);
      console.log('Respuesta de ciudades:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
      throw error;
    }
  },

  // Sectores
  getSectoresByCiudad: async (ciudadId: number): Promise<Sector[]> => {
    try {
      console.log('Solicitando sectores para ciudad:', ciudadId);
      const response = await api.get<Sector[]>(`/sectores/ciudad/${ciudadId}`);
      console.log('Respuesta de sectores:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener sectores:', error);
      throw error;
    }
  },

  // Centros de Trabajo
  getAllCentrosTrabajo: async (): Promise<CentroTrabajo[]> => {
    try {
      console.log('Solicitando centros de trabajo...');
      const response = await api.get<CentroTrabajo[]>('/centros-trabajo');
      console.log('Respuesta de centros de trabajo:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener centros de trabajo:', error);
      throw error;
    }
  },

  createCentroTrabajo: async (centroData: Partial<CentroTrabajo>): Promise<CentroTrabajo> => {
    try {
      console.log('OBJETO QUE SE ENVÍA:', centroData);
      const response = await api.post<CentroTrabajo>('/centros-trabajo', centroData);
      return response.data;
    } catch (error) {
      console.error('Error al crear centro de trabajo:', error);
      throw error;
    }
  },

  // Talleres
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
  },

  // Pasantías
  createPasantia: async (pasantiaData: Partial<Pasantia>): Promise<Pasantia> => {
    try {
      const response = await api.post<Pasantia>('/pasantias', pasantiaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear pasantía:', error);
      throw error;
    }
  },

  getAllPasantias: async (): Promise<Pasantia[]> => {
    try {
      const response = await api.get<Pasantia[]>('/pasantias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pasantías:', error);
      throw error;
    }
  },

  updatePasantia: async (id: number, pasantiaData: Partial<Pasantia>): Promise<Pasantia> => {
    try {
      const response = await api.put<Pasantia>(`/pasantias/${id}`, pasantiaData);
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

  // Direcciones
  createDireccion: async (direccionData: Partial<Direccion>): Promise<Direccion> => {
    try {
      const response = await api.post<Direccion>('/direcciones', direccionData);
      return response.data;
    } catch (error) {
      console.error('Error al crear dirección:', error);
      throw error;
    }
  },

  // Contactos
  createContacto: async (contactoData: Partial<Contacto>): Promise<Contacto> => {
    try {
      const response = await api.post<Contacto>('/contactos', contactoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear contacto:', error);
      throw error;
    }
  },

  // Relación Taller-Centro
  asignarTallerCentro: async (data: { id_taller: number; id_centro: number }): Promise<any> => {
    try {
      const response = await api.post('/taller-centro', data);
      return response.data;
    } catch (error) {
      console.error('Error al asignar taller a centro:', error);
      throw error;
    }
  }
}; 