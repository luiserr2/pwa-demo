import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { Reporte } from './Reporte';

@Entity('equipos_instalados')
export class EquipoInstalado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporte_id', type: 'uuid' })
  reporteId: string;

  @ManyToOne('Reporte', 'equipos', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporte_id' })
  reporte: Reporte;

  @Column({ type: 'varchar', length: 150 })
  descripcion: string;

  @Column({ type: 'varchar', length: 150 })
  modelo: string;

  @Column({ type: 'varchar', length: 100 })
  serial: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
