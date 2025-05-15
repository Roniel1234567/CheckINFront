import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Taller } from '../models/Taller';

const tallerRepository = AppDataSource.getRepository(Taller);

// Obtener todos los talleres
export const getAllTalleres = async (_req: Request, res: Response): Promise<Response> => {
    try {
        console.log('Iniciando búsqueda de talleres...');
        const talleres = await tallerRepository
            .createQueryBuilder('taller')
            .leftJoinAndSelect('taller.familia_taller', 'familia_taller')
            .select([
                'taller.id_taller',
                'taller.nombre_taller',
                'taller.cod_titulo_taller',
                'taller.estado_taller',
                'familia_taller.id_fam',
                'familia_taller.nombre_fam'
            ])
            .getMany();

        console.log('Talleres encontrados:', talleres);
        return res.status(200).json(talleres);
    } catch (error) {
        console.error('Error detallado al obtener talleres:', error);
        if (error instanceof Error) {
            console.error('Mensaje de error:', error.message);
            console.error('Stack trace:', error.stack);
        }
        return res.status(500).json({ 
            message: 'Error al cargar los datos',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener taller por ID con validación
export const getTallerById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    if (!id || id === '' || isNaN(Number(id))) {
        return res.status(400).json({ message: 'ID de taller inválido' });
    }
    try {
        const taller = await tallerRepository.findOne({
            where: { id_taller: id },
            relations: ['familia_taller']
        });
        if (!taller) {
            return res.status(404).json({ message: 'Taller no encontrado' });
        }
        return res.status(200).json(taller);
    } catch (error) {
        console.error('Error al obtener taller:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Crear un nuevo taller
export const createTaller = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id_taller, nombre_taller, familia_taller, cod_titulo_taller, estado_taller } = req.body;
        
        // Validación de campos requeridos
        if (!id_taller || !nombre_taller || !familia_taller || !cod_titulo_taller) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Crear instancia de Taller usando el constructor
        const taller = new Taller(
            id_taller,
            nombre_taller,
            familia_taller,
            cod_titulo_taller,
            estado_taller || 'Activo'
        );

        // Guardar el taller
        const savedTaller = await tallerRepository.save(taller);

        // Cargar la relación con familia profesional
        const tallerConFamilia = await tallerRepository.findOne({
            where: { id_taller: savedTaller.id_taller },
            relations: ['familia_taller']
        });

        return res.status(201).json(tallerConFamilia);
    } catch (error) {
        console.error('Error al crear taller:', error);
        if (error instanceof Error) {
            console.error('Mensaje de error:', error.message);
            console.error('Stack trace:', error.stack);
        }
        return res.status(500).json({ 
            message: 'Error al crear el taller',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Actualizar un taller existente
export const updateTaller = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = req.params.id;
        const taller = await tallerRepository.findOne({ where: { id_taller: id } });
        if (!taller) {
            return res.status(404).json({ message: 'Taller no encontrado' });
        }
        tallerRepository.merge(taller, req.body);
        const updatedTaller = await tallerRepository.save(taller);
        return res.status(200).json(updatedTaller);
    } catch (error) {
        console.error('Error al actualizar taller:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar taller por ID con validación
export const deleteTaller = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    if (!id || id === '' || isNaN(Number(id))) {
        return res.status(400).json({ message: 'ID de taller inválido' });
    }
    try {
        const result = await tallerRepository.delete(id);
        if (result.affected === 0) {
            return res.status(404).json({ message: 'Taller no encontrado' });
        }
        return res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar taller:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}; 