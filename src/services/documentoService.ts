import api from './api';
import axios from 'axios';
import { Estudiante } from './estudianteService';

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
  id_comentario?: number;
  documento: string;
  tipo_documento: string;
  comentario: string;
  fecha_comentario: Date;
  email_estudiante: string;
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
      return response.data;
    } catch (error) {
      console.error('Error al previsualizar documento:', error);
      throw error;
    }
  },

  enviarComentario: async (comentarioData: ComentarioDoc): Promise<void> => {
    try {
      await api.post('/docs-estudiante/comentario', comentarioData);
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      throw error;
    }
  },

  actualizarEstadoDocumento: async (documento: string, estado: EstadoDocumento): Promise<void> => {
    try {
      await api.put(`/docs-estudiante/${documento}`, { estado_doc_est: estado });
    } catch (error) {
      console.error('Error al actualizar estado del documento:', error);
      throw error;
    }
  }
};

export default documentoService; 