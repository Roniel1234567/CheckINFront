import { useState, useEffect } from 'react';
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
  
  // Estado para el carrusel de imágenes
  const [activeStep, setActiveStep] = useState(0);
  
  // Imágenes para el carrusel - usando las mismas que en Login.tsx
  const carouselImages = [
    {
      img: "https://a.storyblok.com/f/272924/6000x4000/ff74b6c2f9/img_6364.JPG/m/4400x0/filters:format(webp):quality(auto:best)",
      title: "Excelencia Académica",
      description: "Formando profesionales técnicos de alto nivel"
    },
    {
      img: "https://a.storyblok.com/f/272924/6000x4000/821f974af7/img_6392.JPG/m/4400x0/filters:format(webp):quality(auto:best)",
      title: "Innovación Educativa",
      description: "Tecnología de vanguardia en nuestras instalaciones"
    },
    {
      img: "https://a.storyblok.com/f/272924/6000x4000/ba2ae85481/portrait-2.jpg/m/2400x0/filters:format(webp):quality(auto:best)",
      title: "Futuro Profesional",
      description: "Preparando líderes para el mañana"
    }
  ];
  
  // Configurar el cambio automático de imágenes cada 5 segundos
  useEffect(() => {
    const autoPlayInterval = setInterval(() => {
      setActiveStep((prevActiveStep) => (prevActiveStep + 1) % carouselImages.length);
    }, 5000);
    
    return () => {
      clearInterval(autoPlayInterval);
    };
  }, [carouselImages.length]);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % carouselImages.length);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => 
      prevActiveStep === 0 ? carouselImages.length - 1 : prevActiveStep - 1
    );
  };
  
  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };
  
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

  // Estilos comunes para botones primarios
  const primaryButtonStyle = {
    mt: 2,
    mb: 2,
    py: 1.5,
    position: 'relative',
    background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
    borderRadius: 2,
    boxShadow: '0 4px 10px rgba(26, 35, 126, 0.4)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(45deg, #0d1b60 30%, #1a237e 90%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 15px rgba(26, 35, 126, 0.5)'
    }
  };

  // Estilos comunes para botones secundarios
  const secondaryButtonStyle = {
    mt: 1,
    py: 1.5,
    borderColor: '#1a237e',
    color: '#1a237e',
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'rgba(26, 35, 126, 0.04)',
      borderColor: '#0d1b60'
    }
  };

  return (
    <MUI.Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: 0
      }}
    >
      {/* Elementos decorativos del fondo */}
      <MUI.Box 
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: MUI.alpha('#1a237e', 0.1),
          display: { xs: 'none', md: 'block' }
        }}
      />
      <MUI.Box 
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: MUI.alpha('#1a237e', 0.08),
          display: { xs: 'none', md: 'block' }
        }}
      />
      <MUI.Box 
        sx={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: MUI.alpha('#1a237e', 0.05),
          display: { xs: 'none', md: 'block' }
        }}
      />
      
      {/* Iconos decorativos relacionados con la escuela */}
      <MUI.Box 
        sx={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          opacity: 0.1,
          transform: 'rotate(-15deg)',
          display: { xs: 'none', lg: 'block' }
        }}
      >
        <Icons.School sx={{ fontSize: 100, color: '#1a237e' }} />
      </MUI.Box>
      <MUI.Box 
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          opacity: 0.1,
          transform: 'rotate(15deg)',
          display: { xs: 'none', lg: 'block' }
        }}
      >
        <Icons.Engineering sx={{ fontSize: 120, color: '#1a237e' }} />
      </MUI.Box>
      <MUI.Box 
        sx={{
          position: 'absolute',
          top: '60%',
          left: '10%',
          opacity: 0.1,
          transform: 'rotate(20deg)',
          display: { xs: 'none', lg: 'block' }
        }}
      >
        <Icons.Architecture sx={{ fontSize: 90, color: '#1a237e' }} />
      </MUI.Box>

      {/* Contenedor central con dos columnas */}
      <MUI.Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: '1200px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
          px: 2,
          py: { xs: 4, sm: 6 },
          zIndex: 5
        }}
      >
        {/* Columna izquierda con formulario */}
        <MUI.Box
          sx={{
            width: { xs: '100%', md: '50%' },
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Header con Logo */}
          <MUI.Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 4,
            textAlign: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            width: '100%'
          }}>
            <MUI.Avatar
              src="https://storage.googleapis.com/educoco2020/82/foto_empresa/logo_821663703399_1663703399V19BCd9KY1u6alR.png"
              sx={{ 
                width: { xs: 80, sm: 90, md: 100 }, 
                height: { xs: 80, sm: 90, md: 100 },
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}
            />
            <MUI.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-start' } }}>
              <MUI.Typography 
                variant="h4" 
                sx={{ 
                  color: '#1a237e', 
                  fontWeight: 700,
                  textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                IPISA
              </MUI.Typography>
              <MUI.Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500
                }}
              >
                Instituto Politécnico Industrial de Santiago
              </MUI.Typography>
            </MUI.Box>
          </MUI.Box>

          {/* Formulario */}
          <MUI.Paper
            elevation={8}
            sx={{
              p: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 3,
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '8px',
                height: '100%',
                background: 'linear-gradient(to bottom, #1a237e, #3949ab)',
              },
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
              animation: 'fadeIn 0.6s ease-out',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(30px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              },
              zIndex: 2
            }}
          >
            {/* Banner superior decorativo */}
            <MUI.Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '6px',
                background: 'linear-gradient(90deg, #1a237e, #3949ab, #1a237e)',
              }}
            />

            <MUI.Avatar 
              sx={{ 
                m: 1, 
                bgcolor: '#1a237e', 
                width: 70, 
                height: 70,
                boxShadow: '0 8px 16px rgba(26, 35, 126, 0.25)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(26, 35, 126, 0.5)'
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(26, 35, 126, 0)'
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(26, 35, 126, 0)'
                  }
                }
              }}
            >
              <Icons.LockReset sx={{ fontSize: 35 }} />
            </MUI.Avatar>

            <MUI.Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                mb: 1, 
                color: '#1a237e',
                fontWeight: 700,
                textAlign: 'center'
              }}
            >
              {step === 'request' ? 'Recuperar Contraseña' : 'Restablecer Contraseña'}
            </MUI.Typography>
            
            <MUI.Typography 
              variant="body1" 
              color="text.secondary" 
              align="center" 
              sx={{ mb: 3, maxWidth: '400px' }}
            >
              {step === 'request' 
                ? 'Introduce tu correo electrónico o nombre de usuario para recuperar tu acceso' 
                : 'Ingresa tu nueva contraseña para actualizar tu cuenta'}
            </MUI.Typography>

            {step === 'request' ? (
              <MUI.Box component="form" onSubmit={handleRequestSubmit} sx={{ width: '100%' }}>
                <MUI.Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    bgcolor: MUI.alpha('#e3f2fd', 0.5),
                    borderRadius: 2,
                    p: 2
                  }}
                >
                  <Icons.Info sx={{ color: '#1565c0', mr: 1 }} />
                  <MUI.Typography variant="body2">
                    Puedes usar tu correo electrónico o nombre de usuario para recuperar tu contraseña.
                  </MUI.Typography>
                </MUI.Box>
              
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
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1a237e',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <MUI.InputAdornment position="start">
                        <Icons.Email sx={{ color: '#1a237e' }} />
                      </MUI.InputAdornment>
                    ),
                  }}
                />

                <MUI.Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  margin: '20px 0'
                }}>
                  <MUI.Divider sx={{ flexGrow: 1 }} />
                  <MUI.Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ px: 2, fontWeight: 500 }}
                  >
                    O
                  </MUI.Typography>
                  <MUI.Divider sx={{ flexGrow: 1 }} />
                </MUI.Box>

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
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1a237e',
                      },
                    } 
                  }}
                  InputProps={{
                    startAdornment: (
                      <MUI.InputAdornment position="start">
                        <Icons.Person sx={{ color: '#1a237e' }} />
                      </MUI.InputAdornment>
                    ),
                  }}
                />

                <MUI.Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={primaryButtonStyle}
                >
                  {loading ? (
                    <MUI.CircularProgress
                      size={24}
                      sx={{
                        color: 'white',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px'
                      }}
                    />
                  ) : (
                    <>
                      <Icons.Send sx={{ mr: 1 }} /> 
                      Enviar Solicitud
                    </>
                  )}
                </MUI.Button>

                <MUI.Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  disabled={loading}
                  sx={secondaryButtonStyle}
                  startIcon={<Icons.ArrowBack />}
                >
                  Volver al Login
                </MUI.Button>
                
                <MUI.Box sx={{ mt: 3, textAlign: 'center' }}>
                  <MUI.Typography variant="body2" color="text.secondary">
                    ¿Problemas con la recuperación? Contacta al administrador del sistema
                  </MUI.Typography>
                </MUI.Box>
              </MUI.Box>
            ) : (
              <MUI.Box component="form" onSubmit={handleResetSubmit} sx={{ width: '100%' }}>
                <MUI.Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2
                  }}
                  icon={<Icons.InfoOutlined />}
                >
                  Tu contraseña debe tener al menos 6 caracteres y ser segura.
                </MUI.Alert>
                
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
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1a237e',
                      },
                    } 
                  }}
                  InputProps={{
                    startAdornment: (
                      <MUI.InputAdornment position="start">
                        <Icons.Lock sx={{ color: '#1a237e' }} />
                      </MUI.InputAdornment>
                    ),
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
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1a237e',
                      },
                    } 
                  }}
                  InputProps={{
                    startAdornment: (
                      <MUI.InputAdornment position="start">
                        <Icons.LockReset sx={{ color: '#1a237e' }} />
                      </MUI.InputAdornment>
                    ),
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

                <MUI.Box sx={{ 
                  mt: 3, 
                  mb: 2,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1
                }}>
                  {resetData.newPassword && resetData.confirmPassword && (
                    resetData.newPassword === resetData.confirmPassword ? (
                      <MUI.Chip 
                        color="success" 
                        icon={<Icons.CheckCircle />} 
                        label="Las contraseñas coinciden" 
                        variant="outlined" 
                        sx={{ borderRadius: 1 }}
                      />
                    ) : (
                      <MUI.Chip 
                        color="warning" 
                        icon={<Icons.Warning />} 
                        label="Las contraseñas no coinciden" 
                        variant="outlined"
                        sx={{ borderRadius: 1 }}  
                      />
                    )
                  )}
                  
                  {resetData.newPassword && resetData.newPassword.length < 6 && (
                    <MUI.Chip 
                      color="error" 
                      icon={<Icons.Warning />} 
                      label="Mínimo 6 caracteres" 
                      variant="outlined"
                      sx={{ borderRadius: 1 }}  
                    />
                  )}
                </MUI.Box>

                <MUI.Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{...primaryButtonStyle, mt: 3}}
                >
                  {loading ? (
                    <MUI.CircularProgress
                      size={24}
                      sx={{
                        color: 'white',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px'
                      }}
                    />
                  ) : (
                    <>
                      <Icons.LockReset sx={{ mr: 1 }} /> 
                      Restablecer Contraseña
                    </>
                  )}
                </MUI.Button>

                <MUI.Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  disabled={loading}
                  sx={secondaryButtonStyle}
                  startIcon={<Icons.ArrowBack />}
                >
                  Volver al Login
                </MUI.Button>
              </MUI.Box>
            )}
          </MUI.Paper>

          {/* Footer */}
          <MUI.Box 
            component="footer" 
            sx={{ 
              mt: 4, 
              textAlign: 'center',
              width: '100%',
              zIndex: 2
            }}
          >
            <MUI.Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              © {new Date().getFullYear()} IPISA - Instituto Politécnico Industrial de Santiago
            </MUI.Typography>
            <MUI.Typography variant="caption" color="text.secondary">
              Todos los derechos reservados
            </MUI.Typography>
          </MUI.Box>
        </MUI.Box>

        {/* Columna derecha con carrusel - Visible en md y superior */}
        <MUI.Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: { md: '50%' },
            maxWidth: '500px'
          }}
        >
          {/* Carrusel */}
          <MUI.Paper
            elevation={8}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
              height: 450,
              position: 'relative'
            }}
          >
            {/* Imágenes del carrusel */}
            {carouselImages.map((image, index) => (
              <MUI.Box
                key={index}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: activeStep === index ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  zIndex: activeStep === index ? 1 : 0,
                }}
              >
                <img
                  src={image.img}
                  alt={image.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Overlay con texto */}
                <MUI.Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(26, 35, 126, 0.7)',
                    padding: 2,
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  <MUI.Typography variant="h6">{image.title}</MUI.Typography>
                  <MUI.Typography variant="body2">{image.description}</MUI.Typography>
                </MUI.Box>
              </MUI.Box>
            ))}

            {/* Botones de navegación */}
            <MUI.IconButton
              onClick={handleBack}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                color: '#1a237e',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                },
                zIndex: 2,
              }}
            >
              <Icons.ArrowBackIos />
            </MUI.IconButton>
            <MUI.IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                color: '#1a237e',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                },
                zIndex: 2,
              }}
            >
              <Icons.ArrowForwardIos />
            </MUI.IconButton>
          </MUI.Paper>

          {/* Indicadores de carrusel */}
          <MUI.Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
            }}
          >
            {carouselImages.map((_, index) => (
              <MUI.Box
                key={index}
                onClick={() => handleStepChange(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  margin: '0 4px',
                  bgcolor: activeStep === index ? '#1a237e' : '#bdbdbd',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: activeStep === index ? '#1a237e' : '#9e9e9e',
                    transform: 'scale(1.2)',
                  },
                }}
              />
            ))}
          </MUI.Box>

          {/* Información adicional */}
          <MUI.Paper
            elevation={3}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <MUI.Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                textAlign: 'center', 
                color: '#1a237e',
                fontWeight: 600
              }}
            >
              ¿Por qué elegir IPISA?
            </MUI.Typography>
            
            <MUI.Stack spacing={2} mt={2}>
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Icons.School sx={{ fontSize: 30, color: '#1a237e' }} />
                <MUI.Typography variant="body2">
                  <strong>Excelencia Académica</strong> - Programas educativos de calidad
                </MUI.Typography>
              </MUI.Box>
              
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Icons.Engineering sx={{ fontSize: 30, color: '#1a237e' }} />
                <MUI.Typography variant="body2">
                  <strong>Formación Práctica</strong> - Talleres equipados con tecnología actual
                </MUI.Typography>
              </MUI.Box>
              
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Icons.Groups sx={{ fontSize: 30, color: '#1a237e' }} />
                <MUI.Typography variant="body2">
                  <strong>Comunidad Activa</strong> - Ambiente colaborativo y de apoyo
                </MUI.Typography>
              </MUI.Box>
            </MUI.Stack>
          </MUI.Paper>
        </MUI.Box>
      </MUI.Box>
      
      {/* Ilustraciones relacionadas con la educación */}
      <MUI.Box 
        sx={{ 
          display: { xs: 'none', lg: 'flex' },
          position: 'absolute',
          bottom: { lg: '15%', xl: '20%' },
          left: { lg: '10%', xl: '15%' },
          alignItems: 'center',
          opacity: 0.8,
          zIndex: 1
        }}
      >
        <Icons.AutoStories sx={{ fontSize: 60, color: '#1a237e', opacity: 0.4 }} />
      </MUI.Box>
      
      <MUI.Box 
        sx={{ 
          display: { xs: 'none', lg: 'flex' },
          position: 'absolute',
          top: { lg: '15%', xl: '20%' },
          right: { lg: '10%', xl: '15%' },
          alignItems: 'center',
          opacity: 0.8,
          zIndex: 1
        }}
      >
        <Icons.CalculateOutlined sx={{ fontSize: 60, color: '#1a237e', opacity: 0.4 }} />
      </MUI.Box>
    </MUI.Container>
  );
}

export default RecuperarContrasena; 