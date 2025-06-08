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
import Zoom from '@mui/material/Zoom';
import { Box } from '@mui/material';

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
          <MUI.Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
          }}>
            {/* Cohete decorativo */}
            <svg width="120" height="120" style={{ position: 'absolute', top: 30, left: 30, opacity: 0.7 }}>
              <g>
                <ellipse cx="60" cy="90" rx="18" ry="8" fill="#00eaff33" />
                <rect x="50" y="40" width="20" height="50" rx="10" fill="#00eaff" />
                <polygon points="60,20 70,40 50,40" fill="#4facfe" />
                <rect x="57" y="90" width="6" height="18" rx="3" fill="#ffea00" />
              </g>
            </svg>
            {/* Partículas */}
            {[...Array(12)].map((_, i) => (
              <svg key={i} width="16" height="16" style={{ position: 'absolute', top: `${Math.random()*90+5}%`, left: `${Math.random()*90+5}%`, opacity: 0.18+Math.random()*0.3 }}>
                <circle cx="8" cy="8" r={Math.random()*6+2} fill="#00eaff" />
              </svg>
            ))}
            {/* Líneas futuristas */}
            <svg width="100vw" height="100" style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: 100 }}>
              <polyline points="0,80 200,20 400,80 600,20 800,80 1000,20 1200,80" fill="none" stroke="#00eaff55" strokeWidth="4" />
            </svg>
          </MUI.Box>
          <MUI.Grid container spacing={3} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
            <MUI.Grid item xs={12} md={6}>
              <MUI.FormControl fullWidth variant="outlined" sx={{
                background: 'rgba(0,234,255,0.07)',
                borderRadius: 3,
                boxShadow: '0 2px 12px #00eaff22',
                border: '1.5px solid #00eaff44',
              }}>
                <MUI.InputLabel><Icons.Build sx={{ mr: 1, color: '#00eaff' }} /> Taller</MUI.InputLabel>
                <MUI.Select
                  value={selectedTaller}
                  onChange={(e) => setSelectedTaller(e.target.value as string)}
                  label={<><Icons.Build sx={{ mr: 1, color: '#00eaff' }} />Taller</>}
                  startAdornment={<Icons.Build sx={{ color: '#00eaff', mr: 1 }} />}
                  sx={{
                    color: '#1a237e',
                    '& .MuiSelect-icon': { color: '#00eaff' },
                    fontWeight: 600,
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: 'rgba(0,234,255,0.08)',
                        color: '#1a237e',
                        borderRadius: 2,
                        boxShadow: '0 2px 12px #00eaff33',
                      }
                    }
                  }}
                >
                  <MUI.MenuItem value="">
                    <Icons.Build sx={{ mr: 1, color: '#00eaff' }} />
                    <em>Seleccione un taller</em>
                  </MUI.MenuItem>
                  {talleres.map((taller) => (
                    <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                      <Icons.Build sx={{ mr: 1, color: '#00eaff' }} />
                      {taller.nombre_taller}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>
            </MUI.Grid>
            <MUI.Grid item xs={12} md={6}>
              <MUI.FormControl fullWidth variant="outlined" sx={{
                background: 'rgba(0,234,255,0.07)',
                borderRadius: 3,
                boxShadow: '0 2px 12px #00eaff22',
                border: '1.5px solid #00eaff44',
              }}>
                <MUI.InputLabel><Icons.Person sx={{ mr: 1, color: '#00eaff' }} /> Estudiante</MUI.InputLabel>
                <MUI.Select
                  value={selectedStudent || ''}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  label={<><Icons.Person sx={{ mr: 1, color: '#00eaff' }} />Estudiante</>}
                  startAdornment={<Icons.Person sx={{ color: '#00eaff', mr: 1 }} />}
                  sx={{
                    color: '#1a237e',
                    '& .MuiSelect-icon': { color: '#00eaff' },
                    fontWeight: 600,
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: 'rgba(0,234,255,0.08)',
                        color: '#1a237e',
                        borderRadius: 2,
                        boxShadow: '0 2px 12px #00eaff33',
                      }
                    }
                  }}
                >
                  <MUI.MenuItem value="">
                    <Icons.Person sx={{ mr: 1, color: '#00eaff' }} />
                    <em>Seleccione un estudiante</em>
                  </MUI.MenuItem>
                  {esEstudiante && user ? (
                    students.filter(s => s.usuario_est.id_usuario === user.id_usuario).map(student => (
                      <MUI.MenuItem key={student.documento_id_est} value={student.documento_id_est}>
                        <Icons.Person sx={{ mr: 1, color: '#00eaff' }} />
                        {`${student.nombre_est} ${student.apellido_est}`}
                      </MUI.MenuItem>
                    ))
                  ) : (
                    students.map((student) => (
                      <MUI.MenuItem key={student.documento_id_est} value={student.documento_id_est}>
                        <Icons.Person sx={{ mr: 1, color: '#00eaff' }} />
                        {`${student.nombre_est} ${student.apellido_est}`}
                      </MUI.MenuItem>
                    ))
                  )}
                </MUI.Select>
              </MUI.FormControl>
            </MUI.Grid>
          </MUI.Grid>

          {/* Justo antes de mostrar los filtros y las tarjetas, agrega el mensaje y animaciones si no hay taller o estudiante seleccionado */}
          {(!selectedTaller || !selectedStudent) && (
            <MUI.Box sx={{
              width: '100%',
              minHeight: '350px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              my: 6,
              zIndex: 2
            }}>
              <MUI.Typography variant="h4" sx={{
                color: '#00eaff',
                fontWeight: 'bold',
                mb: 2,
                textShadow: '0 0 16px #00eaff99, 0 0 32px #4facfe55',
                textAlign: 'center'
              }}>
                ¡Selecciona un taller y un estudiante para comenzar! 🚀
              </MUI.Typography>
              <MUI.Typography variant="h6" sx={{ color: '#1a237e', mb: 4, textAlign: 'center', opacity: 0.8 }}>
                Sube tus documentos y explora el portal futurista de CheckIN
              </MUI.Typography>
              {/* Animación de cohete */}
              <svg width="120" height="180" style={{ position: 'absolute', left: '50%', top: 60, transform: 'translateX(-50%)' }}>
                <g>
                  <ellipse cx="60" cy="170" rx="22" ry="10" fill="#00eaff33">
                    <animate attributeName="rx" values="22;28;22" dur="1.2s" repeatCount="indefinite" />
                  </ellipse>
                  <rect x="50" y="60" width="20" height="70" rx="10" fill="#00eaff">
                    <animate attributeName="y" values="60;50;60" dur="1.2s" repeatCount="indefinite" />
                  </rect>
                  <polygon points="60,30 70,60 50,60" fill="#4facfe">
                    <animateTransform attributeName="transform" type="translate" values="0,0;0,-10;0,0" dur="1.2s" repeatCount="indefinite" />
                  </polygon>
                  <rect x="57" y="130" width="6" height="30" rx="3" fill="#ffea00">
                    <animate attributeName="height" values="30;50;30" dur="1.2s" repeatCount="indefinite" />
                  </rect>
                </g>
              </svg>
              {/* Animación de portales */}
              <svg width="260" height="260" style={{ position: 'relative', zIndex: 1, marginTop: 120 }}>
                <defs>
                  <radialGradient id="portalGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00eaff" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#4facfe" stopOpacity="0.1" />
                  </radialGradient>
                </defs>
                <circle cx="130" cy="130" r="80" fill="url(#portalGrad)">
                  <animate attributeName="r" values="80;100;80" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="130" cy="130" r="50" fill="none" stroke="#00eaff" strokeWidth="4" opacity="0.7">
                  <animate attributeName="r" values="50;70;50" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="130" cy="130" r="30" fill="none" stroke="#4facfe" strokeWidth="2" opacity="0.5">
                  <animate attributeName="r" values="30;45;30" dur="1.2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </MUI.Box>
          )}

          {/* Documentos */}
          {selectedStudent && (
            <MUI.Grid container spacing={3} alignItems="stretch" justifyContent="center">
              {documentosMeta.map((doc, idx) => {
                const docValue = documentos && documentos[doc.campo];
                const tieneDocumento = docValue &&
                  typeof docValue === 'object' &&
                  (docValue as BufferDocument).type === 'Buffer' &&
                  Array.isArray((docValue as BufferDocument).data) &&
                  (docValue as BufferDocument).data.length > 0;

                return (
                  <MUI.Grid item xs={12} md={6} lg={4} key={doc.tipo} sx={{ display: 'flex' }}>
                    <MUI.Paper
                      elevation={6}
                      sx={{
                        width: '100%',
                        minWidth: { xs: '100%', sm: '320px' },
                        maxWidth: '350px',
                        height: '320px',
                        m: 'auto',
                        p: 3,
                        borderRadius: 4,
                        position: 'relative',
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, #0a1836 0%, #1a2a4f 100%)',
                        boxShadow: '0 8px 32px 0 #00eaff55, 0 2px 16px 0 #4facfe33',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: 'floatCard 2.5s ease-in-out infinite',
                        animationDelay: `${idx * 0.2}s`,
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.04)',
                          boxShadow: '0 24px 48px 0 #00eaff99, 0 4px 32px 0 #4facfe55',
                          borderColor: '#00eaff',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, transparent, #00eaff, transparent)',
                          opacity: 0.7,
                        },
                        '@keyframes floatCard': {
                          '0%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-12px) scale(1.03)', boxShadow: '0 24px 48px 0 #00eaff55, 0 4px 32px 0 #4facfe33' },
                          '100%': { transform: 'translateY(0px)' }
                        }
                      }}
                    >
                      {/* Fuego animado debajo de la tarjeta solo con SVG y CSS */}
                      <svg width="60" height="40" style={{ position: 'absolute', left: '50%', bottom: -18, transform: 'translateX(-50%)', zIndex: 1 }}>
                        <g>
                          <ellipse cx="30" cy="38" rx="18" ry="6" fill="#00eaff33">
                            <animate attributeName="rx" values="18;24;18" dur="1.2s" repeatCount="indefinite" />
                          </ellipse>
                          <path d="M30 10 Q35 25 30 38 Q25 25 30 10" fill="#ffea00" opacity="0.7">
                            <animate attributeName="d" values="M30 10 Q35 25 30 38 Q25 25 30 10;M30 14 Q38 28 30 38 Q22 28 30 14;M30 10 Q35 25 30 38 Q25 25 30 10" dur="1.2s" repeatCount="indefinite" />
                          </path>
                          <path d="M30 18 Q33 28 30 38 Q27 28 30 18" fill="#ff9100" opacity="0.6">
                            <animate attributeName="d" values="M30 18 Q33 28 30 38 Q27 28 30 18;M30 22 Q36 32 30 38 Q24 32 30 22;M30 18 Q33 28 30 38 Q27 28 30 18" dur="1.2s" repeatCount="indefinite" />
                          </path>
                        </g>
                      </svg>
                      <MUI.Box sx={{ mt: 1, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="doc-icon" style={{ fontSize: 48, color: '#00eaff', filter: 'drop-shadow(0 0 12px #00eaff88)' }}>
                          {doc.icono}
                        </span>
                      </MUI.Box>
                      <MUI.Typography className="doc-title" variant="h6" sx={{ mb: 2, textAlign: 'center', transition: 'color 0.3s', color: '#fff', textShadow: '0 0 8px #00eaff55' }}>
                        {doc.nombre}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', color: '#b2ebf2' }}>
                        {tieneDocumento ? 'Documento disponible' : 'No disponible'}
                      </MUI.Typography>
                      <MUI.Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <MUI.Button
                          component="label"
                          variant="contained"
                          color="primary"
                          sx={{ borderRadius: 2, fontWeight: 600, background: 'linear-gradient(90deg, #00eaff 0%, #4facfe 100%)', color: '#fff', boxShadow: '0 0 16px #00eaff55', '&:hover': { background: 'linear-gradient(90deg, #4facfe 0%, #00eaff 100%)', boxShadow: '0 0 32px #00eaff99' } }}
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
                          color="primary"
                          startIcon={<Icons.Visibility />}
                          onClick={() => handlePreviewDocument(doc.campo)}
                          disabled={!tieneDocumento}
                          sx={{ borderRadius: 2, fontWeight: 600, color: '#00eaff', borderColor: '#00eaff', background: 'rgba(0,234,255,0.04)', '&:hover': { background: 'rgba(0,234,255,0.12)', borderColor: '#4facfe', color: '#4facfe' } }}
                        >
                          Ver
                        </MUI.Button>
                      </MUI.Box>
                    </MUI.Paper>
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