import { useState, useEffect } from 'react';
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

  return (
    <div className="login-container">
      <div className="login-background"></div>
      
      <MUI.Box className="login-wrapper">
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo-container">
              <img 
                src="https://storage.googleapis.com/educoco2020/82/foto_empresa/logo_821663703399_1663703399V19BCd9KY1u6alR.png" 
                alt="IPISA" 
                className="login-logo"
              />
            </div>
            <div className="login-title">
              <h1>IPISA</h1>
              <p>Instituto Politécnico Industrial de Santiago</p>
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
                  {loading ? (
                    <MUI.CircularProgress 
                      size={24} 
                      sx={{ color: '#fff' }} 
                      aria-label="Cargando"
                    />
                  ) : 'Entrar'}
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
            <p>&copy; {new Date().getFullYear()} IPISA - Sistema de Gestión</p>
          </div>
        </div>
      </MUI.Box>
    </div>
  );
}

export default Login; 