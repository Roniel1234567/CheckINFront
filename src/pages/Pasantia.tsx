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
  const [plazaSeleccionada, setPlazaSeleccionada] = useState<PlazasCentro | null>(null);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<string[]>([]);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Cuando cambia el centro, actualizar la plaza seleccionada y los supervisores de ese centro
  useEffect(() => {
    if (centroFiltro && tallerFiltro) {
      const plaza = plazasFiltradas.find(p => p.centro_plaza.id_centro === Number(centroFiltro));
      setPlazaSeleccionada(plaza || null);
      setEstudiantesSeleccionados([]);
    } else {
      setPlazaSeleccionada(null);
      setEstudiantesSeleccionados([]);
    }
  }, [centroFiltro, tallerFiltro]);

  // Calcular plazas ocupadas
  const plazasOcupadas = (plaza: PlazasCentro) =>
    pasantias.filter(p =>
      p.centro_pas.id_centro === plaza.centro_plaza.id_centro &&
      p.estado_pas !== EstadoPasantia.CANCELADA &&
      p.estado_pas !== EstadoPasantia.TERMINADA &&
      p.estudiante_pas.taller_est?.id_taller === plaza.taller_plaza.id_taller
    ).length;

  // Handler para crear pasantía
  const handleCrearPasantias = async () => {
    if (!plazaSeleccionada || estudiantesSeleccionados.length === 0 || !supervisorSeleccionado || !fechaInicio) {
      setError('Completa todos los campos requeridos');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Solo permite asignar hasta el máximo de plazas disponibles
      const disponibles = plazaSeleccionada.plazas_centro - plazasOcupadas(plazaSeleccionada);
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
          centro_pas: plazaSeleccionada.centro_plaza,
          supervisor_pas: {
            id_sup: supervisorObj.id_sup,
            nombre_sup: supervisorObj.nombre_sup,
            apellido_sup: supervisorObj.apellido_sup,
            contacto_sup: supervisorObj.contacto_sup.email_contacto, // Adaptar a string
          },
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
          <MUI.Paper elevation={3} sx={{ p: 3, borderRadius: 4, mb: 4, background: `linear-gradient(90deg, ${theme.palette.primary.light} 60%, ${theme.palette.secondary.light} 100%)` }}>
            <MUI.Grid container spacing={2} alignItems="center">
              <MUI.Grid item xs={12} md={4}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Taller</MUI.InputLabel>
                  <MUI.Select
                    value={tallerFiltro}
                    onChange={e => setTallerFiltro(e.target.value)}
                    label="Taller"
                    startAdornment={<Icons.Construction sx={{ mr: 1 }} />}
                  >
                    <MUI.MenuItem value=""><em>Todos</em></MUI.MenuItem>
                    {talleres.map(t => (
                      <MUI.MenuItem key={t.id_taller} value={t.id_taller}>{t.nombre_taller} - {t.familia_taller.nombre_fam}</MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} md={4}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Centro de Trabajo</MUI.InputLabel>
                  <MUI.Select
                    value={centroFiltro}
                    onChange={e => setCentroFiltro(e.target.value)}
                    label="Centro de Trabajo"
                    disabled={!tallerFiltro}
                    startAdornment={<Icons.Business sx={{ mr: 1 }} />}
                  >
                    <MUI.MenuItem value=""><em>Todos</em></MUI.MenuItem>
                    {centrosFiltrados.map(c => (
                      <MUI.MenuItem key={c.id_centro} value={c.id_centro}>{c.nombre_centro}</MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} md={4}>
                <MUI.Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Icons.AddCircleOutline />}
                  fullWidth
                  size="large"
                  sx={{ fontWeight: 'bold', borderRadius: 3, boxShadow: 2, py: 1.5 }}
                  onClick={() => setOpenDialog(true)}
                  disabled={!plazaSeleccionada || plazasOcupadas(plazaSeleccionada) >= (plazaSeleccionada?.plazas_centro || 0)}
                >
                  Nueva Pasantía
                </MUI.Button>
              </MUI.Grid>
            </MUI.Grid>
          </MUI.Paper>

          {/* Tarjetas de plazas */}
          <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
            {plazasFiltradas.map(plaza => {
              const ocupadas = plazasOcupadas(plaza);
              const disponibles = plaza.plazas_centro - ocupadas;
              return (
                <MUI.Grid item xs={12} sm={6} md={4} key={plaza.id_plaza}>
                  <MUI.Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      background: disponibles > 0 ? `linear-gradient(120deg, ${theme.palette.success.light} 60%, ${theme.palette.primary.light} 100%)` : `linear-gradient(120deg, ${theme.palette.grey[300]} 60%, ${theme.palette.grey[100]} 100%)`,
                      color: disponibles > 0 ? theme.palette.success.dark : theme.palette.text.secondary,
                      position: 'relative',
                      overflow: 'hidden',
                      border: plazaSeleccionada?.id_plaza === plaza.id_plaza ? `2px solid ${theme.palette.primary.main}` : 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.03)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.13)',
                      },
                    }}
                    onClick={() => {
                      setCentroFiltro(String(plaza.centro_plaza.id_centro));
                      setPlazaSeleccionada(plaza);
                    }}
                  >
                    <MUI.CardContent>
                      <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Icons.Engineering sx={{ fontSize: 32 }} />
                        <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>{plaza.taller_plaza.nombre_taller}</MUI.Typography>
                      </MUI.Box>
                      <MUI.Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
                        <Icons.Business sx={{ fontSize: 20, mr: 1 }} /> {plaza.centro_plaza.nombre_centro}
                      </MUI.Typography>
                      <MUI.Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                        <MUI.Chip label={`Totales: ${plaza.plazas_centro}`} color="info" />
                        <MUI.Chip label={`Ocupadas: ${ocupadas}`} color="warning" />
                        <MUI.Chip label={`Disponibles: ${disponibles}`} color={disponibles > 0 ? 'success' : 'default'} />
                      </MUI.Box>
                      {disponibles === 0 && (
                        <MUI.Typography variant="caption" color="error">No hay plazas disponibles</MUI.Typography>
                      )}
                    </MUI.CardContent>
                  </MUI.Card>
                </MUI.Grid>
              );
            })}
          </MUI.Grid>

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
                  <MUI.Select
                    multiple
                    value={estudiantesSeleccionados}
                    onChange={e => {
                      const value = e.target.value as string[];
                      // Limitar la selección a las plazas disponibles
                      if (plazaSeleccionada) {
                        const disponibles = plazaSeleccionada.plazas_centro - plazasOcupadas(plazaSeleccionada);
                        if (value.length > disponibles) return;
                      }
                      setEstudiantesSeleccionados(value);
                    }}
                    label="Estudiantes"
                    renderValue={selected => selected.map(id => {
                      const est = estudiantesFiltrados.find(e => e.documento_id_est === id);
                      return est ? `${est.nombre_est} ${est.apellido_est}` : id;
                    }).join(', ')}
                    disabled={!plazaSeleccionada}
                  >
                    {estudiantesFiltrados.map(e => (
                      <MUI.MenuItem key={e.documento_id_est} value={e.documento_id_est} disabled={estudiantesSeleccionados.includes(e.documento_id_est)}>
                        <MUI.Checkbox checked={estudiantesSeleccionados.includes(e.documento_id_est)} />
                        {e.nombre_est} {e.apellido_est}
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                  <MUI.FormHelperText>Máximo {plazaSeleccionada ? plazaSeleccionada.plazas_centro - plazasOcupadas(plazaSeleccionada) : 0} estudiantes</MUI.FormHelperText>
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
              </MUI.Box>
              {error && <MUI.Alert severity="error" sx={{ mt: 2 }}>{error}</MUI.Alert>}
              {success && <MUI.Alert severity="success" sx={{ mt: 2 }}>{success}</MUI.Alert>}
            </MUI.DialogContent>
            <MUI.DialogActions>
              <MUI.Button onClick={() => setOpenDialog(false)}>Cancelar</MUI.Button>
              <MUI.Button variant="contained" onClick={handleCrearPasantias} disabled={loading}>Crear</MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>
        </MUI.Container>
      </MUI.Box>
    </MUI.Box>
  );
};

export default PasantiaPage;
