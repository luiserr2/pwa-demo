import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generarTokenSesion } from '@/server/security/auth-token';
import { RolUsuario, User } from '@/server/entities/User';
import { getDataSource } from '@/server/db/data-source';
import { respuestaError } from '@/server/http/respuestas';

/** Correos de las cuentas homologadas por rol (sembradas por src/server/db/seed.ts). */
const EMAIL_POR_ROL: Record<RolUsuario, string> = {
  [RolUsuario.TECNICO]: 'tecnico@sisbirceca.com',
  [RolUsuario.SUPERVISOR]: 'supervisor@sisbirceca.com',
  [RolUsuario.ADMIN]: 'admin@sisbirceca.com',
};

const SesionSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().optional(),
    rol: z.nativeEnum(RolUsuario).optional(),
  })
  .refine((d) => !!d.email || !!d.rol, { message: 'Debe indicar email o rol.' });

/**
 * Emite la sesión para un usuario REAL de la tabla `usuarios`.
 * El token transporta el UUID persistido: todas las FK (tecnico_id, usuario_id de auditoría) quedan íntegras.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Cuerpo de la petición inválido.' }, { status: 400 });
  }

  const validado = SesionSchema.safeParse(body);
  if (!validado.success) {
    return NextResponse.json(
      { ok: false, error: validado.error.errors[0]?.message ?? 'Credenciales inválidas.' },
      { status: 400 }
    );
  }

  try {
    const { email, rol } = validado.data;
    const ds = await getDataSource();
    const repo = ds.getRepository(User);

    const emailObjetivo = email ?? (rol ? EMAIL_POR_ROL[rol] : undefined);
    const usuario = emailObjetivo ? await repo.findOneBy({ email: emailObjetivo }) : null;

    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { ok: false, error: 'Usuario no registrado o inactivo. Ejecute el seed o solicite alta al administrador.' },
        { status: 401 }
      );
    }

    const datosSesion = { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol };
    const token = generarTokenSesion(datosSesion);

    const res = NextResponse.json({ ok: true, data: { token, usuario: datosSesion } });
    res.cookies.set('sisbirceca_auth', token, {
      path: '/',
      httpOnly: false, // Accesible por middleware y cliente
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
    });
    return res;
  } catch (error) {
    return respuestaError(error, 'API Sesión');
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, message: 'Sesión finalizada.' });
  res.cookies.set('sisbirceca_auth', '', { path: '/', maxAge: 0 });
  return res;
}
