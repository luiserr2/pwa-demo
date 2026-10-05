import { NextRequest, NextResponse } from 'next/server';
import { verificarTokenSesion, UserPayload } from './auth-token';
import { RolUsuario } from '../entities/User';

export interface GuardResult {
  autorizado: boolean;
  usuario?: UserPayload;
  response?: NextResponse;
}

/**
 * Verifica la autenticación y los permisos por rol de la petición entrante.
 * Acepta cabecera Authorization Bearer o cookie sisbirceca_auth.
 */
export function verificarPermisosAPI(req: NextRequest, rolesPermitidos: RolUsuario[]): GuardResult {
  let token: string | null = null;

  // 1. Buscar en Authorization Bearer
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Buscar en cookies
  if (!token) {
    const cookieToken = req.cookies.get('sisbirceca_auth')?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  // Sin token no hay acceso. (Se eliminó el bypass por cabecera x-user-role: permitía
  // a cualquier cliente autoproclamarse ADMIN sin sesión firmada.)
  if (!token) {
    return {
      autorizado: false,
      response: NextResponse.json(
        { ok: false, error: 'Acceso no autorizado: Se requiere sesión activa.' },
        { status: 401 }
      ),
    };
  }

  const usuario = verificarTokenSesion(token);
  if (!usuario) {
    return {
      autorizado: false,
      response: NextResponse.json(
        { ok: false, error: 'Sesión expirada o token criptográfico inválido.' },
        { status: 401 }
      ),
    };
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    return {
      autorizado: false,
      response: NextResponse.json(
        { ok: false, error: `Permisos insuficientes: El rol '${usuario.rol}' no tiene acceso a este recurso.` },
        { status: 403 }
      ),
    };
  }

  return { autorizado: true, usuario };
}
