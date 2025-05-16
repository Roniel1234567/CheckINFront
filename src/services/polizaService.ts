import api from './api';

export interface NuevaPoliza {
  compania: string;
  tipo_poliza: string;
  nombre_poliza: string;
  numero_poliza: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
}

export interface Poliza {
  id_poliza: number;
  compania: string;
  tipo_poliza: string;
  nombre_poliza: string;
  numero_poliza: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}

const polizaService = {
  createPoliza: async (data: NuevaPoliza): Promise<Poliza> => {
    const response = await api.post<Poliza>('/polizas', data);
    return response.data;
  },
  getAllPolizas: async (): Promise<Poliza[]> => {
    const response = await api.get<Poliza[]>('/polizas');
    return response.data;
  }
};

export default polizaService; 