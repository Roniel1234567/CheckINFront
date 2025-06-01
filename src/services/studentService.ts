import api from './api';

export interface Estudiante {
  tipo_documento_est: string;
  documento_id_est: string;
  nombre_est: string;
  seg_nombre_est?: string;
  apellido_est: string;
  seg_apellido_est?: string;
  fecha_nac_est: string;
  sexo_est: "Masculino" | "Femenino";
  pasaporte_codigo_pais?: string;
  nacionalidad: string;
  horaspasrealizadas_est?: string;
  taller_est?: {
    id_taller: number;
    nombre_taller: string;
    cod_titulo_taller: string;
    estado_taller: string;
  };
  contacto_est?: {
    id_contacto: number;
    telefono_contacto: string;
    email_contacto: string;
  };
  usuario_est?: {
    id_usuario: number;
    dato_usuario: string;
    estado_usuario: string;
  };
  direccion_id?: {
    id_dir: number;
  };
  ciclo_escolar_est?: {
    id_ciclo: number;
    inicio_ciclo: number;
    fin_ciclo: number;
    estado_ciclo: string;
  };
  fecha_inicio_pasantia?: string | null;
  fecha_fin_pasantia?: string | null;
  poliza?: {
    id_poliza: number;
    numero_poliza: string;
  };
}

export interface NuevoEstudiante {
  tipo_documento_est: string;
  documento_id_est: string;
  nombre_est: string;
  seg_nombre_est?: string | null;
  apellido_est: string;
  seg_apellido_est?: string | null;
  fecha_nac_est: string;
  sexo_est: "Masculino" | "Femenino";
  nacionalidad: string;
  pasaporte_codigo_pais?: string | null;
  taller_est: number | null;
  usuario_est: string;
  contrasena_est: string;
  contacto: {
    telefono_contacto: string;
    email_contacto: string;
  };
  direccion: {
    sector_dir: number;
    calle_dir: string;
    num_res_dir: string;
  };
  ciclo_escolar: {
    inicio_ciclo: number;
    fin_ciclo: number;
    estado_ciclo: string;
  };
  persona_contacto: {
    nombre: string;
    apellido: string;
    relacion: 'Padre' | 'Madre' | 'Tutor';
    telefono: string;
    correo: string | null;
  };
}

export interface PolizaData {
  nombre_poliza: string;
  numero_poliza: string;
}

export interface FechasData {
  fecha_inicio_est: string;
  fecha_fin_est: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('API_URL:', API_URL);

const studentService = {
  async getAllStudents(): Promise<Estudiante[]> {
    try {
      const response = await api.get<Estudiante[]>('/estudiantes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  },

  async getStudentById(id: string): Promise<Estudiante> {
    try {
      const response = await api.get<Estudiante>(`/estudiantes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
      throw error;
    }
  },

  async createStudent(estudiante: NuevoEstudiante): Promise<Estudiante> {
    try {
      console.log('OBJETO QUE SE ENVÍA:', estudiante);
      const response = await api.post<Estudiante>('/estudiantes', estudiante);
      return response.data;
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      throw error;
    }
  },

  async updateStudent(id: string, estudiante: Partial<Estudiante>): Promise<Estudiante> {
    try {
      const response = await api.put<Estudiante>(`/estudiantes/${id}`, estudiante);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      throw error;
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await api.delete(`/estudiantes/${id}`);
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      throw error;
    }
  },

  async assignPolicy(id: string, polizaData: PolizaData): Promise<Estudiante> {
    try {
      const response = await api.put<Estudiante>(`/estudiantes/poliza/${id}`, polizaData);
      return response.data;
    } catch (error) {
      console.error('Error al asignar póliza:', error);
      throw error;
    }
  },

  async assignDates(id: string, fechasData: FechasData): Promise<Estudiante> {
    try {
      const response = await api.put<Estudiante>(`/estudiantes/${id}/fechas`, fechasData);
      return response.data;
    } catch (error) {
      console.error('Error al asignar fechas:', error);
      throw error;
    }
  },

  updateFechasPasantia: async (documento_id_est: string, data: {
    fecha_inicio_pasantia: string | null;
    fecha_fin_pasantia: string | null;
    horaspasrealizadas_est: number;
  }): Promise<Estudiante> => {
    try {
      const response = await api.put<Estudiante>(`/estudiantes/fecha/${documento_id_est}`, {
        fecha_inicio_pasantia: data.fecha_inicio_pasantia || null,
        fecha_fin_pasantia: data.fecha_fin_pasantia || null,
        horaspasrealizadas_est: Number(data.horaspasrealizadas_est) || 0
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar fechas:', error);
      throw error;
    }
  },

  updatePolizaEstudiante: async (documento_id_est: string, id_poliza: number) => {
    return api.put(`/estudiantes/poliza/${documento_id_est}`, { id_poliza });
  }
};

export default studentService; 