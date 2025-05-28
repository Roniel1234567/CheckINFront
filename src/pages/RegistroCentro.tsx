import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import { 
  CompaniesCRUD, 
  type Provincia,
  type Ciudad,
  type Sector
} from '../../services/CompaniesCRUD';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';

interface FormData {
  nombre_centro: string;
  telefono_contacto: string;
  email_contacto: string;
  calle_dir: string;
  num_res_dir: string;
  sector_dir: number;
  nombre_persona_contacto: string;
  apellido_persona_contacto: string;
  telefono_persona_contacto: string;
  extension_persona_contacto: string;
  departamento_persona_contacto: string;
  usuario_empresa: string;
  contrasena_empresa: string;
}

function RegistroCentro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre_centro: '',
    telefono_contacto: '',
    email_contacto: '',
    calle_dir: '',
    num_res_dir: '',
    sector_dir: 0,
    nombre_persona_contacto: '',
    apellido_persona_contacto: '',
    telefono_persona_contacto: '',
    extension_persona_contacto: '',
    departamento_persona_contacto: '',
    usuario_empresa: '',
    contrasena_empresa: '',
  });

  const [selectedProvincia, setSelectedProvincia] = useState<number | ''>('');
  const [selectedCiudad, setSelectedCiudad] = useState<number | ''>('');
  const [selectedSector, setSelectedSector] = useState<number | ''>('');

  // Estados para ubicaciones
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);

  const [nombreCentroDisponible, setNombreCentroDisponible] = useState(true);
  const [telefonoDisponible, setTelefonoDisponible] = useState(true);
  const [emailDisponible, setEmailDisponible] = useState(true);
  const [usuarioEmpresaDisponible, setUsuarioEmpresaDisponible] = useState(true);

  // Límites de caracteres para dirección
  const MAX_CALLE = 50;
  const MAX_NUM_RES = 20;

  // Variable de validación para dirección
  const direccionInvalida =
    formData.calle_dir.length > MAX_CALLE ||
    formData.num_res_dir.length > MAX_NUM_RES;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const provinciasData = await CompaniesCRUD.getProvincias();
        setProvincias(provinciasData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const checkUsuarioEmpresa = async (usuario: string) => {
    if (!usuario) return;
    try {
      await userService.getUserByUsername(usuario);
      setUsuarioEmpresaDisponible(false);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setUsuarioEmpresaDisponible(true);
      } else {
        setUsuarioEmpresaDisponible(true);
      }
    }
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validaciones en tiempo real
    if (name === 'nombre_centro') {
      checkNombreCentro(value);
    } else if (name === 'telefono_contacto') {
      checkTelefono(value);
    } else if (name === 'email_contacto') {
      checkEmail(value);
    } else if (name === 'usuario_empresa') {
      checkUsuarioEmpresa(value);
    }
  };

  const checkNombreCentro = async (nombre: string) => {
    try {
      const response = await CompaniesCRUD.checkNombreCentro(nombre);
      setNombreCentroDisponible(!response.exists);
    } catch (error) {
      console.error('Error al verificar nombre:', error);
      setNombreCentroDisponible(true);
    }
  };

  const checkTelefono = async (telefono: string) => {
    try {
      const response = await CompaniesCRUD.checkTelefono(telefono);
      setTelefonoDisponible(!response.exists);
    } catch (error) {
      setTelefonoDisponible(true);
    }
  };

  const checkEmail = async (email: string) => {
    try {
      const response = await CompaniesCRUD.checkEmail(email);
      setEmailDisponible(!response.exists);
    } catch (error) {
      setEmailDisponible(true);
    }
  };

  const handleProvinciaChange = async (event: MUI.SelectChangeEvent<number | ''>) => {
    const provinciaId = event.target.value as number;
    setSelectedProvincia(provinciaId);
    setSelectedCiudad('');
    setSelectedSector('');
    
    try {
      const ciudadesData = await CompaniesCRUD.getCiudadesByProvincia(provinciaId);
      setCiudades(ciudadesData);
    } catch (error) {
      console.error('Error al cargar ciudades:', error);
      toast.error('Error al cargar las ciudades');
    }
  };

  const handleCiudadChange = async (event: MUI.SelectChangeEvent<number | ''>) => {
    const ciudadId = event.target.value as number;
    setSelectedCiudad(ciudadId);
    setSelectedSector('');
    
    try {
      const sectoresData = await CompaniesCRUD.getSectoresByCiudad(ciudadId);
      setSectores(sectoresData);
    } catch (error) {
      console.error('Error al cargar sectores:', error);
      toast.error('Error al cargar los sectores');
    }
  };

  const handleSectorChange = (event: MUI.SelectChangeEvent<number | ''>) => {
    const sectorId = event.target.value as number;
    setSelectedSector(sectorId);
    setFormData(prev => ({
      ...prev,
      sector_dir: sectorId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear usuario de empresa
      const nuevoUsuario = await userService.createUser({
        dato_usuario: formData.usuario_empresa,
        contrasena_usuario: formData.contrasena_empresa,
        rol_usuario: 2, // SIEMPRE 2 para empresa
      });
      
      const usuarioCreado = Array.isArray(nuevoUsuario) ? nuevoUsuario[0] : nuevoUsuario;
      const idUsuario = usuarioCreado.id_usuario;

      // 2. Crear el centro de trabajo
      await CompaniesCRUD.createCompany({
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
        persona_contacto_empresa: {
          nombre_persona_contacto: formData.nombre_persona_contacto,
          apellido_persona_contacto: formData.apellido_persona_contacto,
          telefono: formData.telefono_persona_contacto,
          extension: formData.extension_persona_contacto,
          departamento: formData.departamento_persona_contacto
        },
        id_usuario: idUsuario
      });

      toast.success('¡Registro exitoso! Por favor, inicie sesión.');
      navigate('/login');
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error('Error al registrar la empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MUI.Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
        overflow: 'auto'
      }}
    >
      <MUI.Container 
        maxWidth="md" 
        sx={{ 
          py: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <MUI.Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            borderRadius: 2,
            width: '100%',
            maxWidth: '100%',
            mx: 'auto',
            overflow: 'hidden'
          }}
        >
          <MUI.Box sx={{ mb: 4, textAlign: 'center' }}>
            <MUI.Avatar
              src="https://storage.googleapis.com/educoco2020/82/foto_empresa/logo_821663703399_1663703399V19BCd9KY1u6alR.png"
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
            />
            <MUI.Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 600 }}>
              IPISA
            </MUI.Typography>
            <MUI.Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Instituto Politécnico Industrial de Santiago
            </MUI.Typography>
          </MUI.Box>

          <MUI.Typography variant="h4" sx={{ mb: 4, color: '#1a237e', textAlign: 'center' }}>
            Registro de Centro de Trabajo
          </MUI.Typography>

          <MUI.Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              '& .MuiGrid-container': {
                width: '100%',
                margin: 0
              }
            }}
          >
            <MUI.Grid container spacing={3}>
              {/* Información básica */}
              <MUI.Grid item xs={12}>
                <MUI.Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
                  Información del Centro
                </MUI.Typography>
              </MUI.Grid>

              <MUI.Grid item xs={12}>
                <MUI.TextField
                  fullWidth
                  label="Nombre del Centro"
                  name="nombre_centro"
                  value={formData.nombre_centro}
                  onChange={handleFormChange}
                  error={!nombreCentroDisponible}
                  helperText={!nombreCentroDisponible ? "Este nombre ya está en uso" : ""}
                  required
                />
              </MUI.Grid>

              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono_contacto"
                  value={formData.telefono_contacto}
                  onChange={handleFormChange}
                  error={!telefonoDisponible}
                  helperText={!telefonoDisponible ? "Este teléfono ya está registrado" : ""}
                  required
                />
              </MUI.Grid>

              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Email"
                  name="email_contacto"
                  type="email"
                  value={formData.email_contacto}
                  onChange={handleFormChange}
                  error={!emailDisponible}
                  helperText={!emailDisponible ? "Este email ya está registrado" : ""}
                  required
                />
              </MUI.Grid>

              {/* Dirección */}
              <MUI.Grid item xs={12}>
                <MUI.Typography variant="h6" sx={{ my: 2, color: '#1a237e' }}>
                  Dirección
                </MUI.Typography>
              </MUI.Grid>

              <MUI.Grid item xs={12} md={4}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Provincia</MUI.InputLabel>
                  <MUI.Select
                    value={selectedProvincia}
                    onChange={handleProvinciaChange}
                    label="Provincia"
                    required
                  >
                    {provincias.map((provincia) => (
                      <MUI.MenuItem key={provincia.id_provincia} value={provincia.id_provincia}>
                        {provincia.nombre_provincia}
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>

              <MUI.Grid item xs={12} md={4}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Ciudad</MUI.InputLabel>
                  <MUI.Select
                    value={selectedCiudad}
                    onChange={handleCiudadChange}
                    label="Ciudad"
                    disabled={!selectedProvincia}
                    required
                  >
                    {ciudades.map((ciudad) => (
                      <MUI.MenuItem key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                        {ciudad.nombre_ciudad}
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>

              <MUI.Grid item xs={12} md={4}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Sector</MUI.InputLabel>
                  <MUI.Select
                    value={selectedSector}
                    onChange={handleSectorChange}
                    label="Sector"
                    disabled={!selectedCiudad}
                    required
                  >
                    {sectores.map((sector) => (
                      <MUI.MenuItem key={sector.id_sector} value={sector.id_sector}>
                        {sector.nombre_sector}
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>

              <MUI.Grid item xs={12} md={8}>
                <MUI.TextField
                  fullWidth
                  label="Calle"
                  name="calle_dir"
                  value={formData.calle_dir}
                  onChange={handleFormChange}
                  required
                  error={formData.calle_dir.length > MAX_CALLE}
                  helperText={`${formData.calle_dir.length}/${MAX_CALLE}`}
                />
              </MUI.Grid>

              <MUI.Grid item xs={12} md={4}>
                <MUI.TextField
                  fullWidth
                  label="Número"
                  name="num_res_dir"
                  value={formData.num_res_dir}
                  onChange={handleFormChange}
                  required
                  error={formData.num_res_dir.length > MAX_NUM_RES}
                  helperText={`${formData.num_res_dir.length}/${MAX_NUM_RES}`}
                />
              </MUI.Grid>

              {/* Persona de contacto */}
              <MUI.Grid item xs={12}>
                <MUI.Typography variant="h6" sx={{ my: 2, color: '#1a237e' }}>
                  Persona de Contacto
                </MUI.Typography>
              </MUI.Grid>

              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Nombre"
                  name="nombre_persona_contacto"
                  value={formData.nombre_persona_contacto}
                  onChange={handleFormChange}
                  required
                />
              </MUI.Grid>

              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Apellido"
                  name="apellido_persona_contacto"
                  value={formData.apellido_persona_contacto}
                  onChange={handleFormChange}
                  required
                />
              </MUI.Grid>

              <MUI.Grid item xs={12} md={4}>
                <MUI.TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono_persona_contacto"
                  value={formData.telefono_persona_contacto}
                  onChange={handleFormChange}
                  required
                />
              </MUI.Grid>

              <MUI.Grid item xs={12} md={4}>
                <MUI.TextField
                  fullWidth
                  label="Extensión"
                  name="extension_persona_contacto"
                  value={formData.extension_persona_contacto}
                  onChange={handleFormChange}
                />
              </MUI.Grid>

              <MUI.Grid item xs={12} md={4}>
                <MUI.TextField
                  fullWidth
                  label="Departamento"
                  name="departamento_persona_contacto"
                  value={formData.departamento_persona_contacto}
                  onChange={handleFormChange}
                  required
                />
              </MUI.Grid>

              {/* Credenciales de acceso */}
              <MUI.Grid item xs={12}>
                <MUI.Typography variant="h6" sx={{ my: 2, color: '#1a237e' }}>
                  Credenciales de Acceso
                </MUI.Typography>
              </MUI.Grid>

              <MUI.Grid item xs={12} md={6}>
                <MUI.TextField
                  fullWidth
                  label="Usuario"
                  name="usuario_empresa"
                  value={formData.usuario_empresa}
                  onChange={handleFormChange}
                  error={!usuarioEmpresaDisponible}
                  helperText={!usuarioEmpresaDisponible ? "Este usuario ya existe" : ""}
                  required
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
                  required
                />
              </MUI.Grid>

              <MUI.Grid item xs={12}>
                <MUI.Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || !nombreCentroDisponible || !telefonoDisponible || !emailDisponible || !usuarioEmpresaDisponible || direccionInvalida}
                  sx={{ mt: 3 }}
                >
                  {loading ? <MUI.CircularProgress size={24} /> : "Registrar Centro"}
                </MUI.Button>
              </MUI.Grid>
            </MUI.Grid>
          </MUI.Box>
        </MUI.Paper>
      </MUI.Container>
    </MUI.Box>
  );
}

export default RegistroCentro; 