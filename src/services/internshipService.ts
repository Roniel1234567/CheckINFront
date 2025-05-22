import api from './api';

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
  validacion?: 'Aceptada' | 'Rechazada' | 'Pendiente';
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
  seg_nombre_est?: string;
  seg_apellido_est?: string;
  fecha_nac_est: Date;
  taller_est?: Taller;
  horaspasrealizadas_est?: number;
  fecha_inicio_pasantia?: Date;
  fecha_fin_pasantia?: Date;
  nacionalidad?: string;
}

export interface Supervisor {
  id_sup: number;
  nombre_sup: string;
  apellido_sup: string;
  contacto_sup: string;
}

export interface Pasantia {
  id_pas?: number;
  estudiante_pas: Estudiante;
  centro_pas: CentroTrabajo;
  supervisor_pas: Supervisor;
  inicio_pas: Date;
  fin_pas?: Date;
  estado_pas: EstadoPasantia;
  creacion_pas?: Date;
}

export type GeneroPermitido = 'Masculino' | 'Femenino' | 'Ambos';
export type EstadoPlaza = 'Activa' | 'Inactiva';

export interface PlazasCentro {
  id_plaza: number;
  centro_plaza: CentroTrabajo;
  taller_plaza: Taller;
  plazas_centro: number;
  estado: EstadoPlaza;
  edad_minima?: number;
  genero: GeneroPermitido;
  observacion?: string;
  creacion_plaza: Date;
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

  getPasantiasPendientesEvaluacion: async (): Promise<Pasantia[]> => {
    try {
      const response = await api.get<Pasantia[]>('/pasantias/pendientesEvaluacion');
      return response.data;
    } catch (error) {
      console.error('Error al obtener pasantías pendientes de evaluación:', error);
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

  // Plazas de Centros
  getAllPlazas: async (): Promise<PlazasCentro[]> => {
    try {
      const response = await api.get<PlazasCentro[]>('/plazas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener plazas:', error);
      throw error;
    }
  },

  getPlazaById: async (id: number): Promise<PlazasCentro> => {
    try {
      const response = await api.get<PlazasCentro>(`/plazas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener plaza por ID:', error);
      throw error;
    }
  },

  createPlaza: async (plazaData: Partial<PlazasCentro>): Promise<PlazasCentro> => {
    try {
      const response = await api.post<PlazasCentro>('/plazas', plazaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear plaza:', error);
      throw error;
    }
  },

  updatePlaza: async (id: number, plazaData: Partial<PlazasCentro>): Promise<PlazasCentro> => {
    try {
      const response = await api.put<PlazasCentro>(`/plazas/${id}`, plazaData);
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

  // Estudiantes
  getAllEstudiantes: async (): Promise<Estudiante[]> => {
    try {
      const response = await api.get<Estudiante[]>('/estudiantes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  },

  getEstudianteById: async (id: string): Promise<Estudiante> => {
    try {
      const response = await api.get<Estudiante>(`/estudiantes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiante por ID:', error);
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