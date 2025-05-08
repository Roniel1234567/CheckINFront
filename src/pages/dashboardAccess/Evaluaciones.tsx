import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';

// Interfaces
interface EvaluacionCentro {
  id: number;
  pasantia: number;
  espacioTrabajo: number;
  asignacionTareas: number;
  disponibilidadDudas: number;
  observaciones: string;
  fecha: string;
}

interface EvaluacionEstudiante {
  id: number;
  pasantia: number;
  ra: string;
  asistencia: number;
  desempeno: number;
  disponibilidad: number;
  responsabilidad: number;
  limpieza: number;
  trabajoEquipo: number;
  resolucionProblemas: number;
  observaciones: string;
  fecha: string;
}

function Evaluaciones() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState(0);
  const [showResponses, setShowResponses] = useState(false);
  const [evaluacionesCentro, setEvaluacionesCentro] = useState<EvaluacionCentro[]>([]);
  const [evaluacionesEstudiante, setEvaluacionesEstudiante] = useState<EvaluacionEstudiante[]>([]);
  const notifications = 4;

  // Simulación de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setEvaluacionesCentro([
        {
          id: 1,
          pasantia: 1,
          espacioTrabajo: 85,
          asignacionTareas: 90,
          disponibilidadDudas: 95,
          observaciones: "Excelente ambiente de trabajo",
          fecha: "2024-03-15"
        }
      ]);
      setEvaluacionesEstudiante([
        {
          id: 1,
          pasantia: 1,
          ra: "2023-1234",
          asistencia: 95,
          desempeno: 90,
          disponibilidad: 85,
          responsabilidad: 95,
          limpieza: 90,
          trabajoEquipo: 85,
          resolucionProblemas: 90,
          observaciones: "Muy buen desempeño general",
          fecha: "2024-03-15"
        }
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSubmitCentro = (event: React.FormEvent) => {
    event.preventDefault();
    // Lógica para enviar evaluación del centro
  };

  const handleSubmitEstudiante = (event: React.FormEvent) => {
    event.preventDefault();
    // Lógica para enviar evaluación del estudiante
  };

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar notifications={notifications} toggleDrawer={toggleDrawer} />

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

        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ 
            mb: 1, 
            fontWeight: 'bold', 
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Icons.Assessment sx={{ fontSize: '2.5rem' }} />
            Evaluaciones
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Gestiona las evaluaciones de centros de trabajo y estudiantes
          </MUI.Typography>
        </MUI.Box>

        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}
          >
            <MUI.Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <MUI.Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }
                }}
              >
                <MUI.Tab 
                  icon={<Icons.Business />} 
                  label="Evaluación Centro" 
                  iconPosition="start"
                />
                <MUI.Tab 
                  icon={<Icons.School />} 
                  label="Evaluación Estudiante" 
                  iconPosition="start"
                />
                <MUI.Tab 
                  icon={<Icons.History />} 
                  label="Historial" 
                  iconPosition="start"
                />
              </MUI.Tabs>
            </MUI.Box>

            {activeTab === 0 && (
              <MUI.Box component="form" onSubmit={handleSubmitCentro}>
                <MUI.Grid container spacing={3}>
                  <MUI.Grid item xs={12}>
                    <MUI.Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icons.Business sx={{ color: theme.palette.primary.main }} />
                      Evaluación del Centro de Trabajo
                    </MUI.Typography>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Espacio de Trabajo</MUI.InputLabel>
                      <MUI.Select
                        label="Espacio de Trabajo"
                        defaultValue=""
                        required
                      >
                        {[0, 20, 40, 60, 80, 100].map((value) => (
                          <MUI.MenuItem key={value} value={value}>
                            {value}%
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Asignación de Tareas</MUI.InputLabel>
                      <MUI.Select
                        label="Asignación de Tareas"
                        defaultValue=""
                        required
                      >
                        {[0, 20, 40, 60, 80, 100].map((value) => (
                          <MUI.MenuItem key={value} value={value}>
                            {value}%
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Disponibilidad para Dudas</MUI.InputLabel>
                      <MUI.Select
                        label="Disponibilidad para Dudas"
                        defaultValue=""
                        required
                      >
                        {[0, 20, 40, 60, 80, 100].map((value) => (
                          <MUI.MenuItem key={value} value={value}>
                            {value}%
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12}>
                    <MUI.TextField
                      label="Observaciones"
                      multiline
                      rows={4}
                      fullWidth
                      required
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12}>
                    <MUI.Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<Icons.Send />}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      Enviar Evaluación
                    </MUI.Button>
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Box>
            )}

            {activeTab === 1 && (
              <MUI.Box component="form" onSubmit={handleSubmitEstudiante}>
                <MUI.Grid container spacing={3}>
                  <MUI.Grid item xs={12}>
                    <MUI.Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icons.School sx={{ color: theme.palette.primary.main }} />
                      Evaluación del Estudiante
                    </MUI.Typography>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6}>
                    <MUI.TextField
                      label="RA del Estudiante"
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <MUI.Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            <Icons.Badge sx={{ color: 'text.secondary' }} />
                          </MUI.Box>
                        )
                      }}
                    />
                  </MUI.Grid>

                  {['Asistencia', 'Desempeño', 'Disponibilidad', 'Responsabilidad', 'Limpieza', 'Trabajo en Equipo', 'Resolución de Problemas'].map((criterio, index) => (
                    <MUI.Grid item xs={12} md={6} key={index}>
                      <MUI.FormControl fullWidth>
                        <MUI.InputLabel>{criterio}</MUI.InputLabel>
                        <MUI.Select
                          label={criterio}
                          defaultValue=""
                          required
                        >
                          {[0, 20, 40, 60, 80, 100].map((value) => (
                            <MUI.MenuItem key={value} value={value}>
                              {value}%
                            </MUI.MenuItem>
                          ))}
                        </MUI.Select>
                      </MUI.FormControl>
                    </MUI.Grid>
                  ))}

                  <MUI.Grid item xs={12}>
                    <MUI.TextField
                      label="Observaciones"
                      multiline
                      rows={4}
                      fullWidth
                      required
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12}>
                    <MUI.Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<Icons.Send />}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      Enviar Evaluación
                    </MUI.Button>
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Box>
            )}

            {activeTab === 2 && (
              <MUI.Box>
                <MUI.Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icons.History sx={{ color: theme.palette.primary.main }} />
                  Historial de Evaluaciones
                </MUI.Typography>

                <MUI.Tabs 
                  value={showResponses ? 1 : 0} 
                  onChange={(_, newValue) => setShowResponses(newValue === 1)}
                  sx={{ mb: 3 }}
                >
                  <MUI.Tab label="Centros de Trabajo" />
                  <MUI.Tab label="Estudiantes" />
                </MUI.Tabs>

                {!showResponses ? (
                  <MUI.Grid container spacing={3}>
                    {evaluacionesCentro.map((item) => (
                      <MUI.Grid item xs={12} key={item.id}>
                        <MUI.Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <MUI.Typography variant="h6">
                              Evaluación #{item.id}
                            </MUI.Typography>
                            <MUI.Chip
                              label={new Date(item.fecha).toLocaleDateString()}
                              icon={<Icons.CalendarToday />}
                            />
                          </MUI.Box>

                          <MUI.Grid container spacing={2}>
                            <MUI.Grid item xs={12} md={4}>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Business sx={{ color: theme.palette.primary.main }} />
                                <MUI.Typography>
                                  Espacio de Trabajo: {item.espacioTrabajo}%
                                </MUI.Typography>
                              </MUI.Box>
                            </MUI.Grid>
                            <MUI.Grid item xs={12} md={4}>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Assignment sx={{ color: theme.palette.primary.main }} />
                                <MUI.Typography>
                                  Asignación de Tareas: {item.asignacionTareas}%
                                </MUI.Typography>
                              </MUI.Box>
                            </MUI.Grid>
                            <MUI.Grid item xs={12} md={4}>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Help sx={{ color: theme.palette.primary.main }} />
                                <MUI.Typography>
                                  Disponibilidad: {item.disponibilidadDudas}%
                                </MUI.Typography>
                              </MUI.Box>
                            </MUI.Grid>
                          </MUI.Grid>

                          <MUI.Divider sx={{ my: 2 }} />

                          <MUI.Typography variant="body2" color="text.secondary">
                            {item.observaciones}
                          </MUI.Typography>
                        </MUI.Paper>
                      </MUI.Grid>
                    ))}
                  </MUI.Grid>
                ) : (
                  <MUI.Grid container spacing={3}>
                    {evaluacionesEstudiante.map((item) => (
                      <MUI.Grid item xs={12} key={item.id}>
                        <MUI.Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <MUI.Typography variant="h6">
                              RA: {item.ra}
                            </MUI.Typography>
                            <MUI.Chip
                              label={new Date(item.fecha).toLocaleDateString()}
                              icon={<Icons.CalendarToday />}
                            />
                          </MUI.Box>

                          <MUI.Grid container spacing={2}>
                            {[
                              { label: 'Asistencia', value: item.asistencia, icon: <Icons.EventAvailable /> },
                              { label: 'Desempeño', value: item.desempeno, icon: <Icons.Star /> },
                              { label: 'Disponibilidad', value: item.disponibilidad, icon: <Icons.AccessTime /> },
                              { label: 'Responsabilidad', value: item.responsabilidad, icon: <Icons.AssignmentTurnedIn /> },
                              { label: 'Limpieza', value: item.limpieza, icon: <Icons.CleaningServices /> },
                              { label: 'Trabajo en Equipo', value: item.trabajoEquipo, icon: <Icons.Group /> },
                              { label: 'Resolución de Problemas', value: item.resolucionProblemas, icon: <Icons.Lightbulb /> }
                            ].map((criterio, index) => (
                              <MUI.Grid item xs={12} md={6} key={index}>
                                <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {criterio.icon}
                                  <MUI.Typography>
                                    {criterio.label}: {criterio.value}%
                                  </MUI.Typography>
                                </MUI.Box>
                              </MUI.Grid>
                            ))}
                          </MUI.Grid>

                          <MUI.Divider sx={{ my: 2 }} />

                          <MUI.Typography variant="body2" color="text.secondary">
                            {item.observaciones}
                          </MUI.Typography>
                        </MUI.Paper>
                      </MUI.Grid>
                    ))}
                  </MUI.Grid>
                )}
              </MUI.Box>
            )}
          </MUI.Paper>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Evaluaciones; 