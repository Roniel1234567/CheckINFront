import * as MUI from '@mui/material';
import { useState } from 'react';
import api from '../services/api';
import * as Icons from '@mui/icons-material';
import SideBar from '../components/SideBar';
import DashboardAppBar from '../components/DashboardAppBar';
import { userService } from '../services/userService';

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
          <MUI.Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <MUI.Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
              Cierre de Pasantías
            </MUI.Typography>

            <MUI.Typography variant="body1" paragraph>
              Esta acción reiniciará el sistema de pasantías, realizando las siguientes operaciones:
            </MUI.Typography>

            <MUI.List>
              <MUI.ListItem>
                <MUI.ListItemIcon>
                  <Icons.Business />
                </MUI.ListItemIcon>
                <MUI.ListItemText 
                  primary="Actualizar estado de plazas" 
                  secondary="Todas las plazas pasarán a estado Inactiva"
                />
              </MUI.ListItem>
              <MUI.ListItem>
                <MUI.ListItemIcon>
                  <Icons.Person />
                </MUI.ListItemIcon>
                <MUI.ListItemText 
                  primary="Actualizar estado de usuarios" 
                  secondary="Los usuarios relacionados con estudiantes pasarán a estado Eliminado"
                />
              </MUI.ListItem>
              <MUI.ListItem>
                <MUI.ListItemIcon>
                  <Icons.Event />
                </MUI.ListItemIcon>
                <MUI.ListItemText 
                  primary="Actualizar fechas de fin" 
                  secondary="Se establecerá la fecha actual como fecha de fin para las pasantías sin fecha de finalización"
                />
              </MUI.ListItem>
            </MUI.List>

            <MUI.Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <MUI.Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Icons.Warning />}
                onClick={() => setOpenDialog(true)}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
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
              disabled={loading}
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