import { Router } from 'express';
import { EstudianteController } from '../controllers/EstudianteController';

const router = Router();
const estudianteController = new EstudianteController();

// Rutas básicas CRUD
router.get('/estudiantes', estudianteController.getAllEstudiantes);
router.get('/estudiantes/:id', estudianteController.getEstudianteById);
router.post('/estudiantes', estudianteController.createEstudiante);
router.put('/estudiantes/:id', estudianteController.updateEstudiante);
router.delete('/estudiantes/:id', estudianteController.deleteEstudiante);

// Rutas específicas para pasantía y póliza
router.put('/estudiantes/:id/poliza', estudianteController.updatePoliza);
router.put('/estudiantes/:id/fechas', estudianteController.updateFechasPasantia);
router.put('/estudiantes/:id/horas', estudianteController.updateHorasPasantia);

export default router; 