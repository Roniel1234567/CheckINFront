import { useEffect, useState, useRef } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import pasantiaService, { Pasantia } from '../../../services/pasantiaService';
import studentService, { Estudiante } from '../../../services/studentService';
import api, { getTutorByUsuario } from '../../../services/api';
import excusaEstudianteService from '../../../services/excusaEstudianteService';
import SideBar from '../../../components/SideBar';
import DashboardAppBar from '../../../components/DashboardAppBar';
import { authService } from '../../../services/authService';

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Tutor {
  id_tutor: number;
  nombre_tutor: string;
  apellido_tutor: string;
  taller_tutor?: number | { id_taller: number };
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

interface ExcusaEstudiante {
  id_excusa?: number;
  justificacion_excusa: string;
  fecha_creacion_excusa?: string;
  pasantia: number; // id_pasantia
  tutor: number;    // id_tutor
  estudiante: string; // documento_id_est
  certificados?: string | { data: number[] };
}

interface ExcusaConRelaciones extends Omit<ExcusaEstudiante, 'tutor' | 'estudiante'> {
  estudiante: EstudianteExcusa;
  tutor: Tutor;
  certificados?: string | { data: number[] };
}

interface NuevaExcusaEstudiante {
  justificacion_excusa: string;
  pasantia: number;
  tutor: number;
  estudiante: string;
  certificados?: string | { data: number[] };
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
  const [isEstudiante, setIsEstudiante] = useState(false);
  const [isTutor, setIsTutor] = useState(false);
  const [tutorId, setTutorId] = useState<number | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openImageViewer, setOpenImageViewer] = useState(false);
  const [openPdfViewer, setOpenPdfViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [imageScale, setImageScale] = useState(1);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        const esEstudiante = currentUser?.rol === 1;
        const esTutor = currentUser?.rol === 3;
        setIsEstudiante(esEstudiante);
        setIsTutor(esTutor);

        if (esTutor && currentUser) {
          // Obtener el id_tutor del usuario logueado
          const tutorData = await getTutorByUsuario(currentUser.id_usuario) as Tutor;
          setTutorId(tutorData.id_tutor);
        }

        if (esEstudiante && currentUser) {
          // 1. Obtener el estudiante por id_usuario
          const estudiante = await studentService.getStudentByUsuarioId(currentUser.id_usuario);
          if (!estudiante) {
            throw new Error('No se encontró el estudiante');
          }
          setSelectedEstudiante(estudiante.documento_id_est || '');

          // 2. Obtener el taller del estudiante
          const idTaller = estudiante.taller_est?.id_taller;

          // 3. Obtener tutores SOLO de ese taller
          let tutoresFiltrados: Tutor[] = [];
          if (idTaller) {
            const response = await api.get<Tutor[]>(`/tutores/taller/${idTaller}`);
            tutoresFiltrados = Array.isArray(response.data) ? response.data : [];
          }
          setTutores(tutoresFiltrados);
          
          // Solo establecer el tutor si hay uno disponible
          if (tutoresFiltrados.length === 1) {
            setSelectedTutor(tutoresFiltrados[0].id_tutor);
          } else {
            setSelectedTutor(null);
          }

          // 4. Obtener todas las pasantías y filtrar la del estudiante activa
          const pasantiasData = await pasantiaService.getAllPasantias();
          const pasantiaActiva = pasantiasData.find(
            p => p.estudiante_pas?.documento_id_est === estudiante.documento_id_est && p.estado_pas === 'En Proceso'
          );
          
          // Validar que la pasantía tenga un id válido antes de asignarla
          if (pasantiaActiva && typeof pasantiaActiva.id_pas === 'number') {
            setPasantias([pasantiaActiva]);
            setSelectedPasantia(pasantiaActiva.id_pas);
          } else {
            setPasantias([]);
            setSelectedPasantia(null);
          }

          // 5. Obtener excusas
          const excusasData = await excusaEstudianteService.getAll();
          if (Array.isArray(excusasData)) {
            const excusasPlanas = excusasData.filter(e => 
              e && 
              typeof e === 'object' && 
              !Array.isArray(e) && 
              'id_excusa' in e
            );
            setExcusas(excusasPlanas);
          }

          setEstudiantes([estudiante]);
        } else {
          // Lógica para otros roles
          const [pasantiasData, estudiantesData, tutoresData, excusasData, talleresResponse] = await Promise.all([
            pasantiaService.getAllPasantias(),
            studentService.getAllStudents(),
            api.get<Tutor[]>('/tutores').then(res => res.data),
            excusaEstudianteService.getAll(),
            api.get<TallerResponse[]>('/talleres', { params: { estado: 'Activo' } })
          ]);

          // Filtrar y validar pasantías
          const pasantiasValidas = pasantiasData.filter(p => typeof p.id_pas === 'number');
          setPasantias(pasantiasValidas);
          
          // Filtrar y validar estudiantes
          const estudiantesValidos = estudiantesData.filter(e => e && e.documento_id_est);
          setEstudiantes(estudiantesValidos);
          
          // Filtrar y validar tutores
          const tutoresValidos = Array.isArray(tutoresData) ? tutoresData.filter(t => t && t.id_tutor) : [];
          setTutores(tutoresValidos);
          
          // Establecer talleres
          setTalleres(talleresResponse.data || []);
          
          // Filtrar y validar excusas
          if (Array.isArray(excusasData)) {
            const excusasPlanas = excusasData.filter(e => 
              e && 
              typeof e === 'object' && 
              !Array.isArray(e) && 
              'id_excusa' in e
            );
            setExcusas(excusasPlanas);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Error al cargar los datos. Por favor, intenta de nuevo.',
          severity: 'error'
        });
      }
    };
    
    fetchData();
  }, []);

  // Preselecciona el primer tutor solo si hay uno tras recarga de tutores
  useEffect(() => {
    if (isEstudiante && tutores.length === 1) {
      setSelectedTutor(tutores[0].id_tutor);
    }
  }, [tutores, isEstudiante]);

  const resetForm = () => {
    setSelectedPasantia(null);
    setSelectedEstudiante('');
    setSelectedTutor(null);
    setJustificacion('');
    setEditId(null);
    setArchivo(null);
    setArchivoPreview(null);
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivo(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setArchivoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setArchivoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedPasantia ||
      !selectedEstudiante ||
      selectedTutor === null ||
      isNaN(Number(selectedTutor)) ||
      Number(selectedTutor) <= 0 ||
      !justificacion.trim()
    ) {
      setSnackbar({ open: true, message: 'Completa todos los campos', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      let certificadosBase64: string | undefined = undefined;
      if (archivo) {
        certificadosBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(archivo);
        });
      }
      if (editId) {
        // Actualizar excusa
        await api.put(`/excusas-estudiante/${editId}`, {
          justificacion_excusa: justificacion,
          pasantia: selectedPasantia,
          tutor: selectedTutor,
          estudiante: selectedEstudiante,
          certificados: certificadosBase64
        });
        setSnackbar({ open: true, message: 'Excusa actualizada correctamente', severity: 'success' });
      } else {
        // Crear nueva excusa
        const nuevaExcusa: NuevaExcusaEstudiante = {
          justificacion_excusa: justificacion,
          pasantia: selectedPasantia,
          tutor: selectedTutor,
          estudiante: selectedEstudiante,
          certificados: certificadosBase64
        };
        await excusaEstudianteService.create(nuevaExcusa);
        setSnackbar({ open: true, message: 'Excusa enviada correctamente', severity: 'success' });
      }
      // Refrescar lista
      const excusasData = await excusaEstudianteService.getAll();
      if (Array.isArray(excusasData)) {
        const excusasPlanas = excusasData.filter(e => 
          e && 
          typeof e === 'object' && 
          !Array.isArray(e) && 
          'id_excusa' in e
        );
        setExcusas(excusasPlanas);
      }
      resetForm();
    } catch (error) {
      console.error('Error al guardar excusa:', error);
      setSnackbar({ open: true, message: 'Error al guardar la excusa', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (excusa: ExcusaConRelaciones) => {
    if (!excusa || !excusa.id_excusa) return;
    
    setEditId(excusa.id_excusa);
    setSelectedPasantia(typeof excusa.pasantia === 'number' ? excusa.pasantia : null);
    setSelectedEstudiante(excusa.estudiante?.documento_id_est || '');
    setSelectedTutor(excusa.tutor?.id_tutor || null);
    setJustificacion(excusa.justificacion_excusa || '');
    
    // Si hay certificados, crea un preview
    if (excusa.certificados) {
      try {
        // Si viene como base64 o buffer, reconstruir
        let base64 = '';
        if (typeof excusa.certificados === 'string') {
          base64 = excusa.certificados;
        } else if (excusa.certificados?.data) {
          // Buffer (array de bytes)
          base64 = btoa(String.fromCharCode(...excusa.certificados.data));
        }
        setArchivoPreview(base64 ? `data:application/pdf;base64,${base64}` : null);
      } catch (error) {
        console.error('Error al procesar certificado:', error);
        setArchivoPreview(null);
      }
    } else {
      setArchivoPreview(null);
    }
    setArchivo(null);
  };

  const handleDelete = async (id: number) => {
    if (!id || !window.confirm('¿Seguro que deseas eliminar esta excusa?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/excusas-estudiante/${id}`);
      setSnackbar({ open: true, message: 'Excusa eliminada', severity: 'success' });
      
      const excusasData = await excusaEstudianteService.getAll();
      if (Array.isArray(excusasData)) {
        const excusasPlanas = excusasData.filter(e => 
          e && 
          typeof e === 'object' && 
          !Array.isArray(e) && 
          'id_excusa' in e
        );
        setExcusas(excusasPlanas);
      }
      
      if (editId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error al eliminar excusa:', error);
      setSnackbar({ open: true, message: 'Error al eliminar la excusa', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar excusas con validación adicional
  const filteredExcusas = excusas.filter(excusa => {
    if (!excusa || typeof excusa !== 'object' || !('id_excusa' in excusa)) {
      return false;
    }
    
    // Si es tutor, solo mostrar excusas relacionadas a su id_tutor
    if (isTutor && tutorId) {
      return excusa.tutor?.id_tutor === tutorId;
    }
    
    // Verificar que estudiante existe y tiene las propiedades necesarias
    if (!excusa.estudiante || typeof excusa.estudiante !== 'object') {
      return false;
    }
    
    const nombreEstudiante = `${excusa.estudiante.nombre_est || ''} ${excusa.estudiante.apellido_est || ''}`.toLowerCase();
    const searchMatch = nombreEstudiante.includes(searchEstudiante.toLowerCase());
    
    if (selectedTallerFilter) {
      const estudianteCompleto = estudiantes.find(e => e.documento_id_est === excusa.estudiante.documento_id_est);
      const tallerMatch = estudianteCompleto?.taller_est?.id_taller === parseInt(selectedTallerFilter);
      return searchMatch && tallerMatch;
    }
    
    return searchMatch;
  });

  // Filtrar las pasantías mostradas en el select si es estudiante
  const pasantiasFiltradas: Pasantia[] = isEstudiante 
    ? (pasantias.filter(p => typeof p.id_pas === 'number') as Pasantia[])
    : (pasantias.filter(p => typeof p.id_pas === 'number') as Pasantia[]);

  // Filtrar los estudiantes mostrados en el select si es estudiante
  const estudiantesFiltrados = isEstudiante
    ? estudiantes
    : estudiantes;

  // Filtrar tutores por taller si es estudiante (ya se hace en el useEffect)
  let tutoresFiltrados = tutores;
  if (isEstudiante && estudiantes.length > 0) {
    const estudiante = estudiantes[0];
    const idTallerEstudiante = estudiante.taller_est?.id_taller;
    if (idTallerEstudiante) {
      tutoresFiltrados = tutores.filter(t => {
        // Si el tutor tiene taller_tutor como número
        // o como objeto con id_taller
        return t.taller_tutor === idTallerEstudiante || (typeof t.taller_tutor === 'object' && t.taller_tutor?.id_taller === idTallerEstudiante);
      });
    }
  }

  // Función para detectar el tipo de archivo
  const detectFileType = (data: string | { data: number[] } | undefined): 'png' | 'pdf' | null => {
    if (!data) return null;

    try {
      let base64String = '';
      if (typeof data === 'string') {
        base64String = data;
      } else if (data.data) {
        const bytes = new Uint8Array(data.data);
        base64String = btoa(
          Array.from(bytes)
            .map(byte => String.fromCharCode(byte))
            .join('')
        );
      }

      // Intentar detectar por contenido del base64
      if (base64String.includes('iVBORw0KGgo') || // Firma PNG en base64
          base64String.includes('data:image/png')) {
        return 'png';
      }
      
      if (base64String.includes('JVBERi0') || // Firma PDF en base64
          base64String.includes('data:application/pdf')) {
        return 'pdf';
      }

      // Si no podemos detectar por contenido, intentar por el primer byte decodificado
      try {
        const decoded = atob(base64String);
        const firstByte = decoded.charCodeAt(0);
        
        if (firstByte === 0x89) { // PNG signature
          return 'png';
        }
        if (firstByte === 0x25) { // PDF signature
          return 'pdf';
        }
      } catch (e) {
        console.log('Error decodificando base64:', e);
      }

      // Si aún no podemos detectar, intentar inferir por el tamaño y patrón
      if (base64String.length > 0) {
        // Asumimos que es PNG por defecto si no podemos detectar
        return 'png';
      }

      return null;
    } catch (error) {
      console.error('Error detectando tipo de archivo:', error);
      return null;
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

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
                      value={selectedPasantia !== null ? selectedPasantia : ''}
                      onChange={e => !isEstudiante && !isTutor && setSelectedPasantia(Number(e.target.value))}
                      label="Pasantía"
                      disabled={isEstudiante || isTutor}
                    >
                      {pasantiasFiltradas.length > 0 ? pasantiasFiltradas.map(p => (
                        <MUI.MenuItem key={p.id_pas} value={p.id_pas}>
                          {p.id_pas} - {p.estudiante_pas.nombre_est} {p.estudiante_pas.apellido_est} / {p.centro_pas.nombre_centro}
                        </MUI.MenuItem>
                      )) : <MUI.MenuItem value="">Sin pasantía activa</MUI.MenuItem>}
                    </MUI.Select>
                  </MUI.FormControl>
                </MUI.Grid>
                <MUI.Grid item xs={12} sm={6}>
                  <MUI.FormControl fullWidth required>
                    <MUI.InputLabel>Estudiante</MUI.InputLabel>
                    <MUI.Select
                      value={selectedEstudiante}
                      onChange={e => !isEstudiante && !isTutor && setSelectedEstudiante(e.target.value)}
                      label="Estudiante"
                      disabled={isEstudiante || isTutor}
                    >
                      {estudiantesFiltrados.map(e => (
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
                      value={selectedTutor ?? ''}
                      onChange={e => !isTutor && setSelectedTutor(Number(e.target.value))}
                      label="Tutor"
                      required
                      disabled={isTutor}
                    >
                      {tutoresFiltrados.length > 0 ? (
                        tutoresFiltrados.map(t => (
                          <MUI.MenuItem key={t.id_tutor} value={t.id_tutor}>
                            {t.nombre_tutor} {t.apellido_tutor}
                          </MUI.MenuItem>
                        ))
                      ) : (
                        <MUI.MenuItem value="" disabled>
                          No hay tutores disponibles para tu taller
                        </MUI.MenuItem>
                      )}
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
                    disabled={isTutor}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} sm={6}>
                  <MUI.FormControl fullWidth>
                    <MUI.InputLabel shrink>Certificado (PNG o PDF)</MUI.InputLabel>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.pdf"
                      style={{ display: 'none' }}
                      onChange={handleArchivoChange}
                    />
                    <MUI.Button
                      variant="outlined"
                      component="span"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ mt: 1 }}
                    >
                      {archivo ? archivo.name : 'Seleccionar archivo'}
                    </MUI.Button>
                    {archivoPreview && (
                      <MUI.Box sx={{ mt: 1 }}>
                        {archivo?.type === 'application/pdf' || archivoPreview.startsWith('data:application/pdf') ? (
                          <MUI.Typography variant="body2">
                            PDF seleccionado. <MUI.Link href={archivoPreview} target="_blank" rel="noopener">Ver PDF</MUI.Link>
                          </MUI.Typography>
                        ) : (
                          <img src={archivoPreview} alt="Certificado" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 4 }} />
                        )}
                      </MUI.Box>
                    )}
                  </MUI.FormControl>
                </MUI.Grid>
                <MUI.Grid item xs={12} sx={{ textAlign: 'center' }}>
                  {(!isTutor) && (
                    <>
                      <MUI.Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={editId ? <Icons.Edit /> : <Icons.Send />}
                        disabled={loading || !selectedTutor || isNaN(Number(selectedTutor)) || Number(selectedTutor) <= 0}
                        sx={{ mr: 2 }}
                      >
                        {loading ? <MUI.CircularProgress size={24} /> : (editId ? 'Actualizar Excusa' : 'Enviar Excusa')}
                      </MUI.Button>
                      {editId && (
                        <MUI.Button variant="outlined" color="secondary" onClick={resetForm} disabled={loading}>
                          Cancelar edición
                        </MUI.Button>
                      )}
                    </>
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
                    <MUI.TableCell>Certificado</MUI.TableCell>
                    <MUI.TableCell>Fecha</MUI.TableCell>
                    <MUI.TableCell>Acciones</MUI.TableCell>
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {filteredExcusas.map((excusa) => {
                    // Obtener el centro de forma segura
                    const pasId = typeof excusa.pasantia === 'number' ? excusa.pasantia : 
                                 (typeof excusa.pasantia === 'object' && excusa.pasantia && 'id_pas' in excusa.pasantia) ? 
                                 (excusa.pasantia as { id_pas: number }).id_pas : undefined;
                                 
                    const pasantiaObj = pasId ? pasantiasFiltradas.find(p => p.id_pas === pasId) : undefined;
                    const centroNombre = pasantiaObj?.centro_pas?.nombre_centro || 'No encontrado';

                    return (
                      <MUI.TableRow key={excusa.id_excusa}>
                        <MUI.TableCell>{excusa.id_excusa}</MUI.TableCell>
                        <MUI.TableCell>{centroNombre}</MUI.TableCell>
                        <MUI.TableCell>
                          {excusa.estudiante?.nombre_est && excusa.estudiante?.apellido_est
                            ? `${excusa.estudiante.nombre_est} ${excusa.estudiante.apellido_est}`
                            : 'No encontrado'}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          {excusa.tutor?.nombre_tutor && excusa.tutor?.apellido_tutor
                            ? `${excusa.tutor.nombre_tutor} ${excusa.tutor.apellido_tutor}`
                            : 'No encontrado'}
                        </MUI.TableCell>
                        <MUI.TableCell>{excusa.justificacion_excusa}</MUI.TableCell>
                        <MUI.TableCell>
                          {excusa.certificados ? (
                            (() => {
                              try {
                                let base64 = '';
                                if (typeof excusa.certificados === 'string') {
                                  base64 = excusa.certificados;
                                } else if (excusa.certificados?.data) {
                                  const data = Array.isArray(excusa.certificados.data) ? excusa.certificados.data : [];
                                  if (data.length > 0) {
                                    const bytes = new Uint8Array(data);
                                    base64 = btoa(
                                      Array.from(bytes)
                                        .map(byte => String.fromCharCode(byte))
                                        .join('')
                                    );
                                  }
                                }

                                if (base64) {
                                  const fileType = detectFileType(excusa.certificados);
                                  console.log('Contenido base64:', base64.substring(0, 50) + '...'); // Para debugging
                                  console.log('Tipo de archivo detectado:', fileType);
                                  
                                  return (
                                    <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {fileType === 'png' ? (
                                        <Icons.Image color="primary" fontSize="small" />
                                      ) : fileType === 'pdf' ? (
                                        <Icons.PictureAsPdf color="error" fontSize="small" />
                                      ) : (
                                        <Icons.InsertDriveFile color="action" fontSize="small" />
                                      )}
                                      <MUI.Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                          if (!fileType) {
                                            // Si no se detecta el tipo, asumimos que es una imagen
                                            setSelectedFile(base64);
                                            setOpenImageViewer(true);
                                            setImageScale(1);
                                            return;
                                          }
                                          
                                          if (fileType === 'png') {
                                            setSelectedFile(base64);
                                            setOpenImageViewer(true);
                                            setImageScale(1);
                                          } else if (fileType === 'pdf') {
                                            setSelectedFile(base64);
                                            setOpenPdfViewer(true);
                                            setPageNumber(1);
                                            setNumPages(null);
                                          }
                                        }}
                                        startIcon={fileType === 'png' ? <Icons.ZoomIn /> : fileType === 'pdf' ? <Icons.OpenInNew /> : <Icons.ZoomIn />}
                                        color={fileType === 'png' ? "primary" : fileType === 'pdf' ? "error" : "primary"}
                                        sx={{
                                          minWidth: '120px',
                                          '& .MuiButton-startIcon': {
                                            margin: '0 4px'
                                          }
                                        }}
                                      >
                                        {fileType === 'png' ? 'Ver Imagen' : fileType === 'pdf' ? 'Ver PDF' : 'Ver Imagen'}
                                      </MUI.Button>
                                    </MUI.Box>
                                  );
                                }
                                return (
                                  <MUI.Typography variant="caption" color="text.secondary">
                                    Archivo no válido
                                  </MUI.Typography>
                                );
                              } catch (error) {
                                console.error('Error al procesar certificado:', error);
                                return (
                                  <MUI.Typography variant="caption" color="error">
                                    Error al cargar el archivo
                                  </MUI.Typography>
                                );
                              }
                            })()
                          ) : (
                            <MUI.Typography variant="caption" color="text.secondary">
                              Sin archivo
                            </MUI.Typography>
                          )}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          {excusa.fecha_creacion_excusa 
                            ? new Date(excusa.fecha_creacion_excusa).toLocaleDateString()
                            : 'No disponible'}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.IconButton 
                            color="primary" 
                            onClick={() => handleEdit(excusa)}
                            disabled={isTutor || (isEstudiante && excusa.estudiante.documento_id_est !== selectedEstudiante)}
                          >
                            <Icons.Edit />
                          </MUI.IconButton>
                          <MUI.IconButton 
                            color="error" 
                            onClick={() => handleDelete(excusa.id_excusa!)}
                            disabled={isTutor || (isEstudiante && excusa.estudiante.documento_id_est !== selectedEstudiante)}
                          >
                            <Icons.Delete />
                          </MUI.IconButton>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    );
                  })}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.TableContainer>
          </MUI.Paper>
        </MUI.Container>

        {/* Modal del visor de imágenes */}
        <MUI.Dialog
          open={openImageViewer}
          onClose={() => {
            setOpenImageViewer(false);
            setSelectedFile(null);
            setImageScale(1);
          }}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <MUI.DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            pb: 1
          }}>
            <MUI.Typography variant="h6">Vista previa de la imagen</MUI.Typography>
            <MUI.Box sx={{ display: 'flex', gap: 1 }}>
              <MUI.IconButton
                onClick={() => {
                  setOpenImageViewer(false);
                  setSelectedFile(null);
                  setImageScale(1);
                }}
              >
                <Icons.Close />
              </MUI.IconButton>
            </MUI.Box>
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            overflow: 'hidden',
            position: 'relative',
            height: 'calc(90vh - 64px)'
          }}>
            {selectedFile && (
              <>
                <MUI.Box sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16, 
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 2,
                  p: 0.5,
                  display: 'flex',
                  gap: 1
                }}>
                  <MUI.Tooltip title="Restablecer zoom">
                    <MUI.IconButton onClick={() => setImageScale(1)}>
                      <Icons.RestartAlt />
                    </MUI.IconButton>
                  </MUI.Tooltip>
                  <MUI.Tooltip title="Descargar imagen">
                    <MUI.IconButton 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/png;base64,${selectedFile}`;
                        link.download = 'certificado.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Icons.Download />
                    </MUI.IconButton>
                  </MUI.Tooltip>
                </MUI.Box>
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={4}
                  centerOnInit={true}
                  onZoom={(ref) => setImageScale(ref.state.scale)}
                  wheel={{ step: 0.1 }}
                >
                  {({ zoomIn, zoomOut }) => (
                    <>
                      <MUI.Box sx={{ 
                        position: 'absolute', 
                        bottom: 16, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        zIndex: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 2,
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <MUI.Tooltip title="Alejar">
                          <MUI.IconButton onClick={() => zoomOut()}>
                            <Icons.RemoveCircleOutline />
                          </MUI.IconButton>
                        </MUI.Tooltip>
                        <MUI.Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
                          {Math.round(imageScale * 100)}%
                        </MUI.Typography>
                        <MUI.Tooltip title="Acercar">
                          <MUI.IconButton onClick={() => zoomIn()}>
                            <Icons.AddCircleOutline />
                          </MUI.IconButton>
                        </MUI.Tooltip>
                      </MUI.Box>
                      <TransformComponent
                        wrapperStyle={{ 
                          width: '100%', 
                          height: '100%'
                        }}
                      >
                        <img
                          src={`data:image/png;base64,${selectedFile}`}
                          alt="Certificado"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </>
            )}
          </MUI.DialogContent>
        </MUI.Dialog>

        <MUI.Dialog
          open={openPdfViewer}
          onClose={() => {
            setOpenPdfViewer(false);
            setSelectedFile(null);
            setNumPages(null);
            setPageNumber(1);
          }}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <MUI.DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            p: 2
          }}>
            <MUI.Typography variant="h6">Vista previa del PDF</MUI.Typography>
            <MUI.IconButton
              onClick={() => {
                setOpenPdfViewer(false);
                setSelectedFile(null);
                setNumPages(null);
                setPageNumber(1);
              }}
            >
              <Icons.Close />
            </MUI.IconButton>
          </MUI.DialogTitle>
          
          <MUI.DialogContent sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            p: 2
          }}>
            {selectedFile && (
              <MUI.Box sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'auto'
              }}>
                <Document
                  file={`data:application/pdf;base64,${selectedFile}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <MUI.Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <MUI.CircularProgress />
                    </MUI.Box>
                  }
                  error={
                    <MUI.Typography color="error" sx={{ my: 2 }}>
                      Error al cargar el PDF. Por favor, intente de nuevo.
                    </MUI.Typography>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    scale={1.5}
                    loading={
                      <MUI.Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <MUI.CircularProgress />
                      </MUI.Box>
                    }
                  />
                </Document>
                
                {numPages && (
                  <MUI.Box sx={{ 
                    mt: 2,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    p: 1,
                    borderRadius: 1,
                    boxShadow: 1
                  }}>
                    <MUI.IconButton 
                      onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                      disabled={pageNumber <= 1}
                    >
                      <Icons.NavigateBefore />
                    </MUI.IconButton>
                    <MUI.Typography>
                      Página {pageNumber} de {numPages}
                    </MUI.Typography>
                    <MUI.IconButton 
                      onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                      disabled={pageNumber >= numPages}
                    >
                      <Icons.NavigateNext />
                    </MUI.IconButton>
                  </MUI.Box>
                )}
              </MUI.Box>
            )}
          </MUI.DialogContent>
        </MUI.Dialog>

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