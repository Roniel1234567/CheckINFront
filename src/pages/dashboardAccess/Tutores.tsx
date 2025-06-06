import { useState, useEffect } from 'react';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import api from '../../services/api';
import { useReadOnlyMode } from '../../hooks/useReadOnlyMode';

// Interfaces
interface Usuario {
  id_usuario: number;
  dato_usuario: string;
  contrasena_usuario: string;
  rol_usuario: number;
  estado_usuario: 'Activo' | 'Inactivo' | 'Eliminado';
  creacion_usuario: Date;
}

interface Contacto {
  id_contacto: number;
  telefono_contacto: string;
  email_contacto: string;
  estado_contacto: string;
  creacion_contacto: Date;
}

interface FamiliaProfesional {
  id_fam: string;
  nombre_fam: string;
  estado_fam: string;
}

interface Taller {
  id_taller: number;
  nombre_taller: string;
  familia_taller: FamiliaProfesional;
  cod_titulo_taller: string;
  estado_taller: 'Activo' | 'Inactivo';
  horaspas_taller: string;
}

interface Tutor {
  id_tutor: number;
  usuario_tutor: number;
  nombre_tutor: string;
  apellido_tutor: string;
  contacto_tutor: number;
  taller_tutor: number;
  creacion_tutor: Date;
  usuario_tutor_data?: Usuario;
  contacto_tutor_data?: Contacto;
  taller_tutor_data?: Taller;
}

function TutoresPage() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [showInactivos, setShowInactivos] = useState(false);
  
  // Estado para confirmar desactivación
  const [confirmDesactivar, setConfirmDesactivar] = useState(false);
  const [tutorADesactivar, setTutorADesactivar] = useState<Tutor | null>(null);
  
  // Estado para confirmar restauración
  const [confirmRestaurar, setConfirmRestaurar] = useState(false);
  const [tutorARestaurar, setTutorARestaurar] = useState<Tutor | null>(null);
  
  // Form states
  const [formNombre, setFormNombre] = useState('');
  const [formApellido, setFormApellido] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUsuario, setFormUsuario] = useState('');
  const [formContrasena, setFormContrasena] = useState('');
  const [formTaller, setFormTaller] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Error states
  const [formErrors, setFormErrors] = useState({
    nombre_tutor: false,
    apellido_tutor: false,
    telefono_contacto: false,
    email_contacto: false,
    dato_usuario: false,
    contrasena_usuario: false,
    taller_tutor: false
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Estado para verificar disponibilidad de usuario
  const [usuarioDisponible, setUsuarioDisponible] = useState(true);
  const [telefonoDisponible, setTelefonoDisponible] = useState(true);
  const [emailDisponible, setEmailDisponible] = useState(true);
  
  // Estados para manejo de errores específicos
  const [tutoresError, setTutoresError] = useState(false);
  const [talleresError, setTalleresError] = useState(false);

  const isReadOnly = useReadOnlyMode();

  const commonSelectStyles = {
    minWidth: '400px',
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
        width: '400px',
        '& .MuiMenuItem-root': {
          padding: '12px 24px'
        }
      }
    }
  };

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Reiniciar estados de error
      setTutoresError(false);
      setTalleresError(false);
      
      try {
        // Cargar tutores
        try {
          const { data: tutoresData } = await api.get<Tutor[]>('/tutores');
          console.log('Tutores cargados:', tutoresData);
          console.log('Detalle del tutor recibido:', JSON.stringify(tutoresData, null, 2));
          
          // Verificar si la respuesta es un array y tiene elementos
          if (Array.isArray(tutoresData)) {
            setTutores(tutoresData);
          } else {
            console.error('La respuesta de tutores no es un array:', tutoresData);
            setTutoresError(true);
          }
        } catch (error) {
          console.error('Error al cargar tutores:', error);
          setTutoresError(true);
          setSnackbar({
            open: true,
            message: 'Error en el servidor al cargar tutores. Por favor contacte al administrador.',
            severity: 'error'
          });
        }
        
        // Cargar talleres - intentamos cargar incluso si falló la carga de tutores
        console.log('Solicitando talleres a:', `${api.defaults.baseURL}/talleres`);
        try {
          const talleresResponse = await api.get<Taller[]>('/talleres');
          console.log('Respuesta completa de talleres:', talleresResponse);
          console.log('Talleres cargados:', talleresResponse.data);
          setTalleres(talleresResponse.data);
        } catch (error) {
          // Usando tipado más específico para el error
          type ApiError = Error & { 
            response?: { 
              data?: Record<string, unknown>; 
              status?: number 
            } 
          };
          const talleresError = error as ApiError;
          console.error('Error específico al cargar talleres:', talleresError);
          console.error('Detalles del error:', {
            message: talleresError.message,
            response: talleresError.response?.data,
            status: talleresError.response?.status
          });
          
          setTalleresError(true);
          setSnackbar({
            open: true,
            message: 'Error al cargar los talleres. Algunas funciones pueden no estar disponibles.',
            severity: 'warning'
          });
        }
      } catch (error) {
        console.error('Error general al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Añadir un log para filteredTutores
  useEffect(() => {
    console.log('Estado actual de tutores:', tutores);
    console.log('Estado de showInactivos:', showInactivos);
    console.log('Tutores filtrados:', tutoresFiltrados);
  }, [tutores, showInactivos, searchTerm]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenDialog = (tutor?: Tutor) => {
    if (tutor) {
      setSelectedTutor(tutor);
      setFormNombre(tutor.nombre_tutor);
      setFormApellido(tutor.apellido_tutor);
      
      // Manejar contacto_tutor según si es un objeto o un ID
      if (typeof tutor.contacto_tutor === 'object' && tutor.contacto_tutor !== null) {
        setFormTelefono(tutor.contacto_tutor.telefono_contacto || '');
        setFormEmail(tutor.contacto_tutor.email_contacto || '');
      } else if (tutor.contacto_tutor_data) {
        setFormTelefono(tutor.contacto_tutor_data.telefono_contacto);
        setFormEmail(tutor.contacto_tutor_data.email_contacto);
      }
      
      // Manejar usuario_tutor según si es un objeto o un ID
      if (typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null) {
        setFormUsuario(tutor.usuario_tutor.dato_usuario || '');
      } else if (tutor.usuario_tutor_data) {
        setFormUsuario(tutor.usuario_tutor_data.dato_usuario);
      }
      
      // No establecemos la contraseña por seguridad
      setFormContrasena('');
      
      // Establecer el taller
      if (typeof tutor.taller_tutor === 'object' && tutor.taller_tutor !== null) {
        setFormTaller(tutor.taller_tutor.id_taller?.toString() || '');
      } else if (tutor.taller_tutor_data) {
        setFormTaller(tutor.taller_tutor_data.id_taller.toString());
      } else if (typeof tutor.taller_tutor === 'number') {
        setFormTaller(tutor.taller_tutor.toString());
      }
    } else {
      setSelectedTutor(null);
      setFormNombre('');
      setFormApellido('');
      setFormTelefono('');
      setFormEmail('');
      setFormUsuario('');
      setFormContrasena('');
      setFormTaller('');
    }
    setActiveTab('2');
  };

  const handleCloseDialog = () => {
    setSelectedTutor(null);
    resetFormErrors();
    setActiveTab('1');
  };
  
  const resetFormErrors = () => {
    setFormErrors({
      nombre_tutor: false,
      apellido_tutor: false,
      telefono_contacto: false,
      email_contacto: false,
      dato_usuario: false,
      contrasena_usuario: false,
      taller_tutor: false
    });
  };
  
  const validateForm = () => {
    const errors = {
      nombre_tutor: formNombre.trim() === '',
      apellido_tutor: formApellido.trim() === '',
      telefono_contacto: formTelefono.trim() === '',
      email_contacto: formEmail.trim() === '' || !formEmail.includes('@'),
      dato_usuario: formUsuario.trim() === '',
      contrasena_usuario: !selectedTutor && formContrasena.trim() === '',
      taller_tutor: !formTaller || formTaller === ''
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Verificar si el nombre de usuario ya existe
  const checkUsuario = async (usuario: string) => {
    if (!usuario || (selectedTutor && selectedTutor.usuario_tutor_data?.dato_usuario === usuario)) {
      setUsuarioDisponible(true);
      return;
    }
    
    try {
      await api.get(`/usuarios/buscar/${usuario}`);
      // Si la petición es exitosa, el usuario ya existe
      setUsuarioDisponible(false);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response && err.response.status === 404) {
        // Error 404 significa que el usuario no existe, por lo tanto está disponible
        setUsuarioDisponible(true);
      } else {
        // Para cualquier otro error, asumimos que está disponible para no bloquear al usuario
        console.error('Error al verificar usuario:', error);
        setUsuarioDisponible(true);
      }
    }
  };
  
  // Verificar si el teléfono ya existe
  const checkTelefono = async (telefono: string) => {
    if (!telefono || (selectedTutor && selectedTutor.contacto_tutor_data?.telefono_contacto === telefono)) {
      setTelefonoDisponible(true);
      return;
    }
    
    try {
      const response = await api.get(`/contactos/existe-telefono/${encodeURIComponent(telefono)}`);
      // Si existe, no está disponible
      setTelefonoDisponible(!response.data.exists);
    } catch (error) {
      // Para cualquier error, asumimos que está disponible para no bloquear al usuario
      console.error('Error al verificar teléfono:', error);
      setTelefonoDisponible(true);
    }
  };
  
  // Verificar si el email ya existe
  const checkEmail = async (email: string) => {
    if (!email || (selectedTutor && selectedTutor.contacto_tutor_data?.email_contacto === email)) {
      setEmailDisponible(true);
      return;
    }
    
    try {
      const response = await api.get(`/contactos/existe-email/${encodeURIComponent(email)}`);
      // Si existe, no está disponible
      setEmailDisponible(!response.data.exists);
    } catch (error) {
      // Para cualquier error, asumimos que está disponible para no bloquear al usuario
      console.error('Error al verificar email:', error);
      setEmailDisponible(true);
    }
  };

  const resetForm = () => {
    setFormNombre('');
    setFormApellido('');
    setFormTelefono('');
    setFormEmail('');
    setFormUsuario('');
    setFormContrasena('');
    setFormTaller('');
    resetFormErrors();
  };

  const handleSaveTutor = async () => {
    if (isReadOnly) return;
    if (!validateForm()) return;
    
    // Verificar si el usuario está disponible cuando es un tutor nuevo
    if (!selectedTutor && !usuarioDisponible) {
      setSnackbar({
        open: true,
        message: 'El nombre de usuario ya está en uso. Por favor, elige otro.',
        severity: 'error'
      });
      return;
    }
    
    // Verificar si el teléfono está disponible
    if (!telefonoDisponible) {
      setSnackbar({
        open: true,
        message: 'El número de teléfono ya está registrado en otro contacto.',
        severity: 'error'
      });
      return;
    }
    
    // Verificar si el email está disponible
    if (!emailDisponible) {
      setSnackbar({
        open: true,
        message: 'El correo electrónico ya está registrado en otro contacto.',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (selectedTutor) {
        // Actualizar tutor existente
        // Primero actualizar contacto
        if (selectedTutor.contacto_tutor_data) {
          await api.put(`/contactos/${selectedTutor.contacto_tutor_data.id_contacto}`, {
            telefono_contacto: formTelefono,
            email_contacto: formEmail
          });
        }
        
        // Obtener IDs según la estructura del objeto
        const usuarioId = typeof selectedTutor.usuario_tutor === 'object' && selectedTutor.usuario_tutor !== null
          ? selectedTutor.usuario_tutor.id_usuario
          : selectedTutor.usuario_tutor;
        
        const contactoId = typeof selectedTutor.contacto_tutor === 'object' && selectedTutor.contacto_tutor !== null
          ? selectedTutor.contacto_tutor.id_contacto
          : selectedTutor.contacto_tutor;
        
        // Actualizar datos del tutor manteniendo las referencias originales
        await api.put(`/tutores/${selectedTutor.id_tutor}`, {
          nombre_tutor: formNombre,
          apellido_tutor: formApellido,
          taller_tutor: parseInt(formTaller),
          usuario_tutor: usuarioId,
          contacto_tutor: contactoId
        });
        
        // Si se proporciona una nueva contraseña, actualizar usuario
        if (formContrasena.trim() !== '') {
          await api.put(`/usuarios/${usuarioId}`, {
            contrasena_usuario: formContrasena
          });
        }
        
        setSnackbar({
          open: true,
          message: 'Tutor actualizado correctamente',
          severity: 'success'
        });
      } else {
        // Crear nuevo tutor - proceso completo
        
        // 1. Crear contacto
        const contactoResponse = await api.post<{ id_contacto: number }>('/contactos', {
          telefono_contacto: formTelefono,
          email_contacto: formEmail,
          estado_contacto: 'Activo'
        });
        
        // 2. Crear usuario
        const usuarioResponse = await api.post<{ id_usuario: number }>('/usuarios', {
          dato_usuario: formUsuario,
          contrasena_usuario: formContrasena,
          rol_usuario: 3, // Rol de tutor
          estado_usuario: 'Activo'
        });
        
        // 3. Crear tutor
        await api.post('/tutores', {
          usuario_tutor: usuarioResponse.data.id_usuario,
          nombre_tutor: formNombre,
          apellido_tutor: formApellido,
          contacto_tutor: contactoResponse.data.id_contacto,
          taller_tutor: parseInt(formTaller)
        });
        
        setSnackbar({
          open: true,
          message: 'Tutor creado correctamente',
          severity: 'success'
        });
      }
      
      // Recargar tutores
      const { data: tutoresData } = await api.get<Tutor[]>('/tutores');
      setTutores(tutoresData);
      
      // Limpiar el formulario
      resetForm();
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error al guardar tutor:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el tutor',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Preparar tutores filtrados por búsqueda de texto
  const tutoresFiltradosPorBusqueda = tutores.filter(tutor => 
    tutor.nombre_tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.apellido_tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tutor.contacto_tutor_data?.email_contacto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tutor.contacto_tutor_data?.telefono_contacto || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Aplicar filtro adicional por estado sólo para mostrar en la tabla
  const tutoresFiltrados = tutoresFiltradosPorBusqueda.filter(tutor => {
    // Si showInactivos es true, mostrar todos los tutores
    if (showInactivos) return true;
    
    // Verificar si el tutor tiene un objeto usuario_tutor (como en la respuesta de la API)
    if (typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null) {
      return tutor.usuario_tutor.estado_usuario === 'Activo';
    }
    
    // Verificar si tiene usuario_tutor_data (como se define en la interfaz)
    if (tutor.usuario_tutor_data) {
      return tutor.usuario_tutor_data.estado_usuario === 'Activo';
    }
    
    // Si no podemos determinar el estado, considerarlo activo por defecto
    return true;
  });
  
  // Añadir logs para depuración
  console.log('Tutores originales:', tutores);
  console.log('Tutores filtrados por búsqueda:', tutoresFiltradosPorBusqueda);
  console.log('Tutores filtrados por estado:', tutoresFiltrados);
  console.log('Estado de showInactivos:', showInactivos);
  
  // Cambio de tab
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Función para eliminar un usuario de tutor
  const handleDesactivarClick = (tutor: Tutor) => {
    setTutorADesactivar(tutor);
    setConfirmDesactivar(true);
  };
  
  // Función para cerrar el diálogo de confirmación
  const handleCancelDesactivar = () => {
    setConfirmDesactivar(false);
    setTutorADesactivar(null);
  };

  // Función para iniciar la restauración de un tutor eliminado
  const handleRestaurarClick = (tutor: Tutor) => {
    setTutorARestaurar(tutor);
    setConfirmRestaurar(true);
  };
  
  // Función para cerrar el diálogo de confirmación de restauración
  const handleCancelRestaurar = () => {
    setConfirmRestaurar(false);
    setTutorARestaurar(null);
  };

  // Función para confirmar la restauración del usuario
  const handleConfirmRestaurar = async () => {
    if (!tutorARestaurar) return;
    
    try {
      setLoading(true);
      
      // Obtener el ID de usuario según la estructura del objeto
      const usuarioId = typeof tutorARestaurar.usuario_tutor === 'object' && tutorARestaurar.usuario_tutor !== null
        ? tutorARestaurar.usuario_tutor.id_usuario
        : tutorARestaurar.usuario_tutor;
      
      if (!usuarioId) {
        throw new Error('No se pudo determinar el ID de usuario a restaurar');
      }
      
      await api.put(`/usuarios/${usuarioId}`, {
        estado_usuario: 'Activo'
      });
      
      setSnackbar({
        open: true,
        message: 'Tutor restaurado correctamente',
        severity: 'success'
      });
      
      // Recargar tutores
      const { data: tutoresData } = await api.get<Tutor[]>('/tutores');
      setTutores(tutoresData);
      
      handleCancelRestaurar();
    } catch (error) {
      console.error('Error al restaurar tutor:', error);
      setSnackbar({
        open: true,
        message: 'Error al restaurar el tutor',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para confirmar la desactivación del usuario
  const handleConfirmDesactivar = async () => {
    if (!tutorADesactivar) return;
    
    try {
      setLoading(true);
      
      // Obtener el ID de usuario según la estructura del objeto
      const usuarioId = typeof tutorADesactivar.usuario_tutor === 'object' && tutorADesactivar.usuario_tutor !== null
        ? tutorADesactivar.usuario_tutor.id_usuario
        : tutorADesactivar.usuario_tutor;
      
      if (!usuarioId) {
        throw new Error('No se pudo determinar el ID de usuario a eliminar');
      }
      
      await api.put(`/usuarios/${usuarioId}`, {
        estado_usuario: 'Eliminado'
      });
      
      setSnackbar({
        open: true,
        message: 'Tutor eliminado correctamente',
        severity: 'success'
      });
      
      // Recargar tutores
      const { data: tutoresData } = await api.get<Tutor[]>('/tutores');
      setTutores(tutoresData);
      
      handleCancelDesactivar();
    } catch (error) {
      console.error('Error al eliminar tutor:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el tutor',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar manualmente la lista de tutores
  const handleRefreshTutores = async () => {
    try {
      setLoading(true);
      const { data: tutoresData } = await api.get<Tutor[]>('/tutores');
      console.log('Tutores actualizados:', tutoresData);
      setTutores(tutoresData);
      setSnackbar({
        open: true,
        message: 'Lista de tutores actualizada',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al actualizar tutores:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar tutores',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizado de contenido condicional cuando hay error de tutores
  const renderTutoresErrorContent = () => (
    <MUI.Box sx={{ 
      textAlign: 'center', 
      py: 10, 
      px: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Icons.ErrorOutline sx={{ fontSize: 60, color: theme.palette.error.main, mb: 2 }} />
      <MUI.Typography variant="h5" gutterBottom>
        Error al cargar los tutores
      </MUI.Typography>
      <MUI.Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
        Se ha producido un error en el servidor al intentar cargar los datos de tutores. 
        Esto puede deberse a un problema temporal en el servidor.
        {talleres.length > 0 && (
          <span style={{ display: 'block', marginTop: '10px', fontStyle: 'italic' }}>
            Los talleres se cargaron correctamente. Puede continuar utilizando otras funciones del sistema.
          </span>
        )}
      </MUI.Typography>
      <MUI.Button
        variant="contained"
        color="primary"
        startIcon={<Icons.Refresh />}
        onClick={() => window.location.reload()}
      >
        Intentar nuevamente
      </MUI.Button>
    </MUI.Box>
  );

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      {/* Sidebar */}
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Main content */}
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* App bar - usamos directamente el valor 4 para notifications */}
        <DashboardAppBar notifications={4} toggleDrawer={toggleDrawer} />

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
            <MUI.CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          </MUI.Box>
        )}

        {/* Contenido principal */}
        <MUI.Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <MUI.Box>
            <MUI.Typography variant="h2" sx={{ 
              mb: 1, 
              fontWeight: 'bold', 
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Icons.SupervisorAccount sx={{ fontSize: '2.5rem' }} />
              Gestión de Tutores
            </MUI.Typography>
            <MUI.Typography variant="body1" color="text.secondary">
              Administra los tutores del sistema
            </MUI.Typography>
          </MUI.Box>

          {tutoresError ? (
            renderTutoresErrorContent()
          ) : (
            /* Contenido con tabs */
            <TabContext value={activeTab}>
              <MUI.Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
                <TabList 
                  onChange={handleTabChange} 
                  aria-label="Gestión de tutores"
                  variant="scrollable" 
                  scrollButtons="auto"
                >
                  <MUI.Tab label="Tutores" value="1" icon={<Icons.ViewList />} />
                  <MUI.Tab 
                    label={selectedTutor ? "Editar Tutor" : "Nuevo Tutor"} 
                    value="2" 
                    icon={selectedTutor ? <Icons.Edit /> : <Icons.Add />} 
                  />
                </TabList>
              </MUI.Box>

              {/* Tab 1: Listado de Tutores */}
              <TabPanel value="1">
                {/* Barra de búsqueda y acciones */}
                <MUI.Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                  <MUI.TextField
                    placeholder="Buscar tutor..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: 200 }}
                    InputProps={{
                      startAdornment: <Icons.Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                  <MUI.Tooltip title="Actualizar lista">
                    <MUI.IconButton color="primary" onClick={handleRefreshTutores}>
                      <Icons.Refresh />
                    </MUI.IconButton>
                  </MUI.Tooltip>
                  <MUI.FormControlLabel
                    control={
                      <MUI.Switch
                        checked={showInactivos}
                        onChange={(e) => setShowInactivos(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Mostrar inactivos/eliminados"
                    sx={{ mx: 2 }}
                  />
                  <MUI.Button
                    variant="contained"
                    color="primary"
                    startIcon={<Icons.Add />}
                    onClick={() => {
                      if (!isReadOnly) {
                        setSelectedTutor(null);
                        setActiveTab('2');
                      }
                    }}
                    disabled={isReadOnly}
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Nuevo Tutor
                  </MUI.Button>
                </MUI.Box>

                {/* Tabla de tutores */}
                <MUI.TableContainer component={MUI.Paper} sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  mb: 4
                }}>
                  <MUI.Table>
                    <MUI.TableHead>
                      <MUI.TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                        <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tutor</MUI.TableCell>
                        <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contacto</MUI.TableCell>
                        <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</MUI.TableCell>
                        <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</MUI.TableCell>
                        <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</MUI.TableCell>
                      </MUI.TableRow>
                    </MUI.TableHead>
                    <MUI.TableBody>
                      {/* Mostrar mensaje si no hay tutores */}
                      {tutoresFiltrados.length === 0 ? (
                        <MUI.TableRow>
                          <MUI.TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Icons.SearchOff sx={{ fontSize: '3rem', color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                            <MUI.Typography variant="body1" color="text.secondary">
                              {tutores.length === 0 
                                ? "No hay tutores registrados. Prueba creando uno nuevo."
                                : searchTerm 
                                  ? "No hay tutores que coincidan con la búsqueda." 
                                  : !showInactivos 
                                    ? "No hay tutores activos. Prueba activando 'Mostrar inactivos/eliminados'."
                                    : "No se encontraron tutores."}
                            </MUI.Typography>
                          </MUI.TableCell>
                        </MUI.TableRow>
                      ) : (
                        // Mapear tutores
                        tutoresFiltrados.map((tutor) => (
                          <MUI.TableRow 
                            key={tutor.id_tutor}
                            sx={{ 
                              '&:hover': { bgcolor: 'action.hover' },
                              ...(tutor.usuario_tutor_data?.estado_usuario !== 'Activo' && { 
                                bgcolor: MUI.alpha(theme.palette.error.light, 0.05),
                                opacity: 0.8
                              })
                            }}
                          >
                            <MUI.TableCell>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Person sx={{ color: theme.palette.primary.main, opacity: 0.7 }} />
                                <MUI.Box>
                                  <MUI.Typography variant="body1" fontWeight="medium">
                                    {tutor.nombre_tutor} {tutor.apellido_tutor}
                                  </MUI.Typography>
                                  <MUI.Typography variant="caption" color="text.secondary">
                                    ID: {tutor.id_tutor}
                                  </MUI.Typography>
                                  {tutor.taller_tutor_data && (
                                    <MUI.Typography variant="caption" sx={{ display: 'block', color: theme.palette.primary.main }}>
                                      <Icons.School fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                                      Taller: {tutor.taller_tutor_data.nombre_taller}
                                    </MUI.Typography>
                                  )}
                                </MUI.Box>
                              </MUI.Box>
                            </MUI.TableCell>
                            <MUI.TableCell>
                              <MUI.Box>
                                <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Icons.Email fontSize="small" sx={{ opacity: 0.6 }} />
                                  <MUI.Typography variant="body2">
                                    {tutor.contacto_tutor_data?.email_contacto || '-'}
                                  </MUI.Typography>
                                </MUI.Box>
                                <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <Icons.Phone fontSize="small" sx={{ opacity: 0.6 }} />
                                  <MUI.Typography variant="body2">
                                    {tutor.contacto_tutor_data?.telefono_contacto || '-'}
                                  </MUI.Typography>
                                </MUI.Box>
                              </MUI.Box>
                            </MUI.TableCell>
                            <MUI.TableCell>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.AccountCircle sx={{ opacity: 0.6 }} />
                                <MUI.Typography variant="body2">
                                  {(typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null) 
                                    ? tutor.usuario_tutor.dato_usuario 
                                    : tutor.usuario_tutor_data?.dato_usuario || '-'}
                                </MUI.Typography>
                              </MUI.Box>
                            </MUI.TableCell>
                            <MUI.TableCell>
                              <MUI.Chip 
                                label={
                                  (typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null)
                                    ? tutor.usuario_tutor.estado_usuario || 'Desconocido'
                                    : tutor.usuario_tutor_data?.estado_usuario || 'Desconocido'
                                }
                                color={
                                  ((typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null) 
                                    ? tutor.usuario_tutor.estado_usuario 
                                    : tutor.usuario_tutor_data?.estado_usuario) === 'Activo' 
                                    ? 'success' 
                                    : ((typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null) 
                                      ? tutor.usuario_tutor.estado_usuario 
                                      : tutor.usuario_tutor_data?.estado_usuario) === 'Eliminado'
                                      ? 'error'
                                      : 'warning'
                                }
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </MUI.TableCell>
                            <MUI.TableCell>
                              <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                                <MUI.Tooltip title="Editar">
                                  <MUI.IconButton
                                    color="primary"
                                    onClick={() => {
                                      if (!isReadOnly) {
                                        handleOpenDialog(tutor);
                                      }
                                    }}
                                    disabled={isReadOnly}
                                    size="small"
                                  >
                                    <Icons.Edit />
                                  </MUI.IconButton>
                                </MUI.Tooltip>
                                
                                {((typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null) 
                                  ? tutor.usuario_tutor.estado_usuario 
                                  : tutor.usuario_tutor_data?.estado_usuario) === 'Activo' ? (
                                  <MUI.Tooltip title="Eliminar">
                                    <MUI.IconButton
                                      color="error"
                                      onClick={() => {
                                        if (!isReadOnly) {
                                          handleDesactivarClick(tutor);
                                        }
                                      }}
                                      disabled={isReadOnly}
                                      size="small"
                                    >
                                      <Icons.Delete />
                                    </MUI.IconButton>
                                  </MUI.Tooltip>
                                ) : ((typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null) 
                                    ? tutor.usuario_tutor.estado_usuario 
                                    : tutor.usuario_tutor_data?.estado_usuario) === 'Inactivo' ? (
                                  <MUI.Tooltip title="Activar">
                                    <MUI.IconButton
                                      color="success"
                                      onClick={() => {
                                        // Lógica para reactivar usuario
                                      }}
                                      disabled={isReadOnly}
                                      size="small"
                                    >
                                      <Icons.CheckCircle />
                                    </MUI.IconButton>
                                  </MUI.Tooltip>
                                ) : ((typeof tutor.usuario_tutor === 'object' && tutor.usuario_tutor !== null) 
                                    ? tutor.usuario_tutor.estado_usuario 
                                    : tutor.usuario_tutor_data?.estado_usuario) === 'Eliminado' ? (
                                  <MUI.Tooltip title="Restaurar tutor">
                                    <MUI.IconButton
                                      color="success"
                                      onClick={() => {
                                        if (!isReadOnly) {
                                          handleRestaurarClick(tutor);
                                        }
                                      }}
                                      disabled={isReadOnly}
                                      size="small"
                                    >
                                      <Icons.RestoreFromTrash />
                                    </MUI.IconButton>
                                  </MUI.Tooltip>
                                ) : (
                                  <MUI.Tooltip title="Estado desconocido">
                                    <span>
                                      <MUI.IconButton
                                        disabled
                                        size="small"
                                      >
                                        <Icons.Block />
                                      </MUI.IconButton>
                                    </span>
                                  </MUI.Tooltip>
                                )}
                              </MUI.Box>
                            </MUI.TableCell>
                          </MUI.TableRow>
                        ))
                      )}
                    </MUI.TableBody>
                  </MUI.Table>
                </MUI.TableContainer>
              </TabPanel>

              {/* Tab 2: Formulario de Tutor */}
              <TabPanel value="2">
                <MUI.Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 3, 
                    p: 4, 
                    maxWidth: 900, 
                    mx: 'auto', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <MUI.Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 4, 
                      fontWeight: 'bold', 
                      color: theme.palette.primary.main, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      paddingBottom: 2
                    }}
                  >
                    {selectedTutor ? <Icons.Edit /> : <Icons.Add />}
                    {selectedTutor ? 'Editar Tutor' : 'Nuevo Tutor'}
                  </MUI.Typography>

                  {talleresError && (
                    <MUI.Alert severity="warning" sx={{ mb: 4 }}>
                      No se pudieron cargar los talleres. La creación/edición del tutor puede estar limitada.
                    </MUI.Alert>
                  )}

                  <MUI.Grid container spacing={4}>
                    {/* Sección de datos personales */}
                    <MUI.Grid item xs={12}>
                      <MUI.Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 3,
                          borderBottom: `2px solid ${theme.palette.primary.main}`,
                          pb: 2
                        }}
                      >
                        <MUI.Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 40,
                            height: 40
                          }}
                        >
                          <Icons.Person />
                        </MUI.Avatar>
                        <MUI.Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: theme.palette.primary.main
                          }}
                        >
                          Datos Personales
                        </MUI.Typography>
                      </MUI.Box>
                    </MUI.Grid>
                    
                    <MUI.Grid item xs={12} md={6}>
                      <MUI.TextField
                        label="Nombre"
                        variant="outlined"
                        fullWidth
                        value={formNombre}
                        onChange={(e) => setFormNombre(e.target.value)}
                        error={formErrors.nombre_tutor}
                        helperText={formErrors.nombre_tutor ? 'Este campo es obligatorio' : ''}
                        InputProps={{
                          startAdornment: (
                            <MUI.InputAdornment position="start">
                              <Icons.Badge />
                            </MUI.InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </MUI.Grid>

                    <MUI.Grid item xs={12} md={6}>
                      <MUI.TextField
                        label="Apellido"
                        variant="outlined"
                        fullWidth
                        value={formApellido}
                        onChange={(e) => setFormApellido(e.target.value)}
                        error={formErrors.apellido_tutor}
                        helperText={formErrors.apellido_tutor ? 'Este campo es obligatorio' : ''}
                        InputProps={{
                          startAdornment: (
                            <MUI.InputAdornment position="start">
                              <Icons.Badge />
                            </MUI.InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </MUI.Grid>

                    <MUI.Grid item xs={12}>
                      <MUI.FormControl fullWidth required error={formErrors.taller_tutor}>
                        <MUI.InputLabel>Taller</MUI.InputLabel>
                        <MUI.Select
                          value={formTaller}
                          onChange={(e) => setFormTaller(e.target.value)}
                          label="Taller"
                          sx={{
                            ...commonSelectStyles,
                            '& .MuiOutlinedInput-notchedOutline': {
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                              },
                            },
                          }}
                          MenuProps={commonMenuProps}
                        >
                          {talleres.map((taller) => (
                            <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                              {taller.nombre_taller}
                            </MUI.MenuItem>
                          ))}
                        </MUI.Select>
                        {formErrors.taller_tutor && (
                          <MUI.FormHelperText>Seleccione un taller</MUI.FormHelperText>
                        )}
                      </MUI.FormControl>
                    </MUI.Grid>

                    {/* Sección de contacto */}
                    <MUI.Grid item xs={12}>
                      <MUI.Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 3,
                          mt: 2,
                          borderBottom: `2px solid ${theme.palette.primary.main}`,
                          pb: 2
                        }}
                      >
                        <MUI.Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 40,
                            height: 40
                          }}
                        >
                          <Icons.ContactPhone />
                        </MUI.Avatar>
                        <MUI.Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: theme.palette.primary.main
                          }}
                        >
                          Datos de Contacto
                        </MUI.Typography>
                      </MUI.Box>
                    </MUI.Grid>

                    <MUI.Grid item xs={12} md={6}>
                      <MUI.TextField
                        label="Teléfono"
                        variant="outlined"
                        fullWidth
                        value={formTelefono}
                        onChange={(e) => {
                          setFormTelefono(e.target.value);
                          checkTelefono(e.target.value);
                        }}
                        onBlur={(e) => checkTelefono(e.target.value)}
                        error={formErrors.telefono_contacto || !telefonoDisponible}
                        helperText={formErrors.telefono_contacto 
                          ? 'Este campo es obligatorio' 
                          : !telefonoDisponible 
                            ? 'Este número de teléfono ya está registrado' 
                            : ''}
                        InputProps={{
                          startAdornment: (
                            <MUI.InputAdornment position="start">
                              <Icons.Phone />
                            </MUI.InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </MUI.Grid>

                    <MUI.Grid item xs={12} md={6}>
                      <MUI.TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        type="email"
                        value={formEmail}
                        onChange={(e) => {
                          setFormEmail(e.target.value);
                          checkEmail(e.target.value);
                        }}
                        onBlur={(e) => checkEmail(e.target.value)}
                        error={formErrors.email_contacto || !emailDisponible}
                        helperText={formErrors.email_contacto 
                          ? 'Email válido obligatorio' 
                          : !emailDisponible 
                            ? 'Este correo electrónico ya está registrado' 
                            : ''}
                        InputProps={{
                          startAdornment: (
                            <MUI.InputAdornment position="start">
                              <Icons.Email />
                            </MUI.InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </MUI.Grid>

                    {/* Sección de datos de usuario */}
                    <MUI.Grid item xs={12}>
                      <MUI.Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 3,
                          mt: 2,
                          borderBottom: `2px solid ${theme.palette.primary.main}`,
                          pb: 2
                        }}
                      >
                        <MUI.Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 40,
                            height: 40
                          }}
                        >
                          <Icons.AccountCircle />
                        </MUI.Avatar>
                        <MUI.Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: theme.palette.primary.main
                          }}
                        >
                          Datos de Usuario
                        </MUI.Typography>
                      </MUI.Box>
                    </MUI.Grid>

                    <MUI.Grid item xs={12} md={6}>
                      <MUI.TextField
                        label="Nombre de Usuario"
                        variant="outlined"
                        fullWidth
                        value={formUsuario}
                        onChange={(e) => {
                          setFormUsuario(e.target.value);
                          checkUsuario(e.target.value);
                        }}
                        onBlur={(e) => checkUsuario(e.target.value)}
                        error={formErrors.dato_usuario || !usuarioDisponible}
                        helperText={formErrors.dato_usuario 
                          ? 'Este campo es obligatorio' 
                          : !usuarioDisponible 
                            ? 'Este nombre de usuario ya está en uso' 
                            : ''}
                        disabled={!!selectedTutor}
                        InputProps={{
                          startAdornment: (
                            <MUI.InputAdornment position="start">
                              <Icons.Person />
                            </MUI.InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </MUI.Grid>

                    <MUI.Grid item xs={12} md={6}>
                      <MUI.TextField
                        label={selectedTutor ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
                        variant="outlined"
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        value={formContrasena}
                        onChange={(e) => setFormContrasena(e.target.value)}
                        error={formErrors.contrasena_usuario}
                        helperText={formErrors.contrasena_usuario ? 'Este campo es obligatorio' : ''}
                        InputProps={{
                          startAdornment: (
                            <MUI.InputAdornment position="start">
                              <Icons.Lock />
                            </MUI.InputAdornment>
                          ),
                          endAdornment: (
                            <MUI.InputAdornment position="end">
                              <MUI.IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <Icons.VisibilityOff /> : <Icons.Visibility />}
                              </MUI.IconButton>
                            </MUI.InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    </MUI.Grid>

                    <MUI.Grid item xs={12}>
                      <MUI.Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end', 
                          gap: 2, 
                          mt: 4,
                          borderTop: `1px solid ${theme.palette.divider}`,
                          paddingTop: 4
                        }}
                      >
                        <MUI.Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<Icons.Close />}
                          onClick={handleCloseDialog}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          Cancelar
                        </MUI.Button>
                        <MUI.Button
                          variant="contained"
                          color="primary"
                          startIcon={<Icons.Save />}
                          onClick={handleSaveTutor}
                          disabled={isReadOnly || loading}
                          sx={{
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark
                            }
                          }}
                        >
                          {selectedTutor ? 'Actualizar' : 'Guardar'}
                        </MUI.Button>
                      </MUI.Box>
                    </MUI.Grid>
                  </MUI.Grid>
                </MUI.Paper>
              </TabPanel>
            </TabContext>
          )}
        </MUI.Container>

        {/* Diálogo de confirmación para eliminar */}
        <MUI.Dialog
          open={confirmDesactivar}
          onClose={handleCancelDesactivar}
          maxWidth="xs"
          fullWidth
        >
          <MUI.DialogTitle sx={{ 
            backgroundColor: theme.palette.error.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Icons.Warning /> Eliminar Tutor
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2 }}>
            <MUI.Typography variant="body1">
              ¿Está seguro de que desea eliminar al tutor "{tutorADesactivar?.nombre_tutor} {tutorADesactivar?.apellido_tutor}"?
            </MUI.Typography>
            <MUI.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              El tutor se marcará como eliminado y no podrá acceder al sistema.
            </MUI.Typography>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={handleCancelDesactivar} startIcon={<Icons.Close />}>
              Cancelar
            </MUI.Button>
            <MUI.Button 
              variant="contained" 
              color="error" 
              onClick={handleConfirmDesactivar}
              startIcon={<Icons.Delete />}
            >
              Eliminar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Diálogo de confirmación para restaurar */}
        <MUI.Dialog
          open={confirmRestaurar}
          onClose={handleCancelRestaurar}
          maxWidth="xs"
          fullWidth
        >
          <MUI.DialogTitle sx={{ 
            backgroundColor: theme.palette.success.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Icons.RestoreFromTrash /> Restaurar Tutor
          </MUI.DialogTitle>
          <MUI.DialogContent sx={{ mt: 2 }}>
            <MUI.Typography variant="body1">
              ¿Está seguro de que desea restaurar al tutor "{tutorARestaurar?.nombre_tutor} {tutorARestaurar?.apellido_tutor}"?
            </MUI.Typography>
            <MUI.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              El tutor se marcará como activo y podrá acceder nuevamente al sistema.
            </MUI.Typography>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={handleCancelRestaurar} startIcon={<Icons.Close />}>
              Cancelar
            </MUI.Button>
            <MUI.Button 
              variant="contained" 
              color="success" 
              onClick={handleConfirmRestaurar}
              startIcon={<Icons.RestoreFromTrash />}
            >
              Restaurar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Snackbar para notificaciones */}
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MUI.Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            elevation={6}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
}

export default TutoresPage; 