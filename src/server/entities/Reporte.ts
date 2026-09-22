import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Radiobase } from './Radiobase';
import { EvidenciaFotografica } from './EvidenciaFotografica';
import { ZonaMatriz } from './ZonaMatriz';
import { EquipoInstalado } from './EquipoInstalado';

export enum EstadoReporte {
  BORRADOR = 'BORRADOR',
  EN_REVISION = 'EN_REVISION',
  OBSERVADO = 'OBSERVADO',
  APROBADO = 'APROBADO',
}

@Entity('reportes')
export class Reporte {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  codigo: string;

  @Column({
    type: 'enum',
    enum: EstadoReporte,
    default: EstadoReporte.BORRADOR,
  })
  estado: EstadoReporte;

  @Column({ name: 'radiobase_id', type: 'uuid' })
  radiobaseId: string;

  @ManyToOne(() => Radiobase)
  @JoinColumn({ name: 'radiobase_id' })
  radiobase: Radiobase;

  @Column({ name: 'tecnico_id', type: 'uuid' })
  tecnicoId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: User;

  @Column({ name: 'supervisor_id', type: 'uuid', nullable: true })
  supervisorId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: User | null;

  @Column({ name: 'fecha_visita', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaVisita: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ name: 'datos_red', type: 'jsonb', nullable: true })
  datosRed: {
    ipWan?: string;
    ipLan?: string;
    gateway?: string;
    mascara?: string;
    vlanId?: string;
    dns1?: string;
    dns2?: string;
  } | null;

  @OneToMany(() => EvidenciaFotografica, (evidencia) => evidencia.reporte, { cascade: true })
  evidencias: EvidenciaFotografica[];

  @OneToMany(() => ZonaMatriz, (zona) => zona.reporte, { cascade: true })
  zonas: ZonaMatriz[];

  @OneToMany(() => EquipoInstalado, (equipo) => equipo.reporte, { cascade: true })
  equipos: EquipoInstalado[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
