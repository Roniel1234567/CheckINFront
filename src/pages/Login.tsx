import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import '../styles/login.scss';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

const features = [
  {
    icon: <Icons.School sx={{ fontSize: 40 }} />,
    title: 'Excelencia Internacional',
    description: 'Programas reconocidos a nivel mundial con certificaciones internacionales'
  },
  {
    icon: <Icons.Public sx={{ fontSize: 40 }} />,
    title: 'Alcance Global',
    description: 'Conectamos estudiantes con oportunidades en todo el mundo'
  },
  {
    icon: <Icons.EmojiEvents sx={{ fontSize: 40 }} />,
    title: 'Innovación Constante',
    description: 'Tecnología de vanguardia y metodologías modernas'
  },
  {
    icon: <Icons.Engineering sx={{ fontSize: 40 }} />,
    title: 'Formación Técnica Especializada',
    description: 'Desarrollo de habilidades técnicas con equipamiento de última generación'
  },
  {
    icon: <Icons.WorkOutline sx={{ fontSize: 40 }} />,
    title: 'Inserción Laboral',
    description: 'Alta tasa de empleabilidad y convenios con empresas líderes'
  },
  {
    icon: <Icons.Lightbulb sx={{ fontSize: 40 }} />,
    title: 'Proyectos Innovadores',
    description: 'Desarrollo de soluciones creativas para problemas reales'
  },
  {
    icon: <Icons.Grade sx={{ fontSize: 40 }} />,
    title: 'Reconocimiento Internacional',
    description: 'Titulaciones con validez en múltiples países'
  },
  {
    icon: <Icons.Psychology sx={{ fontSize: 40 }} />,
    title: 'Mentalidad Emprendedora',
    description: 'Formación de líderes y creadores de empresas'
  }
];

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    dato_usuario: '',
    contrasena_usuario: ''
  });
  const [error, setError] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const [logoSpin, setLogoSpin] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Rotar las características cada 5 segundos
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Manejar el scroll en los paneles
  const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
    }
  };

  // Activar animación de giro del logo
  const handleLogoClick = () => {
    setLogoSpin(true);
    setTimeout(() => setLogoSpin(false), 1000);
  };

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
    setLoading(true);

    if (!formData.dato_usuario || !formData.contrasena_usuario) {
      setError('Por favor, complete todos los campos');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(formData);
      authService.setToken(response.token);
      
      toast.success('¡Inicio de sesión exitoso!', {
        position: "top-center",
        autoClose: 2000
      });

      // Redirigir según el rol del usuario
      switch(response.user.rol) {
        case 1: // Admin
          navigate('/dashboard');
          break;
        case 2: // Estudiante
          navigate('/dashboard-estudiante');
          break;
        case 3: // Centro
          navigate('/dashboard-centro');
          break;
        case 4: // Supervisor
          navigate('/dashboard-supervisor');
          break;
        default:
          navigate('/Principal');
      }
    } catch (error: unknown) {
      console.error('Error en login:', error);
      // Verificar si es un error de axios
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Error al iniciar sesión', {
        position: "top-center",
        autoClose: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/recuperar-contrasena');
  };

  // Scroll manual hacia arriba o abajo
  const scrollPanel = (ref: React.RefObject<HTMLDivElement>, direction: 'up' | 'down') => {
    if (!ref.current) return;
    
    const scrollAmount = 300;
    const currentPos = ref.current.scrollTop;
    const targetPos = direction === 'up' ? currentPos - scrollAmount : currentPos + scrollAmount;
    
    ref.current.scrollTo({
      top: targetPos,
      behavior: 'smooth'
    });
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-particles"></div>
      
      <MUI.Box className="login-wrapper">
        {/* Panel izquierdo con scroll */}
        <div className="login-side-panel login-left-panel">
          <div 
            className="login-panel-content login-scrollable"
            ref={leftPanelRef}
            onScroll={() => handleScroll(leftPanelRef)}
          >
            <h3>Bienvenido a IPISA</h3>
            <p className="login-panel-subtitle">Instituto Politécnico Industrial de Santiago</p>
            
            <div className="login-features-list">
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="login-feature-card">
                  <div className="login-feature-icon">{feature.icon}</div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="login-decoration">
              <Icons.School sx={{ fontSize: 60, opacity: 0.1 }} />
              <Icons.Public sx={{ fontSize: 40, opacity: 0.1 }} />
              <Icons.EmojiEvents sx={{ fontSize: 50, opacity: 0.1 }} />
            </div>
          </div>
          
          {/* Controles de scroll */}
          <div className="login-scroll-controls">
            <button 
              className="login-scroll-button" 
              onClick={() => scrollPanel(leftPanelRef, 'up')}
              aria-label="Scroll arriba"
            >
              <Icons.KeyboardArrowUp />
            </button>
            <div className="login-scroll-progress">
              <div 
                className="login-scroll-indicator" 
                style={{ height: `${scrollProgress}%` }}
              ></div>
            </div>
            <button 
              className="login-scroll-button" 
              onClick={() => scrollPanel(leftPanelRef, 'down')}
              aria-label="Scroll abajo"
            >
              <Icons.KeyboardArrowDown />
            </button>
          </div>
        </div>
        
        {/* Formulario central */}
        <div className="login-box">
          <div className="login-header">
            <div className={`login-logo-container ${logoSpin ? 'spin-fast' : ''}`}>
              <div className="login-logo-glow"></div>
              <img 
                src="https://storage.googleapis.com/educoco2020/82/foto_empresa/logo_821663703399_1663703399V19BCd9KY1u6alR.png" 
                alt="IPISA" 
                className="login-logo"
                onClick={handleLogoClick}
              />
            </div>
            <div className="login-title">
              <h1>IPISA</h1>
              <p>Instituto Politécnico Industrial de Santiago</p>
              <span className="login-title-decoration"></span>
            </div>
          </div>
          
          <div className="login-content">
            <div className="login-form-container">
              <h2>Iniciar Sesión</h2>
              
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="username">Usuario</label>
                  <div className="login-input-wrapper">
                    <Icons.Person className="login-icon" />
                    <input
                      id="username"
                      type="text"
                      name="dato_usuario"
                      value={formData.dato_usuario}
                      onChange={handleChange}
                      required
                      placeholder="Ingrese su nombre de usuario"
                      autoComplete="username"
                    />
                    <span className="login-input-focus-effect"></span>
                  </div>
                </div>
                
                <div className="login-field">
                  <label htmlFor="password">Contraseña</label>
                  <div className="login-input-wrapper">
                    <Icons.Lock className="login-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="contrasena_usuario"
                      value={formData.contrasena_usuario}
                      onChange={handleChange}
                      required
                      placeholder="Ingrese su contraseña"
                      autoComplete="current-password"
                    />
                    <span className="login-input-focus-effect"></span>
                    <button 
                      type="button" 
                      className="login-toggle-password" 
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <Icons.VisibilityOff /> : <Icons.Visibility />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  <span className="login-button-text">
                    {loading ? (
                      <MUI.CircularProgress 
                        size={24} 
                        sx={{ color: '#fff' }} 
                        aria-label="Cargando"
                      />
                    ) : 'Entrar'}
                  </span>
                  <span className="login-button-effect"></span>
                </button>
                
                <button
                  type="button"
                  className="login-forgot"
                  onClick={handleForgotPassword}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            </div>
          </div>
          
          <div className="login-footer">
            <div className="login-footer-decoration"></div>
            <p>&copy; {new Date().getFullYear()} IPISA - Sistema de Gestión</p>
          </div>
        </div>
        
        {/* Panel derecho con scroll */}
        <div className="login-side-panel login-right-panel">
          <div 
            className="login-panel-content login-scrollable"
            ref={rightPanelRef}
            onScroll={() => handleScroll(rightPanelRef)}
          >
            <h3>Formación Técnica de Calidad</h3>
            <p className="login-panel-subtitle">Excelencia en educación profesional</p>
            
            <div className="login-features-list">
              {features.slice(4).map((feature, index) => (
                <div key={index} className="login-feature-card">
                  <div className="login-feature-icon">{feature.icon}</div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="login-stats">
              <div className="login-stat-item">
                <span className="login-stat-number">40+</span>
                <span className="login-stat-label">Años de experiencia</span>
              </div>
              <div className="login-stat-item">
                <span className="login-stat-number">1000+</span>
                <span className="login-stat-label">Estudiantes graduados</span>
              </div>
              <div className="login-stat-item">
                <span className="login-stat-number">95%</span>
                <span className="login-stat-label">Tasa de empleabilidad</span>
              </div>
            </div>
          </div>
          
          {/* Controles de scroll */}
          <div className="login-scroll-controls">
            <button 
              className="login-scroll-button" 
              onClick={() => scrollPanel(rightPanelRef, 'up')}
              aria-label="Scroll arriba"
            >
              <Icons.KeyboardArrowUp />
            </button>
            <div className="login-scroll-progress">
              <div 
                className="login-scroll-indicator" 
                style={{ height: `${scrollProgress}%` }}
              ></div>
            </div>
            <button 
              className="login-scroll-button" 
              onClick={() => scrollPanel(rightPanelRef, 'down')}
              aria-label="Scroll abajo"
            >
              <Icons.KeyboardArrowDown />
            </button>
          </div>
        </div>
      </MUI.Box>
    </div>
  );
}

export default Login; 