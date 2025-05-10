import './styles/App.scss'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './assets/theme';
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
import Talleres from './pages/dashboardAccess/subPages/Talleres';
import DashboardLayout from './layouts/DashboardLayout';

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

          {/* Rutas del dashboard con layout */}
          <Route path="/*" element={<DashboardLayout />}>
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="Usuarios" element={<Users />} />
            <Route path="estudiante" element={<Students />} />
            <Route path="Usuarios/Tutores" element={<Tutors />} />
            <Route path="Usuarios/Supervisores" element={<Supervisors />} />
            <Route path="Usuarios/Administradores" element={<Administrators />} />
            <Route path="Usuarios/Observadores" element={<Observers />} />
            <Route path="Visitas" element={<Visits />} />
            <Route path="Pasantias" element={<Internships />} />
            <Route path="CentrosdeTrabajo" element={<Companies />} />
            <Route path="plazas" element={<PlazasCentro />} />
            <Route path="evaluaciones" element={<Evaluaciones />} />
            <Route path="talleres" element={<Talleres />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
