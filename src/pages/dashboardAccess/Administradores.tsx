import { useState, useEffect } from 'react';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import { administradorService, type Administrador } from '../../services/administradorService';
import { userService, type NuevoUsuario } from '../../services/userService';
import contactService from '../../services/contactService';

interface FormData {
  nombre_adm: string;
  apellido_adm: string;
  puesto_adm: string;
  telefono_contacto: string;
  email_contacto: string;
  usuario_adm: string;
  contrasena_adm: string;
}

interface NuevoContacto {
  telefono_contacto: string;
  email_contacto: string;
  estado_contacto: string;
}

interface CreatedUser {
  id_usuario: number;
  dato_usuario: string;
  estado_usuario: string;
}

interface CreatedContacto {
  id_contacto: number;
  telefono_contacto: string;
  email_contacto: string;
}

function Administradores() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdministrador, setSelectedAdministrador] = useState<Administrador | null>(null);
  const [activeTab, setActiveTab] = useState('1');
  const [showInactivos, setShowInactivos] = useState(false);
  const notifications = 4;

  // Estado para confirmar desactivación
  const [confirmDesactivar, setConfirmDesactivar] = useState(false);
  const [administradorADesactivar, setAdministradorADesactivar] = useState<Administrador | null>(null);

  // Estado para confirmar restauración
  const [confirmRestaurar, setConfirmRestaurar] = useState(false);
  const [administradorARestaurar, setAdministradorARestaurar] = useState<Administrador | null>(null);

  // Form states
  const [formData, setFormData] = useState<FormData>({
    nombre_adm: '',
    apellido_adm: '',
    puesto_adm: '',
    telefono_contacto: '',
    email_contacto: '',
    usuario_adm: '',
    contrasena_adm: ''
  });

  // Error states
  const [formErrors, setFormErrors] = useState({
    nombre_adm: false,
    apellido_adm: false,
    puesto_adm: false,
    telefono_contacto: false,
    email_contacto: false,
    usuario_adm: false,
    contrasena_adm: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Estado para verificar disponibilidad
  const [usuarioDisponible, setUsuarioDisponible] = useState(true);
  const [telefonoDisponible, setTelefonoDisponible] = useState(true);
  const [emailDisponible, setEmailDisponible] = useState(true);

  useEffect(() => {
    loadAdministradores();
  }, []);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const loadAdministradores = async () => {
    try {
      setLoading(true);
      const data = await administradorService.getAllAdministradores();
      setAdministradores(data);
    } catch (error) {
      console.error('Error al cargar administradores:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los administradores',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUsuario = async (usuario: string) => {
    if (!usuario) return;
    try {
      await userService.getUserByUsername(usuario);
      setUsuarioDisponible(false);
      setFormErrors(prev => ({
        ...prev,
        usuario_adm: true
      }));
      setSnackbar({
        open: true,
        message: 'Este nombre de usuario ya existe',
        severity: 'error'
      });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setUsuarioDisponible(true);
        setFormErrors(prev => ({
          ...prev,
          usuario_adm: false
        }));
      }
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

  const handleSave = async () => {
    // Validar campos requeridos
    const errors = {
      nombre_adm: !formData.nombre_adm,
      apellido_adm: !formData.apellido_adm,
      puesto_adm: !formData.puesto_adm,
      telefono_contacto: !formData.telefono_contacto,
      email_contacto: !formData.email_contacto,
      usuario_adm: !formData.usuario_adm,
      contrasena_adm: !selectedAdministrador ? !formData.contrasena_adm : false
    };

    setFormErrors(errors);

    // Si hay errores, no continuar
    if (Object.values(errors).some(error => error)) {
      setSnackbar({
        open: true,
        message: 'Por favor, complete todos los campos requeridos',
        severity: 'error'
      });
      return;
    }

    // Validar disponibilidad de usuario
    if (!selectedAdministrador) {
      try {
        await userService.getUserByUsername(formData.usuario_adm);
        setSnackbar({
          open: true,
          message: 'Este nombre de usuario ya existe',
          severity: 'error'
        });
        return;
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          setSnackbar({
            open: true,
            message: 'Error al verificar disponibilidad del usuario',
            severity: 'error'
          });
          return;
        }
      }
    }

    try {
      setLoading(true);

      if (selectedAdministrador) {
        // Modo edición
        if (selectedAdministrador.usuario_adm && 
            (formData.usuario_adm !== selectedAdministrador.usuario_adm.dato_usuario || formData.contrasena_adm)) {
          await userService.updateUser(selectedAdministrador.usuario_adm.id_usuario, {
            dato_usuario: formData.usuario_adm,
            contrasena_usuario: formData.contrasena_adm || undefined,
            rol_usuario: 4,
          });
        }

        await administradorService.updateAdministrador(selectedAdministrador.id_adm, {
          nombre_adm: formData.nombre_adm,
          apellido_adm: formData.apellido_adm,
          puesto_adm: formData.puesto_adm,
          contacto_adm: {
            ...selectedAdministrador.contacto_adm,
            telefono_contacto: formData.telefono_contacto,
            email_contacto: formData.email_contacto,
          },
        });

        setSnackbar({
          open: true,
          message: 'Administrador actualizado correctamente',
          severity: 'success',
        });
      } else {
        // Modo creación
        try {
          // 1. Crear usuario primero
          const userData: NuevoUsuario = {
            dato_usuario: formData.usuario_adm,
            contrasena_usuario: formData.contrasena_adm,
            rol_usuario: 4
          };
          const nuevoUsuario = await userService.createUser(userData);
          
          if (!nuevoUsuario || !('id_usuario' in nuevoUsuario)) {
            throw new Error('Error al crear el usuario: respuesta inválida del servidor');
          }

          // 2. Crear contacto
          const contactoData = {
            telefono_contacto: formData.telefono_contacto,
            email_contacto: formData.email_contacto,
            estado_contacto: 'Activo'
          };
          const nuevoContacto = await contactService.createContacto(contactoData);
          
          if (!nuevoContacto || !('id_contacto' in nuevoContacto)) {
            throw new Error('Error al crear el contacto: respuesta inválida del servidor');
          }

          // 3. Crear administrador
          const adminData = {
            nombre_adm: formData.nombre_adm,
            apellido_adm: formData.apellido_adm,
            puesto_adm: formData.puesto_adm,
            usuario_adm: nuevoUsuario.id_usuario,
            contacto_adm: nuevoContacto.id_contacto
          };
          
          await administradorService.createAdministrador(adminData);

          setSnackbar({
            open: true,
            message: 'Administrador registrado correctamente',
            severity: 'success'
          });
          
          setActiveTab('1');
          loadAdministradores();
        } catch (error) {
          console.error('Error específico:', error);
          setSnackbar({
            open: true,
            message: error instanceof Error ? error.message : 'Error al crear el administrador',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error al guardar administrador:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el administrador',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (administrador?: Administrador) => {
    if (administrador) {
      setSelectedAdministrador(administrador);
      setFormData({
        nombre_adm: administrador.nombre_adm,
        apellido_adm: administrador.apellido_adm,
        puesto_adm: administrador.puesto_adm,
        telefono_contacto: administrador.contacto_adm.telefono_contacto,
        email_contacto: administrador.contacto_adm.email_contacto,
        usuario_adm: administrador.usuario_adm.dato_usuario,
        contrasena_adm: ''
      });
    } else {
      setSelectedAdministrador(null);
      setFormData({
        nombre_adm: '',
        apellido_adm: '',
        puesto_adm: '',
        telefono_contacto: '',
        email_contacto: '',
        usuario_adm: '',
        contrasena_adm: ''
      });
    }
    setActiveTab('2');
  };

  const handleDesactivarClick = (administrador: Administrador) => {
    setAdministradorADesactivar(administrador);
    setConfirmDesactivar(true);
  };

  const handleCancelDesactivar = () => {
    setConfirmDesactivar(false);
    setAdministradorADesactivar(null);
  };

  const handleConfirmDesactivar = async () => {
    if (!administradorADesactivar) return;
    
    try {
      setLoading(true);
      
      await userService.updateUser(administradorADesactivar.usuario_adm.id_usuario, {
        estado_usuario: 'Eliminado'
      });
      
      setSnackbar({
        open: true,
        message: 'Administrador eliminado correctamente',
        severity: 'success'
      });
      
      loadAdministradores();
      handleCancelDesactivar();
    } catch (error) {
      console.error('Error al eliminar administrador:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el administrador',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurarClick = (administrador: Administrador) => {
    setAdministradorARestaurar(administrador);
    setConfirmRestaurar(true);
  };

  const handleCancelRestaurar = () => {
    setConfirmRestaurar(false);
    setAdministradorARestaurar(null);
  };

  const handleConfirmRestaurar = async () => {
    if (!administradorARestaurar) return;
    
    try {
      setLoading(true);
      
      await userService.updateUser(administradorARestaurar.usuario_adm.id_usuario, {
        estado_usuario: 'Activo'
      });
      
      setSnackbar({
        open: true,
        message: 'Administrador restaurado correctamente',
        severity: 'success'
      });
      
      loadAdministradores();
      handleCancelRestaurar();
    } catch (error) {
      console.error('Error al restaurar administrador:', error);
      setSnackbar({
        open: true,
        message: 'Error al restaurar el administrador',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrar administradores
  const administradoresFiltrados = administradores.filter(admin => {
    const matchesSearch = 
      admin.nombre_adm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.apellido_adm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.puesto_adm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.contacto_adm.email_contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.contacto_adm.telefono_contacto.toLowerCase().includes(searchTerm.toLowerCase());

    if (!showInactivos) {
      return matchesSearch && admin.usuario_adm.estado_usuario === 'Activo';
    }
    
    return matchesSearch;
  });

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

      <MUI.Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DashboardAppBar notifications={notifications} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

        {loading && (
          <MUI.Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <MUI.CircularProgress color="inherit" />
          </MUI.Backdrop>
        )}

        <TabContext value={activeTab}>
          <MUI.Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <TabList onChange={handleTabChange}>
              <MUI.Tab label="Administradores" value="1" icon={<Icons.ViewList />} />
              <MUI.Tab 
                label={selectedAdministrador ? "Editar Administrador" : "Nuevo Administrador"} 
                value="2" 
                icon={selectedAdministrador ? <Icons.Edit /> : <Icons.Add />} 
              />
            </TabList>
          </MUI.Box>

          <TabPanel value="1">
            <MUI.Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <MUI.TextField
                variant="outlined"
                placeholder="Buscar administrador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flexGrow: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <MUI.InputAdornment position="start">
                      <Icons.Search />
                    </MUI.InputAdornment>
                  ),
                }}
              />

              <MUI.FormControlLabel
                control={
                  <MUI.Switch
                    checked={showInactivos}
                    onChange={(e) => setShowInactivos(e.target.checked)}
                  />
                }
                label="Mostrar inactivos"
              />

              <MUI.Button
                variant="contained"
                startIcon={<Icons.Add />}
                onClick={() => handleOpenDialog()}
              >
                Nuevo Administrador
              </MUI.Button>
            </MUI.Box>

            <MUI.TableContainer component={MUI.Paper}>
              <MUI.Table>
                <MUI.TableHead>
                  <MUI.TableRow>
                    <MUI.TableCell>Nombre</MUI.TableCell>
                    <MUI.TableCell>Puesto</MUI.TableCell>
                    <MUI.TableCell>Contacto</MUI.TableCell>
                    <MUI.TableCell>Usuario</MUI.TableCell>
                    <MUI.TableCell>Estado</MUI.TableCell>
                    <MUI.TableCell>Acciones</MUI.TableCell>
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {administradoresFiltrados.map((admin) => (
                    <MUI.TableRow key={admin.id_adm}>
                      <MUI.TableCell>
                        {admin.nombre_adm} {admin.apellido_adm}
                      </MUI.TableCell>
                      <MUI.TableCell>{admin.puesto_adm}</MUI.TableCell>
                      <MUI.TableCell>
                        <div>{admin.contacto_adm.email_contacto}</div>
                        <div>{admin.contacto_adm.telefono_contacto}</div>
                      </MUI.TableCell>
                      <MUI.TableCell>{admin.usuario_adm.dato_usuario}</MUI.TableCell>
                      <MUI.TableCell>
                        <MUI.Chip
                          label={admin.usuario_adm.estado_usuario}
                          color={admin.usuario_adm.estado_usuario === 'Activo' ? 'success' : 'error'}
                          size="small"
                        />
                      </MUI.TableCell>
                      <MUI.TableCell>
                        <MUI.IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(admin)}
                          size="small"
                        >
                          <Icons.Edit />
                        </MUI.IconButton>
                        {admin.usuario_adm.estado_usuario === 'Activo' ? (
                          <MUI.IconButton
                            color="error"
                            onClick={() => handleDesactivarClick(admin)}
                            size="small"
                          >
                            <Icons.Delete />
                          </MUI.IconButton>
                        ) : (
                          <MUI.IconButton
                            color="success"
                            onClick={() => handleRestaurarClick(admin)}
                            size="small"
                          >
                            <Icons.RestoreFromTrash />
                          </MUI.IconButton>
                        )}
                      </MUI.TableCell>
                    </MUI.TableRow>
                  ))}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.TableContainer>
          </TabPanel>

          <TabPanel value="2">
            <MUI.Grid container spacing={2}>
              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Nombre"
                  value={formData.nombre_adm}
                  onChange={(e) => setFormData({ ...formData, nombre_adm: e.target.value })}
                  error={formErrors.nombre_adm}
                  helperText={formErrors.nombre_adm ? 'Este campo es requerido' : ''}
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Apellido"
                  value={formData.apellido_adm}
                  onChange={(e) => setFormData({ ...formData, apellido_adm: e.target.value })}
                  error={formErrors.apellido_adm}
                  helperText={formErrors.apellido_adm ? 'Este campo es requerido' : ''}
                />
              </MUI.Grid>
              <MUI.Grid item xs={12}>
                <MUI.TextField
                  fullWidth
                  label="Puesto"
                  value={formData.puesto_adm}
                  onChange={(e) => setFormData({ ...formData, puesto_adm: e.target.value })}
                  error={formErrors.puesto_adm}
                  helperText={formErrors.puesto_adm ? 'Este campo es requerido' : ''}
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono_contacto}
                  onChange={(e) => {
                    setFormData({ ...formData, telefono_contacto: e.target.value });
                    checkTelefono(e.target.value);
                  }}
                  error={formErrors.telefono_contacto || !telefonoDisponible}
                  helperText={
                    formErrors.telefono_contacto 
                      ? 'Este campo es requerido' 
                      : !telefonoDisponible 
                        ? 'Este teléfono ya está registrado' 
                        : ''
                  }
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Email"
                  value={formData.email_contacto}
                  onChange={(e) => {
                    setFormData({ ...formData, email_contacto: e.target.value });
                    checkEmail(e.target.value);
                  }}
                  error={formErrors.email_contacto || !emailDisponible}
                  helperText={
                    formErrors.email_contacto 
                      ? 'Este campo es requerido' 
                      : !emailDisponible 
                        ? 'Este email ya está registrado' 
                        : ''
                  }
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Usuario"
                  value={formData.usuario_adm}
                  onChange={(e) => {
                    setFormData({ ...formData, usuario_adm: e.target.value });
                    checkUsuario(e.target.value);
                  }}
                  disabled={!!selectedAdministrador}
                  error={formErrors.usuario_adm || !usuarioDisponible}
                  helperText={
                    formErrors.usuario_adm 
                      ? 'Este campo es requerido' 
                      : !usuarioDisponible 
                        ? 'Este usuario ya existe' 
                        : ''
                  }
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  type="password"
                  label="Contraseña"
                  value={formData.contrasena_adm}
                  onChange={(e) => setFormData({ ...formData, contrasena_adm: e.target.value })}
                  error={formErrors.contrasena_adm}
                  helperText={
                    formErrors.contrasena_adm 
                      ? 'Este campo es requerido' 
                      : selectedAdministrador 
                        ? 'Dejar en blanco para mantener la contraseña actual' 
                        : ''
                  }
                />
              </MUI.Grid>
              <MUI.Grid item xs={12}>
                <MUI.Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <MUI.Button
                    onClick={() => setActiveTab('1')}
                    startIcon={<Icons.Cancel />}
                  >
                    Cancelar
                  </MUI.Button>
                  <MUI.Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<Icons.Save />}
                    disabled={!usuarioDisponible || !telefonoDisponible || !emailDisponible}
                  >
                    {selectedAdministrador ? 'Actualizar' : 'Guardar'}
                  </MUI.Button>
                </MUI.Box>
              </MUI.Grid>
            </MUI.Grid>
          </TabPanel>
        </TabContext>

        {/* Diálogo de confirmación para desactivar */}
        <MUI.Dialog
          open={confirmDesactivar}
          onClose={handleCancelDesactivar}
        >
          <MUI.DialogTitle>Eliminar Administrador</MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.Typography>
              ¿Está seguro de que desea eliminar este administrador?
            </MUI.Typography>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={handleCancelDesactivar}>Cancelar</MUI.Button>
            <MUI.Button onClick={handleConfirmDesactivar} color="error">
              Eliminar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Diálogo de confirmación para restaurar */}
        <MUI.Dialog
          open={confirmRestaurar}
          onClose={handleCancelRestaurar}
        >
          <MUI.DialogTitle>Restaurar Administrador</MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.Typography>
              ¿Está seguro de que desea restaurar este administrador?
            </MUI.Typography>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={handleCancelRestaurar}>Cancelar</MUI.Button>
            <MUI.Button onClick={handleConfirmRestaurar} color="primary">
              Restaurar
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Snackbar para mensajes */}
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MUI.Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Administradores; 