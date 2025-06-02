import { useEffect, useState } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import pasantiaService, { Pasantia } from '../../../services/pasantiaService';
import studentService, { Estudiante } from '../../../services/studentService';
import api from '../../../services/api';
import excusaEstudianteService, { ExcusaEstudiante } from '../../../services/excusaEstudianteService';
import SideBar from '../../../components/SideBar';
import DashboardAppBar from '../../../components/DashboardAppBar';

interface Tutor {
  id_tutor: number;
  nombre_tutor: string;
  apellido_tutor: string;
}

interface EstudianteExcusa {
  documento_id_est: string;
  nombre_est: string;
  apellido_est: string;
}

interface TallerResponse {
  id_taller: number;
  nombre_taller: string;
  cod_titulo_taller: string;
  estado_taller: string;
}

interface ExcusaConRelaciones extends ExcusaEstudiante {
  estudiante: EstudianteExcusa;
  tutor: Tutor;
}

const EnviarExcusa = () => {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [pasantias, setPasantias] = useState<Pasantia[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [excusas, setExcusas] = useState<ExcusaConRelaciones[]>([]);
  const [selectedPasantia, setSelectedPasantia] = useState<number | null>(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState<string>('');
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [justificacion, setJustificacion] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
  const [searchEstudiante, setSearchEstudiante] = useState('');
  const [selectedTallerFilter, setSelectedTallerFilter] = useState<string>('');
  const [talleres, setTalleres] = useState<TallerResponse[]>([]);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Iniciando carga de datos...');
        
        // Cargar talleres directamente desde la API
        console.log('Solicitando talleres...');
        const talleresResponse = await api.get<TallerResponse[]>('/talleres', {
          params: {
            estado: 'Activo'
          }
        });
        console.log('Talleres recibidos:', talleresResponse.data);
        setTalleres(talleresResponse.data);

        // Cargar el resto de los datos
        const [pasantiasData, estudiantesData, tutoresData, excusasData] = await Promise.all([
          pasantiaService.getAllPasantias(),
          studentService.getAllStudents(),
          api.get<Tutor[]>('/tutores').then(res => res.data),
          excusaEstudianteService.getAll(),
        ]);

        setPasantias(pasantiasData);
        setEstudiantes(estudiantesData);
        setTutores(tutoresData);
        if (Array.isArray(excusasData)) setExcusas(excusasData);

        console.log('Todos los datos cargados exitosamente');
      } catch (error) {
        console.error('Error detallado al cargar datos:', error);
        setSnackbar({ open: true, message: 'Error al cargar datos', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resetForm = () => {
    setSelectedPasantia(null);
    setSelectedEstudiante('');
    setSelectedTutor(null);
    setJustificacion('');
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPasantia || !selectedEstudiante || !selectedTutor || !justificacion.trim()) {
      setSnackbar({ open: true, message: 'Completa todos los campos', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        // Actualizar excusa
        await api.put(`/excusas-estudiante/${editId}`, {
          justificacion_excusa: justificacion,
          pasantia: selectedPasantia,
          tutor: selectedTutor,
          estudiante: selectedEstudiante
        });
        setSnackbar({ open: true, message: 'Excusa actualizada correctamente', severity: 'success' });
      } else {
        // Crear nueva excusa
        await excusaEstudianteService.create({
          justificacion_excusa: justificacion,
          pasantia: selectedPasantia,
          tutor: selectedTutor,
          estudiante: selectedEstudiante
        });
        setSnackbar({ open: true, message: 'Excusa enviada correctamente', severity: 'success' });
      }
      // Refrescar lista
      const excusasData = await excusaEstudianteService.getAll();
      if (Array.isArray(excusasData)) setExcusas(excusasData);
      resetForm();
    } catch {
      setSnackbar({ open: true, message: 'Error al guardar la excusa', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (excusa: ExcusaConRelaciones) => {
    setEditId(excusa.id_excusa!);
    setSelectedPasantia(excusa.pasantia);
    setSelectedEstudiante(excusa.estudiante.documento_id_est);
    setSelectedTutor(excusa.tutor.id_tutor);
    setJustificacion(excusa.justificacion_excusa);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta excusa?')) return;
    setLoading(true);
    try {
      await api.delete(`/excusas-estudiante/${id}`);
      setSnackbar({ open: true, message: 'Excusa eliminada', severity: 'success' });
      const data = await excusaEstudianteService.getAll();
      if (Array.isArray(data)) setExcusas(data);
      if (editId === id) resetForm();
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar la excusa', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar excusas
  const filteredExcusas = excusas.filter(excusa => {
    // Obtener el nombre del estudiante para la búsqueda
    const nombreEstudiante = `${excusa.estudiante.nombre_est} ${excusa.estudiante.apellido_est}`.toLowerCase();
    const searchMatch = nombreEstudiante.includes(searchEstudiante.toLowerCase());
    
    if (selectedTallerFilter) {
      // Buscar el estudiante completo
      const estudianteCompleto = estudiantes.find(e => e.documento_id_est === excusa.estudiante.documento_id_est);
      const tallerMatch = estudianteCompleto?.taller_est?.id_taller === parseInt(selectedTallerFilter);
      return searchMatch && tallerMatch;
    }
    
    return searchMatch;
  });

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      {/* Sidebar */}
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
      {/* Main content */}
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar toggleDrawer={toggleDrawer} />
        <MUI.Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
          <MUI.Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <MUI.Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
              <Icons.EventBusy sx={{ mr: 1, color: 'primary.main' }} /> {editId ? 'Editar Excusa' : 'Enviar Excusa'}
            </MUI.Typography>
            <form onSubmit={handleSubmit}>
              <MUI.Grid container spacing={2}>
                <MUI.Grid item xs={12} sm={6}>
                  <MUI.FormControl fullWidth required>
                    <MUI.InputLabel>Pasantía</MUI.InputLabel>
                    <MUI.Select
                      value={selectedPasantia || ''}
                      onChange={e => setSelectedPasantia(Number(e.target.value))}
                      label="Pasantía"
                    >
                      {pasantias.map(p => (
                        <MUI.MenuItem key={p.id_pas} value={p.id_pas}>
                          {p.id_pas} - {p.estudiante_pas.nombre_est} {p.estudiante_pas.apellido_est} / {p.centro_pas.nombre_centro}
                        </MUI.MenuItem>
                      ))}
                    </MUI.Select>
                  </MUI.FormControl>
                </MUI.Grid>
                <MUI.Grid item xs={12} sm={6}>
                  <MUI.FormControl fullWidth required>
                    <MUI.InputLabel>Estudiante</MUI.InputLabel>
                    <MUI.Select
                      value={selectedEstudiante}
                      onChange={e => setSelectedEstudiante(e.target.value)}
                      label="Estudiante"
                    >
                      {estudiantes.map(e => (
                        <MUI.MenuItem key={e.documento_id_est} value={e.documento_id_est}>
                          {e.nombre_est} {e.apellido_est} ({e.documento_id_est})
                        </MUI.MenuItem>
                      ))}
                    </MUI.Select>
                  </MUI.FormControl>
                </MUI.Grid>
                <MUI.Grid item xs={12} sm={6}>
                  <MUI.FormControl fullWidth required>
                    <MUI.InputLabel>Tutor</MUI.InputLabel>
                    <MUI.Select
                      value={selectedTutor || ''}
                      onChange={e => setSelectedTutor(Number(e.target.value))}
                      label="Tutor"
                    >
                      {tutores.map(t => (
                        <MUI.MenuItem key={t.id_tutor} value={t.id_tutor}>
                          {t.nombre_tutor} {t.apellido_tutor}
                        </MUI.MenuItem>
                      ))}
                    </MUI.Select>
                  </MUI.FormControl>
                </MUI.Grid>
                <MUI.Grid item xs={12} sm={6}>
                  <MUI.TextField
                    label="Justificación"
                    value={justificacion}
                    onChange={e => setJustificacion(e.target.value)}
                    multiline
                    minRows={2}
                    fullWidth
                    required
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} sx={{ textAlign: 'center' }}>
                  <MUI.Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={editId ? <Icons.Edit /> : <Icons.Send />}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    {loading ? <MUI.CircularProgress size={24} /> : (editId ? 'Actualizar Excusa' : 'Enviar Excusa')}
                  </MUI.Button>
                  {editId && (
                    <MUI.Button variant="outlined" color="secondary" onClick={resetForm} disabled={loading}>
                      Cancelar edición
                    </MUI.Button>
                  )}
                </MUI.Grid>
              </MUI.Grid>
            </form>
          </MUI.Paper>

          {/* Tabla de excusas */}
          <MUI.Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <MUI.Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Excusas Registradas
            </MUI.Typography>

            {/* Filtros */}
            <MUI.Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <MUI.TextField
                label="Buscar por estudiante"
                variant="outlined"
                size="small"
                value={searchEstudiante}
                onChange={(e) => setSearchEstudiante(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <MUI.FormControl size="small" sx={{ minWidth: 200 }}>
                <MUI.InputLabel>Filtrar por taller</MUI.InputLabel>
                <MUI.Select
                  value={selectedTallerFilter}
                  onChange={(e) => setSelectedTallerFilter(e.target.value)}
                  label="Filtrar por taller"
                >
                  <MUI.MenuItem value="">Todos</MUI.MenuItem>
                  {talleres.map(taller => (
                    <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                      {taller.nombre_taller}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>
            </MUI.Box>

            <MUI.TableContainer>
              <MUI.Table>
                <MUI.TableHead>
                  <MUI.TableRow>
                    <MUI.TableCell>ID</MUI.TableCell>
                    <MUI.TableCell>Pasantía</MUI.TableCell>
                    <MUI.TableCell>Estudiante</MUI.TableCell>
                    <MUI.TableCell>Tutor</MUI.TableCell>
                    <MUI.TableCell>Justificación</MUI.TableCell>
                    <MUI.TableCell>Fecha</MUI.TableCell>
                    <MUI.TableCell>Acciones</MUI.TableCell>
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {filteredExcusas.map((excusa) => {
                    // Buscar la pasantía por id (soporta ambos formatos: objeto o id)
                    let centroNombre = 'No encontrado';
                    const pasId = typeof excusa.pasantia === 'object' && excusa.pasantia !== null ? excusa.pasantia.id_pas : excusa.pasantia;
                    const pasantiaObj = pasantias.find(p => p.id_pas === pasId);
                    if (pasantiaObj && pasantiaObj.centro_pas && pasantiaObj.centro_pas.nombre_centro) {
                      centroNombre = pasantiaObj.centro_pas.nombre_centro;
                    }
                    return (
                      <MUI.TableRow key={excusa.id_excusa}>
                        <MUI.TableCell>{excusa.id_excusa}</MUI.TableCell>
                        <MUI.TableCell>{centroNombre}</MUI.TableCell>
                        <MUI.TableCell>
                          {excusa.estudiante && excusa.estudiante.nombre_est && excusa.estudiante.apellido_est
                            ? `${excusa.estudiante.nombre_est} ${excusa.estudiante.apellido_est}`
                            : 'No encontrado'}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          {excusa.tutor && excusa.tutor.nombre_tutor && excusa.tutor.apellido_tutor
                            ? `${excusa.tutor.nombre_tutor} ${excusa.tutor.apellido_tutor}`
                            : 'No encontrado'}
                        </MUI.TableCell>
                        <MUI.TableCell>{excusa.justificacion_excusa}</MUI.TableCell>
                        <MUI.TableCell>
                          {excusa.fecha_creacion_excusa 
                            ? new Date(excusa.fecha_creacion_excusa).toLocaleDateString()
                            : 'No disponible'}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.IconButton color="primary" onClick={() => handleEdit(excusa)}><Icons.Edit /></MUI.IconButton>
                          <MUI.IconButton color="error" onClick={() => handleDelete(excusa.id_excusa!)}><Icons.Delete /></MUI.IconButton>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    );
                  })}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.TableContainer>
          </MUI.Paper>
        </MUI.Container>
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MUI.Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
};

export default EnviarExcusa; 