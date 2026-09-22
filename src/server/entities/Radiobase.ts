import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('radiobases')
export class Radiobase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'varchar', length: 50, default: '4G / 5G LTE' })
  tecnologia: string;

  @Column({ type: 'varchar', length: 100, default: 'Mástil Autosoportado' })
  tipoTorre: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
