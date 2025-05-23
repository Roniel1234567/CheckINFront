import { useState, useEffect } from 'react';
import '../../../styles/index.scss';
import * as MUI from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, DateRange as DateRangeIcon, FilterList as FilterListIcon, Shield as ShieldIcon, Event as EventIcon, History as HistoryIcon, Restore as RestoreIcon } from '@mui/icons-material';
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
import { uploadDocsEstudiante, downloadDocEstudiante, getDocsEstudianteByDocumento } from '../../../services/docEstudianteService';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import polizaService from '../../../services/polizaService';

// Define el tipo para la dirección completa
interface DireccionCompleta {
  id_dir: number;
  sector_dir: {
    id_sec: number;
    sector: string;
    ciudad_sec: number;
    ciudad: {
      id_ciu: number;
      ciudad: string;
      provincia_ciu: number;
      provincia: {
        id_prov: number;
        provincia: string;
      };
    };
  };
  calle_dir: string;
  num_res_dir: string;
}

// Define el tipo para los documentos del estudiante
interface DocsEstudiante {
  id_doc_file?: string;
  cv_doc_file?: string;
  anexo_iv_doc_file?: string;
  anexo_v_doc_file?: string;
  acta_nac_doc_file?: string;
  ced_padres_doc_file?: string;
  vac_covid_doc_file?: string;
  ced_est?: string;
  cv_doc?: string;
}

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
  const [editMode, setEditMode] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [estudianteToDelete, setEstudianteToDelete] = useState<Estudiante | null>(null);
  const [docsEstudiante, setDocsEstudiante] = useState<DocsEstudiante | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{provincia?: string, ciudad?: string, sector?: string} | null>(null);
  const [openPolizaDialog, setOpenPolizaDialog] = useState(false);
  const [openFechasDialog, setOpenFechasDialog] = useState(false);
  const [polizaData, setPolizaData] = useState({
    compania: '',
    tipo_poliza: '',
    nombre_poliza: '',
    numero_poliza: '',
    fecha_inicio: '',
    fecha_fin: '',
    estudiante: 'all'
  });
  const [fechasData, setFechasData] = useState({ fecha_inicio_pasantia: '', fecha_fin_pasantia: '', horaspasrealizadas_est: '', estudiante: 'all' });
  const [searchEstudiante, setSearchEstudiante] = useState('');
  const [filterTaller, setFilterTaller] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);
  const [restaurando, setRestaurando] = useState<string | null>(null);

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
    provincia: '',
    ciudad: '',
    sector: '',
    calle: '',
    numero: '',
    direccionId: '',
    inicioCiclo: '',
    finCiclo: '',
    estadoCiclo: 'Actual',
    usuario: '',
    contrasena: '',
    id_doc_file: null as File | null,
    cv_doc_file: null as File | null,
    anexo_iv_doc_file: null as File | null,
    anexo_v_doc_file: null as File | null,
    acta_nac_doc_file: null as File | null,
    ced_padres_doc_file: null as File | null,
    vac_covid_doc_file: null as File | null,
    horaspasrealizadas: '',
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
      if (editMode && editingEstudiante) {
        // Modo edición
        // Obtener el id del ciclo escolar si existe
        let cicloEscolarId: number | null = null;
        if (editingEstudiante.ciclo_escolar_est && editingEstudiante.ciclo_escolar_est.id_ciclo) {
          cicloEscolarId = Number(editingEstudiante.ciclo_escolar_est.id_ciclo);
        }
        await studentService.updateStudent(editingEstudiante.documento_id_est, {
          tipo_documento_est: formData.tipoDocumento,
          documento_id_est: formData.documento,
          nombre_est: formData.nombre,
          seg_nombre_est: formData.segNombre !== '' ? formData.segNombre : undefined,
          apellido_est: formData.apellido,
          seg_apellido_est: formData.segApellido !== '' ? formData.segApellido : undefined,
          fecha_nac_est: formData.fechaNacimiento,
          taller_est: formData.taller !== '' ? { id_taller: Number(formData.taller), nombre_taller: '', cod_titulo_taller: '', estado_taller: '' } : undefined,
          horaspasrealizadas_est: formData.horaspasrealizadas !== '' ? String(formData.horaspasrealizadas) : undefined,
          nacionalidad: formData.nacionalidad === 'Otra' ? formData.nacionalidadOtra : 'Dominicana',
          direccion_id: formData.direccionId ? Number(formData.direccionId) : undefined,
          ciclo_escolar_est: cicloEscolarId && cicloEscolarId !== 0 ? cicloEscolarId : undefined,
        });
        setSnackbar({ open: true, message: 'Estudiante actualizado correctamente', severity: 'success' });
        setOpenForm(false);
        setEditMode(false);
        setEditingEstudiante(null);
        loadData();
        return;
      }
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
        direccionId: '',
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
      internshipService.getSectoresByCiudad(Number(formData.ciudad)).then((sectores) => setSectores(sectores as unknown as Sector[]));
    } else {
      setSectores([]);
    }
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

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  const handleTallerChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedTalleres(value);
  };
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
  };

  // Filtro compuesto
  const filteredEstudiantes = estudiantes.filter(estudiante => {
    // Filtro por nombre, apellido o documento
    const nombreMatch = estudiante.nombre_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.apellido_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.documento_id_est.includes(searchTerm);

    // Filtro por taller
    const tallerMatch = selectedTalleres.length === 0 ||
      (estudiante.taller_est && selectedTalleres.includes(String(estudiante.taller_est.id_taller)));

    // Filtro por fechas
    let fechaMatch = true;
    const filtroInicio = dateRange.start ? new Date(dateRange.start) : null;
    const filtroFin = dateRange.end ? new Date(dateRange.end) : null;
    const estInicio = estudiante.fecha_inicio_pasantia ? new Date(estudiante.fecha_inicio_pasantia) : null;
    const estFin = estudiante.fecha_fin_pasantia ? new Date(estudiante.fecha_fin_pasantia) : null;

    if ((filtroInicio || filtroFin)) {
      // Si hay filtro de fechas, pero el estudiante no tiene fechas, no lo muestres
      if (!estInicio || !estFin) {
        fechaMatch = false;
      } else {
        if (filtroInicio && filtroFin) {
          fechaMatch = estInicio >= filtroInicio && estFin <= filtroFin;
        } else if (filtroInicio) {
          fechaMatch = estInicio >= filtroInicio;
        } else if (filtroFin) {
          fechaMatch = estFin <= filtroFin;
        }
      }
    }

    // Solo mostrar estudiantes con usuario activo
    const usuarioActivo = estudiante.usuario_est?.estado_usuario === 'Activo';

    return nombreMatch && tallerMatch && fechaMatch && usuarioActivo;
  });

  const estudiantesFiltrados = estudiantes
    .filter(e => e.usuario_est?.estado_usuario === 'Activo')
    .filter(e =>
      (!searchEstudiante ||
        e.nombre_est.toLowerCase().includes(searchEstudiante.toLowerCase()) ||
        e.apellido_est.toLowerCase().includes(searchEstudiante.toLowerCase()) ||
        e.documento_id_est.includes(searchEstudiante)
      ) &&
      (!filterTaller || (e.taller_est && String(e.taller_est.id_taller) === filterTaller))
    );

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

  const handleEditClick = async (estudiante: Estudiante) => {
    setEditMode(true);
    setEditingEstudiante(estudiante);
    setOpenForm(true);

    // Obtener dirección completa
    let direccionCompleta: DireccionCompleta | null = null;
    try {
      direccionCompleta = await direccionService.getDireccionByEstudianteDocumento(estudiante.documento_id_est) as DireccionCompleta;
    } catch {
      direccionCompleta = null;
    }

    // Extraer IDs
    let provinciaId = '';
    let ciudadId = '';
    let sectorId = '';
    if (direccionCompleta && direccionCompleta.sector_dir) {
      sectorId = String(direccionCompleta.sector_dir.id_sec);
      ciudadId = String(direccionCompleta.sector_dir.ciudad_sec);
      provinciaId = String(direccionCompleta.sector_dir.ciudad.provincia_ciu);
    }

    // Obtener datos de contacto y documentos
    let personaContacto = null;
    let docs: DocsEstudiante | null = null;
    try {
      personaContacto = await personaContactoEstudianteService.getPersonaContactoByDocumento(estudiante.documento_id_est);
    } catch {
      personaContacto = null;
    }
    try {
      const docsResp = await getDocsEstudianteByDocumento(estudiante.documento_id_est);
      docs = docsResp && Array.isArray(docsResp) && docsResp.length > 0 ? docsResp[0] : docsResp;
      setDocsEstudiante(docs);
    } catch {
      setDocsEstudiante(null);
    }

    if (provinciaId && ciudadId && sectorId) {
      const ciudadesProv = await internshipService.getCiudadesByProvincia(Number(provinciaId));
      setCiudades(ciudadesProv);
      const sectoresCiudad = await internshipService.getSectoresByCiudad(Number(ciudadId));
      setSectores(sectoresCiudad as unknown as Sector[]);
      setPendingLocation({
        provincia: String(provinciaId),
        ciudad: String(ciudadId),
        sector: String(sectorId)
      });
      setFormData(prev => ({
        ...prev,
        provincia: String(provinciaId),
        calle: direccionCompleta ? direccionCompleta.calle_dir : '',
        numero: direccionCompleta ? direccionCompleta.num_res_dir : '',
        direccionId: direccionCompleta ? String(direccionCompleta.id_dir) : '',
        nacionalidad: (estudiante.nacionalidad || '').trim().toLowerCase() === 'dominicana' ? 'Dominicana' : 'Otra',
        nacionalidadOtra: (estudiante.nacionalidad && estudiante.nacionalidad.trim().toLowerCase() !== 'dominicana') ? estudiante.nacionalidad.trim() : '',
        tipoDocumento: (estudiante.nacionalidad || '').trim().toLowerCase() === 'dominicana' ? 'Cédula' : 'Pasaporte',
        documento: estudiante.documento_id_est,
        nombre: estudiante.nombre_est,
        segNombre: estudiante.seg_nombre_est || '',
        apellido: estudiante.apellido_est,
        segApellido: estudiante.seg_apellido_est || '',
        fechaNacimiento: estudiante.fecha_nac_est,
        telefono: estudiante.contacto_est?.telefono_contacto || '',
        email: estudiante.contacto_est?.email_contacto || '',
        taller: estudiante.taller_est ? String(estudiante.taller_est.id_taller) : '',
        inicioCiclo: estudiante.ciclo_escolar_est?.inicio_ciclo ? String(estudiante.ciclo_escolar_est.inicio_ciclo) : '',
        finCiclo: estudiante.ciclo_escolar_est?.fin_ciclo ? String(estudiante.ciclo_escolar_est.fin_ciclo) : '',
        estadoCiclo: estudiante.ciclo_escolar_est?.estado_ciclo || 'Actual',
        usuario: estudiante.usuario_est?.dato_usuario || '',
        contrasena: '',
        id_doc_file: docs?.id_doc_file as unknown as File || null,
        cv_doc_file: docs?.cv_doc_file as unknown as File || null,
        anexo_iv_doc_file: docs?.anexo_iv_doc_file as unknown as File || null,
        anexo_v_doc_file: docs?.anexo_v_doc_file as unknown as File || null,
        acta_nac_doc_file: docs?.acta_nac_doc_file as unknown as File || null,
        ced_padres_doc_file: docs?.ced_padres_doc_file as unknown as File || null,
        vac_covid_doc_file: docs?.vac_covid_doc_file as unknown as File || null,
        horaspasrealizadas: estudiante.horaspasrealizadas_est || '',
        nombrePersonaContacto: personaContacto?.nombre || '',
        apellidoPersonaContacto: personaContacto?.apellido || '',
        relacionPersonaContacto: personaContacto?.relacion || '',
        telefonoPersonaContacto: personaContacto?.telefono || '',
        correoPersonaContacto: personaContacto?.correo || '',
      }));
      return;
    }
    // Si no hay provincia/ciudad/sector, setea igual pero vacíos
    setFormData(prev => ({
      ...prev,
      provincia: provinciaId || '',
      ciudad: ciudadId || '',
      sector: sectorId || '',
      calle: direccionCompleta ? direccionCompleta.calle_dir : '',
      numero: direccionCompleta ? direccionCompleta.num_res_dir : '',
      direccionId: '',
      nacionalidad: (estudiante.nacionalidad || '').trim().toLowerCase() === 'dominicana' ? 'Dominicana' : 'Otra',
      nacionalidadOtra: (estudiante.nacionalidad && estudiante.nacionalidad.trim().toLowerCase() !== 'dominicana') ? estudiante.nacionalidad.trim() : '',
      tipoDocumento: (estudiante.nacionalidad || '').trim().toLowerCase() === 'dominicana' ? 'Cédula' : 'Pasaporte',
      documento: estudiante.documento_id_est,
      nombre: estudiante.nombre_est,
      segNombre: estudiante.seg_nombre_est || '',
      apellido: estudiante.apellido_est,
      segApellido: estudiante.seg_apellido_est || '',
      fechaNacimiento: estudiante.fecha_nac_est,
      telefono: estudiante.contacto_est?.telefono_contacto || '',
      email: estudiante.contacto_est?.email_contacto || '',
      taller: estudiante.taller_est ? String(estudiante.taller_est.id_taller) : '',
      inicioCiclo: estudiante.ciclo_escolar_est?.inicio_ciclo ? String(estudiante.ciclo_escolar_est.inicio_ciclo) : '',
      finCiclo: estudiante.ciclo_escolar_est?.fin_ciclo ? String(estudiante.ciclo_escolar_est.fin_ciclo) : '',
      estadoCiclo: estudiante.ciclo_escolar_est?.estado_ciclo || 'Actual',
      usuario: estudiante.usuario_est?.dato_usuario || '',
      contrasena: '',
      id_doc_file: docs?.id_doc_file as unknown as File || null,
      cv_doc_file: docs?.cv_doc_file as unknown as File || null,
      anexo_iv_doc_file: docs?.anexo_iv_doc_file as unknown as File || null,
      anexo_v_doc_file: docs?.anexo_v_doc_file as unknown as File || null,
      acta_nac_doc_file: docs?.acta_nac_doc_file as unknown as File || null,
      ced_padres_doc_file: docs?.ced_padres_doc_file as unknown as File || null,
      vac_covid_doc_file: docs?.vac_covid_doc_file as unknown as File || null,
      horaspasrealizadas: estudiante.horaspasrealizadas_est || '',
      nombrePersonaContacto: personaContacto?.nombre || '',
      apellidoPersonaContacto: personaContacto?.apellido || '',
      relacionPersonaContacto: personaContacto?.relacion || '',
      telefonoPersonaContacto: personaContacto?.telefono || '',
      correoPersonaContacto: personaContacto?.correo || '',
    }));
  };

  const handleDeleteClick = (estudiante: Estudiante) => {
    setEstudianteToDelete(estudiante);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (estudianteToDelete && estudianteToDelete.usuario_est?.id_usuario) {
      await userService.updateUser(estudianteToDelete.usuario_est.id_usuario, { estado_usuario: 'Eliminado' });
      setSnackbar({ open: true, message: 'Estudiante eliminado correctamente', severity: 'success' });
      setDeleteDialogOpen(false);
      setEstudianteToDelete(null);
      loadData();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEstudianteToDelete(null);
  };

  // Función para abrir el formulario de registro (nuevo estudiante)
  const handleOpenNewForm = () => {
    console.log('handleOpenNewForm ejecutado'); // DEBUG
    setEditMode(false);
    setEditingEstudiante(null);
    setDocsEstudiante(null);
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
      direccionId: '',
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
      nombrePersonaContacto: '',
      apellidoPersonaContacto: '',
      relacionPersonaContacto: '',
      telefonoPersonaContacto: '',
      correoPersonaContacto: '',
      nacionalidadOtra: '',
    });
    setOpenForm(true);
  };

  // Al cerrar el formulario, limpiar todo
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditMode(false);
    setEditingEstudiante(null);
    setDocsEstudiante(null);
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
      direccionId: '',
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
      nombrePersonaContacto: '',
      apellidoPersonaContacto: '',
      relacionPersonaContacto: '',
      telefonoPersonaContacto: '',
      correoPersonaContacto: '',
      nacionalidadOtra: '',
    });
  };

  useEffect(() => {
    if (pendingLocation) {
      console.log('Pendientes:', pendingLocation);
      console.log('Sectores disponibles:', sectores.map(s => String(s.id_sec)));
      
      // Forzamos la selección, sin importar verificaciones
      if (pendingLocation.ciudad || pendingLocation.sector) {
        console.log('FORZANDO selección:', {
          ciudad: pendingLocation.ciudad,
          sector: pendingLocation.sector
        });
        
        // Aplicamos todos los valores pendientes directamente
        setFormData(prev => ({
          ...prev,
          ciudad: pendingLocation.ciudad ? pendingLocation.ciudad : prev.ciudad,
          sector: pendingLocation.sector ? pendingLocation.sector : prev.sector
        }));
        
        // Si hay sector seleccionado, consideramos terminada la operación
        if (pendingLocation.sector) {
          setPendingLocation(null);
        }
      }
    }
  }, [ciudades, sectores, pendingLocation]);

  // --- ACTUALIZAR POLIZA DE SEGURO ---
  const handlePolizaUpdate = async () => {
    if (!polizaData.nombre_poliza || !polizaData.numero_poliza || !polizaData.compania || !polizaData.tipo_poliza || !polizaData.fecha_inicio) return;
    setSnackbar({ open: true, message: 'Asignando póliza...', severity: 'success' });
    try {
      // 1. Insertar la póliza
      const nuevaPoliza = await polizaService.createPoliza({
        compania: polizaData.compania,
        tipo_poliza: polizaData.tipo_poliza,
        nombre_poliza: polizaData.nombre_poliza,
        numero_poliza: polizaData.numero_poliza,
        fecha_inicio: polizaData.fecha_inicio,
        fecha_fin: polizaData.fecha_fin || null
      });
      // 2. Actualizar estudiante(s) con el id de la póliza SOLO si usuario_est.estado_usuario === 'Activo'
      if (polizaData.estudiante === 'all') {
        const activos = estudiantes.filter(e => e.usuario_est?.estado_usuario === 'Activo');
        await Promise.all(
          activos.map(e => studentService.updatePolizaEstudiante(e.documento_id_est, nuevaPoliza.id_poliza))
        );
      } else {
        const estudiante = estudiantes.find(e => e.documento_id_est === polizaData.estudiante && e.usuario_est?.estado_usuario === 'Activo');
        if (estudiante) {
          await studentService.updatePolizaEstudiante(estudiante.documento_id_est, nuevaPoliza.id_poliza);
        }
      }
      setSnackbar({ open: true, message: 'Póliza asignada correctamente', severity: 'success' });
      setOpenPolizaDialog(false);
      setPolizaData({ compania: '', tipo_poliza: '', nombre_poliza: '', numero_poliza: '', fecha_inicio: '', fecha_fin: '', estudiante: 'all' });
      loadData();
    } catch (error: unknown) {
      if ((error as unknown as { response?: { status?: number } })?.response?.status === 404) {
        setSnackbar({ open: true, message: 'Error: El endpoint /polizas o /estudiantes/:id/poliza no existe en el backend. Por favor, verifica la API.', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Error al asignar póliza', severity: 'error' });
      }
    }
  };

  // --- ACTUALIZAR POLIZA DE SEGURO ---
  const handlePolizaSelectChange = (e: SelectChangeEvent<string>) => {
    setPolizaData({ ...polizaData, estudiante: e.target.value });
    setSearchEstudiante('');
    setFilterTaller('');
  };

  const handlePolizaMenuClose = () => {
    setFilterAnchorEl(null);
    setSearchEstudiante('');
    setFilterTaller('');
  };

  // --- ACTUALIZAR FECHAS Y HORAS DE PASANTÍA ---
  const handleFechasUpdate = async () => {
    if (!fechasData.fecha_inicio_pasantia || !fechasData.fecha_fin_pasantia || !fechasData.horaspasrealizadas_est || !fechasData.estudiante) return;
    setSnackbar({ open: true, message: 'Actualizando fechas...', severity: 'success' });
    try {
      if (fechasData.estudiante === 'all') {
        const activos = estudiantes.filter(e => e.usuario_est?.estado_usuario === 'Activo');
        await Promise.all(
          activos.map(e => studentService.updateFechasPasantia(e.documento_id_est, {
            fecha_inicio_pasantia: fechasData.fecha_inicio_pasantia,
            fecha_fin_pasantia: fechasData.fecha_fin_pasantia,
            horaspasrealizadas_est: Number(fechasData.horaspasrealizadas_est)
          }))
        );
      } else {
        await studentService.updateFechasPasantia(fechasData.estudiante, {
          fecha_inicio_pasantia: fechasData.fecha_inicio_pasantia,
          fecha_fin_pasantia: fechasData.fecha_fin_pasantia,
          horaspasrealizadas_est: Number(fechasData.horaspasrealizadas_est)
        });
      }
      setSnackbar({ open: true, message: 'Fechas actualizadas correctamente', severity: 'success' });
      setOpenFechasDialog(false);
      setFechasData({ fecha_inicio_pasantia: '', fecha_fin_pasantia: '', horaspasrealizadas_est: '', estudiante: 'all' });
      loadData();
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar fechas', severity: 'error' });
    }
  };

  // Función para formatear fechas tipo 'YYYY-MM-DD' a 'DD/MM/YYYY'
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Filtro para historial (eliminados)
  const filteredEliminados = estudiantes.filter(estudiante => {
    const nombreMatch = estudiante.nombre_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.apellido_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.documento_id_est.includes(searchTerm);
    const tallerMatch = selectedTalleres.length === 0 ||
      (estudiante.taller_est && selectedTalleres.includes(String(estudiante.taller_est.id_taller)));
    const usuarioEliminado = estudiante.usuario_est?.estado_usuario === 'Eliminado';
    return nombreMatch && tallerMatch && usuarioEliminado;
  });

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
                placeholder={showHistorial ? "Buscar eliminado..." : "Buscar estudiante..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />, disableUnderline: true, sx: { bgcolor: 'transparent', border: 'none' }
                }}
                variant="standard"
                sx={{ flex: 1, bgcolor: 'transparent', border: 'none' }}
              />
              <MUI.IconButton onClick={handleFilterClick} color="primary" sx={{ ml: 1 }}>
                <FilterListIcon />
              </MUI.IconButton>
            </MUI.Paper>
            <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!showHistorial && (
                <MUI.IconButton onClick={() => setShowHistorial(true)} color="secondary">
                  <HistoryIcon />
                </MUI.IconButton>
              )}
              {showHistorial && (
                <MUI.Button onClick={() => setShowHistorial(false)} color="primary" variant="outlined">Volver</MUI.Button>
              )}
              <MUI.IconButton onClick={() => setOpenPolizaDialog(true)} color="primary">
                <ShieldIcon />
              </MUI.IconButton>
              <MUI.IconButton onClick={() => setOpenFechasDialog(true)} color="primary">
                <EventIcon />
              </MUI.IconButton>
              <MUI.Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNewForm}
                sx={{ borderRadius: 3, boxShadow: 3, bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#115293' } }}
              >
                Nuevo Estudiante
              </MUI.Button>
            </MUI.Box>
          </MUI.Box>
          <MUI.Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MUI.Box sx={{ p: 2, minWidth: 250 }}>
              <MUI.Typography variant="subtitle1" sx={{ mb: 1 }}>Filtrar por taller</MUI.Typography>
              <MUI.FormControl fullWidth>
                <MUI.Select
                  multiple
                  value={selectedTalleres}
                  onChange={handleTallerChange}
                  renderValue={(selected) =>
                    (selected as string[]).map(id => {
                      const t = talleres.find(t => String(t.id_taller) === id);
                      return t ? t.nombre_taller : id;
                    }).join(', ')
                  }
                >
                  {talleres.map((taller) => (
                    <MUI.MenuItem key={taller.id_taller} value={String(taller.id_taller)}>
                      <MUI.Checkbox checked={selectedTalleres.indexOf(String(taller.id_taller)) > -1} />
                      <MUI.ListItemText primary={taller.nombre_taller} />
                    </MUI.MenuItem>
                  ))}
                </MUI.Select>
              </MUI.FormControl>
              <MUI.Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Filtrar por fechas</MUI.Typography>
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
              <MUI.Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <MUI.Button onClick={handleFilterClose} color="primary">Cerrar</MUI.Button>
              </MUI.Box>
            </MUI.Box>
          </MUI.Menu>
          {!showHistorial ? (
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
                              label={`${formatDate(estudiante.fecha_inicio_pasantia)} - ${formatDate(estudiante.fecha_fin_pasantia)}`}
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
                        <MUI.IconButton size="small" color="primary" onClick={() => handleEditClick(estudiante)}>
                          <EditIcon />
                        </MUI.IconButton>
                        <MUI.IconButton size="small" color="error" onClick={() => handleDeleteClick(estudiante)}>
                          <DeleteIcon />
                        </MUI.IconButton>
                      </MUI.TableCell>
                    </MUI.TableRow>
                  ))}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.TableContainer>
          ) : (
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
                    <MUI.TableCell sx={{ fontWeight: 'bold' }}>Acciones</MUI.TableCell>
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {filteredEliminados.map((estudiante) => (
                    <MUI.TableRow key={estudiante.documento_id_est} hover sx={{ transition: 'background 0.2s', '&:hover': { bgcolor: '#fffde7' } }}>
                      <MUI.TableCell>{estudiante.documento_id_est}</MUI.TableCell>
                      <MUI.TableCell>{`${estudiante.nombre_est} ${estudiante.apellido_est}`}</MUI.TableCell>
                      <MUI.TableCell>{estudiante.taller_est?.nombre_taller || '-'}</MUI.TableCell>
                      <MUI.TableCell>{estudiante.contacto_est?.email_contacto || '-'}</MUI.TableCell>
                      <MUI.TableCell>
                        {estudiante.fecha_inicio_pasantia && estudiante.fecha_fin_pasantia ? (
                          <MUI.Tooltip title="Fechas de Pasantía">
                            <MUI.Chip
                              icon={<DateRangeIcon />}
                              label={`${formatDate(estudiante.fecha_inicio_pasantia)} - ${formatDate(estudiante.fecha_fin_pasantia)}`}
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
                        <MUI.IconButton size="small" color="success" onClick={async () => {
                          setRestaurando(estudiante.documento_id_est);
                          try {
                            await userService.updateUser(estudiante.usuario_est.id_usuario, { estado_usuario: 'Activo' });
                            setSnackbar({ open: true, message: 'Estudiante restablecido correctamente', severity: 'success' });
                            loadData();
                          } catch {
                            setSnackbar({ open: true, message: 'Error al restablecer estudiante', severity: 'error' });
                          }
                          setRestaurando(null);
                        }} disabled={restaurando === estudiante.documento_id_est}>
                          <RestoreIcon />
                        </MUI.IconButton>
                      </MUI.TableCell>
                    </MUI.TableRow>
                  ))}
                </MUI.TableBody>
              </MUI.Table>
            </MUI.TableContainer>
          )}
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
          <MUI.Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
            <MUI.DialogTitle>¿Estás seguro de que quieres eliminar este estudiante?</MUI.DialogTitle>
            <MUI.DialogActions>
              <MUI.Button onClick={handleDeleteCancel} color="primary">No</MUI.Button>
              <MUI.Button onClick={handleDeleteConfirm} color="error">Sí</MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>
          <MUI.Dialog open={openPolizaDialog} onClose={() => setOpenPolizaDialog(false)}>
            <MUI.DialogTitle>Actualizar Póliza de Seguro</MUI.DialogTitle>
            <MUI.DialogContent>
              <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <MUI.TextField label="Compañía" value={polizaData.compania} onChange={e => setPolizaData({ ...polizaData, compania: e.target.value })} fullWidth />
                <MUI.TextField label="Tipo de póliza" value={polizaData.tipo_poliza} onChange={e => setPolizaData({ ...polizaData, tipo_poliza: e.target.value })} fullWidth />
                <MUI.TextField label="Nombre de póliza" value={polizaData.nombre_poliza} onChange={e => setPolizaData({ ...polizaData, nombre_poliza: e.target.value })} fullWidth />
                <MUI.TextField label="Número de póliza" value={polizaData.numero_poliza} onChange={e => setPolizaData({ ...polizaData, numero_poliza: e.target.value })} fullWidth />
                <MUI.TextField label="Fecha de inicio" type="date" InputLabelProps={{ shrink: true }} value={polizaData.fecha_inicio} onChange={e => setPolizaData({ ...polizaData, fecha_inicio: e.target.value })} fullWidth />
                <MUI.TextField label="Fecha de fin (opcional)" type="date" InputLabelProps={{ shrink: true }} value={polizaData.fecha_fin} onChange={e => setPolizaData({ ...polizaData, fecha_fin: e.target.value })} fullWidth />
                <MUI.Autocomplete
                  options={[
                    { label: 'Todos los estudiantes activos', value: 'all' },
                    ...estudiantesFiltrados.map(e => ({
                      label: `${e.nombre_est} ${e.apellido_est} (${e.documento_id_est})${e.taller_est ? ' - ' + e.taller_est.nombre_taller : ''}`,
                      value: e.documento_id_est
                    }))
                  ]}
                  value={
                    polizaData.estudiante === 'all'
                      ? { label: 'Todos los estudiantes activos', value: 'all' }
                      : estudiantesFiltrados
                          .map(e => ({
                            label: `${e.nombre_est} ${e.apellido_est} (${e.documento_id_est})${e.taller_est ? ' - ' + e.taller_est.nombre_taller : ''}`,
                            value: e.documento_id_est
                          }))
                          .find(opt => opt.value === polizaData.estudiante) || null
                  }
                  onChange={(_, newValue) => {
                    setPolizaData({ ...polizaData, estudiante: newValue ? newValue.value : '' });
                  }}
                  renderInput={(params) => (
                    <MUI.TextField {...params} label="Aplicar a" placeholder="Buscar estudiante..." fullWidth />
                  )}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  sx={{ bgcolor: '#f5f7fa', borderRadius: 2, '& .MuiAutocomplete-inputRoot': { p: 1.2 } }}
                  noOptionsText="No hay estudiantes que coincidan"
                />
              </MUI.Box>
            </MUI.DialogContent>
            <MUI.DialogActions>
              <MUI.Button onClick={() => setOpenPolizaDialog(false)}>Cancelar</MUI.Button>
              <MUI.Button variant="contained" color="primary" onClick={handlePolizaUpdate} disabled={!polizaData.nombre_poliza || !polizaData.numero_poliza || !polizaData.compania || !polizaData.tipo_poliza || !polizaData.fecha_inicio || !polizaData.estudiante}>
                Asignar
              </MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>
          <MUI.Dialog open={openFechasDialog} onClose={() => setOpenFechasDialog(false)}>
            <MUI.DialogTitle>Actualizar Fechas y Horas de Pasantía</MUI.DialogTitle>
            <MUI.DialogContent>
              <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <MUI.TextField label="Fecha inicio pasantía" type="date" InputLabelProps={{ shrink: true }} value={fechasData.fecha_inicio_pasantia} onChange={e => setFechasData({ ...fechasData, fecha_inicio_pasantia: e.target.value })} fullWidth />
                <MUI.TextField label="Fecha fin pasantía" type="date" InputLabelProps={{ shrink: true }} value={fechasData.fecha_fin_pasantia} onChange={e => setFechasData({ ...fechasData, fecha_fin_pasantia: e.target.value })} fullWidth />
                <MUI.TextField label="Horas realizadas" type="number" value={fechasData.horaspasrealizadas_est} onChange={e => setFechasData({ ...fechasData, horaspasrealizadas_est: e.target.value })} fullWidth />
                <MUI.Autocomplete
                  options={[
                    { label: 'Todos los estudiantes activos', value: 'all' },
                    ...estudiantesFiltrados.map(e => ({
                      label: `${e.nombre_est} ${e.apellido_est} (${e.documento_id_est})${e.taller_est ? ' - ' + e.taller_est.nombre_taller : ''}`,
                      value: e.documento_id_est
                    }))
                  ]}
                  value={
                    fechasData.estudiante === 'all'
                      ? { label: 'Todos los estudiantes activos', value: 'all' }
                      : estudiantesFiltrados
                          .map(e => ({
                            label: `${e.nombre_est} ${e.apellido_est} (${e.documento_id_est})${e.taller_est ? ' - ' + e.taller_est.nombre_taller : ''}`,
                            value: e.documento_id_est
                          }))
                          .find(opt => opt.value === fechasData.estudiante) || null
                  }
                  onChange={(_, newValue) => {
                    setFechasData({ ...fechasData, estudiante: newValue ? newValue.value : '' });
                  }}
                  renderInput={(params) => (
                    <MUI.TextField {...params} label="Aplicar a" placeholder="Buscar estudiante..." fullWidth />
                  )}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  sx={{ bgcolor: '#f5f7fa', borderRadius: 2, '& .MuiAutocomplete-inputRoot': { p: 1.2 } }}
                  noOptionsText="No hay estudiantes que coincidan"
                />
              </MUI.Box>
            </MUI.DialogContent>
            <MUI.DialogActions>
              <MUI.Button onClick={() => setOpenFechasDialog(false)}>Cancelar</MUI.Button>
              <MUI.Button variant="contained" color="primary" onClick={handleFechasUpdate} disabled={!(fechasData.fecha_inicio_pasantia && fechasData.fecha_fin_pasantia && fechasData.horaspasrealizadas_est && fechasData.estudiante)}>
                Actualizar
              </MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>
          <MUI.Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
            <MUI.DialogTitle>{editMode ? 'Editar Estudiante' : 'Nuevo Estudiante'}</MUI.DialogTitle>
            <MUI.DialogContent>

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
                        {sectores.map((sec: Sector) => (
                          <MUI.MenuItem key={sec.id_sec} value={String(sec.id_sec)}>
                            {sec.sector || 'Sin nombre'}
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
                    {!formData.id_doc_file && docsEstudiante?.ced_est && (
                      <MUI.Typography variant="caption" color="success.main">
                        SUBIDO
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
                    {!formData.cv_doc_file && docsEstudiante?.cv_doc && (
                      <MUI.Typography variant="caption" color="success.main">
                        SUBIDO
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
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
};

export default Students;