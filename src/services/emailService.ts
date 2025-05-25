import nodemailer from 'nodemailer';

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Configurar en .env
        pass: process.env.EMAIL_PASS  // Configurar en .env
    }
});

// Plantillas de correo
const emailTemplates = {
    empresaAceptada: (nombreEmpresa: string) => ({
        subject: '¡Felicitaciones! Su empresa ha sido aceptada en CHECKINTIN',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1a237e;">¡Felicitaciones ${nombreEmpresa}! 🎉</h2>
                
                <p>Nos complace informarle que su empresa ha sido <strong style="color: #4caf50;">ACEPTADA</strong> 
                en el proceso de pasantías del Instituto Politécnico Industrial de Santiago (IPISA).</p>
                
                <p>A través de nuestra plataforma CHECKINTIN, ahora puede:</p>
                <ul>
                    <li>Gestionar plazas de pasantías</li>
                    <li>Supervisar el progreso de los pasantes</li>
                    <li>Mantener comunicación directa con la institución</li>
                    <li>Contribuir a la formación profesional de nuestros estudiantes</li>
                </ul>

                <p>Le invitamos a acceder a CHECKINTIN para comenzar a gestionar sus plazas 
                y ser parte de esta importante etapa en la formación de futuros profesionales.</p>

                <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    <p style="margin: 0;">¡Gracias por ser parte de nuestra red de empresas colaboradoras!</p>
                </div>
            </div>
        `
    }),
    empresaRechazada: (nombreEmpresa: string) => ({
        subject: 'Resultado de evaluación en CHECKINTIN',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1a237e;">Notificación Importante</h2>
                
                <p>Estimados representantes de ${nombreEmpresa},</p>

                <p>Agradecemos su interés en formar parte del programa de pasantías del 
                Instituto Politécnico Industrial de Santiago (IPISA).</p>

                <p>Después de una cuidadosa evaluación, lamentamos informarle que en este momento 
                su empresa no cumple con los requisitos mínimos establecidos para participar 
                en nuestro programa de pasantías.</p>

                <p>Le invitamos a:</p>
                <ul>
                    <li>Revisar nuestros requisitos y criterios de evaluación</li>
                    <li>Realizar las adecuaciones necesarias</li>
                    <li>Presentar una nueva solicitud en el futuro</li>
                </ul>

                <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    <p style="margin: 0;">Si tiene alguna duda o desea más información sobre los requisitos, 
                    no dude en contactarnos.</p>
                </div>
            </div>
        `
    })
};

export const sendValidacionEmail = async (
    emailDestino: string,
    nombreEmpresa: string,
    esAceptada: boolean
) => {
    try {
        const template = esAceptada 
            ? emailTemplates.empresaAceptada(nombreEmpresa)
            : emailTemplates.empresaRechazada(nombreEmpresa);

        await transporter.sendMail({
            from: '"CHECKINTIN - IPISA" <noreply@checkintin.com>',
            to: emailDestino,
            subject: template.subject,
            html: template.html
        });

        return { success: true };
    } catch (error) {
        console.error('Error enviando email:', error);
        return { success: false, error };
    }
}; 