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

export enum MomentoFoto {
  ANTES = 'ANTES',
  DESPUES = 'DESPUES',
}

export enum EstadoValidacionVisual {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('evidencias_fotograficas')
@Unique(['reporteId', 'tipoEquipo', 'slotNumero', 'momento'])
export class EvidenciaFotografica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporte_id', type: 'uuid' })
  reporteId: string;

  @ManyToOne('Reporte', 'evidencias', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporte_id' })
  reporte: Reporte;

  @Column({ name: 'tipo_equipo', type: 'varchar', length: 50 })
  tipoEquipo: string;

  @Column({ name: 'slot_numero', type: 'int' })
  slotNumero: number;

  @Column({
    type: 'enum',
    enum: MomentoFoto,
  })
  momento: MomentoFoto;

  @Column({ name: 'url_imagen', type: 'text' })
  urlImagen: string;

  @Column({
    name: 'estado_validacion',
    type: 'enum',
    enum: EstadoValidacionVisual,
    default: EstadoValidacionVisual.PENDIENTE,
  })
  estadoValidacion: EstadoValidacionVisual;

  @Column({ name: 'observacion_rechazo', type: 'text', nullable: true })
  observacionRechazo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
