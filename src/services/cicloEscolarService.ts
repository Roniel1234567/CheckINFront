import api from './api';

export interface CicloEscolar {
  id_ciclo: number;
  inicio_ciclo: number;
  fin_ciclo: number;
  estado_ciclo: string;
  creacion_ciclo: string;
}

export interface NuevoCicloEscolar {
  inicio_ciclo: number;
  fin_ciclo: number;
  estado_ciclo: string;
}

const cicloEscolarService = {
  getAllCiclosEscolares: async (): Promise<CicloEscolar[]> => {
    const res = await api.get('/ciclo_escolar');
    return res.data as CicloEscolar[];
  },
  createCicloEscolar: async (data: NuevoCicloEscolar): Promise<CicloEscolar> => {
    const res = await api.post('/ciclo_escolar', data);
    return res.data as CicloEscolar;
  },
};

export default cicloEscolarService; 