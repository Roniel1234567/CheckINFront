import api from './api';
import { FamiliaProfesional } from '../models/familia_profecional';
import { Taller, EstadoTallerType } from '../models/Taller';

export interface NuevoTaller {
    id_taller: string;
    nombre_taller: string;
    familia_taller: string; // ID de la familia profesional
    cod_titulo_taller: string;
    estado_taller?: EstadoTallerType;
}

export interface NuevaFamilia {
    id_fam: string;
    nombre_fam: string;
    estado_fam?: string;
}

const tallerService = {
    // Talleres
    getAllTalleres: async (): Promise<Taller[]> => {
        const response = await api.get('/talleres');
        return response.data;
    },

    createTaller: async (taller: NuevoTaller): Promise<Taller> => {
        const response = await api.post('/talleres', taller);
        return response.data;
    },

    updateTaller: async (id: string, taller: Partial<NuevoTaller>): Promise<Taller> => {
        const response = await api.put(`/talleres/${id}`, taller);
        return response.data;
    },

    deleteTaller: async (id: string): Promise<void> => {
        await api.delete(`/talleres/${id}`);
    },

    // Familias Profesionales
    getAllFamilias: async (): Promise<FamiliaProfesional[]> => {
        const response = await api.get('/familias-profesionales');
        return response.data;
    },

    createFamilia: async (familia: NuevaFamilia): Promise<FamiliaProfesional> => {
        const response = await api.post('/familias-profesionales', familia);
        return response.data;
    },

    updateFamilia: async (id: string, familia: Partial<NuevaFamilia>): Promise<FamiliaProfesional> => {
        const response = await api.put(`/familias-profesionales/${id}`, familia);
        return response.data;
    },

    deleteFamilia: async (id: string): Promise<void> => {
        await api.delete(`/familias-profesionales/${id}`);
    }
};

export default tallerService; 