import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FamiliaProfesional } from './familia_profecional';

export type EstadoTallerType = 'Activo' | 'Inactivo';

@Entity('taller')
export class Taller {
    @PrimaryColumn({ type: 'varchar', length: 5 })
    id_taller!: string;

    @Column({ type: 'varchar', length: 200 })
    nombre_taller!: string;

    @ManyToOne(() => FamiliaProfesional, { nullable: false })
    @JoinColumn({ name: 'familia_taller', referencedColumnName: 'id_fam' })
    familia_taller!: FamiliaProfesional;

    @Column({ type: 'varchar', length: 8, unique: true })
    cod_titulo_taller!: string;

    @Column({
        type: 'enum',
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    })
    estado_taller!: EstadoTallerType;

    constructor(
        id_taller: string = '',
        nombre_taller: string = '',
        familia_taller: FamiliaProfesional,
        cod_titulo_taller: string = '',
        estado_taller: EstadoTallerType = 'Activo'
    ) {
        this.id_taller = id_taller;
        this.nombre_taller = nombre_taller;
        this.familia_taller = familia_taller;
        this.cod_titulo_taller = cod_titulo_taller;
        this.estado_taller = estado_taller;
    }
} 