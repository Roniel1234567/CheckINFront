import api from '../src/services/api';

// Basic interfaces
export interface Provincia {
    id_prov: number;
    provincia: string;
}

export interface Ciudad {
    id_ciu: number;
    ciudad: string;
    provincia_ciu: number;
    provincia?: Provincia;
}

export interface Sector {
    id_sec: number;
    sector: string;
    ciudad_sec: number;
}

export interface Direccion {
    id_dir?: number;
    sector_dir: number;
    calle_dir: string;
    num_res_dir: string;
    estado_dir?: string;
}

export interface Contacto {
    id_contacto?: number;
    telefono_contacto: string;
    email_contacto: string;
    estado_contacto?: string;
}

export interface CentroTrabajo {
    id_centro: number;
    nombre_centro: string;
    direccion_centro: Direccion;
    contacto_centro: Contacto;
    estado_centro: 'Activo' | 'Inactivo';
    creacion_centro?: Date;
}

export interface Taller {
    id_taller: number;
    nombre_taller: string;
    familia_taller: string;
    cod_titulo_taller: string;
    horaspas_taller: number;
    estado_taller: 'Activo' | 'Inactivo';
}

export interface EmpresaPorTaller {
    id: number;
    nombre: string;
    estudiantes: number;
    estado: 'Activo' | 'Inactivo';
}

// API Service
export const CompaniesCRUD = {
    // Centros de trabajo
    getAllCompanies: async (): Promise<CentroTrabajo[]> => {
        const { data } = await api.get<CentroTrabajo[]>('/centros-trabajo');
        return data;
    },

    getCompanyById: async (id: number): Promise<CentroTrabajo> => {
        const { data } = await api.get<CentroTrabajo>(`/centros-trabajo/${id}`);
        return data;
    },

    createCompany: async (company: Omit<CentroTrabajo, 'id_centro' | 'creacion_centro'>): Promise<CentroTrabajo> => {
        const { data } = await api.post<CentroTrabajo>('/centros-trabajo', company);
        return data;
    },

    updateCompany: async (id: number, company: Partial<CentroTrabajo>): Promise<CentroTrabajo> => {
        const { data } = await api.put<CentroTrabajo>(`/centros-trabajo/${id}`, company);
        return data;
    },

    deleteCompany: async (id: number): Promise<void> => {
        await api.delete(`/centros-trabajo/${id}`);
    },

    // Ubicaciones
    getProvincias: async (): Promise<Provincia[]> => {
        const { data } = await api.get<Provincia[]>('/provincias');
        return data;
    },

    getCiudadesByProvincia: async (provinciaId: number): Promise<Ciudad[]> => {
        const { data } = await api.get<Ciudad[]>(`/ciudades/provincia/${provinciaId}`);
        return data;
    },

    getSectoresByCiudad: async (ciudadId: number): Promise<Sector[]> => {
        const { data } = await api.get<Sector[]>(`/sectores/ciudad/${ciudadId}`);
        return data;
    },

    // Talleres
    getAllTalleres: async (): Promise<Taller[]> => {
        const { data } = await api.get<Taller[]>('/talleres');
        return data;
    },

    getCentrosByTaller: async (tallerId: number): Promise<EmpresaPorTaller[]> => {
        const { data } = await api.get<EmpresaPorTaller[]>(`/centros-trabajo/taller/${tallerId}`);
        return data;
    }
};