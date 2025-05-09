/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../../components/SideBar';
import DashboardAppBar from '../../../components/DashboardAppBar';
import studentService, { Estudiante, NuevoEstudiante } from '../../../services/studentService';
import tallerService, { Taller } from '../../../services/tallerService';
import contactService, { NuevoContacto } from '../../../services/contactService';

const estudiantesDemo: Estudiante[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    documento: '12345678',
    taller: 'Mecánica',
    contacto: 'juan@email.com',
    estado: 'Activo',
    poliza: { nombre: 'Seguros S.A.', numero: 'POL123' },
    fechas: { inicio: '2024-06-01', fin: '2024-12-01' }
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'López',
    documento: '87654321',
    taller: 'Electrónica',
    contacto: 'maria@email.com',
    estado: 'Activo'
  }
];

function Students() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formularios
  const [nuevoEstudiante, setNuevoEstudiante] = useState<NuevoEstudiante>({
    nombre: '', apellido: '', documento: '', taller: '', contacto: ''
  });
  const [poliza, setPoliza] = useState({ estudiante: '', nombre: '', numero: '' });
  const [fechas, setFechas] = useState({ estudiante: '', inicio: '', fin: '' });
  const [nuevoContacto, setNuevoContacto] = useState<NuevoContacto>({ telefono_contacto: '', email_contacto: '' });

  // Cargar estudiantes y talleres
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [estudiantesData, talleresData] = await Promise.all([
        studentService.getAllStudents(),
        tallerService.getAllTalleres()
      ]);
      // Mapeo para adaptar los campos del backend al frontend
      const estudiantesAdaptados = estudiantesData.map(est => ({
        id: (est as any).documento_id_est || (est as any).id || '',
        nombre: (est as any).nombre_est || (est as any).nombre || '',
        apellido: (est as any).apellido_est || (est as any).apellido || '',
        documento: (est as any).documento_id_est || (est as any).documento || '',
        taller: (est as any).taller_est || (est as any).taller || '',
        contacto: (est as any).contacto_est || (est as any).contacto || '',
        estado: (est as any).estado || 'Activo',
        poliza: (est as any).poliza,
        fechas: (est as any).fechas
      }));
      setEstudiantes(estudiantesAdaptados);
      setTalleres(talleresData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTab = (_: any, value: number) => setTab(value);

  const handleNuevoEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación rápida de campos obligatorios
    if (!nuevoEstudiante.nombre || !nuevoEstudiante.apellido || !nuevoEstudiante.documento || !nuevoEstudiante.taller || !nuevoContacto.telefono_contacto || !nuevoContacto.email_contacto) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    try {
      setLoading(true);
      // 1. Crear el contacto
      const contactoCreado = await contactService.createContacto({
        telefono_contacto: nuevoContacto.telefono_contacto,
        email_contacto: nuevoContacto.email_contacto
      });
      // 2. Crear el estudiante usando el ID del contacto
      await studentService.createStudent({
        ...nuevoEstudiante,
        contacto: contactoCreado.id_contacto
      });
      setSuccess('Estudiante registrado exitosamente');
      setNuevoEstudiante({ nombre: '', apellido: '', documento: '', taller: '', contacto: '' });
      setNuevoContacto({ telefono_contacto: '', email_contacto: '' });
      loadData();
    } catch (err) {
      setError('Error al registrar el estudiante');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePoliza = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await studentService.assignPolicy(poliza.estudiante, {
        nombre: poliza.nombre,
        numero: poliza.numero
      });
      setSuccess('Póliza asignada exitosamente');
      setPoliza({ estudiante: '', nombre: '', numero: '' });
      loadData();
    } catch (err) {
      setError('Error al asignar la póliza');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFechas = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await studentService.assignInternshipDates(fechas.estudiante, {
        inicio: fechas.inicio,
        fin: fechas.fin
      });
      setSuccess('Fechas asignadas exitosamente');
      setFechas({ estudiante: '', inicio: '', fin: '' });
      loadData();
    } catch (err) {
      setError('Error al asignar las fechas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId: string, newStatus: 'Activo' | 'Inactivo' | 'Eliminado') => {
    try {
      setLoading(true);
      await studentService.updateStudentStatus(studentId, newStatus);
      setSuccess('Estado actualizado exitosamente');
      loadData();
    } catch (err) {
      setError('Error al actualizar el estado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEstudiantes = estudiantes.filter(est =>
    `${est.nombre} ${est.apellido} ${est.documento}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar notifications={3} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />
        {loading && (
          <MUI.Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.8)', zIndex: 9999 }}>
            <MUI.CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          </MUI.Box>
        )}
        {error && (
          <MUI.Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </MUI.Alert>
        )}
        {success && (
          <MUI.Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </MUI.Alert>
        )}
        {/* Encabezado */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icons.School sx={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }} />
            Estudiantes
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Gestión integral de estudiantes en pasantía
          </MUI.Typography>
        </MUI.Box>
        {/* Tabs */}
        <MUI.Box sx={{ px: { xs: 1, md: 4 } }}>
          <MUI.Tabs value={tab} onChange={handleTab} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
            <MUI.Tab icon={<Icons.ListAlt />} label="Listado" />
            <MUI.Tab icon={<Icons.PersonAdd />} label="Registrar" />
            <MUI.Tab icon={<Icons.AssignmentInd />} label="Póliza" />
            <MUI.Tab icon={<Icons.DateRange />} label="Fechas" />
          </MUI.Tabs>
        </MUI.Box>
        {/* Listado */}
        {tab === 0 && (
          <MUI.Box sx={{ px: { xs: 1, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.13)' } }}>
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <MUI.TextField
                  placeholder="Buscar estudiante..."
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <Icons.Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  sx={{ flexGrow: 1, minWidth: 200 }}
                />
              </MUI.Box>
              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Documento</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Taller</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Póliza</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fechas</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {filteredEstudiantes.map(est => (
                      <MUI.TableRow key={est.id} hover sx={{ transition: 'all 0.3s', '&:hover': { backgroundColor: MUI.alpha(theme.palette.primary.main, 0.05) } }}>
                        <MUI.TableCell>
                          <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MUI.Avatar sx={{ bgcolor: theme.palette.primary.main }}>{est.nombre.charAt(0)}</MUI.Avatar>
                            {est.nombre} {est.apellido}
                          </MUI.Box>
                        </MUI.TableCell>
                        <MUI.TableCell>{est.documento}</MUI.TableCell>
                        <MUI.TableCell>
                          {typeof est.taller === 'object' && est.taller !== null
                            ? est.taller.nombre_taller
                            : est.taller}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          {typeof est.contacto === 'object' && est.contacto !== null
                            ? (est.contacto.email_contacto || est.contacto.telefono_contacto || '')
                            : est.contacto}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.Chip label={est.estado} color={est.estado === 'Activo' ? 'success' : est.estado === 'Inactivo' ? 'warning' : 'error'} size="small" icon={est.estado === 'Activo' ? <Icons.CheckCircle /> : est.estado === 'Inactivo' ? <Icons.PauseCircle /> : <Icons.Delete />} />
                        </MUI.TableCell>
                        <MUI.TableCell>
                          {est.poliza ? (
                            <MUI.Tooltip title={`N°: ${est.poliza.numero}`}><MUI.Chip icon={<Icons.Policy />} label={est.poliza.nombre} color="info" size="small" /></MUI.Tooltip>
                          ) : <MUI.Chip label="Sin póliza" size="small" />}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          {est.fechas ? (
                            <MUI.Tooltip title={`Del ${est.fechas.inicio} al ${est.fechas.fin}`}><MUI.Chip icon={<Icons.DateRange />} label="Asignadas" color="primary" size="small" /></MUI.Tooltip>
                          ) : <MUI.Chip label="Sin fechas" size="small" />}
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </MUI.Paper>
          </MUI.Box>
        )}
        {/* Registro */}
        {tab === 1 && (
          <MUI.Box sx={{ px: { xs: 1, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 3, maxWidth: 600, mx: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.13)' } }}>
              <MUI.Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.PersonAdd /> Registrar Estudiante
              </MUI.Typography>
              <form onSubmit={handleNuevoEstudiante}>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField label="Nombre" required fullWidth value={nuevoEstudiante.nombre} onChange={e => setNuevoEstudiante({ ...nuevoEstudiante, nombre: e.target.value })} InputProps={{ startAdornment: <Icons.Person sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField label="Apellido" required fullWidth value={nuevoEstudiante.apellido} onChange={e => setNuevoEstudiante({ ...nuevoEstudiante, apellido: e.target.value })} InputProps={{ startAdornment: <Icons.Person sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField label="Documento" required fullWidth value={nuevoEstudiante.documento} onChange={e => setNuevoEstudiante({ ...nuevoEstudiante, documento: e.target.value })} InputProps={{ startAdornment: <Icons.Badge sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.FormControl fullWidth required>
                      <MUI.InputLabel>Taller</MUI.InputLabel>
                      <MUI.Select
                        value={String(nuevoEstudiante.taller)}
                        label="Taller"
                        onChange={e => setNuevoEstudiante({ ...nuevoEstudiante, taller: Number(e.target.value) })}
                      >
                        {talleres.map(taller => (
                          <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                            {taller.nombre_taller}
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField label="Teléfono de contacto" required fullWidth value={nuevoContacto.telefono_contacto} onChange={e => setNuevoContacto({ ...nuevoContacto, telefono_contacto: e.target.value })} InputProps={{ startAdornment: <Icons.Phone sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField label="Email de contacto" required fullWidth value={nuevoContacto.email_contacto} onChange={e => setNuevoContacto({ ...nuevoContacto, email_contacto: e.target.value })} InputProps={{ startAdornment: <Icons.Email sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <MUI.Button type="submit" variant="contained" color="primary" size="large" startIcon={<Icons.Save />} sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                    Registrar
                  </MUI.Button>
                </MUI.Box>
              </form>
            </MUI.Paper>
          </MUI.Box>
        )}
        {/* Póliza */}
        {tab === 2 && (
          <MUI.Box sx={{ px: { xs: 1, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 3, maxWidth: 500, mx: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.13)' } }}>
              <MUI.Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.Policy /> Asignar Póliza
              </MUI.Typography>
              <form onSubmit={handlePoliza}>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12}>
                    <MUI.FormControl fullWidth required>
                      <MUI.InputLabel>Estudiante</MUI.InputLabel>
                      <MUI.Select label="Estudiante" value={poliza.estudiante} onChange={e => setPoliza({ ...poliza, estudiante: e.target.value })}>
                        {estudiantes.map(est => (
                          <MUI.MenuItem value={est.id} key={est.id}>{est.nombre} {est.apellido}</MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.TextField label="Nombre de la póliza" required fullWidth value={poliza.nombre} onChange={e => setPoliza({ ...poliza, nombre: e.target.value })} InputProps={{ startAdornment: <Icons.Policy sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.TextField label="Número de póliza" required fullWidth value={poliza.numero} onChange={e => setPoliza({ ...poliza, numero: e.target.value })} InputProps={{ startAdornment: <Icons.Numbers sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <MUI.Button type="submit" variant="contained" color="primary" size="large" startIcon={<Icons.Save />} sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                    Asignar
                  </MUI.Button>
                </MUI.Box>
              </form>
            </MUI.Paper>
          </MUI.Box>
        )}
        {/* Fechas */}
        {tab === 3 && (
          <MUI.Box sx={{ px: { xs: 1, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 3, maxWidth: 500, mx: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.13)' } }}>
              <MUI.Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.DateRange /> Asignar Fechas de Pasantía
              </MUI.Typography>
              <form onSubmit={handleFechas}>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12}>
                    <MUI.FormControl fullWidth required>
                      <MUI.InputLabel>Estudiante</MUI.InputLabel>
                      <MUI.Select label="Estudiante" value={fechas.estudiante} onChange={e => setFechas({ ...fechas, estudiante: e.target.value })}>
                        {estudiantes.map(est => (
                          <MUI.MenuItem value={est.id} key={est.id}>{est.nombre} {est.apellido}</MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField label="Fecha de inicio" type="date" required fullWidth value={fechas.inicio} onChange={e => setFechas({ ...fechas, inicio: e.target.value })} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <Icons.Event sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField label="Fecha de fin" type="date" required fullWidth value={fechas.fin} onChange={e => setFechas({ ...fechas, fin: e.target.value })} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <Icons.EventAvailable sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <MUI.Button type="submit" variant="contained" color="primary" size="large" startIcon={<Icons.Save />} sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
                    Asignar
                  </MUI.Button>
                </MUI.Box>
              </form>
            </MUI.Paper>
          </MUI.Box>
        )}
      </MUI.Box>
    </MUI.Box>
  );
}

export default Students;