import './styles/App.scss'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './assets/theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Principal from './pages/Principal';
import Companies from './pages/dashboardAccess/Companies';
import AboutUs from './pages/About_us';
import UserManual from './pages/User_manual';
import Users from './pages/dashboardAccess/Users';
import Internships from './pages/dashboardAccess/Internships';
import Features from './pages/Features';
import Visits from './pages/dashboardAccess/Visits';
import Students from './pages/dashboardAccess/subPages/Students';
import Administrators from './pages/dashboardAccess/subPages/Administrators';
import Observers from './pages/dashboardAccess/subPages/Observers';
import Supervisors from './pages/dashboardAccess/subPages/Supervisors';
import Tutors from './pages/dashboardAccess/subPages/Tutors';
import PlazasCentro from './pages/dashboardAccess/PlazasCentro';
import Evaluaciones from './pages/dashboardAccess/Evaluaciones';
import TallerConFamilias from './pages/dashboardAccess/TallerConFamilias';
import TutoresPage from './pages/dashboardAccess/Tutores';
import RecuperarContrasena from './pages/RecuperarContrasena';
import { authService } from './services/authService';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Navigate to="/Principal" replace />} />
          <Route path="/Principal" element={<Principal />} />
          <Route path="/SobreNosotros" element={<AboutUs />} />
          <Route path="/Funcionalidades" element={<Features />} />
          <Route path="/ManualdeUsuario" element={<UserManual />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/reset-password/:token" element={<RecuperarContrasena />} />

          {/* Rutas del dashboard directas, sin layout */}
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="estudiantes" element={<Students />} />
          <Route path="usuarios/tutores" element={<Tutors />} />
          <Route path="usuarios/supervisores" element={<Supervisors />} />
          <Route path="usuarios/administradores" element={<Administrators />} />
          <Route path="usuarios/observadores" element={<Observers />} />
          <Route path="visitas" element={<Visits />} />
          <Route path="pasantias" element={<Internships />} />
          <Route path="centros-trabajo" element={<Companies />} />
          <Route path="plazas" element={<PlazasCentro />} />
          <Route path="evaluaciones" element={<Evaluaciones />} />
          <Route path="talleres" element={<TallerConFamilias />} />
          <Route path="tutores" element={<TutoresPage />} />
          {/* Ruta alternativa para gestión de talleres que apunta al mismo componente */}
          <Route path="gestion-talleres" element={<TallerConFamilias />} />

          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Principal />
            </ProtectedRoute>
          } />
          <Route path="/evaluaciones" element={
            <ProtectedRoute>
              <Evaluaciones />
            </ProtectedRoute>
          } />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      {/* Configuración del ToastContainer para mostrar notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ThemeProvider>
  );
}

export default App;
