import { useState, useEffect } from 'react';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import api from '../../services/api';
import tallerService, { FamiliaProfesional, NuevaFamilia } from '../../services/tallerService';

// Interfaces
interface Taller {
  id_taller: string;
  nombre_taller: string;
  familia_taller: FamiliaProfesional;
  cod_titulo_taller: string;
  estado_taller: 'Activo' | 'Inactivo';
}

function TallerPage() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [familias, setFamilias] = useState<FamiliaProfesional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState<Taller | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showInactivos, setShowInactivos] = useState(false);
  
  // Estados para familia profesional
  const [nuevaFamilia, setNuevaFamilia] = useState<NuevaFamilia>({
    id_fam: '',
    nombre_fam: ''
  });
  
  // Form states
  const [formId, setFormId] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formFamilia, setFormFamilia] = useState('');
  const [formCodTitulo, setFormCodTitulo] = useState('');
  const [formEstado, setFormEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  
  // Error states
  const [formErrors, setFormErrors] = useState({
    id_taller: false,
    nombre_taller: false,
    familia_taller: false,
    cod_titulo_taller: false
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  const notifications = 4;

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar talleres
        const { data: talleresData } = await api.get('/talleres');
        console.log('Talleres cargados:', talleresData);
        setTalleres(talleresData);
        
        // Cargar familias profesionales
        const { data: familiasData } = await api.get('/familias-profesionales');
        console.log('Familias profesionales cargadas:', familiasData);
        setFamilias(familiasData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los datos',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenDialog = (taller?: Taller) => {
    if (taller) {
      setSelectedTaller(taller);
      setFormId(taller.id_taller);
      setFormNombre(taller.nombre_taller);
      setFormFamilia(taller.familia_taller.id_fam);
      setFormCodTitulo(taller.cod_titulo_taller);
      setFormEstado(taller.estado_taller);
    } else {
      setSelectedTaller(null);
      setFormId('');
      setFormNombre('');
      setFormFamilia('');
      setFormCodTitulo('');
      setFormEstado('Activo');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTaller(null);
    resetFormErrors();
  };
  
  const resetFormErrors = () => {
    setFormErrors({
      id_taller: false,
      nombre_taller: false,
      familia_taller: false,
      cod_titulo_taller: false
    });
  };
  
  const validateForm = () => {
    const errors = {
      id_taller: formId.trim() === '',
      nombre_taller: formNombre.trim() === '',
      familia_taller: formFamilia.trim() === '',
      cod_titulo_taller: formCodTitulo.trim() === ''
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSaveTaller = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (selectedTaller) {
        // Actualizar - incluir ID
        const payload = {
          id_taller: formId,
          nombre_taller: formNombre,
          familia_taller: { id_fam: formFamilia },
          cod_titulo_taller: formCodTitulo,
          estado_taller: formEstado
        };
        
        await api.put(`/talleres/${selectedTaller.id_taller}`, payload);
        setSnackbar({
          open: true,
          message: 'Taller actualizado correctamente',
          severity: 'success'
        });
      } else {
        // Crear - omitir ID para que lo genere automáticamente el backend
        const payload = {
          nombre_taller: formNombre,
          familia_taller: { id_fam: formFamilia },
          cod_titulo_taller: formCodTitulo,
          estado_taller: formEstado
        };
        
        await api.post('/talleres', payload);
        setSnackbar({
          open: true,
          message: 'Taller creado correctamente',
          severity: 'success'
        });
      }
      
      // Recargar talleres
      const { data: talleresData } = await api.get('/talleres');
      setTalleres(talleresData);
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar taller:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el taller',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (taller: Taller) => {
    setSelectedTaller(taller);
    setConfirmDeleteOpen(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setSelectedTaller(null);
  };
  
  const handleDeleteTaller = async () => {
    if (!selectedTaller) return;
    
    try {
      setLoading(true);
      
      // En lugar de eliminar, actualizar estado a Inactivo
      await api.put(`/talleres/${selectedTaller.id_taller}`, {
        estado_taller: 'Inactivo'
      });
      
      // Recargar talleres
      const { data: talleresData } = await api.get('/talleres');
      setTalleres(talleresData);
      
      setSnackbar({
        open: true,
        message: 'Taller desactivado correctamente',
        severity: 'success'
      });
      
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error('Error al desactivar taller:', error);
      setSnackbar({
        open: true,
        message: 'Error al desactivar el taller',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeStatus = async (taller: Taller) => {
    try {
      setLoading(true);
      
      const newStatus = taller.estado_taller === 'Activo' ? 'Inactivo' : 'Activo';
      
      await api.put(`/talleres/${taller.id_taller}`, {
        estado_taller: newStatus
      });
      
      // Recargar talleres
      const { data: talleresData } = await api.get('/talleres');
      setTalleres(talleresData);
      
      setSnackbar({
        open: true,
        message: `Taller ${newStatus === 'Activo' ? 'activado' : 'desactivado'} correctamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setSnackbar({
        open: true,
        message: 'Error al cambiar el estado del taller',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredTalleres = talleres.filter(taller => 
    taller.nombre_taller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    taller.cod_titulo_taller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    taller.familia_taller.nombre_fam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cambio de tab
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Función para manejar nueva familia profesional
  const handleNuevaFamilia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaFamilia.id_fam || !nuevaFamilia.nombre_fam) {
      setSnackbar({
        open: true,
        message: 'Por favor, completa todos los campos obligatorios.',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/familias-profesionales', nuevaFamilia);
      
      setSnackbar({
        open: true,
        message: 'Familia profesional registrada exitosamente',
        severity: 'success'
      });
      
      // Limpiar formulario
      setNuevaFamilia({
        id_fam: '',
        nombre_fam: ''
      });
      
      // Recargar familias
      const { data: familiasData } = await api.get('/familias-profesionales');
      setFamilias(familiasData);
    } catch (error) {
      console.error('Error al registrar familia profesional:', error);
      setSnackbar({
        open: true,
        message: 'Error al registrar la familia profesional',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
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
            <MUI.CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          </MUI.Box>
        )}

        {/* Encabezado */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ 
            mb: 1, 
            fontWeight: 'bold', 
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Icons.School sx={{ fontSize: '2.5rem' }} />
            Gestión de Talleres
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Administra los talleres disponibles en el sistema
          </MUI.Typography>
        </MUI.Box>

        {/* Tabs para navegación */}
        <MUI.Box sx={{ px: { xs: 2, md: 4 } }}>
          <MUI.Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <MUI.Tab icon={<Icons.ViewList />} label="Listado de Talleres" />
            <MUI.Tab icon={<Icons.Add />} label="Nuevo Taller" />
            <MUI.Tab icon={<Icons.Category />} label="Familias Profesionales" />
            <MUI.Tab icon={<Icons.History />} label="Historial" />
          </MUI.Tabs>
        </MUI.Box>

        {/* Tab 0: Listado de Talleres */}
        {activeTab === 0 && (
          <>
            {/* Barra de Acciones */}
            <MUI.Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <MUI.TextField
                placeholder="Buscar por nombre, código o familia..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: <Icons.Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <MUI.FormControlLabel
                control={
                  <MUI.Switch
                    checked={showInactivos}
                    onChange={(e) => setShowInactivos(e.target.checked)}
                    color="primary"
                  />
                }
                label="Mostrar inactivos"
                sx={{ mx: 2 }}
              />
              <MUI.Button
                variant="contained"
                color="primary"
                startIcon={<Icons.Add />}
                onClick={() => {
                  setActiveTab(1); // Cambiar a la pestaña de Nuevo Taller
                }}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }
                }}
              >
                Nuevo Taller
              </MUI.Button>
            </MUI.Box>

            {/* Tabla de Talleres */}
            <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
              <MUI.TableContainer component={MUI.Paper} sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Familia</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código Título</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {/* Filtrar talleres según estado */}
                    {filteredTalleres
                      .filter(taller => showInactivos || taller.estado_taller === 'Activo')
                      .map((taller) => (
                      <MUI.TableRow 
                        key={taller.id_taller}
                        sx={{ 
                          '&:hover': { bgcolor: 'action.hover' },
                          ...(taller.estado_taller === 'Inactivo' && { 
                            bgcolor: MUI.alpha(theme.palette.error.light, 0.05),
                            opacity: 0.8
                          })
                        }}
                      >
                        <MUI.TableCell>{taller.id_taller}</MUI.TableCell>
                        <MUI.TableCell>{taller.nombre_taller}</MUI.TableCell>
                        <MUI.TableCell>{taller.familia_taller?.nombre_fam || '-'}</MUI.TableCell>
                        <MUI.TableCell>{taller.cod_titulo_taller}</MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.Chip 
                            label={taller.estado_taller}
                            color={taller.estado_taller === 'Activo' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                            <MUI.Tooltip title="Editar">
                              <MUI.IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(taller)}
                                size="small"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    bgcolor: MUI.alpha(theme.palette.primary.main, 0.1)
                                  }
                                }}
                              >
                                <Icons.Edit />
                              </MUI.IconButton>
                            </MUI.Tooltip>
                            
                            <MUI.Tooltip title={taller.estado_taller === 'Activo' ? 'Desactivar' : 'Activar'}>
                              <MUI.IconButton
                                color={taller.estado_taller === 'Activo' ? 'warning' : 'success'}
                                onClick={() => handleChangeStatus(taller)}
                                size="small"
                                sx={{
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    bgcolor: taller.estado_taller === 'Activo' 
                                      ? MUI.alpha(theme.palette.warning.main, 0.1) 
                                      : MUI.alpha(theme.palette.success.main, 0.1)
                                  }
                                }}
                              >
                                {taller.estado_taller === 'Activo' ? <Icons.DoNotDisturb /> : <Icons.CheckCircle />}
                              </MUI.IconButton>
                            </MUI.Tooltip>
                          </MUI.Box>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}

                    {/* Mensaje si no hay talleres */}
                    {filteredTalleres.filter(taller => showInactivos || taller.estado_taller === 'Activo').length === 0 && (
                      <MUI.TableRow>
                        <MUI.TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Icons.SearchOff sx={{ fontSize: '3rem', color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                          <MUI.Typography variant="body1" color="text.secondary">
                            No se encontraron talleres
                          </MUI.Typography>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    )}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </MUI.Box>
          </>
        )}

        {/* Tab 1: Nuevo Taller - Mantenemos el diálogo existente */}

        {/* Tab 2: Familias Profesionales */}
        {activeTab === 2 && (
          <MUI.Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 3, maxWidth: 600, mx: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.13)' } }}>
              <MUI.Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.Category /> Registrar Familia Profesional
              </MUI.Typography>
              <form onSubmit={handleNuevaFamilia}>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField 
                      label="ID Familia (3 caracteres)" 
                      required 
                      fullWidth 
                      value={nuevaFamilia.id_fam} 
                      onChange={e => setNuevaFamilia({ ...nuevaFamilia, id_fam: e.target.value.toUpperCase() })}
                      inputProps={{ maxLength: 3 }}
                      placeholder="Ej: ADM, INF, MEC"
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField 
                      label="Nombre de la Familia" 
                      required 
                      fullWidth 
                      value={nuevaFamilia.nombre_fam} 
                      onChange={e => setNuevaFamilia({ ...nuevaFamilia, nombre_fam: e.target.value })} 
                      placeholder="Ej: Informática, Mecánica"
                    />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <MUI.Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    startIcon={<Icons.Save />} 
                    sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                  >
                    Registrar
                  </MUI.Button>
                </MUI.Box>
              </form>
              <MUI.Divider sx={{ my: 4 }} />
              <MUI.Typography variant="h6" sx={{ mb: 2 }}>Familias Registradas</MUI.Typography>
              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow>
                      <MUI.TableCell>ID</MUI.TableCell>
                      <MUI.TableCell>Nombre</MUI.TableCell>
                      <MUI.TableCell>Estado</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {familias.map(familia => (
                      <MUI.TableRow key={familia.id_fam}>
                        <MUI.TableCell>{familia.id_fam}</MUI.TableCell>
                        <MUI.TableCell>{familia.nombre_fam}</MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.Chip 
                            label={familia.estado_fam} 
                            color={familia.estado_fam === 'Activo' ? 'success' : 'error'} 
                            size="small" 
                            icon={familia.estado_fam === 'Activo' ? <Icons.CheckCircle /> : <Icons.Cancel />} 
                          />
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </MUI.Paper>
          </MUI.Box>
        )}

        {/* Tab 3: Historial (Talleres Inactivos) */}
        {activeTab === 3 && (
          <MUI.Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <MUI.Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.History /> Historial de Talleres Desactivados
              </MUI.Typography>
              
              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow sx={{ bgcolor: theme.palette.grey[200] }}>
                      <MUI.TableCell>ID</MUI.TableCell>
                      <MUI.TableCell>Nombre</MUI.TableCell>
                      <MUI.TableCell>Familia</MUI.TableCell>
                      <MUI.TableCell>Código Título</MUI.TableCell>
                      <MUI.TableCell>Acciones</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {talleres
                      .filter(taller => taller.estado_taller === 'Inactivo')
                      .map((taller) => (
                        <MUI.TableRow key={taller.id_taller}>
                          <MUI.TableCell>{taller.id_taller}</MUI.TableCell>
                          <MUI.TableCell>{taller.nombre_taller}</MUI.TableCell>
                          <MUI.TableCell>{taller.familia_taller?.nombre_fam || '-'}</MUI.TableCell>
                          <MUI.TableCell>{taller.cod_titulo_taller}</MUI.TableCell>
                          <MUI.TableCell>
                            <MUI.Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<Icons.Restore />}
                              onClick={() => handleChangeStatus(taller)}
                            >
                              Restaurar
                            </MUI.Button>
                          </MUI.TableCell>
                        </MUI.TableRow>
                      ))}
                      
                    {talleres.filter(taller => taller.estado_taller === 'Inactivo').length === 0 && (
                      <MUI.TableRow>
                        <MUI.TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Icons.Info sx={{ fontSize: '3rem', color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                          <MUI.Typography variant="body1" color="text.secondary">
                            No hay talleres desactivados en el historial
                          </MUI.Typography>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    )}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </MUI.Paper>
          </MUI.Box>
        )}

        {/* Diálogo de Creación/Edición */}
        <MUI.Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          TransitionComponent={MUI.Slide}
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              overflow: 'auto'
            }
          }}
        >
          <MUI.DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icons.School sx={{ color: 'white' }} />
              <MUI.Typography variant="h6">
                {selectedTaller ? 'Editar Taller' : 'Nuevo Taller'}
              </MUI.Typography>
            </MUI.Box>
            <MUI.IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <Icons.Close />
            </MUI.IconButton>
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2, pb: 4 }}>
            <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <MUI.TextField
                label="ID del Taller"
                variant="outlined"
                fullWidth
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                error={formErrors.id_taller}
                helperText={formErrors.id_taller ? 'Este campo es obligatorio' : ''}
                disabled={!!selectedTaller} // Deshabilitar si es edición
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.Tag />
                    </MUI.InputAdornment>
                  ),
                }}
              />

              <MUI.TextField
                label="Nombre del Taller"
                variant="outlined"
                fullWidth
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                error={formErrors.nombre_taller}
                helperText={formErrors.nombre_taller ? 'Este campo es obligatorio' : ''}
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.DriveFileRenameOutline />
                    </MUI.InputAdornment>
                  ),
                }}
              />

              <MUI.FormControl fullWidth error={formErrors.familia_taller}>
                <MUI.InputLabel>Familia Profesional</MUI.InputLabel>
                <MUI.Select
                  label="Familia Profesional"
                  value={formFamilia}
                  onChange={(e) => setFormFamilia(e.target.value)}
                  startAdornment={
                    <MUI.InputAdornment position="start">
                      <Icons.Group />
                    </MUI.InputAdornment>
                  }
                >
                  {familias.map((familia) => (
                    <MUI.MenuItem key={familia.id_fam} value={familia.id_fam}>
                      {familia.nombre_fam}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
                {formErrors.familia_taller && <MUI.FormHelperText>Este campo es obligatorio</MUI.FormHelperText>}
              </MUI.FormControl>

              <MUI.TextField
                label="Código del Título"
                variant="outlined"
                fullWidth
                value={formCodTitulo}
                onChange={(e) => setFormCodTitulo(e.target.value)}
                error={formErrors.cod_titulo_taller}
                helperText={formErrors.cod_titulo_taller ? 'Este campo es obligatorio' : ''}
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.Code />
                    </MUI.InputAdornment>
                  ),
                }}
              />

              <MUI.FormControl fullWidth>
                <MUI.InputLabel>Estado</MUI.InputLabel>
                <MUI.Select
                  label="Estado"
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value as 'Activo' | 'Inactivo')}
                  startAdornment={
                    <MUI.InputAdornment position="start">
                      <Icons.Visibility />
                    </MUI.InputAdornment>
                  }
                >
                  <MUI.MenuItem value="Activo">Activo</MUI.MenuItem>
                  <MUI.MenuItem value="Inactivo">Inactivo</MUI.MenuItem>
                </MUI.Select>
              </MUI.FormControl>
            </MUI.Box>
          </MUI.DialogContent>
          <MUI.DialogActions sx={{ 
            p: 2, 
            borderTop: `1px solid ${theme.palette.divider}`,
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper',
            zIndex: 1
          }}>
            <MUI.Button 
              onClick={handleCloseDialog}
              startIcon={<Icons.Close />}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              color="primary"
              startIcon={<Icons.Save />}
              onClick={handleSaveTaller}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              Guardar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Diálogo de Confirmación para Eliminar */}
        <MUI.Dialog
          open={confirmDeleteOpen}
          onClose={handleCloseDeleteConfirm}
          maxWidth="xs"
          fullWidth
          TransitionComponent={MUI.Slide}
        >
          <MUI.DialogTitle sx={{ 
            backgroundColor: theme.palette.error.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Icons.Warning /> Eliminar Taller
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2 }}>
            <MUI.Typography variant="body1">
              ¿Está seguro de que desea eliminar el taller "{selectedTaller?.nombre_taller}"?
            </MUI.Typography>
            <MUI.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Esta acción no se puede deshacer.
            </MUI.Typography>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={handleCloseDeleteConfirm} startIcon={<Icons.Close />}>
              Cancelar
            </MUI.Button>
            <MUI.Button 
              variant="contained" 
              color="error" 
              onClick={handleDeleteTaller}
              startIcon={<Icons.Delete />}
            >
              Eliminar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Snackbar para notificaciones */}
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MUI.Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
}

export default TallerPage; 