import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';

// Interfaces para los tipos de datos
interface Provincia {
  id: string;
  nombre: string;
}

interface Ciudad {
  id: string;
  nombre: string;
}

interface Empresa {
  id: number;
  nombre: string;
  estudiantes: number;
  estado: 'Activa' | 'Inactiva';
}

const Users: React.FC = () => {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRolDialog, setOpenRolDialog] = useState(false);
  const [selectedRol, setSelectedRol] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const totalusuaruios: number = 202;
  const totalactivosuser: number = 100;
  const adminusers: number = 20;
  const rolescubiertos = 5; 
  const notifications= 4 ; 
   
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



  const handleRoleSelection = (roleName: string) => {
    const route = roleRoutes[roleName];
    if (route) {
      navigate(route);
      setOpenRolDialog(false);
      setSelectedRol(null);
    }
  };

  // Datos de ejemplo para las tarjetas principales
  const Stats = [
    {
      title: 'Total de usuarios',
      value: totalusuaruios,
      icon: <Icons.People fontSize="large" />,
      color: '#1a237e',
      description: 'Usuarios registrados en el sistema'
    },
    {
      title: 'Usuarios Activos',
      value: totalactivosuser,
      icon: <Icons.CheckCircle fontSize="large" />,
      color: '#1a237e',
      description: 'Usuarios que continúan en la gestión'
    },
    {
      title: 'Administradores',
      value: adminusers,
      icon: <Icons.AdminPanelSettings fontSize="large" />,
      color: '#1a237e',
      description: 'Total de administradores registrados'
    },
    {
      title: 'Roles Cubiertos',
      value: rolescubiertos,
      icon: <Icons.Security fontSize="large" />,
      color: '#1a237e',
      description: 'Diferentes roles para los usuarios'
    },
  ];

  // Datos de ejemplo para los selects dependientes
  const provincias: Provincia[] = [
    { id: 'p1', nombre: 'Provincia Norte' },
    { id: 'p2', nombre: 'Provincia Sur' },
    { id: 'p3', nombre: 'Provincia Este' },
  ];

  const ciudadesPorProvincia: Record<string, Ciudad[]> = {
    'p1': [
      { id: 'c1', nombre: 'Ciudad Norte A' },
      { id: 'c2', nombre: 'Ciudad Norte B' },
      { id: 'c3', nombre: 'Ciudad Norte C' },
    ],
    'p2': [
      { id: 'c4', nombre: 'Ciudad Sur A' },
      { id: 'c5', nombre: 'Ciudad Sur B' },
    ],
    'p3': [
      { id: 'c6', nombre: 'Ciudad Este A' },
      { id: 'c7', nombre: 'Ciudad Este B' },
      { id: 'c8', nombre: 'Ciudad Este C' },
    ],
  };

  const sectoresPorCiudad: Record<string, string[]> = {
    'c1': ['Sector Norte A1', 'Sector Norte A2', 'Sector Norte A3'],
    'c2': ['Sector Norte B1', 'Sector Norte B2'],
    'c3': ['Sector Norte C1', 'Sector Norte C2', 'Sector Norte C3'],
    'c4': ['Sector Sur A1', 'Sector Sur A2'],
    'c5': ['Sector Sur B1', 'Sector Sur B2', 'Sector Sur B3'],
    'c6': ['Sector Este A1', 'Sector Este A2'],
    'c7': ['Sector Este B1', 'Sector Este B2'],
    'c8': ['Sector Este C1', 'Sector Este C2', 'Sector Este C3'],
  };

  // Datos de ejemplo para usuarios por rol
  const usuariosPorRol: Record<string, Empresa[]> = {
    'GAT': [
      { id: 1, nombre: 'Gestión Empresarial A', estudiantes: 3, estado: 'Activa' },
      { id: 2, nombre: 'Gestión Empresarial B', estudiantes: 2, estado: 'Activa' },
    ],
    'INF': [
      { id: 3, nombre: 'TechSolutions DR', estudiantes: 5, estado: 'Activa' },
      { id: 4, nombre: 'Software Pro', estudiantes: 4, estado: 'Activa' },
    ],
    'CyP': [
      { id: 5, nombre: 'Confecciones Plus', estudiantes: 3, estado: 'Activa' },
      { id: 6, nombre: 'Patronaje Pro', estudiantes: 2, estado: 'Inactiva' },
    ],
    'EBA': [
      { id: 7, nombre: 'Muebles Artesanales', estudiantes: 4, estado: 'Activa' },
      { id: 8, nombre: 'Diseño en Madera', estudiantes: 3, estado: 'Activa' },
    ],
    'ELCA': [
      { id: 9, nombre: 'Electrónica Moderna', estudiantes: 4, estado: 'Activa' },
      { id: 10, nombre: 'Circuitos Pro', estudiantes: 3, estado: 'Inactiva' },
    ],
    'ELDAD': [
      { id: 11, nombre: 'Electricidad Avanzada', estudiantes: 5, estado: 'Activa' },
      { id: 12, nombre: 'Instalaciones Eléctricas', estudiantes: 4, estado: 'Activa' },
    ],
    'AUTO': [
      { id: 13, nombre: 'AutoMecánica Pro', estudiantes: 3, estado: 'Activa' },
      { id: 14, nombre: 'CarTech', estudiantes: 2, estado: 'Activa' },
    ],
    'MEC': [
      { id: 15, nombre: 'Mecanizado Industrial', estudiantes: 4, estado: 'Activa' },
      { id: 16, nombre: 'Precisión CNC', estudiantes: 3, estado: 'Inactiva' },
    ],
  };

  const roles = [
    { nom: 'Administrador', desc: 'Cuenta con todos los permisos, tiene la habilidad de ver y editar todos los datos.', path: '/Usuarios/Administradores' },
    { nom: 'Supervisor', desc: 'Empleado del centro de trabajo, encargado de evaluar al estudiante y examinarlo', path: '/Usuarios/Supervisores' },
    { nom: 'Tutor', desc: 'Maestro titular de un taller, encargado de comprobar el progreso de sus estudiantes', path: '/Usuarios/Tutores' },
    { nom: 'Estudiante', desc: 'Se desempeña como pasante en el Centro de Trabajo, es a quien se le evalúa', path: '/Usuarios/Estudiantes' },
    { nom: 'Observador', desc: 'Usuario con el único permiso de observar los datos de la gestión de pasantías', path: '/Usuarios/Observadores' },
  ];

  // Manejadores de cambio para los selects
  const handleProvinciaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const provincia = event.target.value;
    setSelectedProvincia(provincia);
    setSelectedCiudad('');
    setSelectedSector('');
  };

  const handleCiudadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const ciudad = event.target.value;
    setSelectedCiudad(ciudad);
    setSelectedSector('');
  };

  const handleSectorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSector(event.target.value);
  };

  const roleRoutes: Record<string, string> = {
    'Administrador': '/Usuarios/Administradores',
    'Supervisor': '/Usuarios/Supervisores',
    'Tutor': '/Usuarios/Tutores',
    'Estudiante': '/Usuarios/Estudiantes',
    'Observador': '/Usuarios/Observadores'
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
          Gestión de Usuarios
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
          Administra los usuarios, sus roles y dependencias
          </MUI.Typography>
        </MUI.Box>

        {/*CONTENIDO*/}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Botones de acción principales */}
        <MUI.Grid container spacing={2} sx={{ mb: 4 }}>
          <MUI.Grid item>
            <MUI.Button
              variant="contained"
              startIcon={<Icons.Add />}
              sx={{
                bgcolor: '#1a237e',
                '&:hover': { bgcolor: '#0d1b60' }
              }}
              onClick={() => setOpenDialog(true)}
            >
              Registrar Nuevo Usuario
            </MUI.Button>
          </MUI.Grid>
          <MUI.Grid item>
            <MUI.Button
              variant="outlined"
              startIcon={<Icons.Group />}
              sx={{ color: '#1a237e', borderColor: '#1a237e' }}
              onClick={() => setOpenRolDialog(true)}
            >
              Ver por Rol
            </MUI.Button>
          </MUI.Grid>
        </MUI.Grid>

        {/* Tarjetas de estadísticas */}
        <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
          {Stats.map((stat, index) => (
            <MUI.Grid item xs={12} sm={6} md={3} key={index}>
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
                      background: MUI.alpha(theme.palette.secondary.main, 0.6),
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
        </MUI.Grid>

        {/* Buscador y tabla de Centros de Trabajo */}
        <MUI.Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <MUI.Box sx={{ mb: 3 }}>
            <MUI.TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar en el registro de actualizaciones..."
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
                  <MUI.TableCell>Actualización</MUI.TableCell>
                  <MUI.TableCell>Administrador</MUI.TableCell>
                  <MUI.TableCell>Fecha y Hora</MUI.TableCell>
                  <MUI.TableCell>Rol Afectado</MUI.TableCell>
                </MUI.TableRow>
              </MUI.TableHead>
              <MUI.TableBody>
                {[
                  {
                    id: 1,
                    actualizacion: 'Registro',
                    admin: 'Juan Pérez',
                    fecha: '2024-03-20 14:30',
                    rol: 'Estudiante'
                  },
                  {
                    id: 2,
                    actualizacion: 'Edición',
                    admin: 'María García',
                    fecha: '2024-03-20 13:15',
                    rol: 'Tutor'
                  },
                  {
                    id: 3,
                    actualizacion: 'Eliminación',
                    admin: 'Carlos López',
                    fecha: '2024-03-20 12:45',
                    rol: 'Supervisor'
                  },
                  {
                    id: 4,
                    actualizacion: 'Cambio de Estado',
                    admin: 'Ana Martínez',
                    fecha: '2024-03-20 11:20',
                    rol: 'Administrador'
                  }
                ].map((registro) => (
                  <MUI.TableRow key={registro.id}>
                    <MUI.TableCell>
                      <MUI.Chip
                        label={registro.actualizacion}
                        color={
                          registro.actualizacion === 'Registro' ? 'success' :
                          registro.actualizacion === 'Edición' ? 'primary' :
                          registro.actualizacion === 'Eliminación' ? 'error' :
                          'warning'
                        }
                        size="small"
                      />
                    </MUI.TableCell>
                    <MUI.TableCell>{registro.admin}</MUI.TableCell>
                    <MUI.TableCell>{registro.fecha}</MUI.TableCell>
                    <MUI.TableCell>
                      <MUI.Chip
                        label={registro.rol}
                        color="default"
                        size="small"
                      />
                    </MUI.TableCell>
                  </MUI.TableRow>
                ))}
              </MUI.TableBody>
            </MUI.Table>
          </MUI.TableContainer>
        </MUI.Paper>

        {/* Diálogo para registrar nuevo usuario */}
        <MUI.Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <MUI.DialogTitle>Registrar Nuevo Usuario</MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              {/* Información de Usuario */}
              <MUI.Typography variant="h6" sx={{ color: '#1a237e', mb: 1 }}>
                Información de Usuario
              </MUI.Typography>
              <MUI.Grid container spacing={2}>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Usuario"
                    variant="outlined"
                  />
                  
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    select
                    fullWidth
                    label="Rol del Usuario"
                    variant="outlined"
                    onChange={(e) => setSelectedRol(e.target.value)}
                  >
                    <MUI.MenuItem value="admin">Administrador</MUI.MenuItem>
                    <MUI.MenuItem value="supervisor">Supervisor</MUI.MenuItem>
                    <MUI.MenuItem value="tutor">Tutor</MUI.MenuItem>
                    <MUI.MenuItem value="estudiante">Estudiante</MUI.MenuItem>
                    <MUI.MenuItem value="observador">Observador</MUI.MenuItem>
                  </MUI.TextField>

                  </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <MUI.InputAdornment position="end">
                          <MUI.IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <Icons.VisibilityOff /> : <Icons.Visibility/>}
                          </MUI.IconButton>
                        </MUI.InputAdornment>
                      ),
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Verificar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <MUI.InputAdornment position="end">
                          <MUI.IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <Icons.VisibilityOff /> : <Icons.Visibility/>}
                          </MUI.IconButton>
                        </MUI.InputAdornment>
                      ),
                    }}
                  />

                </MUI.Grid>
              </MUI.Grid>

              {/* Información Personal (común para todos) */}
              <MUI.Typography variant="h6" sx={{ color: '#1a237e', mb: 1, mt: 2 }}>
                Información Personal
              </MUI.Typography>
              <MUI.Grid container spacing={2}>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Nombre"
                    variant="outlined"
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Apellido"
                    variant="outlined"
                  />
                </MUI.Grid>
              </MUI.Grid>

              {/* Campos específicos según el rol */}
              {selectedRol && (
                <>
                  {/* Campos para Admin y Observador */}
                  {(selectedRol === 'admin' || selectedRol === 'observador') && (
                    <MUI.Grid container spacing={2}>
                      <MUI.Grid item xs={12}>
                        <MUI.TextField
                          fullWidth
                          label="Puesto"
                          variant="outlined"
                        />
                      </MUI.Grid>
                    </MUI.Grid>
                  )}

                  {/* Campos para Estudiante */}
                  {selectedRol === 'estudiante' && (
                    <>
                      <MUI.Grid container spacing={2}>
                        <MUI.Grid item xs={12} md={6}>
                          <MUI.TextField
                            fullWidth
                            label="Segundo Nombre"
                            variant="outlined"
                          />
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={6}>
                          <MUI.TextField
                            fullWidth
                            label="Segundo Apellido"
                            variant="outlined"
                          />
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={6}>
                          <MUI.TextField
                            select
                            fullWidth
                            label="Tipo de Documento"
                            variant="outlined"
                          >
                            <MUI.MenuItem value="cedula">Cédula</MUI.MenuItem>
                            <MUI.MenuItem value="pasaporte">Pasaporte</MUI.MenuItem>
                          </MUI.TextField>
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={6}>
                          <MUI.TextField
                            fullWidth
                            label="Número de Documento"
                            variant="outlined"
                          />
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={6}>
                          <MUI.TextField
                            fullWidth
                            label="Fecha de Nacimiento"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                          />
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={6}>
                          <MUI.TextField
                            fullWidth
                            label="Ciclo Escolar"
                            variant="outlined"
                          />
                        </MUI.Grid>
                        <MUI.Grid item xs={12}>
                          <MUI.TextField
                            select
                            fullWidth
                            label="Taller"
                            variant="outlined"
                          >
                            <MUI.MenuItem value="GAT">Gestión Administrativa y Tributaria</MUI.MenuItem>
                            <MUI.MenuItem value="INF">Desarrollo y Administración de Aplicaciones Informática</MUI.MenuItem>
                            <MUI.MenuItem value="CyP">Confección y Patronaje</MUI.MenuItem>
                            <MUI.MenuItem value="EBA">Muebles y Estructura de la Madera</MUI.MenuItem>
                            <MUI.MenuItem value="ELCA">Equipos Electrónicos</MUI.MenuItem>
                            <MUI.MenuItem value="ELDAD">Instalaciones Eléctricas</MUI.MenuItem>
                            <MUI.MenuItem value="AUTO">Electromecánica de Vehículos</MUI.MenuItem>
                            <MUI.MenuItem value="MEC">Mecanizado</MUI.MenuItem>
                          </MUI.TextField>
                        </MUI.Grid>
                      </MUI.Grid>

                      {/* Dirección para Estudiante */}
                      <MUI.Typography variant="h6" sx={{ color: '#1a237e', mb: 1, mt: 2 }}>
                        Dirección
                      </MUI.Typography>
                      <MUI.Grid container spacing={2}>
                        <MUI.Grid item xs={12} md={4}>
                          <MUI.TextField
                            select
                            fullWidth
                            label="Provincia"
                            value={selectedProvincia}
                            onChange={handleProvinciaChange}
                            variant="outlined"
                          >
                            <MUI.MenuItem value="">
                              <em>Seleccione una provincia</em>
                            </MUI.MenuItem>
                            {provincias.map((provincia) => (
                              <MUI.MenuItem key={provincia.id} value={provincia.id}>
                                {provincia.nombre}
                              </MUI.MenuItem>
                            ))}
                          </MUI.TextField>
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={4}>
                          <MUI.TextField
                            select
                            fullWidth
                            label="Ciudad"
                            value={selectedCiudad}
                            onChange={handleCiudadChange}
                            variant="outlined"
                            disabled={!selectedProvincia}
                          >
                            <MUI.MenuItem value="">
                              <em>Seleccione una ciudad</em>
                            </MUI.MenuItem>
                            {selectedProvincia && ciudadesPorProvincia[selectedProvincia]?.map((ciudad: Ciudad) => (
                              <MUI.MenuItem key={ciudad.id} value={ciudad.id}>
                                {ciudad.nombre}
                              </MUI.MenuItem>
                            ))}
                          </MUI.TextField>
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={4}>
                          <MUI.TextField
                            select
                            fullWidth
                            label="Sector"
                            value={selectedSector}
                            onChange={handleSectorChange}
                            variant="outlined"
                            disabled={!selectedCiudad}
                          >
                            <MUI.MenuItem value="">
                              <em>Seleccione un sector</em>
                            </MUI.MenuItem>
                            {selectedCiudad && sectoresPorCiudad[selectedCiudad]?.map((sector: string) => (
                              <MUI.MenuItem key={sector} value={sector}>
                                {sector}
                              </MUI.MenuItem>
                            ))}
                          </MUI.TextField>
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={6}>
                          <MUI.TextField
                            fullWidth
                            label="Calle"
                            variant="outlined"
                          />
                        </MUI.Grid>
                        <MUI.Grid item xs={12} md={6}>
                          <MUI.TextField
                            fullWidth
                            label="Residencia"
                            variant="outlined"
                          />
                        </MUI.Grid>
                      </MUI.Grid>
                    </>
                  )}

                  {/* Taller para Tutor */}
                  {selectedRol === 'tutor' && (
                    <MUI.Grid container spacing={2}>
                      <MUI.Grid item xs={12}>
                        <MUI.TextField
                          select
                          fullWidth
                          label="Taller"
                          variant="outlined"
                        >
                          <MUI.MenuItem value="GAT">Gestión Administrativa y Tributaria</MUI.MenuItem>
                          <MUI.MenuItem value="INF">Desarrollo y Administración de Aplicaciones Informática</MUI.MenuItem>
                          <MUI.MenuItem value="CyP">Confección y Patronaje</MUI.MenuItem>
                          <MUI.MenuItem value="EBA">Muebles y Estructura de la Madera</MUI.MenuItem>
                          <MUI.MenuItem value="ELCA">Equipos Electrónicos</MUI.MenuItem>
                          <MUI.MenuItem value="ELDAD">Instalaciones Eléctricas</MUI.MenuItem>
                          <MUI.MenuItem value="AUTO">Electromecánica de Vehículos</MUI.MenuItem>
                          <MUI.MenuItem value="MEC">Mecanizado</MUI.MenuItem>
                        </MUI.TextField>
                      </MUI.Grid>
                    </MUI.Grid>
                  )}

                  {/* Información de Contacto (común para todos) */}
                  <MUI.Typography variant="h6" sx={{ color: '#1a237e', mb: 1, mt: 2 }}>
                    Información de Contacto
                  </MUI.Typography>
                  <MUI.Grid container spacing={2}>
                    <MUI.Grid item xs={12} md={6}>
                      <MUI.TextField
                        fullWidth
                        label="Teléfono"
                        variant="outlined"
                      />
                    </MUI.Grid>
                    <MUI.Grid item xs={12} md={6}>
                      <MUI.TextField
                        fullWidth
                        label="Correo Electrónico"
                        variant="outlined"
                      />
                    </MUI.Grid>
                  </MUI.Grid>
                </>
              )}
            </MUI.Box>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button 
              onClick={() => {
                setOpenDialog(false);
                setSelectedProvincia('');
                setSelectedCiudad('');
                setSelectedSector('');
                setSelectedRol('');
              }}
            >
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b60' } }}
            >
              Registrar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Diálogo para ver los usuarios por rol */}
        <MUI.Dialog 
          open={openRolDialog} 
          onClose={() => {
            setOpenRolDialog(false);
            setSelectedRol(null);
          }} 
          maxWidth="md" 
          fullWidth
        >
          <MUI.DialogTitle>
            {selectedRol ? `b - ${roles.find(t => t.nom === selectedRol)?.desc}` : 'Seleccionar Rol'}
          </MUI.DialogTitle>
          <MUI.DialogContent>
            {!selectedRol ? (
              <MUI.Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Administrador - Botón mediano */}
                <MUI.Grid item xs={12} md={6}>
                  <MUI.Button
                    variant="contained"
                    startIcon={<Icons.AdminPanelSettings />}
                    onClick={() => handleRoleSelection(roles[0].nom)}
                    sx={{
                      width: '100%',
                      py: 2.5,
                      bgcolor: '#1a237e',
                      '&:hover': { 
                        bgcolor: '#0d1b60',
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                      },
                      borderRadius: 4,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <MUI.Box sx={{ textAlign: 'left', width: '100%' }}>
                      <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {roles[0].nom}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {roles[0].desc}
                      </MUI.Typography>
                    </MUI.Box>
                  </MUI.Button>
                </MUI.Grid>

                {/* Supervisor - Botón mediano */}
                <MUI.Grid item xs={12} md={6}>
                  <MUI.Button
                    variant="contained"
                    startIcon={<Icons.SupervisorAccount />}
                    onClick={() => handleRoleSelection(roles[1].nom)}
                    sx={{
                      width: '100%',
                      py: 2.5,
                      bgcolor: '#1a237e',
                      '&:hover': { 
                        bgcolor: '#0d1b60',
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                      },
                      borderRadius: 4,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <MUI.Box sx={{ textAlign: 'left', width: '100%' }}>
                      <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {roles[1].nom}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {roles[1].desc}
                      </MUI.Typography>
                    </MUI.Box>
                  </MUI.Button>
                </MUI.Grid>

                {/* Tutor - Botón mediano */}
                <MUI.Grid item xs={12} md={6}>
                  <MUI.Button
                    variant="contained"
                    startIcon={<Icons.School />}
                    onClick={() => handleRoleSelection(roles[2].nom)}
                    sx={{
                      width: '100%',
                      py: 2.5,
                      bgcolor: '#1a237e',
                      '&:hover': { 
                        bgcolor: '#0d1b60',
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                      },
                      borderRadius: 4,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <MUI.Box sx={{ textAlign: 'left', width: '100%' }}>
                      <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {roles[2].nom}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {roles[2].desc}
                      </MUI.Typography>
                    </MUI.Box>
                  </MUI.Button>
                </MUI.Grid>

                {/* Estudiante - Botón mediano */}
                <MUI.Grid item xs={12} md={6}>
                  <MUI.Button
                    variant="contained"
                    startIcon={<Icons.Person />}
                    onClick={() => handleRoleSelection(roles[3].nom)}
                    sx={{
                      width: '100%',
                      py: 2.5,
                      bgcolor: '#1a237e',
                      '&:hover': { 
                        bgcolor: '#0d1b60',
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                      },
                      borderRadius: 4,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <MUI.Box sx={{ textAlign: 'left', width: '100%' }}>
                      <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {roles[3].nom}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {roles[3].desc}
                      </MUI.Typography>
                    </MUI.Box>
                  </MUI.Button>
                </MUI.Grid>

                {/* Observador - Botón largo */}
                <MUI.Grid item xs={12}>
                  <MUI.Button
                    variant="contained"
                    startIcon={<Icons.Visibility />}
                    onClick={() => handleRoleSelection(roles[4].nom)}
                    sx={{
                      width: '100%',
                      py: 2.5,
                      bgcolor: MUI.alpha(theme.palette.secondary.main, 0.8),
                      color: theme.palette.background.paper,
                      '&:hover': { 
                        bgcolor: MUI.alpha(theme.palette.secondary.main, 1),
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                      },
                      borderRadius: 4,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <MUI.Box sx={{ textAlign: 'left', width: '100%' }}>
                      <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {roles[4].nom}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {roles[4].desc}
                      </MUI.Typography>
                    </MUI.Box>
                  </MUI.Button>
                </MUI.Grid>
              </MUI.Grid>
            ) : (
              <MUI.Box sx={{ mt: 2 }}>
                <MUI.TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar empresa..."
                  sx={{ mb: 2 }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <MUI.InputAdornment position="start">
                        <Icons.Search />
                      </MUI.InputAdornment>
                    ),
                  }}
                />
                <MUI.TableContainer>
                  <MUI.Table>
                    <MUI.TableHead>
                      <MUI.TableRow>
                        <MUI.TableCell>Empresa</MUI.TableCell>
                        <MUI.TableCell>Pasantes</MUI.TableCell>
                        <MUI.TableCell>Estado</MUI.TableCell>
                        <MUI.TableCell>Acciones</MUI.TableCell>
                      </MUI.TableRow>
                    </MUI.TableHead>
                    <MUI.TableBody>
                      {usuariosPorRol[selectedRol]
                        ?.filter(empresa => 
                          empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((empresa) => (
                          <MUI.TableRow key={empresa.id}>
                            <MUI.TableCell>{empresa.nombre}</MUI.TableCell>
                            <MUI.TableCell>{empresa.estudiantes}</MUI.TableCell>
                            <MUI.TableCell>
                              <MUI.Chip
                                label={empresa.estado}
                                color={empresa.estado === 'Activa' ? 'success' : 'default'}
                                size="small"
                              />
                            </MUI.TableCell>
                            <MUI.TableCell>
                              <MUI.IconButton size="small" sx={{ mr: 1 }}>
                                <Icons.Visibility />
                              </MUI.IconButton>
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
              </MUI.Box>
            )}
          </MUI.DialogContent>
          <MUI.DialogActions>
            {selectedRol && (
              <MUI.Button 
                onClick={() => setSelectedRol(null)}
                sx={{ color: '#1a237e' }}
              >
                Volver
              </MUI.Button>
            )}
            <MUI.Button 
              onClick={() => {
                setOpenRolDialog(false);
                setSelectedRol(null);
              }}
            >
              Cerrar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Users;