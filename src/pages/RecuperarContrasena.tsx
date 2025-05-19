import { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

function RecuperarContrasena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  
  // Obtener token de ambos posibles lugares
  const queryToken = searchParams.get('token');
  const routeToken = params.token;
  const token = routeToken || queryToken;
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step] = useState(token ? 'reset' : 'request');
  
  const [requestData, setRequestData] = useState({
    email: '',
    usuario: ''
  });
  
  const [resetData, setResetData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestData.email && !requestData.usuario) {
      toast.error('Por favor ingrese un correo electrónico o nombre de usuario');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(requestData);
      toast.success('Si el correo existe, recibirás un enlace para restablecer tu contraseña', {
        position: "top-center",
        autoClose: false
      });
      setRequestData({ email: '', usuario: '' });
    } catch (error: unknown) {
      console.error('Error al solicitar recuperación:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token inválido o expirado');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (resetData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: resetData.newPassword
      });
      
      toast.success('¡Contraseña restablecida exitosamente!', {
        position: "top-center",
        autoClose: 3000
      });
      
      // Redirigir a la página principal después de un breve retraso
      setTimeout(() => {
        navigate('/Principal');
      }, 2000);
    } catch (error: unknown) {
      console.error('Error al restablecer contraseña:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MUI.Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <MUI.Container maxWidth="sm">
        <MUI.Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <MUI.Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <Icons.LockReset />
          </MUI.Avatar>

          <MUI.Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            {step === 'request' ? 'Recuperar Contraseña' : 'Restablecer Contraseña'}
          </MUI.Typography>

          {step === 'request' ? (
            <MUI.Box component="form" onSubmit={handleRequestSubmit} sx={{ width: '100%' }}>
              <MUI.TextField
                margin="normal"
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                type="email"
                autoComplete="email"
                value={requestData.email}
                onChange={handleRequestChange}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <MUI.Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                O
              </MUI.Typography>

              <MUI.TextField
                margin="normal"
                fullWidth
                id="usuario"
                label="Nombre de Usuario"
                name="usuario"
                autoComplete="username"
                value={requestData.usuario}
                onChange={handleRequestChange}
                disabled={loading}
                sx={{ mb: 3 }}
              />

              <MUI.Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  position: 'relative'
                }}
              >
                {loading ? (
                  <MUI.CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px'
                    }}
                  />
                ) : (
                  'Enviar Solicitud'
                )}
              </MUI.Button>

              <MUI.Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Volver al Login
              </MUI.Button>
            </MUI.Box>
          ) : (
            <MUI.Box component="form" onSubmit={handleResetSubmit} sx={{ width: '100%' }}>
              <MUI.TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="Nueva Contraseña"
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                autoComplete="new-password"
                value={resetData.newPassword}
                onChange={handleResetChange}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <MUI.InputAdornment position="end">
                      <MUI.IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <Icons.VisibilityOff /> : <Icons.Visibility />}
                      </MUI.IconButton>
                    </MUI.InputAdornment>
                  )
                }}
              />

              <MUI.TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={resetData.confirmPassword}
                onChange={handleResetChange}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <MUI.InputAdornment position="end">
                      <MUI.IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <Icons.VisibilityOff /> : <Icons.Visibility />}
                      </MUI.IconButton>
                    </MUI.InputAdornment>
                  )
                }}
              />

              <MUI.Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  position: 'relative'
                }}
              >
                {loading ? (
                  <MUI.CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px'
                    }}
                  />
                ) : (
                  'Restablecer Contraseña'
                )}
              </MUI.Button>

              <MUI.Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Volver al Login
              </MUI.Button>
            </MUI.Box>
          )}
        </MUI.Paper>
      </MUI.Container>
    </MUI.Box>
  );
}

export default RecuperarContrasena; 