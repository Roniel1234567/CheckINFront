import { useState, useEffect } from 'react';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import tallerService, { type Taller } from '../../../services/tallerService';
import studentService, { type Estudiante } from '../../../services/studentService';
import { uploadDocsEstudiante } from '../../../services/docEstudianteService';
import documentoService from '../../../services/documentoService';
import SideBar from '../../../components/SideBar';
import DashboardAppBar from '../../../components/DashboardAppBar';
import { authService } from '../../../services/authService';
import { useLocation } from 'react-router-dom';

interface DocumentoEstudiante {
  est_doc: string;
  ced_est?: BufferDocument;
  cv_doc?: BufferDocument;
  anexo_iv_doc?: BufferDocument;
  anexo_v_doc?: BufferDocument;
  acta_nac_doc?: BufferDocument;
  ced_padres_doc?: BufferDocument;
  vac_covid_doc?: BufferDocument;
  estado_doc_est?: string;
  estudiante?: {
    tipo_documento_est: string;
    documento_id_est: string;
    usuario_est: {
      id_usuario: number;
      estado_usuario: string;
    };
    nombre_est: string;
    seg_nombre_est: string | null;
  };
}

interface DocumentoMeta {
  tipo: string;
  nombre: string;
  campo: keyof DocumentoEstudiante;
  icono: React.ReactNode;
}

interface BufferDocument {
  type: string;
  data: number[];
}

const documentosMeta: DocumentoMeta[] = [
  { tipo: 'ced_est', nombre: 'Cédula', campo: 'ced_est', icono: <Icons.Badge /> },
  { tipo: 'cv_doc', nombre: 'Curriculum Vitae', campo: 'cv_doc', icono: <Icons.Description /> },
  { tipo: 'anexo_iv_doc', nombre: 'Anexo IV', campo: 'anexo_iv_doc', icono: <Icons.Assignment /> },
  { tipo: 'anexo_v_doc', nombre: 'Anexo V', campo: 'anexo_v_doc', icono: <Icons.AssignmentTurnedIn /> },
  { tipo: 'acta_nac_doc', nombre: 'Acta de Nacimiento', campo: 'acta_nac_doc', icono: <Icons.Article /> },
  { tipo: 'ced_padres_doc', nombre: 'Cédula de Padres', campo: 'ced_padres_doc', icono: <Icons.Group /> },
  { tipo: 'vac_covid_doc', nombre: 'Tarjeta de Vacunación', campo: 'vac_covid_doc', icono: <Icons.HealthAndSafety /> }
];

function SubirDoc() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const [loading, setLoading] = useState(false);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [selectedTaller, setSelectedTaller] = useState<string | ''>('');
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [documentos, setDocumentos] = useState<DocumentoEstudiante | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const location = useLocation();

  // Obtener usuario actual
  const user = authService.getCurrentUser();
  const esEstudiante = user && user.rol === 1;

  // Efecto para manejar el drawer en móvil
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Cargar talleres al inicio
  useEffect(() => {
    const loadTalleres = async () => {
      try {
        setLoading(true);
        const data = await tallerService.getAllTalleres();
        setTalleres(data);
        setSnackbar({
          open: true,
          message: 'Datos cargados correctamente',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error al cargar talleres:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los talleres',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    loadTalleres();
  }, [location]);

  // Cargar estudiantes cuando se selecciona un taller
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedTaller) {
        setStudents([]);
        return;
      }
      try {
        setLoading(true);
        const allStudents = await studentService.getAllStudents();
        console.log('Todos los estudiantes:', allStudents);
        console.log('Taller seleccionado:', selectedTaller);
        
        // Filtrar estudiantes por taller y estado activo
        const filteredStudents = allStudents
          .filter(student => {
            console.log('Revisando estudiante:', student.nombre_est, 'taller:', student.taller_est);
            const tallerId = student.taller_est?.id_taller;
            const esActivo = student.usuario_est?.estado_usuario === 'Activo';
            console.log('TallerId:', tallerId, 'Selected:', selectedTaller, 'Activo:', esActivo);
            return tallerId && tallerId === Number(selectedTaller) && esActivo;
          });

        console.log('Estudiantes filtrados:', filteredStudents);
        setStudents(filteredStudents);
        setSnackbar({
          open: true,
          message: 'Datos cargados correctamente',
          severity: 'success'
        });
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
        setSnackbar({
          open: true,
          message: 'Error al cargar los estudiantes',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [selectedTaller]);

  // Seleccionar automáticamente taller y estudiante si es estudiante
  useEffect(() => {
    let cancelado = false;
    const seleccionarEstudianteYtaller = async () => {
      if (esEstudiante && user) {
        try {
          const estudiantes = await studentService.getAllStudents();
          const estudianteLogueado = estudiantes.find(e => e.usuario_est && e.usuario_est.id_usuario === user.id_usuario);
          if (estudianteLogueado) {
            if (!cancelado) {
              setSelectedStudent(estudianteLogueado.documento_id_est);
              setSelectedTaller(estudianteLogueado.taller_est?.id_taller?.toString() || '');
            }
          } else {
            if (!cancelado) {
              setSelectedStudent('');
              setSelectedTaller('');
            }
          }
        } catch {
          if (!cancelado) {
            setSelectedStudent('');
            setSelectedTaller('');
          }
        }
      }
    };
    seleccionarEstudianteYtaller();
    return () => { cancelado = true; };
  }, [esEstudiante, user, location]);

  // Cargar documentos cuando se selecciona un estudiante
  useEffect(() => {
    const loadDocumentos = async () => {
      if (!selectedStudent) {
        setDocumentos(null);
        return;
      }
      try {
        setLoading(true);
        // Obtener el estudiante seleccionado
        const selectedStudentData = students.find(s => s.documento_id_est === selectedStudent);
        if (!selectedStudentData) {
          throw new Error('Estudiante no encontrado');
        }
        console.log('Estudiante seleccionado:', selectedStudentData);
        console.log('Buscando documentos para:', selectedStudentData.documento_id_est);
        
        try {
          const data = await documentoService.getDocumentosByEstudiante(selectedStudentData.documento_id_est);
          console.log('Documentos recibidos:', data);
          
          // Manejar el caso de que la respuesta sea un array
          const docs = Array.isArray(data) ? data[0] : data;
          console.log('Documentos procesados:', docs);
          
          setDocumentos(docs as DocumentoEstudiante);
          setSnackbar({
            open: true,
            message: 'Datos cargados correctamente',
            severity: 'success'
          });
        } catch {
          // Si no hay documentos, inicializar con un objeto vacío
          console.log('No se encontraron documentos, inicializando vacío');
          setDocumentos({} as DocumentoEstudiante);
        }
      } catch (error) {
        console.error('Error al cargar documentos:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los documentos',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    loadDocumentos();
  }, [selectedStudent, students]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: keyof DocumentoEstudiante) => {
    if (!event.target.files || !event.target.files[0] || !selectedStudent) return;

    const selectedStudentData = students.find(s => s.documento_id_est === selectedStudent);
    if (!selectedStudentData) {
      setSnackbar({
        open: true,
        message: 'Error: Estudiante no encontrado',
        severity: 'error'
      });
      return;
    }

    const file = event.target.files[0];
    // Mapear los nombres de campos del frontend a los del backend
    const fileFieldMap: { [key: string]: string } = {
      'ced_est': 'id_doc_file',
      'cv_doc': 'cv_doc_file',
      'anexo_iv_doc': 'anexo_iv_doc_file',
      'anexo_v_doc': 'anexo_v_doc_file',
      'acta_nac_doc': 'acta_nac_doc_file',
      'ced_padres_doc': 'ced_padres_doc_file',
      'vac_covid_doc': 'vac_covid_doc_file'
    };

    const files = {
      [fileFieldMap[documentType]]: file
    };

    try {
      setLoading(true);
      await uploadDocsEstudiante(selectedStudentData.documento_id_est, files);
      // Recargar documentos
      const updatedDocs = await documentoService.getDocumentosByEstudiante(selectedStudentData.documento_id_est);
      setDocumentos(updatedDocs as DocumentoEstudiante);
      setSnackbar({
        open: true,
        message: 'Documento subido exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al subir documento:', error);
      setSnackbar({
        open: true,
        message: 'Error al subir el documento',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocument = async (documentType: keyof DocumentoEstudiante) => {
    if (!selectedStudent || !documentos || !documentos[documentType]) {
      setSnackbar({
        open: true,
        message: 'No hay documento para previsualizar',
        severity: 'error'
      });
      return;
    }

    const selectedStudentData = students.find(s => s.documento_id_est === selectedStudent);
    if (!selectedStudentData) {
      setSnackbar({
        open: true,
        message: 'Error: Estudiante no encontrado',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      // Ya no necesitamos mapear los tipos porque usamos los mismos nombres que el backend
      const blob = await documentoService.previewDocumento(selectedStudentData.documento_id_est, documentType);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error al previsualizar documento:', error);
      setSnackbar({
        open: true,
        message: 'Error al previsualizar el documento',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      {/* Sidebar */}
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

      {/* Main content */}
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* App bar */}
        <DashboardAppBar toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

        {/* Content */}
        <MUI.Box sx={{ p: 3 }}>
          <MUI.Typography variant="h4" sx={{ mb: 4, color: '#1a237e' }}>
            Subir Documentos
          </MUI.Typography>

          {/* Filtros */}
          <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
            <MUI.Grid item xs={12} md={6}>
              <MUI.FormControl fullWidth>
                <MUI.InputLabel>Taller</MUI.InputLabel>
                <MUI.Select
                  value={selectedTaller}
                  onChange={(e) => {
                    console.log('Taller seleccionado:', e.target.value);
                    setSelectedTaller(e.target.value as string);
                  }}
                  label="Taller"
                  disabled={esEstudiante}
                >
                  <MUI.MenuItem value="">
                    <em>Seleccione un taller</em>
                  </MUI.MenuItem>
                  {talleres.map((taller) => (
                    <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                      {taller.nombre_taller}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>
            </MUI.Grid>
            <MUI.Grid item xs={12} md={6}>
              <MUI.FormControl fullWidth>
                <MUI.InputLabel>Estudiante</MUI.InputLabel>
                <MUI.Select
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  label="Estudiante"
                  disabled={esEstudiante}
                >
                  <MUI.MenuItem value="">
                    <em>Seleccione un estudiante</em>
                  </MUI.MenuItem>
                  {esEstudiante && user ? (
                    students.filter(s => s.usuario_est.id_usuario === user.id_usuario).map(student => (
                      <MUI.MenuItem key={student.documento_id_est} value={student.documento_id_est}>
                        {`${student.nombre_est} ${student.apellido_est}`}
                      </MUI.MenuItem>
                    ))
                  ) : (
                    students.map((student) => (
                      <MUI.MenuItem key={student.documento_id_est} value={student.documento_id_est}>
                        {`${student.nombre_est} ${student.apellido_est}`}
                      </MUI.MenuItem>
                    ))
                  )}
                </MUI.Select>
              </MUI.FormControl>
            </MUI.Grid>
          </MUI.Grid>

          {/* Documentos */}
          {selectedStudent && (
            <MUI.Grid container spacing={3}>
              {documentosMeta.map((doc) => {
                // Verificar si el documento existe y tiene contenido
                const docValue = documentos && documentos[doc.campo];
                const tieneDocumento = docValue && 
                  typeof docValue === 'object' &&
                  (docValue as BufferDocument).type === 'Buffer' &&
                  Array.isArray((docValue as BufferDocument).data) &&
                  (docValue as BufferDocument).data.length > 0;

                return (
                  <MUI.Grid item xs={12} md={6} lg={4} key={doc.tipo}>
                    <MUI.Card sx={{ height: '100%' }}>
                      <MUI.CardContent>
                        <MUI.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {doc.icono}
                          <MUI.Typography variant="h6" sx={{ ml: 1 }}>
                            {doc.nombre}
                          </MUI.Typography>
                        </MUI.Box>
                        <MUI.Typography variant="body2" color="text.secondary">
                          {tieneDocumento ? 'Documento disponible' : 'No disponible'}
                        </MUI.Typography>
                        <MUI.Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <MUI.Button
                            component="label"
                            variant="contained"
                            startIcon={<Icons.Upload />}
                          >
                            Subir
                            <input
                              type="file"
                              hidden
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload(e, doc.campo)}
                            />
                          </MUI.Button>
                          <MUI.Button
                            variant="outlined"
                            startIcon={<Icons.Visibility />}
                            onClick={() => handlePreviewDocument(doc.campo)}
                            disabled={!tieneDocumento}
                          >
                            Ver
                          </MUI.Button>
                        </MUI.Box>
                      </MUI.CardContent>
                    </MUI.Card>
                  </MUI.Grid>
                );
              })}
            </MUI.Grid>
          )}

          {/* Preview Dialog */}
          <MUI.Dialog
            open={!!previewUrl}
            onClose={() => setPreviewUrl(null)}
            maxWidth="lg"
            fullWidth
          >
            <MUI.DialogTitle>
              Previsualización del Documento
              <MUI.IconButton
                onClick={() => setPreviewUrl(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Icons.Close />
              </MUI.IconButton>
            </MUI.DialogTitle>
            <MUI.DialogContent>
              <iframe
                src={previewUrl || ''}
                style={{ width: '100%', height: '80vh', border: 'none' }}
                title="document-preview"
              />
            </MUI.DialogContent>
          </MUI.Dialog>

          {/* Loading Overlay */}
          {loading && (
            <MUI.Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={true}
            >
              <MUI.CircularProgress color="inherit" />
            </MUI.Backdrop>
          )}

          {/* Snackbar */}
          <MUI.Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <MUI.Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </MUI.Alert>
          </MUI.Snackbar>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
}

export default SubirDoc; 