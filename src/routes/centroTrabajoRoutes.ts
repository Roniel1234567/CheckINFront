import { Router, Request, Response } from 'express';
import { 
    getAllCentrosTrabajo,
    createCentroTrabajo,
    getCiudadesByProvincia,
    getSectoresByCiudad,
    existeNombreCentro,
    updateCentroTrabajo,
    getCentrosPendientes,
    validarCentro,
    getCentrosAceptados,
    getCentrosRechazados
} from '../controllers/CentroDeTrabajoController';

const router = Router();

// Get all centros de trabajo
router.get('/', async (req: Request, res: Response) => {
    await getAllCentrosTrabajo(req, res);
});

// Create new centro de trabajo
router.post('/', async (req: Request, res: Response) => {
    await createCentroTrabajo(req, res);
});

// Get ciudades by provincia
router.get('/ciudades/provincia/:provinciaId', async (req: Request, res: Response) => {
    await getCiudadesByProvincia(req, res);
});

// Get sectores by ciudad
router.get('/sectores/ciudad/:ciudadId', async (req: Request, res: Response) => {
    await getSectoresByCiudad(req, res);
});

// Verificar si existe un centro de trabajo con ese nombre
router.get('/existe-nombre/:nombre', async (req: Request, res: Response) => {
    await existeNombreCentro(req, res);
});

// Actualizar centro de trabajo por ID
router.put('/:id', async (req: Request, res: Response) => {
    await updateCentroTrabajo(req, res);
});

// Obtener centros pendientes de validación
router.get('/pendientes', async (req: Request, res: Response) => {
    await getCentrosPendientes(req, res);
});

// Obtener centros aceptados
router.get('/validacion/aceptadas', async (req: Request, res: Response) => {
    await getCentrosAceptados(req, res);
});

// Obtener centros rechazados
router.get('/validacion/rechazadas', async (req: Request, res: Response) => {
    await getCentrosRechazados(req, res);
});

// Validar centro de trabajo
router.put('/:id/validar', async (req: Request, res: Response) => {
    await validarCentro(req, res);
});

export default router; 