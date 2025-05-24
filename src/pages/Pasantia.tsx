import React, { useState, useEffect } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import { internshipService } from '../services/internshipService';
import type { Taller, CentroTrabajo, PlazasCentro, Estudiante, Pasantia, EstadoPasantia } from '../services/internshipService';
import supervisorService from '../services/supervisorService';
import type { Supervisor } from '../services/supervisorService';
import SideBar from '../components/SideBar';
import DashboardAppBar from '../components/DashboardAppBar';

const PasantiaPage = () => {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState<boolean>(true);
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

  // Después de los estados existentes, antes del useEffect
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showHistorial, setShowHistorial] = useState<boolean>(false);
  const [pasantiaToEdit, setPasantiaToEdit] = useState<Pasantia | null>(null);
  const [pasantiaToDelete, setPasantiaToDelete] = useState<Pasantia | null>(null);

  // Nuevo estado para la pasantía a restaurar
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [pasantiaToRestore, setPasantiaToRestore] = useState<Pasantia | null>(null);

  // Separar las pasantías activas y canceladas
  const pasantiasActivas = pasantias.filter(p => p.estado_pas !== EstadoPasantia.CANCELADA);
  const pasantiasCanceladas = pasantias.filter(p => p.estado_pas === EstadoPasantia.CANCELADA);

  // Filtros separados para pasantías canceladas
  const [searchTallerFiltroCanceladas, setSearchTallerFiltroCanceladas] = useState<string>('');
  const [searchCentroFiltroCanceladas, setSearchCentroFiltroCanceladas] = useState<string>('');

  // Nuevo estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Restaurar la función plazasOcupadas que se perdió
  const plazasOcupadas = (plaza: PlazasCentro, pasantiaActual?: Pasantia | null) =>
    pasantias.filter(p => {
      if (!plaza.id_plaza) return false;
      // Si hay una pasantía actual siendo editada, no la contamos
      if (pasantiaActual && p.id_pas === pasantiaActual.id_pas) return false;
      const plazaId = typeof p.plaza_pas === 'object' && p.plaza_pas !== null
        ? p.plaza_pas.id_plaza
        : p.plaza_pas;
      return plazaId && Number(plazaId) === Number(plaza.id_plaza) &&
        (p.estado_pas === EstadoPasantia.EN_PROCESO || p.estado_pas === EstadoPasantia.PENDIENTE);
    }).length;

  // Filtrar pasantías según los criterios de búsqueda y estado
  const filtrarPasantias = (pasantiasList: Pasantia[], tallerFiltro: string, centroFiltro: string) => {
    return pasantiasList.filter(p => {
      const plazaId = typeof p.plaza_pas === 'object' && p.plaza_pas !== null
        ? p.plaza_pas.id_plaza
        : p.plaza_pas;
      
      const plaza = plazas.find(pl => pl.id_plaza === Number(plazaId));
      const tallerId = plaza?.taller_plaza?.id_taller;
      const centroId = p.centro_pas?.id_centro;
      
      // Filtrar por taller y centro
      const cumpleFiltroTaller = !tallerFiltro || (tallerId && String(tallerId) === tallerFiltro);
      const cumpleFiltroCentro = !centroFiltro || (centroId && String(centroId) === centroFiltro);

      // Filtrar por término de búsqueda (nombre o documento del estudiante)
      const nombreCompleto = `${p.estudiante_pas.nombre_est} ${p.estudiante_pas.apellido_est}`.toLowerCase();
      const documento = p.estudiante_pas.documento_id_est.toLowerCase();
      const termino = searchTerm.toLowerCase();
      const cumpleBusqueda = !searchTerm || 
        nombreCompleto.includes(termino) || 
        documento.includes(termino);
      
      return cumpleFiltroTaller && cumpleFiltroCentro && cumpleBusqueda;
    });
  };

  const pasantiasActivasFiltradas = filtrarPasantias(pasantiasActivas, tallerFiltro, centroFiltro);
  const pasantiasCanceladasFiltradas = filtrarPasantias(pasantiasCanceladas, searchTallerFiltroCanceladas, searchCentroFiltroCanceladas);

  // Filtrar plazas por taller seleccionado
  const plazasFiltradas = plazas.filter(p => {
    const tallerId = p.taller_plaza?.id_taller;
    return !tallerFiltro || (tallerId && Number(tallerId) === Number(tallerFiltro));
  });

  // Filtrar centros por taller (solo los que tienen plazas para ese taller)
  const centrosFiltrados = centros.filter(c => {
    if (!c.id_centro) return false;
    return plazasFiltradas.some(p => {
      const centroId = p.centro_plaza?.id_centro;
      return centroId && Number(centroId) === Number(c.id_centro);
    });
  });

  // Filtrar estudiantes por taller
  const estudiantesFiltrados = estudiantes.filter(e => {
    const tallerId = e.taller_est?.id_taller;
    return !tallerFiltro || (tallerId && Number(tallerId) === Number(tallerFiltro));
  });

  // Filtrar plazas para el menú de plazas según centro y taller seleccionados
  const plazasDisponiblesForm = plazas.filter(p => {
    const tallerId = p.taller_plaza?.id_taller;
    const centroId = p.centro_plaza?.id_centro;
    return (!tallerFiltro || (tallerId && Number(tallerId) === Number(tallerFiltro))) &&
      (!centroFiltro || (centroId && Number(centroId) === Number(centroFiltro)));
  });

  // Función para verificar si un estudiante ya tiene una pasantía activa
  const verificarPasantiasActivas = (estudiantesIds: string[]) => {
    const estudiantesConPasantia = pasantias
      .filter(p => 
        estudiantesIds.includes(p.estudiante_pas.documento_id_est) && 
        (p.estado_pas === EstadoPasantia.EN_PROCESO || p.estado_pas === EstadoPasantia.PENDIENTE)
      )
      .map(p => ({
        nombre: `${p.estudiante_pas.nombre_est} ${p.estudiante_pas.apellido_est}`,
        documento: p.estudiante_pas.documento_id_est
      }));

    return estudiantesConPasantia;
  };

  // Modificar el handleCrearPasantias para incluir la validación
  const handleCrearPasantias = async () => {
    if (!plazaFormSeleccionada || estudiantesSeleccionados.length === 0 || !supervisorSeleccionado || !fechaInicio) {
      setError('Completa todos los campos requeridos');
      return;
    }

    // Verificar estudiantes con pasantías activas
    const estudiantesConPasantia = verificarPasantiasActivas(estudiantesSeleccionados);
    if (estudiantesConPasantia.length > 0) {
      const mensajeError = `Los siguientes estudiantes ya tienen pasantías activas:\n${
        estudiantesConPasantia.map(e => `- ${e.nombre}`).join('\n')
      }\nDebes cancelar sus pasantías actuales antes de asignarles una nueva.`;
      setError(mensajeError);
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

  // Handler para editar pasantía
  const handleEditarPasantia = async () => {
    if (!pasantiaToEdit || !plazaFormSeleccionada || !supervisorSeleccionado || !fechaInicio) {
      setError('Completa todos los campos requeridos');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const supervisorId = Number(supervisorSeleccionado);
      if (isNaN(supervisorId)) throw new Error('ID de supervisor inválido');
      
      const supervisorObj = supervisores.find(s => s.id_sup === supervisorId);
      if (!supervisorObj) throw new Error('Supervisor no encontrado');

      if (!pasantiaToEdit.id_pas) throw new Error('ID de pasantía inválido');
      if (!plazaFormSeleccionada.id_plaza) throw new Error('ID de plaza inválido');

      await internshipService.updatePasantia(pasantiaToEdit.id_pas, {
        estudiante_pas: pasantiaToEdit.estudiante_pas,
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
        estado_pas: pasantiaToEdit.estado_pas,
      });

      setSuccess('Pasantía actualizada correctamente');
      setOpenEditDialog(false);
      setPasantiaToEdit(null);
      // Recargar pasantías
      const pasantiasData = await internshipService.getAllPasantias();
      setPasantias(pasantiasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la pasantía');
    } finally {
      setLoading(false);
    }
  };

  // Handler para cancelar pasantía
  const handleCancelarPasantia = async () => {
    if (!pasantiaToDelete || !pasantiaToDelete.id_pas) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await internshipService.updatePasantia(pasantiaToDelete.id_pas, {
        ...pasantiaToDelete,
        estado_pas: EstadoPasantia.CANCELADA
      });
      setSuccess('Pasantía cancelada correctamente');
      setOpenDeleteDialog(false);
      setPasantiaToDelete(null);
      // Recargar pasantías
      const pasantiasData = await internshipService.getAllPasantias();
      setPasantias(pasantiasData);
    } catch {
      setError('Error al cancelar la pasantía');
    } finally {
      setLoading(false);
    }
  };

  // Handler para restaurar pasantía
  const handleRestaurarPasantia = async () => {
    if (!pasantiaToRestore || !pasantiaToRestore.id_pas) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await internshipService.updatePasantia(pasantiaToRestore.id_pas, {
        ...pasantiaToRestore,
        estado_pas: EstadoPasantia.EN_PROCESO
      });
      setSuccess('Pasantía restaurada correctamente');
      setOpenRestoreDialog(false);
      setPasantiaToRestore(null);
      // Recargar pasantías
      const pasantiasData = await internshipService.getAllPasantias();
      setPasantias(pasantiasData);
    } catch {
      setError('Error al restaurar la pasantía');
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

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
          {/* Mensajes de éxito y error centralizados */}
          {error && (
            <MUI.Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </MUI.Alert>
          )}
          {success && (
            <MUI.Alert 
              severity="success" 
              onClose={() => setSuccess(null)}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {success}
            </MUI.Alert>
          )}
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
                        (!tallerFiltro || Number(p.taller_plaza.id_taller) === Number(tallerFiltro)) &&
                        (!centroFiltro || Number(p.centro_plaza.id_centro) === Number(centroFiltro))
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
                      (!tallerFiltro || Number(p.taller_plaza.id_taller) === Number(tallerFiltro)) &&
                      (!centroFiltro || Number(p.centro_plaza.id_centro) === Number(centroFiltro))
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
                        setTallerFiltro(String(plaza.taller_plaza.id_taller));
                        setCentroFiltro(String(plaza.centro_plaza.id_centro));
                        setPlazaFormSeleccionada(plaza);
                        setOpenDialog(true);
                        // Limpiar estados al abrir el diálogo
                        setEstudiantesSeleccionados([]);
                        setSupervisorSeleccionado('');
                        setFechaInicio('');
                        setFechaFin('');
                        setError(null);
                        setSuccess(null);
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
            <MUI.Box sx={{ mb: 3 }}>
              <MUI.Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {showHistorial ? (
                  <>
                    <Icons.History sx={{ fontSize: 28, color: theme.palette.error.main }} /> 
                    Historial de Pasantías Canceladas
                  </>
                ) : (
                  <>
                    <Icons.ListAlt sx={{ fontSize: 28, color: theme.palette.primary.main }} /> 
                    Pasantías Activas
                  </>
                )}
              </MUI.Typography>
              
              {/* Filtros */}
              <MUI.Grid container spacing={2} sx={{ mb: 2 }}>
                <MUI.Grid item xs={12} md={3}>
                  <MUI.TextField
                    fullWidth
                    label="Buscar estudiante"
                    placeholder="Nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <MUI.InputAdornment position="start">
                          <Icons.Search />
                        </MUI.InputAdornment>
                      ),
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={3}>
                  <MUI.Autocomplete
                    options={talleres}
                    getOptionLabel={t => `${t.nombre_taller} - ${t.familia_taller.nombre_fam}`}
                    value={talleres.find(t => String(t.id_taller) === (showHistorial ? searchTallerFiltroCanceladas : tallerFiltro)) || null}
                    onChange={(_, value) => showHistorial ? 
                      setSearchTallerFiltroCanceladas(value ? String(value.id_taller) : '') :
                      setTallerFiltro(value ? String(value.id_taller) : '')}
                    renderInput={(params) => (
                      <MUI.TextField
                        {...params}
                        label="Filtrar por Taller"
                        placeholder="Buscar taller..."
                        fullWidth
                      />
                    )}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={3}>
                  <MUI.Autocomplete
                    options={centros}
                    getOptionLabel={c => c.nombre_centro}
                    value={centros.find(c => String(c.id_centro) === (showHistorial ? searchCentroFiltroCanceladas : centroFiltro)) || null}
                    onChange={(_, value) => showHistorial ?
                      setSearchCentroFiltroCanceladas(value ? String(value.id_centro) : '') :
                      setCentroFiltro(value ? String(value.id_centro) : '')}
                    renderInput={(params) => (
                      <MUI.TextField
                        {...params}
                        label="Filtrar por Centro"
                        placeholder="Buscar centro..."
                        fullWidth
                      />
                    )}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MUI.FormControlLabel
                    control={
                      <MUI.Switch
                        checked={showHistorial}
                        onChange={(e) => {
                          setShowHistorial(e.target.checked);
                          setSearchTerm(''); // Limpiar búsqueda al cambiar de vista
                        }}
                        color="primary"
                      />
                    }
                    label={showHistorial ? "Ver Activas" : "Ver Historial"}
                  />
                </MUI.Grid>
              </MUI.Grid>
            </MUI.Box>

            {/* Tabla */}
            <MUI.TableContainer>
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
                    <MUI.TableCell align="center">Acciones</MUI.TableCell>
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {(showHistorial ? pasantiasCanceladasFiltradas : pasantiasActivasFiltradas).map(p => (
                    <MUI.TableRow key={p.id_pas} sx={showHistorial ? { bgcolor: '#fff3f3' } : undefined}>
                      <MUI.TableCell>{p.estudiante_pas.nombre_est} {p.estudiante_pas.apellido_est}</MUI.TableCell>
                      <MUI.TableCell>
                        {(() => {
                          const plazaId = typeof p.plaza_pas === 'object' && p.plaza_pas !== null
                            ? p.plaza_pas.id_plaza
                            : p.plaza_pas;
                          const plaza = plazas.find(pl => pl.id_plaza === plazaId);
                          return plaza?.taller_plaza?.nombre_taller || '-';
                        })()}
                      </MUI.TableCell>
                      <MUI.TableCell>{p.centro_pas.nombre_centro}</MUI.TableCell>
                      <MUI.TableCell>{p.supervisor_pas?.nombre_sup || '-'}</MUI.TableCell>
                      <MUI.TableCell>{p.inicio_pas ? new Date(p.inicio_pas).toLocaleDateString() : '-'}</MUI.TableCell>
                      <MUI.TableCell>{p.fin_pas ? new Date(p.fin_pas).toLocaleDateString() : '-'}</MUI.TableCell>
                      <MUI.TableCell>
                        <MUI.Chip 
                          label={p.estado_pas} 
                          color={p.estado_pas === EstadoPasantia.CANCELADA ? 'error' : 'info'}
                        />
                      </MUI.TableCell>
                      <MUI.TableCell align="center">
                        <MUI.Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {p.estado_pas === EstadoPasantia.CANCELADA ? (
                            <MUI.Tooltip title="Restaurar pasantía">
                              <MUI.IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setPasantiaToRestore(p);
                                  setOpenRestoreDialog(true);
                                }}
                              >
                                <Icons.Restore />
                              </MUI.IconButton>
                            </MUI.Tooltip>
                          ) : (
                            <>
                              <MUI.Tooltip title="Editar pasantía">
                                <MUI.IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setPasantiaToEdit(p);
                                    setTallerFiltro(p.estudiante_pas.taller_est?.id_taller || '');
                                    setCentroFiltro(String(p.centro_pas.id_centro));
                                    setPlazaFormSeleccionada(plazas.find(plaza => plaza.id_plaza === (typeof p.plaza_pas === 'object' ? p.plaza_pas.id_plaza : p.plaza_pas)) || null);
                                    setSupervisorSeleccionado(String(p.supervisor_pas?.id_sup || ''));
                                    setFechaInicio(p.inicio_pas ? new Date(p.inicio_pas).toISOString().split('T')[0] : '');
                                    setFechaFin(p.fin_pas ? new Date(p.fin_pas).toISOString().split('T')[0] : '');
                                    setOpenEditDialog(true);
                                  }}
                                >
                                  <Icons.Edit />
                                </MUI.IconButton>
                              </MUI.Tooltip>
                              <MUI.Tooltip title="Cancelar pasantía">
                                <MUI.IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setPasantiaToDelete(p);
                                    setOpenDeleteDialog(true);
                                  }}
                                >
                                  <Icons.Delete />
                                </MUI.IconButton>
                              </MUI.Tooltip>
                            </>
                          )}
                        </MUI.Box>
                      </MUI.TableCell>
                    </MUI.TableRow>
                  ))}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.TableContainer>
          </MUI.Paper>

          {/* Diálogo para crear pasantía */}
          <MUI.Dialog open={openDialog} onClose={() => {
            setOpenDialog(false);
            setError(null);
            setSuccess(null);
            setEstudiantesSeleccionados([]);
            setSupervisorSeleccionado('');
            setFechaInicio('');
            setFechaFin('');
          }} maxWidth="sm" fullWidth>
            <MUI.DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icons.AddCircleOutline sx={{ color: theme.palette.primary.main }} /> Nueva Pasantía
            </MUI.DialogTitle>
            <MUI.DialogContent>
              <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <MUI.Autocomplete
                  multiple
                  options={estudiantesFiltrados}
                  getOptionLabel={e => `${e.nombre_est} ${e.apellido_est} - ${e.documento_id_est}`}
                  value={estudiantes.filter(e => estudiantesSeleccionados.includes(e.documento_id_est))}
                  onChange={(_, value) => {
                    if (plazaFormSeleccionada) {
                      const disponibles = plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada);
                      if (value.length > disponibles) {
                        setError('No puedes seleccionar más estudiantes que plazas disponibles');
                        return;
                      }
                    }
                    const nuevosIds = value.map(e => e.documento_id_est);
                    const estudiantesConPasantia = verificarPasantiasActivas(nuevosIds);
                    
                    if (estudiantesConPasantia.length > 0) {
                      setError(`Los siguientes estudiantes ya tienen pasantías activas:\n${
                        estudiantesConPasantia.map(e => `- ${e.nombre}`).join('\n')
                      }`);
                    } else {
                      setError(null);
                    }
                    
                    setEstudiantesSeleccionados(nuevosIds);
                  }}
                  renderInput={(params) => (
                    <MUI.TextField
                      {...params}
                      label="Estudiantes"
                      placeholder="Buscar estudiantes..."
                      variant="outlined"
                      error={!!error && error.includes('estudiantes')}
                      helperText={error && error.includes('estudiantes') ? error : ''}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.documento_id_est === value.documento_id_est}
                />
                <MUI.FormHelperText>
                  Máximo {plazaFormSeleccionada ? plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada) : 0} estudiantes
                </MUI.FormHelperText>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel></MUI.InputLabel>
                  <MUI.Autocomplete
                    options={supervisores.filter(s => s.centro_trabajo && String(s.centro_trabajo.id_centro) === centroFiltro)}
                    getOptionLabel={s => `${s.nombre_sup} ${s.apellido_sup}`}
                    value={supervisores.find(s => String(s.id_sup) === supervisorSeleccionado) || null}
                    onChange={(_, value) => setSupervisorSeleccionado(value ? String(value.id_sup) : '')}
                    renderInput={(params) => (
                      <MUI.TextField
                        {...params}
                        label=""
                        placeholder="Buscar supervisor..."
                        variant="outlined"
                      />
                    )}
                  />
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
            </MUI.DialogContent>
            <MUI.DialogActions>
              <MUI.Button onClick={() => {
                setOpenDialog(false);
                setError(null);
                setSuccess(null);
              }}>
                Cancelar
              </MUI.Button>
              <MUI.Button 
                variant="contained" 
                onClick={handleCrearPasantias} 
                disabled={!!loading || (!!plazaFormSeleccionada && (plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada) === 0))}
              >
                {loading ? <MUI.CircularProgress size={24} /> : 'Crear'}
              </MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>

          {/* Diálogo para editar pasantía */}
          <MUI.Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
            <MUI.DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icons.Edit sx={{ color: theme.palette.primary.main }} /> Editar Pasantía
            </MUI.DialogTitle>
            <MUI.DialogContent>
              <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {error && (
                  <MUI.Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </MUI.Alert>
                )}
                {success && (
                  <MUI.Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                  </MUI.Alert>
                )}
                {/* Supervisor */}
                <MUI.Autocomplete
                  options={supervisores.filter(s => s.centro_trabajo && String(s.centro_trabajo.id_centro) === centroFiltro)}
                  getOptionLabel={s => `${s.nombre_sup} ${s.apellido_sup}`}
                  value={supervisores.find(s => String(s.id_sup) === supervisorSeleccionado) || null}
                  onChange={(_, value) => setSupervisorSeleccionado(value ? String(value.id_sup) : '')}
                  renderInput={(params) => (
                    <MUI.TextField
                      {...params}
                      label=""
                      placeholder="Buscar supervisor..."
                      variant="outlined"
                      error={!!error && error.includes('supervisor')}
                      helperText={error && error.includes('supervisor') ? error : ''}
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          backgroundColor: 'white',
                          px: 0.5,
                        }
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& .MuiAutocomplete-input': {
                        padding: '0px !important'
                      }
                    }
                  }}
                />

                {/* Taller */}
                <MUI.Autocomplete
                  options={talleres}
                  getOptionLabel={t => `${t.nombre_taller} - ${t.familia_taller.nombre_fam}`}
                  value={talleres.find(t => String(t.id_taller) === tallerFiltro) || null}
                  onChange={(_, value) => {
                    setTallerFiltro(value ? String(value.id_taller) : '');
                    setCentroFiltro('');
                    setPlazaFormSeleccionada(null);
                  }}
                  renderInput={(params) => (
                    <MUI.TextField
                      {...params}
                      label="Taller"
                      placeholder="Buscar taller..."
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          backgroundColor: 'white',
                          px: 0.5,
                        }
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& .MuiAutocomplete-input': {
                        padding: '0px !important'
                      }
                    }
                  }}
                />

                {/* Centro */}
                <MUI.Autocomplete
                  options={centrosFiltrados}
                  getOptionLabel={c => c.nombre_centro}
                  value={centrosFiltrados.find(c => String(c.id_centro) === centroFiltro) || null}
                  onChange={(_, value) => {
                    setCentroFiltro(value ? String(value.id_centro) : '');
                    setPlazaFormSeleccionada(null);
                  }}
                  renderInput={(params) => (
                    <MUI.TextField
                      {...params}
                      label="Centro de Trabajo"
                      placeholder="Buscar centro..."
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          backgroundColor: 'white',
                          px: 0.5,
                        }
                      }}
                    />
                  )}
                  disabled={!tallerFiltro}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& .MuiAutocomplete-input': {
                        padding: '0px !important'
                      }
                    }
                  }}
                />

                {/* Plaza */}
                <MUI.Autocomplete
                  options={plazasDisponiblesForm}
                  getOptionLabel={p => `${p.taller_plaza.nombre_taller} - ${p.centro_plaza.nombre_centro} (Disponibles: ${p.plazas_centro - plazasOcupadas(p)})`}
                  value={plazaFormSeleccionada}
                  onChange={(_, value) => {
                    if (value) {
                      const ocupadas = plazasOcupadas(value);
                      if (ocupadas >= value.plazas_centro) {
                        setError('Esta plaza ya no tiene cupos disponibles');
                        return;
                      }
                      setPlazaFormSeleccionada(value);
                      setError(null);
                    } else {
                      setPlazaFormSeleccionada(null);
                    }
                  }}
                  renderInput={(params) => (
                    <MUI.TextField
                      {...params}
                      label="Plaza"
                      placeholder="Buscar plaza..."
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                        sx: {
                          backgroundColor: 'white',
                          px: 0.5,
                        }
                      }}
                    />
                  )}
                  disabled={!centroFiltro || !tallerFiltro}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& .MuiAutocomplete-input': {
                        padding: '0px !important'
                      }
                    }
                  }}
                />

                {/* Fechas */}
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

                {plazaFormSeleccionada && (plazasOcupadas(plazaFormSeleccionada, pasantiaToEdit) >= plazaFormSeleccionada.plazas_centro) && 
                 (!pasantiaToEdit || plazaFormSeleccionada.id_plaza !== (typeof pasantiaToEdit.plaza_pas === 'object' ? pasantiaToEdit.plaza_pas.id_plaza : pasantiaToEdit.plaza_pas)) && (
                  <MUI.Grow in>
                    <MUI.Alert severity="error" icon={<Icons.Block fontSize="inherit" />} sx={{ my: 2, fontWeight: 'bold', fontSize: 18, borderRadius: 2, textAlign: 'center' }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: '#d32f2f' }}>¡Plaza sin cupos disponibles!</span><br />
                      No puedes asignar esta plaza porque ya no tiene cupos disponibles.<br />
                      Por favor, selecciona otra plaza.
                    </MUI.Alert>
                  </MUI.Grow>
                )}
              </MUI.Box>
            </MUI.DialogContent>
            <MUI.DialogActions>
              <MUI.Button onClick={() => {
                setOpenEditDialog(false);
                setError(null);
                setSuccess(null);
              }}>
                Cancelar
              </MUI.Button>
              <MUI.Button 
                variant="contained" 
                onClick={handleEditarPasantia}
                disabled={loading || false}
              >
                {loading ? <MUI.CircularProgress size={24} /> : 'Guardar Cambios'}
              </MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>

          {/* Diálogo de confirmación para cancelar pasantía */}
          <MUI.Dialog open={openDeleteDialog} onClose={() => {
            setOpenDeleteDialog(false);
            setError(null);
            setSuccess(null);
          }}>
            <MUI.DialogTitle>
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.Warning sx={{ color: theme.palette.error.main }} />
                Cancelar Pasantía
              </MUI.Box>
            </MUI.DialogTitle>
            <MUI.DialogContent>
              <MUI.Typography>
                ¿Estás seguro de que deseas cancelar esta pasantía? Esta acción cambiará su estado a "Cancelada".
              </MUI.Typography>
              {pasantiaToDelete && (
                <MUI.Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <MUI.Typography variant="subtitle2" gutterBottom>
                    Estudiante: {pasantiaToDelete.estudiante_pas.nombre_est} {pasantiaToDelete.estudiante_pas.apellido_est}
                  </MUI.Typography>
                  <MUI.Typography variant="subtitle2" gutterBottom>
                    Centro: {pasantiaToDelete.centro_pas.nombre_centro}
                  </MUI.Typography>
                  <MUI.Typography variant="subtitle2">
                    Taller: {pasantiaToDelete.estudiante_pas.taller_est?.nombre_taller || '-'}
                  </MUI.Typography>
                </MUI.Box>
              )}
            </MUI.DialogContent>
            <MUI.DialogActions>
              <MUI.Button onClick={() => {
                setOpenDeleteDialog(false);
                setError(null);
              }}>
                No, Mantener
              </MUI.Button>
              <MUI.Button 
                variant="contained" 
                color="error" 
                onClick={handleCancelarPasantia}
                disabled={loading}
                startIcon={loading ? <MUI.CircularProgress size={20} /> : <Icons.Delete />}
              >
                Sí, Cancelar Pasantía
              </MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>

          {/* Diálogo de confirmación para restaurar pasantía */}
          <MUI.Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)}>
            <MUI.DialogTitle>
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.Restore sx={{ color: theme.palette.success.main }} />
                Restaurar Pasantía
              </MUI.Box>
            </MUI.DialogTitle>
            <MUI.DialogContent>
              <MUI.Typography>
                ¿Estás seguro de que deseas restaurar esta pasantía? Esta acción cambiará su estado a "En Proceso".
              </MUI.Typography>
              {pasantiaToRestore && (
                <MUI.Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <MUI.Typography variant="subtitle2" gutterBottom>
                    Estudiante: {pasantiaToRestore.estudiante_pas.nombre_est} {pasantiaToRestore.estudiante_pas.apellido_est}
                  </MUI.Typography>
                  <MUI.Typography variant="subtitle2" gutterBottom>
                    Centro: {pasantiaToRestore.centro_pas.nombre_centro}
                  </MUI.Typography>
                  <MUI.Typography variant="subtitle2">
                    Taller: {pasantiaToRestore.estudiante_pas.taller_est?.nombre_taller || '-'}
                  </MUI.Typography>
                </MUI.Box>
              )}
            </MUI.DialogContent>
            <MUI.DialogActions>
              <MUI.Button onClick={() => {
                setOpenRestoreDialog(false);
                setError(null);
              }}>
                No, Mantener Cancelada
              </MUI.Button>
              <MUI.Button 
                variant="contained" 
                color="success" 
                onClick={handleRestaurarPasantia}
                disabled={loading}
                startIcon={loading ? <MUI.CircularProgress size={20} /> : <Icons.Restore />}
              >
                Sí, Restaurar Pasantía
              </MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>
        </MUI.Container>
      </MUI.Box>
    </MUI.Box>
  );
};

export default PasantiaPage;
