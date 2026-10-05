import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Bitácora inmutable de eventos del flujo operativo.
 * Cada registro encadena su hash con el anterior (hashPrevio en `detalles`) formando una cadena verificable.
 */
@Entity('auditoria_eventos')
@Index(['createdAt'])
@Index(['reporteId', 'createdAt'])
export class AuditoriaEvento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporte_id', type: 'uuid', nullable: true })
  reporteId: string | null;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @Column({ name: 'tipo_evento', type: 'varchar', length: 60 })
  tipoEvento: string;

  @Column({ name: 'estado_anterior', type: 'varchar', length: 40, nullable: true })
  estadoAnterior: string | null;

  @Column({ name: 'estado_nuevo', type: 'varchar', length: 40, nullable: true })
  estadoNuevo: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  detalles: Record<string, unknown>;

  @Column({ name: 'hash_sha256', type: 'varchar', length: 64 })
  hashSha256: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
