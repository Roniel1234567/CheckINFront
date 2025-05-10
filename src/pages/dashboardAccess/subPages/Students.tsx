/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect } from 'react';
import '../../../styles/index.scss';
import * as MUI from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, DateRange as DateRangeIcon } from '@mui/icons-material';
import studentService, { Estudiante, NuevoEstudiante } from '../../../services/studentService';
import tallerService, { Taller } from '../../../services/tallerService';
import contactService, { NuevoContacto } from '../../../services/contactService';
import { SelectChangeEvent } from '@mui/material';
import direccionService, { Sector } from '../../../services/direccionService';
import cicloEscolarService, { CicloEscolar, NuevoCicloEscolar } from '../../../services/cicloEscolarService';
import { internshipService, Provincia, Ciudad } from '../../../services/internshipService';

const Students = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipoDocumento: 'Cédula',
    documento: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    taller: '',
    // Dirección
    provincia: '',
    ciudad: '',
    sector: '',
    calle: '',
    numero: '',
    // Ciclo escolar
    inicioCiclo: '',
    finCiclo: '',
    estadoCiclo: 'Actual',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleProvinciaChange = (e: SelectChangeEvent<string>) => {
    setFormData(prev => ({ ...prev, provincia: e.target.value, ciudad: '', sector: '' }));
  };

  const handleCiudadChange = (e: SelectChangeEvent<string>) => {
    setFormData(prev => ({ ...prev, ciudad: e.target.value, sector: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Crear dirección
      const nuevaDireccion = await direccionService.createDireccion({
        sector_dir: Number(formData.sector),
        calle_dir: formData.calle,
        num_res_dir: formData.numero,
      });
      // 2. Crear ciclo escolar
      const nuevoCiclo = await cicloEscolarService.createCicloEscolar({
        inicio_ciclo: Number(formData.inicioCiclo),
        fin_ciclo: Number(formData.finCiclo),
        estado_ciclo: formData.estadoCiclo,
      });
      // 3. Crear estudiante
      const nuevoEstudiante: NuevoEstudiante = {
        tipo_documento_est: formData.tipoDocumento,
        documento_id_est: formData.documento,
        nombre_est: formData.nombre,
        apellido_est: formData.apellido,
        fecha_nac_est: formData.fechaNacimiento,
        contacto_est: formData.email,
        taller_est: formData.taller,
        direccion_id: String(nuevaDireccion.id_dir),
        ciclo_escolar_est: String(nuevoCiclo.id_ciclo),
      };
      await studentService.createStudent(nuevoEstudiante);
      setOpenForm(false);
      loadData();
      setFormData({
        tipoDocumento: 'Cédula',
        documento: '',
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        telefono: '',
        email: '',
        taller: '',
        provincia: '',
        ciudad: '',
        sector: '',
        calle: '',
        numero: '',
        inicioCiclo: '',
        finCiclo: '',
        estadoCiclo: 'Actual',
      });
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      setError('Error al crear el estudiante');
    }
  };

  useEffect(() => {
    loadData();
    internshipService.getAllProvincias().then(setProvincias);
  }, []);

  useEffect(() => {
    if (formData.provincia) {
      internshipService.getCiudadesByProvincia(Number(formData.provincia)).then(setCiudades);
    } else {
      setCiudades([]);
    }
    setFormData(prev => ({ ...prev, ciudad: '', sector: '' }));
  }, [formData.provincia]);

  useEffect(() => {
    if (formData.ciudad) {
      internshipService.getSectoresByCiudad(Number(formData.ciudad)).then(setSectores);
    } else {
      setSectores([]);
    }
    setFormData(prev => ({ ...prev, sector: '' }));
  }, [formData.ciudad]);

  const loadData = async () => {
    try {
      console.log('Iniciando carga de datos...');
      const [estudiantesData, talleresData] = await Promise.all([
        studentService.getAllStudents(),
        tallerService.getAllTalleres()
      ]);
      console.log('Datos recibidos:', { estudiantes: estudiantesData, talleres: talleresData });
      setEstudiantes(estudiantesData);
      setTalleres(talleresData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    }
  };

  const filteredEstudiantes = estudiantes.filter(estudiante => 
    estudiante.nombre_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.apellido_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.documento_id_est.includes(searchTerm)
  );

  if (error) {
    return (
      <MUI.Box sx={{ p: 2 }}>
        <MUI.Alert severity="error">{error}</MUI.Alert>
      </MUI.Box>
    );
  }

  return (
    <MUI.Box sx={{ p: 2 }}>
      <MUI.Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <MUI.TextField
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
          }}
          sx={{ width: 300 }}
        />
        <MUI.Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Nuevo Estudiante
        </MUI.Button>
      </MUI.Box>

      <MUI.TableContainer>
        <MUI.Table>
          <MUI.TableHead>
            <MUI.TableRow>
              <MUI.TableCell>Documento</MUI.TableCell>
              <MUI.TableCell>Nombre</MUI.TableCell>
              <MUI.TableCell>Taller</MUI.TableCell>
              <MUI.TableCell>Contacto</MUI.TableCell>
              <MUI.TableCell>Fechas</MUI.TableCell>
              <MUI.TableCell>Póliza</MUI.TableCell>
              <MUI.TableCell>Acciones</MUI.TableCell>
            </MUI.TableRow>
          </MUI.TableHead>
          <MUI.TableBody>
            {filteredEstudiantes.map((estudiante) => (
              <MUI.TableRow key={estudiante.documento_id_est}>
                <MUI.TableCell>{estudiante.documento_id_est}</MUI.TableCell>
                <MUI.TableCell>{`${estudiante.nombre_est} ${estudiante.apellido_est}`}</MUI.TableCell>
                <MUI.TableCell>{estudiante.taller_est?.nombre_taller || '-'}</MUI.TableCell>
                <MUI.TableCell>{estudiante.contacto_est?.email_contacto || '-'}</MUI.TableCell>
                <MUI.TableCell>
                  {estudiante.fecha_inicio_pasantia && estudiante.fecha_fin_pasantia ? (
                    <MUI.Tooltip title="Fechas de Pasantía">
                      <MUI.Chip
                        icon={<DateRangeIcon />}
                        label={`${new Date(estudiante.fecha_inicio_pasantia).toLocaleDateString()} - ${new Date(estudiante.fecha_fin_pasantia).toLocaleDateString()}`}
                        size="small"
                      />
                    </MUI.Tooltip>
                  ) : (
                    <MUI.Chip icon={<AddIcon />} label="Sin fechas" size="small" color="default" />
                  )}
                </MUI.TableCell>
                <MUI.TableCell>
                  {estudiante.nombre_poliza ? (
                    <MUI.Tooltip title={`Número: ${estudiante.numero_poliza || 'No especificado'}`}>
                      <MUI.Chip
                        label={estudiante.nombre_poliza}
                        size="small"
                        color="primary"
                      />
                    </MUI.Tooltip>
                  ) : (
                    <MUI.Chip icon={<AddIcon />} label="Sin póliza" size="small" color="default" />
                  )}
                </MUI.TableCell>
                <MUI.TableCell>
                  <MUI.IconButton size="small" color="primary">
                    <EditIcon />
                  </MUI.IconButton>
                  <MUI.IconButton size="small" color="error">
                    <DeleteIcon />
                  </MUI.IconButton>
                </MUI.TableCell>
              </MUI.TableRow>
            ))}
          </MUI.TableBody>
        </MUI.Table>
      </MUI.TableContainer>

      <MUI.Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <MUI.DialogTitle>Nuevo Estudiante</MUI.DialogTitle>
        <MUI.DialogContent>
          <MUI.Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <MUI.Grid container spacing={2}>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.FormControl fullWidth required>
                  <MUI.InputLabel id="tipo-doc-label">Tipo de Documento</MUI.InputLabel>
                  <MUI.Select
                    labelId="tipo-doc-label"
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    label="Tipo de Documento"
                    onChange={handleSelectChange}
                  >
                    <MUI.MenuItem value="Cédula">Cédula</MUI.MenuItem>
                    <MUI.MenuItem value="Pasaporte">Pasaporte</MUI.MenuItem>
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Documento"
                  name="documento"
                  value={formData.documento}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  type="date"
                  label="Fecha de Nacimiento"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Taller</MUI.InputLabel>
                  <MUI.Select
                    name="taller"
                    value={formData.taller}
                    onChange={handleSelectChange}
                    required
                  >
                    {talleres.map((taller) => (
                      <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                        {taller.nombre_taller}
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.FormControl fullWidth required>
                  <MUI.InputLabel id="provincia-label">Provincia</MUI.InputLabel>
                  <MUI.Select
                    labelId="provincia-label"
                    name="provincia"
                    value={formData.provincia}
                    label="Provincia"
                    onChange={handleProvinciaChange}
                  >
                    {provincias.map((prov) => (
                      <MUI.MenuItem key={prov.id_prov} value={prov.id_prov}>{prov.provincia}</MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.FormControl fullWidth required>
                  <MUI.InputLabel id="ciudad-label">Ciudad</MUI.InputLabel>
                  <MUI.Select
                    labelId="ciudad-label"
                    name="ciudad"
                    value={formData.ciudad}
                    label="Ciudad"
                    onChange={handleCiudadChange}
                    disabled={!formData.provincia}
                  >
                    {ciudades.map((ciu) => (
                      <MUI.MenuItem key={ciu.id_ciu} value={ciu.id_ciu}>{ciu.ciudad}</MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.FormControl fullWidth required>
                  <MUI.InputLabel id="sector-label">Sector</MUI.InputLabel>
                  <MUI.Select
                    labelId="sector-label"
                    name="sector"
                    value={formData.sector}
                    label="Sector"
                    onChange={handleSelectChange}
                    disabled={!formData.ciudad}
                  >
                    {sectores.map((sec) => (
                      <MUI.MenuItem key={sec.id_sec} value={sec.id_sec}>{sec.nombre_sec}</MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Calle"
                  name="calle"
                  value={formData.calle}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Número de residencia"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Año de inicio ciclo escolar"
                  name="inicioCiclo"
                  type="number"
                  value={formData.inicioCiclo}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.TextField
                  fullWidth
                  label="Año de fin ciclo escolar"
                  name="finCiclo"
                  type="number"
                  value={formData.finCiclo}
                  onChange={handleInputChange}
                  required
                />
              </MUI.Grid>
              <MUI.Grid item xs={12} sm={6}>
                <MUI.FormControl fullWidth required>
                  <MUI.InputLabel id="estado-ciclo-label">Estado ciclo escolar</MUI.InputLabel>
                  <MUI.Select
                    labelId="estado-ciclo-label"
                    name="estadoCiclo"
                    value={formData.estadoCiclo}
                    label="Estado ciclo escolar"
                    onChange={handleSelectChange}
                  >
                    <MUI.MenuItem value="Actual">Actual</MUI.MenuItem>
                    <MUI.MenuItem value="Pasado">Pasado</MUI.MenuItem>
                    <MUI.MenuItem value="Futuro">Futuro</MUI.MenuItem>
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
            </MUI.Grid>
            <MUI.Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <MUI.Button onClick={() => setOpenForm(false)}>Cancelar</MUI.Button>
              <MUI.Button type="submit" variant="contained">Guardar</MUI.Button>
            </MUI.Box>
          </MUI.Box>
        </MUI.DialogContent>
      </MUI.Dialog>
    </MUI.Box>
  );
};

export default Students;