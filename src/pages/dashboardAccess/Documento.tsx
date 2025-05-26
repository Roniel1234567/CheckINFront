import { useState, useEffect } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import documentoService, { type DocEstudiante, EstadoDocumento } from '../../services/documentoService';
import studentService, { type Estudiante } from '../../services/studentService';
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';

interface DocumentoMeta {
  tipo: string;
  nombre: string;
  campo: keyof DocEstudiante;
  icono: React.ReactNode;
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

function Documento() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(false);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [documentos, setDocumentos] = useState<DocEstudiante[]>([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState<string>('');
  const [selectedTaller, setSelectedTaller] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocumento, setSelectedDocumento] = useState<{ documento: string; tipo: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const notifications = 4;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  useEffect(() => {
    if (selectedEstudiante) {
      cargarDocumentos(selectedEstudiante);
    }
  }, [selectedEstudiante]);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAllStudents();
      setEstudiantes(data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar estudiantes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarDocumentos = async (documento: string) => {
    try {
      setLoading(true);
      const data = await documentoService.getDocumentosByEstudiante(documento);
      setDocumentos(data);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar documentos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDocumento = async (documento: string, tipo: string) => {
    try {
      setLoading(true);
      const blob = await documentoService.previewDocumento(documento, tipo);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setSelectedDocumento({ documento, tipo });
    } catch (error) {
      console.error('Error al previsualizar documento:', error);
      setSnackbar({
        open: true,
        message: 'Error al previsualizar documento',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocumento = async (documento: string, tipo: string, nombre: string) => {
    try {
      setLoading(true);
      const blob = await documentoService.previewDocumento(documento, tipo);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nombre}_${documento}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar documento:', error);
      setSnackbar({
        open: true,
        message: 'Error al descargar documento',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarComentario = async () => {
    if (!selectedDocumento || !comentario.trim()) return;

    try {
      setLoading(true);
      const estudiante = estudiantes.find(e => e.documento_id_est === selectedDocumento.documento);
      if (!estudiante) throw new Error('Estudiante no encontrado');

      await documentoService.enviarComentario({
        documento_id: selectedDocumento.documento,
        comentario: comentario.trim()
      });

      setComentario('');
      setSnackbar({
        open: true,
        message: 'Comentario enviado correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      setSnackbar({
        open: true,
        message: 'Error al enviar comentario',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (documento: string, nuevoEstado: EstadoDocumento) => {
    try {
      setLoading(true);
      
      // Actualizar estado
      await documentoService.actualizarEstadoDocumento(documento, nuevoEstado);
      
      await cargarDocumentos(selectedEstudiante);

      setSnackbar({
        open: true,
        message: 'Estado de los documentos actualizado correctamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al actualizar estado de los documentos:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar estado de los documentos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: EstadoDocumento) => {
    switch (estado) {
      case EstadoDocumento.APROBADO:
        return 'success';
      case EstadoDocumento.RECHAZADO:
        return 'error';
      case EstadoDocumento.VISTO:
        return 'info';
      default:
        return 'warning';
    }
  };

  const talleres = [...new Set(estudiantes.map(e => e.taller_est?.nombre_taller).filter(Boolean))];

  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    const matchesSearch = 
      estudiante.nombre_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.apellido_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.documento_id_est.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTaller = !selectedTaller || estudiante.taller_est?.nombre_taller === selectedTaller;
    
    return matchesSearch && matchesTaller;
  });

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

      <MUI.Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DashboardAppBar notifications={notifications} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

        {loading && (
          <MUI.Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backdropFilter: 'blur(3px)'
            }}
            open={loading}
          >
            <MUI.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <MUI.CircularProgress color="primary" />
              <MUI.Typography variant="h6" color="white">
                Procesando...
              </MUI.Typography>
            </MUI.Box>
          </MUI.Backdrop>
        )}

        <MUI.Grid container spacing={3}>
          <MUI.Grid item xs={12}>
            <MUI.Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <MUI.Grid container spacing={2} alignItems="center">
                <MUI.Grid item xs={12} md={4}>
                  <MUI.TextField
                    fullWidth
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <MUI.InputAdornment position="start">
                          <Icons.Search />
                        </MUI.InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={4}>
                  <MUI.FormControl fullWidth>
                    <MUI.InputLabel>Filtrar por Taller</MUI.InputLabel>
                    <MUI.Select
                      value={selectedTaller}
                      onChange={(e) => setSelectedTaller(e.target.value)}
                      label="Filtrar por Taller"
                      sx={{ borderRadius: 2 }}
                    >
                      <MUI.MenuItem value="">Todos los talleres</MUI.MenuItem>
                      {talleres.map((taller) => (
                        <MUI.MenuItem key={taller} value={taller}>
                          {taller}
                        </MUI.MenuItem>
                      ))}
                    </MUI.Select>
                  </MUI.FormControl>
                </MUI.Grid>
              </MUI.Grid>
            </MUI.Paper>
          </MUI.Grid>

          <MUI.Grid item xs={12} md={4}>
            <MUI.Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '70vh', overflow: 'auto' }}>
              <MUI.List>
                {estudiantesFiltrados.map((estudiante) => (
                  <MUI.ListItem
                    key={estudiante.documento_id_est}
                    disablePadding
                  >
                    <MUI.ListItemButton
                      onClick={() => setSelectedEstudiante(estudiante.documento_id_est)}
                      selected={selectedEstudiante === estudiante.documento_id_est}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark'
                          }
                        }
                      }}
                    >
                      <MUI.ListItemIcon>
                        <Icons.Person sx={{ color: selectedEstudiante === estudiante.documento_id_est ? 'white' : 'inherit' }} />
                      </MUI.ListItemIcon>
                      <MUI.ListItemText
                        primary={`${estudiante.nombre_est} ${estudiante.apellido_est}`}
                        secondary={
                          <MUI.Typography
                            variant="body2"
                            sx={{
                              color: selectedEstudiante === estudiante.documento_id_est ? 'white' : 'text.secondary'
                            }}
                          >
                            {estudiante.documento_id_est}
                          </MUI.Typography>
                        }
                      />
                    </MUI.ListItemButton>
                  </MUI.ListItem>
                ))}
              </MUI.List>
            </MUI.Paper>
          </MUI.Grid>

          <MUI.Grid item xs={12} md={8}>
            <MUI.Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '70vh', overflow: 'auto' }}>
              {selectedEstudiante ? (
                <>
                  <MUI.Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MUI.Typography variant="h6">Estado de Documentos:</MUI.Typography>
                    <MUI.FormControl sx={{ minWidth: 200 }}>
                      <MUI.Select
                        value={documentos[0]?.estado_doc_est || EstadoDocumento.PENDIENTE}
                        onChange={(e) => handleEstadoChange(selectedEstudiante, e.target.value as EstadoDocumento)}
                        size="small"
                      >
                        {Object.values(EstadoDocumento).map((estado) => (
                          <MUI.MenuItem key={estado} value={estado}>
                            <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MUI.Chip
                                label={estado}
                                size="small"
                                color={getEstadoColor(estado)}
                                sx={{ minWidth: 80 }}
                              />
                            </MUI.Box>
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Box>
                  <MUI.Grid container spacing={2}>
                    {documentosMeta.map((doc) => {
                      const documento = documentos.find(d => d.est_doc === selectedEstudiante);
                      const tieneDocumento = documento && documento[doc.campo];

                      return (
                        <MUI.Grid item xs={12} sm={6} md={4} key={doc.tipo}>
                          <MUI.Card
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                              }
                            }}
                          >
                            <MUI.CardContent sx={{ flexGrow: 1 }}>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {doc.icono}
                                <MUI.Typography variant="h6" sx={{ ml: 1 }}>
                                  {doc.nombre}
                                </MUI.Typography>
                              </MUI.Box>
                              <MUI.Typography variant="body2" color="text.secondary">
                                {tieneDocumento ? 'Documento disponible' : 'No disponible'}
                              </MUI.Typography>
                            </MUI.CardContent>
                            <MUI.CardActions>
                              <MUI.Button
                                size="small"
                                startIcon={<Icons.Visibility />}
                                onClick={() => tieneDocumento && handlePreviewDocumento(selectedEstudiante, doc.tipo)}
                                disabled={!tieneDocumento}
                              >
                                Ver
                              </MUI.Button>
                              <MUI.Button
                                size="small"
                                startIcon={<Icons.Download />}
                                onClick={() => tieneDocumento && handleDownloadDocumento(selectedEstudiante, doc.tipo, doc.nombre)}
                                disabled={!tieneDocumento}
                              >
                                Descargar
                              </MUI.Button>
                            </MUI.CardActions>
                          </MUI.Card>
                        </MUI.Grid>
                      );
                    })}
                  </MUI.Grid>
                </>
              ) : (
                <MUI.Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <Icons.Description sx={{ fontSize: 60, color: 'text.secondary' }} />
                  <MUI.Typography variant="h6" color="text.secondary">
                    Selecciona un estudiante para ver sus documentos
                  </MUI.Typography>
                </MUI.Box>
              )}
            </MUI.Paper>
          </MUI.Grid>
        </MUI.Grid>

        {/* Modal para previsualizar PDF */}
        <MUI.Dialog
          open={Boolean(pdfUrl)}
          onClose={() => {
            setPdfUrl(null);
            setSelectedDocumento(null);
          }}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <MUI.DialogTitle>
            <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <MUI.Typography variant="h6">
                Previsualización del Documento
              </MUI.Typography>
              <MUI.IconButton
                onClick={() => {
                  setPdfUrl(null);
                  setSelectedDocumento(null);
                }}
              >
                <Icons.Close />
              </MUI.IconButton>
            </MUI.Box>
          </MUI.DialogTitle>
          <MUI.DialogContent dividers>
            <MUI.Grid container spacing={2}>
              <MUI.Grid item xs={12} md={8} sx={{ height: '100%' }}>
                {pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      minHeight: '500px'
                    }}
                    title="PDF Viewer"
                  />
                )}
              </MUI.Grid>
              <MUI.Grid item xs={12} md={4}>
                <MUI.Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <MUI.Typography variant="h6" gutterBottom>
                    Agregar Comentario
                  </MUI.Typography>
                  <MUI.TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Escribe un comentario sobre el documento..."
                    sx={{ mb: 2 }}
                  />
                  <MUI.Button
                    variant="contained"
                    startIcon={<Icons.Send />}
                    onClick={handleEnviarComentario}
                    disabled={!comentario.trim()}
                  >
                    Enviar Comentario
                  </MUI.Button>
                </MUI.Box>
              </MUI.Grid>
            </MUI.Grid>
          </MUI.DialogContent>
        </MUI.Dialog>

        {/* Snackbar para mensajes */}
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MUI.Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Documento; 