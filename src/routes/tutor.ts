import { Router, Request, Response } from 'express';
import { getTutoresByTaller } from '../controllers/TutorController';

const router = Router();

// Endpoint para obtener tutores por taller
router.get('/taller/:id_taller', async (req: Request, res: Response) => {
    await getTutoresByTaller(req, res);
});

export default router; 