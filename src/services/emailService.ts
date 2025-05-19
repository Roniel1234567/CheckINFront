import nodemailer from 'nodemailer';

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Función para enviar correo de restablecimiento de contraseña
export const sendPasswordResetEmail = async (toEmail: string, token: string): Promise<boolean> => {
  try {
    // URL frontend para restablecer contraseña - Usar variable de entorno o hardcoded para desarrollo
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendURL}/recuperar-contrasena?token=${token}`;

    // Opciones del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Restablecimiento de contraseña - IPISA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #1a237e; text-align: center;">Restablecimiento de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña en el sistema de IPISA. Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #1a237e; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Si no has solicitado este cambio, puedes ignorar este correo.</p>
          <p>Este enlace expirará en una hora por motivos de seguridad.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="text-align: center; font-size: 12px; color: #757575;">
            Este es un correo automático, por favor no respondas a esta dirección.
          </p>
        </div>
      `
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.response);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    return false;
  }
}; 