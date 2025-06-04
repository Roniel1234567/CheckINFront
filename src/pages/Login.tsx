import React, { useState, useEffect } from 'react';
import '../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainAppBar from '../components/MainAppBar';
import Footer from '../components/Footer';
import { authService } from '../services/authService';

const Login = () => {
  const theme = MUI.useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [formData, setFormData] = useState({
    dato_usuario: '',
    contrasena_usuario: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [portalPosition, setPortalPosition] = useState({ x: 0, y: 0 });
  const welcomeText = '¡Bienvenido!';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Iniciar animaciones
    setTimeout(() => setShowContent(true), 100);

    // Efecto de typing
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= welcomeText.length) {
        setTypedText(welcomeText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 150);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(typeInterval);
    };
  }, []);

  // Redirigir a /Principal si el usuario está en /Login y presiona atrás
  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === '/Login') {
        navigate('/Principal', { replace: true });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.dato_usuario || !formData.contrasena_usuario) {
      toast.error('Por favor, complete todos los campos', {
        position: "top-center",
        autoClose: 3000
      });
      setIsLoading(false);
      return;
    }

    try {
      await authService.login(formData);
      const user = authService.getCurrentUser();
      if (!user) {
        toast.error('No se pudo obtener la información del usuario.', {
          position: "top-center",
          autoClose: false
        });
        return;
      }

      toast.success('¡Inicio de sesión exitoso!', {
        position: "top-center",
        autoClose: 2000
      });

      // Redirigir según el rol
      if (user.rol === 1 || user.rol === 3) { // Estudiante o Tutor
        navigate('/pasantias');
      } else if (user.rol === 2) { // Empresa
        navigate('/plazas');
      } else if (user.rol === 4 || user.rol === 5) { // Administrador u Observador
        navigate('/dashboard');
      } else {
        navigate(location.state?.from?.pathname || '/dashboard');
      }
    } catch (error: unknown) {
      console.error('Error en login:', error);
      
      // Manejar diferentes tipos de errores
      if (error instanceof Error) {
        if (error.message === 'Usuario no disponible') {
          toast.error('Esta cuenta no está disponible.', {
            position: "top-center",
            autoClose: false
          });
        } else {
          // Verificar si es un error de axios
          const axiosError = error as { response?: { data?: { message?: string } } };
          const errorMessage = axiosError.response?.data?.message || 'Error al iniciar sesión';
          
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: false
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPortalPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/recuperar-contrasena');
    }, 1000);
  };

  const handleCompanyRegister = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPortalPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/registro-centro');
    }, 1000);
  };

  const parallaxOffset = scrollPosition * 0.3;

  return (
    <MUI.Box sx={{ 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      background: '#1a365d',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <MainAppBar />

      {/* Elementos decorativos animados con parallax */}
      {[...Array(5)].map((_, i) => (
        <MUI.Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: '200px', md: '400px' },
            height: { xs: '200px', md: '400px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${MUI.alpha(theme.palette.primary.main, 0.03)} 0%, ${MUI.alpha(theme.palette.primary.main, 0)} 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `translate(-50%, calc(-50% + ${parallaxOffset * (i + 1)}px))`,
            transition: 'transform 0.3s ease-out',
            animation: 'float 30s infinite',
            animationDelay: `${i * 4}s`,
            pointerEvents: 'none',
            zIndex: 0,
            '@keyframes float': {
              '0%, 100%': {
                transform: `translate(-50%, calc(-50% + ${parallaxOffset * (i + 1)}px))`,
              },
              '50%': {
                transform: `translate(-50%, calc(-50% + ${parallaxOffset * (i + 1) + 40}px))`,
              },
            },
          }}
        />
      ))}

      {/* Efecto de estela del cursor */}
      <MUI.Box
        sx={{
          position: 'fixed',
          width: { xs: '200px', md: '300px' },
          height: { xs: '200px', md: '300px' },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${MUI.alpha('#F7E8AB', 0.15)} 0%, rgba(255,255,255,0) 70%)`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'all 0.5s ease',
          left: mousePosition.x,
          top: mousePosition.y,
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `2px solid ${MUI.alpha('#F7E8AB', 0.1)}`,
            animation: 'pulse 2s infinite',
          },
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(1.5)',
              opacity: 0,
            },
          },
        }}
      />

      <MUI.Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: { xs: '80px', sm: '90px', md: '100px' },
          px: { xs: 2, sm: 3, md: 3 },
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MUI.Fade in={showContent} timeout={1000}>
          <MUI.Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              width: '100%',
              maxWidth: '450px',
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: { xs: '1rem', md: '2rem' },
              background: `linear-gradient(135deg, ${MUI.alpha(theme.palette.primary.main, 0.15)} 0%, ${MUI.alpha(theme.palette.primary.light, 0.2)} 100%)`,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transform: `translateY(${-parallaxOffset * 0.2}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <MUI.Box sx={{ textAlign: 'center', mb: 4 }}>
              <MUI.Typography
                variant="h3"
                sx={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    width: '50px',
                    height: '4px',
                    background: '#ffffff',
                    transform: 'translateX(-50%)',
                    borderRadius: '2px',
                  }
                }}
              >
                {typedText}
                <span 
                  style={{ 
                    borderRight: '0.15em solid #fff',
                    animation: 'blink-caret 0.75s step-end infinite',
                  }}
                >
                  &nbsp;
                </span>
              </MUI.Typography>
              <style>
                {`
                  @keyframes blink-caret {
                    from, to { border-color: transparent }
                    50% { border-color: #fff }
                  }
                `}
              </style>
              <MUI.Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  opacity: 0.9,
                  mb: 3,
                  mt: 4
                }}
              >
                Accede a tu cuenta para gestionar las pasantías
              </MUI.Typography>
            </MUI.Box>

            <MUI.Box sx={{ mb: 3 }}>
              <MUI.TextField
                fullWidth
                label="Usuario"
                name="dato_usuario"
                variant="outlined"
                value={formData.dato_usuario}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.Person sx={{ color: 'white' }} />
                    </MUI.InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .Mui-focused .MuiInputLabel-root': {
                    color: 'white',
                  },
                }}
              />
              <MUI.TextField
                fullWidth
                label="Contraseña"
                name="contrasena_usuario"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.contrasena_usuario}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.Lock sx={{ color: 'white' }} />
                    </MUI.InputAdornment>
                  ),
                  endAdornment: (
                    <MUI.InputAdornment position="end">
                      <MUI.IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'white' }}
                      >
                        {showPassword ? <Icons.VisibilityOff /> : <Icons.Visibility />}
                      </MUI.IconButton>
                    </MUI.InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .Mui-focused .MuiInputLabel-root': {
                    color: 'white',
                  },
                }}
              />
            </MUI.Box>

            <MUI.Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                borderRadius: '2rem',
                fontSize: '1.1rem',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.2)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: isLoading ? 'loading 1.5s infinite' : 'none',
                },
                '@keyframes loading': {
                  '0%': {
                    transform: 'translateX(0)',
                  },
                  '100%': {
                    transform: 'translateX(200%)',
                  },
                },
              }}
            >
              {isLoading ? (
                <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MUI.CircularProgress size={20} color="inherit" />
                  <span>Iniciando sesión...</span>
                </MUI.Box>
              ) : (
                'Iniciar Sesión'
              )}
            </MUI.Button>

            <MUI.Box sx={{ mt: 3, textAlign: 'center' }}>
              <MUI.Stack spacing={2}>
                <MUI.Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  ¿Olvidaste tu contraseña?{' '}
                  <MUI.Link 
                    component="span" 
                    onClick={handleForgotPassword}
                    sx={{ 
                      color: '#ffffff !important',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      position: 'relative',
                      '&:hover': {
                        color: 'rgba(255, 255, 255, 0.8) !important'
                      }
                    }}
                  >
                    Recupérala aquí
                  </MUI.Link>
                </MUI.Typography>

                <MUI.Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  ¿Eres una empresa?{' '}
                  <MUI.Link 
                    component="span" 
                    onClick={handleCompanyRegister}
                    sx={{ 
                      color: '#ffffff !important',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      position: 'relative',
                      '&:hover': {
                        color: 'rgba(255, 255, 255, 0.8) !important'
                      }
                    }}
                  >
                    Regístrate aquí
                  </MUI.Link>
                </MUI.Typography>
              </MUI.Stack>
            </MUI.Box>
          </MUI.Box>
        </MUI.Fade>
      </MUI.Box>
      <Footer />

      {/* Portal animation overlay */}
      <MUI.Fade in={isNavigating}>
        <MUI.Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: portalPosition.y,
              left: portalPosition.x,
              width: isNavigating ? '300vw' : '0',
              height: isNavigating ? '300vh' : '0',
              background: `radial-gradient(circle at center, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.primary.main} 100%)`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: portalPosition.y,
              left: portalPosition.x,
              width: isNavigating ? '200vw' : '0',
              height: isNavigating ? '200vh' : '0',
              background: `radial-gradient(circle at center, transparent 0%, ${theme.palette.secondary.main} 100%)`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: 0.3,
            }
          }}
        />
      </MUI.Fade>
    </MUI.Box>
  );
};

export default Login; 