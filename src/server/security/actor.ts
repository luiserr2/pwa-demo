import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { RolUsuario } from '../types/roles';
import type { UserPayload } from './auth-token';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function esUuid(valor: string | null | undefined): valor is string {
  return typeof valor === 'string' && UUID_REGEX.test(valor);
}

export interface ActorPersistido {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

export class ActorNoResueltoError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ActorNoResueltoError';
  }
}

/**
 * Traduce la identidad de la sesión (token o cabeceras dev) a un usuario REAL de la tabla `usuarios`.
 * Las sesiones emitidas sin base de datos traen IDs no-UUID ('usr-tec-01'); se resuelven por email.
 * El rol autoritativo es el persistido, nunca el declarado por el cliente.
 */
export async function resolverActorPersistido(
  dataSource: DataSource,
  sesion: Pick<UserPayload, 'id' | 'email' | 'rol'>
): Promise<ActorPersistido> {
  const repo = dataSource.getRepository(User);

  const usuario = esUuid(sesion.id)
    ? await repo.findOneBy({ id: sesion.id })
    : sesion.email
      ? await repo.findOneBy({ email: sesion.email.trim().toLowerCase() })
      : null;

  if (!usuario) {
    throw new ActorNoResueltoError(
      `El usuario de la sesión (${sesion.email || sesion.id}) no existe en la base de datos. Inicie sesión nuevamente.`
    );
  }
  if (!usuario.activo) {
    throw new ActorNoResueltoError('El usuario de la sesión está desactivado.');
  }

  return { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol };
}
