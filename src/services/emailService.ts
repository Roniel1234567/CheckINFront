import api from './api';

export const sendValidacionEmail = async (
    emailDestino: string,
    nombreEmpresa: string,
    esAceptada: boolean
) => {
    try {
        const response = await api.post('/email/validacion', {
            emailDestino,
            nombreEmpresa,
            esAceptada
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error enviando email de validación:', error);
        return { success: false, error };
    }
};

export interface DocumentosEmailData {
    correoEstudiante: string;
    nombreEstudiante: string;
    estado: 'aprobados' | 'rechazados' | 'vistos' | 'pendientes';
    documentosAfectados: string[];
}

export const sendDocumentosEmail = async (data: DocumentosEmailData) => {
    try {
        console.log('Enviando datos de email:', JSON.stringify(data, null, 2));
        const response = await api.post('/email/documentos', data);
        console.log('Respuesta del servidor:', response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error('Error detallado al enviar email de documentos:', {
            mensaje: error.message,
            respuesta: error.response?.data,
            estado: error.response?.status,
            datos_enviados: data
        });
        return { 
            success: false, 
            error,
            detalles: error.response?.data
        };
    }
};

export const sendCredencialesEmail = async (params: {
    correoEstudiante: string,
    nombreEstudiante: string,
    usuario: string,
    contrasena: string
}) => {
    try {
        const response = await api.post('/email/credenciales', params);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error enviando email de credenciales:', error);
        return { success: false, error };
    }
};

const emailService = {
    sendValidacionEmail,
    sendDocumentosEmail,
    sendCredencialesEmail
};

export default emailService; 