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
  getDireccionByCentro: async (idCentro: number) => {
    const response = await api.get(`/direcciones/centro/${idCentro}`);
    return response.data;
  },
  updateDireccion: async (id: number, data: Partial<NuevaDireccion>): Promise<Direccion> => {
    try {
      // Primero obtenemos la dirección actual
      const direccionActual = await direccionService.getDireccionById(id);
      
      // Creamos el objeto de actualización combinando los datos actuales con los nuevos
      const updateData = {
        sector_dir: data.sector_dir ?? direccionActual.sector_dir,
        calle_dir: data.calle_dir ?? direccionActual.calle_dir,
        num_res_dir: data.num_res_dir ?? direccionActual.num_res_dir,
        estado_dir: data.estado_dir ?? direccionActual.estado_dir
      };

      console.log('Datos de actualización:', updateData);

      const response = await api.put(`/direcciones/${id}`, updateData);
      return response.data as Direccion;
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      throw error;
    }
  },
};

export default direccionService; 