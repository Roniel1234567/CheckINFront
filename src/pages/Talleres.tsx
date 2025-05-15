import { useState, useEffect } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import axios from 'axios';
import { SelectChangeEvent } from '@mui/material/Select';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface FamiliaProfesional {
  id_fam: string;
  nombre_fam: string;
  estado_fam: 'Activo' | 'Inactivo' | 'Eliminado';
}

interface Taller {
  id_taller: string;
  nombre_taller: string;
  familia_taller: FamiliaProfesional;
  cod_titulo_taller: string;
  horaspas_taller: number;
  estado_taller: 'Activo' | 'Inactivo';
}

interface ApiError {
  message: string;
}

function Talleres() {
  const [tab, setTab] = useState(0);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [familias, setFamilias] = useState<FamiliaProfesional[]>([]);
  const [form, setForm] = useState({
    nombre_taller: '',
    familia_taller: '',
    cod_titulo_taller: '',
    horaspas_taller: '',
    estado_taller: 'Activo' as const,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarTalleres();
    cargarFamilias();
  }, []);

  // Cuando se cargan las familias, si hay alguna, selecciona la primera por defecto
  useEffect(() => {
    if (familias.length > 0 && !form.familia_taller) {
      setForm(f => ({ ...f, familia_taller: String(familias[0].id_fam) }));
    }
  }, [familias]);

  const cargarTalleres = async () => {
    try {
      setLoading(true);
      console.log('Intentando cargar talleres...');
      const response = await api.get<Taller[]>('/api/talleres');
      console.log('Respuesta de talleres:', response.data);
      setTalleres(response.data);
      setError('');
    } catch (error: unknown) {
      console.error('Error detallado al cargar talleres:', error);
      const axiosError = error as { response?: { data?: ApiError } };
      if (axiosError.response?.data) {
        setError(axiosError.response.data.message || 'Error al cargar los talleres');
      } else {
        setError('Error al cargar los talleres');
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarFamilias = async () => {
    try {
      console.log('Intentando cargar familias...');
      const response = await api.get<FamiliaProfesional[]>('/api/familias-profesionales');
      console.log('Respuesta de familias:', response.data);
      setFamilias(response.data);
      setError('');
    } catch (error: unknown) {
      console.error('Error detallado al cargar familias:', error);
      const axiosError = error as { response?: { data?: ApiError } };
      if (axiosError.response?.data) {
        setError(axiosError.response.data.message || 'Error al cargar las familias profesionales');
      } else {
        setError('Error al cargar las familias profesionales');
      }
    }
  };

  const handleTabChange = (e: React.SyntheticEvent, newValue: number) => setTab(newValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    setForm({ ...form, [e.target.name as string]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre_taller || !form.familia_taller || !form.cod_titulo_taller || !form.horaspas_taller) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    // Convertir familia_taller a número
    const familiaTallerValue = Number(form.familia_taller);
    if (isNaN(familiaTallerValue)) {
      setError('La familia profesional seleccionada no es válida.');
      return;
    }
    try {
      setLoading(true);
      const tallerData = {
        ...form,
        horaspas_taller: parseFloat(form.horaspas_taller),
        familia_taller: familiaTallerValue
      };
      await api.post('/api/talleres', tallerData);
      setSuccess('¡Taller registrado correctamente!');
      setForm({
        nombre_taller: '',
        familia_taller: familias.length > 0 ? String(familias[0].id_fam) : '',
        cod_titulo_taller: '',
        horaspas_taller: '',
        estado_taller: 'Activo',
      });
      await cargarTalleres();
    } catch (error: unknown) {
      console.error('Error al registrar taller:', error);
      const axiosError = error as { response?: { data?: ApiError } };
      if (axiosError.response?.data) {
        setError(axiosError.response.data.message || 'Error al registrar el taller');
      } else {
        setError('Error al registrar el taller');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este taller?')) {
      try {
        setLoading(true);
        await api.delete(`/api/talleres/${id}`);
        setSuccess('Taller eliminado correctamente');
        await cargarTalleres();
      } catch (error: unknown) {
        console.error('Error al eliminar taller:', error);
        const axiosError = error as { response?: { data?: ApiError } };
        if (axiosError.response?.data) {
          setError(axiosError.response.data.message || 'Error al eliminar el taller');
        } else {
          setError('Error al eliminar el taller');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MUI.Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, margin: 'auto', minHeight: '80vh' }}>
      <MUI.Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icons.Build fontSize="large" /> Talleres
      </MUI.Typography>
      <MUI.Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary' }}>
        Gestión de talleres y familias profesionales
      </MUI.Typography>

      {error && (
        <MUI.Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </MUI.Alert>
      )}
      {success && (
        <MUI.Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </MUI.Alert>
      )}

      <MUI.Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <MUI.Tab icon={<Icons.ListAlt />} label="Listado" />
        <MUI.Tab icon={<Icons.Add />} label="Registrar Taller" />
        <MUI.Tab icon={<Icons.AccountTree />} label="Familias Profesionales" />
      </MUI.Tabs>

      {loading && (
        <MUI.Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <MUI.CircularProgress />
        </MUI.Box>
      )}

      {/* Listado de talleres */}
      {tab === 0 && !loading && (
        <MUI.Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2 }}>
          <MUI.Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Lista de Talleres
          </MUI.Typography>
          {talleres.length === 0 ? (
            <MUI.Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No hay talleres registrados
            </MUI.Typography>
          ) : (
            <MUI.Table>
              <MUI.TableHead>
                <MUI.TableRow>
                  <MUI.TableCell>ID</MUI.TableCell>
                  <MUI.TableCell>Nombre</MUI.TableCell>
                  <MUI.TableCell>Familia</MUI.TableCell>
                  <MUI.TableCell>Código Título</MUI.TableCell>
                  <MUI.TableCell>Horas Pasantía</MUI.TableCell>
                  <MUI.TableCell>Estado</MUI.TableCell>
                  <MUI.TableCell>Acciones</MUI.TableCell>
                </MUI.TableRow>
              </MUI.TableHead>
              <MUI.TableBody>
                {talleres.map((taller) => (
                  <MUI.TableRow key={taller.id_taller}>
                    <MUI.TableCell>{taller.id_taller}</MUI.TableCell>
                    <MUI.TableCell>{taller.nombre_taller}</MUI.TableCell>
                    <MUI.TableCell>{taller.familia_taller.nombre_fam}</MUI.TableCell>
                    <MUI.TableCell>{taller.cod_titulo_taller}</MUI.TableCell>
                    <MUI.TableCell>{taller.horaspas_taller}</MUI.TableCell>
                    <MUI.TableCell>{taller.estado_taller}</MUI.TableCell>
                    <MUI.TableCell>
                      <MUI.IconButton
                        color="error"
                        onClick={() => handleDelete(taller.id_taller)}
                        size="small"
                      >
                        <Icons.Delete />
                      </MUI.IconButton>
                    </MUI.TableCell>
                  </MUI.TableRow>
                ))}
              </MUI.TableBody>
            </MUI.Table>
          )}
        </MUI.Paper>
      )}

      {/* Registrar taller */}
      {tab === 1 && !loading && (
        <MUI.Paper sx={{ p: 4, borderRadius: 4, boxShadow: 2, maxWidth: 500, mx: 'auto' }}>
          <MUI.Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icons.Add /> Registrar Taller
          </MUI.Typography>
          <form onSubmit={handleSubmit}>
            <MUI.Stack spacing={2}>
              <MUI.TextField
                label="Nombre del Taller *"
                name="nombre_taller"
                value={form.nombre_taller}
                onChange={handleChange}
                fullWidth
                required
                disabled={loading}
              />
              <MUI.FormControl fullWidth required>
                <MUI.InputLabel id="familia-label">Familia Profesional *</MUI.InputLabel>
                <MUI.Select
                  labelId="familia-label"
                  name="familia_taller"
                  value={form.familia_taller}
                  label="Familia Profesional *"
                  onChange={handleChange}
                  disabled={loading || familias.length === 0}
                >
                  {familias.map((fam) => (
                    <MUI.MenuItem key={fam.id_fam} value={String(fam.id_fam)}>
                      {fam.nombre_fam}
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>
              <MUI.Stack direction="row" spacing={2}>
                <MUI.TextField
                  label="Código del Título *"
                  name="cod_titulo_taller"
                  value={form.cod_titulo_taller}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={loading}
                />
                <MUI.TextField
                  label="Horas de Pasantía *"
                  name="horaspas_taller"
                  type="number"
                  value={form.horaspas_taller}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={loading}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </MUI.Stack>
              <MUI.FormControl fullWidth>
                <MUI.InputLabel id="estado-label">Estado</MUI.InputLabel>
                <MUI.Select
                  labelId="estado-label"
                  name="estado_taller"
                  value={form.estado_taller}
                  label="Estado"
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MUI.MenuItem value="Activo">Activo</MUI.MenuItem>
                  <MUI.MenuItem value="Inactivo">Inactivo</MUI.MenuItem>
                </MUI.Select>
              </MUI.FormControl>
              <MUI.Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                <MUI.Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Icons.Save />}
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar'}
                </MUI.Button>
              </MUI.Box>
            </MUI.Stack>
          </form>
        </MUI.Paper>
      )}

      {/* Familias profesionales */}
      {tab === 2 && !loading && (
        <MUI.Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2, maxWidth: 500, mx: 'auto' }}>
          <MUI.Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icons.AccountTree /> Familias Profesionales
          </MUI.Typography>
          {familias.length === 0 ? (
            <MUI.Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No hay familias profesionales registradas
            </MUI.Typography>
          ) : (
            <MUI.List>
              {familias.map((fam) => (
                <MUI.ListItem key={fam.id_fam} divider>
                  <MUI.ListItemIcon>
                    <Icons.FolderSpecial color="primary" />
                  </MUI.ListItemIcon>
                  <MUI.ListItemText
                    primary={fam.nombre_fam}
                    secondary={`ID: ${fam.id_fam} - Estado: ${fam.estado_fam}`}
                  />
                </MUI.ListItem>
              ))}
            </MUI.List>
          )}
        </MUI.Paper>
      )}
    </MUI.Box>
  );
}

export default Talleres; 