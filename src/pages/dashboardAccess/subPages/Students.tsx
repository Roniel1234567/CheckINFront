import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/index.scss';
import * as MUI from "@mui/material";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Icons from "@mui/icons-material";
import SideBar from '../../../components/SideBar';
import DashboardAppBar from '../../../components/DashboardAppBar';


function Students() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const notifications=4; 

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);


  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <MUI.Box sx={{ display: 'flex', width:'100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p:0}}>
      {/* Sidebar */}
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Main content */}
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* App bar */}
        <DashboardAppBar notifications={notifications} toggleDrawer={toggleDrawer} />

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
            <MUI.CircularProgress />
          </MUI.Box>
        )}

        {/* Encabezado */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
            Gestión de Usuarios Estudiantes
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Administra ...
          </MUI.Typography>
        </MUI.Box>

        {/* CONTENIDO */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>         
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Students;