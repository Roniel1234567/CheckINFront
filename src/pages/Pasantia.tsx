import React, { useState, useEffect } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import { internshipService, Taller, CentroTrabajo, PlazasCentro, Estudiante, Pasantia, EstadoPasantia } from '../services/internshipService';
import supervisorService, { Supervisor } from '../services/supervisorService';
import SideBar from '../components/SideBar';
import DashboardAppBar from '../components/DashboardAppBar';

const PasantiaPage = () => {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [centros, setCentros] = useState<CentroTrabajo[]>([]);
  const [plazas, setPlazas] = useState<PlazasCentro[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [pasantias, setPasantias] = useState<Pasantia[]>([]);
  const [supervisores, setSupervisores] = useState<Supervisor[]>([]);

  // Filtros y selección
  const [tallerFiltro, setTallerFiltro] = useState('');
  const [centroFiltro, setCentroFiltro] = useState('');
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<string[]>([]);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mostrarPlazas, setMostrarPlazas] = useState(false);

  // Nuevo estado para la plaza seleccionada en el formulario
  const [plazaFormSeleccionada, setPlazaFormSeleccionada] = useState<PlazasCentro | null>(null);

  // Responsive drawer
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [talleresData, centrosData, plazasData, estudiantesData, pasantiasData, supervisoresData] = await Promise.all([
          internshipService.getAllTalleres(),
          internshipService.getAllCentrosTrabajo(),
          internshipService.getAllPlazas(),
          internshipService.getAllEstudiantes(),
          internshipService.getAllPasantias(),
          supervisorService.getAllSupervisores(),
        ]);
        setTalleres(talleresData);
        setCentros(centrosData);
        setPlazas(plazasData);
        setEstudiantes(estudiantesData);
        setPasantias(pasantiasData);
        setSupervisores(supervisoresData);
      } catch {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Filtrar plazas por taller seleccionado
  const plazasFiltradas = plazas.filter(p => !tallerFiltro || p.taller_plaza.id_taller === tallerFiltro);
  // Filtrar centros por taller (solo los que tienen plazas para ese taller)
  const centrosFiltrados = centros.filter(c => plazasFiltradas.some(p => p.centro_plaza.id_centro === c.id_centro));
  // Filtrar estudiantes por taller
  const estudiantesFiltrados = estudiantes.filter(e => !tallerFiltro || (e.taller_est && e.taller_est.id_taller === tallerFiltro));

  // Filtrar plazas para el menú de plazas según centro y taller seleccionados
  const plazasDisponiblesForm = plazas.filter(p =>
    (!tallerFiltro || p.taller_plaza.id_taller === tallerFiltro) &&
    (!centroFiltro || p.centro_plaza.id_centro === Number(centroFiltro))
  );

  // Calcular plazas ocupadas correctamente por id de plaza
  const plazasOcupadas = (plaza: PlazasCentro) =>
    pasantias.filter(p => {
      const plazaId = typeof p.plaza_pas === 'object' && p.plaza_pas !== null
        ? p.plaza_pas.id_plaza
        : p.plaza_pas;
      return plazaId === plaza.id_plaza &&
        (p.estado_pas === EstadoPasantia.EN_PROCESO || p.estado_pas === EstadoPasantia.PENDIENTE);
    }).length;

  // Handler para crear pasantía
  const handleCrearPasantias = async () => {
    if (!plazaFormSeleccionada || estudiantesSeleccionados.length === 0 || !supervisorSeleccionado || !fechaInicio) {
      setError('Completa todos los campos requeridos');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Solo permite asignar hasta el máximo de plazas disponibles
      const disponibles = plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada);
      if (estudiantesSeleccionados.length > disponibles) {
        setError('No puedes asignar más estudiantes que plazas disponibles');
        setLoading(false);
        return;
      }
      // Crear una pasantía por estudiante
      await Promise.all(estudiantesSeleccionados.map(async (docId) => {
        const estudiante = estudiantes.find(e => e.documento_id_est === docId);
        if (!estudiante) return;
        // Buscar el supervisor seleccionado y adaptarlo a la interfaz esperada
        const supervisorObj = supervisores.find(s => s.id_sup === Number(supervisorSeleccionado));
        if (!supervisorObj) return;
        await internshipService.createPasantia({
          estudiante_pas: estudiante,
          centro_pas: plazaFormSeleccionada.centro_plaza,
          supervisor_pas: {
            id_sup: supervisorObj.id_sup,
            nombre_sup: supervisorObj.nombre_sup,
            apellido_sup: supervisorObj.apellido_sup,
            contacto_sup: supervisorObj.contacto_sup.email_contacto,
          },
          plaza_pas: plazaFormSeleccionada.id_plaza,
          inicio_pas: new Date(fechaInicio),
          fin_pas: fechaFin ? new Date(fechaFin) : undefined,
          estado_pas: EstadoPasantia.EN_PROCESO,
        });
      }));
      setSuccess('Pasantías creadas correctamente');
      setOpenDialog(false);
      setEstudiantesSeleccionados([]);
      setCentroFiltro('');
      setTallerFiltro('');
      setFechaInicio('');
      setFechaFin('');
      // Recargar pasantías
      const pasantiasData = await internshipService.getAllPasantias();
      setPasantias(pasantiasData);
    } catch {
      setError('Error al crear las pasantías');
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`, p: 0 }}>
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
        <MUI.Container maxWidth="lg" sx={{ py: 4 }}>
          <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Icons.AssignmentTurnedIn sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <MUI.Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              Gestión de Pasantías
            </MUI.Typography>
          </MUI.Box>
          <MUI.Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4, background: theme.palette.primary.main }}>
            <MUI.Grid container spacing={2} alignItems="center">
              <MUI.Grid item xs={12} md={3}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel sx={{ color: '#fff' }}>Taller</MUI.InputLabel>
                  <MUI.Select
                    value={tallerFiltro}
                    onChange={e => {
                      setTallerFiltro(e.target.value);
                      setPlazaFormSeleccionada(null);
                    }}
                    label="Taller"
                    startAdornment={<Icons.Construction sx={{ mr: 1, color: '#fff' }} />}
                    sx={{ color: '#fff',
                      '& .MuiSelect-icon': { color: '#fff' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                    }}
                    inputProps={{ sx: { color: '#fff' } }}
                  >
                    <MUI.MenuItem value=""><em>Todos</em></MUI.MenuItem>
                    {talleres.map(t => (
                      <MUI.MenuItem key={t.id_taller} value={t.id_taller}>{t.nombre_taller} - {t.familia_taller.nombre_fam}</MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} md={3}>
                <MUI.Autocomplete
                  options={tallerFiltro ? centrosFiltrados : []}
                  getOptionLabel={c => c.nombre_centro}
                  value={tallerFiltro ? (centrosFiltrados.find(c => String(c.id_centro) === String(centroFiltro)) || null) : null}
                  onChange={(_, value) => {
                    setCentroFiltro(value ? String(value.id_centro) : '');
                    setPlazaFormSeleccionada(null);
                  }}
                  renderInput={params => (
                    <MUI.TextField
                      {...params}
                      label="Centro de Trabajo"
                      placeholder="Buscar centro..."
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: '#fff',
                        borderRadius: 2,
                        '& .MuiInputLabel-root': { color: '#fff' },
                        '& .MuiOutlinedInput-root': {
                          color: '#fff',
                          '& fieldset': { borderColor: '#fff' },
                        },
                        '& .MuiAutocomplete-inputRoot': {
                          color: '#fff',
                        },
                      }}
                      inputProps={{ ...params.inputProps, style: { color: '#fff' } }}
                      disabled={!tallerFiltro}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id_centro === value.id_centro}
                  disableClearable={false}
                  disabled={!tallerFiltro}
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} md={3}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel sx={{ color: '#fff' }}>Plaza</MUI.InputLabel>
                  <MUI.Select
                    value={plazaFormSeleccionada ? plazaFormSeleccionada.id_plaza : ''}
                    onChange={e => {
                      const plaza = plazas.filter(p =>
                        (!tallerFiltro || p.taller_plaza.id_taller === tallerFiltro) &&
                        (!centroFiltro || p.centro_plaza.id_centro === Number(centroFiltro))
                      ).find(p => p.id_plaza === Number(e.target.value));
                      setPlazaFormSeleccionada(plaza || null);
                    }}
                    label="Plaza"
                    disabled={!centroFiltro || !tallerFiltro}
                    sx={{ color: '#fff',
                      '& .MuiSelect-icon': { color: '#fff' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                    }}
                    inputProps={{ sx: { color: '#fff' } }}
                  >
                    <MUI.MenuItem value=""><em>Seleccione una plaza</em></MUI.MenuItem>
                    {plazas.filter(p =>
                      (!tallerFiltro || p.taller_plaza.id_taller === tallerFiltro) &&
                      (!centroFiltro || p.centro_plaza.id_centro === Number(centroFiltro))
                    ).map(p => (
                      <MUI.MenuItem key={p.id_plaza} value={p.id_plaza}>
                        {p.taller_plaza.nombre_taller} - {p.centro_plaza.nombre_centro} (Totales: {p.plazas_centro})
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} md={3}>
                <MUI.Button
                  variant="contained"
                  color="warning"
                  startIcon={<Icons.AddCircleOutline sx={{ color: theme.palette.primary.main }} />}
                  fullWidth
                  size="large"
                  sx={{
                    fontWeight: 'bold',
                    borderRadius: 3,
                    boxShadow: 2,
                    py: 1.5,
                    color: theme.palette.primary.main,
                    bgcolor: theme.palette.warning.light,
                    '&:hover': { bgcolor: theme.palette.warning.main, color: theme.palette.primary.main }
                  }}
                  onClick={() => setOpenDialog(true)}
                  disabled={!plazaFormSeleccionada || plazasOcupadas(plazaFormSeleccionada) >= (plazaFormSeleccionada?.plazas_centro || 0)}
                >
                  Nueva Pasantía
                </MUI.Button>
              </MUI.Grid>
            </MUI.Grid>
          </MUI.Paper>

          {/* Botón para mostrar plazas */}
          <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <MUI.Button
              variant={mostrarPlazas ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setMostrarPlazas((prev) => !prev)}
              disabled={!tallerFiltro}
              sx={{
                fontWeight: 'bold',
                borderRadius: 4,
                px: 4,
                py: 1.5,
                boxShadow: mostrarPlazas ? '0 4px 16px rgba(26,35,126,0.12)' : 'none',
                bgcolor: mostrarPlazas ? theme.palette.primary.main : '#fff',
                color: mostrarPlazas ? '#fff' : theme.palette.primary.main,
                border: `2px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                },
              }}
            >
              {mostrarPlazas ? 'Ocultar Plazas' : 'Mostrar Plazas'}
            </MUI.Button>
          </MUI.Box>

          {/* Tarjetas de plazas solo si mostrarPlazas y hay taller seleccionado */}
          {mostrarPlazas && tallerFiltro && (
            <MUI.Grid container spacing={6} sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              {plazasFiltradas.map((plaza) => {
                const ocupadas = plazasOcupadas(plaza);
                const disponibles = plaza.plazas_centro - ocupadas;
                return (
                  <MUI.Grid item xs={12} sm={'auto'} md={'auto'} key={plaza.id_plaza} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <MUI.Card
                      sx={{
                        borderRadius: 5,
                        boxShadow: '0 8px 32px rgba(26,35,126,0.10)',
                        background: '#fff',
                        color: theme.palette.primary.main,
                        border: `2.5px solid ${theme.palette.primary.main}`,
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: 220,
                        minWidth: 380,
                        maxWidth: 380,
                        width: 380,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'stretch',
                        transition: 'transform 0.2s',
                        p: 2,
                        '&:hover': {
                          transform: 'translateY(-4px) scale(1.03)',
                          boxShadow: '0 16px 40px rgba(26,35,126,0.18)',
                        },
                      }}
                      onClick={() => {
                        setTallerFiltro(plaza.taller_plaza.id_taller);
                        setCentroFiltro(String(plaza.centro_plaza.id_centro));
                        setPlazaFormSeleccionada(plaza);
                      }}
                    >
                      <MUI.CardContent sx={{ p: 3, height: '100%' }}>
                        <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Icons.Engineering sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                          <MUI.Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, fontSize: 22 }}>
                            {plaza.taller_plaza.nombre_taller}
                          </MUI.Typography>
                        </MUI.Box>
                        <MUI.Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: theme.palette.primary.main, opacity: 0.85 }}>
                          <Icons.Business sx={{ fontSize: 20, mr: 1, color: theme.palette.primary.main }} /> {plaza.centro_plaza.nombre_centro}
                        </MUI.Typography>
                        <MUI.Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                          <MUI.Chip label={`Totales: ${plaza.plazas_centro}`} sx={{ bgcolor: theme.palette.primary.main, color: '#fff', fontWeight: 'bold', fontSize: 16, px: 2 }} />
                          <MUI.Chip label={`Ocupadas: ${ocupadas}`} sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.primary.main, fontWeight: 'bold', fontSize: 16, px: 2 }} />
                          <MUI.Chip label={`Disponibles: ${disponibles}`} sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.main, fontWeight: 'bold', fontSize: 16, px: 2, border: `2px solid ${theme.palette.primary.main}` }} />
                        </MUI.Box>
                        {disponibles === 0 && (
                          <MUI.Zoom in>
                            <MUI.Alert severity="error" icon={<Icons.Block fontSize="inherit" />} sx={{ mt: 2, fontWeight: 'bold', fontSize: 18, borderRadius: 2 }}>
                              ¡Plazas agotadas! No puedes registrar más pasantías aquí.
                            </MUI.Alert>
                          </MUI.Zoom>
                        )}
                      </MUI.CardContent>
                    </MUI.Card>
                  </MUI.Grid>
                );
              })}
            </MUI.Grid>
          )}

          {/* Tabla de pasantías */}
          <MUI.Paper elevation={2} sx={{ p: 3, borderRadius: 4, mb: 4 }}>
            <MUI.Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icons.ListAlt sx={{ fontSize: 28, color: theme.palette.primary.main }} /> Pasantías Registradas
            </MUI.Typography>
            <MUI.Table>
              <MUI.TableHead>
                <MUI.TableRow>
                  <MUI.TableCell>Estudiante</MUI.TableCell>
                  <MUI.TableCell>Taller</MUI.TableCell>
                  <MUI.TableCell>Centro</MUI.TableCell>
                  <MUI.TableCell>Supervisor</MUI.TableCell>
                  <MUI.TableCell>Inicio</MUI.TableCell>
                  <MUI.TableCell>Fin</MUI.TableCell>
                  <MUI.TableCell>Estado</MUI.TableCell>
                </MUI.TableRow>
              </MUI.TableHead>
              <MUI.TableBody>
                {pasantias.map(p => (
                  <MUI.TableRow key={p.id_pas}>
                    <MUI.TableCell>{p.estudiante_pas.nombre_est} {p.estudiante_pas.apellido_est}</MUI.TableCell>
                    <MUI.TableCell>{p.estudiante_pas.taller_est?.nombre_taller || '-'}</MUI.TableCell>
                    <MUI.TableCell>{p.centro_pas.nombre_centro}</MUI.TableCell>
                    <MUI.TableCell>{p.supervisor_pas?.nombre_sup || '-'}</MUI.TableCell>
                    <MUI.TableCell>{p.inicio_pas ? new Date(p.inicio_pas).toLocaleDateString() : '-'}</MUI.TableCell>
                    <MUI.TableCell>{p.fin_pas ? new Date(p.fin_pas).toLocaleDateString() : '-'}</MUI.TableCell>
                    <MUI.TableCell>
                      <MUI.Chip label={p.estado_pas} color={p.estado_pas === EstadoPasantia.EN_PROCESO ? 'info' : p.estado_pas === EstadoPasantia.TERMINADA ? 'success' : 'default'} />
                    </MUI.TableCell>
                  </MUI.TableRow>
                ))}
              </MUI.TableBody>
            </MUI.Table>
          </MUI.Paper>

          {/* Diálogo para crear pasantía */}
          <MUI.Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <MUI.DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icons.AddCircleOutline sx={{ color: theme.palette.primary.main }} /> Nueva Pasantía
            </MUI.DialogTitle>
            <MUI.DialogContent>
              <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Estudiantes</MUI.InputLabel>
                  <MUI.Autocomplete
                    multiple
                    options={estudiantesFiltrados}
                    getOptionLabel={e => `${e.nombre_est} ${e.apellido_est}`}
                    value={estudiantes.filter(e => estudiantesSeleccionados.includes(e.documento_id_est))}
                    onChange={(_, value) => {
                      // Limitar la selección a las plazas disponibles
                      if (plazaFormSeleccionada) {
                        const disponibles = plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada);
                        if (value.length > disponibles) return;
                      }
                      setEstudiantesSeleccionados(value.map(e => e.documento_id_est));
                    }}
                    disableCloseOnSelect
                    renderInput={params => (
                      <MUI.TextField
                        {...params}
                        label="Estudiantes"
                        placeholder="Buscar estudiante..."
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                    getOptionDisabled={e => estudiantesSeleccionados.includes(e.documento_id_est) && estudiantesSeleccionados.length === (plazaFormSeleccionada ? plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada) : 0)}
                  />
                  <MUI.FormHelperText>Máximo {plazaFormSeleccionada ? plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada) : 0} estudiantes</MUI.FormHelperText>
                </MUI.FormControl>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Supervisor</MUI.InputLabel>
                  <MUI.Select
                    value={supervisorSeleccionado}
                    onChange={e => setSupervisorSeleccionado(e.target.value)}
                    label="Supervisor"
                  >
                    <MUI.MenuItem value=""><em>Seleccione un supervisor</em></MUI.MenuItem>
                    {supervisores
                      .filter(s => s.centro_trabajo && String(s.centro_trabajo.id_centro) === String(centroFiltro))
                      .map(s => (
                        <MUI.MenuItem key={s.id_sup} value={s.id_sup}>{s.nombre_sup} {s.apellido_sup}</MUI.MenuItem>
                      ))}
                  </MUI.Select>
                </MUI.FormControl>
                <MUI.TextField
                  fullWidth
                  label="Fecha de Inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <MUI.TextField
                  fullWidth
                  label="Fecha de Fin (opcional)"
                  type="date"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Plaza</MUI.InputLabel>
                  <MUI.Select
                    value={plazaFormSeleccionada ? plazaFormSeleccionada.id_plaza : ''}
                    onChange={e => {
                      const plaza = plazasDisponiblesForm.find(p => p.id_plaza === Number(e.target.value));
                      setPlazaFormSeleccionada(plaza || null);
                    }}
                    label="Plaza"
                    disabled={!centroFiltro || !tallerFiltro}
                  >
                    <MUI.MenuItem value=""><em>Seleccione una plaza</em></MUI.MenuItem>
                    {plazasDisponiblesForm.map(p => (
                      <MUI.MenuItem key={p.id_plaza} value={p.id_plaza}>
                        {p.taller_plaza.nombre_taller} - {p.centro_plaza.nombre_centro} (Totales: {p.plazas_centro})
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Box>
              {error && <MUI.Alert severity="error" sx={{ mt: 2 }}>{error}</MUI.Alert>}
              {success && <MUI.Alert severity="success" sx={{ mt: 2 }}>{success}</MUI.Alert>}
              {plazaFormSeleccionada && (plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada) === 0) && (
                <MUI.Grow in>
                  <MUI.Alert severity="error" icon={<Icons.Block fontSize="inherit" />} sx={{ my: 2, fontWeight: 'bold', fontSize: 18, borderRadius: 2, textAlign: 'center' }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#d32f2f' }}>¡Plazas agotadas!</span><br />
                    No puedes registrar más pasantías en esta plaza.<br />
                    Selecciona otra plaza o centro de trabajo.
                  </MUI.Alert>
                </MUI.Grow>
              )}
            </MUI.DialogContent>
            <MUI.DialogActions>
              <MUI.Button onClick={() => setOpenDialog(false)}>Cancelar</MUI.Button>
              <MUI.Button variant="contained" onClick={handleCrearPasantias} disabled={!!loading || (!!plazaFormSeleccionada && (plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada) === 0))}>Crear</MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>
        </MUI.Container>
      </MUI.Box>
    </MUI.Box>
  );
};

export default PasantiaPage;
