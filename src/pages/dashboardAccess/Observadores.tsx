import { useState, useEffect } from 'react';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';

// Interfaces
interface Usuario {
  id_usuario: number;
  dato_usuario: string;
  contrasena_usuario: string;
  rol_usuario: number;
  estado_usuario: 'Activo' | 'Inactivo' | 'Eliminado';
  creacion_usuario: Date;
  email_usuario?: string;
}

function ObservadoresPage() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [observadores, setObservadores] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObservador, setSelectedObservador] = useState<Usuario | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [showInactivos, setShowInactivos] = useState(false);

  // Estado para confirmar desactivación
  const [confirmDesactivar, setConfirmDesactivar] = useState(false);
  const [observadorADesactivar, setObservadorADesactivar] = useState<Usuario | null>(null);

  // Estado para confirmar restauración
  const [confirmRestaurar, setConfirmRestaurar] = useState(false);
  const [observadorARestaurar, setObservadorARestaurar] = useState<Usuario | null>(null);

  // Form states
  const [formUsuario, setFormUsuario] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContrasena, setFormContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Error states
  const [formErrors, setFormErrors] = useState({
    dato_usuario: false,
    email_usuario: false,
    contrasena_usuario: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Estado para verificar disponibilidad de usuario
  const [usuarioDisponible, setUsuarioDisponible] = useState(true);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar solo usuarios con rol 5 (observador)
        const { data: users } = await (await import('../../services/api')).default.get<Usuario[]>('/usuarios');
        setObservadores(users.filter(u => u.rol_usuario === 5));
      } catch {
        setSnackbar({
          open: true,
          message: 'Error al cargar los observadores',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenDialog = (observador?: Usuario) => {
    if (observador) {
      setSelectedObservador(observador);
      setFormUsuario(observador.dato_usuario);
      setFormEmail(observador.email_usuario || '');
      setFormContrasena('');
    } else {
      setSelectedObservador(null);
      setFormUsuario('');
      setFormEmail('');
      setFormContrasena('');
    }
    setActiveTab('2');
  };

  const handleCloseDialog = () => {
    setSelectedObservador(null);
    resetFormErrors();
    setActiveTab('1');
  };

  const resetFormErrors = () => {
    setFormErrors({
      dato_usuario: false,
      email_usuario: false,
      contrasena_usuario: false
    });
  };

  const validateForm = () => {
    const errors = {
      dato_usuario: formUsuario.trim() === '',
      email_usuario: formEmail.trim() === '' || !formEmail.includes('@'),
      contrasena_usuario: !selectedObservador && formContrasena.trim() === ''
    };
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Verificar si el nombre de usuario ya existe
  const checkUsuario = async (usuario: string) => {
    if (!usuario || (selectedObservador && selectedObservador.dato_usuario === usuario)) {
      setUsuarioDisponible(true);
      return;
    }
    try {
      await (await import('../../services/api')).default.get(`/usuarios/buscar/${usuario}`);
      setUsuarioDisponible(false);
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'response' in e && (e as { response?: { status?: number } }).response?.status === 404) {
        setUsuarioDisponible(true);
      } else {
        setUsuarioDisponible(true);
      }
    }
  };

  const handleSaveObservador = async () => {
    if (!validateForm()) return;
    if (!selectedObservador && !usuarioDisponible) {
      setSnackbar({ open: true, message: 'El nombre de usuario ya está en uso.', severity: 'error' });
      return;
    }
    try {
      setLoading(true);
      if (selectedObservador) {
        // Actualizar usuario
        await (await import('../../services/api')).default.put(`/usuarios/${selectedObservador.id_usuario}`, {
          dato_usuario: formUsuario,
          email_usuario: formEmail,
          ...(formContrasena.trim() !== '' && { contrasena_usuario: formContrasena })
        });
        setSnackbar({ open: true, message: 'Observador actualizado correctamente', severity: 'success' });
      } else {
        // Crear usuario con rol 5 (Observador)
        await (await import('../../services/api')).default.post('/usuarios', {
          dato_usuario: formUsuario,
          contrasena_usuario: formContrasena,
          email_usuario: formEmail,
          rol_usuario: 5,
          estado_usuario: 'Activo'
        });
        setSnackbar({ open: true, message: 'Observador creado correctamente', severity: 'success' });
      }
      // Recargar observadores
      const { data: users } = await (await import('../../services/api')).default.get<Usuario[]>('/usuarios');
      setObservadores(users.filter(u => u.rol_usuario === 5));
      handleCloseDialog();
    } catch {
      setSnackbar({ open: true, message: 'Error al guardar el observador', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrado de observadores
  const observadoresFiltrados = observadores.filter(obs => {
    const usuario = obs.dato_usuario?.toLowerCase() || '';
    const email = obs.email_usuario?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return usuario.includes(search) || email.includes(search);
  }).filter(obs => {
    if (showInactivos) return true;
    return obs.estado_usuario === 'Activo';
  });

  // Acciones de desactivar/restaurar
  const handleDesactivarClick = (obs: Usuario) => {
    setObservadorADesactivar(obs);
    setConfirmDesactivar(true);
  };
  const handleCancelDesactivar = () => {
    setConfirmDesactivar(false);
    setObservadorADesactivar(null);
  };
  const handleRestaurarClick = (obs: Usuario) => {
    setObservadorARestaurar(obs);
    setConfirmRestaurar(true);
  };
  const handleCancelRestaurar = () => {
    setConfirmRestaurar(false);
    setObservadorARestaurar(null);
  };
  const handleConfirmRestaurar = async () => {
    if (!observadorARestaurar) return;
    try {
      setLoading(true);
      await (await import('../../services/api')).default.put(`/usuarios/${observadorARestaurar.id_usuario}`, { estado_usuario: 'Activo' });
      setSnackbar({ open: true, message: 'Observador restaurado correctamente', severity: 'success' });
      const { data: users } = await (await import('../../services/api')).default.get<Usuario[]>('/usuarios');
      setObservadores(users.filter(u => u.rol_usuario === 5));
      handleCancelRestaurar();
    } catch {
      setSnackbar({ open: true, message: 'Error al restaurar el observador', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmDesactivar = async () => {
    if (!observadorADesactivar) return;
    try {
      setLoading(true);
      await (await import('../../services/api')).default.put(`/usuarios/${observadorADesactivar.id_usuario}`, { estado_usuario: 'Eliminado' });
      setSnackbar({ open: true, message: 'Observador eliminado correctamente', severity: 'success' });
      const { data: users } = await (await import('../../services/api')).default.get<Usuario[]>('/usuarios');
      setObservadores(users.filter(u => u.rol_usuario === 5));
      handleCancelDesactivar();
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar el observador', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Renderizado
  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar toggleDrawer={toggleDrawer} />
        {loading && (
          <MUI.Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.8)', zIndex: 9999 }}>
            <MUI.CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          </MUI.Box>
        )}
        <MUI.Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <MUI.Box>
            <MUI.Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Icons.Visibility sx={{ fontSize: '2.5rem' }} />
              Gestión de Observadores
            </MUI.Typography>
            <MUI.Typography variant="body1" color="text.secondary">
              Administra los usuarios observadores del sistema
            </MUI.Typography>
          </MUI.Box>
          <TabContext value={activeTab}>
            <MUI.Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
              <TabList onChange={(_, v) => setActiveTab(v)} aria-label="Gestión de observadores" variant="scrollable" scrollButtons="auto">
                <MUI.Tab label="Observadores" value="1" icon={<Icons.ViewList />} />
                <MUI.Tab label={selectedObservador ? "Editar Observador" : "Nuevo Observador"} value="2" icon={selectedObservador ? <Icons.Edit /> : <Icons.Add />} />
              </TabList>
            </MUI.Box>
            {/* Tab 1: Listado */}
            <TabPanel value="1">
              <MUI.Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <MUI.TextField
                  placeholder="Buscar observador..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flexGrow: 1, minWidth: 200 }}
                  InputProps={{ startAdornment: <Icons.Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />
                <MUI.Button variant="contained" color="primary" startIcon={<Icons.Add />} onClick={() => handleOpenDialog()}>
                  Nuevo Observador
                </MUI.Button>
                <MUI.FormControlLabel
                  control={<MUI.Switch checked={showInactivos} onChange={(e) => setShowInactivos(e.target.checked)} color="primary" />}
                  label="Mostrar inactivos/eliminados"
                  sx={{ mx: 2 }}
                />
              </MUI.Box>
              <MUI.TableContainer component={MUI.Paper} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', mb: 4 }}>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Correo</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {observadoresFiltrados.length === 0 ? (
                      <MUI.TableRow>
                        <MUI.TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Icons.SearchOff sx={{ fontSize: '3rem', color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                          <MUI.Typography variant="body1" color="text.secondary">
                            {observadores.length === 0 ? "No hay observadores registrados. Prueba creando uno nuevo." : searchTerm ? "No hay observadores que coincidan con la búsqueda." : !showInactivos ? "No hay observadores activos. Prueba activando 'Mostrar inactivos/eliminados'." : "No se encontraron observadores."}
                          </MUI.Typography>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ) : (
                      observadoresFiltrados.map((obs) => (
                        <MUI.TableRow key={obs.id_usuario} sx={{ '&:hover': { bgcolor: 'action.hover' }, ...(obs.estado_usuario !== 'Activo' && { bgcolor: MUI.alpha(theme.palette.error.light, 0.05), opacity: 0.8 }) }}>
                          <MUI.TableCell>
                            <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icons.Person sx={{ color: theme.palette.primary.main, opacity: 0.7 }} />
                              <MUI.Typography variant="body1" fontWeight="medium">{obs.dato_usuario}</MUI.Typography>
                            </MUI.Box>
                          </MUI.TableCell>
                          <MUI.TableCell>
                            <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icons.Email sx={{ opacity: 0.6 }} />
                              <MUI.Typography variant="body2">{obs.email_usuario || '-'}</MUI.Typography>
                            </MUI.Box>
                          </MUI.TableCell>
                          <MUI.TableCell>
                            <MUI.Chip label={obs.estado_usuario || 'Desconocido'} color={obs.estado_usuario === 'Activo' ? 'success' : obs.estado_usuario === 'Eliminado' ? 'error' : 'warning'} size="small" sx={{ fontWeight: 'bold' }} />
                          </MUI.TableCell>
                          <MUI.TableCell>
                            <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                              <MUI.Tooltip title="Editar">
                                <MUI.IconButton color="primary" onClick={() => handleOpenDialog(obs)} size="small">
                                  <Icons.Edit />
                                </MUI.IconButton>
                              </MUI.Tooltip>
                              {obs.estado_usuario === 'Activo' ? (
                                <MUI.Tooltip title="Eliminar">
                                  <MUI.IconButton color="error" onClick={() => handleDesactivarClick(obs)} size="small">
                                    <Icons.Delete />
                                  </MUI.IconButton>
                                </MUI.Tooltip>
                              ) : obs.estado_usuario === 'Eliminado' ? (
                                <MUI.Tooltip title="Restaurar observador">
                                  <MUI.IconButton color="success" onClick={() => handleRestaurarClick(obs)} size="small">
                                    <Icons.RestoreFromTrash />
                                  </MUI.IconButton>
                                </MUI.Tooltip>
                              ) : (
                                <MUI.Tooltip title="Estado desconocido">
                                  <span>
                                    <MUI.IconButton disabled size="small">
                                      <Icons.Block />
                                    </MUI.IconButton>
                                  </span>
                                </MUI.Tooltip>
                              )}
                            </MUI.Box>
                          </MUI.TableCell>
                        </MUI.TableRow>
                      ))
                    )}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </TabPanel>
            {/* Tab 2: Formulario */}
            <TabPanel value="2">
              <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 3, maxWidth: 500, mx: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <MUI.Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedObservador ? <Icons.Edit /> : <Icons.Add />}
                  {selectedObservador ? 'Editar Observador' : 'Nuevo Observador'}
                </MUI.Typography>
                <MUI.Grid container spacing={3}>
                  <MUI.Grid item xs={12}>
                    <MUI.TextField label="Nombre de Usuario" variant="outlined" fullWidth value={formUsuario} onChange={(e) => { setFormUsuario(e.target.value); checkUsuario(e.target.value); }} onBlur={(e) => checkUsuario(e.target.value)} error={formErrors.dato_usuario || !usuarioDisponible} helperText={formErrors.dato_usuario ? 'Este campo es obligatorio' : !usuarioDisponible ? 'Este nombre de usuario ya está en uso' : ''} disabled={!!selectedObservador} InputProps={{ startAdornment: (<MUI.InputAdornment position="start"><Icons.Person /></MUI.InputAdornment>), }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.TextField label="Correo electrónico" variant="outlined" fullWidth type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} error={formErrors.email_usuario} helperText={formErrors.email_usuario ? 'Email válido obligatorio' : ''} InputProps={{ startAdornment: (<MUI.InputAdornment position="start"><Icons.Email /></MUI.InputAdornment>), }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.TextField label={selectedObservador ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"} variant="outlined" fullWidth type={showPassword ? "text" : "password"} value={formContrasena} onChange={(e) => setFormContrasena(e.target.value)} error={formErrors.contrasena_usuario} helperText={formErrors.contrasena_usuario ? 'Este campo es obligatorio' : ''} InputProps={{ startAdornment: (<MUI.InputAdornment position="start"><Icons.Lock /></MUI.InputAdornment>), endAdornment: (<MUI.InputAdornment position="end"><MUI.IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <Icons.VisibilityOff /> : <Icons.Visibility />}</MUI.IconButton></MUI.InputAdornment>) }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <MUI.Button variant="outlined" color="inherit" startIcon={<Icons.Close />} onClick={handleCloseDialog}>Cancelar</MUI.Button>
                      <MUI.Button variant="contained" color="primary" startIcon={<Icons.Save />} onClick={handleSaveObservador}>{selectedObservador ? 'Actualizar' : 'Guardar'}</MUI.Button>
                    </MUI.Box>
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Paper>
            </TabPanel>
          </TabContext>
        </MUI.Container>
        {/* Diálogo de confirmación para eliminar */}
        <MUI.Dialog open={confirmDesactivar} onClose={handleCancelDesactivar} maxWidth="xs" fullWidth>
          <MUI.DialogTitle sx={{ backgroundColor: theme.palette.error.main, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icons.Warning /> Eliminar Observador
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2 }}>
            <MUI.Typography variant="body1">¿Está seguro de que desea eliminar al observador "{observadorADesactivar?.dato_usuario}"?</MUI.Typography>
            <MUI.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>El observador se marcará como eliminado y no podrá acceder al sistema.</MUI.Typography>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={handleCancelDesactivar} startIcon={<Icons.Close />}>Cancelar</MUI.Button>
            <MUI.Button variant="contained" color="error" onClick={handleConfirmDesactivar} startIcon={<Icons.Delete />}>Eliminar</MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
        {/* Diálogo de confirmación para restaurar */}
        <MUI.Dialog open={confirmRestaurar} onClose={handleCancelRestaurar} maxWidth="xs" fullWidth>
          <MUI.DialogTitle sx={{ backgroundColor: theme.palette.success.main, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icons.RestoreFromTrash /> Restaurar Observador
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2 }}>
            <MUI.Typography variant="body1">¿Está seguro de que desea restaurar al observador "{observadorARestaurar?.dato_usuario}"?</MUI.Typography>
            <MUI.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>El observador se marcará como activo y podrá acceder nuevamente al sistema.</MUI.Typography>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={handleCancelRestaurar} startIcon={<Icons.Close />}>Cancelar</MUI.Button>
            <MUI.Button variant="contained" color="success" onClick={handleConfirmRestaurar} startIcon={<Icons.RestoreFromTrash />}>Restaurar</MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
        {/* Snackbar para notificaciones */}
        <MUI.Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <MUI.Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" elevation={6} sx={{ width: '100%' }}>{snackbar.message}</MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
}

export default ObservadoresPage; 