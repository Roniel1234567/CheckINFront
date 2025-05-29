import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.scss';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import SideBar from '../components/SideBar';
import DashboardAppBar from '../components/DashboardAppBar';
import { authService } from '../services/authService';
import { internshipService } from '../services/internshipService';
import documentoService, { EstadoDocumento } from '../services/documentoService';
import studentService from '../services/studentService';

function Dashboard() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [activeStudents, setActiveStudents] = useState(0);
  const [activeCompanies, setActiveCompanies] = useState(0);
  const [activeInternships, setActiveInternships] = useState(0);
  const [pendingDocs, setPendingDocs] = useState(0);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Estudiantes activos
        const estudiantes = await studentService.getAllStudents();
        setActiveStudents(estudiantes.filter(e => e.usuario_est && e.usuario_est.estado_usuario === 'Activo').length);
        // Centros aceptados
        const centros = await internshipService.getAllCentrosTrabajo();
        setActiveCompanies(centros.filter(c => c.validacion === 'Aceptada').length);
        // Pasantías activas
        const pasantias = await internshipService.getAllPasantias();
        setActiveInternships(pasantias.filter(p => p.estado_pas === 'En Proceso' || p.estado_pas === 'Pendiente').length);
        // Documentos pendientes
        const docs = await documentoService.getAllDocumentos();
        setPendingDocs(docs.filter(d => d.estado_doc_est === EstadoDocumento.PENDIENTE).length);
      } catch {
        // Si hay error, dejar los valores en 0
        setActiveStudents(0);
        setActiveCompanies(0);
        setActiveInternships(0);
        setPendingDocs(0);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Manejar el cambio de tamaño de la ventana
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (user && user.rol === 1) {
      navigate('/dashboard/subir-documentos', { replace: true });
    }
  }, [user, navigate]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Definir las tarjetas del dashboard
  const dashboardCards = [
    { 
      title: 'Estudiantes Activos', 
      value: activeStudents, 
      icon: <Icons.School fontSize="large" />, 
      color: theme.palette.primary.light, 
      path: '/estudiante',
      description: 'Total de estudiantes en Pasantías'
    },
    { 
      title: 'Centros Asociadas', 
      value: activeCompanies, 
      icon: <Icons.Business fontSize="large" />, 
      color: theme.palette.primary.light, 
      path: '/Centros-Trabajo',
      description: 'Centros colaboradores activos'
    },
    { 
      title: 'Pasantías en Curso', 
      value: activeInternships, 
      icon: <Icons.Work fontSize="large" />, 
      color: theme.palette.primary.light, 
      path: '/Pasantias',
      description: 'Estudiantes realizando Pasantías'
    },
    { 
      title: 'Documentos Pendientes', 
      value: pendingDocs, 
      icon: <Icons.Description fontSize="large" />, 
      color: theme.palette.primary.light, 
      path: '/Documentacion',
      description: 'Documentos por revisar y aprobar'
    }
  ];

  if (user && user.rol === 1) {
    return null;
  }

  return (
    <MUI.Box sx={{ display: 'flex', width:'100vw',minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p:0}}>
      {/* Loading overlay */}
      {loading && (
        <MUI.Box sx={{
          position: 'fixed',
          top: 0,          
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.8)',
          zIndex: 9999
        }}>
          <MUI.Box sx={{ textAlign: 'center' }}>
            <MUI.CircularProgress size={60} sx={{ color: '#1a237e' }} />
            <MUI.Typography variant="h6" sx={{ mt: 2, color: '#1a237e' }}>
              Cargando Dashboard...
            </MUI.Typography>
          </MUI.Box>
        </MUI.Box>
      )}

      {/* Sidebar */}
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Main content */}
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* App bar */}
        <DashboardAppBar toggleDrawer={toggleDrawer} />

        {/* Dashboard content */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
            Dashboard
          </MUI.Typography>
          <MUI.Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Bienvenido al sistema de gestión de pasantías, aquí podrás administrar todos los aspectos del programa
          </MUI.Typography>

          {/* Dashboard cards */}
          <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
            {dashboardCards.map((card, index) => (
              <MUI.Grid item xs={12} sm={6} md={3} key={index}>
                <MUI.Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                      cursor: 'pointer',
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    border: card.title === 'Pasantías' ? `2px solid ${theme.palette.success.main}` : undefined,
                  }}
                  onClick={() => card.path && navigate(card.path)}
                >
                  <MUI.Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: MUI.alpha(card.color, 0.1),
                      borderRadius: '0 0 0 100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                      p: 1,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </MUI.Box>
                  <MUI.CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <MUI.Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: card.color }}>
                      {card.value}
                    </MUI.Typography>
                    <MUI.Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                      {card.title}
                    </MUI.Typography>
                    <MUI.Typography variant="body2" color="text.secondary">
                      {card.description}
                    </MUI.Typography>
                  </MUI.CardContent>
                </MUI.Card>
              </MUI.Grid>
            ))}
          </MUI.Grid>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Dashboard;