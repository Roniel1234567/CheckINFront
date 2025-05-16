import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import { 
  CompaniesCRUD, 
  type CentroTrabajo,
  type Provincia,
  type Ciudad,
  type Sector,
  type Taller 
} from '../../../services/CompaniesCRUD';
import { SelectChangeEvent } from '@mui/material';
import { personaContactoEmpresaService } from '../../services/personaContactoEmpresaService';

// Estado inicial del formulario
interface FormData {
  nombre_centro: string;
  telefono_contacto: string;
  email_contacto: string;
  calle_dir: string;
  num_res_dir: string;
  sector_dir: number;
  estado_centro: 'Activo' | 'Inactivo';
  // Persona de contacto empresa
  nombre_persona_contacto: string;
  apellido_persona_contacto: string;
  telefono_persona_contacto: string;
  extension_persona_contacto: string;
  departamento_persona_contacto: string;
}

function Companies() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [centrosTrabajo, setCentrosTrabajo] = useState<CentroTrabajo[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    nombre_centro: '',
    telefono_contacto: '',
    email_contacto: '',
    calle_dir: '',
    num_res_dir: '',
    sector_dir: 0,
    estado_centro: 'Activo',
    nombre_persona_contacto: '',
    apellido_persona_contacto: '',
    telefono_persona_contacto: '',
    extension_persona_contacto: '',
    departamento_persona_contacto: '',
  });
  const [openTallerDialog, setOpenTallerDialog] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [selectedProvincia, setSelectedProvincia] = useState<number | ''>('');
  const [selectedCiudad, setSelectedCiudad] = useState<number | ''>('');
  const [selectedSector, setSelectedSector] = useState<number | ''>('');
  const totalempresas: number = 67;
  const totalemactivos: number = 34;
  const estasignados: number = 121;
  const tallerescub: number = 8;
  const notifications=4; 

  // Estados para ubicaciones
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);

  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar datos iniciales
  const loadCentrosTrabajo = async () => {
    try {
      setLoading(true);
      const data = await CompaniesCRUD.getAllCompanies();
      setCentrosTrabajo(data);
    } catch (error) {
      setError('Error al cargar los centros de trabajo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [centrosData, provinciasData, talleresData] = await Promise.all([
          CompaniesCRUD.getAllCompanies(),
          CompaniesCRUD.getProvincias(),
          CompaniesCRUD.getAllTalleres()
        ]);
        
        setCentrosTrabajo(centrosData);
        setProvincias(provinciasData);
        setTalleres(talleresData);
      } catch (error) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Crear nuevo centro
  const handleCreateCentro = async () => {
    try {
      setLoading(true);
      // 1. Crear el centro de trabajo
      const centroCreado = await CompaniesCRUD.createCompany({
        nombre_centro: formData.nombre_centro,
        estado_centro: 'Activo',
        contacto_centro: {
          telefono_contacto: formData.telefono_contacto,
          email_contacto: formData.email_contacto,
          estado_contacto: 'Activo'
        },
        direccion_centro: {
          sector_dir: formData.sector_dir,
          calle_dir: formData.calle_dir,
          num_res_dir: formData.num_res_dir,
          estado_dir: 'Activo'
        }
      });
      // 2. Crear la persona de contacto empresa usando el id_centro
      await personaContactoEmpresaService.createPersonaContactoEmpresa({
        nombre_persona_contacto: formData.nombre_persona_contacto,
        apellido_persona_contacto: formData.apellido_persona_contacto,
        telefono: formData.telefono_persona_contacto,
        extension: formData.extension_persona_contacto,
        departamento: formData.departamento_persona_contacto,
        centro_trabajo: centroCreado.id_centro
      });
      setSnackbar({
        open: true,
        message: 'Centro y persona de contacto registrados correctamente',
        severity: 'success'
      });
      setOpenDialog(false);
      loadCentrosTrabajo();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al registrar el centro o la persona de contacto',
        severity: 'error'
      });
      setError('Error al crear el centro de trabajo');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar centro
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este centro de trabajo?')) {
      try {
        await CompaniesCRUD.deleteCompany(id);
        loadCentrosTrabajo();
      } catch (error) {
        setError('Error al eliminar el centro de trabajo');
      }
    }
  };

  // Manejar cambios en el formulario
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  // Datos de ejemplo para las tarjetas principales
  const companyStats = [
    {
      title: 'Total Centros de Trabajo',
      value: totalempresas,
      icon: <Icons.Business fontSize="large" />,
      color: '#1a237e',
      description: 'Centros registrados en el sistema'
    },
    {
      title: 'Centros de Trabajo Activos',
      value: totalemactivos,
      icon: <Icons.BusinessCenter fontSize="large" />,
      color: '#1a237e',
      description: 'Centros de trabajo con estudiantes actualmente'
    },
    {
      title: 'Estudiantes Asignados',
      value: estasignados,
      icon: <Icons.School fontSize="large" />,
      color: '#1a237e',
      description: 'Total de estudiantes en centros de trabajo'
    },
    {
      title: 'Talleres Cubiertos',
      value: tallerescub,
      icon: <Icons.Assignment fontSize="large" />,
      color: '#1a237e',
      description: 'Diferentes talleres con centros de trabajo asignadas'
    },
  ];

  // Cargar ciudades cuando se selecciona provincia
  const handleProvinciaChange = async (event: SelectChangeEvent<number | ''>) => {
    const provinciaId = Number(event.target.value);
    setSelectedProvincia(provinciaId);
    setSelectedCiudad('');
    setSelectedSector('');
    setCiudades([]);
    setSectores([]);
    
    if (provinciaId) {
      try {
        setLoading(true);
        const ciudadesData = await CompaniesCRUD.getCiudadesByProvincia(provinciaId);
        setCiudades(ciudadesData);
      } catch (error) {
        console.error('Error loading ciudades:', error);
        setError('Error al cargar las ciudades');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCiudadChange = async (event: SelectChangeEvent<number | ''>) => {
    const ciudadId = Number(event.target.value);
    setSelectedCiudad(ciudadId);
    setSelectedSector('');
    setSectores([]);
    
    if (ciudadId) {
      try {
        setLoading(true);
        const sectoresData = await CompaniesCRUD.getSectoresByCiudad(ciudadId);
        setSectores(sectoresData);
      } catch (error) {
        console.error('Error loading sectores:', error);
        setError('Error al cargar los sectores');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSectorChange = (event: SelectChangeEvent<number | ''>) => {
    const sectorId = Number(event.target.value);
    setSelectedSector(sectorId);
    setFormData(prev => ({
      ...prev,
      sector_dir: sectorId
    }));
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
          Gestión de Centros de Trabajo
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
          Administra los Centros de Trabajo colaboradores y sus asignaciones de estudiantes
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
              Registrar Nuevo Centro de Trabajo
            </MUI.Button>
          </MUI.Grid>
          <MUI.Grid item>
            <MUI.Button
              variant="outlined"
              startIcon={<Icons.Group />}
              sx={{ color: '#1a237e', borderColor: '#1a237e' }}
              onClick={() => setOpenTallerDialog(true)}
            >
              Ver por Taller
            </MUI.Button>
          </MUI.Grid>
        </MUI.Grid>

        {/* Tarjetas de estadísticas */}
        <MUI.Grid container spacing={3} sx={{ mb: 4 }}>
          {companyStats.map((stat, index) => (
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

        {/* Buscador y tabla de Centros de Trabajo */}
        <MUI.Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
          <MUI.Box sx={{ mb: 3 }}>
            <MUI.TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar centro..."
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
                  <MUI.TableCell>Centro</MUI.TableCell>
                  <MUI.TableCell>Pasantes</MUI.TableCell>
                  <MUI.TableCell>Estado</MUI.TableCell>
                  <MUI.TableCell>Acciones</MUI.TableCell>
                </MUI.TableRow>
              </MUI.TableHead>
              <MUI.TableBody>
                {centrosTrabajo
                  .filter(centro => 
                    centro.nombre_centro.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((centro) => (
                    <MUI.TableRow key={centro.id_centro}>
                      <MUI.TableCell>{centro.nombre_centro}</MUI.TableCell>
                      <MUI.TableCell>-</MUI.TableCell>
                      <MUI.TableCell>
                        <MUI.Chip
                          label={centro.estado_centro}
                          color={centro.estado_centro === 'Activo' ? 'success' : 'default'}
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
                        <MUI.IconButton size="small" onClick={() => handleDelete(centro.id_centro)}>
                          <Icons.Delete />
                        </MUI.IconButton>
                      </MUI.TableCell>
                    </MUI.TableRow>
                  ))}
              </MUI.TableBody>
            </MUI.Table>
          </MUI.TableContainer>
        </MUI.Paper>

        {/* Diálogo para registrar nuevo centro de trabajo */}
        <MUI.Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <MUI.DialogTitle>Registrar Nuevo Centro de Trabajo</MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
              {/* Información General */}
              <MUI.Typography variant="h6" sx={{ color: '#1a237e', mb: 1 }}>
                Información General
              </MUI.Typography>
              <MUI.Grid container spacing={2}>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Nombre del Centro"
                    name="nombre_centro"
                    value={formData.nombre_centro}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono_contacto"
                    value={formData.telefono_contacto}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12}>
                  <MUI.TextField
                    fullWidth
                    label="Correo Electrónico"
                    name="email_contacto"
                    value={formData.email_contacto}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
              </MUI.Grid>

              {/* Dirección */}
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
                      <MUI.MenuItem key={provincia.id_prov} value={provincia.id_prov}>
                        {provincia.provincia}
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
                    {ciudades.map((ciudad) => (
                      <MUI.MenuItem key={ciudad.id_ciu} value={ciudad.id_ciu}>
                        {ciudad.ciudad}
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
                    {sectores.map((sector) => (
                      <MUI.MenuItem key={sector.id_sec} value={sector.id_sec}>
                        {sector.sector}
                      </MUI.MenuItem>
                    ))}
                  </MUI.TextField>
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Calle"
                    name="calle_dir"
                    value={formData.calle_dir}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Residencia"
                    name="num_res_dir"
                    value={formData.num_res_dir}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
              </MUI.Grid>

              {/* Persona de Contacto Empresa */}
              <MUI.Typography variant="h6" sx={{ color: '#1a237e', mb: 1, mt: 2 }}>
                Persona de Contacto de la Empresa
              </MUI.Typography>
              <MUI.Grid container spacing={2}>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Nombre"
                    name="nombre_persona_contacto"
                    value={formData.nombre_persona_contacto}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Apellido"
                    name="apellido_persona_contacto"
                    value={formData.apellido_persona_contacto}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono_persona_contacto"
                    value={formData.telefono_persona_contacto}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={3}>
                  <MUI.TextField
                    fullWidth
                    label="Extensión"
                    name="extension_persona_contacto"
                    value={formData.extension_persona_contacto}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={3}>
                  <MUI.TextField
                    fullWidth
                    label="Departamento"
                    name="departamento_persona_contacto"
                    value={formData.departamento_persona_contacto}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </MUI.Grid>
              </MUI.Grid>
            </MUI.Box>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button 
              onClick={() => {
                setOpenDialog(false);
                setSelectedProvincia('');
                setSelectedCiudad('');
                setSelectedSector('');
              }}
            >
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b60' } }}
              onClick={handleCreateCentro}
            >
              Registrar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Diálogo para ver empresas por taller */}
        <MUI.Dialog 
          open={openTallerDialog} 
          onClose={() => {
            setOpenTallerDialog(false);
            setSelectedTaller(null);
          }} 
          maxWidth="md" 
          fullWidth
        >
          <MUI.DialogTitle>
            {selectedTaller ? `Empresas - ${talleres.find(t => t.id_taller === selectedTaller)?.taller}` : 'Seleccionar Taller'}
          </MUI.DialogTitle>
          <MUI.DialogContent>
            {!selectedTaller ? (
              <MUI.Grid container spacing={2} sx={{ mt: 1 }}>
                {talleres.map((taller) => (
                  <MUI.Grid item xs={12} sm={6} md={3} key={taller.id_taller}>
                    <MUI.Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setSelectedTaller(taller.id_taller)}
                      sx={{
                        height: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        borderColor: '#1a237e',
                        color: '#1a237e',
                        '&:hover': {
                          borderColor: '#0d1b60',
                          bgcolor: MUI.alpha('#1a237e', 0.05),
                        }
                      }}
                    >
                      <MUI.Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {taller.id_taller}
                      </MUI.Typography>
                      <MUI.Typography variant="body2" align="center" sx={{ fontSize: '0.75rem' }}>
                        {taller.taller}
                      </MUI.Typography>
                    </MUI.Button>
                  </MUI.Grid>
                ))}
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
                      {empresasPorTaller[selectedTaller]
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
            {selectedTaller && (
              <MUI.Button 
                onClick={() => setSelectedTaller(null)}
                sx={{ color: '#1a237e' }}
              >
                Volver
              </MUI.Button>
            )}
            <MUI.Button 
              onClick={() => {
                setOpenTallerDialog(false);
                setSelectedTaller(null);
              }}
            >
              Cerrar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>
        </MUI.Box>

        {/* Snackbar de feedback */}
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({...snackbar, open: false})}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MUI.Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Companies;