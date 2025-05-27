import { useState, useEffect } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { alpha } from '@mui/material/styles';
import * as XLSX from 'xlsx'; // Importación para exportar a Excel

// Interfaces
interface Taller {
  id_taller: number;
  nombre_tall?: string;
  nombre_taller?: string;
  nombre?: string;
  nombreTaller?: string;
}

interface Estudiante {
  documento_id_est: string;
  nombre_est: string;
  taller_est?: {
    id_taller: number;
    nombre_taller?: string;
  };
  usuario_est?: {
    estado_usuario: string;
  };
}

interface Pasantia {
  id_pas: number;
  estudiante_pas: Estudiante;
  centro_pas: {
    id_centro: number;
    nombre_centro: string;
    taller?: Taller; // Podría tener un taller asociado
  };
  supervisor_pas: {
    id_sup: number;
    nombre_sup: string;
  };
  inicio_pas: string;
  fin_pas: string | null;
  estado_pas: string;
  es_simulada?: boolean; // Optional simulado flag
}

interface Evaluacion {
  id_eval_est: number;
  ra_eval: string; // RA1, RA2, etc.
  asistencia_eval: number;
  desempeño_eval: number;
  disponibilidad_eval: number;
  responsabilidad_eval: number;
  limpieza_eval: number;
  trabajo_equipo_eval: number;
  resolucion_problemas_eval: number;
  observaciones_eval?: string;
  pasantia_eval: {
    id_pas: number;
    estudiante_pas: Estudiante;
  };
}

interface EstudianteConEvaluaciones {
  estudiante: Estudiante;
  evaluaciones: {
    [key: string]: number | null; // RA1, RA2, etc. con sus valores
  };
  promedio: number;
  centro: string; // Centro de trabajo/empresa
  pasantia_id: number; // ID de la pasantía
  pasantia_real: boolean; // Indica si la pasantía existe realmente en el backend
}

// Datos mock para cuando la API no responde
const MOCK_TALLERES: Taller[] = [
  { id_taller: 1, nombre_tall: "Taller de Mecánica" },
  { id_taller: 2, nombre_tall: "Taller de Electricidad" },
  { id_taller: 3, nombre_tall: "Taller de Informática" },
  { id_taller: 4, nombre_tall: "Taller de Carpintería" },
  { id_taller: 5, nombre_tall: "Taller de Diseño Gráfico" },
];

// Datos mock removidos ya que no se utilizan

const Calificacion = () => {
  const theme = MUI.useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = MUI.useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [selectedTaller, setSelectedTaller] = useState<number | ''>('');
  const [estudiantesData, setEstudiantesData] = useState<EstudianteConEvaluaciones[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [editCell, setEditCell] = useState<{
    estudiante: string;
    ra: string;
    valor: number;
  } | null>(null);
  const [evaluacionesOriginales, setEvaluacionesOriginales] = useState<Evaluacion[]>([]);
  const [mostrarLeyenda, setMostrarLeyenda] = useState(true);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const notifications = 4;
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);

  // Obtener lista de talleres al cargar el componente
  useEffect(() => {
    const cargarTalleres = async () => {
      try {
        const res = await api.get('/talleres');
        console.log('Datos de talleres recibidos:', res.data);
        setTalleres(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error al cargar talleres:', err);
        toast.info('Usando datos de demostración debido a un problema de conexión con el servidor');
        // Usar datos mock si la API falla
        setTalleres(MOCK_TALLERES);
      }
      setLoading(false);
    };
    
    cargarTalleres();
  }, []);

  // Cuando se selecciona un taller, cargar los estudiantes y sus evaluaciones
  useEffect(() => {
    const cargarEstudiantesYEvaluaciones = async () => {
      try {
        setLoading(true);
        console.log('Iniciando carga de estudiantes y evaluaciones');
        const resEstudiantes = await api.get('/estudiantes');
        const estudiantes = resEstudiantes.data as Estudiante[];
        console.log('Estudiantes cargados:', estudiantes.length);
        const todasLasEvaluaciones: Evaluacion[] = [];
        const estudiantesConEvaluaciones: EstudianteConEvaluaciones[] = [];

        // Filtrar estudiantes eliminados y por taller seleccionado
        const estudiantesActivos = estudiantes.filter(estudiante => 
          estudiante.usuario_est?.estado_usuario !== 'Eliminado' && 
          estudiante.taller_est?.id_taller === selectedTaller
        );

        console.log('Estudiantes filtrados por taller:', estudiantesActivos.length);

        // Procesar cada estudiante
        for (const estudiante of estudiantesActivos) {
          try {
            console.log(`Procesando estudiante: ${estudiante.nombre_est}`);
            // 1. Obtener la pasantía activa del estudiante
            const resPasantia = await api.get(`/pasantias/estudiante/${estudiante.documento_id_est}`);
            const pasantia = resPasantia.data as Pasantia;
            console.log(`Pasantía encontrada para ${estudiante.nombre_est}:`, pasantia ? `ID: ${pasantia.id_pas}` : 'No tiene pasantía');

            if (pasantia) {
              // 2. Obtener las evaluaciones de la pasantía
              let evaluacionesEstudiante: Evaluacion[] = [];
              try {
                console.log(`Obteniendo evaluaciones para pasantía ${pasantia.id_pas}`);
                const resEvaluaciones = await api.get(`/evaluaciones-estudiante/porPasantia/${pasantia.id_pas}`);
                evaluacionesEstudiante = resEvaluaciones.data as Evaluacion[];
                console.log(`Evaluaciones encontradas: ${evaluacionesEstudiante.length}`);
              } catch (err) {
                console.error(`Error al obtener evaluaciones para ${estudiante.nombre_est}:`, err);
              }

              // 3. Procesar las evaluaciones
              const evaluacionesPorRA: { [key: string]: number | null } = {
                'RA1': null, 'RA2': null, 'RA3': null,
                'RA4': null, 'RA5': null, 'RA6': null, 'RA7': null
              };

              let sumaTotal = 0;
              let contadorNotas = 0;

              evaluacionesEstudiante.forEach(evaluacion => {
                console.log(`Procesando evaluación RA${evaluacion.ra_eval} para estudiante ${estudiante.nombre_est}`);
                const promedio = (
                  evaluacion.asistencia_eval +
                  evaluacion.desempeño_eval +
                  evaluacion.disponibilidad_eval +
                  evaluacion.responsabilidad_eval +
                  evaluacion.limpieza_eval +
                  evaluacion.trabajo_equipo_eval +
                  evaluacion.resolucion_problemas_eval
                ) / 7;

                evaluacionesPorRA[evaluacion.ra_eval] = Math.round(promedio);
                sumaTotal += promedio;
                contadorNotas++;
                todasLasEvaluaciones.push(evaluacion);
                console.log(`RA${evaluacion.ra_eval} procesado. Promedio: ${Math.round(promedio)}`);
              });

              const promedioFinal = contadorNotas > 0 ? Math.round(sumaTotal / contadorNotas) : 0;
              console.log(`Promedio final para ${estudiante.nombre_est}: ${promedioFinal}`);

              estudiantesConEvaluaciones.push({
                estudiante,
                evaluaciones: evaluacionesPorRA,
                promedio: promedioFinal,
                centro: pasantia.centro_pas.nombre_centro,
                pasantia_id: pasantia.id_pas,
                pasantia_real: true
              });
            } else {
              // Si no tiene pasantía, agregar estudiante con valores por defecto
              estudiantesConEvaluaciones.push({
                estudiante,
                evaluaciones: {
                  'RA1': null, 'RA2': null, 'RA3': null,
                  'RA4': null, 'RA5': null, 'RA6': null, 'RA7': null
                },
                promedio: 0,
                centro: 'Sin asignar',
                pasantia_id: 0,
                pasantia_real: false
              });
            }
          } catch (error) {
            console.error('Error al obtener la pasantía:', error);
            // Si hay error al obtener la pasantía, agregar estudiante con valores por defecto
            estudiantesConEvaluaciones.push({
              estudiante,
              evaluaciones: {
                'RA1': null, 'RA2': null, 'RA3': null,
                'RA4': null, 'RA5': null, 'RA6': null, 'RA7': null
              },
              promedio: 0,
              centro: 'Sin asignar',
              pasantia_id: 0,
              pasantia_real: false
            });
          }
        }

        setEstudiantesData(estudiantesConEvaluaciones);
        setEvaluacionesOriginales(todasLasEvaluaciones);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar estudiantes y evaluaciones:', error);
        setLoading(false);
      }
    };

    if (selectedTaller) {
      cargarEstudiantesYEvaluaciones();
    }
  }, [selectedTaller]);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleTallerChange = (event: MUI.SelectChangeEvent<number | string>) => {
    setSelectedTaller(event.target.value as number);
    setLoadingAnimation(true);
    setTimeout(() => setLoadingAnimation(false), 800);
  };
  
  const handleCellClick = (estudiante: string, ra: string, valorActual: number | null) => {
    setEditCell({
      estudiante,
      ra,
      valor: valorActual || 0
    });
  };
  
  const handleCellChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editCell) return;
    
    const newValue = parseInt(event.target.value);
    if (isNaN(newValue) || newValue < 0 || newValue > 100) return;
    
    setEditCell({
      ...editCell,
      valor: newValue
    });
  };
  
  const handleCellBlur = async () => {
    if (!editCell) return;
    
    // Encontrar el estudiante en nuestros datos
    const estudianteIndex = estudiantesData.findIndex(
      e => e.estudiante.documento_id_est === editCell.estudiante
    );
    
    if (estudianteIndex === -1) {
      setEditCell(null);
      return;
    }
    
    // Crear copia de los datos actuales
    const nuevosDatos = [...estudiantesData];
    
    // Actualizar el valor de la evaluación
    nuevosDatos[estudianteIndex].evaluaciones[editCell.ra] = editCell.valor;
    
    // Recalcular promedio
    const evaluaciones = nuevosDatos[estudianteIndex].evaluaciones;
    const raConValor = Object.values(evaluaciones).filter(v => v !== null) as number[];
    const promedio = raConValor.length > 0 
      ? Math.round(raConValor.reduce((sum, val) => sum + val, 0) / raConValor.length) 
      : 0;
    
    nuevosDatos[estudianteIndex].promedio = promedio;
    
    // Actualizar estado
    setEstudiantesData(nuevosDatos);
    
    // Verificar si es una pasantía simulada o no existente
    const estudianteData = nuevosDatos[estudianteIndex];
    const esPasantiaValida = estudianteData.pasantia_real && estudianteData.pasantia_id > 0;
    
    // Si no es una pasantía válida, solo actualizamos la UI y mostramos un mensaje
    if (!esPasantiaValida) {
      toast.info(`Calificación actualizada localmente. Para guardar permanentemente, asigne una pasantía válida al estudiante.`);
      setEditCell(null);
      return;
    }
    
    // Si no es simulada, procedemos con la actualización en el backend
    try {
      setSaving(true);
      
      // Buscar la evaluación original correspondiente a este estudiante y RA
      const evaluacionExistente = evaluacionesOriginales.find(
        evaluacion => 
          evaluacion.pasantia_eval.estudiante_pas.documento_id_est === editCell.estudiante && 
          evaluacion.ra_eval === editCell.ra
      );
      
      if (evaluacionExistente) {
        try {
          // Actualizar evaluación existente
          const valorActualizado = {
            asistencia_eval: editCell.valor,
            desempeño_eval: editCell.valor,
            disponibilidad_eval: editCell.valor,
            responsabilidad_eval: editCell.valor,
            limpieza_eval: editCell.valor,
            trabajo_equipo_eval: editCell.valor,
            resolucion_problemas_eval: editCell.valor,
          };
          
          console.log(`Actualizando evaluación ${evaluacionExistente.id_eval_est} para RA: ${editCell.ra}, valor: ${editCell.valor}`);
          await api.put(`/evaluaciones-estudiante/${evaluacionExistente.id_eval_est}`, valorActualizado);
          
          // --- INICIO BLOQUE NUEVO ---
          let calificacionExistente = null;
          try {
            const resCalificaciones = await api.get(`/calificaciones-estudiante/porEvaluacion/${evaluacionExistente.id_eval_est}`);
            if (Array.isArray(resCalificaciones.data) && resCalificaciones.data.length > 0) {
              calificacionExistente = resCalificaciones.data[0];
            }
          } catch { /* ignorado */ } // catch vacío para evitar linter
          if (calificacionExistente) {
            await api.put(`/calificaciones-estudiante/${calificacionExistente.id_calificacion}`, { promedio: estudianteData.promedio });
          } else {
            await api.post('/calificaciones-estudiante', { promedio: estudianteData.promedio, evaluacion_estudiante: { id_eval_est: evaluacionExistente.id_eval_est } });
          }
          // --- FIN BLOQUE NUEVO ---
          
          // Calificación actualizada con éxito (solo actualizamos la evaluación)
          console.log(`Evaluación ${evaluacionExistente.id_eval_est} actualizada correctamente`);
          toast.success('Calificación actualizada correctamente');
          
          // Nota: Se ha omitido la actualización/creación en la tabla calificaciones
          // porque los endpoints necesarios no existen en el backend.
          // Solo estamos trabajando con la tabla evaluaciones_estudiante.
        } catch (err) {
          console.error('Error al actualizar evaluación:', err);
          toast.error('Error al actualizar la evaluación');
        }
      } else {
        // Esto es un caso más complejo, necesitaríamos crear una nueva evaluación,
        // pero necesitaríamos la información de la pasantía del estudiante
        toast.warning('No se pudo actualizar. La evaluación no existe en el sistema.');
      }
    } catch (err) {
      console.error('Error al guardar calificación:', err);
      toast.error('Error al guardar la calificación');
    } finally {
      setSaving(false);
      setEditCell(null);
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCellBlur();
    } else if (event.key === 'Escape') {
      setEditCell(null);
    }
  };

  // Función para exportar a Excel
  const exportarAExcel = () => {
    try {
      setSaving(true);
      // Preparar los datos para Excel
      const datosExcel = estudiantesData.map(row => {
        return {
          'Documento': row.estudiante.documento_id_est,
          'Estudiante': row.estudiante.nombre_est,
          'Centro': row.centro || 'No asignado',
          'Pasantía ID': `#${row.pasantia_id}`,
          'RA1': row.evaluaciones.RA1 || '-',
          'RA2': row.evaluaciones.RA2 || '-',
          'RA3': row.evaluaciones.RA3 || '-',
          'RA4': row.evaluaciones.RA4 || '-',
          'RA5': row.evaluaciones.RA5 || '-',
          'RA6': row.evaluaciones.RA6 || '-',
          'RA7': row.evaluaciones.RA7 || '-',
          'Promedio': row.promedio,
          'Estado': row.promedio >= 70 ? 'Aprobado' : 'Reprobado'
        };
      });
      
      // Crear libro de Excel
      const libro = XLSX.utils.book_new();
      const hoja = XLSX.utils.json_to_sheet(datosExcel);
      
      // Añadir hoja al libro
      XLSX.utils.book_append_sheet(libro, hoja, "Calificaciones");
      
      // Guardar el archivo
      const nombreTaller = talleres.find(t => t.id_taller === selectedTaller)?.nombre_taller || 
                          talleres.find(t => t.id_taller === selectedTaller)?.nombre_tall || 
                          talleres.find(t => t.id_taller === selectedTaller)?.nombre || 
                          talleres.find(t => t.id_taller === selectedTaller)?.nombreTaller || 
                          "Taller";
      const fechaActual = new Date().toISOString().split('T')[0];
      XLSX.writeFile(libro, `Calificaciones_${nombreTaller}_${fechaActual}.xlsx`);
      
      toast.success('Archivo Excel generado correctamente');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      toast.error('Error al generar el archivo Excel');
    } finally {
      setSaving(false);
    }
  };
  
  // Función para guardar todas las calificaciones
  const guardarTodasLasCalificaciones = async () => {
    let errores = 0;
    let actualizaciones = 0;
    let creaciones = 0;
    let pasantiasNoEncontradas = 0;
    
    try {
      setSaving(true);
      
      // Para cada estudiante con evaluaciones
      for (const estudianteData of estudiantesData) {
        const estudiante = estudianteData.estudiante;
        const pasantiaId = estudianteData.pasantia_id;
        
        // Verificar si hay alguna evaluación existente para este estudiante
        const evaluacionesEstudiante = evaluacionesOriginales.filter(
          evaluacion => evaluacion.pasantia_eval.estudiante_pas.documento_id_est === estudiante.documento_id_est
        );
        
        console.log(`Estudiante ${estudiante.nombre_est} (${estudiante.documento_id_est}): Encontradas ${evaluacionesEstudiante.length} evaluaciones existentes`);
        
        // Para cada RA con valor
        for (const [ra, valor] of Object.entries(estudianteData.evaluaciones)) {
          if (valor === null) continue; // Si no tiene valor, seguimos con el siguiente
          
          // Buscar si ya existe una evaluación para este RA y estudiante
          const evaluacionExistente = evaluacionesEstudiante.find(
            evaluacion => evaluacion.ra_eval === ra
          );
          
          if (evaluacionExistente) {
            try {
              // Actualizar evaluación existente
              const valorActualizado = {
                asistencia_eval: valor,
                desempeño_eval: valor,
                disponibilidad_eval: valor,
                responsabilidad_eval: valor,
                limpieza_eval: valor,
                trabajo_equipo_eval: valor,
                resolucion_problemas_eval: valor
              };
              
              console.log(`Actualizando evaluación ${evaluacionExistente.id_eval_est} para estudiante ${estudiante.nombre_est}, RA: ${ra}, valor: ${valor}`);
              await api.put(`/evaluaciones-estudiante/${evaluacionExistente.id_eval_est}`, valorActualizado);
              actualizaciones++;
              
              // --- INICIO BLOQUE NUEVO ---
              let calificacionExistente = null;
              try {
                const resCalificaciones = await api.get(`/calificaciones-estudiante/porEvaluacion/${evaluacionExistente.id_eval_est}`);
                if (Array.isArray(resCalificaciones.data) && resCalificaciones.data.length > 0) {
                  calificacionExistente = resCalificaciones.data[0];
                }
              } catch { /* ignorado */ }
              if (calificacionExistente) {
                await api.put(`/calificaciones-estudiante/${calificacionExistente.id_calificacion}`, { promedio: estudianteData.promedio });
              } else {
                await api.post('/calificaciones-estudiante', { promedio: estudianteData.promedio, evaluacion_estudiante: { id_eval_est: evaluacionExistente.id_eval_est } });
              }
              // --- FIN BLOQUE NUEVO ---
              
              // Las evaluaciones se actualizaron correctamente
              console.log(`Evaluación ${evaluacionExistente.id_eval_est} actualizada correctamente`);
              actualizaciones++;
              
              // Nota: Se ha omitido la actualización/creación en la tabla calificaciones
              // porque los endpoints necesarios no existen en el backend.
            } catch (err) {
              console.error(`Error al actualizar evaluación ${evaluacionExistente.id_eval_est}:`, err);
              errores++;
            }
          } else {
            // IMPORTANTE: Si no existe la evaluación y tenemos el ID de pasantía,
            // verificamos primero que la pasantía realmente exista en el backend
            if (pasantiaId && pasantiaId > 0) { // Verificamos cualquier ID de pasantía positivo, incluso si no se marcó como "real"
              try {
                // Verificar que la pasantía existe consultando primero
                console.log(`Verificando si existe la pasantía con ID ${pasantiaId} antes de crear evaluación`);
                const resPasantia = await api.get(`/pasantias/${pasantiaId}`).catch(() => {
                  console.warn(`La pasantía con ID ${pasantiaId} no existe en el sistema o no se puede acceder`);
                  pasantiasNoEncontradas++; // Incrementamos el contador
                  return { data: null };
                });
                
                // Solo creamos la evaluación si la pasantía existe
                if (resPasantia.data) {
                  const nuevaEvaluacion = {
                    pasantia_eval: { id_pas: pasantiaId },
                    ra_eval: ra,
                    asistencia_eval: valor,
                    desempeño_eval: valor,
                    disponibilidad_eval: valor,
                    responsabilidad_eval: valor,
                    limpieza_eval: valor,
                    trabajo_equipo_eval: valor,
                    resolucion_problemas_eval: valor
                  };
                  
                  console.log(`Creando nueva evaluación para estudiante ${estudiante.nombre_est}, RA: ${ra}, valor: ${valor}, pasantía: ${pasantiaId}`);
                  try {
                    const resNuevaEval = await api.post('/evaluaciones-estudiante', nuevaEvaluacion);
                    creaciones++;
                    // La evaluación se ha creado correctamente
                    if (resNuevaEval.data && typeof resNuevaEval.data === 'object' && 'id_eval_est' in resNuevaEval.data) {
                      console.log(`Evaluación creada con éxito: ${resNuevaEval.data.id_eval_est}`);
                      // --- INICIO BLOQUE NUEVO ---
                      let calificacionExistente = null;
                      try {
                        const resCalificaciones = await api.get(`/calificaciones-estudiante/porEvaluacion/${resNuevaEval.data.id_eval_est}`);
                        if (Array.isArray(resCalificaciones.data) && resCalificaciones.data.length > 0) {
                          calificacionExistente = resCalificaciones.data[0];
                        }
                      } catch { /* ignorado */ }
                      if (calificacionExistente) {
                        await api.put(`/calificaciones-estudiante/${calificacionExistente.id_calificacion}`, { promedio: estudianteData.promedio });
                      } else {
                        await api.post('/calificaciones-estudiante', { promedio: estudianteData.promedio, evaluacion_estudiante: { id_eval_est: resNuevaEval.data.id_eval_est } });
                      }
                      // --- FIN BLOQUE NUEVO ---
                    } else {
                      console.log('Evaluación creada, pero no se pudo obtener el id_eval_est. Respuesta:', resNuevaEval.data);
                    }
                  } catch (error) {
                    console.error('Respuesta de API inválida al crear evaluación:', error);
                    errores++;
                  }
                } else {
                  console.warn(`Omitiendo creación de evaluación para estudiante ${estudiante.documento_id_est}, RA: ${ra} - La pasantía ${pasantiaId} no existe`);
                  toast.warning(`No se pudo crear evaluación para ${estudiante.nombre_est} (RA: ${ra}): Pasantía no válida`);
                  errores++;
                }
              } catch (err) {
                console.error(`Error al crear evaluación para estudiante ${estudiante.documento_id_est}:`, err);
                errores++;
              }
            } else {
              // Para pasantías ficticias o sin ID, mostramos un mensaje más claro
              const razon = !pasantiaId ? "No hay ID de pasantía" : 
                           pasantiaId <= 0 ? "Pasantía generada localmente" : 
                           "Pasantía no confirmada";
              console.warn(`No se puede crear evaluación para ${estudiante.nombre_est}, RA: ${ra}: ${razon}`);
              toast.warning(`No se puede registrar evaluación para ${estudiante.nombre_est}: El estudiante no tiene una pasantía válida en el sistema`);
              pasantiasNoEncontradas++; // También incrementamos aquí si no hay ID
              errores++;
            }
          }
        }
      }
      
      // Personalizar mensajes según el resultado
      if (errores > 0) {
        if (actualizaciones > 0 || creaciones > 0) {
          // Mensaje más descriptivo mencionando pasantías no encontradas
          const mensajePasantias = pasantiasNoEncontradas > 0 
            ? `, ${pasantiasNoEncontradas} pasantías no encontradas` 
            : '';
          toast.warning(`Se guardaron algunas calificaciones (${actualizaciones} actualizaciones, ${creaciones} nuevos registros), pero ocurrieron ${errores} errores${mensajePasantias}. Revise la consola para más detalles.`);
        } else {
          const mensajePasantias = pasantiasNoEncontradas > 0 
            ? ` (incluye ${pasantiasNoEncontradas} pasantías no encontradas)` 
            : '';
          toast.error(`Error al guardar las calificaciones. Ocurrieron ${errores} errores${mensajePasantias}.`);
        }
      } else {
        toast.success(`Calificaciones guardadas correctamente: ${actualizaciones} actualizaciones, ${creaciones} nuevos registros`);
      }
      
      // Actualizar las evaluaciones originales
      try {
        console.log('Actualizando evaluaciones originales...');
        const resPasantias = await api.get('/pasantias');
        let pasantias = Array.isArray(resPasantias.data) ? resPasantias.data : [];
        pasantias = pasantias.filter(pasantia => {
          return pasantia.estudiante_pas && 
                 pasantia.estudiante_pas.taller_est === selectedTaller;
        });
        
        const nuevasEvaluaciones: Evaluacion[] = [];
        
        for (const pasantia of pasantias) {
          const estudiante = pasantia.estudiante_pas;
          
          if (!estudiante || !estudiante.documento_id_est) continue;
          
          const resEvaluaciones = await api.get(`/evaluaciones-estudiante/porEstudiante/${estudiante.documento_id_est}`);
          const evaluacionesEstudiante = Array.isArray(resEvaluaciones.data) ? resEvaluaciones.data : [];
          
          nuevasEvaluaciones.push(...evaluacionesEstudiante);
        }
        
        console.log(`Actualizadas ${nuevasEvaluaciones.length} evaluaciones en el estado.`);
        setEvaluacionesOriginales(nuevasEvaluaciones);
      } catch (err) {
        console.error('Error al actualizar las evaluaciones originales:', err);
        toast.warning('No se pudo actualizar la lista de evaluaciones en memoria.');
      }
      
    } catch (error) {
      console.error('Error al guardar todas las calificaciones:', error);
      toast.error('Se produjo un error al guardar las calificaciones');
    } finally {
      setSaving(false);
    }
  };
  
  // Función para calcular estadísticas
  const calcularEstadisticas = () => {
    // Total de estudiantes
    const totalEstudiantes = estudiantesData.length;
    
    // Estudiantes aprobados y reprobados
    const aprobados = estudiantesData.filter(e => e.promedio >= 70).length;
    const reprobados = totalEstudiantes - aprobados;
    
    // Porcentajes
    const porcentajeAprobados = totalEstudiantes > 0 ? Math.round((aprobados / totalEstudiantes) * 100) : 0;
    const porcentajeReprobados = 100 - porcentajeAprobados;
    
    // Promedio general
    const sumaPromedios = estudiantesData.reduce((sum, e) => sum + e.promedio, 0);
    const promedioGeneral = totalEstudiantes > 0 ? Math.round(sumaPromedios / totalEstudiantes) : 0;
    
    // Mejor y peor calificación
    const calificaciones = estudiantesData.map(e => e.promedio);
    const mejorCalificacion = calificaciones.length > 0 ? Math.max(...calificaciones) : 0;
    const peorCalificacion = calificaciones.length > 0 ? Math.min(...calificaciones) : 0;
    
    // Estadísticas por RA
    const raStats: {[key: string]: {promedio: number, aprobados: number, pendientes: number}} = {};
    
    ['RA1', 'RA2', 'RA3', 'RA4', 'RA5', 'RA6', 'RA7'].forEach(ra => {
      const valoresRa = estudiantesData
        .map(e => e.evaluaciones[ra])
        .filter(v => v !== null) as number[];
      
      const sumaRa = valoresRa.reduce((sum, v) => sum + v, 0);
      const promedioRa = valoresRa.length > 0 ? Math.round(sumaRa / valoresRa.length) : 0;
      const aprobadosRa = valoresRa.filter(v => v >= 70).length;
      const pendientesRa = totalEstudiantes - valoresRa.length;
      
      raStats[ra] = {
        promedio: promedioRa,
        aprobados: aprobadosRa,
        pendientes: pendientesRa
      };
    });
    
    return {
      totalEstudiantes,
      aprobados,
      reprobados,
      porcentajeAprobados,
      porcentajeReprobados,
      promedioGeneral,
      mejorCalificacion,
      peorCalificacion,
      raStats
    };
  };

  // Colores y estilos personalizados
  const gradientBackground = `linear-gradient(120deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.8)})`;
  const boxShadowCard = '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08)';
  const accentGradient = `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`;
  
  // Animación para la carga de datos
  const fadeInAnimation = {
    animation: 'fadeIn 0.5s ease-in-out',
    '@keyframes fadeIn': {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    }
  };

  return (
    <MUI.Box 
      sx={{ 
        display: 'flex', 
        background: 'url(https://www.transparenttextures.com/patterns/cubes.png), #f5f5f5',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <SideBar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
      
      <MUI.Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          maxWidth: 1200,
          mx: 'auto',
          minHeight: '100vh',
          overflowX: 'hidden',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <DashboardAppBar notifications={notifications} toggleDrawer={toggleDrawer} />
        
        <MUI.Box 
          sx={{ 
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 1, sm: 2 },
            pt: { xs: 2, md: 3 },
            pb: { xs: 4, md: 5 },
          }}
        >
          <MUI.Paper 
            elevation={6} 
            sx={{ 
              p: 0, 
              mb: 4, 
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: boxShadowCard,
              backgroundImage: 'url(https://www.transparenttextures.com/patterns/subtle-white-feathers.png)',
              width: '100%',
              maxWidth: 1200,
              mx: 'auto',
            }}
          >
            {/* Header con gradiente - Extenderlo a todo el ancho */}
            <MUI.Box
              sx={{
                p: 3,
                background: gradientBackground,
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isSmallScreen ? 'flex-start' : 'center',
                gap: 2,
                color: 'white',
                borderBottom: '4px solid',
                borderImage: accentGradient + ' 1',
                width: '100%',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
              }}
            >
              <MUI.Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Icons.SchoolOutlined sx={{ fontSize: 42, mr: 2 }} />
                <MUI.Box>
                  <MUI.Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '2.2rem', md: '2.8rem' } }}>
                    Calificaciones
                  </MUI.Typography>
                  <MUI.Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                    <Icons.AssessmentOutlined sx={{ mr: 1, fontSize: 24 }} /> 
                    Sistema de Evaluación de Aprendices
                  </MUI.Typography>
                </MUI.Box>
              </MUI.Box>
              
              <MUI.Box>
                <MUI.Chip
                  icon={<Icons.AccessTimeOutlined sx={{ fontSize: 28 }} />}
                  label="Último actualizado: Hoy"
                  sx={{ 
                    color: 'white', 
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.25) }
                  }}
                />
              </MUI.Box>
            </MUI.Box>

            {/* Contenedor principal - Extender a todo el ancho */}
            <MUI.Box sx={{ 
              p: { xs: 2, md: 2 },
              width: '100%',
              maxWidth: 1200,
              mx: 'auto',
            }}>
              {/* Selector de taller - Extender a todo el ancho */}
              <MUI.Box 
                sx={{ 
                  mb: 4, 
                  borderRadius: 2,
                  p: { xs: 2, md: 2 },
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  width: '100%'
                }}
              >
                <MUI.Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.palette.text.primary,
                    fontSize: { xs: '1.3rem', md: '1.6rem' }
                  }}
                >
                  <Icons.Construction sx={{ mr: 1, fontSize: 32 }} /> 
                  Seleccionar Taller para Evaluación
                </MUI.Typography>

                <MUI.Grid container spacing={2}>
                  {talleres.length === 0 ? (
                    <MUI.Grid item xs={12}>
                      <MUI.Skeleton 
                        variant="rectangular" 
                        height={60} 
                        animation="wave" 
                        sx={{ borderRadius: 2 }}
                      />
                    </MUI.Grid>
                  ) : (
                    <MUI.Grid item xs={12}>
                      <MUI.FormControl 
                        fullWidth 
                        variant="outlined" 
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'white',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                          }
                        }}
                      >
                        <MUI.InputLabel id="taller-select-label" sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                          <Icons.ViewModule fontSize="large" sx={{ mr: 0.5, verticalAlign: 'middle' }} /> 
                          Seleccionar Taller
                        </MUI.InputLabel>
                        <MUI.Select
                          labelId="taller-select-label"
                          id="taller-select"
                          value={selectedTaller}
                          label={<>
                            <Icons.ViewModule fontSize="large" sx={{ mr: 0.5, verticalAlign: 'middle' }} /> 
                            Seleccionar Taller
                          </>}
                          onChange={handleTallerChange}
                          startAdornment={
                            <MUI.InputAdornment position="start">
                              <Icons.Construction sx={{ color: theme.palette.primary.main }}/>
                            </MUI.InputAdornment>
                          }
                          sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' }, minHeight: 56 }}
                        >
                          <MUI.MenuItem value="" sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' }, minHeight: 48 }}>
                            <em>Seleccione un taller</em>
                          </MUI.MenuItem>
                          {talleres.map((taller) => (
                            <MUI.MenuItem key={taller.id_taller} value={taller.id_taller} sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' }, minHeight: 48 }}>
                              <MUI.Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Icons.HomeRepairService sx={{ mr: 1.5, color: theme.palette.primary.main, fontSize: 28 }} />
                                {taller.nombre_taller || taller.nombre_tall || taller.nombre || taller.nombreTaller || `Taller #${taller.id_taller}`}
                              </MUI.Box>
                            </MUI.MenuItem>
                          ))}
                        </MUI.Select>
                      </MUI.FormControl>
                    </MUI.Grid>
                  )}
                </MUI.Grid>
              </MUI.Box>
            
              {loading ? (
                <MUI.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 5 }}>
                  <MUI.CircularProgress size={60} thickness={4} />
                  <MUI.Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium' }}>
                    Cargando información de estudiantes...
                  </MUI.Typography>
                </MUI.Box>
              ) : loadingAnimation ? (
                <MUI.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 5 }}>
                  <MUI.CircularProgress size={60} thickness={4} />
                  <MUI.Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium' }}>
                    Cargando información de estudiantes...
                  </MUI.Typography>
                </MUI.Box>
              ) : selectedTaller && estudiantesData.length > 0 ? (
                <MUI.Box sx={{ ...fadeInAnimation, width: '100%' }}>
                  {/* Información del taller - Extender a todo el ancho */}
                  <MUI.Box 
                    sx={{ 
                      mb: 3, 
                      p: 2,
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2,
                      bgcolor: alpha(theme.palette.info.light, 0.1),
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      width: '100%'
                    }}
                  >
                    <MUI.Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Icons.PeopleAlt sx={{ fontSize: 28, mr: 1.5, color: theme.palette.info.main }} />
                      <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {talleres.find(t => t.id_taller === selectedTaller)?.nombre_taller || 
                         talleres.find(t => t.id_taller === selectedTaller)?.nombre_tall || 
                         talleres.find(t => t.id_taller === selectedTaller)?.nombre || 
                         talleres.find(t => t.id_taller === selectedTaller)?.nombreTaller || 
                         `Taller #${selectedTaller}`}
                        <MUI.Chip 
                          size="small" 
                          label={`${estudiantesData.length} estudiantes`} 
                          sx={{ ml: 1.5, fontWeight: 'medium' }}
                          color="primary"
                        />
                      </MUI.Typography>
                    </MUI.Box>
                    
                    <MUI.Box sx={{ display: 'flex', gap: 2 }}>
                      <MUI.Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Icons.ShowChart />}
                        size={isSmallScreen ? 'small' : 'medium'}
                        onClick={() => setMostrarEstadisticas(true)}
                      >
                        Ver Estadísticas
                      </MUI.Button>
                      <MUI.Button
                        variant="contained"
                        color="success"
                        startIcon={<Icons.TableChart />}
                        size={isSmallScreen ? 'small' : 'medium'}
                        onClick={exportarAExcel}
                        sx={{ boxShadow: 2 }}
                      >
                        Exportar a Excel
                      </MUI.Button>
                    </MUI.Box>
                  </MUI.Box>
                  
                  <MUI.Box 
                    sx={{
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 2,
                      mt: 3,
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: 2
                    }}
                  >
                    <MUI.Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <Icons.AssignmentOutlined sx={{ mr: 1 }} />
                      Resultados de Aprendizaje (RA) por Estudiante
                    </MUI.Typography>
                    
                    <MUI.Box>
                      <MUI.Button 
                        size="small" 
                        variant="text" 
                        color="primary" 
                        startIcon={mostrarLeyenda ? <Icons.VisibilityOff /> : <Icons.Visibility />}
                        onClick={() => setMostrarLeyenda(!mostrarLeyenda)}
                      >
                        {mostrarLeyenda ? 'Ocultar leyenda' : 'Mostrar leyenda'}
                      </MUI.Button>
                    </MUI.Box>
                  </MUI.Box>
                  
                  {/* Leyenda */}
                  {mostrarLeyenda && (
                    <MUI.Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mb: 3, 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: 3,
                        justifyContent: { xs: 'center', sm: 'space-between' },
                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                        borderRadius: 2,
                        width: '100%'
                      }}
                    >
                      <MUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <MUI.Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          <Icons.Info fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom', color: theme.palette.info.main }} />
                          Escala de Evaluación
                        </MUI.Typography>
                        <MUI.Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <MUI.Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha('#e8f5e9', 0.7), px: 1.5, py: 0.5, borderRadius: 1 }}>
                            <MUI.Box sx={{ width: 20, height: 20, bgcolor: '#e8f5e9', border: '2px solid #2e7d32', borderRadius: '50%', mr: 1 }} />
                            <MUI.Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Icons.CheckCircleOutline sx={{ fontSize: 16, mr: 0.5, color: '#2e7d32' }} /> ≥ 70 (Aprobado)
                            </MUI.Typography>
                          </MUI.Box>
                          <MUI.Box sx={{ display: 'flex', alignItems: 'center', bgcolor: alpha('#ffebee', 0.7), px: 1.5, py: 0.5, borderRadius: 1 }}>
                            <MUI.Box sx={{ width: 20, height: 20, bgcolor: '#ffebee', border: '2px solid #c62828', borderRadius: '50%', mr: 1 }} />
                            <MUI.Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Icons.ErrorOutline sx={{ fontSize: 16, mr: 0.5, color: '#c62828' }} /> &lt; 70 (Reprobado)
                            </MUI.Typography>
                          </MUI.Box>
                        </MUI.Box>
                      </MUI.Box>
                      
                      <MUI.Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Icons.HelpOutline sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                        <MUI.Typography variant="body2" color="textSecondary">
                          Haga clic en una celda para editar la calificación
                        </MUI.Typography>
                      </MUI.Box>
                    </MUI.Paper>
                  )}
                  
                  {/* Tabla - Extender a todo el ancho */}
                  <MUI.Paper 
                    elevation={3} 
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      width: '100%'
                    }}
                  >
                    <MUI.TableContainer 
                      sx={{
                        maxHeight: { xs: 'calc(100vh - 250px)', md: 'calc(100vh - 320px)' },
                        width: '100%',
                        maxWidth: 1200,
                        mx: 'auto',
                        borderRadius: 4,
                        overflowX: 'auto',
                        boxShadow: 3,
                        '& .MuiTableCell-root': {
                          px: { xs: 2, sm: 2 },
                          py: { xs: 1.3, sm: 1.7 },
                          fontSize: { xs: '1.03rem', md: '1.12rem' },
                        },
                        '& .MuiTable-root': {
                          width: '100%',
                          maxWidth: 1200,
                          tableLayout: 'auto',
                          fontSize: { xs: '1.03rem', md: '1.12rem' },
                        },
                        '&::-webkit-scrollbar': {
                          width: '8px',
                          height: '8px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.3)
                          }
                        }
                      }}
                    >
                      <MUI.Table stickyHeader>
                        <MUI.TableHead>
                          <MUI.TableRow>
                            <MUI.TableCell
                              sx={{
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', md: '1.1rem' },
                                whiteSpace: 'nowrap',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderBottom: `2px solid ${theme.palette.primary.main}`,
                                position: 'sticky',
                                left: 0,
                                zIndex: 2,
                              }}
                            >
                              <Icons.Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Estudiante
                            </MUI.TableCell>
                            
                            <MUI.TableCell
                              sx={{
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', md: '1.1rem' },
                                whiteSpace: 'nowrap',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderBottom: `2px solid ${theme.palette.primary.main}`,
                              }}
                            >
                              <Icons.Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Centro de Trabajo
                            </MUI.TableCell>

                            {['RA1', 'RA2', 'RA3', 'RA4', 'RA5', 'RA6', 'RA7'].map((ra) => (
                              <MUI.TableCell
                                key={ra}
                                align="center"
                                sx={{
                                  fontWeight: 'bold',
                                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                                  whiteSpace: 'nowrap',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                                }}
                              >
                                <Icons.Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                                {ra}
                              </MUI.TableCell>
                            ))}

                            <MUI.TableCell
                              align="center"
                              sx={{
                                fontWeight: 'bold',
                                fontSize: { xs: '0.9rem', md: '1.1rem' },
                                whiteSpace: 'nowrap',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderBottom: `2px solid ${theme.palette.primary.main}`,
                              }}
                            >
                              <Icons.Stars sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Promedio
                            </MUI.TableCell>
                          </MUI.TableRow>
                        </MUI.TableHead>
                        
                        <MUI.TableBody>
                          {estudiantesData.map((estudianteData) => (
                            <MUI.TableRow
                              key={estudianteData.estudiante.documento_id_est}
                              sx={{
                                '&:nth-of-type(odd)': {
                                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                                },
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.light, 0.1),
                                },
                              }}
                            >
                              <MUI.TableCell
                                component="th"
                                scope="row"
                                sx={{
                                  position: 'sticky',
                                  left: 0,
                                  bgcolor: 'inherit',
                                  fontWeight: 'bold',
                                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                  zIndex: 1,
                                }}
                              >
                                {estudianteData.estudiante.nombre_est}
                              </MUI.TableCell>

                              <MUI.TableCell
                                sx={{
                                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                }}
                              >
                                {estudianteData.centro}
                              </MUI.TableCell>

                              {['RA1', 'RA2', 'RA3', 'RA4', 'RA5', 'RA6', 'RA7'].map((ra) => (
                                <MUI.TableCell
                                  key={ra}
                                  align="center"
                                  onClick={() => handleCellClick(estudianteData.estudiante.documento_id_est, ra, estudianteData.evaluaciones[ra])}
                                  sx={{
                                    cursor: 'pointer',
                                    position: 'relative',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.light, 0.2),
                                    },
                                  }}
                                >
                                  {editCell?.estudiante === estudianteData.estudiante.documento_id_est && editCell?.ra === ra ? (
                                    <MUI.TextField
                                      type="number"
                                      value={editCell.valor}
                                      onChange={handleCellChange}
                                      onBlur={handleCellBlur}
                                      onKeyPress={handleKeyPress}
                                      autoFocus
                                      inputProps={{
                                        min: 0,
                                        max: 100,
                                        style: { textAlign: 'center' }
                                      }}
                                      sx={{
                                        width: '80px',
                                        '& input': {
                                          padding: '8px',
                                          textAlign: 'center',
                                        }
                                      }}
                                    />
                                  ) : (
                                    <MUI.Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                      }}
                                    >
                                      {estudianteData.evaluaciones[ra] !== null ? (
                                        <>
                                          {estudianteData.evaluaciones[ra] >= 70 ? (
                                            <Icons.CheckCircle sx={{ fontSize: 16, color: '#2e7d32' }} />
                                          ) : (
                                            <Icons.Cancel sx={{ fontSize: 16, color: '#c62828' }} />
                                          )}
                                          {estudianteData.evaluaciones[ra]}
                                        </>
                                      ) : (
                                        <MUI.Typography variant="body2" color="textSecondary">
                                          N/A
                                        </MUI.Typography>
                                      )}
                                    </MUI.Box>
                                  )}
                                </MUI.TableCell>
                              ))}

                              <MUI.TableCell
                                align="center"
                                sx={{
                                  fontWeight: 'bold',
                                  color: estudianteData.promedio >= 70 ? '#2e7d32' : '#c62828',
                                  borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                }}
                              >
                                {estudianteData.promedio}
                              </MUI.TableCell>
                            </MUI.TableRow>
                          ))}
                        </MUI.TableBody>
                      </MUI.Table>
                    </MUI.TableContainer>
                    
                    <MUI.Divider />
                    
                    <MUI.Box 
                      sx={{ 
                        p: 2, 
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        display: 'flex', 
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                      }}
                    >
                      <MUI.Alert 
                        severity="info" 
                        icon={<Icons.TouchApp />} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        Haga clic en una celda para editar la calificación
                      </MUI.Alert>
                      
                      <MUI.Box sx={{ display: 'flex', gap: 1 }}>
                        <MUI.Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<Icons.SaveAlt />}
                          size={isSmallScreen ? 'small' : 'medium'}
                          onClick={guardarTodasLasCalificaciones}
                        >
                          Guardar Todo
                        </MUI.Button>
                        <MUI.Button 
                          variant="outlined" 
                          startIcon={<Icons.Print />}
                          size={isSmallScreen ? 'small' : 'medium'}
                        >
                          Imprimir
                        </MUI.Button>
                      </MUI.Box>
                    </MUI.Box>
                  </MUI.Paper>
                  
                  {/* Botones finales - Centrar en toda la anchura */}
                  <MUI.Box 
                    sx={{ 
                      mt: 3, 
                      display: 'flex', 
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      gap: 2,
                      width: '100%'
                    }}
                  >
                    <MUI.Button 
                      variant="outlined" 
                      color="info" 
                      startIcon={<Icons.BarChart />}
                      size={isSmallScreen ? 'small' : 'medium'}
                      onClick={() => setMostrarEstadisticas(true)}
                    >
                      Ver Estadísticas
                    </MUI.Button>
                    <MUI.Button 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<Icons.Print />}
                      size={isSmallScreen ? 'small' : 'medium'}
                    >
                      Imprimir
                    </MUI.Button>
                  </MUI.Box>
                </MUI.Box>
              ) : selectedTaller ? (
                <MUI.Paper 
                  elevation={1}
                  sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.light, 0.05),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    width: '100%'
                  }}
                >
                  <Icons.PersonOff sx={{ fontSize: 60, color: theme.palette.warning.main, opacity: 0.8, mb: 2 }} />
                  <MUI.Typography variant="h6" color="warning.main" sx={{ fontWeight: 'medium', mb: 1 }}>
                    No se encontraron estudiantes para este taller.
                  </MUI.Typography>
                  <MUI.Typography variant="body2" sx={{ mb: 3, textAlign: 'center', maxWidth: 500 }}>
                    No hay estudiantes registrados en este taller o no tienen evaluaciones asignadas.
                  </MUI.Typography>
                  <MUI.Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={<Icons.Refresh />}
                    onClick={() => setSelectedTaller('')}
                    sx={{ mt: 1 }}
                  >
                    Seleccionar otro taller
                  </MUI.Button>
                </MUI.Paper>
              ) : (
                <MUI.Paper 
                  elevation={1}
                  sx={{ 
                    p: 4, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.light, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    width: '100%'
                  }}
                >
                  <Icons.School sx={{ fontSize: 80, color: theme.palette.info.main, opacity: 0.7, mb: 2 }} />
                  <MUI.Typography variant="h6" color="info.main" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Sistema de Calificaciones
                  </MUI.Typography>
                  <MUI.Typography variant="body1" sx={{ mb: 3, textAlign: 'center', maxWidth: 500 }}>
                    Seleccione un taller para ver y gestionar las calificaciones de los estudiantes.
                  </MUI.Typography>
                  <MUI.Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <MUI.Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<Icons.ListAlt />}
                      size={isSmallScreen ? 'small' : 'medium'}
                      onClick={() => {
                        const tallerSelect = document.getElementById('taller-select');
                        if (tallerSelect) {
                          tallerSelect.click();
                          tallerSelect.focus();
                        }
                      }}
                    >
                      Ver Talleres Disponibles
                    </MUI.Button>
                  </MUI.Box>
                </MUI.Paper>
              )}
            </MUI.Box>
          </MUI.Paper>
          
          <MUI.Box 
            sx={{ 
              textAlign: 'center', 
              mt: 2, 
              mb: 4, 
              color: alpha(theme.palette.text.secondary, 0.7),
              fontSize: '0.8rem',
              width: '100%'
            }}
          >
            <MUI.Typography variant="caption" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, fontSize: { xs: '1rem', md: '1.2rem' } }}>
              <Icons.VerifiedUser fontSize="large" /> Sistema de Evaluación CheckIN © {new Date().getFullYear()}
            </MUI.Typography>
          </MUI.Box>
        </MUI.Box>
      </MUI.Box>
      
      {/* Diálogo de estadísticas */}
      <MUI.Dialog 
        open={mostrarEstadisticas} 
        onClose={() => setMostrarEstadisticas(false)}
        maxWidth="md"
        fullWidth
      >
        <MUI.DialogTitle sx={{ 
          background: 'linear-gradient(120deg, #4a148c, #880e4f, #ff5722)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          px: 3,
          py: 2
        }}>
          <Icons.BarChart sx={{ mr: 1.5, fontSize: 28 }} /> 
          Estadísticas de Calificaciones
          <MUI.Box sx={{ ml: 'auto' }}>
            <MUI.IconButton 
              onClick={() => setMostrarEstadisticas(false)}
              sx={{ color: 'white' }}
            >
              <Icons.Close />
            </MUI.IconButton>
          </MUI.Box>
        </MUI.DialogTitle>
        
        <MUI.DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
          {selectedTaller && estudiantesData.length > 0 ? (
            <>
              {(() => {
                const stats = calcularEstadisticas();
                return (
                  <MUI.Box sx={{ width: '100%' }}>
                    {/* Resumen general */}
                    <MUI.Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      pb: 1,
                      mb: 2
                    }}>
                      <Icons.Assessment sx={{ mr: 1 }} /> Resumen General
                    </MUI.Typography>
                    
                    <MUI.Grid container spacing={2} sx={{ mb: 4 }}>
                      <MUI.Grid item xs={12} sm={6} md={3}>
                        <MUI.Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                          <Icons.People sx={{ fontSize: 36, color: theme.palette.primary.main, mb: 1 }} />
                          <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {stats.totalEstudiantes}
                          </MUI.Typography>
                          <MUI.Typography variant="body2" color="textSecondary">
                            Total Estudiantes
                          </MUI.Typography>
                        </MUI.Paper>
                      </MUI.Grid>
                      
                      <MUI.Grid item xs={12} sm={6} md={3}>
                        <MUI.Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: alpha('#e8f5e9', 0.7) }}>
                          <Icons.CheckCircle sx={{ fontSize: 36, color: '#2e7d32', mb: 1 }} />
                          <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {stats.aprobados} ({stats.porcentajeAprobados}%)
                          </MUI.Typography>
                          <MUI.Typography variant="body2" color="textSecondary">
                            Aprobados
                          </MUI.Typography>
                        </MUI.Paper>
                      </MUI.Grid>
                      
                      <MUI.Grid item xs={12} sm={6} md={3}>
                        <MUI.Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: alpha('#ffebee', 0.7) }}>
                          <Icons.Cancel sx={{ fontSize: 36, color: '#c62828', mb: 1 }} />
                          <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {stats.reprobados} ({stats.porcentajeReprobados}%)
                          </MUI.Typography>
                          <MUI.Typography variant="body2" color="textSecondary">
                            Reprobados
                          </MUI.Typography>
                        </MUI.Paper>
                      </MUI.Grid>
                      
                      <MUI.Grid item xs={12} sm={6} md={3}>
                        <MUI.Paper elevation={1} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: alpha(theme.palette.info.light, 0.2) }}>
                          <Icons.Equalizer sx={{ fontSize: 36, color: theme.palette.info.dark, mb: 1 }} />
                          <MUI.Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {stats.promedioGeneral} / 100
                          </MUI.Typography>
                          <MUI.Typography variant="body2" color="textSecondary">
                            Promedio General
                          </MUI.Typography>
                        </MUI.Paper>
                      </MUI.Grid>
                    </MUI.Grid>
                    
                    {/* Gráfico de barras para RAs */}
                    <MUI.Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      pb: 1,
                      mb: 2
                    }}>
                      <Icons.StackedBarChart sx={{ mr: 1 }} /> Estadísticas por Resultado de Aprendizaje
                    </MUI.Typography>
                    
                    <MUI.Box sx={{ mb: 4 }}>
                      <MUI.TableContainer component={MUI.Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <MUI.Table size="small">
                          <MUI.TableHead>
                            <MUI.TableRow>
                              <MUI.TableCell sx={{ fontWeight: 'bold' }}>Resultado</MUI.TableCell>
                              <MUI.TableCell sx={{ fontWeight: 'bold' }}>Promedio</MUI.TableCell>
                              <MUI.TableCell sx={{ fontWeight: 'bold' }}>Aprobados</MUI.TableCell>
                              <MUI.TableCell sx={{ fontWeight: 'bold' }}>Pendientes</MUI.TableCell>
                              <MUI.TableCell sx={{ fontWeight: 'bold' }}>Progreso</MUI.TableCell>
                            </MUI.TableRow>
                          </MUI.TableHead>
                          <MUI.TableBody>
                            {Object.entries(stats.raStats).map(([ra, data]) => (
                              <MUI.TableRow key={ra}>
                                <MUI.TableCell>{ra}</MUI.TableCell>
                                <MUI.TableCell>
                                  <MUI.Box sx={{ 
                                    fontWeight: 'bold',
                                    color: data.promedio >= 70 ? '#2e7d32' : '#c62828'
                                  }}>
                                    {data.promedio}
                                  </MUI.Box>
                                </MUI.TableCell>
                                <MUI.TableCell>
                                  {data.aprobados} / {stats.totalEstudiantes - data.pendientes}
                                </MUI.TableCell>
                                <MUI.TableCell>
                                  {data.pendientes}
                                </MUI.TableCell>
                                <MUI.TableCell sx={{ width: '40%' }}>
                                  <MUI.Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <MUI.Box sx={{ width: '100%', mr: 1 }}>
                                      <MUI.LinearProgress 
                                        variant="determinate" 
                                        value={data.promedio} 
                                        sx={{ 
                                          height: 8, 
                                          borderRadius: 5,
                                          backgroundColor: alpha(theme.palette.grey[300], 0.8),
                                          '& .MuiLinearProgress-bar': {
                                            backgroundColor: data.promedio >= 70 ? '#2e7d32' : '#c62828'
                                          }
                                        }}
                                      />
                                    </MUI.Box>
                                    <MUI.Box sx={{ minWidth: 35 }}>
                                      <MUI.Typography variant="body2" color="text.secondary">
                                        {data.promedio}%
                                      </MUI.Typography>
                                    </MUI.Box>
                                  </MUI.Box>
                                </MUI.TableCell>
                              </MUI.TableRow>
                            ))}
                          </MUI.TableBody>
                        </MUI.Table>
                      </MUI.TableContainer>
                    </MUI.Box>
                  </MUI.Box>
                );
              })()}
            </>
          ) : (
            <MUI.Box sx={{ textAlign: 'center', py: 4 }}>
              <Icons.DataArray sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
              <MUI.Typography variant="h6" color="textSecondary">
                No hay datos suficientes para mostrar estadísticas
              </MUI.Typography>
              <MUI.Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Seleccione un taller y asegúrese de que haya estudiantes con calificaciones.
              </MUI.Typography>
            </MUI.Box>
          )}
        </MUI.DialogContent>
        
        <MUI.DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <MUI.Button 
            onClick={() => exportarAExcel()}
            startIcon={<Icons.TableChart />}
            color="success"
            variant="contained"
          >
            Exportar Estadísticas
          </MUI.Button>
          <MUI.Button 
            onClick={() => setMostrarEstadisticas(false)}
            color="primary"
          >
            Cerrar
          </MUI.Button>
        </MUI.DialogActions>
      </MUI.Dialog>
      
      {/* Backdrop para mostrar cuando se está guardando */}
      <MUI.Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(3px)'
        }}
        open={saving}
      >
        <MUI.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <MUI.CircularProgress color="inherit" size={60} thickness={4} />
          <MUI.Typography variant="h6">
            Guardando cambios...
          </MUI.Typography>
        </MUI.Box>
      </MUI.Backdrop>
    </MUI.Box>
  );
};

export default Calificacion; 