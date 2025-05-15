import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Taller } from './Taller';

@Entity('familia_profesional')
export class FamiliaProfesional {
    @PrimaryColumn({ type: 'varchar', length: 3 })
    id_fam!: string;

    @Column({ type: 'varchar', length: 100 })
    nombre_fam!: string;

    @Column({
        type: 'enum',
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    })
    estado_fam!: string;

    @OneToMany(() => Taller, taller => taller.familia_taller)
    talleres?: Taller[];

    constructor(
        id_fam: string = '',
        nombre_fam: string = '',
        estado_fam: string = 'Activo'
    ) {
        this.id_fam = id_fam;
        this.nombre_fam = nombre_fam;
        this.estado_fam = estado_fam;
    }
} 