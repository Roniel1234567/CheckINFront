import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import '../styles/login.scss';
import Footer from '../components/Footer';

const features = [
  {
    icon: <Icons.EmojiEvents sx={{ fontSize: 40, color: '#1a237e' }} />,
    title: 'Excelencia Académica',
    description: 'Programas de estudio reconocidos y certificados'
  },
  {
    icon: <Icons.Groups sx={{ fontSize: 40, color: '#1a237e' }} />,
    title: 'Comunidad Activa',
    description: 'Ambiente colaborativo y de apoyo mutuo'
  },
  {
    icon: <Icons.Engineering sx={{ fontSize: 40, color: '#1a237e' }} />,
    title: 'Formación Práctica',
    description: 'Talleres y laboratorios equipados'
  }
];

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    dato_usuario: '',
    contrasena_usuario: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dato_usuario || !formData.contrasena_usuario) {
      setError('Por favor, complete todos los campos');
      return;
    }

    try {
      const response = await loginUser(formData);
      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/Principal');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al iniciar sesión');
      }
    }
  };

  return (
    <div className="login-container">
      <MUI.Container maxWidth="lg" sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        minHeight: '100vh',
        py: 4
      }}>
        {/* Header con Logo */}
        <MUI.Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 4,
          textAlign: 'center'
        }}>
          <MUI.Avatar
            src="https://storage.googleapis.com/educoco2020/82/foto_empresa/logo_821663703399_1663703399V19BCd9KY1u6alR.png"
            sx={{ width: 60, height: 60 }}
          />
          <MUI.Box>
            <MUI.Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 600 }}>
              IPISA
            </MUI.Typography>
            <MUI.Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Instituto Politécnico Industrial de Santiago
            </MUI.Typography>
          </MUI.Box>
        </MUI.Box>

        {/* Mensaje de Bienvenida */}
        <MUI.Typography 
          variant="h3" 
          sx={{ 
            color: '#1a237e', 
            fontWeight: 'bold', 
            mb: 2,
            textAlign: 'center'
          }}
        >
          Bienvenido a IPISA
        </MUI.Typography>
        <MUI.Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            maxWidth: '600px',
            textAlign: 'center',
            mb: 4
          }}
        >
          El Instituto Politécnico Industrial de Santiago es una institución educativa comprometida con la excelencia académica y la formación integral de profesionales técnicos.
        </MUI.Typography>

        {/* Formulario de Login */}
        <MUI.Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            width: '100%', 
            maxWidth: '400px',
            mb: 6
          }}
        >
          <MUI.Box component="form" onSubmit={handleSubmit}>
            <MUI.Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                color: '#1a237e',
                textAlign: 'center'
              }}
            >
              Iniciar Sesión
            </MUI.Typography>

            {error && (
              <MUI.Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </MUI.Alert>
            )}

            <MUI.Stack spacing={3}>
              <MUI.TextField
                fullWidth
                label="Usuario"
                name="dato_usuario"
                value={formData.dato_usuario}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.Person sx={{ color: '#1a237e' }} />
                    </MUI.InputAdornment>
                  ),
                }}
              />

              <MUI.TextField
                fullWidth
                label="Contraseña"
                name="contrasena_usuario"
                type={showPassword ? 'text' : 'password'}
                value={formData.contrasena_usuario}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.Lock sx={{ color: '#1a237e' }} />
                    </MUI.InputAdornment>
                  ),
                  endAdornment: (
                    <MUI.InputAdornment position="end">
                      <MUI.IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <Icons.VisibilityOff /> : <Icons.Visibility/>}
                      </MUI.IconButton>
                    </MUI.InputAdornment>
                  ),
                }}
              />

              <MUI.Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  bgcolor: '#1a237e',
                  '&:hover': { bgcolor: '#0d1b60' },
                  py: 1.5
                }}
              >
                Ingresar
              </MUI.Button>
            </MUI.Stack>
          </MUI.Box>
        </MUI.Paper>

        {/* Sección de Imágenes */}
        <MUI.Grid container spacing={3} sx={{ mb: 6 }}>
          <MUI.Grid item xs={12} md={4}>
            <MUI.Paper 
              elevation={2} 
              sx={{ 
                height: '300px',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  '& .image-overlay': {
                    opacity: 0.8,
                  },
                },
              }}
            >
              <img
                src="https://a.storyblok.com/f/272924/6000x4000/ff74b6c2f9/img_6364.JPG/m/4400x0/filters:format(webp):quality(auto:best)"
                alt="Excelencia Académica"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <MUI.Box
                className="image-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(26, 35, 126, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  p: 3,
                }}
              >
                <Icons.School sx={{ fontSize: 40, color: 'white', mb: 2 }} />
                <MUI.Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                  Excelencia Académica
                </MUI.Typography>
                <MUI.Typography variant="body2" sx={{ color: 'white', textAlign: 'center', mt: 1 }}>
                  Formando profesionales técnicos de alto nivel
                </MUI.Typography>
              </MUI.Box>
            </MUI.Paper>
          </MUI.Grid>
          <MUI.Grid item xs={12} md={4}>
            <MUI.Paper 
              elevation={2} 
              sx={{ 
                height: '300px',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  '& .image-overlay': {
                    opacity: 0.8,
                  },
                },
              }}
            >
              <img
                src="https://a.storyblok.com/f/272924/6000x4000/821f974af7/img_6392.JPG/m/4400x0/filters:format(webp):quality(auto:best)"
                alt="Innovación Educativa"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <MUI.Box
                className="image-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(26, 35, 126, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  p: 3,
                }}
              >
                <Icons.Lightbulb sx={{ fontSize: 40, color: 'white', mb: 2 }} />
                <MUI.Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                  Innovación Educativa
                </MUI.Typography>
                <MUI.Typography variant="body2" sx={{ color: 'white', textAlign: 'center', mt: 1 }}>
                  Tecnología de vanguardia en nuestras instalaciones
                </MUI.Typography>
              </MUI.Box>
            </MUI.Paper>
          </MUI.Grid>
          <MUI.Grid item xs={12} md={4}>
            <MUI.Paper 
              elevation={2} 
              sx={{ 
                height: '300px',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  '& .image-overlay': {
                    opacity: 0.8,
                  },
                },
              }}
            >
              <img
                src="https://a.storyblok.com/f/272924/6000x4000/ba2ae85481/portrait-2.jpg/m/2400x0/filters:format(webp):quality(auto:best)"
                alt="Futuro Profesional"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <MUI.Box
                className="image-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(26, 35, 126, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  p: 3,
                }}
              >
                <Icons.Star sx={{ fontSize: 40, color: 'white', mb: 2 }} />
                <MUI.Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                  Futuro Profesional
                </MUI.Typography>
                <MUI.Typography variant="body2" sx={{ color: 'white', textAlign: 'center', mt: 1 }}>
                  Preparando líderes para el mañana
                </MUI.Typography>
              </MUI.Box>
            </MUI.Paper>
          </MUI.Grid>
        </MUI.Grid>

        {/* Estadísticas */}
        <MUI.Grid container spacing={3} sx={{ mb: 6 }}>
          <MUI.Grid item xs={12} sm={4}>
            <MUI.Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                bgcolor: MUI.alpha('#1a237e', 0.05)
              }}
            >
              <MUI.Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                32+
              </MUI.Typography>
              <MUI.Typography variant="body1" color="text.secondary">
                Años de Experiencia
              </MUI.Typography>
            </MUI.Paper>
          </MUI.Grid>
          <MUI.Grid item xs={12} sm={4}>
            <MUI.Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                bgcolor: MUI.alpha('#1a237e', 0.05)
              }}
            >
              <MUI.Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                700+
              </MUI.Typography>
              <MUI.Typography variant="body1" color="text.secondary">
                Estudiantes
              </MUI.Typography>
            </MUI.Paper>
          </MUI.Grid>
          <MUI.Grid item xs={12} sm={4}>
            <MUI.Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                bgcolor: MUI.alpha('#1a237e', 0.05)
              }}
            >
              <MUI.Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                8+
              </MUI.Typography>
              <MUI.Typography variant="body1" color="text.secondary">
                Carreras Técnicas
              </MUI.Typography>
            </MUI.Paper>
          </MUI.Grid>
        </MUI.Grid>

        {/* Características */}
        <MUI.Grid container spacing={3} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <MUI.Grid item xs={12} md={4} key={index}>
              <MUI.Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  height: '100%',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                {feature.icon}
                <MUI.Typography variant="h6" sx={{ mt: 2, color: '#1a237e' }}>
                  {feature.title}
                </MUI.Typography>
                <MUI.Typography variant="body2" color="text.secondary">
                  {feature.description}
                </MUI.Typography>
              </MUI.Paper>
            </MUI.Grid>
          ))}
        </MUI.Grid>

        {/* Footer */}
        <Footer />
      </MUI.Container>
    </div>
  );
}

export default Login; 