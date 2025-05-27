import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { EvaluacionEstudiante } from '../models/EvaluacionEstudiante';
import { Repository } from 'typeorm';

const evaluacionRepository: Repository<EvaluacionEstudiante> = AppDataSource.getRepository(EvaluacionEstudiante);

export const getEvaluacionesPorPasantia = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        
        const evaluaciones = await evaluacionRepository
            .createQueryBuilder('evaluacion')
            .innerJoinAndSelect('evaluacion.pasantia_eval', 'pasantia')
            .where('pasantia.id_pas = :id', { id: parseInt(id) })
            .getMany();

        return res.json(evaluaciones);
    } catch (error) {
        console.error('Error al obtener las evaluaciones:', error);
        return res.status(500).json({ message: 'Error al obtener las evaluaciones' });
    }
};

export const updateEvaluacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const evaluacion = await evaluacionRepository.findOneBy({ id_eval_est: parseInt(id) });
        
        if (!evaluacion) {
            return res.status(404).json({ message: 'Evaluación no encontrada' });
        }

        evaluacionRepository.merge(evaluacion, req.body);
        const result = await evaluacionRepository.save(evaluacion);
        return res.json(result);
    } catch (error) {
        console.error('Error al actualizar la evaluación:', error);
        return res.status(500).json({ message: 'Error al actualizar la evaluación' });
    }
};

export const createEvaluacion = async (req: Request, res: Response): Promise<Response> => {
    try {
        const nuevaEvaluacion = evaluacionRepository.create(req.body);
        const result = await evaluacionRepository.save(nuevaEvaluacion);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error al crear la evaluación:', error);
        return res.status(500).json({ message: 'Error al crear la evaluación' });
    }
}; 