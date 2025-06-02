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
import Features from './pages/Features';
import Visits from './pages/dashboardAccess/Visits';
import Students from './pages/dashboardAccess/subPages/Students';
import Administrators from './pages/dashboardAccess/subPages/Administrators';
import ObservadoresPage from './pages/dashboardAccess/Observadores';
import Supervisors from './pages/dashboardAccess/subPages/Supervisors';
import Tutors from './pages/dashboardAccess/subPages/Tutors';
import PlazasCentro from './pages/dashboardAccess/PlazasCentro';
import Evaluaciones from './pages/dashboardAccess/Evaluaciones';
import TallerConFamilias from './pages/dashboardAccess/TallerConFamilias';
import TutoresPage from './pages/dashboardAccess/Tutores';
import RecuperarContrasena from './pages/RecuperarContrasena';
import Taller from './pages/dashboardAccess/Taller';
import Calificacion from './pages/dashboardAccess/Calificacion';
import SupervisoresPage from './pages/dashboardAccess/Supervisores';
import PasantiaPage from './pages/Pasantia';
import Administradores from './pages/dashboardAccess/Administradores';
import Documento from './pages/dashboardAccess/Documento';
import Reportes from './pages/dashboardAccess/Reportes';
import CierrePasantia from './pages/CierrePasantia';
import RegistroCentro from './pages/RegistroCentro';
import SubirDoc from './pages/dashboardAccess/subPages/SubirDoc';
import AccesoDenegado from './pages/AccesoDenegado';
import ProtectedRoute from './components/ProtectedRoute';
import { ReadOnlyProvider } from './context/ReadOnlyContext';
import { SnackbarProvider } from 'notistack';

// Roles
const ROLES = {
  ESTUDIANTE: 1,
  EMPRESA: 2,
  TUTOR: 3,
  ADMINISTRADOR: 4
};

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <ReadOnlyProvider>
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
              <Route path="/registro-centro" element={<RegistroCentro />} />
              <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
              <Route path="/reset-password/:token" element={<RecuperarContrasena />} />
              <Route path="/acceso-denegado" element={<AccesoDenegado />} />

              {/* Rutas del dashboard directas, sin layout */}
              <Route path='/dashboard' element={<ProtectedRoute routeId="Dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="usuarios" element={<ProtectedRoute routeId="users"><Users /></ProtectedRoute>} />
              <Route path="estudiantes" element={<ProtectedRoute routeId="estudiante"><Students /></ProtectedRoute>} />
              <Route path="usuarios/tutores" element={<ProtectedRoute routeId="tutores"><Tutors /></ProtectedRoute>} />
              <Route path="usuarios/supervisores" element={<ProtectedRoute routeId="supervisores"><Supervisors /></ProtectedRoute>} />
              <Route path="usuarios/administradores" element={<ProtectedRoute routeId="administradores"><Administrators /></ProtectedRoute>} />
              <Route path="observadores" element={<ProtectedRoute routeId="observadores"><ObservadoresPage /></ProtectedRoute>} />
              <Route path="visitas" element={<ProtectedRoute routeId="visits"><Visits /></ProtectedRoute>} />
              <Route path="pasantias" element={<ProtectedRoute routeId="pasantias"><PasantiaPage key={window.location.pathname} /></ProtectedRoute>} />
              <Route path="centros-trabajo" element={<ProtectedRoute routeId="companies"><Companies /></ProtectedRoute>} />
              <Route path="plazas" element={<ProtectedRoute routeId="plazas"><PlazasCentro /></ProtectedRoute>} />
              <Route path="evaluaciones" element={<ProtectedRoute routeId="evaluaciones"><Evaluaciones /></ProtectedRoute>} />
              <Route path="talleres" element={<ProtectedRoute routeId="talleres"><TallerConFamilias /></ProtectedRoute>} />
              <Route path="tutores" element={<ProtectedRoute routeId="tutores"><TutoresPage /></ProtectedRoute>} />
              <Route path="supervisores" element={<ProtectedRoute routeId="supervisores"><SupervisoresPage /></ProtectedRoute>} />
              <Route path="administradores" element={<ProtectedRoute routeId="administradores"><Administradores /></ProtectedRoute>} />
              <Route path="documentos" element={<ProtectedRoute routeId="documentos"><Documento /></ProtectedRoute>} />
              <Route path="subir-documentos" element={<ProtectedRoute routeId="subirdoc"><SubirDoc key={window.location.pathname} /></ProtectedRoute>} />
              <Route path="reportes" element={<ProtectedRoute routeId="reports"><Reportes /></ProtectedRoute>} />
              <Route path="/cierre-pasantia" element={<ProtectedRoute routeId="cierre"><CierrePasantia /></ProtectedRoute>} />
              <Route path="gestion-talleres" element={<ProtectedRoute routeId="talleres"><TallerConFamilias /></ProtectedRoute>} />
              <Route path="/dashboard/evaluaciones" element={<ProtectedRoute routeId="evaluaciones"><Evaluaciones /></ProtectedRoute>} />
              <Route path="/dashboard/taller" element={<ProtectedRoute routeId="talleres"><Taller /></ProtectedRoute>} />
              <Route path="/dashboard/calificacion" element={<ProtectedRoute routeId="calificacion"><Calificacion key={window.location.pathname} /></ProtectedRoute>} />

              {/* Rutas protegidas */}
              <Route path="/evaluaciones" element={
                <ProtectedRoute>
                  <Evaluaciones />
                </ProtectedRoute>
              } />

              {/* Rutas protegidas para administradores */}
              <Route
                path="/dashboard/companies"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <Companies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/students"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/documentos"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <Documento />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/subir-documentos"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                    <SubirDoc />
                  </ProtectedRoute>
                }
              />

              {/* Ruta por defecto - redirige a login */}
              <Route path="*" element={<Navigate to="/Login" replace />} />
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
      </ReadOnlyProvider>
    </SnackbarProvider>
  );
}

export default App;
