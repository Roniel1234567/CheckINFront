import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';

// Interfaces
interface Pasantia {
  id: number;
  estudiante: string;
  centro: string;
  supervisor: string;
}

// Datos de ejemplo
const estudiantes = [
  { id: 1, nombre: 'Juan Pérez', taller: 'INF' },
  { id: 2, nombre: 'María García', taller: 'GAT' },
  { id: 3, nombre: 'Carlos López', taller: 'CyP' },
  { id: 4, nombre: 'Ana Martínez', taller: 'EBA' },
  { id: 5, nombre: 'Pedro Sánchez', taller: 'ELCA' },
];

const centrosTrabajo = [
  { id: 1, nombre: 'TechSolutions DR', sector: 'Santo Domingo' },
  { id: 2, nombre: 'Gestión Empresarial A', sector: 'Santiago' },
  { id: 3, nombre: 'Confecciones Plus', sector: 'La Vega' },
  { id: 4, nombre: 'Muebles Artesanales', sector: 'San Francisco' },
  { id: 5, nombre: 'Electrónica Moderna', sector: 'Santo Domingo' },
];

const supervisores = [
  { id: 1, nombre: 'Roberto Díaz', centro: 'TechSolutions DR' },
  { id: 2, nombre: 'Laura Torres', centro: 'Gestión Empresarial A' },
  { id: 3, nombre: 'Miguel Ruiz', centro: 'Confecciones Plus' },
  { id: 4, nombre: 'Carmen Vega', centro: 'Muebles Artesanales' },
  { id: 5, nombre: 'José Ramírez', centro: 'Electrónica Moderna' },
];

const diasSemana = [
  { id: 'lunes', nombre: 'Lunes' },
  { id: 'martes', nombre: 'Martes' },
  { id: 'miercoles', nombre: 'Miércoles' },
  { id: 'jueves', nombre: 'Jueves' },
  { id: 'viernes', nombre: 'Viernes' },
  { id: 'sabado', nombre: 'Sábado' },
  { id: 'domingo', nombre: 'Domingo' },
];

function Internships() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const totalPasantiasActivas: number = 45;
  const totalPasantiasCompletas: number = 12;
  const totalEmpresasAsociadas: number = 67;
  const notifications = 4;
  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [selectedCentro, setSelectedCentro] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);

  // Simulación de carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Manejar el cambio de tamaño de la ventana
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Datos de ejemplo para las pasantías
  const pasantias: Pasantia[] = [
    {
      id: 1,
      estudiante: "Juan Pérez",
      centro: "TechSolutions DR",
      supervisor: "María García"
    },
    {
      id: 2,
      estudiante: "Ana Martínez",
      centro: "Manufactura Industrial",
      supervisor: "Carlos López"
    },
    {
      id: 3,
      estudiante: "Pedro Sánchez",
      centro: "Electrónica Moderna",
      supervisor: "Laura Torres"
    }
  ];

  // Datos para las tarjetas de estadísticas
  const stats = [
    {
      title: 'Pasantías en Curso',
      value: totalPasantiasActivas,
      icon: <Icons.Assignment fontSize="large" />,
      color: '#1a237e',
      description: 'Total de pasantías activas'
    },
    {
      title: 'Pasantías Completadas',
      value: totalPasantiasCompletas,
      icon: <Icons.Assignment fontSize="large" />,
      color: '#283593',
      description: 'Total de pasantías completadas'
    },
    {
      title: 'Empresas Asociadas',
      value: totalEmpresasAsociadas,
      icon: <Icons.Business fontSize="large" />,
      color: '#3949ab',
      description: 'Centros de trabajo colaboradores'
    }
  ];

  const handleDiaChange = (diaId: string) => {
    setDiasSeleccionados(prev => 
      prev.includes(diaId) 
        ? prev.filter(dia => dia !== diaId)
        : [...prev, diaId]
    );
  };

  return (
    <MUI.Box sx={{ display: 'flex', width:'100vw',minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p:0}}>
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
          <MUI.Typography  variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
            Gestión de Pasantías
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Administra las pasantías y su seguimiento
          </MUI.Typography>
        </MUI.Box>

        {/*CONTENIDO*/}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Tarjetas de estadísticas y accesos */}
        <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Tarjetas de estadísticas */}
          {stats.slice(1).map((stat, index) => (
            <MUI.Grid item xs={12} sm={6} md={4} key={index}>
              <MUI.Zoom in={!loading} style={{ transitionDelay: `${index * 100}ms` }}>
                <MUI.Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                    },
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <MUI.Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: MUI.alpha(stat.color, 0.1),
                      borderRadius: '0 0 0 100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-end',
                      p: 1,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </MUI.Box>
                  <MUI.CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <MUI.Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: stat.color }}>
                      {stat.value}
                    </MUI.Typography>
                    <MUI.Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                      {stat.title}
                    </MUI.Typography>
                    <MUI.Typography variant="body2" color="text.secondary">
                      {stat.description}
                    </MUI.Typography>
                  </MUI.CardContent>
                </MUI.Card>
              </MUI.Zoom>
            </MUI.Grid>
          ))}

          {/* Tarjeta de accesos */}
          <MUI.Grid item xs={12} sm={6} md={4}>
            <MUI.Card
              sx={{
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                bgcolor: 'white'
              }}
            >
              <MUI.CardContent sx={{ p: 3 }}>
                <MUI.Typography variant="h6" sx={{ mb: 2, color: '#1a237e', fontWeight: 'bold' }}>
                  Accesos
                </MUI.Typography>
                <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <MUI.Button
                    variant="outlined"
                    startIcon={<Icons.AccessTime />}
                    sx={{ 
                      color: '#1a237e', 
                      borderColor: '#1a237e',
                      '&:hover': {
                        borderColor: '#0d1b60',
                        bgcolor: MUI.alpha('#1a237e', 0.05),
                      }
                    }}
                  >
                    Horas Completadas
                  </MUI.Button>
                  <MUI.Button
                    variant="outlined"
                    startIcon={<Icons.EventNote />}
                    sx={{ 
                      color: '#1a237e', 
                      borderColor: '#1a237e',
                      '&:hover': {
                        borderColor: '#0d1b60',
                        bgcolor: MUI.alpha('#1a237e', 0.05),
                      }
                    }}
                  >
                    Asistencia
                  </MUI.Button>
                  <MUI.Button
                    variant="outlined"
                    startIcon={<Icons.Assessment />}
                    sx={{ 
                      color: '#1a237e', 
                      borderColor: '#1a237e',
                      '&:hover': {
                        borderColor: '#0d1b60',
                        bgcolor: MUI.alpha('#1a237e', 0.05),
                      }
                    }}
                  >
                    Evaluaciones
                  </MUI.Button>
                </MUI.Box>
              </MUI.CardContent>
            </MUI.Card>
          </MUI.Grid>
        </MUI.Grid>

        {/* Contenido principal */}
        <MUI.Grid container spacing={3}>
          {/* Tarjeta de Pasantías en Curso */}
          <MUI.Grid item xs={12} md={4}>
            <MUI.Card
              sx={{
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <MUI.Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 80,
                  height: 80,
                  background: MUI.alpha('#1a237e', 0.1),
                  borderRadius: '0 0 0 100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  p: 1,
                  color: '#1a237e'
                }}
              >
                <Icons.Assignment fontSize="large" />
              </MUI.Box>
              <MUI.CardContent sx={{ p: 3, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <MUI.Box sx={{ flexGrow: 1 }}>
                  <MUI.Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: '#1a237e' }}>
                    {totalPasantiasActivas}
                  </MUI.Typography>
                  <MUI.Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Pasantías en Curso
                  </MUI.Typography>
                  <MUI.Typography variant="body2" color="text.secondary">
                    Total de pasantías activas
                  </MUI.Typography>
                </MUI.Box>
                <MUI.Button
                  variant="contained"
                  startIcon={<Icons.Add />}
                  sx={{
                    mt: 3,
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#0d1b60' }
                  }}
                  onClick={() => setOpenDialog(true)}
                >
                  Crear Nueva Pasantía
                </MUI.Button>
              </MUI.CardContent>
            </MUI.Card>
          </MUI.Grid>

          {/* Tabla de pasantías */}
          <MUI.Grid item xs={12} md={8}>
            <MUI.Paper sx={{ p: 3, borderRadius: 4 }}>
              <MUI.Box sx={{ mb: 3 }}>
                <MUI.TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar pasantía..."
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
              </MUI.Box>

              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow>
                      <MUI.TableCell>ID Pasantía</MUI.TableCell>
                      <MUI.TableCell>Estudiante</MUI.TableCell>
                      <MUI.TableCell>Centro</MUI.TableCell>
                      <MUI.TableCell>Supervisor</MUI.TableCell>
                      <MUI.TableCell>Acciones</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {pasantias.map((pasantia) => (
                      <MUI.TableRow key={pasantia.id}>
                        <MUI.TableCell>{pasantia.id}</MUI.TableCell>
                        <MUI.TableCell>{pasantia.estudiante}</MUI.TableCell>
                        <MUI.TableCell>{pasantia.centro}</MUI.TableCell>
                        <MUI.TableCell>{pasantia.supervisor}</MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.IconButton size="small" sx={{ mr: 1 }}>
                            <Icons.Edit />
                          </MUI.IconButton>
                          <MUI.IconButton size="small">
                            <Icons.Delete />
                          </MUI.IconButton>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </MUI.Paper>
          </MUI.Grid>
        </MUI.Grid>
        </MUI.Box>

        {/* Diálogo para crear nueva pasantía */}
        <MUI.Dialog 
          open={openDialog} 
          onClose={() => {
            setOpenDialog(false);
            setSelectedEstudiante('');
            setSelectedCentro('');
            setSelectedSupervisor('');
            setFechaInicio('');
            setDiasSeleccionados([]);
          }} 
          maxWidth="md" 
          fullWidth
        >
          <MUI.DialogTitle>Crear Nueva Pasantía</MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              {/* Estudiante */}
              <MUI.TextField
                select
                fullWidth
                label="Estudiante"
                value={selectedEstudiante}
                onChange={(e) => setSelectedEstudiante(e.target.value)}
                variant="outlined"
              >
                <MUI.MenuItem value="">
                  <em>Seleccione un estudiante</em>
                </MUI.MenuItem>
                {estudiantes.map((estudiante) => (
                  <MUI.MenuItem key={estudiante.id} value={estudiante.id}>
                    {estudiante.nombre} - {estudiante.taller}
                  </MUI.MenuItem>
                ))}
              </MUI.TextField>

              {/* Centro de Trabajo */}
              <MUI.TextField
                select
                fullWidth
                label="Centro de Trabajo"
                value={selectedCentro}
                onChange={(e) => setSelectedCentro(e.target.value)}
                variant="outlined"
              >
                <MUI.MenuItem value="">
                  <em>Seleccione un centro de trabajo</em>
                </MUI.MenuItem>
                {centrosTrabajo.map((centro) => (
                  <MUI.MenuItem key={centro.id} value={centro.id}>
                    {centro.nombre} - {centro.sector}
                  </MUI.MenuItem>
                ))}
              </MUI.TextField>

              {/* Supervisor */}
              <MUI.TextField
                select
                fullWidth
                label="Supervisor"
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                variant="outlined"
              >
                <MUI.MenuItem value="">
                  <em>Seleccione un supervisor</em>
                </MUI.MenuItem>
                {supervisores.map((supervisor) => (
                  <MUI.MenuItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.nombre} - {supervisor.centro}
                  </MUI.MenuItem>
                ))}
              </MUI.TextField>

              {/* Fecha de Inicio */}
              <MUI.TextField
                fullWidth
                label="Fecha de Inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />

              {/* Días de la Semana */}
              <MUI.Typography variant="subtitle1" sx={{ mt: 2 }}>
                Días de Pasantía
              </MUI.Typography>
              <MUI.FormGroup>
                <MUI.Grid container spacing={2}>
                  {diasSemana.map((dia) => (
                    <MUI.Grid item xs={12} sm={6} md={4} key={dia.id}>
                      <MUI.FormControlLabel
                        control={
                          <MUI.Checkbox
                            checked={diasSeleccionados.includes(dia.id)}
                            onChange={() => handleDiaChange(dia.id)}
                            color="primary"
                          />
                        }
                        label={dia.nombre}
                      />
                    </MUI.Grid>
                  ))}
                </MUI.Grid>
              </MUI.FormGroup>
            </MUI.Box>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button 
              onClick={() => {
                setOpenDialog(false);
                setSelectedEstudiante('');
                setSelectedCentro('');
                setSelectedSupervisor('');
                setFechaInicio('');
                setDiasSeleccionados([]);
              }}
            >
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b60' } }}
            >
              Crear Pasantía
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
        </MUI.Box>
      </MUI.Box>
  );
}

export default Internships;