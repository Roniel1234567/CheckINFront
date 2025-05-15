import api from './api';
import axios from 'axios';

export interface Direccion {
  id_dir: number;
  sector_dir: number;
  calle_dir: string;
  num_res_dir: string;
  estado_dir: string;
  creacion_dir: string;
}

export interface NuevaDireccion {
  sector_dir: number;
  calle_dir: string;
  num_res_dir: string;
  estado_dir?: string;
}

export interface Sector {
  id_sec: number;
  sector: string;
  ciudad_sec: number;
}

const direccionService = {
  getAllDirecciones: async (): Promise<Direccion[]> => {
    const res = await api.get('/direcciones');
    return res.data as Direccion[];
  },
  getAllSectores: async (): Promise<Sector[]> => {
    const res = await api.get('/sectores');
    return res.data as Sector[];
  },
  createDireccion: async (data: NuevaDireccion): Promise<Direccion> => {
    const res = await api.post('/direcciones', data);
    return res.data as Direccion;
  },
  getDireccionById: async (id: number): Promise<Direccion> => {
    const res = await api.get(`/direcciones/${id}`);
    return res.data as Direccion;
  },
  getDireccionByEstudianteDocumento: async (documento: string) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/direcciones/estudiante/${documento}`);
    return res.data;
  },
};

export default direccionService; 