import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum RolUsuario {
  TECNICO = 'TECNICO',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 30 })
  cedula: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    default: RolUsuario.TECNICO,
  })
  rol: RolUsuario;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
