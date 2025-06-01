import { useState, useEffect, useMemo } from 'react';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import { CentroTrabajo } from '../../../services/CompaniesCRUD';
import { Taller as TallerIS } from '../../services/internshipService';
import api from '../../services/api';
import { authService } from '../../services/authService';
import { internshipService } from '../../services/internshipService';
import { useReadOnlyMode } from '../../hooks/useReadOnlyMode';
// Importar íconos explícitamente


// Interfaces
interface Plaza {
  id?: number;
  id_plaza: number;
  centro: CentroTrabajo;
  taller: TallerIS;
  plazas: number;
  plazas_centro: number;
  fechaCreacion?: string;
  creacion_plaza: string;
  edad_minima?: number;
  genero?: string;
  observacion?: string;
  estado?: string;
}

// Asegurar que la interfaz CentroTrabajo incluya la propiedad validacion
interface CentroTrabajoExtendido extends CentroTrabajo {
  validacion: string;
}

// Tipo auxiliar para el mapeo de plazas desde la API
type PlazaApi = Omit<Plaza, 'centro' | 'taller'> & { centro_plaza: CentroTrabajo; taller_plaza: TallerIS };

function PlazasCentro() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [centros, setCentros] = useState<CentroTrabajoExtendido[]>([]);
  const [talleres, setTalleres] = useState<TallerIS[]>([]);
  const [plazas, setPlazas] = useState<Plaza[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlaza, setSelectedPlaza] = useState<Plaza | null>(null);
  const [formCentro, setFormCentro] = useState('');
  const [formTaller, setFormTaller] = useState('');
  const [formPlazas, setFormPlazas] = useState('');
  const [formEdadMinima, setFormEdadMinima] = useState('');
  const [formGenero, setFormGenero] = useState('Ambos');
  const [formObservacion, setFormObservacion] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [plazaToDelete, setPlazaToDelete] = useState<Plaza | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const user = authService.getCurrentUser();
  const esEmpresa = user && user.rol === 2;
  const isReadOnly = useReadOnlyMode();

  // useEffect para cargar datos iniciales SOLO una vez
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let centrosData: CentroTrabajoExtendido[] = [];
        let talleresData: TallerIS[] = [];
        try {
          const centrosRaw = await internshipService.getAllCentrosTrabajo();
          centrosData = (centrosRaw as unknown as CentroTrabajoExtendido[]).map((c) => ({
            ...c,
            validacion: c.validacion ?? undefined
          }));
        } catch { centrosData = []; }
        try {
          const talleresIS: TallerIS[] = await internshipService.getAllTalleres();
          talleresData = talleresIS as unknown as TallerIS[];
        } catch { talleresData = []; }
        setCentros(centrosData);
        setTalleres(talleresData);
        // Cargar plazas
        const { data: plazasData } = await api.get('/plazas');
        const plazasAdaptadas: Plaza[] = (plazasData as PlazaApi[]).map((plaza) => ({
          ...plaza,
          id: plaza.id_plaza,
          centro: plaza.centro_plaza,
          taller: plaza.taller_plaza,
          plazas: plaza.plazas_centro,
          fechaCreacion: plaza.creacion_plaza
        }));
        setPlazas(plazasAdaptadas);
      } catch {
        setCentros([]);
        setTalleres([]);
        setPlazas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // useMemo para filtrar plazas de la empresa
  const plazasEmpresa = useMemo(() => {
    if (esEmpresa && user) {
      // Buscar los id_centro de la empresa
      const idsCentro = (centros as CentroTrabajoExtendido[])
        .filter((centroRaw) => {
          const centro = centroRaw as { usuario?: { id_usuario: number } | number; id_centro: number };
          if (typeof centro.usuario === 'object' && centro.usuario !== null) {
            return (centro.usuario as { id_usuario: number }).id_usuario === user.id_usuario;
          }
          return centro.usuario === user.id_usuario;
        })
        .map((centro) => centro.id_centro);
      return plazas.filter(p => idsCentro.includes(p.centro.id_centro));
    }
    return plazas;
  }, [esEmpresa, user, centros, plazas]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenDialog = (plaza?: Plaza) => {
    if (plaza) {
      setSelectedPlaza(plaza);
      setFormCentro(plaza.centro.id_centro.toString());
      setFormTaller(plaza.taller.id_taller.toString());
      setFormPlazas(plaza.plazas_centro.toString());
      setFormEdadMinima(plaza.edad_minima ? plaza.edad_minima.toString() : '');
      setFormGenero(plaza.genero || 'Ambos');
      setFormObservacion(plaza.observacion || '');
    } else {
      setSelectedPlaza(null);
      setFormCentro('');
      setFormTaller('');
      setFormPlazas('');
      setFormEdadMinima('');
      setFormGenero('Ambos');
      setFormObservacion('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlaza(null);
  };

  const handleDeleteConfirmation = (plaza: Plaza) => {
    setPlazaToDelete(plaza);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setPlazaToDelete(null);
  };

  const handleDeactivatePlaza = async () => {
    if (!plazaToDelete) return;
    
    try {
      setLoading(true);
      
      // Actualizar el estado a Inactiva
      await api.put(`/plazas/${plazaToDelete.id_plaza}`, {
        estado: 'Inactiva'
      });
      
      // Recargar plazas
      const { data: plazasData } = await api.get('/plazas');
      console.log('Plazas cargadas:', plazasData);
      const plazasAdaptadas: Plaza[] = (plazasData as PlazaApi[]).map((plaza) => {
        return {
          ...plaza,
          id: plaza.id_plaza,
          centro: plaza.centro_plaza,
          taller: plaza.taller_plaza,
          plazas: plaza.plazas_centro,
          fechaCreacion: plaza.creacion_plaza
        };
      });
      setPlazas(plazasAdaptadas);
      
      // Cerrar el diálogo
      handleCloseDeleteConfirm();
    } catch (error) {
      console.error('Error al desactivar plaza:', error);
      alert('Error al desactivar la plaza');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePlaza = async (plaza: Plaza) => {
    try {
      setLoading(true);
      
      // Actualizar el estado a Activa
      await api.put(`/plazas/${plaza.id_plaza}`, {
        estado: 'Activa'
      });
      
      // Recargar plazas
      const { data: plazasData } = await api.get('/plazas');
      console.log('Plazas cargadas:', plazasData);
      const plazasAdaptadas: Plaza[] = (plazasData as PlazaApi[]).map((plaza) => {
        return {
          ...plaza,
          id: plaza.id_plaza,
          centro: plaza.centro_plaza,
          taller: plaza.taller_plaza,
          plazas: plaza.plazas_centro,
          fechaCreacion: plaza.creacion_plaza
        };
      });
      setPlazas(plazasAdaptadas);
    } catch (error) {
      console.error('Error al restaurar plaza:', error);
      alert('Error al restaurar la plaza');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPlaza = async () => {
    if (isReadOnly) return;
    // Crear payload con los objetos completos en lugar de solo IDs
    const payload = {
      centro_plaza: { id_centro: Number(formCentro) },
      taller_plaza: { id_taller: Number(formTaller) },
      plazas_centro: Number(formPlazas),
      edad_minima: formEdadMinima ? Number(formEdadMinima) : undefined,
      genero: formGenero,
      observacion: formObservacion || undefined
    };
    
    try {
      setLoading(true);
      console.log('Enviando payload:', payload);
      
      if (selectedPlaza) {
        // Editar - Usar id_plaza si existe, de lo contrario usar id
        const plazaId = selectedPlaza.id_plaza || selectedPlaza.id;
        await api.put(`/plazas/${plazaId}`, payload);
      } else {
        // Crear
        await api.post('/plazas', payload);
      }
      setOpenDialog(false);
      
      // Recargar plazas usando api
      const { data: plazasData } = await api.get('/plazas');
      console.log('Plazas cargadas:', plazasData);
      const plazasAdaptadas: Plaza[] = (plazasData as PlazaApi[]).map((plaza) => {
        return {
          ...plaza,
          id: plaza.id_plaza, // Asegurar que id también está disponible
          centro: plaza.centro_plaza,
          taller: plaza.taller_plaza,
          plazas: plaza.plazas_centro, // Mapear el campo correcto
          fechaCreacion: plaza.creacion_plaza // Mapear el campo correcto
        };
      });
      setPlazas(plazasAdaptadas);
    } catch (error) {
      console.error('Error al guardar plaza:', error);
      alert('Error al guardar la plaza');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (plaza: Plaza) => {
    if (isReadOnly) return;
    handleOpenDialog(plaza);
  };

  const handleDeleteClick = (plaza: Plaza) => {
    if (isReadOnly) return;
    handleDeleteConfirmation(plaza);
  };

  const filteredPlazas = plazasEmpresa.filter(plaza => 
    ((plaza.estado === 'Activa') === !showInactive) && // Filtrar por estado
    ((plaza.centro?.nombre_centro?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (plaza.taller?.nombre_taller?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
  );

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      {/* Sidebar */}
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Main content */}
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* App bar */}
        <DashboardAppBar toggleDrawer={toggleDrawer} />

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
            <Icons.BusinessCenter sx={{ fontSize: '2.5rem' }} />
            Plazas de Centros de Trabajo
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Gestiona las plazas disponibles en los centros de trabajo y talleres
          </MUI.Typography>
        </MUI.Box>

        {/* Barra de Acciones */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <MUI.TextField
            placeholder="Buscar centro o taller..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <Icons.Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <MUI.Button
            variant={showInactive ? "outlined" : "contained"}
            color={showInactive ? "secondary" : "primary"}
            startIcon={showInactive ? <Icons.RestoreFromTrash /> : <Icons.History />}
            onClick={() => setShowInactive(!showInactive)}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            {showInactive ? "Volver a Activas" : "Ver Historial"}
          </MUI.Button>
          {!showInactive && (
          <MUI.Button
            variant="contained"
            color="primary"
            startIcon={<Icons.Add />}
            onClick={() => {
              if (!isReadOnly) {
                setSelectedPlaza(null);
                setOpenDialog(true);
              }
            }}
            disabled={isReadOnly}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            Nueva Plaza
          </MUI.Button>
          )}
        </MUI.Box>

        {/* Grid de Plazas */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Grid container spacing={3}>
            {filteredPlazas.map((plaza) => (
              <MUI.Grid item xs={12} md={6} key={plaza.id_plaza || plaza.id}>
                <MUI.Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    },
                    // Añadir un borde o estilo para indicar plazas inactivas
                    ...(plaza.estado === 'Inactiva' && {
                      borderLeft: `5px solid ${theme.palette.error.main}`,
                      opacity: 0.8
                    })
                  }}
                >
                  <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <MUI.Box>
                      <MUI.Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Icons.Business sx={{ color: theme.palette.primary.main }} />
                        {plaza.centro?.nombre_centro || '-'}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icons.LocationOn sx={{ fontSize: '1rem' }} />
                        {plaza.centro?.direccion_centro?.calle_dir || '-'}
                      </MUI.Typography>
                    </MUI.Box>
                    <MUI.Chip
                      label={`${plaza.plazas} plazas`}
                      color="primary"
                      icon={<Icons.People />}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  </MUI.Box>

                  <MUI.Divider sx={{ my: 2 }} />

                  <MUI.Box sx={{ mb: 2 }}>
                    <MUI.Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Icons.Build sx={{ color: theme.palette.secondary.main }} />
                      {plaza.taller?.nombre_taller || '-'}
                    </MUI.Typography>
                  </MUI.Box>

                  <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <MUI.Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Icons.CalendarToday sx={{ fontSize: '0.875rem' }} />
                      Creado: {new Date(plaza.creacion_plaza).toLocaleDateString()}
                    </MUI.Typography>
                    <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                      {showInactive ? (
                        // Botón de restaurar para plazas inactivas
                        <MUI.IconButton
                          color="success"
                          onClick={() => handleRestorePlaza(plaza)}
                          sx={{
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              backgroundColor: MUI.alpha(theme.palette.success.main, 0.1)
                            }
                          }}
                        >
                          <Icons.RestoreFromTrash />
                        </MUI.IconButton>
                      ) : (
                        // Botones de editar y eliminar para plazas activas
                        <>
                      <MUI.IconButton
                        color="primary"
                        onClick={() => handleEditClick(plaza)}
                        disabled={isReadOnly}
                        sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: MUI.alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Icons.Edit />
                      </MUI.IconButton>
                      <MUI.IconButton
                        color="error"
                        onClick={() => handleDeleteClick(plaza)}
                        disabled={isReadOnly}
                        sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: MUI.alpha(theme.palette.error.main, 0.1)
                          }
                        }}
                      >
                        <Icons.Delete />
                      </MUI.IconButton>
                        </>
                      )}
                    </MUI.Box>
                  </MUI.Box>
                </MUI.Paper>
              </MUI.Grid>
            ))}
            
            {filteredPlazas.length === 0 && (
              <MUI.Box sx={{ 
                width: '100%', 
                textAlign: 'center', 
                p: 4, 
                color: 'text.secondary'
              }}>
                <Icons.SearchOff fontSize="large" sx={{ fontSize: '5rem', opacity: 0.3, mb: 2 }} />
                <MUI.Typography variant="h6" color="text.secondary">
                  {showInactive 
                    ? "No hay plazas inactivas para mostrar" 
                    : "No hay plazas activas que coincidan con la búsqueda"}
                </MUI.Typography>
              </MUI.Box>
            )}
          </MUI.Grid>
        </MUI.Box>

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
              <Icons.BusinessCenter sx={{ color: 'white' }} />
              <MUI.Typography variant="h6">
                {selectedPlaza ? 'Editar Plaza' : 'Nueva Plaza'}
              </MUI.Typography>
            </MUI.Box>
            <MUI.IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
              <Icons.Close />
            </MUI.IconButton>
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2, pb: 4 }}>
            <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <MUI.Autocomplete
                fullWidth
                options={(() => {
                  if (esEmpresa && user) {
                    return centros.filter(centroRaw => {
                      const centro = centroRaw as { usuario?: { id_usuario: number } | number; validacion?: string };
                      return centro.validacion === 'Aceptada' && (
                        (typeof centro.usuario === 'object' && centro.usuario !== null && (centro.usuario as { id_usuario: number }).id_usuario === user.id_usuario) ||
                        centro.usuario === user.id_usuario
                      );
                    });
                  }
                  return centros.filter(centro => centro.validacion === 'Aceptada');
                })()}
                getOptionLabel={(option) => option.nombre_centro}
                isOptionEqualToValue={(option, value) => option.id_centro === value.id_centro}
                value={centros.find(centro => centro.id_centro === Number(formCentro)) || null}
                onChange={(_, newValue) => {
                  setFormCentro(newValue ? String(newValue.id_centro) : '');
                }}
                renderInput={(params) => (
                  <MUI.TextField
                    {...params}
                    label="Centro de Trabajo"
                    variant="outlined"
                    placeholder="Buscar centro de trabajo..."
                  />
                )}
              />

              <MUI.FormControl fullWidth>
                <MUI.InputLabel>Taller</MUI.InputLabel>
                <MUI.Select
                  label="Taller"
                  value={formTaller}
                  onChange={e => setFormTaller(e.target.value)}
                >
                  {talleres.map((taller) => (
                    <MUI.MenuItem key={taller.id_taller} value={String(taller.id_taller)}>
                      {taller.nombre_taller}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>

              <MUI.TextField
                label="Número de Plazas"
                type="number"
                variant="outlined"
                fullWidth
                value={formPlazas}
                onChange={e => setFormPlazas(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <MUI.Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Icons.People sx={{ color: 'text.secondary' }} />
                    </MUI.Box>
                  ),
                  inputProps: { min: 1 }
                }}
              />

              <MUI.TextField
                label="Edad mínima (opcional)"
                type="number"
                variant="outlined"
                fullWidth
                value={formEdadMinima}
                onChange={e => setFormEdadMinima(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ mt: 2 }}
              />

              <MUI.FormControl fullWidth sx={{ mt: 2 }}>
                <MUI.InputLabel>Género permitido</MUI.InputLabel>
                <MUI.Select
                  label="Género permitido"
                  value={formGenero}
                  onChange={e => setFormGenero(e.target.value)}
                >
                  <MUI.MenuItem value="Masculino">Masculino</MUI.MenuItem>
                  <MUI.MenuItem value="Femenino">Femenino</MUI.MenuItem>
                  <MUI.MenuItem value="Ambos">Ambos</MUI.MenuItem>
                </MUI.Select>
              </MUI.FormControl>

              <MUI.TextField
                label="Observación (opcional)"
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                value={formObservacion}
                onChange={e => setFormObservacion(e.target.value)}
                sx={{ mt: 2 }}
              />
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
              onClick={handleGuardarPlaza}
              disabled={isReadOnly || loading}
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

        {/* Diálogo de Confirmación de Eliminación */}
        <MUI.Dialog
          open={deleteConfirmOpen}
          onClose={handleCloseDeleteConfirm}
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
            backgroundColor: theme.palette.error.main,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icons.Delete sx={{ color: 'white' }} />
              <MUI.Typography variant="h6">
                Desactivar Plaza
              </MUI.Typography>
            </MUI.Box>
            <MUI.IconButton onClick={handleCloseDeleteConfirm} sx={{ color: 'white' }}>
              <Icons.Close />
            </MUI.IconButton>
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2, pb: 4 }}>
            <MUI.Typography variant="body1" color="text.secondary">
              ¿Estás seguro de que quieres desactivar esta plaza?
            </MUI.Typography>
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
              onClick={handleCloseDeleteConfirm}
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
              color="error"
              startIcon={<Icons.Delete />}
              onClick={handleDeactivatePlaza}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              Desactivar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
      </MUI.Box>
    </MUI.Box>
  );
}

export default PlazasCentro; 