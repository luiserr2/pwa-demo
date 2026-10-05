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
import { EstadoZona, SubsistemaZona } from '../../shared/catalogo-zonas';

export { EstadoZona, SubsistemaZona };

/**
 * Las columnas `estado` y `subsistema` se mantienen como varchar (no enum nativo de Postgres)
 * para que `synchronize` no falle al convertir filas heredadas con valores 'OK'.
 * El dominio válido se garantiza con Zod + ZonaService.
 */
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

  @Column({ type: 'varchar', length: 20, default: EstadoZona.NORMAL })
  estado: EstadoZona;

  @Column({ type: 'varchar', length: 30, nullable: true })
  subsistema: SubsistemaZona | null;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
