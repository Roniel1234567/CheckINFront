import { useState, useEffect } from 'react';
import '../../../styles/index.scss';
import * as MUI from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, DateRange as DateRangeIcon, FilterList as FilterListIcon, Shield as ShieldIcon, History as HistoryIcon, Restore as RestoreIcon } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import studentService, { Estudiante } from '../../../services/studentService';
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
import { downloadDocEstudiante, getDocsEstudianteByDocumento } from '../../../services/docEstudianteService';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import polizaService from '../../../services/polizaService';
import * as Icons from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { authService } from '../../../services/authService';
import api from '../../../services/api';
import { useReadOnlyMode } from '../../../hooks/useReadOnlyMode';
import { useToast } from '../../../hooks/useToast';
import emailService from '../../../services/emailService';
import pasantiaService from '../../../services/pasantiaService';

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

// Agregar nueva interfaz para la tabla de fechas
interface FechasPasantiaRow {
  documento_id_est: string;
  nombre_completo: string;
  centro: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  horas_realizadas: number;
  tipo_documento_est: string;
  pasaporte_codigo_pais?: string;
}

// Definir tipo mínimo para Tutor solo para este uso
interface TutorMin {
  usuario_tutor: number | { id_usuario: number };
  taller_tutor: number | { id_taller: number };
}

interface FormData {
  nacionalidad: string;
  tipoDocumento: string;
  documento: string;
  pasaporte_codigo_pais: string;
  nombre: string;
  segNombre: string;
  apellido: string;
  segApellido: string;
  fechaNacimiento: string;
  sexo_est: string;
  telefono: string;
  email: string;
  taller: string;
  provincia: string;
  ciudad: string;
  sector: string;
  calle: string;
  numero: string;
  direccionId: string;
  inicioCiclo: string;
  finCiclo: string;
  estadoCiclo: string;
  usuario: string;
  contrasena: string;
  id_doc_file: File | null;
  cv_doc_file: File | null;
  anexo_iv_doc_file: File | null;
  anexo_v_doc_file: File | null;
  acta_nac_doc_file: File | null;
  ced_padres_doc_file: File | null;
  vac_covid_doc_file: File | null;
  horaspasrealizadas: string;
  nombrePersonaContacto: string;
  apellidoPersonaContacto: string;
  relacionPersonaContacto: string;
  telefonoPersonaContacto: string;
  correoPersonaContacto: string;
  nacionalidadOtra: string;
  nombrePoliza: string;
  numeroPoliza: string;
  fechaInicioPasantia: string;
  fechaFinPasantia: string;
  cicloEscolarId?: number | null;
  id_usuario?: number | null;
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [estudianteToDelete, setEstudianteToDelete] = useState<Estudiante | null>(null);
  const [docsEstudiante, setDocsEstudiante] = useState<DocsEstudiante | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{provincia?: string, ciudad?: string, sector?: string} | null>(null);
  const [openPolizaDialog, setOpenPolizaDialog] = useState(false);
  const [openFechasDialog, setOpenFechasDialog] = useState(false);
  const [fechasRows, setFechasRows] = useState<FechasPasantiaRow[]>([]);
  const [polizaData, setPolizaData] = useState({
    compania: '',
    tipo_poliza: '',
    nombre_poliza: '',
    numero_poliza: '',
    fecha_inicio: '',
    fecha_fin: '',
    estudiante: 'all'
  });
  const [showHistorial, setShowHistorial] = useState(false);
  const [restaurando, setRestaurando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Filtros para la tabla de fechas (diálogo de fechas)
  const [fechasSearchTerm, setFechasSearchTerm] = useState('');
  const [fechasTallerFiltro, setFechasTallerFiltro] = useState('');
  const [fechasCentroFiltro, setFechasCentroFiltro] = useState('');
  const [fechasData, setFechasData] = useState<FechasPasantiaRow[]>([]);

  const isReadOnly = useReadOnlyMode();
  const [fechasModificadas, setFechasModificadas] = useState(false);

  const toast = useToast();

  // Lógica de usuario y rol
  const user = authService.getCurrentUser();
  const esTutor = user && user.rol === 3;
  const [tallerTutor, setTallerTutor] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nacionalidad: 'Dominicana',
    tipoDocumento: 'Cédula',
    documento: '',
    pasaporte_codigo_pais: '',
    nombre: '',
    segNombre: '',
    apellido: '',
    segApellido: '',
    fechaNacimiento: '',
    sexo_est: '',
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
    nombrePoliza: '',
    numeroPoliza: '',
    fechaInicioPasantia: '',
    fechaFinPasantia: '',
    cicloEscolarId: null,
  });

  // Obtener el taller del tutor al cargar
  useEffect(() => {
    const fetchTallerTutor = async () => {
      if (esTutor && user) {
        try {
          const { data } = await api.get<TutorMin[] | { tutores: TutorMin[] }>('/tutores');
          const tutores: TutorMin[] = Array.isArray(data) ? data : (data as { tutores: TutorMin[] }).tutores;
          const tutor = tutores.find((t) => {
            if (typeof t.usuario_tutor === 'object' && t.usuario_tutor !== null) {
              return t.usuario_tutor.id_usuario === user.id_usuario;
            }
            return t.usuario_tutor === user.id_usuario;
          });
          if (tutor && tutor.taller_tutor) {
            const idTaller = typeof tutor.taller_tutor === 'object' && tutor.taller_tutor !== null
              ? tutor.taller_tutor.id_taller
              : tutor.taller_tutor;
            setTallerTutor(Number(idTaller));
          }
        } catch (error) {
          console.error('Error al obtener el taller del tutor:', error);
        }
      }
    };
    fetchTallerTutor();
  }, [esTutor, user]);

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

  // Función para generar una contraseña segura
  const generateSecurePassword = () => {
    // Generar una contraseña de 12 caracteres con números, letras y símbolos
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isReadOnly) return;
    // Log para depuración
    console.log('editMode:', editMode, 'id_usuario:', formData.id_usuario);

    try {
      setLoading(true);
      setError(null);

      // Generar usuario y contraseña
      const usuario = formData.pasaporte_codigo_pais 
        ? `${formData.pasaporte_codigo_pais}-${formData.documento}`
        : formData.documento;
      const contrasena = generateSecurePassword();

      // 1. Crear el contacto primero
      const contactoResponse = await api.post('/contactos', {
              telefono_contacto: formData.telefono,
              email_contacto: formData.email
            });

      const contactoId = contactoResponse.data.id_contacto;

      // 2. Crear la dirección
      const direccionResponse = await api.post('/direcciones', {
          sector_dir: Number(formData.sector),
          calle_dir: formData.calle,
          num_res_dir: formData.numero
        });

      const direccionId = direccionResponse.data.id_dir;

      // 3. Crear el usuario primero
      if (editMode && formData.id_usuario) {
        // Definir camposActualizables antes de los try/catch
        const camposActualizables = {
          nombre_est: formData.nombre,
          seg_nombre_est: formData.segNombre || undefined,
          apellido_est: formData.apellido,
          seg_apellido_est: formData.segApellido || undefined,
          fecha_nac_est: formData.fechaNacimiento,
          sexo_est: formData.sexo_est as "Masculino" | "Femenino",
          nacionalidad: formData.nacionalidad === 'Otra' ? formData.nacionalidadOtra : formData.nacionalidad,
          pasaporte_codigo_pais: formData.pasaporte_codigo_pais || undefined,
          usuario_est: Number(formData.id_usuario),
          direccion_id: Number(formData.direccionId),
          taller_est: { id_taller: Number(formData.taller) },
          ...(formData.cicloEscolarId ? { ciclo_escolar_est: formData.cicloEscolarId } : {})
        };
        try {
          // Generar nueva contraseña
          const nuevaContrasena = generateSecurePassword();
          // Calcular el usuario final según el tipo de documento
          const usuarioFinal = formData.tipoDocumento === 'Pasaporte'
            ? `${formData.pasaporte_codigo_pais}-${formData.documento}`
            : formData.documento;
          // Log antes de actualizar usuario
          console.log('Intentando actualizar usuario:', formData.id_usuario, { contrasena_usuario: nuevaContrasena, dato_usuario: usuarioFinal });
          try {
            await userService.updateUser(formData.id_usuario, {
              contrasena_usuario: nuevaContrasena,
              dato_usuario: usuarioFinal
            });
            console.log('Usuario actualizado');
          } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
          }

          // Actualizar el estudiante
          try {
            await studentService.updateStudent(formData.documento, camposActualizables);
          } catch (firstError) {
            console.log('Primer intento falló, reintentando en 2 segundos...', firstError);
            await new Promise(resolve => setTimeout(resolve, 2000));
            await studentService.updateStudent(formData.documento, camposActualizables);
          }

          // Enviar credenciales por email después de actualizar
          if (formData.email) {
            try {
              await emailService.sendCredencialesEmail({
                correoEstudiante: formData.email,
                nombreEstudiante: `${formData.nombre} ${formData.apellido}`,
                usuario: usuarioFinal,
                contrasena: nuevaContrasena
              });
              setSnackbar({ open: true, message: 'Estudiante actualizado y credenciales enviadas por email', severity: 'success' });
            } catch (emailError) {
              console.error('Error al enviar el email:', emailError);
              setSnackbar({ open: true, message: 'Estudiante actualizado pero hubo un error al enviar las credenciales por email', severity: 'error' });
            }
          } else {
            setSnackbar({ open: true, message: 'Estudiante actualizado correctamente', severity: 'success' });
          }

          await loadData();
          setOpenForm(false);
          return;
        } catch (error) {
          console.error('Error al actualizar estudiante:', error);
          setSnackbar({
            open: true,
            message: 'Error al actualizar el estudiante',
            severity: 'error'
          });
          return;
        }
      } else {
        // Crear estudiante
        const nuevoUsuario = await userService.createUser({
        dato_usuario: usuario,
        contrasena_usuario: contrasena,
        rol_usuario: 1 // Rol de estudiante
      });

      // 4. Crear el estudiante con el ID del usuario
        const nuevoEstudiante = {
          tipo_documento_est: formData.tipoDocumento,
          documento_id_est: formData.documento,
          nombre_est: formData.nombre,
        seg_nombre_est: formData.segNombre || null,
          apellido_est: formData.apellido,
        seg_apellido_est: formData.segApellido || null,
          fecha_nac_est: formData.fechaNacimiento,
        sexo_est: formData.sexo_est as "Masculino" | "Femenino",
          nacionalidad: formData.nacionalidad === 'Otra' ? formData.nacionalidadOtra : formData.nacionalidad,
        pasaporte_codigo_pais: formData.pasaporte_codigo_pais || null,
          taller_est: formData.taller ? Number(formData.taller) : null,
        usuario_est: nuevoUsuario.id_usuario, // Usar el ID del usuario creado
        contacto_est: contactoId,
        direccion_id: direccionId,
        ciclo_escolar: {
          inicio_ciclo: Number(formData.inicioCiclo),
          fin_ciclo: Number(formData.finCiclo),
          estado_ciclo: formData.estadoCiclo
        },
        persona_contacto: {
          nombre: formData.nombrePersonaContacto,
          apellido: formData.apellidoPersonaContacto,
          relacion: formData.relacionPersonaContacto as 'Padre' | 'Madre' | 'Tutor',
          telefono: formData.telefonoPersonaContacto,
          correo: formData.correoPersonaContacto || null
        }
      };

      const estudianteCreado = await studentService.createStudent(nuevoEstudiante);

      // Enviar email con las credenciales
      if (formData.email) {
        try {
          await emailService.sendCredencialesEmail({
            correoEstudiante: formData.email,
            nombreEstudiante: `${formData.nombre} ${formData.apellido}`,
            usuario: usuario,
            contrasena: contrasena
          });
          setSnackbar({ open: true, message: 'Estudiante creado y credenciales enviadas por email', severity: 'success' });
        } catch (emailError) {
          console.error('Error al enviar el email:', emailError);
          setSnackbar({ 
            open: true, 
            message: 'Estudiante creado pero hubo un error al enviar las credenciales por email', 
            severity: 'error' 
          });
        }
      }
      }

      setOpenForm(false);
      loadData();
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      setError('Error al crear el estudiante');
      setSnackbar({
        open: true,
        message: 'Error al crear el estudiante. Por favor, verifica los datos e intenta nuevamente.', 
        severity: 'error'
      });
    } finally {
      setLoading(false);
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
    const searchMatch = !searchTerm || 
      estudiante.nombre_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.apellido_est.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.documento_id_est.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por taller
    let tallerMatch = selectedTalleres.length === 0 ||
      (estudiante.taller_est && selectedTalleres.includes(String(estudiante.taller_est.id_taller)));
    // Si es tutor, solo los de su taller
    if (esTutor && tallerTutor) {
      tallerMatch = estudiante.taller_est && estudiante.taller_est.id_taller === tallerTutor;
    }

    // Filtro por fechas
    let fechaMatch = true;
    if (dateRange.start || dateRange.end) {
      const fechaInicio = estudiante.fecha_inicio_pasantia ? new Date(estudiante.fecha_inicio_pasantia) : null;
      const fechaFin = estudiante.fecha_fin_pasantia ? new Date(estudiante.fecha_fin_pasantia) : null;
      if (dateRange.start && fechaInicio) {
        fechaMatch = fechaMatch && fechaInicio >= new Date(dateRange.start);
      }
      if (dateRange.end && fechaFin) {
        fechaMatch = fechaMatch && fechaFin <= new Date(dateRange.end);
      }
      if (!fechaInicio || !fechaFin) {
        fechaMatch = false;
      }
    }
    // Solo mostrar estudiantes activos
    const estadoMatch = estudiante.usuario_est?.estado_usuario === 'Activo';
    return searchMatch && tallerMatch && fechaMatch && estadoMatch;
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

  const handleEditClick = async (estudiante: Estudiante) => {
    if (isReadOnly) return;
    setEditMode(true); // <-- asegurar que siempre se setea
    setOpenForm(true);

    // Obtener dirección completa
    let direccionCompleta: DireccionCompleta | null = null;
    try {
      direccionCompleta = await direccionService.getDireccionByEstudianteDocumento(estudiante.documento_id_est) as DireccionCompleta;
      console.log('Dirección cargada:', direccionCompleta); // Añadir log para debug
    } catch (error) {
      console.error('Error al cargar la dirección:', error);
      direccionCompleta = null;
    }

    // Extraer IDs
    let provinciaId = '';
    let ciudadId = '';
    let sectorId = '';
    let direccionId = '';
    if (direccionCompleta && direccionCompleta.sector_dir) {
      sectorId = String(direccionCompleta.sector_dir.id_sec);
      ciudadId = String(direccionCompleta.sector_dir.ciudad_sec);
      provinciaId = String(direccionCompleta.sector_dir.ciudad.provincia_ciu);
      direccionId = String(direccionCompleta.id_dir);
    }

    // Obtener datos de contacto y documentos
    let personaContacto = null;
    let docs: DocsEstudiante | null = null;
    try {
      const contactoResp = await personaContactoEstudianteService.getPersonaContactoByDocumento(estudiante.documento_id_est);
      personaContacto = Array.isArray(contactoResp) ? contactoResp[0] : contactoResp;
      console.log("Datos de persona de contacto cargados:", personaContacto); // Debug
    } catch (error) {
      console.error("Error cargando persona de contacto:", error);
      personaContacto = null;
    }

    try {
      const docsResp = await getDocsEstudianteByDocumento(estudiante.documento_id_est);
      docs = docsResp && Array.isArray(docsResp) && docsResp.length > 0 ? docsResp[0] : docsResp;
      setDocsEstudiante(docs);
    } catch {
      setDocsEstudiante(null);
    }

    // Normalizar la nacionalidad
    const nacionalidadOriginal = estudiante.nacionalidad || '';
    const esDominicano = !nacionalidadOriginal || nacionalidadOriginal.trim().toLowerCase() === 'dominicana';

    const datosFormulario = {
      provincia: String(provinciaId || ''),
      ciudad: String(ciudadId || ''),
      sector: String(sectorId || ''),
      calle: direccionCompleta ? direccionCompleta.calle_dir : '',
      numero: direccionCompleta ? direccionCompleta.num_res_dir : '',
      direccionId: direccionId,
      nacionalidad: esDominicano ? 'Dominicana' : 'Otra',
      nacionalidadOtra: esDominicano ? '' : (nacionalidadOriginal || '').trim(),
      tipoDocumento: estudiante.tipo_documento_est || (esDominicano ? 'Cédula' : 'Pasaporte'),
      documento: estudiante.documento_id_est,
      pasaporte_codigo_pais: estudiante.pasaporte_codigo_pais || '',
      nombre: estudiante.nombre_est,
      segNombre: estudiante.seg_nombre_est || '',
      apellido: estudiante.apellido_est,
      segApellido: estudiante.seg_apellido_est || '',
      fechaNacimiento: estudiante.fecha_nac_est,
      sexo_est: estudiante.sexo_est || '',
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
      nombrePoliza: '',
      numeroPoliza: '',
      fechaInicioPasantia: estudiante.fecha_inicio_pasantia || '',
      fechaFinPasantia: estudiante.fecha_fin_pasantia || '',
      id_usuario: estudiante.usuario_est?.id_usuario || null, // <-- asegurar que siempre se setea
      cicloEscolarId: estudiante.ciclo_escolar_est?.id_ciclo || null,
    };
    setFormData(datosFormulario);

    if (provinciaId && ciudadId) {
      const ciudadesProv = await internshipService.getCiudadesByProvincia(Number(provinciaId));
      setCiudades(ciudadesProv);
      const sectoresCiudad = await internshipService.getSectoresByCiudad(Number(ciudadId));
      setSectores(sectoresCiudad as unknown as Sector[]);
      setPendingLocation({
        provincia: String(provinciaId),
        ciudad: String(ciudadId),
        sector: String(sectorId)
      });
    }
  };

  const handleDeleteClick = (estudiante: Estudiante) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    console.log('handleOpenNewForm ejecutado'); // DEBUG
    setEditMode(false);
    setDocsEstudiante(null);
    setFormData({
      nacionalidad: 'Dominicana',
      tipoDocumento: 'Cédula',
      documento: '',
      pasaporte_codigo_pais: '',
      nombre: '',
      segNombre: '',
      apellido: '',
      segApellido: '',
      fechaNacimiento: '',
      sexo_est: '',
      telefono: '',
      email: '',
      taller: esTutor && tallerTutor ? String(tallerTutor) : '',
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
      nombrePoliza: '',
      numeroPoliza: '',
      fechaInicioPasantia: '',
      fechaFinPasantia: '',
      cicloEscolarId: null,
    });
    setOpenForm(true);
  };

  // Al cerrar el formulario, limpiar todo
  const handleCloseForm = () => {
    setOpenForm(false);
    setEditMode(false);
    setDocsEstudiante(null);
    setFormData({
      nacionalidad: 'Dominicana',
      tipoDocumento: 'Cédula',
      documento: '',
      pasaporte_codigo_pais: '',
      nombre: '',
      segNombre: '',
      apellido: '',
      segApellido: '',
      fechaNacimiento: '',
      sexo_est: '',
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
      nombrePoliza: '',
      numeroPoliza: '',
      fechaInicioPasantia: '',
      fechaFinPasantia: '',
      cicloEscolarId: null,
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

  // --- ACTUALIZAR FECHAS Y HORAS DE PASANTÍA ---
  const cargarDatosFechas = async () => {
    try {
      // Obtener todos los estudiantes y todas las pasantías
      const estudiantes = await studentService.getAllStudents();
      const pasantias = await pasantiaService.getAllPasantias();

      const fechasData = estudiantes
        .filter(est => {
          if (esTutor && tallerTutor) {
            return est.usuario_est?.estado_usuario === 'Activo' && est.taller_est?.id_taller === tallerTutor;
          }
          return est.usuario_est?.estado_usuario === 'Activo';
        })
        .map(est => {
          // Buscar la pasantía activa o la más reciente del estudiante
          const pasantiasEst = pasantias.filter(p => p.estudiante_pas.documento_id_est === est.documento_id_est);
          const pasantia = pasantiasEst.find(p => p.estado_pas === 'En Proceso') || pasantiasEst[0];

          return {
            documento_id_est: est.documento_id_est,
            nombre_completo: `${est.nombre_est} ${est.apellido_est}`,
            centro: pasantia ? pasantia.centro_pas.nombre_centro : '-',
            fecha_inicio: est.fecha_inicio_pasantia || '',
            fecha_fin: est.fecha_fin_pasantia || '',
            horas_realizadas: Number(est.horaspasrealizadas_est ?? 0),
            tipo_documento_est: est.tipo_documento_est,
            pasaporte_codigo_pais: est.pasaporte_codigo_pais
          };
        });

      setFechasData(fechasData);
      setFechasRows(fechasData);
      setFechasModificadas(false);
    } catch (error) {
      console.error('Error al cargar fechas:', error);
      toast.error('Error al cargar los datos de fechas');
      setFechasData([]);
      setFechasRows([]);
    }
  };

  const handleFechaCellChange = (estudiante: string, field: 'fecha_inicio' | 'fecha_fin' | 'horas_realizadas', value: string | number) => {
    setFechasData(prev => {
      const newData = prev.map(row => {
      if (row.documento_id_est === estudiante) {
        return { ...row, [field]: value };
      }
      return row;
      });
      setFechasModificadas(true); // Marcar que hay cambios
      return newData;
    });
  };

  const handleGuardarFechas = async () => {
    if (!fechasModificadas) return;
    
      setLoading(true);
    try {
      await Promise.all(
        fechasData.map(async (estudiante) => {
          await studentService.updateFechasPasantia(estudiante.documento_id_est, {
            fecha_inicio_pasantia: estudiante.fecha_inicio,
            fecha_fin_pasantia: estudiante.fecha_fin,
            horaspasrealizadas_est: estudiante.horas_realizadas
          });
        })
      );
      
      toast.success('Fechas actualizadas correctamente');
      setFechasModificadas(false);
      await cargarDatosFechas(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar fechas:', error);
      toast.error('Error al actualizar las fechas');
    } finally {
      setLoading(false);
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

  // Modificar la función de exportar a Excel
  const exportarFechasExcel = () => {
    try {
      if (!fechasTallerFiltro) {
        setSnackbar({ 
          open: true, 
          message: 'Selecciona un taller antes de exportar', 
          severity: 'warning' 
        });
        return;
      }

      // Obtener los datos filtrados
      const datosFiltrados = filtrarDatosFechas(fechasRows);
      
      if (datosFiltrados.length === 0) {
        setSnackbar({ 
          open: true, 
          message: 'No hay datos para exportar', 
          severity: 'warning' 
        });
        return;
      }

      // Obtener el nombre del taller seleccionado
      const tallerSeleccionado = talleres.find(t => t.id_taller === Number(fechasTallerFiltro));
      const nombreTaller = tallerSeleccionado?.nombre_taller || 'Taller';

      // Crear el workbook y la hoja
      const wb = XLSX.utils.book_new();
      
      // Preparar los datos para Excel
      const excelData = datosFiltrados.map(row => ({
        'Documento': row.documento_id_est,
        'Estudiante': row.nombre_completo,
        'Centro de Trabajo': row.centro,
        'Fecha Inicio': row.fecha_inicio || '',
        'Fecha Fin': row.fecha_fin || '',
        'Horas Realizadas': row.horas_realizadas
      }));

      // Crear la hoja de Excel
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar el ancho de las columnas
      const columnas = [
        { wch: 15 },  // Documento
        { wch: 30 },  // Estudiante
        { wch: 30 },  // Centro de Trabajo
        { wch: 15 },  // Fecha Inicio
        { wch: 15 },  // Fecha Fin
        { wch: 15 }   // Horas Realizadas
      ];
      ws['!cols'] = columnas;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, nombreTaller);

      // Generar el archivo y descargarlo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Horas_Pasantia_${nombreTaller}_${fecha}.xlsx`);

      setSnackbar({ 
        open: true, 
        message: 'Archivo Excel exportado correctamente', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al exportar el archivo Excel', 
        severity: 'error' 
      });
    }
  };

  // Modificar el handleFechasClick existente
  const handleFechasClick = async () => {
    await cargarDatosFechas();
    setOpenFechasDialog(true);
  };

  // Función para filtrar los datos de fechas
  const filtrarDatosFechas = (data: FechasPasantiaRow[]) => {
    return data.filter(row => {
      const cumpleBusqueda = !fechasSearchTerm || 
        row.nombre_completo.toLowerCase().includes(fechasSearchTerm.toLowerCase()) ||
        row.documento_id_est.toLowerCase().includes(fechasSearchTerm.toLowerCase());

      const cumpleCentro = !fechasCentroFiltro || row.centro === fechasCentroFiltro;

      // Para el filtro de taller, necesitamos obtener el taller del estudiante
      const estudiante = estudiantes.find(e => e.documento_id_est === row.documento_id_est);
      const cumpleTaller = !fechasTallerFiltro || 
        (estudiante?.taller_est?.id_taller === Number(fechasTallerFiltro));

      return cumpleBusqueda && cumpleCentro && cumpleTaller;
    });
  };

  if (error) {
    return (
      <MUI.Box sx={{ p: 2 }}>
        <MUI.Alert severity="error">{error}</MUI.Alert>
      </MUI.Box>
    );
  }

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
              {/* Solo mostrar la opción de póliza si NO es tutor */}
              {!esTutor && (
                <MUI.IconButton onClick={() => setOpenPolizaDialog(true)} color="primary">
                  <ShieldIcon />
                </MUI.IconButton>
              )}
              <MUI.IconButton 
                onClick={handleFechasClick} 
                color="primary"
                title="Actualizar fechas y horas"
              >
                <Icons.CalendarMonth />
              </MUI.IconButton>
              <MUI.Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNewForm}
                sx={{ borderRadius: 3, boxShadow: 3, bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#115293' } }}
                disabled={isReadOnly}
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
                  sx={commonSelectStyles}
                  MenuProps={commonMenuProps}
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
            <MUI.TableContainer component={MUI.Paper} sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
              <MUI.Table>
                <MUI.TableHead>
                  <MUI.TableRow>
                    <MUI.TableCell>Documento</MUI.TableCell>
                    <MUI.TableCell>Nombre</MUI.TableCell>
                    <MUI.TableCell>Apellido</MUI.TableCell>
                    <MUI.TableCell>Taller</MUI.TableCell>
                    <MUI.TableCell>Póliza</MUI.TableCell>
                    <MUI.TableCell>Documentos</MUI.TableCell>
                    <MUI.TableCell>Acciones</MUI.TableCell>
                  </MUI.TableRow>
                </MUI.TableHead>
                <MUI.TableBody>
                  {showHistorial ? (
                    // Mostrar estudiantes eliminados
                    filteredEliminados.map((estudiante) => (
                      <MUI.TableRow key={estudiante.documento_id_est} hover sx={{ transition: 'background 0.2s', '&:hover': { bgcolor: '#fffde7' } }}>
                        <MUI.TableCell>
                          {estudiante.tipo_documento_est === 'Pasaporte' && estudiante.pasaporte_codigo_pais ? 
                            `${estudiante.pasaporte_codigo_pais}-${estudiante.documento_id_est}` : 
                            estudiante.documento_id_est
                          }
                        </MUI.TableCell>
                        <MUI.TableCell>{estudiante.nombre_est}</MUI.TableCell>
                        <MUI.TableCell>{estudiante.apellido_est}</MUI.TableCell>
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
                          <MUI.IconButton 
                            size="small" 
                            color="success" 
                            onClick={async () => {
                            setRestaurando(estudiante.documento_id_est);
                            try {
                              await userService.updateUser(estudiante.usuario_est.id_usuario, { estado_usuario: 'Activo' });
                              setSnackbar({ open: true, message: 'Estudiante restablecido correctamente', severity: 'success' });
                              loadData();
                            } catch {
                              setSnackbar({ open: true, message: 'Error al restablecer estudiante', severity: 'error' });
                            }
                            setRestaurando(null);
                            }} 
                            disabled={isReadOnly || restaurando === estudiante.documento_id_est}
                          >
                            <RestoreIcon />
                          </MUI.IconButton>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))
                  ) : (
                    // Mostrar estudiantes activos
                    filteredEstudiantes.map((estudiante) => (
                      <MUI.TableRow key={estudiante.documento_id_est} hover sx={{ transition: 'background 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}>
                        <MUI.TableCell>
                          {estudiante.tipo_documento_est === 'Pasaporte' ? 
                            `${estudiante.pasaporte_codigo_pais || ''}-${estudiante.documento_id_est}` : 
                            estudiante.documento_id_est
                          }
                        </MUI.TableCell>
                        <MUI.TableCell>{estudiante.nombre_est}</MUI.TableCell>
                        <MUI.TableCell>{estudiante.apellido_est}</MUI.TableCell>
                        <MUI.TableCell>{estudiante.taller_est?.nombre_taller || '-'}</MUI.TableCell>
                        <MUI.TableCell>
                          {estudiante.poliza ? (
                            <MUI.Chip
                              label={`Póliza #${estudiante.poliza.numero_poliza}`}
                              color="success"
                              size="small"
                              sx={{ fontWeight: 'medium' }}
                            />
                          ) : (
                            <MUI.Chip
                              label="Sin póliza"
                              color="error"
                              size="small"
                              sx={{ fontWeight: 'medium' }}
                            />
                          )}
                        </MUI.TableCell>
                        <MUI.TableCell>
                          <DocumentosMenu documento={estudiante.documento_id_est} />
                        </MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                            <MUI.IconButton 
                              size="small" 
                              onClick={() => handleEditClick(estudiante)}
                              sx={{ color: theme.palette.primary.main }}
                              disabled={isReadOnly}
                            >
                              <EditIcon />
                            </MUI.IconButton>
                            <MUI.IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(estudiante)}
                              sx={{ color: theme.palette.error.main }}
                              disabled={isReadOnly}
                            >
                              <DeleteIcon />
                            </MUI.IconButton>
                          </MUI.Box>
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))
                  )}
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
                      <MUI.TableCell>
                        {estudiante.tipo_documento_est === 'Pasaporte' ? 
                          `${estudiante.pasaporte_codigo_pais || ''}-${estudiante.documento_id_est}` : 
                          estudiante.documento_id_est
                        }
                      </MUI.TableCell>
                      <MUI.TableCell>{estudiante.nombre_est}</MUI.TableCell>
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
                        <MUI.IconButton 
                          size="small" 
                          color="success" 
                          onClick={async () => {
                          setRestaurando(estudiante.documento_id_est);
                          try {
                            await userService.updateUser(estudiante.usuario_est.id_usuario, { estado_usuario: 'Activo' });
                            setSnackbar({ open: true, message: 'Estudiante restablecido correctamente', severity: 'success' });
                            loadData();
                          } catch {
                            setSnackbar({ open: true, message: 'Error al restablecer estudiante', severity: 'error' });
                          }
                          setRestaurando(null);
                          }} 
                          disabled={isReadOnly || restaurando === estudiante.documento_id_est}
                        >
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
                    ...estudiantes.map(e => ({
                      label: `${e.nombre_est} ${e.apellido_est} (${e.documento_id_est})${e.taller_est ? ' - ' + e.taller_est.nombre_taller : ''}`,
                      value: e.documento_id_est
                    }))
                  ]}
                  value={
                    polizaData.estudiante === 'all'
                      ? { label: 'Todos los estudiantes activos', value: 'all' }
                      : estudiantes
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
              <MUI.Button
                variant="contained"
                color="primary"
                onClick={handlePolizaUpdate}
                disabled={isReadOnly || loading}
                sx={{ mt: 2 }}
              >
                {loading ? <MUI.CircularProgress size={24} /> : 'Actualizar Póliza'}
              </MUI.Button>
            </MUI.DialogActions>
          </MUI.Dialog>
          <MUI.Dialog 
            open={openFechasDialog}
            onClose={() => setOpenFechasDialog(false)}
            maxWidth="lg"
            fullWidth
          >
            <MUI.DialogTitle>
              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.CalendarToday />
                Actualizar Fechas y Horas de Pasantía
              </MUI.Box>
            </MUI.DialogTitle>
            <MUI.DialogContent>
              {/* Filtros */}
              <MUI.Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                <MUI.Grid item xs={12} md={4}>
                  <MUI.TextField
                    fullWidth
                    label="Buscar estudiante"
                    placeholder="Nombre o documento..."
                    value={fechasSearchTerm}
                    onChange={(e) => setFechasSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <MUI.InputAdornment position="start">
                          <Icons.Search />
                        </MUI.InputAdornment>
                      ),
                    }}
                  />
                </MUI.Grid>
                <MUI.Grid item xs={12} md={4}>
                  <MUI.FormControl fullWidth>
                    <MUI.InputLabel>Taller</MUI.InputLabel>
                    <MUI.Select
                      value={fechasTallerFiltro}
                      onChange={(e) => setFechasTallerFiltro(e.target.value)}
                      label="Taller"
                      sx={commonSelectStyles}
                      MenuProps={commonMenuProps}
                    >
                      <MUI.MenuItem value="">Todos</MUI.MenuItem>
                      {talleres.map((taller) => (
                        <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                          {taller.nombre_taller}
                        </MUI.MenuItem>
                      ))}
                    </MUI.Select>
                  </MUI.FormControl>
                </MUI.Grid>
                <MUI.Grid item xs={12} md={4}>
                  <MUI.FormControl fullWidth>
                    <MUI.InputLabel>Centro</MUI.InputLabel>
                    <MUI.Select
                      value={fechasCentroFiltro}
                      onChange={(e) => setFechasCentroFiltro(e.target.value)}
                      label="Centro"
                      sx={commonSelectStyles}
                      MenuProps={commonMenuProps}
                    >
                      <MUI.MenuItem value="">Todos</MUI.MenuItem>
                      {Array.from(new Set(fechasRows.map(row => row.centro)))
                        .filter(centro => centro !== '-')
                        .sort()
                        .map((centro) => (
                          <MUI.MenuItem key={centro} value={centro}>
                            {centro}
                          </MUI.MenuItem>
                      ))}
                    </MUI.Select>
                  </MUI.FormControl>
                </MUI.Grid>
              </MUI.Grid>

              {/* Tabla de fechas */}
              <MUI.TableContainer component={MUI.Paper} sx={{ mt: 2 }}>
                <MUI.Table>
                  <MUI.TableHead>
                    <MUI.TableRow>
                      <MUI.TableCell>Documento - Nombre</MUI.TableCell>
                      <MUI.TableCell>Centro</MUI.TableCell>
                      <MUI.TableCell>Fecha Inicio</MUI.TableCell>
                      <MUI.TableCell>Fecha Fin</MUI.TableCell>
                      <MUI.TableCell>Horas Realizadas</MUI.TableCell>
                    </MUI.TableRow>
                  </MUI.TableHead>
                  <MUI.TableBody>
                    {filtrarDatosFechas(fechasData).map((row) => (
                      <MUI.TableRow key={row.documento_id_est}>
                        <MUI.TableCell>
                          {row.tipo_documento_est === 'Pasaporte' ? 
                            `${row.pasaporte_codigo_pais || ''}-${row.documento_id_est}` : 
                            row.documento_id_est
                          } - {row.nombre_completo}
                        </MUI.TableCell>
                        <MUI.TableCell>{row.centro}</MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.TextField
                            type="date"
                            value={row.fecha_inicio || ''}
                            onChange={(e) => handleFechaCellChange(row.documento_id_est, 'fecha_inicio', e.target.value)}
                            disabled={isReadOnly}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.TextField
                            type="date"
                            value={row.fecha_fin || ''}
                            onChange={(e) => handleFechaCellChange(row.documento_id_est, 'fecha_fin', e.target.value)}
                            disabled={isReadOnly}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </MUI.TableCell>
                        <MUI.TableCell>
                          <MUI.TextField
                            type="number"
                            value={row.horas_realizadas || ''}
                            onChange={(e) => handleFechaCellChange(row.documento_id_est, 'horas_realizadas', e.target.value)}
                            disabled={isReadOnly}
                            fullWidth
                          />
                        </MUI.TableCell>
                      </MUI.TableRow>
                    ))}
                  </MUI.TableBody>
                </MUI.Table>
              </MUI.TableContainer>
            </MUI.DialogContent>
            <MUI.DialogActions sx={{ p: 2, gap: 1 }}>
              <MUI.Tooltip 
                title={!fechasTallerFiltro ? "Selecciona un taller antes de exportar" : ""}
                arrow
              >
                <span>
                  <MUI.Button
                    variant="outlined"
                    startIcon={<Icons.FileDownload />}
                    onClick={exportarFechasExcel}
                    disabled={!fechasTallerFiltro || loading}
                  >
                    Exportar Excel
                  </MUI.Button>
                </span>
              </MUI.Tooltip>
              <MUI.Button onClick={() => setOpenFechasDialog(false)}>
                Cancelar
              </MUI.Button>
              <MUI.Button
                variant="contained"
                onClick={handleGuardarFechas}
                disabled={isReadOnly || !fechasModificadas || loading}
                startIcon={loading ? <MUI.CircularProgress size={20} /> : <Icons.Save />}
              >
                Guardar Cambios
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
                        sx={commonSelectStyles}
                        MenuProps={commonMenuProps}
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
                        sx={commonSelectStyles}
                        MenuProps={commonMenuProps}
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
                  {formData.tipoDocumento === 'Pasaporte' && (
                    <MUI.Grid item xs={12} sm={6}>
                      <MUI.TextField
                        fullWidth
                        label="Código de País del Pasaporte"
                        name="pasaporte_codigo_pais"
                        value={formData.pasaporte_codigo_pais}
                        onChange={handleInputChange}
                        required={formData.tipoDocumento === 'Pasaporte'}
                        helperText="Ejemplo: DO, US, ES, etc."
                      />
                    </MUI.Grid>
                  )}
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
                    <MUI.FormControl fullWidth required>
                        <MUI.InputLabel id="sexo-label">Sexo</MUI.InputLabel>
                        <MUI.Select
                            labelId="sexo-label"
                            name="sexo_est"
                            value={formData.sexo_est}
                            label="Sexo"
                            onChange={handleSelectChange}
                            sx={commonSelectStyles}
                            MenuProps={commonMenuProps}
                        >
                            <MUI.MenuItem value="Masculino">Masculino</MUI.MenuItem>
                            <MUI.MenuItem value="Femenino">Femenino</MUI.MenuItem>
                        </MUI.Select>
                    </MUI.FormControl>
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
                        disabled={esTutor}
                        sx={commonSelectStyles}
                        MenuProps={commonMenuProps}
                      >
                        {esTutor && tallerTutor && (
                          // Solo el taller del tutor
                          talleres
                            .filter((t) => t.id_taller === tallerTutor)
                            .map((taller) => (
                              <MUI.MenuItem key={taller.id_taller} value={taller.id_taller}>
                                {taller.nombre_taller}
                              </MUI.MenuItem>
                            ))
                        )}
                        {!esTutor && talleres.map((taller) => (
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
                        sx={commonSelectStyles}
                        MenuProps={commonMenuProps}
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
                        sx={commonSelectStyles}
                        MenuProps={commonMenuProps}
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
                        sx={commonSelectStyles}
                        MenuProps={commonMenuProps}
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
                        sx={commonSelectStyles}
                        MenuProps={commonMenuProps}
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
                        sx={commonSelectStyles}
                        MenuProps={commonMenuProps}
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
                      value={formData.documento}
                      InputProps={{ readOnly: true }}
                      helperText="Se generará automáticamente del documento"
                    />
                  </MUI.Grid>
                  <MUI.Grid item xs={12} sm={6}>
                    <MUI.TextField
                      fullWidth
                      label="Contraseña"
                      name="contrasena"
                      value="Se generará automáticamente"
                      InputProps={{ readOnly: true }}
                      helperText="Se enviará por email"
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