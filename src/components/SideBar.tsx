import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";

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
        width: { xs: '80vw', sm: 260, md: 280 },
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { xs: '80vw', sm: 260, md: 280 },
          boxSizing: 'border-box',
          borderRight: 'none',
          bgcolor: '#ffffff',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.05)',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 1, md: 2 },
          borderRadius: { xs: 0, md: 0 },
          transition: 'all 0.3s',
        }
      }}
    >
      {/* Top section */}
      <MUI.Box>
        <MUI.Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: 2,
          mb: 2
        }}>
          <MUI.Typography 
            variant="h5" 
            sx={{ 
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold', 
              color: '#0E2A47',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '5px',
                right: '-8px',
                width: '80px',
                height: '3px',
                backgroundColor: '#DDB152',
                transform: 'rotate(-10deg)',
                transformOrigin: 'left center'
              }
            }}
          >
            Work in School
          </MUI.Typography>
        </MUI.Box>
        <MUI.Box sx={{ 
          mt: 1, 
          mb: 3, 
          px: 2, 
          py: 2,
          background: 'linear-gradient(135deg, #0E2A47, #1e4976)',
          borderRadius: 2,
          boxShadow: '0 4px 10px rgba(14, 42, 71, 0.2)'
        }}>
          <MUI.Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <MUI.Avatar sx={{ 
              bgcolor: '#ffffff',
              color: '#0E2A47', 
              fontWeight: 'bold',
              width: 50,
              height: 50,
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
            }}>
              <Icons.Person />
            </MUI.Avatar>
            <MUI.Box>
              <MUI.Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#ffffff', fontSize: '0.95rem' }}>
                NOMBRE APELLIDO
              </MUI.Typography>
              <MUI.Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ffffff', opacity: 0.95, fontSize: '0.8rem' }}>
                ROL DEL USUARIO
              </MUI.Typography>
              <MUI.Typography variant="body2" sx={{ color: '#ffffff', opacity: 0.8, fontSize: '0.75rem' }}>
                correo@ipisa.edu.do
              </MUI.Typography>
            </MUI.Box>
          </MUI.Box>
        </MUI.Box>
        <MUI.Typography sx={{ 
          px: 3, 
          pb: 1, 
          fontSize: '0.75rem', 
          fontWeight: 'bold', 
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Menú Principal
        </MUI.Typography>
        <MUI.List sx={{ px: 2 }}>
          {menuItems.map(item => (
            <MUI.ListItem
              key={item.id}
              disablePadding
              sx={{ mb: 0.5, borderRadius: 1, overflow: 'hidden' }}
            >
              <MUI.Button
                fullWidth
                onClick={() => {
                  navigate(item.path);
                  if (isMobile || windowWidth < 600) toggleDrawer();
                }}
                sx={{
                  py: 1.2,
                  justifyContent: 'flex-start',
                  color: activeMenu === item.id ? '#0E2A47' : '#555',
                  backgroundColor: activeMenu === item.id ? 'rgba(14,42,71,0.05)' : 'transparent',
                  fontWeight: activeMenu === item.id ? 600 : 400,
                  borderRadius: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(14,42,71,0.08)',
                  },
                }}
              >
                <MUI.ListItemIcon
                  sx={{ 
                    color: activeMenu === item.id ? '#0E2A47' : '#777',
                    minWidth: '40px',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.icon}
                </MUI.ListItemIcon>
                <MUI.ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: activeMenu === item.id ? 600 : 400,
                    fontSize: '0.95rem',
                  }}
                />
                {activeMenu === item.id && <Icons.ChevronRight color="primary" />}
              </MUI.Button>
            </MUI.ListItem>
          ))}
        </MUI.List>
      </MUI.Box>
      <MUI.Box sx={{ flexGrow: 1 }} />
      {/* Bottom section */}
      <MUI.Box sx={{ mt: 'auto' }}>
        <MUI.Typography sx={{ 
          px: 3, 
          pb: 1, 
          fontSize: '0.75rem', 
          fontWeight: 'bold', 
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Soporte
        </MUI.Typography>
        <MUI.List sx={{ px: 2 }}>
          <MUI.ListItem disablePadding sx={{ mb: 0.5, borderRadius: 1 }}>
            <MUI.Button fullWidth onClick={() => navigate('/ManualdeUsuario')} sx={{ 
              py: 1.2,
              justifyContent: 'flex-start',
              borderRadius: 1,
              color: '#555',
              '&:hover': { backgroundColor: 'rgba(14,42,71,0.08)' } 
            }}>
              <MUI.ListItemIcon sx={{ color: '#0E2A47', minWidth: '40px' }}>
                <Icons.Assignment />
              </MUI.ListItemIcon>
              <MUI.ListItemText primary="Manual de Usuario" primaryTypographyProps={{ fontSize: '0.95rem' }} />
            </MUI.Button>
          </MUI.ListItem>
          <MUI.ListItem disablePadding sx={{ mb: 0.5, borderRadius: 1 }}>
            <MUI.Button fullWidth onClick={() => navigate('/Login')} sx={{ 
              py: 1.2,
              justifyContent: 'flex-start',
              borderRadius: 1,
              color: '#d32f2f',
              '&:hover': { backgroundColor: 'rgba(211,47,47,0.05)' } 
            }}>
              <MUI.ListItemIcon sx={{ color: '#d32f2f', minWidth: '40px' }}>
                <Icons.Logout />
              </MUI.ListItemIcon>
              <MUI.ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.95rem' }} />
            </MUI.Button>
          </MUI.ListItem>
        </MUI.List>
      </MUI.Box>
      <MUI.Box sx={{ 
        borderTop: '1px solid #f0f0f0', 
        pt: 2, 
        pb: 2, 
        px: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 2
      }}>
        <MUI.Typography variant="caption" sx={{ color: '#777', fontSize: '0.75rem' }}>
          IPISA © {new Date().getFullYear()}
        </MUI.Typography>
        <MUI.Typography variant="caption" sx={{ color: '#0E2A47', fontWeight: 'bold', fontSize: '0.75rem' }}>
          v1.0
        </MUI.Typography>
      </MUI.Box>
    </MUI.Drawer>
  );
};

export default SideBar;