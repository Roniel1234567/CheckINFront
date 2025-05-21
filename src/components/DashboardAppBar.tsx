import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useState } from 'react';

// Define the props interface with proper types
interface DashboardAppBarProps {
  notifications?: number;
  toggleDrawer: () => void;
}

// Define the notification interface
interface Notificacion {
  id: number;
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
}

// Define notification settings interface
interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
}

function DashboardAppBar({ notifications = 0, toggleDrawer }: DashboardAppBarProps) {
  const theme = MUI.useTheme();
  
  // State for menu anchors
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  
  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sound: false
  });
  
  // Example notifications data
  const notificacionesEjemplo: Notificacion[] = [
    {
      id: 1,
      titulo: "Nueva solicitud de pasantía",
      descripcion: "Has recibido una nueva solicitud de pasantía.",
      tiempo: "5 minutos",
      leida: false
    },
    {
      id: 2,
      titulo: "Evaluación completada",
      descripcion: "Un estudiante ha completado su evaluación.",
      tiempo: "1 hora",
      leida: false
    },
    {
      id: 3,
      titulo: "Recordatorio",
      descripcion: "Tienes una reunión programada para mañana.",
      tiempo: "3 horas",
      leida: true
    }
  ];
  
  // Handler functions
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };
  
  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };
  
  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };
  
  const handleNotificationSettingChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  // Navigation function (mock)
  const navigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // Implementation would depend on your routing library
  };
  
  return (
    <MUI.AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${MUI.alpha('#000', 0.05)}`,
        bgcolor: theme.palette.background.default 
      }}
    >
      <MUI.Toolbar sx={{width: '100%'}}>
        <MUI.IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer}
          sx={{ margin:0, display: { md: 'none' } }}
        >
          <Icons.Menu />
        </MUI.IconButton>
        <MUI.Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
          Sistema de Gestión de Pasantías Work in School
        </MUI.Typography>
        <MUI.Tooltip title="Notificaciones">
          <MUI.IconButton color="inherit" onClick={handleNotificationsOpen}>
            <MUI.Badge badgeContent={notifications} color="secondary">
              <Icons.Notifications />
            </MUI.Badge>
          </MUI.IconButton>
        </MUI.Tooltip>
        <MUI.Tooltip title="Configuración">
          <MUI.IconButton color="inherit" onClick={handleSettingsOpen}>
            <Icons.Settings />
          </MUI.IconButton>
        </MUI.Tooltip>
      </MUI.Toolbar>
  
      <MUI.Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        TransitionComponent={MUI.Grow}
        transitionDuration={200}
      >
        <MUI.Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(45deg, ${MUI.alpha(theme.palette.primary.main, 0.05)}, ${MUI.alpha(theme.palette.primary.light, 0.05)})`,
        }}>
          <MUI.Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.primary.main
          }}>
            <Icons.Notifications fontSize="small" />
            Notificaciones
          </MUI.Typography>
        </MUI.Box>
        {notificacionesEjemplo.map((notificacion, index) => (
          <MUI.Fade key={notificacion.id} in={true} style={{ transitionDelay: `${index * 100}ms` }}>
            <MUI.MenuItem 
              onClick={handleNotificationsClose}
              sx={{ 
                py: 2,
                px: 3,
                borderBottom: `1px solid ${MUI.alpha(theme.palette.divider, 0.1)}`,
                bgcolor: notificacion.leida ? 'transparent' : MUI.alpha(theme.palette.primary.main, 0.02),
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: MUI.alpha(theme.palette.primary.main, 0.05),
                }
              }}
            >
              <MUI.ListItemAvatar>
                <MUI.Avatar sx={{ 
                  bgcolor: notificacion.leida ? 'grey.100' : MUI.alpha(theme.palette.primary.main, 0.1),
                  color: notificacion.leida ? 'grey.400' : theme.palette.primary.main,
                  transition: 'all 0.2s'
                }}>
                  {notificacion.leida ? <Icons.NotificationsOff /> : <Icons.NotificationsActive />}
                </MUI.Avatar>
              </MUI.ListItemAvatar>
              <MUI.Box sx={{ ml: 1, width: '100%', overflow: 'hidden' }}>
                <MUI.Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: notificacion.leida ? 'normal' : 'bold',
                    color: notificacion.leida ? 'text.secondary' : 'text.primary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {notificacion.titulo}
                </MUI.Typography>
                <MUI.Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '240px'
                  }}
                >
                  {notificacion.descripcion}
                </MUI.Typography>
                <MUI.Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mt: 0.5 
                }}>
                  <Icons.Circle sx={{ 
                    fontSize: 8, 
                    color: notificacion.leida ? 'grey.400' : theme.palette.primary.main 
                  }} />
                  <MUI.Typography variant="caption" color="text.secondary">
                    Hace {notificacion.tiempo}
                  </MUI.Typography>
                </MUI.Box>
              </MUI.Box>
            </MUI.MenuItem>
          </MUI.Fade>
        ))}
        <MUI.Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(45deg, ${MUI.alpha(theme.palette.primary.main, 0.02)}, ${MUI.alpha(theme.palette.primary.light, 0.02)})`,
        }}>
          <MUI.Button 
            fullWidth 
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: MUI.alpha(theme.palette.primary.main, 0.05),
              }
            }}
          >
            Ver todas las notificaciones
          </MUI.Button>
        </MUI.Box>
      </MUI.Menu>

      <MUI.Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleSettingsClose}
        PaperProps={{
          sx: {
            width: 320,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        TransitionComponent={MUI.Grow}
        transitionDuration={200}
      >
        <MUI.Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(45deg, ${MUI.alpha(theme.palette.primary.main, 0.05)}, ${MUI.alpha(theme.palette.primary.light, 0.05)})`,
        }}>
          <MUI.Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.primary.main
          }}>
            <Icons.Settings fontSize="small" />
            Configuración
          </MUI.Typography>
        </MUI.Box>
        <MUI.MenuItem sx={{ 
          py: 2,
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: MUI.alpha(theme.palette.primary.main, 0.05),
          }
        }}>
          <MUI.ListItemIcon>
            {theme.palette.mode === 'dark' ? <Icons.DarkMode /> : <Icons.LightMode />}
          </MUI.ListItemIcon>
          <MUI.ListItemText 
            primary="Tema" 
            secondary="Claro/Oscuro"
            primaryTypographyProps={{
              sx: { fontWeight: 'medium' }
            }}
          />
        </MUI.MenuItem>
        <MUI.MenuItem sx={{ 
          py: 2,
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: MUI.alpha(theme.palette.primary.main, 0.05),
          }
        }}>
          <MUI.ListItemIcon>
            <Icons.Language />
          </MUI.ListItemIcon>
          <MUI.ListItemText 
            primary="Idioma" 
            secondary="Español"
            primaryTypographyProps={{
              sx: { fontWeight: 'medium' }
            }}
          />
        </MUI.MenuItem>
        <MUI.Box sx={{ 
          px: 3, 
          py: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(45deg, ${MUI.alpha(theme.palette.primary.main, 0.02)}, ${MUI.alpha(theme.palette.primary.light, 0.02)})`,
        }}>
          <MUI.Typography variant="subtitle1" sx={{ 
            mb: 2, 
            fontWeight: 'bold',
            color: theme.palette.primary.main
          }}>
            Notificaciones
          </MUI.Typography>
          <MUI.FormControlLabel
            control={
              <MUI.Switch
                checked={notificationSettings.email}
                onChange={() => handleNotificationSettingChange('email')}
                color="primary"
              />
            }
            label={
              <MUI.Box>
                <MUI.Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Correo electrónico
                </MUI.Typography>
                <MUI.Typography variant="caption" color="text.secondary">
                  Recibir notificaciones por correo
                </MUI.Typography>
              </MUI.Box>
            }
            sx={{ mb: 1 }}
          />
          <MUI.FormControlLabel
            control={
              <MUI.Switch
                checked={notificationSettings.push}
                onChange={() => handleNotificationSettingChange('push')}
                color="primary"
              />
            }
            label={
              <MUI.Box>
                <MUI.Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Notificaciones push
                </MUI.Typography>
                <MUI.Typography variant="caption" color="text.secondary">
                  Notificaciones en el navegador
                </MUI.Typography>
              </MUI.Box>
            }
            sx={{ mb: 1 }}
          />
          <MUI.FormControlLabel
            control={
              <MUI.Switch
                checked={notificationSettings.sound}
                onChange={() => handleNotificationSettingChange('sound')}
                color="primary"
              />
            }
            label={
              <MUI.Box>
                <MUI.Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Sonidos
                </MUI.Typography>
                <MUI.Typography variant="caption" color="text.secondary">
                  Reproducir sonidos de notificación
                </MUI.Typography>
              </MUI.Box>
            }
          />
        </MUI.Box>
        <MUI.Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(45deg, ${MUI.alpha(theme.palette.primary.main, 0.02)}, ${MUI.alpha(theme.palette.primary.light, 0.02)})`,
        }}>
          <MUI.Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<Icons.Security />}
            onClick={() => navigate('/configuracion')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: MUI.alpha(theme.palette.primary.main, 0.05),
              }
            }}
          >
            Configuración avanzada
          </MUI.Button>
        </MUI.Box>
      </MUI.Menu>
  
    </MUI.AppBar>
  );
}

export default DashboardAppBar;