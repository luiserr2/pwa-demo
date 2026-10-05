import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Radiobase } from './Radiobase';
import { EvidenciaFotografica } from './EvidenciaFotografica';
import { ZonaMatriz } from './ZonaMatriz';
import { EquipoInstalado } from './EquipoInstalado';
import { EstadoReporte } from '../../shared/flujo-reporte';

// El enum vive en src/shared para que el cliente lo consuma sin arrastrar TypeORM.
export { EstadoReporte };

@Entity('reportes')
@Index(['estado', 'createdAt'])
@Index(['tecnicoId', 'estado'])
export class Reporte {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  codigo: string;

  @Column({
    type: 'enum',
    enum: EstadoReporte,
    default: EstadoReporte.SIN_EMPEZAR,
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

  @Column({ name: 'hash_sha256', type: 'varchar', length: 64, nullable: true })
  hashSha256: string | null;

  @Column({ name: 'firma_digital', type: 'text', nullable: true })
  firmaDigital: string | null;

  // ── Fase ENVIADO_AL_CLIENTE ─────────────────────────────────────
  @Column({ name: 'canal_radicacion', type: 'varchar', length: 50, nullable: true })
  canalRadicacion: string | null;

  @Column({ name: 'numero_ticket_cliente', type: 'varchar', length: 100, nullable: true })
  numeroTicketCliente: string | null;

  @Column({ name: 'fecha_envio_cliente', type: 'timestamp', nullable: true })
  fechaEnvioCliente: Date | null;

  // ── Fase VISADO ─────────────────────────────────────────────────
  @Column({ name: 'fecha_visado', type: 'timestamp', nullable: true })
  fechaVisado: Date | null;

  @Column({ name: 'bloqueado_edicion', type: 'boolean', default: false })
  bloqueadoEdicion: boolean;

  // ── Fase HES_SOLICITADA ─────────────────────────────────────────
  @Index()
  @Column({ name: 'numero_hes', type: 'varchar', length: 100, nullable: true })
  numeroHes: string | null;

  @Column({ name: 'fecha_hes', type: 'timestamp', nullable: true })
  fechaHes: Date | null;

  // ── Fase OBSERVADO ──────────────────────────────────────────────
  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo: string | null;

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
