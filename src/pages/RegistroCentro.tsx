import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/index.scss';
import * as MUI from "@mui/material";
import { 
  CompaniesCRUD, 
  type Provincia,
  type Ciudad,
  type Sector
} from '../../services/CompaniesCRUD';
import { SelectChangeEvent } from '@mui/material';
import { personaContactoEmpresaService } from '../services/personaContactoEmpresaService';
import contactService from '../services/contactService';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import Footer from '../components/Footer';

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

// Extender el tipo CentroTrabajo para incluir id_usu
interface CentroTrabajoCreate {
  nombre_centro: string;
  estado_centro: 'Activo' | 'Inactivo';
  contacto_centro: {
    telefono_contacto: string;
    email_contacto: string;
    estado_contacto: string;
  };
  direccion_centro: {
    sector_dir: number;
    calle_dir: string;
    num_res_dir: string;
    estado_dir: string;
  };
  id_usu: number;
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
    estado_centro: 'Activo',
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

  const [error, setError] = useState<string>('');

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
        if (setError) setError('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const checkUsuarioEmpresa = async (usuario: string) => {
    if (!usuario) return;
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/buscar/${usuario}`);
      if (response.ok) {
        setUsuarioEmpresaDisponible(false); // Si existe, no está disponible
      } else if (response.status === 404) {
        setUsuarioEmpresaDisponible(true); // No existe, está disponible
      } else {
        setUsuarioEmpresaDisponible(true); // Si hay error de red, asume disponible
      }
    } catch (error) {
      setUsuarioEmpresaDisponible(true); // Si hay error, asume disponible
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
    if (!nombre) {
      setNombreCentroDisponible(true);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/centros-trabajo/existe-nombre/${encodeURIComponent(nombre)}`);
      const data = await res.json();
      setNombreCentroDisponible(!data.exists);
    } catch {
      setNombreCentroDisponible(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones antes de enviar
      if (!nombreCentroDisponible || !telefonoDisponible || !emailDisponible || !usuarioEmpresaDisponible) {
        toast.error('Por favor, corrija los errores en el formulario');
        return;
      }

      // 1. Crear usuario de empresa
      const nuevoUsuario = await userService.createUser({
        dato_usuario: formData.usuario_empresa,
        contrasena_usuario: formData.contrasena_empresa,
        rol_usuario: 2, // SIEMPRE 2 para empresa
      });
      
      const usuarioCreado = Array.isArray(nuevoUsuario) ? nuevoUsuario[0] : nuevoUsuario;
      const idUsuario = usuarioCreado.id_usuario;

      // 2. Crear el centro de trabajo
      const centroDatos: CentroTrabajoCreate = {
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
        id_usu: idUsuario
      };

      const centroCreado = await CompaniesCRUD.createCompany(centroDatos);

      // 3. Crear la persona de contacto empresa
      const personaContactoPayload = {
        nombre_persona_contacto: formData.nombre_persona_contacto,
        apellido_persona_contacto: formData.apellido_persona_contacto,
        telefono: formData.telefono_persona_contacto,
        extension: formData.extension_persona_contacto,
        departamento: formData.departamento_persona_contacto,
        centro_trabajo: centroCreado.id_centro
      };
      await personaContactoEmpresaService.createPersonaContactoEmpresa(personaContactoPayload);

      toast.success('¡Registro exitoso! Su solicitud está pendiente de aprobación.');
      navigate('/login');
    } catch (error) {
      console.error('Error al registrar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar la empresa';
      toast.error(errorMessage);
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
        background: 'linear-gradient(135deg, #1a365d 0%, #2a4a7f 100%)',
        overflow: 'auto',
        position: 'relative'
      }}
    >
      {/* Elementos decorativos de fondo */}
      {[...Array(5)].map((_, i) => (
        <MUI.Box
          key={i}
          sx={{
            position: 'absolute',
            width: { xs: '200px', md: '400px' },
            height: { xs: '200px', md: '400px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${MUI.alpha('#ffffff', 0.03)} 0%, ${MUI.alpha('#ffffff', 0)} 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: 'translate(-50%, -50%)',
            animation: 'float 30s infinite',
            animationDelay: `${i * 4}s`,
            pointerEvents: 'none',
            zIndex: 0,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translate(-50%, -50%)',
              },
              '50%': {
                transform: 'translate(-50%, calc(-50% + 40px))',
              },
            },
          }}
        />
      ))}

      <MUI.Container 
        maxWidth="md" 
        sx={{ 
          py: 6,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <MUI.Paper 
          elevation={24} 
          sx={{ 
            p: { xs: 3, sm: 6 }, 
            borderRadius: 4,
            width: '100%',
            maxWidth: '100%',
            mx: 'auto',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1a237e, #3949ab)',
            }
          }}
        >
          <MUI.Box sx={{ mb: 5, textAlign: 'center' }}>
            <MUI.Avatar
              src="https://storage.googleapis.com/educoco2020/82/foto_empresa/logo_821663703399_1663703399V19BCd9KY1u6alR.png"
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
            <MUI.Typography 
              variant="h4" 
              sx={{ 
                color: '#1a237e', 
                fontWeight: 700,
                mb: 1
              }}
            >
              IPISA
            </MUI.Typography>
            <MUI.Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '1.1rem'
              }}
            >
              Instituto Politécnico Industrial de Santiago
            </MUI.Typography>
          </MUI.Box>

          <MUI.Typography 
            variant="h4" 
            sx={{ 
              mb: 4, 
              color: '#1a237e', 
              textAlign: 'center',
              fontWeight: 600,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                width: '60px',
                height: '4px',
                background: 'linear-gradient(90deg, #1a237e, #3949ab)',
                transform: 'translateX(-50%)',
                borderRadius: '2px'
              }
            }}
          >
            Registro de Centro de Trabajo
          </MUI.Typography>

          <MUI.Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              '& .MuiGrid-container': {
                width: '100%',
                margin: 0
              },
              '& .MuiTextField-root, & .MuiFormControl-root': {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1a237e',
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px',
                      borderColor: '#1a237e',
                    }
                  }
                },
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: '#1a237e'
                  }
                }
              }
            }}
          >
            <MUI.Grid container spacing={4} component="div">
              {/* Sección: Información General */}
              <MUI.Grid item xs={12} component="div">
                <MUI.Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1a365d',
                    mb: 3,
                    fontWeight: 600,
                    borderBottom: '2px solid #1a365d',
                    paddingBottom: 1
                  }}
                >
                  Información General
                </MUI.Typography>
                <MUI.Grid container spacing={3} component="div">
                  <MUI.Grid item xs={12} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Nombre del Centro"
                      name="nombre_centro"
                      value={formData.nombre_centro}
                      onChange={handleFormChange}
                      variant="outlined"
                      error={!nombreCentroDisponible && !!formData.nombre_centro}
                      helperText={!nombreCentroDisponible && !!formData.nombre_centro ? 'Ya existe un centro con ese nombre' : ''}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '1.1rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono_contacto"
                      value={formData.telefono_contacto}
                      onChange={handleFormChange}
                      variant="outlined"
                      error={!telefonoDisponible && !!formData.telefono_contacto}
                      helperText={!telefonoDisponible && !!formData.telefono_contacto ? 'Ya existe un contacto con ese teléfono' : ''}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Email"
                      name="email_contacto"
                      type="email"
                      value={formData.email_contacto}
                      onChange={handleFormChange}
                      variant="outlined"
                      error={!emailDisponible && !!formData.email_contacto}
                      helperText={!emailDisponible && !!formData.email_contacto ? 'Ya existe un contacto con ese email' : ''}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Grid>

              {/* Sección: Dirección */}
              <MUI.Grid item xs={12} component="div">
                <MUI.Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1a365d',
                    mb: 3,
                    fontWeight: 600,
                    borderBottom: '2px solid #1a365d',
                    paddingBottom: 1
                  }}
                >
                  Dirección
                </MUI.Typography>
                <MUI.Grid container spacing={3} component="div">
                  <MUI.Grid item xs={12} md={4} component="div">
                    <MUI.FormControl 
                      fullWidth 
                      required
                      sx={{
                        minWidth: '300px',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1a365d',
                            borderWidth: '2px'
                          },
                          '& .MuiSelect-select': {
                            padding: '16px 14px',
                            minHeight: '25px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1a365d',
                          '&.Mui-focused': {
                            color: '#1a365d'
                          }
                        }
                      }}
                    >
                      <MUI.InputLabel>Provincia</MUI.InputLabel>
                      <MUI.Select
                        value={selectedProvincia}
                        onChange={handleProvinciaChange}
                        label="Provincia"
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              width: '350px',
                              '& .MuiMenuItem-root': {
                                padding: '12px 24px',
                                '&:hover': {
                                  backgroundColor: 'rgba(26, 54, 93, 0.08)'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'rgba(26, 54, 93, 0.15)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(26, 54, 93, 0.2)'
                                  }
                                }
                              }
                            }
                          }
                        }}
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
                  </MUI.Grid>
                  
                  <MUI.Grid item xs={12} md={4} component="div">
                    <MUI.FormControl 
                      fullWidth 
                      required
                      sx={{
                        minWidth: '300px',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1a365d',
                            borderWidth: '2px'
                          },
                          '& .MuiSelect-select': {
                            padding: '16px 14px',
                            minHeight: '25px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1a365d',
                          '&.Mui-focused': {
                            color: '#1a365d'
                          }
                        }
                      }}
                    >
                      <MUI.InputLabel>Ciudad</MUI.InputLabel>
                      <MUI.Select
                        value={selectedCiudad}
                        onChange={handleCiudadChange}
                        label="Ciudad"
                        disabled={!selectedProvincia}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              width: '350px',
                              '& .MuiMenuItem-root': {
                                padding: '12px 24px',
                                '&:hover': {
                                  backgroundColor: 'rgba(26, 54, 93, 0.08)'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'rgba(26, 54, 93, 0.15)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(26, 54, 93, 0.2)'
                                  }
                                }
                              }
                            }
                          }
                        }}
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
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={4} component="div">
                    <MUI.FormControl 
                      fullWidth 
                      required
                      sx={{
                        minWidth: '300px',
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1a365d',
                            borderWidth: '2px'
                          },
                          '& .MuiSelect-select': {
                            padding: '16px 14px',
                            minHeight: '25px',
                            display: 'flex',
                            alignItems: 'center'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#1a365d',
                          '&.Mui-focused': {
                            color: '#1a365d'
                          }
                        }
                      }}
                    >
                      <MUI.InputLabel>Sector</MUI.InputLabel>
                      <MUI.Select
                        value={selectedSector}
                        onChange={handleSectorChange}
                        label="Sector"
                        disabled={!selectedCiudad}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              width: '350px',
                              '& .MuiMenuItem-root': {
                                padding: '12px 24px',
                                '&:hover': {
                                  backgroundColor: 'rgba(26, 54, 93, 0.08)'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'rgba(26, 54, 93, 0.15)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(26, 54, 93, 0.2)'
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        <MUI.MenuItem value="">
                          <em>Seleccione un sector</em>
                        </MUI.MenuItem>
                        {sectores.map((sector) => (
                          <MUI.MenuItem key={sector.id_sec} value={sector.id_sec}>
                            {sector.sector}
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Calle"
                      name="calle_dir"
                      value={formData.calle_dir}
                      onChange={handleFormChange}
                      variant="outlined"
                      required
                      inputProps={{ maxLength: MAX_CALLE }}
                      error={formData.calle_dir.length > MAX_CALLE}
                      helperText={
                        formData.calle_dir.length > MAX_CALLE
                          ? `Máximo ${MAX_CALLE} caracteres`
                          : `${formData.calle_dir.length}/${MAX_CALLE}`
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Residencia"
                      name="num_res_dir"
                      value={formData.num_res_dir}
                      onChange={handleFormChange}
                      variant="outlined"
                      required
                      inputProps={{ maxLength: MAX_NUM_RES }}
                      error={formData.num_res_dir.length > MAX_NUM_RES}
                      helperText={
                        formData.num_res_dir.length > MAX_NUM_RES
                          ? `Máximo ${MAX_NUM_RES} caracteres`
                          : `${formData.num_res_dir.length}/${MAX_NUM_RES}`
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Grid>

              {/* Sección: Usuario de la Empresa */}
              <MUI.Grid item xs={12} component="div">
                <MUI.Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1a365d',
                    mb: 3,
                    fontWeight: 600,
                    borderBottom: '2px solid #1a365d',
                    paddingBottom: 1
                  }}
                >
                  Usuario de la Empresa
                </MUI.Typography>
                <MUI.Grid container spacing={3} component="div">
                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Usuario"
                      name="usuario_empresa"
                      value={formData.usuario_empresa}
                      onChange={handleFormChange}
                      variant="outlined"
                      error={!usuarioEmpresaDisponible}
                      helperText={!usuarioEmpresaDisponible ? "Este usuario ya existe" : ""}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Contraseña"
                      name="contrasena_empresa"
                      type="password"
                      value={formData.contrasena_empresa}
                      onChange={handleFormChange}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Grid>

              {/* Sección: Persona de Contacto */}
              <MUI.Grid item xs={12} component="div">
                <MUI.Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#1a365d',
                    mb: 3,
                    fontWeight: 600,
                    borderBottom: '2px solid #1a365d',
                    paddingBottom: 1
                  }}
                >
                  Persona de Contacto
                </MUI.Typography>
                <MUI.Grid container spacing={3} component="div">
                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Nombre"
                      name="nombre_persona_contacto"
                      value={formData.nombre_persona_contacto}
                      onChange={handleFormChange}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Apellido"
                      name="apellido_persona_contacto"
                      value={formData.apellido_persona_contacto}
                      onChange={handleFormChange}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono_persona_contacto"
                      value={formData.telefono_persona_contacto}
                      onChange={handleFormChange}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={3} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Extensión"
                      name="extension_persona_contacto"
                      value={formData.extension_persona_contacto}
                      onChange={handleFormChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={3} component="div">
                    <MUI.TextField
                      fullWidth
                      label="Departamento"
                      name="departamento_persona_contacto"
                      value={formData.departamento_persona_contacto}
                      onChange={handleFormChange}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Grid>

              <MUI.Grid item xs={12} component="div">
                <MUI.Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || !nombreCentroDisponible || !telefonoDisponible || !emailDisponible || !usuarioEmpresaDisponible || direccionInvalida}
                  sx={{ 
                    mt: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #1a365d, #2a4a7f)',
                    boxShadow: '0 4px 20px rgba(26, 54, 93, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #142849, #1f3861)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 25px rgba(26, 54, 93, 0.5)',
                    }
                  }}
                >
                  {loading ? (
                    <MUI.CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Registrar Centro'
                  )}
                </MUI.Button>
              </MUI.Grid>
            </MUI.Grid>
          </MUI.Box>
        </MUI.Paper>
      </MUI.Container>

      {/* Loading overlay mejorado */}
      {loading && (
        <MUI.Backdrop
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(26, 35, 126, 0.8)',
            zIndex: 9999,
            gap: 2
          }}
          open={loading}
        >
          <MUI.CircularProgress sx={{ color: 'white' }} />
          <MUI.Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
            Procesando registro...
          </MUI.Typography>
        </MUI.Backdrop>
      )}
      <Footer />
    </MUI.Box>
  );
}

export default RegistroCentro; 