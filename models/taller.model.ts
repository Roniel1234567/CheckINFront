import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('talleres')
export class Taller {
    @PrimaryGeneratedColumn()
    id_taller: number;

    @Column()
    nombre_taller: string;

    @Column()
    familia_taller: string;

    @Column()
    cod_titulo_taller: string;

    @Column()
    horaspas_taller: number;

    @Column({ default: 'Activo' })
    estado_taller: string;
} 