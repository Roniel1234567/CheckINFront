import React, { useState, useEffect } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import documentoService, { type DocEstudiante, EstadoDocumento } from '../../services/documentoService';
import studentService, { type Estudiante } from '../../services/studentService';
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import api from '../../services/api';
import emailService from '../../services/emailService';

interface DocumentoMeta {
  tipo: string;
  nombre: string;
  campo: keyof DocEstudiante;
  icono: React.ReactNode;
}

const documentosMeta: DocumentoMeta[] = [
  { tipo: 'ced_est', nombre: 'Cédula', campo: 'ced_est', icono: <Icons.Badge sx={{ fontSize: '1.5rem' }} /> },
  { tipo: 'cv_doc', nombre: 'Curriculum Vitae', campo: 'cv_doc', icono: <Icons.Description sx={{ fontSize: '1.5rem' }} /> },
  { tipo: 'anexo_iv_doc', nombre: 'Anexo IV', campo: 'anexo_iv_doc', icono: <Icons.Assignment sx={{ fontSize: '1.5rem' }} /> },
  { tipo: 'anexo_v_doc', nombre: 'Anexo V', campo: 'anexo_v_doc', icono: <Icons.AssignmentTurnedIn sx={{ fontSize: '1.5rem' }} /> },
  { tipo: 'acta_nac_doc', nombre: 'Acta de Nacimiento', campo: 'acta_nac_doc', icono: <Icons.Article sx={{ fontSize: '1.5rem' }} /> },
  { tipo: 'ced_padres_doc', nombre: 'Cédula de Padres', campo: 'ced_padres_doc', icono: <Icons.Group sx={{ fontSize: '1.5rem' }} /> },
  { tipo: 'vac_covid_doc', nombre: 'Tarjeta de Vacunación', campo: 'vac_covid_doc', icono: <Icons.HealthAndSafety sx={{ fontSize: '1.5rem' }} /> }
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
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocumento, setSelectedDocumento] = useState<{ documento: string; tipo: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');

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
      // Filtrar solo estudiantes con usuario y estado_usuario 'Activo'
      const activos = data.filter(e => e.usuario_est && e.usuario_est.estado_usuario === 'Activo');
      setEstudiantes(activos);
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

      // Obtener el nombre del documento
      const docMeta = documentosMeta.find(d => d.tipo === selectedDocumento.tipo);
      if (!docMeta) throw new Error('Tipo de documento no encontrado');

      // Verificar si el estudiante tiene email
      if (!estudiante.contacto_est?.email_contacto) {
        throw new Error('El estudiante no tiene email registrado');
      }

      await documentoService.enviarComentario({
        correoEstudiante: estudiante.contacto_est.email_contacto,
        nombreEstudiante: `${estudiante.nombre_est} ${estudiante.apellido_est}`,
        nombreDocumento: docMeta.nombre,
        comentario: comentario.trim()
      });

      setComentario('');
      setPdfUrl(null);
      setSelectedDocumento(null);
      
      setSnackbar({
        open: true,
        message: 'Comentario enviado correctamente por email',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al enviar comentario',
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
      
      // Obtener el estudiante y el documento
      const estudiante = estudiantes.find(e => e.documento_id_est === documento);
      const doc = documentos.find(d => d.est_doc === documento);
      
      if (estudiante?.contacto_est?.email_contacto && doc) {
        // Determinar qué documentos fueron afectados
        const documentosAfectados = documentosMeta
          .filter(meta => doc[meta.campo])
          .map(meta => meta.nombre);

        // Mapear el estado para el correo
        let estadoCorreo: 'aprobados' | 'rechazados' | 'vistos' | 'pendientes';
        switch (nuevoEstado) {
          case EstadoDocumento.APROBADO:
            estadoCorreo = 'aprobados';
            break;
          case EstadoDocumento.RECHAZADO:
            estadoCorreo = 'rechazados';
            break;
          case EstadoDocumento.VISTO:
            estadoCorreo = 'vistos';
            break;
          default:
            estadoCorreo = 'pendientes';
        }

        try {
          const emailResult = await emailService.sendDocumentosEmail({
            correoEstudiante: estudiante.contacto_est.email_contacto,
            nombreEstudiante: `${estudiante.nombre_est} ${estudiante.apellido_est}`,
            estado: estadoCorreo,
            documentosAfectados: documentosAfectados
          });

          if (!emailResult.success) {
            console.error('Error detallado del servidor:', emailResult.detalles);
            throw new Error(emailResult.detalles?.message || 'Error al enviar la notificación por correo');
          }

          console.log('Email enviado correctamente');
        } catch (emailError: any) {
          console.error('Error al enviar notificación por correo:', emailError);
          setSnackbar({
            open: true,
            message: `Error al enviar la notificación por correo: ${emailError.message || 'Error desconocido'}`,
            severity: 'warning'
          });
        }
      }
      
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
    
    const matchesEstado = !selectedEstado || (documentos.some(doc => 
      doc.est_doc === estudiante.documento_id_est && 
      doc.estado_doc_est === selectedEstado
    ));
    
    return matchesSearch && matchesTaller && matchesEstado;
  });

  return (
    <MUI.Box sx={{ 
      display: 'flex', 
      width: '100vw', 
      minHeight: '100vh', 
      bgcolor: MUI.alpha(theme.palette.background.paper, 0.6),
      p: 0 
    }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

      <MUI.Box component="main" sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        transition: 'all 0.3s ease-in-out'
      }}>
        <DashboardAppBar toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

        {/* Loading Overlay */}
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

        {/* Encabezado */}
        <MUI.Box sx={{ 
          p: { xs: 2, md: 4 },
          background: `linear-gradient(135deg, ${MUI.alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`,
          borderBottom: `1px solid ${MUI.alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <MUI.Typography variant="h2" sx={{ 
            mb: 1, 
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Icons.Description sx={{ fontSize: '2.5rem' }} />
            Gestión de Documentos
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Administra y revisa los documentos de los estudiantes
          </MUI.Typography>
        </MUI.Box>

        {/* Filtros */}
        <MUI.Box sx={{ 
          p: { xs: 2, md: 4 }, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          alignItems: 'center',
          background: theme.palette.background.paper,
          boxShadow: `0 2px 4px ${MUI.alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <MUI.TextField
            placeholder="Buscar estudiante..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              flexGrow: 1,
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${MUI.alpha(theme.palette.primary.main, 0.1)}`
                }
              }
            }}
            InputProps={{
              startAdornment: <Icons.Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          <MUI.FormControl size="small" sx={{ minWidth: 200 }}>
            <MUI.InputLabel>Taller</MUI.InputLabel>
            <MUI.Select
              value={selectedTaller}
              onChange={(e) => setSelectedTaller(e.target.value)}
              label="Taller"
            >
              <MUI.MenuItem value="">Todos</MUI.MenuItem>
              {talleres.map((taller) => (
                <MUI.MenuItem key={taller} value={taller}>{taller}</MUI.MenuItem>
              ))}
            </MUI.Select>
          </MUI.FormControl>

          <MUI.FormControl size="small" sx={{ minWidth: 200 }}>
            <MUI.InputLabel>Estado</MUI.InputLabel>
            <MUI.Select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              label="Estado"
            >
              <MUI.MenuItem value="">Todos</MUI.MenuItem>
              {Object.values(EstadoDocumento).map((estado) => (
                <MUI.MenuItem key={estado} value={estado}>{estado}</MUI.MenuItem>
              ))}
            </MUI.Select>
          </MUI.FormControl>
        </MUI.Box>

        {/* Lista de Estudiantes */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Grid container spacing={3}>
            {estudiantesFiltrados.map((estudiante) => (
              <MUI.Grid 
                component={MUI.Box} 
                key={estudiante.documento_id_est}
                sx={{ width: '100%' }}
              >
                <MUI.Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    background: selectedEstudiante === estudiante.documento_id_est
                      ? `linear-gradient(135deg, ${MUI.alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`
                      : theme.palette.background.paper,
                    border: `1px solid ${selectedEstudiante === estudiante.documento_id_est 
                      ? theme.palette.primary.main 
                      : MUI.alpha(theme.palette.divider, 0.1)}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${MUI.alpha(theme.palette.primary.main, 0.15)}`,
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <MUI.Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    {/* Información del Estudiante */}
                    <MUI.Box sx={{ flex: 1, minWidth: 250 }}>
                      <MUI.Typography variant="h6" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: theme.palette.primary.main
                      }}>
                        <Icons.Person />
                        {`${estudiante.nombre_est} ${estudiante.apellido_est}`}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <Icons.Badge sx={{ mr: 1, fontSize: '1rem', verticalAlign: 'middle' }} />
                        {estudiante.documento_id_est}
                      </MUI.Typography>
                      {estudiante.taller_est && (
                        <MUI.Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          <Icons.Build sx={{ mr: 1, fontSize: '1rem', verticalAlign: 'middle' }} />
                          {estudiante.taller_est.nombre_taller}
                        </MUI.Typography>
                      )}
                    </MUI.Box>

                    {/* Botón para ver documentos */}
                    <MUI.Button
                      variant={selectedEstudiante === estudiante.documento_id_est ? "contained" : "outlined"}
                      color="primary"
                      onClick={() => setSelectedEstudiante(estudiante.documento_id_est)}
                      startIcon={<Icons.Folder />}
                      sx={{
                        minWidth: 200,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      {selectedEstudiante === estudiante.documento_id_est ? "Ocultar Documentos" : "Ver Documentos"}
                    </MUI.Button>
                  </MUI.Box>

                  {/* Lista de Documentos */}
                  {selectedEstudiante === estudiante.documento_id_est && (
                    <MUI.Box sx={{ 
                      mt: 3,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 3,
                      animation: 'fadeIn 0.5s ease-out',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}>
                      {documentosMeta.map((docMeta) => {
                        const doc = documentos.find(d => d.est_doc === estudiante.documento_id_est);
                        const estado = doc?.[docMeta.campo] ? doc.estado_doc_est : 'PENDIENTE';
                        const color = getEstadoColor(estado as EstadoDocumento);

                        return (
                          <MUI.Paper
                            key={docMeta.tipo}
                            elevation={2}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              transition: 'all 0.3s ease',
                              background: `linear-gradient(135deg, ${MUI.alpha(theme.palette[color].main, 0.05)} 0%, transparent 100%)`,
                              border: `1px solid ${MUI.alpha(theme.palette[color].main, 0.1)}`,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 8px 24px ${MUI.alpha(theme.palette[color].main, 0.15)}`,
                                borderColor: theme.palette[color].main
                              }
                            }}
                          >
                            <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MUI.Box sx={{ color: theme.palette[color].main }}>
                                {docMeta.icono}
                              </MUI.Box>
                              <MUI.Typography variant="subtitle1" sx={{ flex: 1 }}>
                                {docMeta.nombre}
                              </MUI.Typography>
                              <MUI.Chip
                                label={estado}
                                color={color}
                                size="small"
                                sx={{ 
                                  minWidth: 90,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  }
                                }}
                              />
                            </MUI.Box>

                            {doc?.[docMeta.campo] && (
                              <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                                <MUI.Button
                                  fullWidth
                                  variant="outlined"
                                  color={color}
                                  size="small"
                                  startIcon={<Icons.Visibility />}
                                  onClick={() => handlePreviewDocumento(estudiante.documento_id_est, docMeta.tipo)}
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      boxShadow: `0 4px 12px ${MUI.alpha(theme.palette[color].main, 0.2)}`
                                    }
                                  }}
                                >
                                  Ver
                                </MUI.Button>
                                <MUI.Button
                                  fullWidth
                                  variant="outlined"
                                  color={color}
                                  size="small"
                                  startIcon={<Icons.Download />}
                                  onClick={() => handleDownloadDocumento(estudiante.documento_id_est, docMeta.tipo, docMeta.nombre)}
                                  sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      boxShadow: `0 4px 12px ${MUI.alpha(theme.palette[color].main, 0.2)}`
                                    }
                                  }}
                                >
                                  Descargar
                                </MUI.Button>
                              </MUI.Box>
                            )}

                            {doc?.[docMeta.campo] && (
                              <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                                {Object.values(EstadoDocumento).map((estado) => (
                                  <MUI.IconButton
                                    key={estado}
                                    size="small"
                                    color={getEstadoColor(estado)}
                                    onClick={() => handleEstadoChange(estudiante.documento_id_est, estado)}
                                    sx={{
                                      flex: 1,
                                      border: `1px solid ${MUI.alpha(theme.palette[getEstadoColor(estado)].main, 0.5)}`,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'scale(1.1)',
                                        backgroundColor: MUI.alpha(theme.palette[getEstadoColor(estado)].main, 0.1)
                                      }
                                    }}
                                  >
                                    {estado === EstadoDocumento.APROBADO && <Icons.CheckCircle />}
                                    {estado === EstadoDocumento.RECHAZADO && <Icons.Cancel />}
                                    {estado === EstadoDocumento.VISTO && <Icons.RemoveRedEye />}
                                    {estado === EstadoDocumento.PENDIENTE && <Icons.Schedule />}
                                  </MUI.IconButton>
                                ))}
                              </MUI.Box>
                            )}
                          </MUI.Paper>
                        );
                      })}
                    </MUI.Box>
                  )}
                </MUI.Paper>
              </MUI.Grid>
            ))}

            {estudiantesFiltrados.length === 0 && (
              <MUI.Grid 
                component={MUI.Box}
                sx={{ width: '100%' }}
              >
                <MUI.Box sx={{ 
                  textAlign: 'center', 
                  p: 4, 
                  color: 'text.secondary',
                  animation: 'fadeIn 0.5s ease-out'
                }}>
                  <Icons.SearchOff sx={{ fontSize: '5rem', opacity: 0.3, mb: 2 }} />
                  <MUI.Typography variant="h6" color="text.secondary">
                    No se encontraron estudiantes que coincidan con los filtros
                  </MUI.Typography>
                </MUI.Box>
              </MUI.Grid>
            )}
          </MUI.Grid>
        </MUI.Box>

        {/* Diálogo de Previsualización */}
        <MUI.Dialog
          open={Boolean(pdfUrl)}
          onClose={() => {
            setPdfUrl(null);
            setSelectedDocumento(null);
          }}
          maxWidth="lg"
          fullWidth
          TransitionComponent={MUI.Slide}
          PaperProps={{
            sx: {
              height: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <MUI.DialogTitle sx={{ 
            bgcolor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <MUI.Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icons.PictureAsPdf />
              Previsualización de Documento
            </MUI.Typography>
            <MUI.IconButton
              onClick={() => {
                setPdfUrl(null);
                setSelectedDocumento(null);
              }}
              sx={{ color: 'white' }}
            >
              <Icons.Close />
            </MUI.IconButton>
          </MUI.DialogTitle>

          <MUI.DialogContent sx={{ flex: 1, p: 0 }}>
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Preview"
              />
            )}
          </MUI.DialogContent>

          <MUI.DialogActions sx={{ 
            p: 2, 
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper
          }}>
            <MUI.TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Escribe un comentario..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              sx={{ mr: 2 }}
            />
            <MUI.Button
              variant="contained"
              color="primary"
              onClick={handleEnviarComentario}
              disabled={!comentario.trim()}
              startIcon={<Icons.Send />}
              sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              Enviar Comentario
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Snackbar para notificaciones */}
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MUI.Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            elevation={6}
            sx={{
              minWidth: 300,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Documento; 