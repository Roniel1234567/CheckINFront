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
import contactService from '../../services/contactService';
import { userService } from '../../services/userService';
import direccionService from '../../services/direccionService';
import axios from 'axios';
import { authService } from '../../services/authService';
import { internshipService } from '../../services/internshipService';
import { useReadOnlyMode } from '../../hooks/useReadOnlyMode';

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
  // Usuario empresa
  usuario_empresa: string;
  contrasena_empresa: string;
}

function Companies() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [centrosTrabajo, setCentrosTrabajo] = useState<CentroTrabajo[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCentro, setEditingCentro] = useState<any>(null);
  const [openValidarEmpresas, setOpenValidarEmpresas] = useState(false);
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
    usuario_empresa: '',
    contrasena_empresa: '',
  });
  const [openTallerDialog, setOpenTallerDialog] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [selectedProvincia, setSelectedProvincia] = useState<number | ''>('');
  const [selectedCiudad, setSelectedCiudad] = useState<number | ''>('');
  const [selectedSector, setSelectedSector] = useState<number | ''>('');
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

  const [nombreCentroDisponible, setNombreCentroDisponible] = useState(true);
  const [telefonoDisponible, setTelefonoDisponible] = useState(true);
  const [emailDisponible, setEmailDisponible] = useState(true);

  const [error, setError] = useState<string>('');

  // 1. Estado para usuarioEmpresaDisponible
  const [usuarioEmpresaDisponible, setUsuarioEmpresaDisponible] = useState(true);

  // 1. Estados para edición, visualización y eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centroToDelete, setCentroToDelete] = useState<unknown>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewCentro, setViewCentro] = useState<unknown>(null);

  // Límites de caracteres para dirección
  const MAX_CALLE = 50;
  const MAX_NUM_RES = 20;

  // Variable de validación para dirección
  const direccionInvalida =
    formData.calle_dir.length > MAX_CALLE ||
    formData.num_res_dir.length > MAX_NUM_RES;

  // Obtener usuario actual
  const user = authService.getCurrentUser();
  const esEmpresa = user && user.rol === 2;

  const isReadOnly = useReadOnlyMode();

  const commonSelectStyles = {
    minWidth: '350px',
    '& .MuiSelect-select': {
      padding: '16px 14px',
      minHeight: '25px',
      display: 'flex',
      alignItems: 'center'
    }
  };

  const commonMenuProps = {
    PaperProps: {
      sx: {
        maxHeight: 300,
        width: '350px',
        '& .MuiMenuItem-root': {
          padding: '12px 24px'
        }
      }
    }
  };

  // 2. Función para chequear usuario de empresa
  const checkUsuarioEmpresa = async (usuario: string) => {
    if (!usuario) return;
    try {
      await userService.getUserByUsername(usuario);
      setUsuarioEmpresaDisponible(false); // Si existe, no está disponible
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setUsuarioEmpresaDisponible(true); // No existe, está disponible
      } else {
        setUsuarioEmpresaDisponible(true); // Si hay error de red, asume disponible
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setEditingCentro(null);
    loadCentrosTrabajo();
  };

  const [showHistorial, setShowHistorial] = useState(false);
  const [restaurando, setRestaurando] = useState<number | null>(null);

  // Filtrar empresas eliminadas
  const empresasEliminadas = centrosTrabajo.filter(
    centro => (centro as any).usuario?.estado_usuario === 'Eliminado'
  );

  // Cargar datos iniciales
  const loadCentrosTrabajo = async () => {
    try {
      setLoading(true);
      const data = await CompaniesCRUD.getAllCompanies();
      setCentrosTrabajo(data);
      console.log('Centros de trabajo recibidos:', data);
    } catch {
      if (setError) setError('Error al cargar los centros de trabajo');
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
      } catch {
        if (setError) setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Crear o editar centro
  const handleSaveCentro = async () => {
    if (isReadOnly) return;
    try {
      setLoading(true);
      if (editMode && editingCentro) {
        // --- MODO EDICIÓN ---
        // 1. Actualizar usuario de empresa (solo si cambió usuario o contraseña)
        if (editingCentro.usuario && (formData.usuario_empresa !== editingCentro.usuario.dato_usuario || formData.contrasena_empresa)) {
          await userService.updateUser(editingCentro.usuario.id_usuario, {
            dato_usuario: formData.usuario_empresa,
            contrasena_usuario: formData.contrasena_empresa || undefined,
            rol_usuario: 2, // Siempre empresa
          });
        }
        // 2. Actualizar centro de trabajo (incluyendo persona de contacto de empresa)
        await CompaniesCRUD.updateCompany(editingCentro.id_centro, {
          nombre_centro: formData.nombre_centro,
          estado_centro: formData.estado_centro,
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
          },
          persona_contacto_empresa: {
            nombre_persona_contacto: formData.nombre_persona_contacto,
            apellido_persona_contacto: formData.apellido_persona_contacto,
            telefono: formData.telefono_persona_contacto,
            extension: formData.extension_persona_contacto,
            departamento: formData.departamento_persona_contacto
          }
        });
        setSnackbar({
          open: true,
          message: 'Centro actualizado correctamente',
          severity: 'success'
        });
        setOpenDialog(false);
        loadCentrosTrabajo();
      } else {
        // --- MODO REGISTRO ---
        // 1. Crear usuario de empresa
        const nuevoUsuario = await userService.createUser({
          dato_usuario: formData.usuario_empresa,
          contrasena_usuario: formData.contrasena_empresa,
          rol_usuario: 2, // SIEMPRE 2 para empresa
        });
        const usuarioCreado = Array.isArray(nuevoUsuario) ? nuevoUsuario[0] : nuevoUsuario;
        const idUsuario = usuarioCreado.id_usuario;

        // 2. Crear el centro de trabajo con el id_usu
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
          },
          id_usu: idUsuario // <-- Relacionar el usuario creado
      });

        // 3. Crear la persona de contacto empresa usando el id_centro
        const personaContactoPayload = {
        nombre_persona_contacto: formData.nombre_persona_contacto,
        apellido_persona_contacto: formData.apellido_persona_contacto,
        telefono: formData.telefono_persona_contacto,
        extension: formData.extension_persona_contacto,
        departamento: formData.departamento_persona_contacto,
        centro_trabajo: centroCreado.id_centro
        };
        await personaContactoEmpresaService.createPersonaContactoEmpresa(personaContactoPayload);

      setSnackbar({
        open: true,
          message: 'Centro, usuario y persona de contacto registrados correctamente',
        severity: 'success'
      });
      setOpenDialog(false);
      loadCentrosTrabajo();
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Error al registrar o actualizar el centro',
        severity: 'error'
      });
      if (setError) setError(error?.response?.data?.message || 'Error al crear o actualizar el centro de trabajo');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handler para editar
  const handleEditClick = async (centro: unknown) => {
    if (isReadOnly) return;
    setEditMode(true);
    setEditingCentro(centro);
    setOpenDialog(true);

    // 1. Cargar datos de persona de contacto de empresa
    let personaContacto = null;
    try {
      // @ts-expect-error: centro puede ser any
      personaContacto = await personaContactoEmpresaService.getPersonaContactoByCentro((centro as any).id_centro);
    } catch {
      personaContacto = null;
    }

    // 2. Cargar dirección completa (sector, ciudad, provincia) igual que en Students.tsx
    let direccionCompleta: unknown = null;
    try {
      // @ts-expect-error: centro puede ser any
      direccionCompleta = await direccionService.getDireccionByCentro((centro as any).id_centro);
    } catch {
      direccionCompleta = null;
    }

    let provinciaId = '';
    let ciudadId = '';
    let sectorId = '';
    if (direccionCompleta && direccionCompleta.sector_dir) {
      sectorId = String(direccionCompleta.sector_dir.id_sec);
      ciudadId = String(direccionCompleta.sector_dir.ciudad_sec || direccionCompleta.sector_dir.ciudad?.id_ciu || '');
      provinciaId = String(direccionCompleta.sector_dir.ciudad?.provincia_ciu || '');
    }

    // Cargar provincias si no están cargadas
    if (!provincias.length) {
      const provinciasData = await CompaniesCRUD.getProvincias();
      setProvincias(provinciasData);
    }

    // Cargar ciudades y sectores igual que en Students.tsx
    let ciudadesProv = [];
    let sectoresCiudad = [];
    if (provinciaId) {
      ciudadesProv = await CompaniesCRUD.getCiudadesByProvincia(Number(provinciaId));
      setCiudades(ciudadesProv);
      if (ciudadId) {
        sectoresCiudad = await CompaniesCRUD.getSectoresByCiudad(Number(ciudadId));
        setSectores(sectoresCiudad);
      }
    }
    setSelectedProvincia(provinciaId ? Number(provinciaId) : '');
    setSelectedCiudad(ciudadId ? Number(ciudadId) : '');
    setSelectedSector(sectorId ? Number(sectorId) : '');

    // Tipar personaContacto como any para evitar errores de acceso
    const pc: any = personaContacto || {};

    setFormData({
      nombre_centro: centro.nombre_centro || '',
      telefono_contacto: centro.contacto_centro?.telefono_contacto || '',
      email_contacto: centro.contacto_centro?.email_contacto || '',
      calle_dir: direccionCompleta?.calle_dir || centro.direccion_centro?.calle_dir || '',
      num_res_dir: direccionCompleta?.num_res_dir || centro.direccion_centro?.num_res_dir || '',
      sector_dir: sectorId ? Number(sectorId) : 0,
      estado_centro: centro.estado_centro || 'Activo',
      nombre_persona_contacto: pc.nombre_persona_contacto || '',
      apellido_persona_contacto: pc.apellido_persona_contacto || '',
      telefono_persona_contacto: pc.telefono || '',
      extension_persona_contacto: pc.extension || '',
      departamento_persona_contacto: pc.departamento || '',
      usuario_empresa: (centro as any).usuario?.dato_usuario || '',
      contrasena_empresa: '',
    });
  };

  // 3. Handler para ver
  const handleViewClick = (centro: unknown) => {
    setViewCentro(centro);
    setOpenViewDialog(true);
  };

  // 4. Handler para eliminar
  const handleDeleteClick = (centro: unknown) => {
    if (isReadOnly) return;
    setCentroToDelete(centro);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (centroToDelete && centroToDelete.usuario && centroToDelete.usuario.id_usuario) {
      await userService.updateUser(centroToDelete.usuario.id_usuario, { estado_usuario: 'Eliminado' });
      setSnackbar({ open: true, message: 'Centro eliminado correctamente', severity: 'success' });
      setDeleteDialogOpen(false);
      setCentroToDelete(null);
      loadCentrosTrabajo();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCentroToDelete(null);
  };

  // Filtrar solo empresas con usuario activo y validación 'Aceptada'
  let empresasFiltradas = centrosTrabajo.filter(
    centro => centro.usuario?.estado_usuario === 'Activo' && centro.validacion === 'Aceptada'
  );
  if (esEmpresa && user) {
    empresasFiltradas = empresasFiltradas.filter(centro => centro.usuario?.id_usuario === user.id_usuario);
  }

  // Manejar cambios en el formulario
  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'nombre_centro') checkNombreCentro(value);
    if (name === 'telefono_contacto') checkTelefono(value);
    if (name === 'email_contacto') checkEmail(value);
  };

  const checkNombreCentro = async (nombre: string) => {
    if (!nombre) {
      setNombreCentroDisponible(true);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/centros-trabajo/existe-nombre/${encodeURIComponent(nombre)}`);
      const data = await res.json();
      setNombreCentroDisponible(!data.exists);
    } catch {
      setNombreCentroDisponible(true); // Si hay error, asume disponible
    }
  };

  const checkTelefono = async (telefono: string) => {
    if (!telefono) return;
    try {
      const data = await contactService.existeTelefonoContacto(telefono);
      setTelefonoDisponible(!data.exists);
    } catch {
      setTelefonoDisponible(true);
    }
  };

  const checkEmail = async (email: string) => {
    if (!email) return;
    try {
      const data = await contactService.existeEmailContacto(email);
      setEmailDisponible(!data.exists);
    } catch {
      setEmailDisponible(true);
    }
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

  // Estados para las métricas
  const [totalEmpresas, setTotalEmpresas] = useState(0);
  const [totalEmpresasActivas, setTotalEmpresasActivas] = useState(0);
  const [talleresCubiertos, setTalleresCubiertos] = useState(0);
  const [estudiantesAsignados, setEstudiantesAsignados] = useState(0);

  // useEffect para cargar los datos reales
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const empresas = await CompaniesCRUD.getAllCompanies();
        setTotalEmpresas(empresas.length);
        setTotalEmpresasActivas(empresas.filter(e => e.validacion === 'Aceptada').length);
        const talleres = await CompaniesCRUD.getAllTalleres();
        setTalleresCubiertos(talleres.length);
        // Estudiantes asignados (pasantías en proceso)
        const pasantias = await internshipService.getAllPasantias();
        setEstudiantesAsignados(pasantias.filter(p => p.estado_pas === 'En Proceso').length);
      } catch {
        setTotalEmpresas(0);
        setTotalEmpresasActivas(0);
        setTalleresCubiertos(0);
        setEstudiantesAsignados(0);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // companyStats ahora usa los estados:
  const companyStats = [
    {
      title: 'Total Centros de Trabajo',
      value: totalEmpresas,
      icon: <Icons.Business fontSize="large" />,
      color: '#1a237e',
      description: 'Centros registrados en el sistema'
    },
    {
      title: 'Centros de Trabajo Aceptados',
      value: totalEmpresasActivas,
      icon: <Icons.BusinessCenter fontSize="large" />,
      color: '#1a237e',
      description: 'Centros de trabajo con validación aceptada'
    },
    {
      title: 'Estudiantes Asignados',
      value: estudiantesAsignados,
      icon: <Icons.School fontSize="large" />,
      color: '#1a237e',
      description: 'Total de estudiantes en pasantía en proceso'
    },
    {
      title: 'Talleres Cubiertos',
      value: talleresCubiertos,
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
      } catch {
        console.error('Error loading ciudades:', error);
        if (setError) setError('Error al cargar las ciudades');
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
      } catch {
        console.error('Error loading sectores:', error);
        if (setError) setError('Error al cargar los sectores');
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

  // Agregar estados para las empresas por estado de validación
  const [empresasAceptadas, setEmpresasAceptadas] = useState<CentroTrabajo[]>([]);
  const [empresasRechazadas, setEmpresasRechazadas] = useState<CentroTrabajo[]>([]);
  const [empresasPendientes, setEmpresasPendientes] = useState<CentroTrabajo[]>([]);
  const [tabValue, setTabValue] = useState(0);

  // Modificar cargarEmpresas para cargar todos los estados
  const cargarEmpresas = async () => {
    try {
      const [pendientesRes, aceptadasRes, rechazadasRes] = await Promise.all([
        fetch('http://localhost:5000/api/centros-trabajo/pendientes'),
        fetch('http://localhost:5000/api/centros-trabajo/validacion/aceptadas'),
        fetch('http://localhost:5000/api/centros-trabajo/validacion/rechazadas')
      ]);

      const [pendientes, aceptadas, rechazadas] = await Promise.all([
        pendientesRes.json(),
        aceptadasRes.json(),
        rechazadasRes.json()
      ]);

      setEmpresasPendientes(pendientes);
      setEmpresasAceptadas(aceptadas);
      setEmpresasRechazadas(rechazadas);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      setEmpresasPendientes([]);
      setEmpresasAceptadas([]);
      setEmpresasRechazadas([]);
    }
  };

  useEffect(() => {
    if (openValidarEmpresas) {
      cargarEmpresas();
    }
  }, [openValidarEmpresas]);

  const handleValidarCentro = async (id: number, estado: 'Aceptada' | 'Rechazada' | 'Pendiente') => {
    if (isReadOnly) return;
    try {
      await axios.put(`http://localhost:5000/api/centros-trabajo/${id}/validar`, {
        validacion: estado
      });
      cargarEmpresas();
      loadCentrosTrabajo();
    } catch (error) {
      console.error('Error al validar centro:', error);
    }
  };

  // Función para filtrar empresas basado en el término de búsqueda
  const filtrarEmpresas = (empresas: CentroTrabajo[]) => {
    return empresas.filter(empresa => 
      empresa.nombre_centro.toLowerCase().includes(searchTerm.toLowerCase())
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
          {!esEmpresa && (
            <>
              <MUI.Grid item>
                <MUI.Button
                  variant="contained"
                  startIcon={<Icons.Add />}
                  sx={{
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#0d1b60' }
                  }}
                  onClick={() => {
                    if (!isReadOnly) {
                      setOpenDialog(true);
                      setEditMode(false);
                      setEditingCentro(null);
                      setFormData({
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
                        usuario_empresa: '',
                        contrasena_empresa: '',
                      });
                      setSelectedProvincia('');
                      setSelectedCiudad('');
                      setSelectedSector('');
                    }
                  }}
                  disabled={isReadOnly}
                >
                  Registrar Nuevo Centro de Trabajo
                </MUI.Button>
              </MUI.Grid>
              <MUI.Grid item>
                <MUI.Button
                  variant="outlined"
                  startIcon={<Icons.History />}
                  sx={{ color: '#1a237e', borderColor: '#1a237e' }}
                  onClick={() => setShowHistorial(!showHistorial)}
                >
                  {showHistorial ? 'Volver' : 'Historial'}
                </MUI.Button>
              </MUI.Grid>
              <MUI.Grid item>
                <MUI.Button
                  variant="contained"
                  color="warning"
                  onClick={() => setOpenValidarEmpresas(true)}
                  sx={{ mb: 2 }}
                >
                  Validar empresas
                </MUI.Button>
              </MUI.Grid>
            </>
          )}
        </MUI.Grid>

        {/* Tarjetas de estadísticas */}
        <MUI.Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center" alignItems="stretch">
          {companyStats.map((stat, index) => (
            <MUI.Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
              <MUI.Zoom in={!loading} style={{ transitionDelay: `${index * 100}ms` }}>
                <MUI.Card
                  sx={{
                    width: '280px',
                    height: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${MUI.alpha(stat.color, 0.05)} 0%, #ffffff 100%)`,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    m: 'auto',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 30px ${MUI.alpha(stat.color, 0.2)}`,
                      '& .stat-icon': {
                        transform: 'rotate(10deg) scale(1.1)',
                      },
                      '& .stat-value': {
                        transform: 'scale(1.1)',
                        color: stat.color,
                      },
                      '& .card-glow': {
                        opacity: 1,
                      },
                      '& .stat-title': {
                        color: stat.color,
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                      opacity: 0.7,
                    }
                  }}
                >
                  <MUI.Box
                    className="card-glow"
                    sx={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: `radial-gradient(circle, ${MUI.alpha(stat.color, 0.1)} 0%, transparent 70%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease-in-out',
                      pointerEvents: 'none',
                    }}
                  />
                  <MUI.Box
                    className="stat-icon"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${MUI.alpha(stat.color, 0.2)} 0%, ${MUI.alpha(stat.color, 0.1)} 100%)`,
                      color: stat.color,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '& > svg': {
                        fontSize: '2rem',
                      }
                    }}
                  >
                    {stat.icon}
                  </MUI.Box>
                  <MUI.CardContent 
                    sx={{ 
                      p: 3, 
                      position: 'relative', 
                      zIndex: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <MUI.Box>
                      <MUI.Typography 
                        className="stat-value"
                        variant="h3" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1, 
                          color: 'text.primary',
                          fontSize: '2.5rem',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'inline-block',
                        }}
                      >
                        {stat.value}
                      </MUI.Typography>
                      <MUI.Typography 
                        className="stat-title"
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'medium', 
                          mb: 1,
                          fontSize: '1.1rem',
                          lineHeight: 1.2,
                          transition: 'color 0.3s ease-in-out',
                          color: 'text.primary',
                        }}
                      >
                        {stat.title}
                      </MUI.Typography>
                    </MUI.Box>
                    <MUI.Typography 
                      variant="body2" 
                      sx={{
                        mt: 2,
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -24,
                          top: '50%',
                          width: 16,
                          height: 2,
                          background: MUI.alpha(stat.color, 0.5),
                          transform: 'translateY(-50%)',
                        }
                      }}
                    >
                      {stat.description}
                    </MUI.Typography>
                  </MUI.CardContent>
                </MUI.Card>
              </MUI.Zoom>
            </MUI.Grid>
          ))}
        </MUI.Grid>

        {/* Buscador y tabla de Centros de Trabajo */}
        {showHistorial ? (
          <MUI.Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
            <MUI.Typography variant="h6" sx={{ mb: 2 }}>Centros de Trabajo Eliminados</MUI.Typography>
            <MUI.TableContainer>
              <MUI.Table>
                <MUI.TableHead>
                  <MUI.TableRow>
                    <MUI.TableCell>Centro</MUI.TableCell>
                    <MUI.TableCell>Estado</MUI.TableCell>
                    <MUI.TableCell>Usuario</MUI.TableCell>
                    <MUI.TableCell>Acciones</MUI.TableCell>
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {empresasEliminadas.map((centro) => (
                    <MUI.TableRow key={centro.id_centro}>
                      <MUI.TableCell>{centro.nombre_centro}</MUI.TableCell>
                      <MUI.TableCell>
                        <MUI.Chip label="Eliminado" color="error" size="small" />
                      </MUI.TableCell>
                      <MUI.TableCell>{centro.usuario?.dato_usuario || '-'}</MUI.TableCell>
                      <MUI.TableCell>
                        <MUI.IconButton
                          color="success"
                          disabled={restaurando === centro.id_centro}
                          onClick={async () => {
                            setRestaurando(centro.id_centro);
                            try {
                              await userService.updateUser(centro.usuario.id_usuario, { estado_usuario: 'Activo' });
                              setSnackbar({ open: true, message: 'Centro restaurado correctamente', severity: 'success' });
                              loadCentrosTrabajo();
                            } catch {
                              setSnackbar({ open: true, message: 'Error al restaurar centro', severity: 'error' });
                            }
                            setRestaurando(null);
                          }}
                        >
                          <Icons.Restore />
                        </MUI.IconButton>
                      </MUI.TableCell>
                    </MUI.TableRow>
                  ))}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.TableContainer>
          </MUI.Paper>
        ) : (
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
                  {empresasFiltradas
                    .filter(centro => centro.nombre_centro.toLowerCase().includes(searchTerm.toLowerCase()))
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
                          <MUI.IconButton size="small" sx={{ mr: 1 }} onClick={() => handleViewClick(centro)}>
                          <Icons.Visibility />
                        </MUI.IconButton>
                          <MUI.IconButton size="small" sx={{ mr: 1 }} onClick={() => handleEditClick(centro)}>
                          <Icons.Edit />
                        </MUI.IconButton>
                          <MUI.IconButton size="small" onClick={() => handleDeleteClick(centro)}>
                          <Icons.Delete />
                        </MUI.IconButton>
                      </MUI.TableCell>
                    </MUI.TableRow>
                  ))}
              </MUI.TableBody>
            </MUI.Table>
          </MUI.TableContainer>
        </MUI.Paper>
        )}

        {/* Diálogo para registrar nuevo centro de trabajo */}
        <MUI.Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
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
                    error={!nombreCentroDisponible && !!formData.nombre_centro}
                    helperText={!nombreCentroDisponible && !!formData.nombre_centro ? 'Ya existe un centro con ese nombre' : ''}
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
                    error={!telefonoDisponible}
                    helperText={!telefonoDisponible ? 'Ya existe un contacto con ese teléfono' : ''}
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
                    error={!emailDisponible}
                    helperText={!emailDisponible ? 'Ya existe un contacto con ese correo' : ''}
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
                    onChange={(e) => handleProvinciaChange({ target: { value: e.target.value } } as SelectChangeEvent<number | ''>)}
                    variant="outlined"
                    sx={{ minWidth: '350px' }}
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
                    onChange={(e) => handleCiudadChange({ target: { value: e.target.value } } as SelectChangeEvent<number | ''>)}
                    variant="outlined"
                    disabled={!selectedProvincia}
                    sx={{ minWidth: '350px' }}
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
                    onChange={(e) => handleSectorChange({ target: { value: e.target.value } } as SelectChangeEvent<number | ''>)}
                    variant="outlined"
                    disabled={!selectedCiudad}
                    sx={{ minWidth: '350px' }}
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
                    inputProps={{ maxLength: MAX_CALLE }}
                    error={formData.calle_dir.length > MAX_CALLE}
                    helperText={
                      formData.calle_dir.length > MAX_CALLE
                        ? `Máximo ${MAX_CALLE} caracteres`
                        : `${formData.calle_dir.length}/${MAX_CALLE}`
                    }
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
                    inputProps={{ maxLength: MAX_NUM_RES }}
                    error={formData.num_res_dir.length > MAX_NUM_RES}
                    helperText={
                      formData.num_res_dir.length > MAX_NUM_RES
                        ? `Máximo ${MAX_NUM_RES} caracteres`
                        : `${formData.num_res_dir.length}/${MAX_NUM_RES}`
                    }
                  />
                </MUI.Grid>
              </MUI.Grid>

              {/* Usuario de la Empresa */}
              <MUI.Typography variant="h6" sx={{ color: '#1a237e', mb: 1, mt: 2 }}>
                Usuario de la Empresa
              </MUI.Typography>
              <MUI.Grid container spacing={2}>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Usuario"
                    name="usuario_empresa"
                    value={formData.usuario_empresa}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      handleFormChange(e);
                      checkUsuarioEmpresa(e.target.value);
                    }}
                    onBlur={e => checkUsuarioEmpresa(e.target.value)}
                    variant="outlined"
                    required
                    error={!usuarioEmpresaDisponible}
                    helperText={!usuarioEmpresaDisponible ? "Este usuario ya existe" : ""}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={6}>
                  <MUI.TextField
                    fullWidth
                    label="Contraseña"
                    name="contrasena_empresa"
                    type="password"
                    value={formData.contrasena_empresa}
                    onChange={handleFormChange}
                    variant="outlined"
                    required
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
              onClick={handleCloseDialog}
            >
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1b60' } }}
              onClick={handleSaveCentro}
              disabled={isReadOnly || !usuarioEmpresaDisponible || direccionInvalida}
            >
              {editMode ? 'Editar' : 'Registrar'}
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Diálogo de confirmación de eliminación */}
        <MUI.Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <MUI.DialogTitle>¿Estás seguro de que quieres eliminar este centro de trabajo?</MUI.DialogTitle>
          <MUI.DialogActions>
            <MUI.Button onClick={handleDeleteCancel} color="primary">No</MUI.Button>
            <MUI.Button onClick={handleDeleteConfirm} color="error">Sí</MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Diálogo de visualización (solo lectura) */}
        <MUI.Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
          <MUI.DialogTitle>Ver Centro de Trabajo</MUI.DialogTitle>
          <MUI.DialogContent>
            {viewCentro && (
              <MUI.Box sx={{ p: 2 }}>
                <MUI.Typography variant="h6" sx={{ mb: 2 }}>{viewCentro.nombre_centro}</MUI.Typography>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Typography variant="subtitle2">Teléfono:</MUI.Typography>
                    <MUI.Typography>{viewCentro.contacto_centro?.telefono_contacto || '-'}</MUI.Typography>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Typography variant="subtitle2">Email:</MUI.Typography>
                    <MUI.Typography>{viewCentro.contacto_centro?.email_contacto || '-'}</MUI.Typography>
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.Typography variant="subtitle2">Dirección:</MUI.Typography>
                    <MUI.Typography>
                      <strong>Calle:</strong> {viewCentro.direccion_centro?.calle_dir || '-'}<br />
                      <strong>Residencia:</strong> {viewCentro.direccion_centro?.num_res_dir || '-'}<br />
                      <strong>Sector:</strong> {viewCentro.direccion_centro?.sector_dir?.sector || '-'}<br />
                      <strong>Ciudad:</strong> {viewCentro.direccion_centro?.sector_dir?.ciudad?.ciudad || '-'}<br />
                      <strong>Provincia:</strong> {viewCentro.direccion_centro?.sector_dir?.ciudad?.provincia?.provincia || '-'}
                      </MUI.Typography>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Typography variant="subtitle2">Estado:</MUI.Typography>
                    <MUI.Typography>{viewCentro.estado_centro || '-'}</MUI.Typography>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Typography variant="subtitle2">Usuario:</MUI.Typography>
                    <MUI.Typography>{viewCentro.usuario?.dato_usuario || '-'}</MUI.Typography>
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.Typography variant="subtitle2" sx={{ mt: 2 }}>Persona de Contacto de la Empresa:</MUI.Typography>
                    {(() => {
                      const pc = Array.isArray(viewCentro.persona_contacto_empresa)
                        ? viewCentro.persona_contacto_empresa[0]
                        : viewCentro.persona_contacto_empresa;
                      return (
                        <MUI.Typography>
                          <strong>Nombre:</strong> {pc?.nombre_persona_contacto || '-'}<br />
                          <strong>Apellido:</strong> {pc?.apellido_persona_contacto || '-'}<br />
                          <strong>Teléfono:</strong> {pc?.telefono || '-'}<br />
                          <strong>Extensión:</strong> {pc?.extension || '-'}<br />
                          <strong>Departamento:</strong> {pc?.departamento || '-'}
                      </MUI.Typography>
                      );
                    })()}
                  </MUI.Grid>
              </MUI.Grid>
              </MUI.Box>
            )}
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={() => setOpenViewDialog(false)}>Cerrar</MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Diálogo de validación de empresas */}
        <MUI.Dialog 
          open={openValidarEmpresas} 
          onClose={() => setOpenValidarEmpresas(false)}
          maxWidth="md"
          fullWidth
        >
          <MUI.DialogTitle>
            Validación de Empresas
          </MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <MUI.TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.Search />
                    </MUI.InputAdornment>
                  ),
                }}
              />
              <MUI.Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                <MUI.Tab label="Pendientes" />
                <MUI.Tab label="Aceptadas" />
                <MUI.Tab label="Rechazadas" />
              </MUI.Tabs>
            </MUI.Box>

            {/* Panel de Pendientes */}
            {tabValue === 0 && (
              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow>
                      <MUI.TableCell>Empresa</MUI.TableCell>
                      <MUI.TableCell align="center">Acciones</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {filtrarEmpresas(empresasPendientes).map((empresa) => (
                      <MUI.TableRow key={empresa.id_centro}>
                        <MUI.TableCell>{empresa.nombre_centro}</MUI.TableCell>
                        <MUI.TableCell align="center">
                          <MUI.ButtonGroup>
                            <MUI.Button
                              color={empresa.validacion === 'Aceptada' ? 'success' : 'primary'}
                              onClick={() => handleValidarCentro(empresa.id_centro, 'Aceptada')}
                              disabled={isReadOnly || empresa.validacion === 'Aceptada'}
                            >
                              Aceptar
                            </MUI.Button>
                            <MUI.Button
                              color="error"
                              onClick={() => handleValidarCentro(empresa.id_centro, 'Rechazada')}
                              disabled={isReadOnly || empresa.validacion === 'Rechazada'}
                            >
                              Rechazar
                            </MUI.Button>
                          </MUI.ButtonGroup>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            )}

            {/* Panel de Aceptadas */}
            {tabValue === 1 && (
              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow>
                      <MUI.TableCell>Empresa</MUI.TableCell>
                      <MUI.TableCell align="center">Acciones</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {filtrarEmpresas(empresasAceptadas).map((empresa) => (
                      <MUI.TableRow key={empresa.id_centro}>
                        <MUI.TableCell>{empresa.nombre_centro}</MUI.TableCell>
                        <MUI.TableCell align="center">
                          <MUI.Tooltip title="Restaurar a Pendiente">
                            <MUI.IconButton
                              color="primary"
                              onClick={() => handleValidarCentro(empresa.id_centro, 'Pendiente')}
                            >
                              <Icons.Restore />
                            </MUI.IconButton>
                          </MUI.Tooltip>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            )}

            {/* Panel de Rechazadas */}
            {tabValue === 2 && (
              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow>
                      <MUI.TableCell>Empresa</MUI.TableCell>
                      <MUI.TableCell align="center">Acciones</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {filtrarEmpresas(empresasRechazadas).map((empresa) => (
                      <MUI.TableRow key={empresa.id_centro}>
                        <MUI.TableCell>{empresa.nombre_centro}</MUI.TableCell>
                        <MUI.TableCell align="center">
                          <MUI.Tooltip title="Restaurar a Pendiente">
                            <MUI.IconButton
                              color="primary"
                              onClick={() => handleValidarCentro(empresa.id_centro, 'Pendiente')}
                            >
                              <Icons.Restore />
                            </MUI.IconButton>
                          </MUI.Tooltip>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            )}
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={() => setOpenValidarEmpresas(false)}>
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