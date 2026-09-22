import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import type { Reporte } from './Reporte';

@Entity('zonas_matriz')
@Unique(['reporteId', 'numeroZona'])
export class ZonaMatriz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporte_id', type: 'uuid' })
  reporteId: string;

  @ManyToOne('Reporte', 'zonas', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporte_id' })
  reporte: Reporte;

  @Column({ name: 'numero_zona', type: 'int' })
  numeroZona: number;

  @Column({ type: 'varchar', length: 150, default: '' })
  descripcion: string;

  @Column({ type: 'varchar', length: 50, default: 'OK' })
  estado: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
