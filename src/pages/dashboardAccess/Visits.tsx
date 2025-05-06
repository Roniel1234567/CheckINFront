import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';

// Interfaz para la relación visita-estudiante
interface VisitaEstudiante {
  id: number;
  estudiante: string;
  observaciones: string;
}

// Interfaz para el tipo de visita
interface Visit {
  id: number;
  tutora: string;
  centro: string;
  motivo: string;
  fecha: string;
  horaVisita: string;
  observaciones: string;
  estado: 'Pendiente' | 'Realizada' | 'Cancelada';
  visitaEstudiantes?: VisitaEstudiante[];
}

function Visits() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const notifications=4; 

  // Datos de ejemplo
  const [visitas] = useState<Visit[]>([
    {
      id: 1,
      tutora: 'María Sánchez',
      centro: 'TechCorp',
      motivo: 'Seguimiento mensual',
      fecha: '2024-03-15',
      horaVisita: '10:00',
      observaciones: 'La empresa muestra buena disposición para el programa de pasantías. Las instalaciones son adecuadas.',
      estado: 'Realizada',
      visitaEstudiantes: [
        {
          id: 1,
          estudiante: 'Juan Pérez',
          observaciones: 'Muestra buen desempeño en sus tareas asignadas.'
        },
        {
          id: 2,
          estudiante: 'Ana López',
          observaciones: 'Excelente trabajo en equipo y comunicación.'
        }
      ]
    },
    {
      id: 2,
      tutora: 'Ana Rodríguez',
      centro: 'InnovaSoft',
      motivo: 'Evaluación inicial',
      fecha: '2024-03-20',
      horaVisita: '14:30',
      observaciones: 'Pendiente de realizar la primera visita para evaluar las condiciones del centro.',
      estado: 'Pendiente'
    }
  ]);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDialog = (visit: Visit | null) => {
    setSelectedVisit(visit || {
      id: Math.random(),
      tutora: '',
      centro: '',
      motivo: '',
      fecha: '',
      horaVisita: '',
      observaciones: '',
      estado: 'Pendiente',
      visitaEstudiantes: []
    } as Visit);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVisit(null);
  };

  const handleSaveVisit = () => {
    // Aquí iría la lógica para guardar la visita
    handleCloseDialog();
  };

  const handleAddEstudianteVisita = () => {
    if (selectedVisit) {
      const visitaEstudiantes = selectedVisit.visitaEstudiantes || [];
      setSelectedVisit({
        ...selectedVisit,
        visitaEstudiantes: [
          ...visitaEstudiantes,
          {
            id: Math.random(),
            estudiante: '',
            observaciones: ''
          }
        ]
      });
    }
  };

  const handleRemoveEstudianteVisita = (id: number) => {
    if (selectedVisit?.visitaEstudiantes) {
      setSelectedVisit({
        ...selectedVisit,
        visitaEstudiantes: selectedVisit.visitaEstudiantes.filter(e => e.id !== id)
      });
    }
  };

  const handleEstudianteVisitaChange = (id: number, field: 'estudiante' | 'observaciones', value: string) => {
    if (selectedVisit?.visitaEstudiantes) {
      setSelectedVisit({
        ...selectedVisit,
        visitaEstudiantes: selectedVisit.visitaEstudiantes.map(e =>
          e.id === id ? { ...e, [field]: value } : e
        )
      });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Realizada':
        return '#4caf50';
      case 'Pendiente':
        return '#ff9800';
      case 'Cancelada':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const filteredVisitas = visitas.filter(visita =>
    visita.tutora.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visita.centro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visita.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <MUI.Box sx={{ display: 'flex', width:'100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p:0}}>
      {/* Sidebar */}
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Main content */}
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* App bar */}
        <DashboardAppBar notifications={notifications} toggleDrawer={toggleDrawer} />

        {/* Loading overlay */}
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
            <MUI.CircularProgress />
          </MUI.Box>
        )}

        {/* Encabezado */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
            Gestión de Visitas
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Administra las visitas a los centros de pasantías y su seguimiento
          </MUI.Typography>
        </MUI.Box>

        {/* CONTENIDO */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Card sx={{ 
            mb: 4, 
            borderRadius: 4,
            background: `linear-gradient(135deg, ${MUI.alpha(theme.palette.primary.main, 0.05)}, ${MUI.alpha(theme.palette.primary.light, 0.05)})`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}>
            <MUI.CardContent>
              <MUI.Typography variant="h4" sx={{ 
                mb: 2, 
                fontWeight: 'bold', 
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Icons.Visibility /> Registro de Visitas
              </MUI.Typography>
              <MUI.Grid container spacing={2} alignItems="center">
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por tutora, centro o motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ 
                      bgcolor: 'background.paper',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <MUI.Box sx={{ color: 'text.secondary', mr: 1 }}>
                          <Icons.Search />
                        </MUI.Box>
                      ),
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <MUI.Button
                    variant="contained"
                    startIcon={<Icons.Add />}
                    onClick={() => handleOpenDialog(null)}
                    sx={{ 
                      mb: { xs: 2, md: 0 },
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    Nueva Visita
                  </MUI.Button>
                </MUI.Grid>
              </MUI.Grid>
            </MUI.CardContent>
          </MUI.Card>

          <MUI.TableContainer 
            component={MUI.Paper} 
            sx={{ 
              mb: 4, 
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              '& .MuiTable-root': {
                borderCollapse: 'separate',
                borderSpacing: '0 8px',
              },
              '& .MuiTableCell-root': {
                borderBottom: 'none',
              },
              '& .MuiTableRow-root': {
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: MUI.alpha(theme.palette.primary.main, 0.02),
                },
              },
              '& .MuiTableHead-root .MuiTableRow-root': {
                backgroundColor: 'transparent',
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                color: theme.palette.text.secondary,
                fontWeight: 'bold',
                borderBottom: `1px solid ${MUI.alpha(theme.palette.divider, 0.1)}`,
              },
            }}
          >
            <MUI.Table>
              <MUI.TableHead>
                <MUI.TableRow>
                  <MUI.TableCell>Tutora</MUI.TableCell>
                  <MUI.TableCell>Centro</MUI.TableCell>
                  <MUI.TableCell>Motivo</MUI.TableCell>
                  <MUI.TableCell>Fecha</MUI.TableCell>
                  <MUI.TableCell>Hora</MUI.TableCell>
                  <MUI.TableCell>Estado</MUI.TableCell>
                  <MUI.TableCell>Observaciones</MUI.TableCell>
                  <MUI.TableCell align="center">Acciones</MUI.TableCell>
                </MUI.TableRow>
              </MUI.TableHead>
              <MUI.TableBody>
                {filteredVisitas.map((visita) => (
                  <MUI.TableRow 
                    key={visita.id}
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      },
                    }}
                  >
                    <MUI.TableCell>{visita.tutora}</MUI.TableCell>
                    <MUI.TableCell>{visita.centro}</MUI.TableCell>
                    <MUI.TableCell>{visita.motivo}</MUI.TableCell>
                    <MUI.TableCell>{visita.fecha}</MUI.TableCell>
                    <MUI.TableCell>{visita.horaVisita}</MUI.TableCell>
                    <MUI.TableCell>
                      <MUI.Box
                        sx={{
                          bgcolor: MUI.alpha(getEstadoColor(visita.estado), 0.1),
                          color: getEstadoColor(visita.estado),
                          py: 0.75,
                          px: 2,
                          borderRadius: 2,
                          display: 'inline-block',
                          fontWeight: 'medium',
                          fontSize: '0.875rem',
                          border: `1px solid ${MUI.alpha(getEstadoColor(visita.estado), 0.2)}`,
                        }}
                      >
                        {visita.estado}
                      </MUI.Box>
                    </MUI.TableCell>
                    <MUI.TableCell>
                      <MUI.Tooltip title={visita.observaciones}>
                        <MUI.Typography
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {visita.observaciones}
                        </MUI.Typography>
                      </MUI.Tooltip>
                    </MUI.TableCell>
                    <MUI.TableCell align="center">
                      <MUI.Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <MUI.Tooltip title="Ver detalles">
                          <MUI.IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(visita)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: MUI.alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <Icons.Visibility />
                          </MUI.IconButton>
                        </MUI.Tooltip>
                        <MUI.Tooltip title="Editar">
                          <MUI.IconButton 
                            size="small"
                            sx={{
                              color: theme.palette.warning.main,
                              '&:hover': {
                                bgcolor: MUI.alpha(theme.palette.warning.main, 0.1),
                              },
                            }}
                          >
                            <Icons.Edit />
                          </MUI.IconButton>
                        </MUI.Tooltip>
                        <MUI.Tooltip title="Eliminar">
                          <MUI.IconButton 
                            size="small"
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                bgcolor: MUI.alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <Icons.Delete />
                          </MUI.IconButton>
                        </MUI.Tooltip>
                      </MUI.Box>
                    </MUI.TableCell>
                  </MUI.TableRow>
                ))}
              </MUI.TableBody>
            </MUI.Table>
          </MUI.TableContainer>

          <MUI.Dialog 
            open={openDialog} 
            onClose={handleCloseDialog} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <MUI.DialogTitle sx={{
              bgcolor: MUI.alpha(theme.palette.primary.main, 0.05),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '& .MuiTypography-root': {
                color: theme.palette.primary.main,
                fontWeight: 'bold',
              }
            }}>
              {selectedVisit?.id ? <Icons.Edit /> : <Icons.Add />}
              {selectedVisit?.id ? 'Detalles de la Visita' : 'Nueva Visita'}
            </MUI.DialogTitle>
            <MUI.DialogContent dividers>
              <MUI.Grid container spacing={3}>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Tutora"
                    value={selectedVisit?.tutora || ''}
                    onChange={(e) => setSelectedVisit(prev => prev ? {...prev, tutora: e.target.value} : prev)}
                    InputProps={{
                      startAdornment: (
                        <Icons.Person sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Centro"
                    value={selectedVisit?.centro || ''}
                    onChange={(e) => setSelectedVisit(prev => prev ? {...prev, centro: e.target.value} : prev)}
                    InputProps={{
                      startAdornment: (
                        <Icons.Business sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12}>
                  <MUI.TextField
                    fullWidth
                    label="Motivo de la Visita"
                    value={selectedVisit?.motivo || ''}
                    onChange={(e) => setSelectedVisit(prev => prev ? {...prev, motivo: e.target.value} : prev)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    type="date"
                    label="Fecha"
                    value={selectedVisit?.fecha || ''}
                    onChange={(e) => setSelectedVisit(prev => prev ? {...prev, fecha: e.target.value} : prev)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    type="time"
                    label="Hora"
                    value={selectedVisit?.horaVisita || ''}
                    onChange={(e) => setSelectedVisit(prev => prev ? {...prev, horaVisita: e.target.value} : prev)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12}>
                  <MUI.TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Observaciones de la Visita"
                    value={selectedVisit?.observaciones || ''}
                    onChange={(e) => setSelectedVisit(prev => prev ? {...prev, observaciones: e.target.value} : prev)}
                    InputProps={{
                      startAdornment: (
                        <Icons.Description sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </MUI.Grid>

                <MUI.Grid item xs={12}>
                  <MUI.Divider sx={{ my: 2 }} />
                  <MUI.Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    bgcolor: MUI.alpha(theme.palette.primary.main, 0.05),
                    p: 2,
                    borderRadius: 2,
                  }}>
                    <MUI.Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                      Estudiantes Visitados (Opcional)
                    </MUI.Typography>
                    <MUI.Button
                      variant="outlined"
                      startIcon={<Icons.Add />}
                      onClick={handleAddEstudianteVisita}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                      }}
                    >
                      Agregar Estudiante
                    </MUI.Button>
                  </MUI.Box>
                  {selectedVisit?.visitaEstudiantes?.map((visitaEstudiante, index) => (
                    <MUI.Box 
                      key={visitaEstudiante.id} 
                      sx={{ 
                        mb: 2, 
                        p: 3, 
                        bgcolor: MUI.alpha(theme.palette.background.default, 0.6),
                        borderRadius: 3,
                        border: `1px solid ${MUI.alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: MUI.alpha(theme.palette.background.default, 0.9),
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        },
                      }}
                    >
                      <MUI.Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 2 
                      }}>
                        <MUI.Typography variant="subtitle1" sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.primary.main,
                        }}>
                          Estudiante {index + 1}
                        </MUI.Typography>
                        <MUI.IconButton 
                          size="small" 
                          onClick={() => handleRemoveEstudianteVisita(visitaEstudiante.id)}
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': {
                              bgcolor: MUI.alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <Icons.Delete />
                        </MUI.IconButton>
                      </MUI.Box>
                      <MUI.Grid container spacing={2}>
                        <MUI.Grid item xs={12}>
                          <MUI.TextField
                            fullWidth
                            label="Nombre del Estudiante"
                            value={visitaEstudiante.estudiante}
                            onChange={(e) => handleEstudianteVisitaChange(visitaEstudiante.id, 'estudiante', e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <Icons.Person sx={{ mr: 1, color: 'text.secondary' }} />
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </MUI.Grid>
                        <MUI.Grid item xs={12}>
                          <MUI.TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Observaciones del Estudiante"
                            value={visitaEstudiante.observaciones}
                            onChange={(e) => handleEstudianteVisitaChange(visitaEstudiante.id, 'observaciones', e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <Icons.Description sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </MUI.Grid>
                      </MUI.Grid>
                    </MUI.Box>
                  ))}
                </MUI.Grid>
              </MUI.Grid>
            </MUI.DialogContent>
            <MUI.DialogActions sx={{ p: 2.5, bgcolor: MUI.alpha(theme.palette.background.default, 0.6) }}>
              <MUI.Button 
                onClick={handleCloseDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: MUI.alpha(theme.palette.text.secondary, 0.05),
                  },
                }}
              >
                Cancelar
              </MUI.Button>
              <MUI.Button 
                variant="contained" 
                onClick={handleSaveVisit}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                {selectedVisit?.id ? 'Guardar Cambios' : 'Crear Visita'}
              </MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Visits;