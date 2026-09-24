import { DataSource, Repository } from 'typeorm';
import { User, RolUsuario } from '../entities/User';

export interface CrearUsuarioDTO {
  email: string;
  nombre: string;
  cedula: string;
  rol: RolUsuario;
}

export class UserService {
  constructor(private dataSource: DataSource) {}

  private get repo(): Repository<User> {
    return this.dataSource.getRepository(User);
  }

  async listarUsuarios(filtro?: { rol?: RolUsuario; activo?: boolean }): Promise<User[]> {
    const qb = this.repo.createQueryBuilder('u').orderBy('u.nombre', 'ASC');

    if (filtro?.rol) {
      qb.andWhere('u.rol = :rol', { rol: filtro.rol });
    }

    if (filtro?.activo !== undefined) {
      qb.andWhere('u.activo = :activo', { activo: filtro.activo });
    }

    return await qb.getMany();
  }

  async obtenerPorId(id: string): Promise<User | null> {
    return await this.repo.findOneBy({ id });
  }

  async obtenerPorEmail(email: string): Promise<User | null> {
    return await this.repo.findOneBy({ email: email.trim().toLowerCase() });
  }

  async crearUsuario(dto: CrearUsuarioDTO): Promise<User> {
    const emailNorm = dto.email.trim().toLowerCase();
    const existe = await this.obtenerPorEmail(emailNorm);
    if (existe) {
      throw new Error(`El correo '${emailNorm}' ya está registrado.`);
    }

    const user = this.repo.create({
      email: emailNorm,
      nombre: dto.nombre.trim(),
      cedula: dto.cedula.trim(),
      rol: dto.rol,
      activo: true,
    });

    return await this.repo.save(user);
  }

  async eliminarUsuario(id: string): Promise<boolean> {
    const user = await this.obtenerPorId(id);
    if (!user) {
      throw new Error(`Usuario con ID '${id}' no encontrado.`);
    }
    await this.repo.remove(user);
    return true;
  }

  async alternarEstado(id: string): Promise<User> {
    const user = await this.obtenerPorId(id);
    if (!user) {
      throw new Error(`Usuario con ID '${id}' no encontrado.`);
    }
    user.activo = !user.activo;
    return await this.repo.save(user);
  }
}
