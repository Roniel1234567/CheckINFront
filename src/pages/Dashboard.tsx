import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.scss';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import SideBar from '../components/SideBar';
import DashboardAppBar from '../components/DashboardAppBar';
import { authService } from '../services/authService';

function Dashboard() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  {/* VARIABLES para extraer de la bd*/}
  const activeStudents=121; 
  const activeCompanies=36; 
  const activeInternships=36; 
  const pendingDocs=45; 

  // Simulación de carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
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
    },
    {
      title: 'Pasantías',
      value: '',
      icon: <Icons.AssignmentTurnedIn fontSize="large" />,
      color: theme.palette.success.main,
      description: 'Gestiona las pasantías de los estudiantes',
      path: '/pasantias',
    },
  ];

  // Lista de actividades recientes
  const recentActivities = [
    { user: 'Nombre Apellido', action: 'Acción realizada', time: 'Hace cuanto tiempo' },
    { user: 'Nombre Apellido', action: 'Acción realizada', time: 'Hace cuanto tiempo' },
    { user: 'Nombre Apellido', action: 'Acción realizada', time: 'Hace cuanto tiempo' },
    { user: 'Nombre Apellido', action: 'Acción realizada', time: 'Hace cuanto tiempo' },
    { user: 'Nombre Apellido', action: 'Acción realizada', time: 'Hace cuanto tiempo' },
  ];

  // Próximas evaluaciones
  const upcomingVisits = [
    { tutor: 'Nombre Apellido', company: 'Nombre Empresa', date: 'Fecha de la visita' },
    { tutor: 'Nombre Apellido', company: 'Nombre Empresa', date: 'Fecha de la visita' },
    { tutor: 'Nombre Apellido', company: 'Nombre Empresa', date: 'Fecha de la visita' },
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

          {/* Dashboard bottom section */}
          <MUI.Grid container spacing={3}>
            {/* Actividades recientes */}
            <MUI.Grid item xs={12} md={6} lg={8}>
              <MUI.Fade in={!loading} timeout={1000}>
                <MUI.Paper sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  height: '100%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <MUI.Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2 
                  }}>
                    <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Actividades Recientes
                    </MUI.Typography>
                    <MUI.Button 
                      color="primary" 
                      endIcon={<Icons.ChevronRight />}
                      onClick={() => navigate('/actividades')}
                    >
                      Ver todas
                    </MUI.Button>
                  </MUI.Box>
                  <MUI.Divider sx={{ mb: 2 }} />
                  <MUI.List>
                    {recentActivities.map((activity, index) => (
                      <MUI.Zoom 
                        key={index} 
                        in={!loading} 
                        style={{ transitionDelay: `${index * 100 + 500}ms` }}
                      >
                        <MUI.ListItem 
                          sx={{ 
                            py: 1.5, 
                            px: 2, 
                            mb: 1, 
                            bgcolor: MUI.alpha('#f5f5f5', 0.5),
                            borderRadius: 2 
                          }}
                        >
                          <MUI.ListItemIcon>
                            <MUI.Avatar sx={{ bgcolor: theme.palette.primary.light }} />
                          </MUI.ListItemIcon>
                          <MUI.ListItemText 
                            primary={
                              <MUI.Typography variant="body1">
                                <MUI.Typography component="span" fontWeight="bold">
                                  {activity.user}
                                </MUI.Typography>
                                {' '}{activity.action}
                              </MUI.Typography>
                            } 
                            secondary={activity.time} 
                          />
                        </MUI.ListItem>
                      </MUI.Zoom>
                    ))}
                  </MUI.List>
                </MUI.Paper>
              </MUI.Fade>
            </MUI.Grid>

            {/* Próximas Visitas */}
            <MUI.Grid item xs={12} md={6} lg={4}>
              <MUI.Fade in={!loading} timeout={1000}>
                <MUI.Paper sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  height: '100%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <MUI.Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2 
                  }}>
                    <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Próximas Visitas
                    </MUI.Typography>
                    <MUI.Button 
                      color="primary" 
                      endIcon={<Icons.ChevronRight />}
                      onClick={() => navigate('/Visitas')}
                    >
                      Ver todas
                    </MUI.Button>
                  </MUI.Box>
                  <MUI.Divider sx={{ mb: 2 }} />
                  <MUI.List>
                    {upcomingVisits.map((visit, index) => (
                      <MUI.Zoom 
                        key={index} 
                        in={!loading} 
                        style={{ transitionDelay: `${index * 100 + 700}ms` }}
                      >
                        <MUI.Paper
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            mb: 1.5, 
                            bgcolor: MUI.alpha(theme.palette.secondary.light, 0.5),
                            borderRadius: 2,
                            border: `1px solid ${MUI.alpha(theme.palette.secondary.light, 0.4)}`,
                            textAlign: 'left',
                          }}
                        >
                          <MUI.Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {visit.tutor}
                          </MUI.Typography>
                          <MUI.Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {visit.company}
                          </MUI.Typography>
                          <MUI.Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center' 
                          }}>
                            <MUI.Typography 
                              variant="caption" 
                              sx={{ 
                                bgcolor: MUI.alpha(theme.palette.primary.dark,1),
                                color:theme.palette.background.paper,
                                py: 0.5,
                                px: 1,
                                borderRadius: 1,
                                fontWeight: 'bold'
                              }}
                            >
                              Fecha: {visit.date}
                            </MUI.Typography>
                            <MUI.Box>
                              <MUI.Tooltip title="Ver detalles">
                                <MUI.IconButton size="small" sx={{ mr: 0.5 }}>
                                  <Icons.Visibility fontSize="small" />
                                </MUI.IconButton>
                              </MUI.Tooltip>
                              <MUI.Tooltip title="Editar">
                                <MUI.IconButton size="small">
                                  <Icons.Edit fontSize="small" />
                                </MUI.IconButton>
                              </MUI.Tooltip>
                            </MUI.Box>
                          </MUI.Box>
                        </MUI.Paper>
                      </MUI.Zoom>
                    ))}
                  </MUI.List>
                  <MUI.Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<Icons.Add />}
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/Visitas')}
                  >
                    Programar Evaluación
                  </MUI.Button>
                </MUI.Paper>
              </MUI.Fade>
            </MUI.Grid>
          </MUI.Grid>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Dashboard;