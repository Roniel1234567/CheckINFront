import React, { useState, useEffect } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import { internshipService } from '../services/internshipService';
import type { Taller, CentroTrabajo, PlazasCentro, Estudiante, Pasantia } from '../services/internshipService';
import { EstadoPasantia } from '../services/internshipService';
import supervisorService from '../services/supervisorService';
import type { Supervisor } from '../services/supervisorService';
import SideBar from '../components/SideBar';
import DashboardAppBar from '../components/DashboardAppBar';
import { authService } from '../services/authService';
import studentService from '../services/studentService';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

// Definir tipo mínimo para Tutor solo para este uso
interface TutorMin {
  usuario_tutor: number | { id_usuario: number };
  taller_tutor: number | { id_taller: number };
}

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
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mostrarPlazas, setMostrarPlazas] = useState(false);
  const [tipoVista, setTipoVista] = useState<'activas' | 'canceladas' | 'terminadas'>('activas');

  // Nuevo estado para la plaza seleccionada en el formulario
  const [plazaFormSeleccionada, setPlazaFormSeleccionada] = useState<PlazasCentro | null>(null);

  // Estados para diálogos
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [pasantiaToEdit, setPasantiaToEdit] = useState<Pasantia | null>(null);
  const [pasantiaToDelete, setPasantiaToDelete] = useState<Pasantia | null>(null);
  const [pasantiaToRestore, setPasantiaToRestore] = useState<Pasantia | null>(null);

  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener usuario actual
  const user = authService.getCurrentUser();
  const esEstudiante = user && user.rol === 1;
  const esTutor = user && user.rol === 3;
  const esEmpresa = user && user.rol === 2;
  const [tallerTutor, setTallerTutor] = useState<string>('');

  const location = useLocation();

  // Función para calcular plazas ocupadas
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

  // Separar las pasantías por estado
  const [pasantiasActivas, pasantiasCanceladas, pasantiasTerminadas] = pasantias.reduce<[Pasantia[], Pasantia[], Pasantia[]]>(
    (acc, pasantia) => {
      // Verificar si el estudiante tiene ambas fechas establecidas
      const estudiante = estudiantes.find(e => e.documento_id_est === pasantia.estudiante_pas.documento_id_est);
      const tieneFechaInicio = estudiante?.fecha_inicio_pasantia;
      const tieneFechaFin = estudiante?.fecha_fin_pasantia;

      if (tieneFechaInicio && tieneFechaFin) {
        // Se considera terminada
        acc[2].push({ ...pasantia, estado_pas: EstadoPasantia.TERMINADA });
      } else if (pasantia.estado_pas === EstadoPasantia.CANCELADA) {
        acc[1].push(pasantia);
      } else {
        acc[0].push(pasantia);
      }
      return acc;
    },
    [[], [], []] // [activas, canceladas, terminadas]
  );

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
  const pasantiasCanceladasFiltradas = filtrarPasantias(pasantiasCanceladas, tallerFiltro, centroFiltro);
  const pasantiasTerminadasFiltradas = filtrarPasantias(pasantiasTerminadas, tallerFiltro, centroFiltro);

  // Filtrar plazas por taller seleccionado
  const plazasFiltradas = plazas.filter(p => {
    const tallerId = p.taller_plaza?.id_taller;
    // Solo mostrar plazas activas
    return (!tallerFiltro || (tallerId && String(tallerId) === tallerFiltro)) && p.estado === 'Activa';
  });

  // Filtrar centros por taller (solo los que tienen plazas activas para ese taller)
  const centrosFiltrados = centros.filter(c => {
    if (!c.id_centro) return false;
    return plazasFiltradas.some(p => {
      const centroId = p.centro_plaza?.id_centro;
      return centroId && Number(centroId) === Number(c.id_centro);
    });
  });

  // Filtrar estudiantes por taller y estado activo
  const estudiantesFiltrados = estudiantes.filter(e => {
    const tallerId = e.taller_est?.id_taller;
    const esActivo = (e as any).usuario_est?.estado_usuario === 'Activo';
    if (esTutor && tallerTutor) {
      return tallerId && String(tallerId) === tallerTutor && esActivo;
    }
    return (!tallerFiltro || (tallerId && String(tallerId) === tallerFiltro)) && esActivo;
  });

  // Filtrar plazas para el menú de plazas según centro y taller seleccionados
  const plazasDisponiblesForm = plazas.filter(p => {
    const tallerId = p.taller_plaza?.id_taller;
    const centroId = p.centro_plaza?.id_centro;
    return (!tallerFiltro || (tallerId && String(tallerId) === tallerFiltro)) &&
      (!centroFiltro || (centroId && String(centroId) === centroFiltro)) &&
      p.estado === 'Activa'; // Solo mostrar plazas activas
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

  // Función para calcular la edad
  const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Función para validar restricciones de la plaza
  const validarRestriccionesPlaza = (estudiante: Estudiante, plaza: PlazasCentro): { valido: boolean; mensaje: string } => {
    if (!estudiante.fecha_nac_est) {
      return { valido: false, mensaje: 'El estudiante no tiene fecha de nacimiento registrada' };
    }

    const edad = calcularEdad(estudiante.fecha_nac_est);
    
    // Validar edad mínima
    if (plaza.edad_minima && edad < plaza.edad_minima) {
      return { 
        valido: false, 
        mensaje: `El estudiante no cumple con la edad mínima requerida (${plaza.edad_minima} años)` 
      };
    }

    // Validar sexo
    if (plaza.genero && plaza.genero !== 'Ambos') {
      // Convertir el género de la plaza a un formato comparable con el sexo del estudiante
      const generoNormalizado = plaza.genero === 'Masculino' ? 'M' : 'F';
      if (!estudiante.sexo_est || estudiante.sexo_est !== generoNormalizado) {
        return { 
          valido: false, 
          mensaje: `Esta plaza solo acepta estudiantes de sexo ${plaza.genero}` 
        };
      }
    }

    return { valido: true, mensaje: '' };
  };

  // Mover cargarDatos fuera del useEffect
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
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Usar useEffect con la función cargarDatos
  useEffect(() => {
    cargarDatos();
  }, [location]);

  // Si es estudiante, filtrar solo su pasantía después de cargar los datos
  useEffect(() => {
    let cancelado = false;
    const filtrarPasantiaEstudiante = async () => {
      if (esEstudiante && user) {
        try {
          const estudiantes = await studentService.getAllStudents();
          const estudianteLogueado = estudiantes.find(e => e.usuario_est && e.usuario_est.id_usuario === user.id_usuario);
          if (estudianteLogueado) {
            if (!cancelado) setPasantias(pasantias.filter(p => p.estudiante_pas?.documento_id_est === estudianteLogueado.documento_id_est));
          } else {
            if (!cancelado) setPasantias([]);
          }
        } catch {
          if (!cancelado) setPasantias([]);
        }
      }
    };
    filtrarPasantiaEstudiante();
    return () => { cancelado = true; };
  }, [esEstudiante, user, location]);

  // Obtener el taller del tutor al cargar
  useEffect(() => {
    const fetchTallerTutor = async () => {
      if (esTutor && user) {
        try {
          // Usar axios para asegurar baseURL y headers correctos
          const { data: tutores } = await api.get<TutorMin[]>('/tutores');
          const tutor = tutores.find((t) => {
            if (typeof t.usuario_tutor === 'object' && t.usuario_tutor !== null) {
              return t.usuario_tutor.id_usuario === user.id_usuario;
            }
            return t.usuario_tutor === user.id_usuario;
          });
          if (tutor && tutor.taller_tutor) {
            const idTaller = typeof tutor.taller_tutor === 'object' && tutor.taller_tutor !== null
              ? tutor.taller_tutor.id_taller
              : tutor.taller_tutor;
            setTallerTutor(String(idTaller));
            setTallerFiltro(String(idTaller));
          }
        } catch (error: any) {
          if (error.response && error.response.data && typeof error.response.data === 'string' && error.response.data.startsWith('<!DOCTYPE')) {
            console.error('Error: El backend respondió HTML en vez de JSON. Revisa la URL base y el proxy.');
          } else {
            console.error('Error al obtener el taller del tutor:', error);
          }
        }
      }
    };
    fetchTallerTutor();
  }, [esTutor, user]);

  // Diálogo de edición
  const handleEditClick = (pasantia: Pasantia) => {
    setPasantiaToEdit(pasantia);
    
    // Obtener el taller y centro de la plaza actual
    const plazaId = typeof pasantia.plaza_pas === 'object' ? pasantia.plaza_pas.id_plaza : pasantia.plaza_pas;
    const plazaActual = plazas.find(p => p.id_plaza === plazaId);
    
    if (plazaActual?.taller_plaza?.id_taller) {
      setTallerFiltro(String(plazaActual.taller_plaza.id_taller));
    }

    if (plazaActual?.centro_plaza?.id_centro) {
      setCentroFiltro(String(plazaActual.centro_plaza.id_centro));
    }

    // Establecer la plaza
    if (plazaActual) {
      setPlazaFormSeleccionada(plazaActual);
    }

    // Establecer el supervisor
    if (pasantia.supervisor_pas?.id_sup) {
      setSupervisorSeleccionado(String(pasantia.supervisor_pas.id_sup));
    }

    setOpenEditDialog(true);
  };

  // Modificar el handleCrearPasantias para incluir la validación
  const handleCrearPasantias = async () => {
    if (!plazaFormSeleccionada || estudiantesSeleccionados.length === 0 || !supervisorSeleccionado) {
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
        setError('No puedes seleccionar más estudiantes que plazas disponibles');
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
          estado_pas: EstadoPasantia.EN_PROCESO,
        });
      }));

      // Limpiar completamente el formulario
      setSuccess('Pasantías creadas correctamente');
      setOpenDialog(false);
      setEstudiantesSeleccionados([]);
      setTallerFiltro('');
      setCentroFiltro('');
      setSupervisorSeleccionado('');
      setPlazaFormSeleccionada(null);

      // Recargar todos los datos
      await cargarDatos();
    } catch (error) {
      console.error('Error al crear las pasantías:', error);
      setError('Error al crear las pasantías');
    } finally {
      setLoading(false);
    }
  };

  // Handler para editar pasantía
  const handleEditarPasantia = async () => {
    if (!pasantiaToEdit || !plazaFormSeleccionada || !supervisorSeleccionado) {
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
        estado_pas: pasantiaToEdit.estado_pas,
      });

      setSuccess('Pasantía actualizada correctamente');
      setOpenEditDialog(false);
      setPasantiaToEdit(null);
      setTallerFiltro('');
      setCentroFiltro('');
      setSupervisorSeleccionado('');
      setPlazaFormSeleccionada(null);

      // Recargar todos los datos
      await cargarDatos();
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

  // Modificar el onChange del Autocomplete de estudiantes
  const handleEstudiantesChange = (_event: React.SyntheticEvent, value: Estudiante[]) => {
    if (plazaFormSeleccionada) {
      const disponibles = plazaFormSeleccionada.plazas_centro - plazasOcupadas(plazaFormSeleccionada);
      if (value.length > disponibles) {
        setError('No puedes seleccionar más estudiantes que plazas disponibles');
        return;
      }

      // Validar restricciones para cada estudiante
      const estudiantesInvalidos = value.map(estudiante => {
        const validacion = validarRestriccionesPlaza(estudiante, plazaFormSeleccionada);
        if (!validacion.valido) {
          return `${estudiante.nombre_est} ${estudiante.apellido_est}: ${validacion.mensaje}`;
        }
        return null;
      }).filter(Boolean);

      if (estudiantesInvalidos.length > 0) {
        setError(`Los siguientes estudiantes no cumplen con las restricciones:\n${estudiantesInvalidos.join('\n')}`);
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
  };

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`, p: 0 }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar toggleDrawer={toggleDrawer} />
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
              {/* Filtro de Taller */}
              <MUI.Grid item xs={12} md={3}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel sx={{ color: '#fff' }}>Taller</MUI.InputLabel>
                  <MUI.Select
                    value={tallerFiltro}
                    onChange={e => {
                      setTallerFiltro(e.target.value);
                      setCentroFiltro('');
                      setPlazaFormSeleccionada(null);
                    }}
                    label="Taller"
                    sx={{
                      color: '#fff',
                      '& .MuiSelect-icon': { color: '#fff' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                    }}
                  >
                    <MUI.MenuItem value=""><em>Todos</em></MUI.MenuItem>
                    {talleres.map(t => (
                      <MUI.MenuItem key={t.id_taller} value={String(t.id_taller)}>
                        {t.nombre_taller}
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>

              {/* Filtro de Centro */}
              <MUI.Grid item xs={12} md={3}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel sx={{ color: '#fff' }}>Centro de Trabajo</MUI.InputLabel>
                  <MUI.Select
                    value={centroFiltro}
                    onChange={e => {
                      setCentroFiltro(e.target.value);
                      setPlazaFormSeleccionada(null);
                    }}
                    label="Centro de Trabajo"
                    disabled={esEmpresa}
                    sx={{
                      color: '#fff',
                      '& .MuiSelect-icon': { color: '#fff' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                    }}
                  >
                    {esEmpresa && user && (() => {
                      // Buscar el centro de la empresa logueada
                      const centroEmpresa = centros.find(c => {
                        const centro = c as any;
                        if (typeof centro.usuario === 'object' && centro.usuario !== null) {
                          return centro.usuario.id_usuario === user.id_usuario;
                        }
                        return centro.usuario === user.id_usuario;
                      });
                      return centroEmpresa ? (
                        <MUI.MenuItem key={centroEmpresa.id_centro} value={String(centroEmpresa.id_centro)}>
                          {centroEmpresa.nombre_centro}
                        </MUI.MenuItem>
                      ) : null;
                    })()}
                    {!esEmpresa && centrosFiltrados.map((centro) => (
                      <MUI.MenuItem key={centro.id_centro} value={String(centro.id_centro)}>
                        {centro.nombre_centro}
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>

              {/* Filtro de Plaza */}
              <MUI.Grid item xs={12} md={3}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel sx={{ color: '#fff' }}>Plaza</MUI.InputLabel>
                  <MUI.Select
                    value={plazaFormSeleccionada ? String(plazaFormSeleccionada.id_plaza) : ''}
                    onChange={e => {
                      const plaza = plazas.find(p => String(p.id_plaza) === e.target.value);
                      setPlazaFormSeleccionada(plaza || null);
                    }}
                    label="Plaza"
                    disabled={!centroFiltro || !tallerFiltro}
                    sx={{
                      color: '#fff',
                      '& .MuiSelect-icon': { color: '#fff' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                    }}
                  >
                    <MUI.MenuItem value=""><em>Seleccione una plaza</em></MUI.MenuItem>
                    {plazasDisponiblesForm.map(p => (
                      <MUI.MenuItem key={p.id_plaza} value={String(p.id_plaza)}>
                        {p.taller_plaza.nombre_taller} - {p.centro_plaza.nombre_centro} (Disponibles: {p.plazas_centro - plazasOcupadas(p)})
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>

              {/* Botón Nueva Pasantía */}
              {!esEmpresa && (
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
                      '&:hover': { bgcolor: theme.palette.warning.main }
                    }}
                    onClick={() => setOpenDialog(true)}
                    disabled={!plazaFormSeleccionada || plazasOcupadas(plazaFormSeleccionada) >= (plazaFormSeleccionada?.plazas_centro || 0)}
                  >
                    Nueva Pasantía
                  </MUI.Button>
                </MUI.Grid>
              )}
            </MUI.Grid>
          </MUI.Paper>

          {/* Botón para mostrar plazas */}
          <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <MUI.Button
              variant={mostrarPlazas ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setMostrarPlazas(!mostrarPlazas)}
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

          {/* Tarjetas de plazas */}
          {!esEstudiante && !esEmpresa && mostrarPlazas && tallerFiltro && (
            <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
              {plazasFiltradas.map((plaza) => {
                const ocupadas = plazasOcupadas(plaza);
                const disponibles = plaza.plazas_centro - ocupadas;
                return (
                  <MUI.Grid item xs={12} sm={6} md={4} key={plaza.id_plaza}>
                    <MUI.Card
                      sx={{
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(26,35,126,0.10)',
                        border: `2px solid ${theme.palette.primary.main}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(26,35,126,0.15)',
                        },
                      }}
                      onClick={() => {
                        setTallerFiltro(String(plaza.taller_plaza.id_taller));
                        setCentroFiltro(String(plaza.centro_plaza.id_centro));
                        setPlazaFormSeleccionada(plaza);
                        setOpenDialog(true);
                      }}
                    >
                      <MUI.CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <MUI.Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                          {plaza.taller_plaza.nombre_taller}
                        </MUI.Typography>
                        <MUI.Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                          {plaza.centro_plaza.nombre_centro}
                        </MUI.Typography>
                        <MUI.Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <MUI.Chip
                            label={`Total: ${plaza.plazas_centro}`}
                            color="primary"
                            size="small"
                          />
                          <MUI.Chip
                            label={`Ocupadas: ${ocupadas}`}
                            color="warning"
                            size="small"
                          />
                          <MUI.Chip
                            label={`Disponibles: ${disponibles}`}
                            color="success"
                            size="small"
                          />
                        </MUI.Box>
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
                {(() => {
                  switch (tipoVista) {
                    case 'canceladas':
                      return <>
                        <Icons.History sx={{ fontSize: 28, color: theme.palette.error.main }} /> 
                        Historial de Pasantías Canceladas
                      </>;
                    case 'terminadas':
                      return <>
                        <Icons.CheckCircle sx={{ fontSize: 28, color: theme.palette.success.main }} /> 
                        Pasantías Terminadas
                      </>;
                    default:
                      return <>
                        <Icons.ListAlt sx={{ fontSize: 28, color: theme.palette.primary.main }} /> 
                        Pasantías Activas
                      </>;
                  }
                })()}
              </MUI.Typography>

              {/* Filtros de búsqueda */}
              <MUI.Grid container spacing={2} sx={{ mb: 3 }}>
                <MUI.Grid item xs={12} md={4}>
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
                <MUI.Grid item xs={12} md={4}>
                  <MUI.Autocomplete
                    options={talleres}
                    getOptionLabel={t => `${t.nombre_taller} - ${t.familia_taller.nombre_fam}`}
                    value={talleres.find(t => String(t.id_taller) === tallerFiltro) || null}
                    onChange={(_, value) => setTallerFiltro(value ? String(value.id_taller) : '')}
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
                <MUI.Grid item xs={12} md={4}>
                  <MUI.Autocomplete
                    options={centros}
                    getOptionLabel={c => c.nombre_centro}
                    value={centros.find(c => String(c.id_centro) === centroFiltro) || null}
                    onChange={(_, value) => setCentroFiltro(value ? String(value.id_centro) : '')}
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
              </MUI.Grid>

              {/* Botones de filtro centrados */}
              <MUI.Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <MUI.ButtonGroup variant="outlined" size="large">
                  <MUI.Button
                    variant={tipoVista === 'activas' ? 'contained' : 'outlined'}
                    onClick={() => setTipoVista('activas')}
                    sx={{ px: 4 }}
                  >
                    Activas
                  </MUI.Button>
                  <MUI.Button
                    variant={tipoVista === 'terminadas' ? 'contained' : 'outlined'}
                    onClick={() => setTipoVista('terminadas')}
                    sx={{ px: 4 }}
                  >
                    Terminadas
                  </MUI.Button>
                  <MUI.Button
                    variant={tipoVista === 'canceladas' ? 'contained' : 'outlined'}
                    onClick={() => setTipoVista('canceladas')}
                    sx={{ px: 4 }}
                  >
                    Canceladas
                  </MUI.Button>
                </MUI.ButtonGroup>
              </MUI.Box>
            </MUI.Box>

            {/* Tabla */}
            <MUI.TableContainer>
              <MUI.Table>
                <MUI.TableHead>
                  <MUI.TableRow>
                    <MUI.TableCell>Estudiante</MUI.TableCell>
                    <MUI.TableCell>Taller</MUI.TableCell>
                    <MUI.TableCell>Centro</MUI.TableCell>
                    {tipoVista === 'terminadas' ? (
                      <>
                        <MUI.TableCell>Fecha Inicio</MUI.TableCell>
                        <MUI.TableCell>Fecha Fin</MUI.TableCell>
                      </>
                    ) : (
                      <>
                    <MUI.TableCell>Supervisor</MUI.TableCell>
                    <MUI.TableCell>Estado</MUI.TableCell>
                    <MUI.TableCell align="center">Acciones</MUI.TableCell>
                      </>
                    )}
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {(() => {
                    let pasantiasMostradas;
                    switch (tipoVista) {
                      case 'canceladas':
                        pasantiasMostradas = pasantiasCanceladasFiltradas;
                        break;
                      case 'terminadas':
                        pasantiasMostradas = pasantiasTerminadasFiltradas;
                        break;
                      default:
                        pasantiasMostradas = pasantiasActivasFiltradas;
                    }

                    // Si es empresa, filtrar solo las pasantías de su centro
                    if (esEmpresa && user) {
                      // Buscar el id_centro del centro de trabajo de la empresa logueada
                      let idCentroEmpresa: number | undefined = undefined;
                      if (centros.length > 0) {
                        // Buscar el centro cuyo usuario (objeto o id) coincide con el usuario logueado
                        const centroEmpresa = centros.find(c => {
                          const centro = c as any;
                          if (typeof centro.usuario === 'object' && centro.usuario !== null) {
                            return centro.usuario.id_usuario === user.id_usuario;
                          }
                          return centro.usuario === user.id_usuario;
                        });
                        idCentroEmpresa = centroEmpresa?.id_centro;
                      }
                      if (idCentroEmpresa) {
                        pasantiasMostradas = pasantiasMostradas.filter(p => p.centro_pas?.id_centro === idCentroEmpresa);
                      } else {
                        pasantiasMostradas = [];
                      }
                    }

                    return pasantiasMostradas.map(p => (
                      <MUI.TableRow 
                        key={p.id_pas} 
                        sx={tipoVista === 'canceladas' ? { bgcolor: '#fff3f3' } : 
                           tipoVista === 'terminadas' ? { bgcolor: '#f0f7f0' } : undefined}
                      >
                      <MUI.TableCell>{p.estudiante_pas.nombre_est} {p.estudiante_pas.apellido_est}</MUI.TableCell>
                      <MUI.TableCell>
                        {(() => {
                          if (!p.plaza_pas) return '-';
                          const plazaId = typeof p.plaza_pas === 'object' ? p.plaza_pas.id_plaza : p.plaza_pas;
                          const plaza = plazas.find(pl => pl.id_plaza === plazaId);
                            return plaza?.taller_plaza?.nombre_taller || '-';
                        })()}
                      </MUI.TableCell>
                      <MUI.TableCell>{p.centro_pas.nombre_centro}</MUI.TableCell>
                        {tipoVista === 'terminadas' ? (
                          <>
                            <MUI.TableCell>
                              {(() => {
                                const estudiante = estudiantes.find(e => e.documento_id_est === p.estudiante_pas.documento_id_est);
                                return estudiante?.fecha_inicio_pasantia ? 
                                  new Date(estudiante.fecha_inicio_pasantia).toLocaleDateString() : 
                                  'No definida';
                              })()}
                            </MUI.TableCell>
                            <MUI.TableCell>
                              {(() => {
                                const estudiante = estudiantes.find(e => e.documento_id_est === p.estudiante_pas.documento_id_est);
                                return estudiante?.fecha_fin_pasantia ? 
                                  new Date(estudiante.fecha_fin_pasantia).toLocaleDateString() : 
                                  'No definida';
                              })()}
                            </MUI.TableCell>
                          </>
                        ) : (
                          <>
                      <MUI.TableCell>{p.supervisor_pas?.nombre_sup || '-'}</MUI.TableCell>
                      <MUI.TableCell>
                        <MUI.Chip 
                          label={p.estado_pas} 
                          color={p.estado_pas === EstadoPasantia.CANCELADA ? 'error' : 'info'}
                        />
                      </MUI.TableCell>
                      <MUI.TableCell align="center">
                        <MUI.Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                {tipoVista === 'canceladas' ? (
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
                              {!esEmpresa && (
                                <>
                                  <MUI.Tooltip title="Editar pasantía">
                                    <MUI.IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleEditClick(p)}
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
                            </>
                          )}
                        </MUI.Box>
                      </MUI.TableCell>
                          </>
                        )}
                    </MUI.TableRow>
                    ));
                  })()}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.TableContainer>
          </MUI.Paper>

          {/* Diálogos */}
          {!esEmpresa && (
            <MUI.Dialog
              open={openDialog}
              onClose={() => {
                setOpenDialog(false);
                setEstudiantesSeleccionados([]);
                setSupervisorSeleccionado('');
                setPlazaFormSeleccionada(null);
              }}
              maxWidth="md"
              fullWidth
            >
              <MUI.DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.AddCircleOutline sx={{ color: theme.palette.primary.main }} /> Nueva Pasantía
              </MUI.DialogTitle>
              <MUI.DialogContent>
                <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                  {/* Mostrar restricciones de la plaza si hay una seleccionada */}
                  {plazaFormSeleccionada && (
                    <MUI.Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mb: 2 }}>
                      <MUI.Typography variant="subtitle1" color="primary" gutterBottom>
                        Restricciones de la Plaza:
                      </MUI.Typography>
                      <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {plazaFormSeleccionada.edad_minima && (
                          <MUI.Typography variant="body2">
                            • Edad mínima requerida: {plazaFormSeleccionada.edad_minima} años
                          </MUI.Typography>
                        )}
                        {plazaFormSeleccionada.genero && (
                          <MUI.Typography variant="body2">
                            • Sexo requerido: {plazaFormSeleccionada.genero}
                          </MUI.Typography>
                        )}
                        {plazaFormSeleccionada.observacion && (
                          <>
                            <MUI.Typography variant="body2" color="error">
                              • Observaciones importantes:
                            </MUI.Typography>
                            <MUI.Typography variant="body2" sx={{ pl: 2 }}>
                              {plazaFormSeleccionada.observacion}
                            </MUI.Typography>
                          </>
                        )}
                      </MUI.Box>
                    </MUI.Paper>
                  )}

                  <MUI.Autocomplete
                    multiple
                    options={estudiantesFiltrados}
                    getOptionLabel={e => `${e.nombre_est} ${e.apellido_est} - ${e.documento_id_est}`}
                    value={estudiantes.filter(e => estudiantesSeleccionados.includes(e.documento_id_est))}
                    onChange={handleEstudiantesChange}
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
          )}

          {/* Diálogo para editar pasantía */}
          {!esEmpresa && (
            <>
              <MUI.Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <MUI.DialogTitle>
                  <Icons.Edit /> Editar Pasantía
                </MUI.DialogTitle>
                <MUI.DialogContent>
                  <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {/* Estudiante */}
                    <MUI.TextField
                      label="Estudiante"
                      value={pasantiaToEdit ? `${pasantiaToEdit.estudiante_pas.nombre_est} ${pasantiaToEdit.estudiante_pas.apellido_est}` : ''}
                      disabled
                      fullWidth
                    />

                    {/* Taller */}
                    <MUI.TextField
                      label="Taller"
                      value={pasantiaToEdit?.estudiante_pas?.taller_est?.nombre_taller || ''}
                      disabled
                      fullWidth
                    />

                    {/* Centro */}
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Centro de Trabajo</MUI.InputLabel>
                      <MUI.Select
                        value={centroFiltro}
                        label="Centro de Trabajo"
                        onChange={(e) => {
                          setCentroFiltro(e.target.value);
                          setPlazaFormSeleccionada(null);
                          setSupervisorSeleccionado('');
                        }}
                        disabled={esEmpresa}
                      >
                        {esEmpresa && user && (() => {
                          // Buscar el centro de la empresa logueada
                          const centroEmpresa = centros.find(c => {
                            const centro = c as any;
                            if (typeof centro.usuario === 'object' && centro.usuario !== null) {
                              return centro.usuario.id_usuario === user.id_usuario;
                            }
                            return centro.usuario === user.id_usuario;
                          });
                          return centroEmpresa ? (
                            <MUI.MenuItem key={centroEmpresa.id_centro} value={String(centroEmpresa.id_centro)}>
                              {centroEmpresa.nombre_centro}
                            </MUI.MenuItem>
                          ) : null;
                        })()}
                        {!esEmpresa && centrosFiltrados.map((centro) => (
                          <MUI.MenuItem key={centro.id_centro} value={String(centro.id_centro)}>
                            {centro.nombre_centro}
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>

                    {/* Supervisor */}
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Supervisor</MUI.InputLabel>
                      <MUI.Select
                        value={supervisorSeleccionado}
                        label="Supervisor"
                        onChange={(e) => setSupervisorSeleccionado(e.target.value)}
                      >
                        {supervisores
                          .filter(s => s.centro_trabajo && String(s.centro_trabajo.id_centro) === centroFiltro)
                          .map((supervisor) => (
                            <MUI.MenuItem key={supervisor.id_sup} value={String(supervisor.id_sup)}>
                              {supervisor.nombre_sup} {supervisor.apellido_sup}
                            </MUI.MenuItem>
                          ))}
                      </MUI.Select>
                    </MUI.FormControl>

                    {/* Plaza */}
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Plaza</MUI.InputLabel>
                      <MUI.Select
                        value={plazaFormSeleccionada ? String(plazaFormSeleccionada.id_plaza) : ''}
                        label="Plaza"
                        onChange={(e) => {
                          const plaza = plazas.find(p => String(p.id_plaza) === e.target.value);
                          if (plaza) {
                            setPlazaFormSeleccionada(plaza);
                          }
                        }}
                      >
                        {plazasDisponiblesForm.map((plaza) => (
                          <MUI.MenuItem key={plaza.id_plaza} value={String(plaza.id_plaza)}>
                            {plaza.taller_plaza.nombre_taller} - {plaza.centro_plaza.nombre_centro}
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Box>
                </MUI.DialogContent>
                <MUI.DialogActions>
                  <MUI.Button onClick={() => setOpenEditDialog(false)}>
                    Cancelar
                  </MUI.Button>
                  <MUI.Button 
                    variant="contained" 
                    onClick={handleEditarPasantia}
                    disabled={loading}
                  >
                    {loading ? <MUI.CircularProgress size={24} /> : 'Guardar Cambios'}
                  </MUI.Button>
                </MUI.DialogActions>
              </MUI.Dialog>
            </>
          )}

          {/* Diálogo de confirmación para cancelar pasantía */}
          {!esEmpresa && (
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
          )}

          {/* Diálogo de confirmación para restaurar pasantía */}
          {!esEmpresa && (
            <>
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
            </>
          )}
        </MUI.Container>
      </MUI.Box>
    </MUI.Box>
  );
};

export default PasantiaPage;
