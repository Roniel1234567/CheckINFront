import { useState, useEffect } from 'react';
import '../../styles/index.scss';
import * as MUI from "@mui/material";
import * as Icons from "@mui/icons-material";
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import api from '../../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

// Interfaces
interface Pasantia {
  id_pas: number;
  estudiante_pas: {
    documento_id_est: string;
    nombre_est: string;
  };
  centro_pas: {
    id_centro: number;
    nombre_centro: string;
  };
}

interface PasantiaDetallada {
  id_pas: number;
  estudiante_pas: any;
  centro_pas: any;
  supervisor_pas: any;
  inicio_pas: string;
  fin_pas: string;
  estado_pas: string;
  creacion_pas: string;
}

interface EvaluacionCentro {
  id_eval_centro?: number;
  EvaluacionCentroTrabajo_id_eval_centro?: number; // Formato del backend
  pasantia_eval_centro?: number | PasantiaDetallada; // Puede ser un ID o un objeto completo
  EvaluacionCentroTrabajo_pasantia_eval_centro?: number | PasantiaDetallada;
  espacio_trabajo_eval: number;
  EvaluacionCentroTrabajo_espacio_trabajo_eval?: number; // Formato del backend
  asignacion_tareas_eval: number;
  EvaluacionCentroTrabajo_asignacion_tareas_eval?: number; // Formato del backend
  disponibilidad_dudas_eval: number;
  EvaluacionCentroTrabajo_disponibilidad_dudas_eval?: number; // Formato del backend
  observaciones_eval_centro: string;
  EvaluacionCentroTrabajo_observaciones_eval_centro?: string; // Formato del backend
  fecha_eval_centro?: string;
  EvaluacionCentroTrabajo_fecha_eval_centro?: string; // Formato del backend
}

// Valores válidos para el enum dato_ra
type TipoRA = 'RA1' | 'RA2' | 'RA3' | 'RA4' | 'RA5' | 'RA6' | 'RA7';

interface EvaluacionEstudiante {
  id_eval_est?: number;
  pasantia_eval?: number;
  ra_eval?: string;
  asistencia_eval: number;
  desempeño_eval: number;
  disponibilidad_eval: number;
  responsabilidad_eval: number;
  limpieza_eval: number;
  trabajo_equipo_eval: number;
  resolucion_problemas_eval: number;
  observaciones_eval?: string;
  fecha_eval?: string;
  pasantia_eval_id?: number;
}

/**
 * Componente de Evaluaciones
 * 
 * Este componente permite gestionar las evaluaciones tanto de centros de trabajo como de estudiantes.
 * Permite crear nuevas evaluaciones y visualizar el historial de evaluaciones existentes.
 * 
 * Integrado con las APIs:
 * - /pasantias/pendientesEvaluacion: Para obtener pasantías elegibles para evaluación
 * - /evaluacionesCentro: Para gestionar evaluaciones de centros de trabajo
 * - /evaluacionesEstudiante: Para gestionar evaluaciones de estudiantes
 */
function Evaluaciones() {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState(0);
  const [showResponses, setShowResponses] = useState(false);
  const [evaluacionesCentro, setEvaluacionesCentro] = useState<EvaluacionCentro[]>([]);
  const [evaluacionesEstudiante, setEvaluacionesEstudiante] = useState<EvaluacionEstudiante[]>([]);
  const [pasantias, setPasantias] = useState<Pasantia[]>([]);
  const [selectedPasantia, setSelectedPasantia] = useState<number | null>(null);
  const [selectedRA, setSelectedRA] = useState<TipoRA>('RA1');
  const [evaluacionCentro, setEvaluacionCentro] = useState<EvaluacionCentro>({
    espacio_trabajo_eval: 0,
    asignacion_tareas_eval: 0,
    disponibilidad_dudas_eval: 0,
    observaciones_eval_centro: ''
  });
  const [evaluacionEstudiante, setEvaluacionEstudiante] = useState<EvaluacionEstudiante>({
    asistencia_eval: 0,
    desempeño_eval: 0,
    disponibilidad_eval: 0,
    responsabilidad_eval: 0,
    limpieza_eval: 0,
    trabajo_equipo_eval: 0,
    resolucion_problemas_eval: 0,
    observaciones_eval: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEvaluacionId, setEditingEvaluacionId] = useState<number | null>(null);
  const [isEditModeEstudiante, setIsEditModeEstudiante] = useState(false);
  const [editingEvaluacionEstudianteId, setEditingEvaluacionEstudianteId] = useState<number | null>(null);
  const notifications = 4;

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener evaluaciones existentes primero - Usar rutas con guiones
        const resEvalCentro = await api.get('/evaluaciones-centro');
        const resEvalEstudiante = await api.get('/evaluaciones-estudiante');
        
        console.log('DATOS COMPLETOS RECIBIDOS DEL BACKEND:', resEvalCentro.data);
        
        // Mostrar estructura completa con todos los elementos
        if (Array.isArray(resEvalCentro.data) && resEvalCentro.data.length > 0) {
          // Mostrar cada objeto completo para ver la estructura real
          resEvalCentro.data.forEach((item, index) => {
            console.log(`EVAL CENTRO #${index}:`, JSON.stringify(item, null, 2));
          });
          
          // Verificar si hay evaluación para la pasantía 5
          const existeParaPasantia5 = resEvalCentro.data.some(item => {
            if (typeof item.pasantia_eval_centro === 'object' && item.pasantia_eval_centro) {
              console.log(`Pasantía encontrada con ID: ${item.pasantia_eval_centro.id_pas}`);
              return item.pasantia_eval_centro.id_pas === 5;
            }
            return false;
          });
          
          console.log('¿Existe evaluación para pasantía 5?', existeParaPasantia5 ? 'SÍ' : 'NO');
        }
        
        // Asegurar que tenemos los datos correctos
        const evaluacionesCentroFormateadas = Array.isArray(resEvalCentro.data) 
          ? resEvalCentro.data.map(evaluacion => {
              console.log('Procesando evaluación:', evaluacion);
              
              // Mantener la estructura original pero asegurarnos de que sea un objeto válido
              return {
                id_eval_centro: evaluacion.id_eval_centro || 0,
                pasantia_eval_centro: evaluacion.pasantia_eval_centro || null,
                espacio_trabajo_eval: Number(evaluacion.espacio_trabajo_eval) || 0,
                asignacion_tareas_eval: Number(evaluacion.asignacion_tareas_eval) || 0,
                disponibilidad_dudas_eval: Number(evaluacion.disponibilidad_dudas_eval) || 0,
                observaciones_eval_centro: evaluacion.observaciones_eval_centro || '',
                fecha_eval_centro: evaluacion.fecha_eval_centro || ''
              };
            })
          : [];
          
        console.log('Evaluaciones formateadas:', evaluacionesCentroFormateadas);
        setEvaluacionesCentro(evaluacionesCentroFormateadas);
        setEvaluacionesEstudiante(resEvalEstudiante.data as EvaluacionEstudiante[]);
        
        // Obtener pasantías pendientes para evaluación
        const resPasantias = await api.get('/pasantias/pendientesEvaluacion');
        setPasantias(resPasantias.data as Pasantia[]);
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleChangePasantia = (event: MUI.SelectChangeEvent<number | string>) => {
    // Convertir explícitamente a número
    const value = event.target.value;
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
    console.log('Pasantía seleccionada - valor original:', value, 'convertido a:', numericValue);
    setSelectedPasantia(numericValue);
    
    // Solo verificar evaluaciones existentes para la pestaña de evaluación de centro
    if (activeTab === 0) {
      // Depurar el contenido de evaluacionesCentro
      console.log('Estado actual de evaluacionesCentro:', evaluacionesCentro);
      
      // Verificación con más log para diagnosticar problemas
      const evaluacionExistente = evaluacionesCentro.find(evaluacion => {
        // Comprobar si pasantia_eval_centro es un objeto con id_pas
        if (typeof evaluacion.pasantia_eval_centro === 'object' && evaluacion.pasantia_eval_centro) {
          const idPasantia = evaluacion.pasantia_eval_centro.id_pas;
          console.log(`Evaluación ID: ${evaluacion.id_eval_centro}, Pasantía ID: ${idPasantia}`);
          return idPasantia === numericValue;
        }
        
        // Si es un número directo
        if (typeof evaluacion.pasantia_eval_centro === 'number') {
          console.log(`Evaluación ID: ${evaluacion.id_eval_centro}, Pasantía ID (directo): ${evaluacion.pasantia_eval_centro}`);
          return evaluacion.pasantia_eval_centro === numericValue;
        }
        
        return false;
      });
      
      console.log('¿Se encontró evaluación existente?', evaluacionExistente ? 'SÍ' : 'NO');
      
      if (evaluacionExistente) {
        // Si existe, cargar los datos para edición
        console.log('Datos de evaluación encontrada:', evaluacionExistente);
        
        // Mostrar notificación más destacada
        toast.info('Esta pasantía ya tiene una evaluación. Los datos se han cargado para edición.', {
          position: "top-center",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            backgroundColor: '#e3f2fd',
            color: '#0d47a1',
            fontWeight: 'bold',
            borderLeft: '5px solid #1565c0'
          }
        });
        
        // Asegurar que tenemos valores válidos
        setEvaluacionCentro({
          id_eval_centro: evaluacionExistente.id_eval_centro || 0,
          espacio_trabajo_eval: Number(evaluacionExistente.espacio_trabajo_eval) || 0,
          asignacion_tareas_eval: Number(evaluacionExistente.asignacion_tareas_eval) || 0,
          disponibilidad_dudas_eval: Number(evaluacionExistente.disponibilidad_dudas_eval) || 0,
          observaciones_eval_centro: evaluacionExistente.observaciones_eval_centro || '',
          pasantia_eval_centro: numericValue // Usar el valor que sabemos es correcto
        });
        
        setIsEditMode(true);
        setEditingEvaluacionId(evaluacionExistente.id_eval_centro || 0);
      } else {
        // Reiniciar formulario para nueva evaluación
        setEvaluacionCentro({
          espacio_trabajo_eval: 0,
          asignacion_tareas_eval: 0,
          disponibilidad_dudas_eval: 0,
          observaciones_eval_centro: ''
        });
        setIsEditMode(false);
        setEditingEvaluacionId(null);
      }
    } else if (activeTab === 1) {
      verificarEvaluacionEstudianteExistente(numericValue, selectedRA);
    }
  };

  const handleChangeEvaluacionCentro = (campo: keyof EvaluacionCentro) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | MUI.SelectChangeEvent
  ) => {
    setEvaluacionCentro({
      ...evaluacionCentro,
      [campo]: event.target.value
    });
  };

  const handleChangeEvaluacionEstudiante = (campo: keyof EvaluacionEstudiante) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | MUI.SelectChangeEvent
  ) => {
    setEvaluacionEstudiante({
      ...evaluacionEstudiante,
      [campo]: event.target.value
    });
  };

  const handleSubmitCentro = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedPasantia || selectedPasantia <= 0) {
      toast.warning('Debe seleccionar una pasantía válida');
      return;
    }
    
    try {
      setLoading(true);
      
      // Crear un objeto simple y directo para evitar problemas de tipo
      const requestData = {
        espacio_trabajo_eval: evaluacionCentro.espacio_trabajo_eval,
        asignacion_tareas_eval: evaluacionCentro.asignacion_tareas_eval,
        disponibilidad_dudas_eval: evaluacionCentro.disponibilidad_dudas_eval,
        observaciones_eval_centro: evaluacionCentro.observaciones_eval_centro,
        // Enviar el ID de pasantía como un objeto con la estructura correcta
        pasantia_eval_centro: { id_pas: selectedPasantia }
      };
      
      console.log('Datos finales a enviar:', requestData);
      
      // Hacer una solicitud preliminar para verificar si ya existe una evaluación para esta pasantía
      console.log('Verificando si ya existe evaluación para pasantía:', selectedPasantia);
      
      try {
        // Intentar obtener evaluaciones específicamente para esta pasantía
        const verificacion = await api.get(`/evaluaciones-centro/porPasantia/${selectedPasantia}`);
        console.log('Resultado de la verificación:', verificacion.data);
        
        if (verificacion.data && verificacion.data.length > 0) {
          console.log('¡ATENCIÓN! Ya existe una evaluación para esta pasantía:', verificacion.data);
          
          // Preguntar al usuario si desea actualizar la evaluación existente
          const confirmarActualizacion = window.confirm(
            'Ya existe una evaluación registrada para esta pasantía. ¿Desea actualizar la evaluación existente?'
          );
          
          if (confirmarActualizacion) {
            // Obtener el ID de la evaluación existente
            const idEvaluacionExistente = verificacion.data[0].id_eval_centro || verificacion.data[0].EvaluacionCentroTrabajo_id_eval_centro;
            
            console.log(`Actualizando evaluación ID: ${idEvaluacionExistente}`);
            
            // Usar PUT para actualización
            const response = await axios({
              method: 'put',
              url: `http://localhost:5000/api/evaluaciones-centro/${idEvaluacionExistente}`,
              data: requestData,
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            toast.success('¡Evaluación de centro actualizada correctamente!', {
              position: "top-center",
              autoClose: 5000
            });
            
            // Actualizar el estado con los datos modificados
            setEvaluacionesCentro(evaluacionesCentro.map(evaluacion => 
              evaluacion.id_eval_centro === idEvaluacionExistente ? response.data : evaluacion
            ));
            
            // Resetear el formulario
            setEvaluacionCentro({
              espacio_trabajo_eval: 0,
              asignacion_tareas_eval: 0,
              disponibilidad_dudas_eval: 0,
              observaciones_eval_centro: ''
            });
            setSelectedPasantia(null);
            setIsEditMode(false);
            setEditingEvaluacionId(null);
            
            setLoading(false);
            return;
          } else {
            // El usuario no quiere actualizar, cancelar la operación
            toast.info('Operación cancelada. Por favor seleccione otra pasantía.');
            setLoading(false);
            return;
          }
        }
      } catch (verificationError) {
        console.log('Error al verificar existencia de evaluación:', verificationError);
        // Continuar con el proceso normal si la verificación falla
      }
      
      let response;
      
      // Determinar si es actualización o nuevo registro
      if (isEditMode && editingEvaluacionId) {
        console.log(`Actualizando evaluación ID: ${editingEvaluacionId}`);
        // Usar PUT para actualización
        response = await axios({
          method: 'put',
          url: `http://localhost:5000/api/evaluaciones-centro/${editingEvaluacionId}`,
          data: requestData,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        toast.success('¡Evaluación de centro actualizada correctamente!', {
          position: "top-center",
          autoClose: 5000
        });
        
        // Actualizar el estado con los datos modificados
        setEvaluacionesCentro(evaluacionesCentro.map(evaluacion => 
          evaluacion.id_eval_centro === editingEvaluacionId ? response.data : evaluacion
        ));
      } else {
        console.log('Creando nueva evaluación con la estructura corregida');
        try {
          response = await axios({
            method: 'post',
            url: 'http://localhost:5000/api/evaluaciones-centro',
            data: requestData,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          toast.success('¡Evaluación de centro registrada correctamente!', {
            position: "top-center",
            autoClose: 5000
          });
          
          // Añadir la nueva evaluación al estado
          setEvaluacionesCentro([...evaluacionesCentro, response.data]);
        } catch (postError: unknown) {
          // Manejo de error mejorado...
          console.error('Error completo del axios POST:', postError);
          
          if (axios.isAxiosError(postError) && postError.response) {
            console.error('Respuesta del servidor:', {
              status: postError.response.status,
              headers: postError.response.headers,
              data: postError.response.data
            });
            
            // Verificar si es un error de clave duplicada
            if (postError.response.data && 
                (postError.response.data.message || '').toLowerCase().includes('duplic')) {
              
              console.log('Detectado error de duplicado, intentando recuperar la evaluación existente');
              
              // Si es un error de duplicado, intentar obtener la evaluación existente
              try {
                const evaluacionesActualizadas = await api.get('/evaluaciones-centro');
                console.log('Evaluaciones después del error:', evaluacionesActualizadas.data);
                
                // Buscar la evaluación para esta pasantía
                if (Array.isArray(evaluacionesActualizadas.data)) {
                  const evaluacionExistente = evaluacionesActualizadas.data.find(e => {
                    // Buscar la evaluación correspondiente a esta pasantía
                    const idPasantia = Object.entries(e).find(([k, v]) => 
                      k.toLowerCase().includes('pasantia') && Number(v) === Number(selectedPasantia)
                    );
                    
                    return idPasantia !== undefined;
                  });
                  
                  if (evaluacionExistente) {
                    console.log('Evaluación existente encontrada:', evaluacionExistente);
                    
                    // Preguntar al usuario si desea editar en lugar de crear
                    const confirmarEdicion = window.confirm(
                      'Ya existe una evaluación para esta pasantía. ¿Desea modificar la evaluación existente?'
                    );
                    
                    if (confirmarEdicion) {
                      // Extraer el ID de la evaluación
                      const idEvaluacion = evaluacionExistente.EvaluacionCentroTrabajo_id_eval_centro || 
                                          evaluacionExistente.id_eval_centro;
                      
                      // Cargar datos para edición
                      setEvaluacionCentro({
                        ...evaluacionCentro,
                        id_eval_centro: idEvaluacion
                      });
                      setIsEditMode(true);
                      setEditingEvaluacionId(idEvaluacion);
                      
                      toast.info('Se ha cargado la evaluación existente para edición. Haga los cambios y pulse "Actualizar Evaluación".');
                      setLoading(false);
                      return;
                    }
                  }
                }
              } catch (recuperacionError) {
                console.error('Error al intentar recuperar evaluación existente:', recuperacionError);
              }
            }
          }
          
          // Re-lanzar para manejo general
          throw postError;
        }
      }
      
      // Resetear formulario
      setEvaluacionCentro({
        espacio_trabajo_eval: 0,
        asignacion_tareas_eval: 0,
        disponibilidad_dudas_eval: 0,
        observaciones_eval_centro: ''
      });
      setSelectedPasantia(null);
      setIsEditMode(false);
      setEditingEvaluacionId(null);
      
    } catch (error: unknown) {
      console.error('Error al enviar evaluación:', error);
      
      // Mensaje específico para error de clave duplicada
      if (axios.isAxiosError(error) && 
          error.response?.data?.message?.includes('duplicada')) {
        toast.error('Esta pasantía ya tiene una evaluación registrada. Por favor, seleccione otra pasantía.', {
          position: "top-center",
          autoClose: false,
          closeOnClick: true
        });
      } else {
        const errorMessage = axios.isAxiosError(error) ? error.message : 'Error desconocido';
        toast.error('Error al registrar la evaluación. ' + errorMessage, {
          position: "top-center",
          autoClose: false,
          closeOnClick: true
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const verificarEvaluacionEstudianteExistente = (idPasantia: number, raSeleccionado: TipoRA) => {
    console.log(`Verificando si existe evaluación para pasantía ${idPasantia} y RA ${raSeleccionado}`);
    
    // Buscar en las evaluaciones cargadas
    const evaluacionExistente = evaluacionesEstudiante.find(evaluacion => {
      if (typeof evaluacion.pasantia_eval === 'object' && evaluacion.pasantia_eval) {
        return evaluacion.pasantia_eval.id_pas === idPasantia && evaluacion.ra_eval === raSeleccionado;
      }
      return evaluacion.pasantia_eval === idPasantia && evaluacion.ra_eval === raSeleccionado;
    });
    
    console.log('¿Se encontró evaluación estudiante existente?', evaluacionExistente ? 'SÍ' : 'NO');
    
    if (evaluacionExistente) {
      // Cargar los datos para edición
      console.log('Datos de evaluación estudiante encontrada:', evaluacionExistente);
      
      toast.info(`Se encontró una evaluación existente para el RA ${raSeleccionado}. Los datos se han cargado para edición.`, {
        position: "top-center",
        autoClose: 7000,
        style: {
          backgroundColor: '#e3f2fd',
          color: '#0d47a1',
          fontWeight: 'bold',
          borderLeft: '5px solid #1565c0'
        }
      });
      
      // Asegurar valores válidos y cargar los datos
      setEvaluacionEstudiante({
        id_eval_est: evaluacionExistente.id_eval_est || 0,
        asistencia_eval: Number(evaluacionExistente.asistencia_eval) || 0,
        desempeño_eval: Number(evaluacionExistente.desempeño_eval) || 0,
        disponibilidad_eval: Number(evaluacionExistente.disponibilidad_eval) || 0,
        responsabilidad_eval: Number(evaluacionExistente.responsabilidad_eval) || 0,
        limpieza_eval: Number(evaluacionExistente.limpieza_eval) || 0,
        trabajo_equipo_eval: Number(evaluacionExistente.trabajo_equipo_eval) || 0,
        resolucion_problemas_eval: Number(evaluacionExistente.resolucion_problemas_eval) || 0,
        observaciones_eval: evaluacionExistente.observaciones_eval || '',
        ra_eval: evaluacionExistente.ra_eval || raSeleccionado,
        pasantia_eval: idPasantia
      });
      
      setIsEditModeEstudiante(true);
      setEditingEvaluacionEstudianteId(evaluacionExistente.id_eval_est || 0);
    } else {
      // Reiniciar formulario para nueva evaluación
      setEvaluacionEstudiante({
        asistencia_eval: 0,
        desempeño_eval: 0,
        disponibilidad_eval: 0,
        responsabilidad_eval: 0,
        limpieza_eval: 0,
        trabajo_equipo_eval: 0,
        resolucion_problemas_eval: 0,
        observaciones_eval: ''
      });
      setIsEditModeEstudiante(false);
      setEditingEvaluacionEstudianteId(null);
    }
  };

  // Manejar cambio de RA seleccionado
  const handleChangeRA = (event: MUI.SelectChangeEvent<string>) => {
    const newRA = event.target.value as TipoRA;
    setSelectedRA(newRA);
    
    // Si hay una pasantía seleccionada, verificar si existe evaluación para esta combinación
    if (selectedPasantia) {
      // Si estamos en modo edición y cambiamos el RA, debemos verificar si existe una evaluación
      // para este nuevo RA. Si no existe, cambiaremos a modo de creación para ese RA.
      verificarEvaluacionEstudianteExistente(selectedPasantia, newRA);
    }
  };

  const handleSubmitEstudiante = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedPasantia || selectedPasantia <= 0) {
      toast.warning('Debe seleccionar una pasantía válida');
      return;
    }
    
    try {
      setLoading(true);
      
      // Formato correcto para el backend: enviamos un objeto con id_pas
      const pasantiaObj = { id_pas: selectedPasantia };
      
      // Crear un objeto simple y directo
      const requestData = {
        asistencia_eval: evaluacionEstudiante.asistencia_eval,
        desempeño_eval: evaluacionEstudiante.desempeño_eval,
        disponibilidad_eval: evaluacionEstudiante.disponibilidad_eval,
        responsabilidad_eval: evaluacionEstudiante.responsabilidad_eval,
        limpieza_eval: evaluacionEstudiante.limpieza_eval,
        trabajo_equipo_eval: evaluacionEstudiante.trabajo_equipo_eval,
        resolucion_problemas_eval: evaluacionEstudiante.resolucion_problemas_eval,
        observaciones_eval: evaluacionEstudiante.observaciones_eval,
        // Usar el RA seleccionado en el menú desplegable
        ra_eval: selectedRA,
        pasantia_eval: pasantiaObj
      };
      
      console.log('Enviando evaluación estudiante:', requestData);
      
      let response;
      
      // Similar al enfoque de evaluación de centro, determinar si es edición o creación
      if (isEditModeEstudiante && editingEvaluacionEstudianteId) {
        console.log(`Actualizando evaluación estudiante ID: ${editingEvaluacionEstudianteId}`);
        
        try {
          response = await axios({
            method: 'put',
            url: `http://localhost:5000/api/evaluaciones-estudiante/${editingEvaluacionEstudianteId}`,
            data: requestData,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          toast.success('¡Evaluación de estudiante actualizada correctamente!', {
            position: "top-center",
            autoClose: 5000
          });
          
          // Actualizar el estado con los datos modificados
          setEvaluacionesEstudiante(evaluacionesEstudiante.map(evaluacion => 
            evaluacion.id_eval_est === editingEvaluacionEstudianteId ? response.data : evaluacion
          ));
        } catch (error) {
          console.error('Error al actualizar evaluación estudiante:', error);
          throw error;
        }
      } else {
        try {
          response = await axios({
            method: 'post',
            url: 'http://localhost:5000/api/evaluaciones-estudiante',
            data: requestData,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          // Mostrar mensaje de éxito
          toast.success('¡Evaluación de estudiante registrada correctamente!', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          setEvaluacionesEstudiante([...evaluacionesEstudiante, response.data]);
        } catch (axiosError) {
          console.error('Error con Axios para estudiante:', axiosError);
          if (axios.isAxiosError(axiosError) && axiosError.response) {
            console.error('Datos de respuesta del servidor:', axiosError.response.data);
          }
          throw axiosError;
        }
      }
      
      // Resetear formulario
      setEvaluacionEstudiante({
        asistencia_eval: 0,
        desempeño_eval: 0,
        disponibilidad_eval: 0,
        responsabilidad_eval: 0,
        limpieza_eval: 0,
        trabajo_equipo_eval: 0,
        resolucion_problemas_eval: 0,
        observaciones_eval: ''
      });
      setSelectedPasantia(null);
      setSelectedRA('RA1');  // Resetear el RA seleccionado
      setIsEditModeEstudiante(false);
      setEditingEvaluacionEstudianteId(null);
      
    } catch (error) {
      console.error('Error al enviar evaluación de estudiante:', error);
      toast.error('Error al registrar la evaluación del estudiante. ' + (axios.isAxiosError(error) ? error.message : 'Error desconocido'), {
        position: "top-center",
        autoClose: false,
        closeOnClick: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MUI.Box sx={{ display: 'flex', width: '100vw', minHeight: '100vh', bgcolor: MUI.alpha(theme.palette.background.paper, 0.6), p: 0 }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      <MUI.Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <DashboardAppBar notifications={notifications} toggleDrawer={toggleDrawer} />

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

        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Typography variant="h2" sx={{ 
            mb: 1, 
            fontWeight: 'bold', 
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Icons.Assessment sx={{ fontSize: '2.5rem' }} />
            Evaluaciones
          </MUI.Typography>
          <MUI.Typography variant="body1" color="text.secondary">
            Gestiona las evaluaciones de centros de trabajo y estudiantes
          </MUI.Typography>
        </MUI.Box>

        <MUI.Box sx={{ p: { xs: 2, md: 4 } }}>
          <MUI.Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }
            }}
          >
            <MUI.Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <MUI.Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }
                }}
              >
                <MUI.Tab 
                  icon={<Icons.Business />} 
                  label="Evaluación Centro" 
                  iconPosition="start"
                />
                <MUI.Tab 
                  icon={<Icons.School />} 
                  label="Evaluación Estudiante" 
                  iconPosition="start"
                />
                <MUI.Tab 
                  icon={<Icons.History />} 
                  label="Historial" 
                  iconPosition="start"
                />
              </MUI.Tabs>
            </MUI.Box>

            {activeTab === 0 && (
              <MUI.Box component="form" onSubmit={handleSubmitCentro}>
                <MUI.Grid container spacing={3}>
                  <MUI.Grid item xs={12}>
                    <MUI.Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icons.Business sx={{ color: theme.palette.primary.main }} />
                      {isEditMode ? 'Modificar Evaluación del Centro de Trabajo' : 'Nueva Evaluación del Centro de Trabajo'}
                    </MUI.Typography>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={12}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Seleccione Pasantía</MUI.InputLabel>
                      <MUI.Select
                        value={selectedPasantia === null ? '' : String(selectedPasantia)}
                        onChange={handleChangePasantia}
                        label="Seleccione Pasantía"
                        required
                        disabled={isEditMode} // Deshabilitar cambio de pasantía en modo edición
                      >
                        {pasantias.map((pasantia) => (
                          <MUI.MenuItem key={pasantia.id_pas} value={String(pasantia.id_pas)}>
                            {pasantia.centro_pas.nombre_centro} - {pasantia.estudiante_pas.nombre_est}
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                      <MUI.FormHelperText>
                        {isEditMode 
                          ? 'Editando evaluación existente para esta pasantía' 
                          : 'Seleccione la pasantía a evaluar'}
                      </MUI.FormHelperText>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Espacio de Trabajo</MUI.InputLabel>
                      <MUI.Select
                        value={evaluacionCentro.espacio_trabajo_eval}
                        onChange={handleChangeEvaluacionCentro('espacio_trabajo_eval')}
                        label="Espacio de Trabajo"
                        required
                      >
                        {[0, 20, 40, 60, 80, 100].map((value) => (
                          <MUI.MenuItem key={value} value={value}>
                            {value}%
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Asignación de Tareas</MUI.InputLabel>
                      <MUI.Select
                        value={evaluacionCentro.asignacion_tareas_eval}
                        onChange={handleChangeEvaluacionCentro('asignacion_tareas_eval')}
                        label="Asignación de Tareas"
                        required
                      >
                        {[0, 20, 40, 60, 80, 100].map((value) => (
                          <MUI.MenuItem key={value} value={value}>
                            {value}%
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Disponibilidad para Dudas</MUI.InputLabel>
                      <MUI.Select
                        value={evaluacionCentro.disponibilidad_dudas_eval}
                        onChange={handleChangeEvaluacionCentro('disponibilidad_dudas_eval')}
                        label="Disponibilidad para Dudas"
                        required
                      >
                        {[0, 20, 40, 60, 80, 100].map((value) => (
                          <MUI.MenuItem key={value} value={value}>
                            {value}%
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12}>
                    <MUI.TextField
                      label="Observaciones"
                      multiline
                      rows={4}
                      fullWidth
                      required
                      value={evaluacionCentro.observaciones_eval_centro}
                      onChange={handleChangeEvaluacionCentro('observaciones_eval_centro')}
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12}>
                    <MUI.Button
                      type="submit"
                      variant="contained"
                      color={isEditMode ? "secondary" : "primary"}
                      startIcon={isEditMode ? <Icons.Edit /> : <Icons.Send />}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      {isEditMode ? 'Actualizar Evaluación' : 'Enviar Evaluación'}
                    </MUI.Button>
                    {isEditMode && (
                      <MUI.Button
                        variant="outlined"
                        color="primary"
                        sx={{ ml: 2 }}
                        onClick={() => {
                          setIsEditMode(false);
                          setEditingEvaluacionId(null);
                          setSelectedPasantia(null);
                          setEvaluacionCentro({
                            espacio_trabajo_eval: 0,
                            asignacion_tareas_eval: 0,
                            disponibilidad_dudas_eval: 0,
                            observaciones_eval_centro: ''
                          });
                        }}
                      >
                        Cancelar Edición
                      </MUI.Button>
                    )}
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Box>
            )}

            {activeTab === 1 && (
              <MUI.Box component="form" onSubmit={handleSubmitEstudiante}>
                <MUI.Grid container spacing={3}>
                  <MUI.Grid item xs={12}>
                    <MUI.Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icons.School sx={{ color: theme.palette.primary.main }} />
                      {isEditModeEstudiante ? 'Modificar Evaluación del Estudiante' : 'Nueva Evaluación del Estudiante'}
                    </MUI.Typography>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={12}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Seleccione Pasantía</MUI.InputLabel>
                      <MUI.Select
                        value={selectedPasantia === null ? '' : String(selectedPasantia)}
                        onChange={handleChangePasantia}
                        label="Seleccione Pasantía"
                        required
                        disabled={isEditModeEstudiante} // Deshabilitar cambio de pasantía en modo edición
                      >
                        {pasantias.map((pasantia) => (
                          <MUI.MenuItem key={pasantia.id_pas} value={String(pasantia.id_pas)}>
                            {pasantia.estudiante_pas.nombre_est} - {pasantia.centro_pas.nombre_centro}
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                      <MUI.FormHelperText>
                        {isEditModeEstudiante 
                          ? 'Editando evaluación existente para esta pasantía' 
                          : 'Seleccione la pasantía a evaluar'}
                      </MUI.FormHelperText>
                    </MUI.FormControl>
                  </MUI.Grid>

                  <MUI.Grid item xs={12} md={6}>
                    <MUI.FormControl fullWidth>
                      <MUI.InputLabel>Resultado de Aprendizaje (RA)</MUI.InputLabel>
                      <MUI.Select
                        value={selectedRA}
                        onChange={handleChangeRA}
                        label="Resultado de Aprendizaje (RA)"
                        required
                      >
                        {['RA1', 'RA2', 'RA3', 'RA4', 'RA5', 'RA6', 'RA7'].map((ra) => (
                          <MUI.MenuItem key={ra} value={ra}>
                            {ra}
                          </MUI.MenuItem>
                        ))}
                      </MUI.Select>
                      <MUI.FormHelperText>
                        {isEditModeEstudiante 
                          ? 'Puede cambiar a otro RA para crear una nueva evaluación' 
                          : 'Seleccione el resultado de aprendizaje a evaluar'}
                      </MUI.FormHelperText>
                    </MUI.FormControl>
                  </MUI.Grid>

                  {[
                    { key: 'asistencia_eval', label: 'Asistencia', icon: <Icons.EventAvailable /> },
                    { key: 'desempeño_eval', label: 'Desempeño', icon: <Icons.Star /> },
                    { key: 'disponibilidad_eval', label: 'Disponibilidad', icon: <Icons.AccessTime /> },
                    { key: 'responsabilidad_eval', label: 'Responsabilidad', icon: <Icons.AssignmentTurnedIn /> },
                    { key: 'limpieza_eval', label: 'Limpieza', icon: <Icons.CleaningServices /> },
                    { key: 'trabajo_equipo_eval', label: 'Trabajo en Equipo', icon: <Icons.Group /> },
                    { key: 'resolucion_problemas_eval', label: 'Resolución de Problemas', icon: <Icons.Lightbulb /> }
                  ].map((criterio) => (
                    <MUI.Grid item xs={12} md={6} key={criterio.key}>
                      <MUI.FormControl fullWidth>
                        <MUI.InputLabel>{criterio.label}</MUI.InputLabel>
                        <MUI.Select
                          label={criterio.label}
                          value={evaluacionEstudiante[criterio.key as keyof EvaluacionEstudiante]}
                          onChange={handleChangeEvaluacionEstudiante(criterio.key as keyof EvaluacionEstudiante)}
                          required
                          startAdornment={<MUI.Box sx={{ mr: 1, color: 'text.secondary' }}>{criterio.icon}</MUI.Box>}
                        >
                          {[0, 20, 40, 60, 80, 100].map((value) => (
                            <MUI.MenuItem key={value} value={value}>
                              {value}%
                            </MUI.MenuItem>
                          ))}
                        </MUI.Select>
                      </MUI.FormControl>
                    </MUI.Grid>
                  ))}

                  <MUI.Grid item xs={12}>
                    <MUI.TextField
                      label="Observaciones"
                      multiline
                      rows={4}
                      fullWidth
                      required
                      value={evaluacionEstudiante.observaciones_eval}
                      onChange={handleChangeEvaluacionEstudiante('observaciones_eval')}
                    />
                  </MUI.Grid>

                  <MUI.Grid item xs={12}>
                    <MUI.Button
                      type="submit"
                      variant="contained"
                      color={isEditModeEstudiante ? "secondary" : "primary"}
                      startIcon={isEditModeEstudiante ? <Icons.Edit /> : <Icons.Send />}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      {isEditModeEstudiante ? 'Actualizar Evaluación' : 'Enviar Evaluación'}
                    </MUI.Button>
                    {isEditModeEstudiante && (
                      <MUI.Button
                        variant="outlined"
                        color="primary"
                        sx={{ ml: 2 }}
                        onClick={() => {
                          setIsEditModeEstudiante(false);
                          setEditingEvaluacionEstudianteId(null);
                          setSelectedPasantia(null);
                          setSelectedRA('RA1');
                          setEvaluacionEstudiante({
                            asistencia_eval: 0,
                            desempeño_eval: 0,
                            disponibilidad_eval: 0,
                            responsabilidad_eval: 0,
                            limpieza_eval: 0,
                            trabajo_equipo_eval: 0,
                            resolucion_problemas_eval: 0,
                            observaciones_eval: ''
                          });
                        }}
                      >
                        Cancelar Edición
                      </MUI.Button>
                    )}
                  </MUI.Grid>
                </MUI.Grid>
              </MUI.Box>
            )}

            {activeTab === 2 && (
              <MUI.Box>
                <MUI.Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icons.History sx={{ color: theme.palette.primary.main }} />
                  Historial de Evaluaciones
                </MUI.Typography>

                <MUI.Tabs 
                  value={showResponses ? 1 : 0} 
                  onChange={(_, newValue) => setShowResponses(newValue === 1)}
                  sx={{ mb: 3 }}
                >
                  <MUI.Tab label="Centros de Trabajo" />
                  <MUI.Tab label="Estudiantes" />
                </MUI.Tabs>

                {!showResponses ? (
                  <MUI.Grid container spacing={3}>
                    {evaluacionesCentro.length > 0 ? evaluacionesCentro.map((item) => (
                      <MUI.Grid item xs={12} key={item.id_eval_centro}>
                        <MUI.Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <MUI.Typography variant="h6">
                              Evaluación #{item.id_eval_centro}
                            </MUI.Typography>
                            <MUI.Chip
                              label={item.fecha_eval_centro ? new Date(item.fecha_eval_centro).toLocaleDateString() : 'Fecha no disponible'}
                              icon={<Icons.CalendarToday />}
                            />
                          </MUI.Box>

                          <MUI.Grid container spacing={2}>
                            <MUI.Grid item xs={12} md={4}>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Business sx={{ color: theme.palette.primary.main }} />
                                <MUI.Typography>
                                  Espacio de Trabajo: {item.espacio_trabajo_eval}%
                                </MUI.Typography>
                              </MUI.Box>
                            </MUI.Grid>
                            <MUI.Grid item xs={12} md={4}>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Assignment sx={{ color: theme.palette.primary.main }} />
                                <MUI.Typography>
                                  Asignación de Tareas: {item.asignacion_tareas_eval}%
                                </MUI.Typography>
                              </MUI.Box>
                            </MUI.Grid>
                            <MUI.Grid item xs={12} md={4}>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icons.Help sx={{ color: theme.palette.primary.main }} />
                                <MUI.Typography>
                                  Disponibilidad: {item.disponibilidad_dudas_eval}%
                                </MUI.Typography>
                              </MUI.Box>
                            </MUI.Grid>
                          </MUI.Grid>

                          <MUI.Divider sx={{ my: 2 }} />

                          <MUI.Typography variant="body2" color="text.secondary">
                            {item.observaciones_eval_centro}
                          </MUI.Typography>
                        </MUI.Paper>
                      </MUI.Grid>
                    )) : (
                      <MUI.Grid item xs={12}>
                        <MUI.Alert severity="info">
                          No hay evaluaciones de centros de trabajo registradas.
                        </MUI.Alert>
                      </MUI.Grid>
                    )}
                  </MUI.Grid>
                ) : (
                  <MUI.Grid container spacing={3}>
                    {evaluacionesEstudiante.length > 0 ? evaluacionesEstudiante.map((item) => (
                      <MUI.Grid item xs={12} key={item.id_eval_est}>
                        <MUI.Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <MUI.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <MUI.Typography variant="h6">
                              RA: {item.ra_eval || 'No disponible'}
                            </MUI.Typography>
                            <MUI.Chip
                              label={item.fecha_eval ? new Date(item.fecha_eval).toLocaleDateString() : 'Fecha no disponible'}
                              icon={<Icons.CalendarToday />}
                            />
                          </MUI.Box>

                          <MUI.Grid container spacing={2}>
                            {[
                              { label: 'Asistencia', value: item.asistencia_eval, icon: <Icons.EventAvailable /> },
                              { label: 'Desempeño', value: item.desempeño_eval, icon: <Icons.Star /> },
                              { label: 'Disponibilidad', value: item.disponibilidad_eval, icon: <Icons.AccessTime /> },
                              { label: 'Responsabilidad', value: item.responsabilidad_eval, icon: <Icons.AssignmentTurnedIn /> },
                              { label: 'Limpieza', value: item.limpieza_eval, icon: <Icons.CleaningServices /> },
                              { label: 'Trabajo en Equipo', value: item.trabajo_equipo_eval, icon: <Icons.Group /> },
                              { label: 'Resolución de Problemas', value: item.resolucion_problemas_eval, icon: <Icons.Lightbulb /> }
                            ].map((criterio, index) => (
                              <MUI.Grid item xs={12} md={6} key={index}>
                                <MUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {criterio.icon}
                                  <MUI.Typography>
                                    {criterio.label}: {criterio.value}%
                                  </MUI.Typography>
                                </MUI.Box>
                              </MUI.Grid>
                            ))}
                          </MUI.Grid>

                          <MUI.Divider sx={{ my: 2 }} />

                          <MUI.Typography variant="body2" color="text.secondary">
                            {item.observaciones_eval}
                          </MUI.Typography>
                        </MUI.Paper>
                      </MUI.Grid>
                    )) : (
                      <MUI.Grid item xs={12}>
                        <MUI.Alert severity="info">
                          No hay evaluaciones de estudiantes registradas.
                        </MUI.Alert>
                      </MUI.Grid>
                    )}
                  </MUI.Grid>
                )}
              </MUI.Box>
            )}
          </MUI.Paper>
        </MUI.Box>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Evaluaciones; 