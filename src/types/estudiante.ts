export interface Estudiante {
  tipo_documento_est: string;
  documento_id_est: string;
  usuario_est: {
    id_usuario: number;
    dato_usuario: string;
    contrasena_usuario: string;
    rol_usuario: number;
    estado_usuario: string;
    creacion_usuario: string;
  };
  nombre_est: string;
  seg_nombre_est?: string;
  apellido_est: string;
  seg_apellido_est?: string;
  fecha_nac_est: string;
  contacto_est?: {
    id_contacto: number;
    telefono_contacto: string;
    email_contacto: string;
    estado_contacto: string;
    creacion_contacto: string;
  };
  direccion_id: {
    id_dir: number;
    sector_dir: string;
    calle_dir: string;
    num_res_dir: string;
    estado_dir: string;
    creacion_dir: string;
  };
  ciclo_escolar_est: {
    id_ciclo: number;
    inicio_ciclo: number;
    fin_ciclo: number;
    estado_ciclo: string;
    creacion_ciclo: string;
  };
  creacion_est: string;
  taller_est?: {
    id_taller: number;
    nombre_taller: string;
    cod_titulo_taller: string;
    estado_taller: string;
  };
  horaspasrealizadas_est?: string;
  nombre_poliza?: string;
  numero_poliza?: string;
  fecha_inicio_pasantia?: string;
  fecha_fin_pasantia?: string;
  nacionalidad?: string | null;
  sexo_est?: string;
} 