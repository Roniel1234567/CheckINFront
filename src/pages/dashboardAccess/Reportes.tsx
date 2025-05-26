import { useState, useEffect } from 'react';
import * as MUI from '@mui/material';
import * as Icons from '@mui/icons-material';
import SideBar from '../../components/SideBar';
import DashboardAppBar from '../../components/DashboardAppBar';
import { useTheme } from '@mui/material/styles';
import studentService from '../../services/studentService';
import pasantiaService from '../../services/pasantiaService';
import { internshipService } from '../../services/internshipService';
import api from '../../services/api';
import React from 'react';

interface ReporteProps {
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  accion: () => void;
}

interface TallerEstudiante {
  id_taller: number;
  nombre_taller: string;
  cod_titulo_taller: string;
  estado_taller: string;
}

interface EstudianteBase {
  documento_id_est: string;
  nombre_est: string;
  apellido_est: string;
  taller_est?: TallerEstudiante;
  fecha_inicio_pasantia?: string;
  fecha_fin_pasantia?: string;
}

interface EvaluacionEstudiante {
  id_eval_est: number;
  ra_eval: string;
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
    estudiante_pas: EstudianteBase;
  };
}

interface CentroTrabajo {
  id_centro: number;
  nombre_centro: string;
}

const estilosBase = `
  <style>
    body { font-family: Arial, sans-serif; }
    .reporte-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .encabezado {
      text-align: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1a237e;
    }
    .encabezado h1 {
      color: #1a237e;
      font-size: 24px;
      margin: 0 0 5px 0;
    }
    .encabezado p {
      margin: 5px 0;
    }
    .info-reporte {
      margin-bottom: 10px;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 5px;
    }
    .info-reporte p {
      margin: 3px 0;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      background-color: white;
    }
    th {
      background-color: #1a237e;
      color: white;
      padding: 12px;
      font-weight: bold;
      text-align: left;
      font-size: 14px;
    }
    td {
      padding: 10px;
      border: 1px solid #ddd;
      font-size: 13px;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
`;

function Reportes() {
  const theme = useTheme();
  const isMobile = MUI.useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(false);
  const [selectedTaller, setSelectedTaller] = useState<string>('');
  const [selectedCentro, setSelectedCentro] = useState<string>('');
  const [talleres, setTalleres] = useState<TallerEstudiante[]>([]);
  const [centros, setCentros] = useState<CentroTrabajo[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentReporte, setCurrentReporte] = useState<string>('');
  const notifications = 4;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [talleresData, centrosData] = await Promise.all([
          internshipService.getAllTalleres(),
          api.get<CentroTrabajo[]>('/centros-trabajo').then(res => res.data)
        ]);
        setTalleres(talleresData as unknown as TallerEstudiante[]);
        setCentros(centrosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  }, []);

  const generarPDF = async (contenido: string, nombreArchivo: string) => {
    const element = document.createElement('div');
    element.innerHTML = contenido;
    document.body.appendChild(element);

      const opt = {
    margin: 15,
      filename: nombreArchivo,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    } finally {
      document.body.removeChild(element);
    }
  };

  const generarReporteEstudiantePasantia = async () => {
    try {
      setLoading(true);
      
      const [estudiantes, pasantias] = await Promise.all([
        studentService.getAllStudents() as Promise<EstudianteBase[]>,
        pasantiaService.getAllPasantias()
      ]);

      const estudiantesFiltrados = selectedTaller 
        ? estudiantes.filter(e => (e as EstudianteBase).taller_est?.id_taller.toString() === selectedTaller)
        : estudiantes;

      const contenido = `
        ${estilosBase}
        <div class="reporte-container">
          <div class="encabezado">
            <h1>Reporte de Estudiantes y Pasantías</h1>
            <p>Instituto Politécnico Industrial de Santiago (IPISA)</p>
          </div>
          
          <div class="info-reporte">
            <p><strong>Taller:</strong> ${selectedTaller ? talleres.find(t => t.id_taller.toString() === selectedTaller)?.nombre_taller || 'No encontrado' : 'Todos los talleres'}</p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total de estudiantes:</strong> ${estudiantesFiltrados.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Taller</th>
                <th>Estado Pasantía</th>
                <th>Centro de Trabajo</th>
              </tr>
            </thead>
            <tbody>
              ${estudiantesFiltrados.map(estudiante => {
                const pasantia = pasantias.find(p => 
                  p.estudiante_pas.documento_id_est === estudiante.documento_id_est
                );
                return `
                  <tr>
                    <td>${estudiante.nombre_est} ${estudiante.apellido_est}</td>
                    <td>${estudiante.taller_est?.nombre_taller || 'No asignado'}</td>
                    <td>${pasantia ? pasantia.estado_pas : 'Sin pasantía'}</td>
                    <td>${pasantia ? pasantia.centro_pas.nombre_centro : 'No asignado'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Este es un documento generado automáticamente por el Sistema de Gestión de Pasantías</p>
            <p>© ${new Date().getFullYear()} IPISA - Todos los derechos reservados</p>
          </div>
        </div>
      `;
      
      await generarPDF(contenido, 'reporte-estudiantes-pasantias.pdf');
      setSnackbar({
        open: true,
        message: 'Reporte generado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'Error al generar el reporte',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generarReporteCalificaciones = async () => {
    try {
      setLoading(true);

      const [estudiantes, evaluaciones] = await Promise.all([
        studentService.getAllStudents() as Promise<EstudianteBase[]>,
        api.get<EvaluacionEstudiante[]>('/evaluaciones-estudiante').then(res => res.data)
      ]);

      const estudiantesFiltrados = selectedTaller 
        ? estudiantes.filter(e => (e as EstudianteBase).taller_est?.id_taller.toString() === selectedTaller)
        : estudiantes;

      const evaluacionesPorEstudiante = new Map<string, EvaluacionEstudiante[]>();
      evaluaciones.forEach(evaluacion => {
        const docId = evaluacion.pasantia_eval.estudiante_pas.documento_id_est;
        if (!evaluacionesPorEstudiante.has(docId)) {
          evaluacionesPorEstudiante.set(docId, []);
        }
        evaluacionesPorEstudiante.get(docId)?.push(evaluacion);
      });

      const contenido = `
        ${estilosBase}
        <div class="reporte-container">
          <div class="encabezado">
            <h1>Reporte de Calificaciones</h1>
            <p>Instituto Politécnico Industrial de Santiago (IPISA)</p>
          </div>
          
          <div class="info-reporte">
            <p><strong>Taller:</strong> ${selectedTaller ? talleres.find(t => t.id_taller.toString() === selectedTaller)?.nombre_taller || 'No encontrado' : 'Todos los talleres'}</p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Total de estudiantes:</strong> ${estudiantesFiltrados.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Taller</th>
                <th>RA1</th>
                <th>RA2</th>
                <th>RA3</th>
                <th>RA4</th>
                <th>RA5</th>
                <th>RA6</th>
                <th>RA7</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              ${estudiantesFiltrados.map(estudiante => {
                const evaluacionesEst = evaluacionesPorEstudiante.get(estudiante.documento_id_est) || [];
                const evaluacionesPorRA = new Map<string, number>();
                evaluacionesEst.forEach(evaluacion => {
                  const promedio = Math.round(
                    (evaluacion.asistencia_eval +
                    evaluacion.desempeño_eval +
                    evaluacion.disponibilidad_eval +
                    evaluacion.responsabilidad_eval +
                    evaluacion.limpieza_eval +
                    evaluacion.trabajo_equipo_eval +
                    evaluacion.resolucion_problemas_eval) / 7
                  );
                  evaluacionesPorRA.set(evaluacion.ra_eval, promedio);
                });

                const promedioTotal = evaluacionesEst.length > 0
                  ? Math.round([...evaluacionesPorRA.values()].reduce((a, b) => a + b, 0) / evaluacionesPorRA.size)
                  : 0;

                const getCalificacionEstilo = (nota: number) => {
                  if (nota === 0) return 'color: #999;';
                  if (nota >= 90) return 'color: #4CAF50; font-weight: bold;';
                  if (nota >= 80) return 'color: #2196F3;';
                  if (nota >= 70) return 'color: #FF9800;';
                  return 'color: #f44336; font-weight: bold;';
                };

                return `
                  <tr>
                    <td>${estudiante.nombre_est} ${estudiante.apellido_est}</td>
                    <td>${estudiante.taller_est?.nombre_taller || 'No asignado'}</td>
                    ${['RA1', 'RA2', 'RA3', 'RA4', 'RA5', 'RA6', 'RA7'].map(ra => `
                      <td style="${getCalificacionEstilo(evaluacionesPorRA.get(ra) || 0)}">
                        ${evaluacionesPorRA.get(ra) || '-'}
                      </td>
                    `).join('')}
                    <td style="${getCalificacionEstilo(promedioTotal)}">
                      <strong>${promedioTotal || '-'}</strong>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Este es un documento generado automáticamente por el Sistema de Gestión de Pasantías</p>
            <p>Escala de calificación: 90-100 (Excelente), 80-89 (Muy Bueno), 70-79 (Bueno), <70 (Necesita Mejorar)</p>
            <p>© ${new Date().getFullYear()} IPISA - Todos los derechos reservados</p>
          </div>
        </div>
      `;
      
      await generarPDF(contenido, 'reporte-calificaciones.pdf');
      setSnackbar({
        open: true,
        message: 'Reporte generado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'Error al generar el reporte',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generarReporteAsignaciones = async () => {
    try {
      setLoading(true);

      const [estudiantes, pasantias] = await Promise.all([
        studentService.getAllStudents() as Promise<EstudianteBase[]>,
        pasantiaService.getAllPasantias()
      ]);

      const estudiantesMap = new Map(estudiantes.map(est => [est.documento_id_est, est]));

      let pasantiasFiltradas = [...pasantias];
      
      if (selectedTaller) {
        pasantiasFiltradas = pasantiasFiltradas.filter(p => {
          const estudiante = estudiantesMap.get(p.estudiante_pas.documento_id_est);
          return estudiante?.taller_est?.id_taller.toString() === selectedTaller;
        });
      }
      
      if (selectedCentro) {
        pasantiasFiltradas = pasantiasFiltradas.filter(p => 
          p.centro_pas.id_centro.toString() === selectedCentro
        );
      }

      const formatearFecha = (fecha: string | undefined) => {
        if (!fecha) return 'No definida';
        return new Date(fecha).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };

      const getEstadoEstilo = (estado: string) => {
        switch (estado.toLowerCase()) {
          case 'en proceso':
            return 'color: #2196F3; font-weight: bold;';
          case 'terminada':
            return 'color: #4CAF50; font-weight: bold;';
          case 'pendiente':
            return 'color: #FF9800; font-weight: bold;';
          case 'cancelada':
            return 'color: #f44336; font-weight: bold;';
          default:
            return '';
        }
      };

      const contenido = `
        ${estilosBase}
        <div class="reporte-container">
          <div class="encabezado">
            <h1>Reporte de Asignaciones de Pasantías</h1>
            <p>Instituto Politécnico Industrial de Santiago (IPISA)</p>
          </div>
          
          <div class="info-reporte">
            <p><strong>Taller:</strong> ${selectedTaller ? talleres.find(t => t.id_taller.toString() === selectedTaller)?.nombre_taller || 'No encontrado' : 'Todos los talleres'}</p>
            <p><strong>Centro de Trabajo:</strong> ${selectedCentro ? centros.find(c => c.id_centro.toString() === selectedCentro)?.nombre_centro || 'No encontrado' : 'Todos los centros'}</p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            <p><strong>Total de asignaciones:</strong> ${pasantiasFiltradas.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Taller</th>
                <th>Centro de Trabajo</th>
                <th>Estado</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
              </tr>
            </thead>
            <tbody>
              ${pasantiasFiltradas.map(pasantia => {
                const estudiante = estudiantesMap.get(pasantia.estudiante_pas.documento_id_est);
                return `
                  <tr>
                    <td>${estudiante?.nombre_est || ''} ${estudiante?.apellido_est || ''}</td>
                    <td>${estudiante?.taller_est?.nombre_taller || 'No asignado'}</td>
                    <td>${pasantia.centro_pas.nombre_centro}</td>
                    <td style="${getEstadoEstilo(pasantia.estado_pas)}">${pasantia.estado_pas}</td>
                    <td>${formatearFecha(estudiante?.fecha_inicio_pasantia)}</td>
                    <td>${pasantia.estado_pas.toLowerCase() === 'en proceso' ? 'En curso' : formatearFecha(estudiante?.fecha_fin_pasantia)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Este es un documento generado automáticamente por el Sistema de Gestión de Pasantías</p>
            <p>Estados: En Proceso (Azul), Terminada (Verde), Pendiente (Naranja), Cancelada (Rojo)</p>
            <p>© ${new Date().getFullYear()} IPISA - Todos los derechos reservados</p>
          </div>
        </div>
      `;
      
      await generarPDF(contenido, 'reporte-asignaciones.pdf');
      setSnackbar({
        open: true,
        message: 'Reporte generado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'Error al generar el reporte',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const reportes: ReporteProps[] = [
    {
      titulo: 'Reporte de Estudiantes y Pasantías',
      descripcion: 'Genera un reporte detallado de estudiantes y sus pasantías, filtrado por taller',
      icono: <Icons.Assessment sx={{ fontSize: 40 }} />,
      color: '#2196F3',
      accion: generarReporteEstudiantePasantia
    },
    {
      titulo: 'Reporte de Calificaciones',
      descripcion: 'Genera un reporte de calificaciones de estudiantes por taller',
      icono: <Icons.Grade sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
      accion: generarReporteCalificaciones
    },
    {
      titulo: 'Reporte de Asignaciones',
      descripcion: 'Genera un reporte de estudiantes asignados a centros de trabajo',
      icono: <Icons.Business sx={{ fontSize: 40 }} />,
      color: '#FF9800',
      accion: generarReporteAsignaciones
    }
  ];

  return (
    <MUI.Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar drawerOpen={drawerOpen} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

      <MUI.Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DashboardAppBar notifications={notifications} toggleDrawer={() => setDrawerOpen(!drawerOpen)} />

        <MUI.Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <MUI.Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Reportes
          </MUI.Typography>

          <MUI.Grid container spacing={3}>
            {reportes.map((reporte, index) => (
              <MUI.Grid item xs={12} md={4} key={index}>
                <MUI.Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => {
                    setCurrentReporte(reporte.titulo);
                    setOpenDialog(true);
                  }}
                >
                  <MUI.CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <MUI.Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: `${reporte.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      {reporte.icono}
                    </MUI.Box>
                    <MUI.Typography variant="h6" gutterBottom>
                      {reporte.titulo}
                    </MUI.Typography>
                    <MUI.Typography variant="body2" color="text.secondary">
                      {reporte.descripcion}
                    </MUI.Typography>
                  </MUI.CardContent>
                </MUI.Card>
              </MUI.Grid>
            ))}
          </MUI.Grid>
        </MUI.Container>

        {/* Diálogo para filtros */}
        <MUI.Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <MUI.DialogTitle>
            Configurar Reporte
          </MUI.DialogTitle>
          <MUI.DialogContent>
            <MUI.Grid container spacing={2}>
              <MUI.Grid item xs={12}>
                <MUI.FormControl fullWidth>
                  <MUI.InputLabel>Taller</MUI.InputLabel>
                  <MUI.Select
                    value={selectedTaller}
                    onChange={(e) => setSelectedTaller(e.target.value)}
                    label="Taller"
                  >
                    <MUI.MenuItem value="">Todos los talleres</MUI.MenuItem>
                    {talleres.map((taller) => (
                      <MUI.MenuItem key={taller.id_taller} value={taller.id_taller.toString()}>
                        {taller.nombre_taller}
                      </MUI.MenuItem>
                    ))}
                  </MUI.Select>
                </MUI.FormControl>
              </MUI.Grid>
              {currentReporte === 'Reporte de Asignaciones' && (
                <MUI.Grid item xs={12}>
                  <MUI.FormControl fullWidth>
                    <MUI.InputLabel>Centro de Trabajo</MUI.InputLabel>
                    <MUI.Select
                      value={selectedCentro}
                      onChange={(e) => setSelectedCentro(e.target.value)}
                      label="Centro de Trabajo"
                    >
                      <MUI.MenuItem value="">Todos los centros</MUI.MenuItem>
                      {centros.map((centro) => (
                        <MUI.MenuItem key={centro.id_centro} value={centro.id_centro.toString()}>
                          {centro.nombre_centro}
                        </MUI.MenuItem>
                      ))}
                    </MUI.Select>
                  </MUI.FormControl>
                </MUI.Grid>
              )}
            </MUI.Grid>
          </MUI.DialogContent>
          <MUI.DialogActions>
            <MUI.Button onClick={() => setOpenDialog(false)}>
              Cancelar
            </MUI.Button>
            <MUI.Button
              variant="contained"
              onClick={() => {
                const reporte = reportes.find(r => r.titulo === currentReporte);
                if (reporte) {
                  reporte.accion();
                }
                setOpenDialog(false);
              }}
            >
              Generar Reporte
            </MUI.Button>
          </MUI.DialogActions>
        </MUI.Dialog>

        {/* Snackbar para mensajes */}
        <MUI.Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <MUI.Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </MUI.Alert>
        </MUI.Snackbar>

        {/* Backdrop para loading */}
        <MUI.Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <MUI.CircularProgress color="inherit" />
        </MUI.Backdrop>
      </MUI.Box>
    </MUI.Box>
  );
}

export default Reportes; 