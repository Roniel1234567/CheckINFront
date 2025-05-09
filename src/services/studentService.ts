import api from '../config/api';

export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  taller: string;
  contacto: string;
  estado: 'Activo' | 'Inactivo' | 'Eliminado';
  poliza?: {
    nombre: string;
    numero: string;
  };
  fechas?: {
    inicio: string;
    fin: string;
  };
}

export interface NuevoEstudiante {
  nombre: string;
  apellido: string;
  documento: string;
  taller: number;
  contacto: string;
  tipo_documento?: string;
  fecha_nac?: string;
}

export interface PolizaData {
  nombre: string;
  numero: string;
}

export interface FechasData {
  inicio: string;
  fin: string;
}

const studentService = {
  // Obtener todos los estudiantes
  getAllStudents: async (): Promise<Estudiante[]> => {
    try {
      const response = await api.get<Estudiante[]>('/estudiantes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo estudiante
  createStudent: async (studentData: NuevoEstudiante): Promise<Estudiante> => {
    try {
      // Aseguramos que taller sea un número y agregamos valores por defecto para los campos obligatorios
      const dataToSend = {
        ...studentData,
        taller: Number(studentData.taller),
        tipo_documento: studentData.tipo_documento || 'Cédula',
        fecha_nac: studentData.fecha_nac || new Date().toISOString().split('T')[0],
        direccion_id: 1, // ID válido de dirección existente
        ciclo_escolar_est: 1, // ID válido de ciclo escolar existente
        contacto: 1 // ID válido de contacto existente
      };
      const response = await api.post<Estudiante>('/estudiantes', dataToSend);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Asignar póliza a un estudiante
  assignPolicy: async (studentId: string, policyData: PolizaData): Promise<Estudiante> => {
    try {
      const response = await api.post<Estudiante>(`/estudiantes/${studentId}/poliza`, policyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Asignar fechas de pasantía
  assignInternshipDates: async (studentId: string, datesData: FechasData): Promise<Estudiante> => {
    try {
      const response = await api.post<Estudiante>(`/estudiantes/${studentId}/fechas`, datesData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar estado del estudiante
  updateStudentStatus: async (studentId: string, status: 'Activo' | 'Inactivo' | 'Eliminado'): Promise<Estudiante> => {
    try {
      const response = await api.patch<Estudiante>(`/estudiantes/${studentId}/estado`, { estado: status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default studentService; 