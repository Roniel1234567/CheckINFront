import { useState, useEffect } from 'react';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import supervisorService, { Supervisor, CentroDeTrabajo } from '../../services/supervisorService';
import api from '../../services/api';
import Autocomplete from '@mui/material/Autocomplete';

interface ContactoResponse {
  id_contacto: number;
  telefono_contacto: string;
  email_contacto: string;
  estado_contacto: string;
}

function SupervisoresPage() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);
  const [centros, setCentros] = useState<CentroDeTrabajo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [showInactivos, setShowInactivos] = useState(false);
  const [centroFiltro, setCentroFiltro] = useState<string>('');

  // Estados para formularios
  const [formNombre, setFormNombre] = useState('');
  const [formApellido, setFormApellido] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCentro, setFormCentro] = useState('');

  // Estados de error
  const [formErrors, setFormErrors] = useState({
    nombre_sup: false,
    apellido_sup: false,
    telefono_contacto: false,
    email_contacto: false,
    centro_trabajo: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Confirmaciones
  const [confirmInactivar, setConfirmInactivar] = useState(false);
  const [supervisorAInactivar, setSupervisorAInactivar] = useState<Supervisor | null>(null);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [supervisoresData, centrosRes] = await Promise.all([
          supervisorService.getAllSupervisores(),
          api.get<CentroDeTrabajo[]>('/centros-trabajo')
        ]);
        setSupervisores(supervisoresData);
        setCentros(centrosRes.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar datos de supervisores o centros',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const handleOpenDialog = (supervisor?: Supervisor) => {
    if (supervisor) {
      setSelectedSupervisor(supervisor);
      setFormNombre(supervisor.nombre_sup);
      setFormApellido(supervisor.apellido_sup);
      setFormTelefono(supervisor.contacto_sup?.telefono_contacto || '');
      setFormEmail(supervisor.contacto_sup?.email_contacto || '');
      setFormCentro(supervisor.centro_trabajo?.id_centro?.toString() || '');
    } else {
      setSelectedSupervisor(null);
      setFormNombre('');
      setFormApellido('');
      setFormTelefono('');
      setFormEmail('');
      setFormCentro('');
    }
    setActiveTab('2');
  };

  const handleCloseDialog = () => {
    setSelectedSupervisor(null);
    resetFormErrors();
    setActiveTab('1');
  };

  const resetFormErrors = () => {
    setFormErrors({
      nombre_sup: false,
      apellido_sup: false,
      telefono_contacto: false,
      email_contacto: false,
      centro_trabajo: false
    });
  };

  const validateForm = () => {
    const errors = {
      nombre_sup: formNombre.trim() === '',
      apellido_sup: formApellido.trim() === '',
      telefono_contacto: formTelefono.trim() === '',
      email_contacto: formEmail.trim() === '' || !formEmail.includes('@'),
      centro_trabajo: false // Hacemos opcional el centro de trabajo
    };
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSaveSupervisor = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      let contactoId = selectedSupervisor?.contacto_sup?.id_contacto;
      // Si es edición, actualizar contacto
      if (contactoId) {
        await api.put(`/contactos/${contactoId}`, {
          telefono_contacto: formTelefono,
          email_contacto: formEmail
        });
      } else {
        // Crear contacto
        const contactoRes = await api.post<ContactoResponse>('/contactos', {
          telefono_contacto: formTelefono,
          email_contacto: formEmail,
          estado_contacto: 'Activo'
        });
        contactoId = contactoRes.data.id_contacto;
      }

      const supervisorData = {
        nombre_sup: formNombre,
        apellido_sup: formApellido,
        contacto_sup: contactoId as number,
        id_centro: formCentro ? parseInt(formCentro) : null
      };

      if (selectedSupervisor) {
        // Editar supervisor
        await supervisorService.updateSupervisor(selectedSupervisor.id_sup, supervisorData);
        setSnackbar({ open: true, message: 'Supervisor actualizado', severity: 'success' });
      } else {
        // Crear supervisor
        await supervisorService.createSupervisor(supervisorData);
        setSnackbar({ open: true, message: 'Supervisor creado', severity: 'success' });
      }
      // Recargar supervisores
      const supervisoresActualizados = await supervisorService.getAllSupervisores();
      setSupervisores(supervisoresActualizados);
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar:', error);
      setSnackbar({ open: true, message: 'Error al guardar supervisor', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInactivarClick = (supervisor: Supervisor) => {
    setSupervisorAInactivar(supervisor);
    setConfirmInactivar(true);
  };

  const handleCancelInactivar = () => {
    setConfirmInactivar(false);
    setSupervisorAInactivar(null);
  };

  const handleConfirmInactivar = async () => {
    if (!supervisorAInactivar) return;
    try {
      setLoading(true);
      await supervisorService.updateEstadoSupervisor(supervisorAInactivar.id_sup, 'Inactivo');
      setSnackbar({ open: true, message: 'Supervisor inactivado', severity: 'success' });
      const supervisoresActualizados = await supervisorService.getAllSupervisores();
      setSupervisores(supervisoresActualizados);
      handleCancelInactivar();
    } catch (error) {
      console.error('Error al inactivar:', error);
      setSnackbar({ open: true, message: 'Error al inactivar supervisor', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReactivar = async (supervisor: Supervisor) => {
    try {
      setLoading(true);
      await supervisorService.updateEstadoSupervisor(supervisor.id_sup, 'Activo');
      setSnackbar({ open: true, message: 'Supervisor reactivado', severity: 'success' });
      const supervisoresActualizados = await supervisorService.getAllSupervisores();
      setSupervisores(supervisoresActualizados);
    } catch (error) {
      console.error('Error al reactivar:', error);
      setSnackbar({ open: true, message: 'Error al reactivar supervisor', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSupervisores = async () => {
    try {
      setLoading(true);
      const supervisoresActualizados = await supervisorService.getAllSupervisores();
      setSupervisores(supervisoresActualizados);
      setSnackbar({ open: true, message: 'Lista de supervisores actualizada', severity: 'success' });
    } catch (error) {
      console.error('Error al actualizar:', error);
      setSnackbar({ open: true, message: 'Error al actualizar supervisores', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtro por búsqueda y centro
  const supervisoresFiltrados = supervisores.filter(sup => {
    const coincideCentro = centroFiltro ? sup.centro_trabajo?.id_centro?.toString() === centroFiltro : true;
    const coincideBusqueda =
      sup.nombre_sup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.apellido_sup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sup.contacto_sup?.email_contacto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sup.contacto_sup?.telefono_contacto || '').toLowerCase().includes(searchTerm.toLowerCase());
    const coincideEstado = showInactivos ? true : sup.estado_sup === 'Activo';
    return coincideCentro && coincideBusqueda && coincideEstado;
  });

  return (
    <MUI.Box sx={{ 
      display: 'flex', 
      width: '100vw', 
      minHeight: '100vh', 
      bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), 
      p: 0 
    }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar notifications={4} toggleDrawer={toggleDrawer} />
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
            <MUI.CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          </MUI.Box>
        )}
        <MUI.Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <MUI.Box>
            <MUI.Typography 
              variant="h2" 
              sx={{ 
                mb: 1, 
                fontWeight: 'bold', 
                color: theme.palette.primary.main, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              <Icons.SupervisorAccount sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }} />
              Gestión de Supervisores
            </MUI.Typography>
            <MUI.Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Administra los supervisores del sistema y asígnalos a centros de trabajo
            </MUI.Typography>
          </MUI.Box>

          <TabContext value={activeTab}>
            <MUI.Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <TabList onChange={(e, value) => setActiveTab(value)} aria-label="Pestañas de gestión">
                <MUI.Tab 
                  label="Lista de Supervisores" 
                  value="1" 
                  icon={<Icons.List />} 
                  iconPosition="start"
                  sx={{ 
                    fontWeight: 'medium',
                    minHeight: '48px' 
                  }}
                />
                <MUI.Tab 
                  label={selectedSupervisor ? "Editar Supervisor" : "Nuevo Supervisor"} 
                  value="2" 
                  icon={<Icons.PersonAdd />} 
                  iconPosition="start"
                  sx={{ 
                    fontWeight: 'medium',
                    minHeight: '48px'
                  }}
                  disabled={activeTab === '1'}
                />
              </TabList>
            </MUI.Box>

            <TabPanel value="1" sx={{ p: 0 }}>
              <MUI.Paper 
                elevation={4} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: 2,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                <MUI.Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 2, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                  <MUI.Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <MUI.Autocomplete
                      options={centros}
                      getOptionLabel={(option) => option.nombre_centro}
                      value={centros.find(c => c.id_centro.toString() === centroFiltro) || null}
                      onChange={(_, newValue) => setCentroFiltro(newValue ? newValue.id_centro.toString() : '')}
                      renderInput={(params) => (
                        <MUI.TextField {...params} label="Filtrar por centro" variant="outlined" size="small" />
                      )}
                      isOptionEqualToValue={(option, value) => option.id_centro === value.id_centro}
                      sx={{ minWidth: '200px' }}
                    />
                    <MUI.TextField
                      variant="outlined"
                      size="small"
                      label="Buscar supervisor"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <MUI.InputAdornment position="start">
                            <Icons.Search />
                          </MUI.InputAdornment>
                        ),
                      }}
                      sx={{ minWidth: '200px' }}
                    />
                    <MUI.FormControlLabel
                      control={
                        <MUI.Switch
                          checked={showInactivos}
                          onChange={e => setShowInactivos(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Mostrar inactivos"
                    />
                  </MUI.Box>

                  <MUI.Box sx={{ display: 'flex', gap: 2 }}>
                    <MUI.Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Icons.Refresh />}
                      onClick={handleRefreshSupervisores}
                    >
                      Actualizar
                    </MUI.Button>
                    <MUI.Button
                      variant="contained"
                      color="primary"
                      startIcon={<Icons.Add />}
                      onClick={() => handleOpenDialog()}
                    >
                      Nuevo
                    </MUI.Button>
                  </MUI.Box>
                </MUI.Box>

                {supervisoresFiltrados.length === 0 ? (
                  <MUI.Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    py: 4,
                    bgcolor: theme.palette.background.default,
                    borderRadius: 2
                  }}>
                    <Icons.PersonOff sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
                    <MUI.Typography variant="h6" color="text.secondary">
                      No se encontraron supervisores
                    </MUI.Typography>
                    <MUI.Typography variant="body2" color="text.secondary">
                      Intenta con otros filtros o crea un nuevo supervisor
                    </MUI.Typography>
                  </MUI.Box>
                ) : (
                  <MUI.TableContainer component={MUI.Paper} sx={{ 
                    maxHeight: '60vh',
                    boxShadow: 'none',
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 1
                  }}>
                    <MUI.Table stickyHeader>
                      <MUI.TableHead>
                        <MUI.TableRow>
                          <MUI.TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.light, color: '#fff' }}>Nombre</MUI.TableCell>
                          <MUI.TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.light, color: '#fff' }}>Contacto</MUI.TableCell>
                          <MUI.TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.light, color: '#fff' }}>Centro de trabajo</MUI.TableCell>
                          <MUI.TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.light, color: '#fff' }}>Estado</MUI.TableCell>
                          <MUI.TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.light, color: '#fff' }}>Acciones</MUI.TableCell>
                        </MUI.TableRow>
                      </MUI.TableHead>
                      <MUI.TableBody>
                        {supervisoresFiltrados.map(supervisor => (
                          <MUI.TableRow 
                            key={supervisor.id_sup}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: theme.palette.action.hover 
                              },
                              bgcolor: supervisor.estado_sup === 'Inactivo' ? MUI.alpha(theme.palette.error.light, 0.1) : 'inherit'
                            }}
                          >
                            <MUI.TableCell>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MUI.Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                  {supervisor.nombre_sup.charAt(0).toUpperCase()}
                                </MUI.Avatar>
                                <MUI.Box>
                                  <MUI.Typography variant="body1" fontWeight="medium">
                                    {supervisor.nombre_sup} {supervisor.apellido_sup}
                                  </MUI.Typography>
                                  <MUI.Typography variant="caption" color="text.secondary">
                                    ID: {supervisor.id_sup}
                                  </MUI.Typography>
                                </MUI.Box>
                              </MUI.Box>
                            </MUI.TableCell>
                            <MUI.TableCell>
                              <MUI.Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Email fontSize="small" color="action" />
                                {supervisor.contacto_sup?.email_contacto}
                              </MUI.Typography>
                              <MUI.Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Phone fontSize="small" color="action" />
                                {supervisor.contacto_sup?.telefono_contacto}
                              </MUI.Typography>
                            </MUI.TableCell>
                            <MUI.TableCell>
                              {supervisor.centro_trabajo ? (
                                <MUI.Chip
                                  icon={<Icons.Business />}
                                  label={supervisor.centro_trabajo.nombre_centro}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              ) : (
                                <MUI.Chip
                                  icon={<Icons.DoNotDisturb />}
                                  label="Sin asignar"
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                />
                              )}
                            </MUI.TableCell>
                            <MUI.TableCell>
                              <MUI.Chip
                                label={supervisor.estado_sup}
                                color={supervisor.estado_sup === 'Activo' ? 'success' : 'error'}
                                size="small"
                                variant={supervisor.estado_sup === 'Activo' ? 'filled' : 'outlined'}
                              />
                            </MUI.TableCell>
                            <MUI.TableCell align="center">
                              <MUI.Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <MUI.Tooltip title="Editar">
                                  <MUI.IconButton 
                                    color="primary"
                                    size="small"
                                    onClick={() => handleOpenDialog(supervisor)}
                                  >
                                    <Icons.Edit />
                                  </MUI.IconButton>
                                </MUI.Tooltip>
                                {supervisor.estado_sup === 'Activo' ? (
                                  <MUI.Tooltip title="Inactivar">
                                    <MUI.IconButton 
                                      color="error"
                                      size="small"
                                      onClick={() => handleInactivarClick(supervisor)}
                                    >
                                      <Icons.PersonOff />
                                    </MUI.IconButton>
                                  </MUI.Tooltip>
                                ) : (
                                  <MUI.Tooltip title="Reactivar">
                                    <MUI.IconButton 
                                      color="success"
                                      size="small"
                                      onClick={() => handleReactivar(supervisor)}
                                    >
                                      <Icons.PersonAdd />
                                    </MUI.IconButton>
                                  </MUI.Tooltip>
                                )}
                              </MUI.Box>
                            </MUI.TableCell>
                          </MUI.TableRow>
                        ))}
                      </MUI.TableBody>
                    </MUI.Table>
                  </MUI.TableContainer>
                )}
              </MUI.Paper>
            </TabPanel>

            <TabPanel value="2" sx={{ p: 0 }}>
              <MUI.Paper 
                elevation={4} 
                sx={{ 
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                <MUI.Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: theme.palette.primary.main,
                    fontWeight: 'bold'
                  }}
                >
                  {selectedSupervisor ? <Icons.Edit /> : <Icons.PersonAdd />}
                  {selectedSupervisor ? 'Editar Supervisor' : 'Nuevo Supervisor'}
                </MUI.Typography>
                <MUI.Grid container spacing={3}>
                  <MUI.Grid item xs={12} md={6}>
                    <MUI.TextField
                      fullWidth
                      label="Nombre"
                      value={formNombre}
                      onChange={e => setFormNombre(e.target.value)}
                      error={formErrors.nombre_sup}
                      helperText={formErrors.nombre_sup ? 'Campo requerido' : ''}
                      InputProps={{
                        startAdornment: (
                          <MUI.InputAdornment position="start">
                            <Icons.Person />
                          </MUI.InputAdornment>
                        ),
                      }}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} md={6}>
                    <MUI.TextField
                      fullWidth
                      label="Apellido"
                      value={formApellido}
                      onChange={e => setFormApellido(e.target.value)}
                      error={formErrors.apellido_sup}
                      helperText={formErrors.apellido_sup ? 'Campo requerido' : ''}
                      InputProps={{
                        startAdornment: (
                          <MUI.InputAdornment position="start">
                            <Icons.Person />
                          </MUI.InputAdornment>
                        ),
                      }}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} md={6}>
                    <MUI.TextField
                      fullWidth
                      label="Teléfono"
                      value={formTelefono}
                      onChange={e => setFormTelefono(e.target.value)}
                      error={formErrors.telefono_contacto}
                      helperText={formErrors.telefono_contacto ? 'Campo requerido' : ''}
                      InputProps={{
                        startAdornment: (
                          <MUI.InputAdornment position="start">
                            <Icons.Phone />
                          </MUI.InputAdornment>
                        ),
                      }}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} md={6}>
                    <MUI.TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      error={formErrors.email_contacto}
                      helperText={formErrors.email_contacto ? 'Email válido requerido' : ''}
                      InputProps={{
                        startAdornment: (
                          <MUI.InputAdornment position="start">
                            <Icons.Email />
                          </MUI.InputAdornment>
                        ),
                      }}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} md={6}>
                    <MUI.Autocomplete
                      options={centros}
                      getOptionLabel={(option) => option.nombre_centro}
                      value={centros.find(c => c.id_centro.toString() === formCentro) || null}
                      onChange={(_, newValue) => setFormCentro(newValue ? newValue.id_centro.toString() : '')}
                      renderInput={(params) => (
                        <MUI.TextField {...params} label="Centro de Trabajo" variant="outlined" />
                      )}
                      isOptionEqualToValue={(option, value) => option.id_centro === value.id_centro}
                      clearOnEscape
                      sx={{ width: '100%' }}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <MUI.Button 
                        variant="outlined" 
                        color="inherit" 
                        startIcon={<Icons.Close />} 
                        onClick={handleCloseDialog}
                      >
                        Cancelar
                      </MUI.Button>
                      <MUI.Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<Icons.Save />} 
                        onClick={handleSaveSupervisor}
                      >
                        {selectedSupervisor ? 'Actualizar' : 'Guardar'}
                      </MUI.Button>
                    </MUI.Box>
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Paper>
            </TabPanel>
          </TabContext>
        </MUI.Container>
        
        {/* Diálogo de confirmación para inactivar */}
        <MUI.Dialog open={confirmInactivar} onClose={handleCancelInactivar}>
          <MUI.DialogTitle>
            Inactivar supervisor
          </MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.DialogContentText>
              ¿Estás seguro que deseas inactivar al supervisor {supervisorAInactivar?.nombre_sup} {supervisorAInactivar?.apellido_sup}?
              Los supervisores inactivos no podrán ser asignados a centros de trabajo.
            </MUI.DialogContentText>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={handleCancelInactivar} color="inherit">
              Cancelar
            </MUI.Button>
            <MUI.Button onClick={handleConfirmInactivar} color="error" variant="contained" startIcon={<Icons.PersonOff />}>
              Inactivar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Snackbar para notificaciones */}
        <MUI.Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MUI.Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
}

export default SupervisoresPage; 