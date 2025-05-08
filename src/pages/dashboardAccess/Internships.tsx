import React, { useState, useEffect } from 'react';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import { 
  internshipService, 
  CentroTrabajo, 
  Taller, 
  Pasantia,
  Provincia,
  Ciudad,
  Sector
} from '../../services/internshipService';

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
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const [centrosTrabajo, setCentrosTrabajo] = useState<CentroTrabajo[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [pasantias, setPasantias] = useState<Pasantia[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [selectedCentro, setSelectedCentro] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nombreCentro, setNombreCentro] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [calle, setCalle] = useState('');
  const [residencia, setResidencia] = useState('');
  const [alerta, setAlerta] = useState<string | null>(null);
  const [openAsignarTaller, setOpenAsignarTaller] = useState(false);
  const [empresaAsignar, setEmpresaAsignar] = useState('');
  const [tallerAsignar, setTallerAsignar] = useState('');
  const [asignarMensaje, setAsignarMensaje] = useState<string | null>(null);
  const [asignarLoading, setAsignarLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        console.log('Cargando datos iniciales...');
        
        const [provinciasData, centrosData, talleresData] = await Promise.all([
          internshipService.getAllProvincias(),
          internshipService.getAllCentrosTrabajo(),
          internshipService.getAllTalleres()
        ]);

        console.log('Provincias cargadas:', provinciasData);
        console.log('Centros cargados:', centrosData);
        console.log('Talleres cargados:', talleresData);

        setProvincias(provinciasData);
        setCentrosTrabajo(centrosData);
        setTalleres(talleresData);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setError('Error al cargar los datos');
      } finally {
      setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Cargar ciudades cuando se selecciona una provincia
  useEffect(() => {
    const cargarCiudades = async () => {
      if (selectedProvincia) {
        try {
          console.log('Cargando ciudades para provincia:', selectedProvincia);
          const ciudadesData = await internshipService.getCiudadesByProvincia(Number(selectedProvincia));
          console.log('Ciudades cargadas:', ciudadesData);
          setCiudades(ciudadesData);
        } catch (error) {
          console.error('Error al cargar ciudades:', error);
        }
      } else {
        setCiudades([]);
      }
    };

    cargarCiudades();
  }, [selectedProvincia]);

  // Cargar sectores cuando se selecciona una ciudad
  useEffect(() => {
    const cargarSectores = async () => {
      if (selectedCiudad) {
        try {
          console.log('Cargando sectores para ciudad:', selectedCiudad);
          const sectoresData = await internshipService.getSectoresByCiudad(Number(selectedCiudad));
          console.log('Sectores cargados:', sectoresData);
          setSectores(sectoresData);
        } catch (error) {
          console.error('Error al cargar sectores:', error);
        }
      } else {
        setSectores([]);
      }
    };

    cargarSectores();
  }, [selectedCiudad]);

  // Manejar el cambio de tamaño de la ventana
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDiaChange = (diaId: string) => {
    setDiasSeleccionados(prev => 
      prev.includes(diaId) 
        ? prev.filter(dia => dia !== diaId)
        : [...prev, diaId]
    );
  };

  const handleCrearPasantia = async () => {
    try {
      setLoading(true);
      const centroSeleccionado = centrosTrabajo.find(c => c.id_centro.toString() === selectedCentro);
      
      if (!centroSeleccionado) {
        throw new Error('Centro de trabajo no encontrado');
      }

      const nuevaPasantia = {
        estudiante: selectedEstudiante,
        centro: centroSeleccionado,
        supervisor: selectedSupervisor,
        fecha_inicio: new Date(fechaInicio),
        dias_pasantia: diasSeleccionados,
        estado_pasantia: 'Activo' as const
      };

      await internshipService.createPasantia(nuevaPasantia);
      setOpenDialog(false);
      
      // Limpiar el formulario
      setSelectedEstudiante('');
      setSelectedCentro('');
      setSelectedSupervisor('');
      setSelectedProvincia('');
      setSelectedCiudad('');
      setSelectedSector('');
      setFechaInicio('');
      setDiasSeleccionados([]);

      // Recargar datos
      const [centrosData, pasantiasData] = await Promise.all([
        internshipService.getAllCentrosTrabajo(),
        internshipService.getAllPasantias()
      ]);
      setCentrosTrabajo(centrosData);
      setPasantias(pasantiasData);
    } catch (err) {
      setError('Error al crear la pasantía');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarPasantia = async (id: number) => {
    try {
      setLoading(true);
      await internshipService.deletePasantia(id);
      const pasantiasData = await internshipService.getAllPasantias();
      setPasantias(pasantiasData);
    } catch (err) {
      setError('Error al eliminar la pasantía');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pasantías según el término de búsqueda
  const pasantiasFiltradas = pasantias.filter(pasantia =>
    pasantia.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pasantia.centro.nombre_centro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pasantia.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Datos para las tarjetas de estadísticas
  const stats = [
    {
      title: 'Pasantías en Curso',
      value: pasantias.filter(p => p.estado_pasantia === 'Activo').length,
      icon: <Icons.Assignment fontSize="large" />,
      color: '#1a237e',
      description: 'Total de pasantías activas'
    },
    {
      title: 'Pasantías Completadas',
      value: pasantias.filter(p => p.estado_pasantia === 'Completada').length,
      icon: <Icons.Assignment fontSize="large" />,
      color: '#283593',
      description: 'Total de pasantías completadas'
    },
    {
      title: 'Empresas Asociadas',
      value: centrosTrabajo.length,
      icon: <Icons.Business fontSize="large" />,
      color: '#3949ab',
      description: 'Centros de trabajo colaboradores'
    }
  ];

  const handleRegistrarCentro = async () => {
    try {
      setLoading(true);
      setAlerta(null);
      if (!nombreCentro || !calle || !residencia || !telefono || !correo || !selectedSector) {
        setAlerta('Por favor, completa todos los campos obligatorios.');
        setLoading(false);
        return;
      }

      // Construye el objeto de dirección y contacto
      const direccion = {
        calle_dir: calle,
        num_res_dir: residencia,
        sector_dir: Number(selectedSector),
        estado_dir: "Activo",
        creacion_dir: new Date()
      };

      const contacto = {
        telefono_contacto: telefono,
        email_contacto: correo,
        estado_contacto: "Activo",
        creacion_contacto: new Date()
      };

      // Construye el objeto de centro de trabajo
      const nuevoCentro = {
        nombre_centro: nombreCentro,
        direccion,
        contacto,
        estado_centro: "Activo",
        creacion_centro: new Date()
      };

      console.log('OBJETO QUE SE ENVÍA:', nuevoCentro);
      await internshipService.createCentroTrabajo(nuevoCentro);
      setAlerta('Centro de trabajo registrado correctamente');
      // Limpiar el formulario
      setNombreCentro('');
      setTelefono('');
      setCorreo('');
      setCalle('');
      setResidencia('');
      setSelectedProvincia('');
      setSelectedCiudad('');
      setSelectedSector('');
      // Recargar centros de trabajo
      const centrosData = await internshipService.getAllCentrosTrabajo();
      setCentrosTrabajo(centrosData);
    } catch (error) {
      setAlerta('Error al registrar el centro de trabajo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MUI.Box sx={{ display: 'flex', width:'100vw',minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p:0}}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar notifications={4} toggleDrawer={toggleDrawer} />

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

        {error && (
          <MUI.Alert severity="error" sx={{ m: 2 }}>
            {error}
          </MUI.Alert>
        )}

        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: theme.palette.primary.main }}>
            Gestión de Pasantías
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Administra las pasantías y su seguimiento
          </MUI.Typography>

          {/* Bloque de botones principales */}
          <MUI.Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 4 }}>
            <MUI.Button
              variant="contained"
              color="primary"
              startIcon={<Icons.Add />}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
              onClick={() => setOpenDialog(true)}
            >
              Registrar Nuevo Centro de Trabajo
            </MUI.Button>
            <MUI.Button
              variant="outlined"
              startIcon={<Icons.Group />}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
              // Aquí va la lógica de Ver por Taller
            >
              Ver por Taller
            </MUI.Button>
            <MUI.Button
              variant="contained"
              color="secondary"
              startIcon={<Icons.Link />}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
              onClick={() => setOpenAsignarTaller(true)}
            >
              Asignar Taller
            </MUI.Button>
          </MUI.Box>

          {/* Tarjetas de estadísticas */}
          <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
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
          </MUI.Grid>

          {/* Tabla de pasantías */}
          <MUI.Grid container spacing={3}>
            <MUI.Grid item xs={12}>
            <MUI.Paper sx={{ p: 3, borderRadius: 4 }}>
                <MUI.Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    sx={{ mr: 2 }}
                  />
                  <MUI.Button
                    variant="contained"
                    startIcon={<Icons.Add />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b60' } }}
                  >
                    Nueva Pasantía
                  </MUI.Button>
              </MUI.Box>

              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow>
                        <MUI.TableCell>ID</MUI.TableCell>
                      <MUI.TableCell>Estudiante</MUI.TableCell>
                      <MUI.TableCell>Centro</MUI.TableCell>
                        <MUI.TableCell>Ubicación</MUI.TableCell>
                      <MUI.TableCell>Supervisor</MUI.TableCell>
                        <MUI.TableCell>Estado</MUI.TableCell>
                      <MUI.TableCell>Acciones</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                      {pasantiasFiltradas.map((pasantia) => (
                        <MUI.TableRow key={pasantia.id_pasantia}>
                          <MUI.TableCell>{pasantia.id_pasantia}</MUI.TableCell>
                        <MUI.TableCell>{pasantia.estudiante}</MUI.TableCell>
                          <MUI.TableCell>{pasantia.centro.nombre_centro}</MUI.TableCell>
                          <MUI.TableCell>
                            {sectores.find(s => s.id_sec === pasantia.centro.direccion.sector_dir)?.nombre_sec || 'N/A'} -
                            {ciudades.find(c => c.id_ciu === (sectores.find(s => s.id_sec === pasantia.centro.direccion.sector_dir)?.ciudad_sec))?.ciudad || 'N/A'} -
                            {provincias.find(p => p.id_prov === (
                              ciudades.find(c => c.id_ciu === (sectores.find(s => s.id_sec === pasantia.centro.direccion.sector_dir)?.ciudad_sec))?.provincia_ciu
                            ))?.provincia || 'N/A'}
                          </MUI.TableCell>
                        <MUI.TableCell>{pasantia.supervisor}</MUI.TableCell>
                          <MUI.TableCell>
                            <MUI.Chip
                              label={pasantia.estado_pasantia}
                              color={
                                pasantia.estado_pasantia === 'Activo' ? 'success' :
                                pasantia.estado_pasantia === 'Completada' ? 'primary' : 'error'
                              }
                            />
                          </MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.IconButton size="small" sx={{ mr: 1 }}>
                            <Icons.Edit />
                          </MUI.IconButton>
                            <MUI.IconButton 
                              size="small"
                              onClick={() => handleEliminarPasantia(pasantia.id_pasantia)}
                            >
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
            setSelectedProvincia('');
            setSelectedCiudad('');
            setSelectedSector('');
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
                {talleres.map((taller) => (
                  <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                    {taller.nombre_taller} - {taller.familia_taller.nombre_fam}
                  </MUI.MenuItem>
                ))}
              </MUI.TextField>

              {/* Provincia */}
              <MUI.FormControl fullWidth margin="normal">
                <MUI.InputLabel>Provincia</MUI.InputLabel>
                <MUI.Select
                  value={selectedProvincia}
                  onChange={(e) => {
                    setSelectedProvincia(e.target.value);
                    setSelectedCiudad('');
                    setSelectedSector('');
                  }}
                  label="Provincia"
                >
                  <MUI.MenuItem value="">
                    <em>Seleccione una provincia</em>
                  </MUI.MenuItem>
                  {provincias.map((provincia) => (
                    <MUI.MenuItem key={provincia.id_prov} value={provincia.id_prov}>
                      {provincia.provincia}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>

              {/* Ciudad */}
              <MUI.FormControl fullWidth margin="normal">
                <MUI.InputLabel>Ciudad</MUI.InputLabel>
                <MUI.Select
                  value={selectedCiudad}
                  onChange={(e) => {
                    setSelectedCiudad(e.target.value);
                    setSelectedSector('');
                  }}
                  label="Ciudad"
                  disabled={!selectedProvincia}
                >
                  <MUI.MenuItem value="">
                    <em>Seleccione una ciudad</em>
                  </MUI.MenuItem>
                  {ciudades.map((ciudad) => (
                    <MUI.MenuItem key={ciudad.id_ciu} value={ciudad.id_ciu}>
                      {ciudad.ciudad}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>

              {/* Sector */}
              <MUI.FormControl fullWidth margin="normal">
                <MUI.InputLabel>Sector</MUI.InputLabel>
                <MUI.Select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  label="Sector"
                  disabled={!selectedCiudad}
                >
                  <MUI.MenuItem value="">
                    <em>Seleccione un sector</em>
                  </MUI.MenuItem>
                  {sectores.map((sector) => (
                    <MUI.MenuItem key={sector.id_sec} value={sector.id_sec}>
                      {sector.nombre_sec}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>

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
                  <MUI.MenuItem key={centro.id_centro} value={centro.id_centro}>
                    {centro.nombre_centro} - {centro.direccion.calle_dir}
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
                {centrosTrabajo.map((centro) => (
                  <MUI.MenuItem key={centro.id_centro} value={centro.contacto.email_contacto}>
                    {centro.contacto.email_contacto}
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
                setSelectedProvincia('');
                setSelectedCiudad('');
                setSelectedSector('');
                setFechaInicio('');
                setDiasSeleccionados([]);
              }}
            >
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              onClick={handleCrearPasantia}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b60' } }}
            >
              Crear Pasantía
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {alerta && (
          <MUI.Alert severity={alerta.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
            {alerta}
          </MUI.Alert>
        )}
        </MUI.Box>

        <MUI.Dialog open={openAsignarTaller} onClose={() => {
          setOpenAsignarTaller(false);
          setEmpresaAsignar('');
          setTallerAsignar('');
          setAsignarMensaje(null);
        }} maxWidth="xs" fullWidth>
          <MUI.DialogTitle>Asignar Taller a Empresa</MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <MUI.FormControl fullWidth>
                <MUI.InputLabel>Empresa</MUI.InputLabel>
                <MUI.Select
                  value={empresaAsignar}
                  onChange={e => setEmpresaAsignar(e.target.value)}
                  label="Empresa"
                >
                  <MUI.MenuItem value="">
                    <em>Seleccione una empresa</em>
                  </MUI.MenuItem>
                  {centrosTrabajo.map(centro => (
                    <MUI.MenuItem key={centro.id_centro} value={centro.id_centro}>
                      {centro.nombre_centro}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>
              <MUI.FormControl fullWidth>
                <MUI.InputLabel>Taller</MUI.InputLabel>
                <MUI.Select
                  value={tallerAsignar}
                  onChange={e => setTallerAsignar(e.target.value)}
                  label="Taller"
                >
                  <MUI.MenuItem value="">
                    <em>Seleccione un taller</em>
                  </MUI.MenuItem>
                  {talleres.map(taller => (
                    <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                      {taller.nombre_taller} - {taller.familia_taller.nombre_fam}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>
              {asignarMensaje && (
                <MUI.Alert severity={asignarMensaje.includes('Error') ? 'error' : 'success'}>
                  {asignarMensaje}
                </MUI.Alert>
              )}
            </MUI.Box>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={() => setOpenAsignarTaller(false)}>
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              color="primary"
              disabled={asignarLoading || !empresaAsignar || !tallerAsignar}
              onClick={async () => {
                setAsignarLoading(true);
                setAsignarMensaje(null);
                try {
                  await internshipService.asignarTallerCentro({
                    id_taller: Number(tallerAsignar),
                    id_centro: Number(empresaAsignar)
                  });
                  setAsignarMensaje('Taller asignado correctamente a la empresa.');
                  setEmpresaAsignar('');
                  setTallerAsignar('');
                } catch (err: any) {
                  setAsignarMensaje('Error al asignar taller: ' + (err?.response?.data?.message || 'Error desconocido'));
                } finally {
                  setAsignarLoading(false);
                }
              }}
            >
              Asignar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
      </MUI.Box>
  );
}

export default Internships;