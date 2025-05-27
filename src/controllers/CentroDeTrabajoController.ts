export const getCentrosAceptados = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const centros = await centroTrabajoRepository.find({
            where: { validacion: 'Aceptada' },
            relations: [
                'direccion_centro',
                'direccion_centro.sector_dir',
                'direccion_centro.sector_dir.ciudad',
                'direccion_centro.sector_dir.ciudad.provincia',
                'contacto_centro',
                'usuario',
                'persona_contacto_empresa'
            ]
        });
        return res.json(centros);
    } catch (error) {
        console.error('Error al obtener centros aceptados:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getCentrosRechazados = async (_req: Request, res: Response): Promise<Response> => {
    try {
        const centros = await centroTrabajoRepository.find({
            where: { validacion: 'Rechazada' },
            relations: [
                'direccion_centro',
                'direccion_centro.sector_dir',
                'direccion_centro.sector_dir.ciudad',
                'direccion_centro.sector_dir.ciudad.provincia',
                'contacto_centro',
                'usuario',
                'persona_contacto_empresa'
            ]
        });
        return res.json(centros);
    } catch (error) {
        console.error('Error al obtener centros rechazados:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}; 