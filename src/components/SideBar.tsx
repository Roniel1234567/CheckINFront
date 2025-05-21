import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import Logotipo from '../assets/svg/Logotipo';

interface SideBarProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
}

const SideBar = ({ drawerOpen, toggleDrawer }: SideBarProps) => {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'Dashboard', text: 'Dashboard', icon: <Icons.Dashboard />, path: '/Dashboard' },
    { id: 'estudiante', text: 'Estudiantes', icon: <Icons.School />, path: '/estudiantes' },
    { id: 'users', text: 'Usuarios', icon: <Icons.Person />, path: '/Usuarios' },
    { id: 'talleres', text: 'Gestión de Talleres', icon: <Icons.Build />, path: '/talleres' },
    { id: 'tutores', text: 'Gestión de Tutores', icon: <Icons.SupervisorAccount />, path: '/tutores' },
    { id: 'companies', text: 'Centros de Trabajo', icon: <Icons.Business />, path: '/Centros-Trabajo' },
    { id: 'plazas', text: 'Plazas', icon: <Icons.BusinessCenter />, path: '/plazas' },
    { id: 'internships', text: 'Pasantías', icon: <Icons.Work />, path: '/pasantias' },
    { id: 'evaluaciones', text: 'Evaluaciones', icon: <Icons.Assessment />, path: '/evaluaciones' },
    { id: 'calificacion', text: 'Calificaciones', icon: <Icons.Grade />, path: '/dashboard/calificacion' },
    { id: 'visits', text: 'Visitas', icon: <Icons.Explore />, path: '/Visitas' },
    { id: 'reports', text: 'Reportes', icon: <Icons.Assessment />, path: '/Reportes' }
  ];

  const activeMenu = menuItems.find(item => location.pathname === item.path)?.id || '';

  return (
    <MUI.Drawer
      variant={isMobile || windowWidth < 600 ? 'temporary' : 'persistent'}
      open={drawerOpen}
      onClose={toggleDrawer}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: 'none',
          bgcolor: theme.palette.background.paper,
          boxShadow: '0 4px 20px rgba(134, 171, 201, 0.57)',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Top section */}
      <MUI.Box>
        <MUI.Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logotipo height={40} />
        </MUI.Box>
        <MUI.Divider />
        <MUI.Box sx={{ mt: 2, mb: 2, px: 2 }}>
          <MUI.Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: MUI.alpha(theme.palette.background.default, 0.05),
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <MUI.Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <Icons.Person />
            </MUI.Avatar>
            <MUI.Box>
              <MUI.Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                NOMBRE APELLIDO
              </MUI.Typography>
              <MUI.Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 0, pb: 1 }}>
                ROL DEL USUARIO
              </MUI.Typography>
              <MUI.Typography variant="body2" color="text.secondary">
                correo@ipisa.edu.do
              </MUI.Typography>
            </MUI.Box>
          </MUI.Paper>
        </MUI.Box>
        <MUI.Divider />
        <MUI.List sx={{ px: 2 }}>
          {menuItems.map(item => (
            <MUI.ListItem
              key={item.id}
              disablePadding
              sx={{ mb: 1, borderRadius: 2, overflow: 'hidden' }}
            >
              <MUI.Button
                fullWidth
                onClick={() => {
                  navigate(item.path);
                  if (isMobile || windowWidth < 600) toggleDrawer();
                }}
                sx={{
                  py: 1.5,
                  justifyContent: 'flex-start',
                  color: activeMenu === item.id ? theme.palette.primary.dark : 'inherit',
                  backgroundColor: activeMenu === item.id ? theme.palette.action.selected : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <MUI.ListItemIcon
                  sx={{ color: activeMenu === item.id ? theme.palette.primary.dark : 'inherit' }}
                >
                  {item.icon}
                </MUI.ListItemIcon>

                <MUI.ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: activeMenu === item.id ? 'bold' : 'normal',
                  }}
                />

                {activeMenu === item.id && <Icons.ChevronRight />}
              </MUI.Button>
            </MUI.ListItem>
          ))}
        </MUI.List>
      </MUI.Box>
      
      {/* This flex spacer pushes the bottom section down */}
      <MUI.Box sx={{ flexGrow: 1 }} />
      
      {/* Bottom section */}
      <MUI.Box sx={{ mt: 'auto' }}>
        <MUI.Divider />
        <MUI.List sx={{ px: 2 }}>
          <MUI.ListItem disablePadding>
            <MUI.Button fullWidth onClick={() => navigate('/ManualdeUsuario')}>
              <MUI.ListItemIcon>
                <Icons.Assignment />
              </MUI.ListItemIcon>
              <MUI.ListItemText primary="Manual de Usuario" />
            </MUI.Button>
          </MUI.ListItem>
          <MUI.ListItem disablePadding>
            <MUI.Button fullWidth onClick={() => navigate('/Login')} sx={{ color: 'red' }}>
              <MUI.ListItemIcon sx={{ color: 'red' }}>
                <Icons.Logout />
              </MUI.ListItemIcon>
              <MUI.ListItemText primary="Cerrar Sesión" />
            </MUI.Button>
          </MUI.ListItem>
        </MUI.List>
      </MUI.Box>
    </MUI.Drawer>
  );
};

export default SideBar;