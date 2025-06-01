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

export const sendDocumentosEmail = async (
    emailDestino: string,
    nombreEstudiante: string,
    estado: string
) => {
    try {
        const response = await api.post('/email/documentos', {
            emailDestino,
            nombreEstudiante,
            estado
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error enviando email de documentos:', error);
        return { success: false, error };
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