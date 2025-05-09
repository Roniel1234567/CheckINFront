import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../../components/SideBar';
import DashboardAppBar from '../../../components/DashboardAppBar';
import tallerService, { Taller, FamiliaProfesional, NuevoTaller, NuevaFamilia } from '../../../services/tallerService';

function Talleres() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [familias, setFamilias] = useState<FamiliaProfesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formularios
  const [nuevoTaller, setNuevoTaller] = useState<NuevoTaller>({
    nombre_taller: '',
    familia_taller: '',
    cod_titulo_taller: '',
    horaspas_taller: 0
  });

  const [nuevaFamilia, setNuevaFamilia] = useState<NuevaFamilia>({
    id_fam: '',
    nombre_fam: ''
  });

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [talleresData, familiasData] = await Promise.all([
        tallerService.getAllTalleres(),
        tallerService.getAllFamilias()
      ]);
      setTalleres(talleresData);
      setFamilias(familiasData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTab = (_: any, value: number) => setTab(value);

  const handleNuevoTaller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTaller.nombre_taller || !nuevoTaller.familia_taller || !nuevoTaller.cod_titulo_taller || !nuevoTaller.horaspas_taller) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    try {
      setLoading(true);
      await tallerService.createTaller(nuevoTaller);
      setSuccess('Taller registrado exitosamente');
      setNuevoTaller({
        nombre_taller: '',
        familia_taller: '',
        cod_titulo_taller: '',
        horaspas_taller: 0
      });
      loadData();
    } catch (err) {
      setError('Error al registrar el taller');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaFamilia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaFamilia.id_fam || !nuevaFamilia.nombre_fam) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }
    try {
      setLoading(true);
      await tallerService.createFamilia(nuevaFamilia);
      setSuccess('Familia profesional registrada exitosamente');
      setNuevaFamilia({
        id_fam: '',
        nombre_fam: ''
      });
      loadData();
    } catch (err) {
      setError('Error al registrar la familia profesional');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'Activo' | 'Inactivo') => {
    try {
      setLoading(true);
      await tallerService.updateTaller(id, { estado_taller: newStatus });
      setSuccess('Estado actualizado exitosamente');
      loadData();
    } catch (err) {
      setError('Error al actualizar el estado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTalleres = talleres.filter(taller =>
    `${taller.nombre_taller} ${taller.cod_titulo_taller}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar notifications={3} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />
        {loading && (
          <MUI.Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.8)', zIndex: 9999 }}>
            <MUI.CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          </MUI.Box>
        )}
        {error && (
          <MUI.Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </MUI.Alert>
        )}
        {success && (
          <MUI.Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </MUI.Alert>
        )}
        {/* Encabezado */}
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ mb: 1, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icons.Build sx={{ fontSize: '2.5rem' }} />
            Talleres
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Gestión de talleres y familias profesionales
          </MUI.Typography>
        </MUI.Box>
        {/* Tabs */}
        <MUI.Box sx={{ px: { xs: 1, md: 4 } }}>
          <MUI.Tabs value={tab} onChange={handleTab} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
            <MUI.Tab icon={<Icons.ListAlt />} label="Listado" />
            <MUI.Tab icon={<Icons.Add />} label="Registrar Taller" />
            <MUI.Tab icon={<Icons.Category />} label="Familias Profesionales" />
          </MUI.Tabs>
        </MUI.Box>
        {/* Listado de Talleres */}
        {tab === 0 && (
          <MUI.Box sx={{ px: { xs: 1, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.13)' } }}>
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <MUI.TextField
                  placeholder="Buscar taller..."
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <Icons.Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  sx={{ flexGrow: 1, minWidth: 200 }}
                />
              </MUI.Box>
              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Código</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Familia</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Horas</MUI.TableCell>
                      <MUI.TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {filteredTalleres.map(taller => (
                      <MUI.TableRow key={taller.id_taller} hover sx={{ transition: 'all 0.3s', '&:hover': { backgroundColor: MUI.alpha(theme.palette.primary.main, 0.05) } }}>
                        <MUI.TableCell>{taller.nombre_taller}</MUI.TableCell>
                        <MUI.TableCell>{taller.cod_titulo_taller}</MUI.TableCell>
                        <MUI.TableCell>{taller.familia?.nombre_fam}</MUI.TableCell>
                        <MUI.TableCell>{taller.horaspas_taller}</MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.Chip 
                            label={taller.estado_taller} 
                            color={taller.estado_taller === 'Activo' ? 'success' : 'error'} 
                            size="small" 
                            icon={taller.estado_taller === 'Activo' ? <Icons.CheckCircle /> : <Icons.Cancel />} 
                          />
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </MUI.Paper>
          </MUI.Box>
        )}
        {/* Registro de Taller */}
        {tab === 1 && (
          <MUI.Box sx={{ px: { xs: 1, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 3, maxWidth: 600, mx: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.13)' } }}>
              <MUI.Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.Add /> Registrar Taller
              </MUI.Typography>
              <form onSubmit={handleNuevoTaller}>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12}>
                    <MUI.TextField 
                      label="Nombre del Taller" 
                      required 
                      fullWidth 
                      value={nuevoTaller.nombre_taller} 
                      onChange={e => setNuevoTaller({ ...nuevoTaller, nombre_taller: e.target.value })} 
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12}>
                    <MUI.FormControl fullWidth required>
                      <MUI.InputLabel>Familia Profesional</MUI.InputLabel>
                      <MUI.Select
                        value={nuevoTaller.familia_taller}
                        label="Familia Profesional"
                        onChange={e => setNuevoTaller({ ...nuevoTaller, familia_taller: e.target.value })}
                      >
                        {familias.map(familia => (
                          <MUI.MenuItem key={familia.id_fam} value={familia.id_fam}>
                            {familia.nombre_fam}
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField 
                      label="Código del Título" 
                      required 
                      fullWidth 
                      value={nuevoTaller.cod_titulo_taller} 
                      onChange={e => setNuevoTaller({ ...nuevoTaller, cod_titulo_taller: e.target.value })} 
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField 
                      label="Horas de Pasantía" 
                      required 
                      fullWidth 
                      type="number"
                      value={nuevoTaller.horaspas_taller} 
                      onChange={e => setNuevoTaller({ ...nuevoTaller, horaspas_taller: Number(e.target.value) })} 
                    />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <MUI.Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    startIcon={<Icons.Save />} 
                    sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                  >
                    Registrar
                  </MUI.Button>
                </MUI.Box>
              </form>
            </MUI.Paper>
          </MUI.Box>
        )}
        {/* Familias Profesionales */}
        {tab === 2 && (
          <MUI.Box sx={{ px: { xs: 1, md: 4 }, pb: 4 }}>
            <MUI.Paper elevation={3} sx={{ borderRadius: 3, p: 3, maxWidth: 600, mx: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.13)' } }}>
              <MUI.Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.Category /> Registrar Familia Profesional
              </MUI.Typography>
              <form onSubmit={handleNuevaFamilia}>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField 
                      label="ID Familia (3 caracteres)" 
                      required 
                      fullWidth 
                      value={nuevaFamilia.id_fam} 
                      onChange={e => setNuevaFamilia({ ...nuevaFamilia, id_fam: e.target.value.toUpperCase() })}
                      inputProps={{ maxLength: 3 }}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField 
                      label="Nombre de la Familia" 
                      required 
                      fullWidth 
                      value={nuevaFamilia.nombre_fam} 
                      onChange={e => setNuevaFamilia({ ...nuevaFamilia, nombre_fam: e.target.value })} 
                    />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <MUI.Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    startIcon={<Icons.Save />} 
                    sx={{ borderRadius: 2, fontWeight: 'bold', px: 4, transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                  >
                    Registrar
                  </MUI.Button>
                </MUI.Box>
              </form>
              <MUI.Divider sx={{ my: 4 }} />
              <MUI.Typography variant="h6" sx={{ mb: 2 }}>Familias Registradas</MUI.Typography>
              <MUI.TableContainer>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow>
                      <MUI.TableCell>ID</MUI.TableCell>
                      <MUI.TableCell>Nombre</MUI.TableCell>
                      <MUI.TableCell>Estado</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {familias.map(familia => (
                      <MUI.TableRow key={familia.id_fam}>
                        <MUI.TableCell>{familia.id_fam}</MUI.TableCell>
                        <MUI.TableCell>{familia.nombre_fam}</MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.Chip 
                            label={familia.estado_fam} 
                            color={familia.estado_fam === 'Activo' ? 'success' : 'error'} 
                            size="small" 
                            icon={familia.estado_fam === 'Activo' ? <Icons.CheckCircle /> : <Icons.Cancel />} 
                          />
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </MUI.Paper>
          </MUI.Box>
        )}
      </MUI.Box>
    </MUI.Box>
  );
}

export default Talleres; 