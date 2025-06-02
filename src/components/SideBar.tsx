import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import Logotipo from '../assets/svg/Logotipo';
import { authService } from '../services/authService';

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
  const [userInfo, setUserInfo] = useState({
    nombre: '',
    rol: '',
    correo: ''
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Obtener información del usuario al cargar el componente
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Mapear el rol a un string más amigable
      const rolMap: { [key: number]: string } = {
        1: 'Estudiante',
        2: 'Centro de Trabajo',
        3: 'Tutor',
        4: 'Administrador',
        5: 'Observador'
      };

      setUserInfo({
        nombre: currentUser.dato_usuario,
        rol: rolMap[currentUser.rol] || 'Usuario',
        correo: currentUser.email || ''
      });
    }
  }, []);

  useEffect(() => {
    // Redirección solo para estudiantes y tutores
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      if (currentUser.rol === 1 && location.pathname === '/dashboard') {
        navigate('/dashboard/subir-documentos', { replace: true });
      }
      else if (currentUser.rol === 3 && (location.pathname === '/dashboard' || location.pathname === '/')) {
        navigate('/pasantias', { replace: true });
      }
    }
  }, [location, navigate]);

  const menuItems = [
    { id: 'Dashboard', text: 'Dashboard', icon: <Icons.Dashboard />, path: '/Dashboard' },
    { id: 'pasantias', text: 'Gestión de Pasantías', icon: <Icons.AssignmentTurnedIn />, path: '/pasantias' },
    { id: 'estudiante', text: 'Estudiantes', icon: <Icons.School />, path: '/estudiantes' },
    { id: 'talleres', text: 'Gestión de Talleres', icon: <Icons.Build />, path: '/talleres' },
    { id: 'tutores', text: 'Gestión de Tutores', icon: <Icons.SupervisorAccount />, path: '/tutores' },
    { id: 'supervisores', text: 'Gestión de Supervisores', icon: <Icons.SupervisorAccount />, path: '/supervisores' },
    { id: 'administradores', text: 'Gestión de Administradores', icon: <Icons.AdminPanelSettings />, path: '/administradores' },
    { id: 'companies', text: 'Centros de Trabajo', icon: <Icons.Business />, path: '/Centros-Trabajo' },
    { id: 'plazas', text: 'Plazas', icon: <Icons.BusinessCenter />, path: '/plazas' },
    { id: 'documentos', text: 'Documentos', icon: <Icons.Description />, path: '/documentos' },
    { id: 'subirdoc', text: 'Subir Documentos', icon: <Icons.Upload />, path: '/subir-documentos' },
    { id: 'evaluaciones', text: 'Evaluaciones', icon: <Icons.Assessment />, path: '/evaluaciones' },
    { id: 'calificacion', text: 'Calificaciones', icon: <Icons.Grade />, path: '/dashboard/calificacion' },
    { id: 'reports', text: 'Reportes', icon: <Icons.Assessment />, path: '/Reportes' },
    { id: 'cierre', text: 'Cierre de Pasantías', icon: <Icons.PowerSettingsNew />, path: '/cierre-pasantia' },
    { id: 'enviarExcusa', text: 'Enviar Excusa', icon: <Icons.EventBusy />, path: '/enviar-excusa' },
  ];

  // Filtrar menú según el rol del usuario
  let filteredMenuItems = menuItems;
  if (userInfo.rol === 'Estudiante') {
    filteredMenuItems = menuItems.filter(item => [
      'calificacion',
      'pasantias',
      'evaluaciones',
      'subirdoc',
      'enviarExcusa'
    ].includes(item.id));
  }
  else if (userInfo.rol === 'Tutor') {
    filteredMenuItems = menuItems.filter(item => [
      'pasantias',
      'estudiante',
      'calificacion',
      'reports',
      'supervisores',
      'enviarExcusa'
    ].includes(item.id));
  }
  else if (userInfo.rol === 'Centro de Trabajo') {
    filteredMenuItems = menuItems.filter(item => [
      'companies', // Centro de Trabajo
      'plazas',    // Plazas
      'evaluaciones', // Evaluaciones
      'pasantias'  // Pasantías
    ].includes(item.id));
  }
  else if (userInfo.rol === 'Observador') {
    filteredMenuItems = menuItems.filter(item => [
      'pasantias',
      'estudiante',
      'evaluaciones',
      'reports',
      'enviarExcusa'
    ].includes(item.id));
  }
  else if (userInfo.rol === 'Administrador') {
    // Mantener todos los items y agregar Observadores
    filteredMenuItems = [
      ...menuItems,
      { id: 'observadores', text: 'Gestión de Observadores', icon: <Icons.Visibility />, path: '/observadores' }
    ];
  }

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
                {userInfo.nombre || 'Usuario'}
              </MUI.Typography>
              <MUI.Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 0, pb: 1 }}>
                {userInfo.rol}
              </MUI.Typography>
              {userInfo.correo && userInfo.correo.length > 0 && (
                <MUI.Typography variant="body2" color="text.secondary">
                  {userInfo.correo}
                </MUI.Typography>
              )}
            </MUI.Box>
          </MUI.Paper>
        </MUI.Box>
        <MUI.Divider />
        <MUI.List sx={{ px: 2 }}>
          {filteredMenuItems.map(item => (
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
            <MUI.Button 
              fullWidth 
              onClick={() => {
                authService.logout();
                if (location.pathname !== '/Login') {
                  navigate('/Login', { replace: true });
                }
              }} 
              sx={{ color: 'red' }}
            >
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