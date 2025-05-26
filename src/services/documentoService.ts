import api from './api';
import axios from 'axios';
import type { Estudiante } from '../types/estudiante';

export enum EstadoDocumento {
  VISTO = 'Visto',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
  PENDIENTE = 'Pendiente'
}

export interface DocEstudiante {
  est_doc: string;
  estudiante: Estudiante;
  ced_est?: Buffer;
  cv_doc?: Buffer;
  anexo_iv_doc?: Buffer;
  anexo_v_doc?: Buffer;
  acta_nac_doc?: Buffer;
  ced_padres_doc?: Buffer;
  vac_covid_doc?: Buffer;
  estado_doc_est: EstadoDocumento;
}

export interface ComentarioDoc {
  documento_id: string;
  comentario: string;
}

export interface EmailData {
  correoEstudiante: string;
  nombreEstudiante: string;
  estado: 'aprobados' | 'rechazados' | 'vistos';
  documentosAfectados: string[];
}

export interface ComentarioEmailData {
  correoEstudiante: string;
  nombreEstudiante: string;
  nombreDocumento: string;
  comentario: string;
}

const documentoService = {
  getAllDocumentos: async (): Promise<DocEstudiante[]> => {
    try {
      const response = await api.get<DocEstudiante[]>('/docs-estudiante');
      return response.data;
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      throw error;
    }
  },

  getDocumentosByEstudiante: async (documento: string): Promise<DocEstudiante[]> => {
    try {
      const response = await api.get<DocEstudiante[]>(`/docs-estudiante/estudiante/${documento}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener documentos del estudiante:', error);
      throw error;
    }
  },

  previewDocumento: async (documento: string, tipo: string): Promise<Blob> => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/docs-estudiante/${documento}/archivo/${tipo}`, {
        responseType: 'blob'
      });
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error al previsualizar documento:', error);
      throw error;
    }
  },

  enviarComentario: async (comentarioData: ComentarioEmailData): Promise<void> => {
    try {
      await api.post('/docs-estudiante/comentario-email', comentarioData);
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      throw error;
    }
  },

  actualizarEstadoDocumento: async (documento: string, estado: EstadoDocumento): Promise<void> => {
    try {
      console.log('Enviando petición al backend:', {
        documento,
        estado
      });

      // Actualizar el estado
      await api.put(`/docs-estudiante/${documento}`, { 
        estado_doc_est: estado
      });

    } catch (error) {
      console.error('Error completo al actualizar estado:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalles de la respuesta:', error.response?.data);
      }
      throw error;
    }
  }
};

export default documentoService; 