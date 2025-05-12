import api from './api';

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
  nombre_sec: string;
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
};

export default direccionService; 