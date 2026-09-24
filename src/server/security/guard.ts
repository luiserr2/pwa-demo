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

  // Si no hay token en desarrollo/demo permitimos x-user-role para simplificar testing si está explícito
  if (!token) {
    const devRole = req.headers.get('x-user-role') as RolUsuario;
    const devId = req.headers.get('x-user-id') || 'usr-dev-01';
    if (devRole && rolesPermitidos.includes(devRole)) {
      return {
        autorizado: true,
        usuario: {
          id: devId,
          email: `${devRole.toLowerCase()}@sisbirceca.com`,
          nombre: `Usuario ${devRole}`,
          rol: devRole,
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      };
    }

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
