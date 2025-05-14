import { useState, useEffect } from 'react';
import '../../../styles/index.scss';
import * as MUI from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, DateRange as DateRangeIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import studentService, { Estudiante, NuevoEstudiante } from '../../../services/studentService';
import tallerService, { Taller } from '../../../services/tallerService';
import direccionService, { Sector } from '../../../services/direccionService';
import cicloEscolarService from '../../../services/cicloEscolarService';
import { internshipService, Provincia, Ciudad } from '../../../services/internshipService';
import SideBar from '../../../components/SideBar';
import DashboardAppBar from '../../../components/DashboardAppBar';
import { userService } from '../../../../services/userService';
import contactService from '../../../services/contactService';
import axios from 'axios';
import personaContactoEstudianteService from '../../../services/personaContactoEstudianteService';
import { uploadDocsEstudiante, downloadDocEstudiante } from '../../../services/docEstudianteService';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

const Students = () => {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const notifications = 4;
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [usuarioDisponible, setUsuarioDisponible] = useState(true);
  const [documentoDisponible, setDocumentoDisponible] = useState(true);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({open: false, message: '', severity: 'success'});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTalleres, setSelectedTalleres] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});

  // Estado del formulario
  const [formData, setFormData] = useState({
    nacionalidad: 'Dominicana',
    tipoDocumento: 'Cédula',
    documento: '',
    nombre: '',
    segNombre: '',
    apellido: '',
    segApellido: '',
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
    // Usuario
    usuario: '',
    contrasena: '',
    // Documentos
    id_doc_file: null as File | null,
    cv_doc_file: null as File | null,
    anexo_iv_doc_file: null as File | null,
    anexo_v_doc_file: null as File | null,
    acta_nac_doc_file: null as File | null,
    ced_padres_doc_file: null as File | null,
    vac_covid_doc_file: null as File | null,
    horaspasrealizadas: '',
    nombre_poliza: '',
    numero_poliza: '',
    fecha_inicio_pasantia: '',
    fecha_fin_pasantia: '',
    // Persona de contacto
    nombrePersonaContacto: '',
    apellidoPersonaContacto: '',
    relacionPersonaContacto: '',
    telefonoPersonaContacto: '',
    correoPersonaContacto: '',
    nacionalidadOtra: '',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Crear usuario
      let nuevoUsuario;
      let usuarioCreado;
      try {
        nuevoUsuario = await userService.createUser({
          dato_usuario: formData.usuario,
          contrasena_usuario: formData.contrasena,
          rol_usuario: 1, // Siempre estudiante
        });
        usuarioCreado = Array.isArray(nuevoUsuario) ? nuevoUsuario[0] : nuevoUsuario;
        console.log('usuarioCreado:', usuarioCreado);
      } catch (error: unknown) {
        const err = error as { message?: string; response?: { data?: { message?: string } } };
        // Captura el mensaje del backend
        let msg = err?.message || err?.response?.data?.message || 'Error al crear el usuario';
        if (msg.includes('llave duplicada') || msg.includes('ya existe') || msg.includes('usuario ya existe')) {
          msg = 'El nombre de usuario ya está en uso. Por favor, elige otro.';
        }
        setError(msg);
        return;
      }
      // 2. Crear contacto
      const nuevoContacto = await contactService.createContacto({
        telefono_contacto: formData.telefono,
        email_contacto: formData.email,
      });
      console.log('nuevoContacto:', nuevoContacto);
      // 3. Crear dirección
      const nuevaDireccion = await direccionService.createDireccion({
        sector_dir: Number(formData.sector),
        calle_dir: formData.calle,
        num_res_dir: formData.numero,
      });
      // 4. Crear ciclo escolar
      const nuevoCiclo = await cicloEscolarService.createCicloEscolar({
        inicio_ciclo: Number(formData.inicioCiclo),
        fin_ciclo: Number(formData.finCiclo),
        estado_ciclo: formData.estadoCiclo,
      });
      // 5. Crear estudiante
      const parseId = (id: unknown) => {
        if (id === undefined || id === null || id === "" || isNaN(Number(id)) || Number(id) === 0) return null;
        return Number(id);
      };
      const nuevoEstudiante: NuevoEstudiante = {
        nacionalidad: formData.nacionalidad === 'Otra' ? formData.nacionalidadOtra : 'Dominicana',
        tipo_documento_est: formData.tipoDocumento,
        documento_id_est: formData.documento,
        nombre_est: formData.nombre,
        seg_nombre_est: formData.segNombre !== '' ? formData.segNombre : null,
        apellido_est: formData.apellido,
        seg_apellido_est: formData.segApellido !== '' ? formData.segApellido : null,
        fecha_nac_est: formData.fechaNacimiento,
        usuario_est: parseId(usuarioCreado?.id_usuario),
        contacto_est: parseId(nuevoContacto?.id_contacto),
        taller_est: formData.taller !== '' ? Number(formData.taller) : null,
        direccion_id: nuevaDireccion && nuevaDireccion.id_dir ? Number(nuevaDireccion.id_dir) : null,
        ciclo_escolar_est: nuevoCiclo && nuevoCiclo.id_ciclo ? Number(nuevoCiclo.id_ciclo) : null,
        horaspasrealizadas_est: formData.horaspasrealizadas !== '' ? Number(formData.horaspasrealizadas) : null,
        nombre_poliza: formData.nombre_poliza !== '' ? formData.nombre_poliza : null,
        numero_poliza: formData.numero_poliza !== '' ? formData.numero_poliza : null,
        fecha_inicio_pasantia: formData.fecha_inicio_pasantia !== '' ? formData.fecha_inicio_pasantia : null,
        fecha_fin_pasantia: formData.fecha_fin_pasantia !== '' ? formData.fecha_fin_pasantia : null,
      };
      // Limpieza final: convierte cualquier string vacío a null
      (Object.keys(nuevoEstudiante) as (keyof NuevoEstudiante)[]).forEach((key) => {
        const value = nuevoEstudiante[key];
        if (typeof value === 'string' && value.trim() === '') {
          // @ts-expect-error: forzamos null para cualquier campo string vacío
          nuevoEstudiante[key] = null;
        }
      });
      console.log('OBJETO QUE SE ENVÍA:', nuevoEstudiante);
      await studentService.createStudent(nuevoEstudiante);
      // Crear persona de contacto obligatoria
      await personaContactoEstudianteService.createPersonaContactoEst({
        nombre: formData.nombrePersonaContacto,
        apellido: formData.apellidoPersonaContacto,
        relacion: formData.relacionPersonaContacto as 'Padre' | 'Madre' | 'Tutor',
        telefono: formData.telefonoPersonaContacto,
        correo: formData.correoPersonaContacto || undefined,
        estudiante: formData.documento, // documento_id_est
      });
      // Espera 300ms antes de subir los documentos para evitar error de llave foránea
      await new Promise(res => setTimeout(res, 300));
      try {
        await uploadDocsEstudiante(formData.documento, {
          id_doc_file: formData.id_doc_file!,
          cv_doc_file: formData.cv_doc_file!,
          anexo_iv_doc_file: formData.anexo_iv_doc_file!,
          anexo_v_doc_file: formData.anexo_v_doc_file!,
          acta_nac_doc_file: formData.acta_nac_doc_file!,
          ced_padres_doc_file: formData.ced_padres_doc_file!,
          vac_covid_doc_file: formData.vac_covid_doc_file!,
        });
        setSnackbar({open: true, message: 'Documentos subidos correctamente', severity: 'success'});
      } catch {
        setSnackbar({open: true, message: 'Error al subir los documentos', severity: 'error'});
      }
      // Solo cerrar el formulario si todo fue exitoso
      setOpenForm(false);
      loadData();
      setFormData({
        nacionalidad: 'Dominicana',
        tipoDocumento: 'Cédula',
        documento: '',
        nombre: '',
        segNombre: '',
        apellido: '',
        segApellido: '',
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
        usuario: '',
        contrasena: '',
        id_doc_file: null,
        cv_doc_file: null,
        anexo_iv_doc_file: null,
        anexo_v_doc_file: null,
        acta_nac_doc_file: null,
        ced_padres_doc_file: null,
        vac_covid_doc_file: null,
        horaspasrealizadas: '',
        nombre_poliza: '',
        numero_poliza: '',
        fecha_inicio_pasantia: '',
        fecha_fin_pasantia: '',
        nombrePersonaContacto: '',
        apellidoPersonaContacto: '',
        relacionPersonaContacto: '',
        telefonoPersonaContacto: '',
        correoPersonaContacto: '',
        nacionalidadOtra: '',
      });
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      setError('Error al crear el estudiante');
      // No cierres el formulario si hay error
    }
  };

  // Función para autollenar el formulario con datos de ejemplo
  const handleAutofill = () => {
    setFormData({
      nacionalidad: 'Dominicana',
      tipoDocumento: 'Cédula',
      documento: '12345678',
      nombre: 'Juan',
      segNombre: 'Carlos',
      apellido: 'Pérez',
      segApellido: 'Gómez',
      fechaNacimiento: '2002-05-10',
      telefono: '8091234567',
      email: 'juan.perez@example.com',
      taller: talleres.length > 0 ? String(talleres[0].id_taller) : '',
      provincia: provincias.length > 0 ? String(provincias[0].id_prov) : '',
      ciudad: ciudades.length > 0 ? String(ciudades[0].id_ciu) : '',
      sector: sectores.length > 0 ? String(sectores[0].id_sec) : '',
      calle: 'Calle Principal',
      numero: '123',
      inicioCiclo: '2023',
      finCiclo: '2024',
      estadoCiclo: 'Actual',
      usuario: 'juanperez',
      contrasena: '123456',
      id_doc_file: null,
      cv_doc_file: null,
      anexo_iv_doc_file: null,
      anexo_v_doc_file: null,
      acta_nac_doc_file: null,
      ced_padres_doc_file: null,
      vac_covid_doc_file: null,
      horaspasrealizadas: '',
      nombre_poliza: '',
      numero_poliza: '',
      fecha_inicio_pasantia: '',
      fecha_fin_pasantia: '',
      nombrePersonaContacto: '',
      apellidoPersonaContacto: '',
      relacionPersonaContacto: '',
      telefonoPersonaContacto: '',
      correoPersonaContacto: '',
      nacionalidadOtra: '',
    });
  };

  const checkUsuario = async (usuario: string) => {
    if (!usuario) return;
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/usuarios/buscar/${usuario}`);
      setUsuarioDisponible(false); // Si existe, no está disponible
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response && err.response.status === 404) {
        setUsuarioDisponible(true); // No existe, está disponible
      } else {
        setUsuarioDisponible(true); // Si hay error de red, asume disponible
      }
    }
  };

  const checkDocumento = async (documento: string) => {
    if (!documento) return;
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/estudiantes/${documento}`);
      setDocumentoDisponible(false); // Si existe, no está disponible
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response && err.response.status === 404) {
        setDocumentoDisponible(true); // No existe, está disponible
      } else {
        setDocumentoDisponible(true); // Si hay error de red, asume disponible
      }
    }
  };

  const handleNacionalidadChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      nacionalidad: value,
      tipoDocumento: value === 'Dominicana' ? 'Cédula' : 'Pasaporte',
      nacionalidadOtra: '',
    }));
  };

  const handleNacionalidadOtraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      nacionalidadOtra: e.target.value
    }));
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

  // Filtrar talleres con usuarios activos
  const talleresActivos = talleres.filter(taller =>
    estudiantes.some(est => String(est.taller_est?.id_taller) === String(taller.id_taller) && est.usuario_est?.estado_usuario === 'Activo')
  );

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  const handleTallerChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedTalleres(typeof value === 'string' ? value.split(',') : value);
  };
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
  };

  // Filtro compuesto
  const filteredEstudiantes = estudiantes.filter(estudiante => {
    const nombreMatch = estudiante.nombre_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.apellido_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.documento_id_est.includes(searchTerm);
    const tallerMatch = selectedTalleres.length === 0 || (estudiante.taller_est && selectedTalleres.includes(String(estudiante.taller_est.id_taller)));
    const fechaInicio = dateRange.start ? new Date(dateRange.start) : null;
    const fechaFin = dateRange.end ? new Date(dateRange.end) : null;
    let fechaMatch = true;
    if (fechaInicio && fechaFin && estudiante.fecha_inicio_pasantia && estudiante.fecha_fin_pasantia) {
      const inicio = new Date(estudiante.fecha_inicio_pasantia);
      const fin = new Date(estudiante.fecha_fin_pasantia);
      fechaMatch = inicio >= fechaInicio && fin <= fechaFin;
    }
    // Solo mostrar estudiantes con usuario activo
    const usuarioActivo = estudiante.usuario_est?.estado_usuario === 'Activo';
    return nombreMatch && tallerMatch && fechaMatch && usuarioActivo;
  });

  // Componente para menú de documentos
  const tiposDocs = [
    { key: 'ced_est', label: 'Cédula' },
    { key: 'cv_doc', label: 'CV' },
    { key: 'anexo_iv_doc', label: 'Anexo IV' },
    { key: 'anexo_v_doc', label: 'Anexo V' },
    { key: 'acta_nac_doc', label: 'Acta Nacimiento' },
    { key: 'ced_padres_doc', label: 'Cédula Padres' },
    { key: 'vac_covid_doc', label: 'Vacuna COVID' },
  ];

  function DocumentosMenu({ documento }: { documento: string }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleDownload = async (tipo: string, label: string) => {
      try {
        const blobData = await downloadDocEstudiante(documento, tipo);
        const blob = new Blob([blobData as Blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${label}_${documento}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch {
        alert('No se pudo descargar el archivo');
      }
      handleClose();
    };

    const handleView = async (tipo: string) => {
      try {
        const blobData = await downloadDocEstudiante(documento, tipo);
        const blob = new Blob([blobData as Blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch {
        alert('No se pudo visualizar el archivo');
      }
      handleClose();
    };

    return (
      <>
        <MUI.Tooltip title="Ver documentos">
          <MUI.IconButton onClick={handleOpen} size="small" color="secondary">
            <AttachFileIcon />
          </MUI.IconButton>
        </MUI.Tooltip>
        <MUI.Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          {tiposDocs.map(({ key, label }) => (
            <MUI.MenuItem key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 200 }}>
              <span>{label}</span>
              <span>
                <MUI.IconButton size="small" onClick={() => handleView(key)}>
                  <VisibilityIcon fontSize="small" />
                </MUI.IconButton>
                <MUI.IconButton size="small" onClick={() => handleDownload(key, label)}>
                  <DownloadIcon fontSize="small" />
                </MUI.IconButton>
              </span>
            </MUI.MenuItem>
          ))}
        </MUI.Menu>
      </>
    );
  }

  if (error) {
    return (
      <MUI.Box sx={{ p: 2 }}>
        <MUI.Alert severity="error">{error}</MUI.Alert>
      </MUI.Box>
    );
  }

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: theme ? MUI.alpha(theme.palette.background.paper, 0.6) : undefined, p: 0 }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />
      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar notifications={notifications} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />
        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <MUI.Paper elevation={3} sx={{ display: 'flex', alignItems: 'center', borderRadius: 3, boxShadow: 3, px: 2, py: 1, width: 400, bgcolor: '#f5f7fa' }}>
              <MUI.TextField
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
                  disableUnderline: true,
                  sx: { bgcolor: 'transparent', border: 'none' }
                }}
                variant="standard"
                sx={{ flex: 1, bgcolor: 'transparent', border: 'none' }}
              />
              <MUI.IconButton onClick={handleFilterClick} color="primary" sx={{ ml: 1 }}>
                <FilterListIcon />
              </MUI.IconButton>
              <MUI.Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={handleFilterClose}>
                <MUI.Box sx={{ px: 2, py: 1, minWidth: 250 }}>
                  <MUI.Typography variant="subtitle2" sx={{ mb: 1 }}>Filtrar por taller</MUI.Typography>
                  <MUI.FormControl fullWidth>
                    <MUI.Select
                      multiple
                      value={selectedTalleres}
                      onChange={handleTallerChange}
                      renderValue={(selected) =>
                        talleresActivos.filter(t => selected.includes(String(t.id_taller))).map(t => t.nombre_taller).join(', ')
                      }
                    >
                      {talleresActivos.map((taller) => (
                        <MUI.MenuItem key={taller.id_taller} value={String(taller.id_taller)}>
                          <MUI.Checkbox checked={selectedTalleres.includes(String(taller.id_taller))} />
                          <MUI.ListItemText primary={taller.nombre_taller} />
                        </MUI.MenuItem>
                      ))}
                    </MUI.Select>
                  </MUI.FormControl>
                  <MUI.Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Filtrar por fechas de pasantía</MUI.Typography>
                  <MUI.TextField
                    label="Fecha inicio"
                    type="date"
                    value={dateRange.start}
                    onChange={e => handleDateChange('start', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <MUI.TextField
                    label="Fecha fin"
                    type="date"
                    value={dateRange.end}
                    onChange={e => handleDateChange('end', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </MUI.Box>
              </MUI.Menu>
            </MUI.Paper>
            <MUI.Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
              sx={{ borderRadius: 3, boxShadow: 3, bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#115293' } }}
            >
              Nuevo Estudiante
            </MUI.Button>
          </MUI.Box>

          <MUI.TableContainer component={MUI.Paper} elevation={3} sx={{ borderRadius: 3, boxShadow: 3, bgcolor: '#fff' }}>
            <MUI.Table sx={{ minWidth: 900 }}>
              <MUI.TableHead sx={{ bgcolor: '#f5f7fa' }}>
                <MUI.TableRow>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Documento</MUI.TableCell>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Nombre</MUI.TableCell>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Taller</MUI.TableCell>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Contacto</MUI.TableCell>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Fechas</MUI.TableCell>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Póliza</MUI.TableCell>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Horas acumuladas</MUI.TableCell>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Documentos</MUI.TableCell>
                  <MUI.TableCell sx={{ fontWeight: 'bold' }}>Acciones</MUI.TableCell>
                </MUI.TableRow>
              </MUI.TableHead>
              <MUI.TableBody>
                {filteredEstudiantes.map((estudiante) => (
                  <MUI.TableRow key={estudiante.documento_id_est} hover sx={{ transition: 'background 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}>
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
                      {estudiante.horaspasrealizadas_est ?? '-'}
                    </MUI.TableCell>
                    <MUI.TableCell>
                      <DocumentosMenu documento={estudiante.documento_id_est} />
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
              <MUI.Button variant="outlined" color="secondary" onClick={handleAutofill} sx={{ mb: 2 }}>
                Autollenar
              </MUI.Button>
              <MUI.Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <MUI.Typography variant="h6" sx={{ mb: 2 }}>Datos personales</MUI.Typography>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.FormControl fullWidth required>
                      <MUI.InputLabel id="nacionalidad-label">Nacionalidad</MUI.InputLabel>
                      <MUI.Select
                        labelId="nacionalidad-label"
                        name="nacionalidad"
                        value={formData.nacionalidad}
                        label="Nacionalidad"
                        onChange={handleNacionalidadChange}
                      >
                        <MUI.MenuItem value="Dominicana">Dominicana</MUI.MenuItem>
                        <MUI.MenuItem value="Otra">Otra</MUI.MenuItem>
                      </MUI.Select>
                      <MUI.FormHelperText>Si es de otro país, escriba su nacionalidad</MUI.FormHelperText>
                    </MUI.FormControl>
                  </MUI.Grid>
                  {formData.nacionalidad === 'Otra' && (
                    <MUI.Grid item xs={12} sm={6}>
                      <MUI.TextField
                        fullWidth
                        label="Especifique su nacionalidad"
                        name="nacionalidadOtra"
                        value={formData.nacionalidadOtra || ''}
                        onChange={handleNacionalidadOtraChange}
                        required
                      />
                    </MUI.Grid>
                  )}
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.FormControl fullWidth required>
                      <MUI.InputLabel id="tipo-doc-label">Tipo de Documento</MUI.InputLabel>
                      <MUI.Select
                        labelId="tipo-doc-label"
                        name="tipoDocumento"
                        value={formData.tipoDocumento}
                        label="Tipo de Documento"
                        onChange={handleSelectChange}
                        disabled
                      >
                        {formData.nacionalidad === 'Dominicana' ? (
                          <MUI.MenuItem value="Cédula">Cédula</MUI.MenuItem>
                        ) : (
                          <MUI.MenuItem value="Pasaporte">Pasaporte</MUI.MenuItem>
                        )}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Documento"
                      name="documento"
                      value={formData.documento}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        handleInputChange(e as React.ChangeEvent<HTMLInputElement>);
                        checkDocumento(e.target.value);
                      }}
                      onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => checkDocumento(e.target.value)}
                      required
                      error={!documentoDisponible}
                      helperText={!documentoDisponible ? "Este documento ya está en uso" : ""}
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
                      label="Segundo Nombre"
                      name="segNombre"
                      value={formData.segNombre}
                      onChange={handleInputChange}
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
                      label="Segundo Apellido"
                      name="segApellido"
                      value={formData.segApellido}
                      onChange={handleInputChange}
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
                        disabled={!formData.ciudad || sectores.length === 0}
                      >
                        {sectores.map((sec) => (
                          <MUI.MenuItem key={sec.id_sec} value={sec.id_sec}>
                            {sec.nombre_sec || 'Sin nombre'}
                          </MUI.MenuItem>
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
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Horas pasantía realizadas"
                      name="horaspasrealizadas"
                      type="number"
                      value={formData.horaspasrealizadas}
                      onChange={handleInputChange}
                      disabled
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Nombre de póliza"
                      name="nombre_poliza"
                      value={formData.nombre_poliza}
                      onChange={handleInputChange}
                      disabled
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Número de póliza"
                      name="numero_poliza"
                      value={formData.numero_poliza}
                      onChange={handleInputChange}
                      disabled
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Fecha inicio pasantía"
                      name="fecha_inicio_pasantia"
                      type="date"
                      value={formData.fecha_inicio_pasantia}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      disabled
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Fecha fin pasantía"
                      name="fecha_fin_pasantia"
                      type="date"
                      value={formData.fecha_fin_pasantia}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      disabled
                    />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Grid item xs={12}>
                  <MUI.Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Persona de contacto</MUI.Typography>
                </MUI.Grid>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Nombre"
                      name="nombrePersonaContacto"
                      value={formData.nombrePersonaContacto}
                      onChange={handleInputChange}
                      required
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Apellido"
                      name="apellidoPersonaContacto"
                      value={formData.apellidoPersonaContacto}
                      onChange={handleInputChange}
                      required
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.FormControl fullWidth required>
                      <MUI.InputLabel id="relacion-label">Relación</MUI.InputLabel>
                      <MUI.Select
                        labelId="relacion-label"
                        name="relacionPersonaContacto"
                        value={formData.relacionPersonaContacto}
                        label="Relación"
                        onChange={handleSelectChange}
                      >
                        <MUI.MenuItem value="Padre">Padre</MUI.MenuItem>
                        <MUI.MenuItem value="Madre">Madre</MUI.MenuItem>
                        <MUI.MenuItem value="Tutor">Tutor</MUI.MenuItem>
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Teléfono"
                      name="telefonoPersonaContacto"
                      value={formData.telefonoPersonaContacto}
                      onChange={handleInputChange}
                      required
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Correo (opcional)"
                      name="correoPersonaContacto"
                      value={formData.correoPersonaContacto}
                      onChange={handleInputChange}
                    />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Datos de usuario</MUI.Typography>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Usuario"
                      name="usuario"
                      value={formData.usuario}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        handleInputChange(e as React.ChangeEvent<HTMLInputElement>);
                        checkUsuario(e.target.value);
                      }}
                      onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => checkUsuario(e.target.value)}
                      required
                      error={!usuarioDisponible}
                      helperText={!usuarioDisponible ? "Este usuario ya existe" : ""}
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Contraseña"
                      name="contrasena"
                      type="password"
                      value={formData.contrasena}
                      onChange={handleInputChange}
                      required
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Rol"
                      name="rol"
                      value={1}
                      InputProps={{ readOnly: true }}
                      helperText="Siempre será Estudiante"
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Estado"
                      name="estado"
                      value={'Activo'}
                      InputProps={{ readOnly: true }}
                      helperText="Siempre será Activo al crear"
                    />
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Documentos requeridos</MUI.Typography>
                <MUI.Grid container spacing={2}>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Button variant="outlined" component="label" fullWidth>
                      Cédula/ID
                      <input type="file" name="id_doc_file" hidden onChange={handleFileChange} />
                    </MUI.Button>
                    {formData.id_doc_file instanceof File && (
                      <MUI.Typography variant="caption" color="primary">
                        {formData.id_doc_file.name}
                      </MUI.Typography>
                    )}
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Button variant="outlined" component="label" fullWidth>
                      CV
                      <input type="file" name="cv_doc_file" hidden onChange={handleFileChange} />
                    </MUI.Button>
                    {formData.cv_doc_file instanceof File && (
                      <MUI.Typography variant="caption" color="primary">
                        {formData.cv_doc_file.name}
                      </MUI.Typography>
                    )}
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Button variant="outlined" component="label" fullWidth>
                      Anexo IV
                      <input type="file" name="anexo_iv_doc_file" hidden onChange={handleFileChange} />
                    </MUI.Button>
                    {formData.anexo_iv_doc_file instanceof File && (
                      <MUI.Typography variant="caption" color="primary">
                        {formData.anexo_iv_doc_file.name}
                      </MUI.Typography>
                    )}
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Button variant="outlined" component="label" fullWidth>
                      Anexo V
                      <input type="file" name="anexo_v_doc_file" hidden onChange={handleFileChange} />
                    </MUI.Button>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Button variant="outlined" component="label" fullWidth>
                      Acta de nacimiento
                      <input type="file" name="acta_nac_doc_file" hidden onChange={handleFileChange} />
                    </MUI.Button>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Button variant="outlined" component="label" fullWidth>
                      Cédula de padres
                      <input type="file" name="ced_padres_doc_file" hidden onChange={handleFileChange} />
                    </MUI.Button>
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.Button variant="outlined" component="label" fullWidth>
                      Vacuna COVID
                      <input type="file" name="vac_covid_doc_file" hidden onChange={handleFileChange} />
                    </MUI.Button>
                  </MUI.Grid>
                </MUI.Grid>
                <MUI.Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <MUI.Button onClick={() => setOpenForm(false)}>Cancelar</MUI.Button>
                  <MUI.Button
                    type="submit"
                    variant="contained"
                    disabled={!usuarioDisponible || !documentoDisponible}
                  >
                    Guardar
                  </MUI.Button>
                </MUI.Box>
              </MUI.Box>
            </MUI.DialogContent>
          </MUI.Dialog>
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
    </MUI.Box>
  );
};

export default Students;