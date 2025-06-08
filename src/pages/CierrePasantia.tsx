import * as MUI from '@mui/material';
import { useState } from 'react';
import api from '../services/api';
import * as Icons from '@mui/icons-material';
import SideBar from '../components/SideBar';
import DashboardAppBar from '../components/DashboardAppBar';
import { userService } from '../services/userService';
import { useReadOnlyMode } from '../hooks/useReadOnlyMode';

interface Plaza {
  id_plaza: number;
  estado: string;
}

interface Estudiante {
  documento_id_est: string;
  fecha_inicio_pasantia: string | null;
  fecha_fin_pasantia: string | null;
  horaspasrealizadas_est: number | null;
  usuario_est?: {
    id_usuario: number;
  };
}

function CierrePasantia() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const notifications = 4;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const isReadOnly = useReadOnlyMode();

  const handleCierrePasantia = async () => {
    try {
      setLoading(true);
      
      // 1. Actualizar estado de plazas a Inactiva
      const plazasResponse = await api.get<Plaza[]>('/plazas');
      const plazasActivas = plazasResponse.data.filter((plaza: Plaza) => plaza.estado === 'Activa');
      
      // Actualizamos cada plaza activa
      await Promise.all(plazasActivas.map((plaza: Plaza) => 
        api.put(`/plazas/${plaza.id_plaza}`, {
          estado: 'Inactiva'
        })
      ));
      
      // 2. Obtener estudiantes y actualizar estado de usuarios
      const estudiantesResponse = await api.get<Estudiante[]>('/estudiantes');
      
      // Obtener todos los IDs de usuario de estudiantes que tienen usuario asociado
      const usuariosAActualizar = estudiantesResponse.data
        .filter(estudiante => estudiante.usuario_est?.id_usuario)
        .map(estudiante => estudiante.usuario_est!.id_usuario);
      
      // Actualizar estado de usuarios a Eliminado para todos los estudiantes
      await Promise.all(usuariosAActualizar.map(id_usuario =>
        userService.updateUser(id_usuario, {
          estado_usuario: 'Eliminado'
        })
      ));
      
      // 3. Actualizar fecha_fin_pasantia para estudiantes que no la tengan
      const fechaActual = new Date().toISOString().split('T')[0];
      const estudiantesSinFecha = estudiantesResponse.data.filter((estudiante: Estudiante) => 
        !estudiante.fecha_fin_pasantia
      );
      
      // Actualizamos cada estudiante sin fecha de fin
      await Promise.all(estudiantesSinFecha.map((estudiante: Estudiante) =>
        api.put(`/estudiantes/${estudiante.documento_id_est}/fechas`, {
          fecha_inicio_pasantia: estudiante.fecha_inicio_pasantia,
          fecha_fin_pasantia: fechaActual,
          horaspasrealizadas_est: estudiante.horaspasrealizadas_est || 0
        })
      ));

      setSnackbar({
        open: true,
        message: 'Sistema reiniciado exitosamente',
        severity: 'success'
      });
      setOpenDialog(false);
    } catch (error: unknown) {
      console.error('Error durante el cierre de pasantía:', error);
      setSnackbar({
        open: true,
        message: 'Error durante el cierre de pasantía',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MUI.Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

      <MUI.Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DashboardAppBar notifications={notifications} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

        <MUI.Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <MUI.Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              background: 'linear-gradient(135deg, #f8fafc 60%, #e3e9f7 100%)',
              position: 'relative',
              overflow: 'hidden',
              animation: 'fadeInUp 0.8s cubic-bezier(.39,.575,.56,1.000)',
              '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(40px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              },
              transition: 'box-shadow 0.3s',
              '&:hover': {
                boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.22)',
              },
            }}
          >
            <MUI.Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3, letterSpacing: 1 }}>
              Cierre de Pasantías
            </MUI.Typography>

            <MUI.Typography variant="body1" paragraph>
              Esta acción reiniciará el sistema de pasantías, realizando las siguientes operaciones:
            </MUI.Typography>

            <MUI.List>
              <MUI.ListItem>
                <MUI.ListItemIcon>
                  <Icons.Business sx={{ color: 'secondary.main', fontSize: 32, transition: 'transform 0.4s', '&:hover': { transform: 'scale(1.15) rotate(-8deg)' } }} />
                </MUI.ListItemIcon>
                <MUI.ListItemText 
                  primary={<span style={{ fontWeight: 500 }}>Actualizar estado de plazas</span>} 
                  secondary="Todas las plazas pasarán a estado Inactiva"
                />
              </MUI.ListItem>
              <MUI.ListItem>
                <MUI.ListItemIcon>
                  <Icons.Person sx={{ color: 'info.main', fontSize: 32, transition: 'transform 0.4s', '&:hover': { transform: 'scale(1.15) rotate(8deg)' } }} />
                </MUI.ListItemIcon>
                <MUI.ListItemText 
                  primary={<span style={{ fontWeight: 500 }}>Actualizar estado de usuarios</span>} 
                  secondary="Los usuarios relacionados con estudiantes pasarán a estado Eliminado"
                />
              </MUI.ListItem>
              <MUI.ListItem>
                <MUI.ListItemIcon>
                  <Icons.Event sx={{ color: 'success.main', fontSize: 32, transition: 'transform 0.4s', '&:hover': { transform: 'scale(1.15) rotate(-8deg)' } }} />
                </MUI.ListItemIcon>
                <MUI.ListItemText 
                  primary={<span style={{ fontWeight: 500 }}>Actualizar fechas de fin</span>} 
                  secondary="Se establecerá la fecha actual como fecha de fin para las pasantías sin fecha de finalización"
                />
              </MUI.ListItem>
            </MUI.List>

            <MUI.Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <MUI.Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Icons.Warning sx={{ animation: 'pulse 1.2s infinite alternate' }} />}
                onClick={() => setOpenDialog(true)}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 16px 0 rgba(255, 0, 0, 0.10)',
                  transition: 'box-shadow 0.3s, transform 0.2s',
                  '&:hover': {
                    boxShadow: '0 8px 32px 0 rgba(255, 0, 0, 0.18)',
                    transform: 'translateY(-2px) scale(1.04)',
                  },
                  '@keyframes pulse': {
                    '0%': { filter: 'drop-shadow(0 0 0 #ff1744)' },
                    '100%': { filter: 'drop-shadow(0 0 8px #ff1744)' }
                  }
                }}
              >
                Iniciar Cierre de Pasantías
              </MUI.Button>
            </MUI.Box>
          </MUI.Paper>
        </MUI.Container>

        {/* Diálogo de confirmación */}
        <MUI.Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              background: 'linear-gradient(135deg, #fff 70%, #ffeaea 100%)',
              boxShadow: '0 8px 32px 0 rgba(255, 23, 68, 0.10)',
              animation: 'fadeInScale 0.5s',
              '@keyframes fadeInScale': {
                '0%': { opacity: 0, transform: 'scale(0.95)' },
                '100%': { opacity: 1, transform: 'scale(1)' }
              }
            }
          }}
        >
          <MUI.DialogTitle id="alert-dialog-title" sx={{ color: 'error.main' }}>
            {"¿Está seguro de realizar el cierre de pasantías?"}
          </MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.DialogContentText id="alert-dialog-description">
              Esta acción es irreversible y afectará a todos los registros del sistema.
              Se recomienda realizar una copia de seguridad antes de proceder.
            </MUI.DialogContentText>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button 
              onClick={() => setOpenDialog(false)}
              color="primary"
            >
              Cancelar
            </MUI.Button>
            <MUI.Button
              onClick={handleCierrePasantia}
              color="error"
              variant="contained"
              autoFocus
              disabled={isReadOnly || loading}
            >
              {loading ? <MUI.CircularProgress size={24} /> : "Confirmar Cierre"}
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Snackbar para mensajes */}
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <MUI.Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>

        {/* Backdrop para loading */}
        <MUI.Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <MUI.CircularProgress color="inherit" />
        </MUI.Backdrop>
      </MUI.Box>
    </MUI.Box>
  );
}

export default CierrePasantia; 