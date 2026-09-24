import { NextRequest, NextResponse } from 'next/server';
import { generarTokenSesion } from '@/server/security/auth-token';
import { RolUsuario, User } from '@/server/entities/User';
import { getDataSource } from '@/server/db/data-source';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, rol } = body;

    const DEFAULT_USERS: Record<string, any> = {
      TECNICO: { id: 'usr-tec-01', email: 'tecnico@sisbirceca.com', nombre: 'Gerson Martínez', rol: RolUsuario.TECNICO },
      SUPERVISOR: { id: 'usr-sup-01', email: 'supervisor@sisbirceca.com', nombre: 'Ing. Roberto Silva', rol: RolUsuario.SUPERVISOR },
      ADMIN: { id: 'usr-adm-01', email: 'admin@sisbirceca.com', nombre: 'Lic. Mariana Fernández', rol: RolUsuario.ADMIN },
    };

    let userToAuth = null;
    if (rol && DEFAULT_USERS[rol]) {
      userToAuth = DEFAULT_USERS[rol];
    } else if (email) {
      const emailLower = email.trim().toLowerCase();
      userToAuth = Object.values(DEFAULT_USERS).find((u) => u.email.toLowerCase() === emailLower) || null;
    }

    // Si es un usuario custom fuera de los 3 homologados, consultar TypeORM
    if (!userToAuth) {
      try {
        const ds = await getDataSource();
        const userRepo = ds.getRepository(User);
        if (email) {
          userToAuth = await userRepo.findOneBy({ email: email.trim().toLowerCase() });
        } else if (rol) {
          userToAuth = await userRepo.findOneBy({ rol });
        }
      } catch {
        // Fallback resiliente
      }
    }

    if (!userToAuth) {
      userToAuth = DEFAULT_USERS[rol] || DEFAULT_USERS.ADMIN;
    }

    const token = generarTokenSesion(userToAuth);

    const res = NextResponse.json({
      ok: true,
      data: {
        token,
        usuario: userToAuth,
      },
    });

    res.cookies.set('sisbirceca_auth', token, {
      path: '/',
      httpOnly: false, // Accesible por middleware y cliente
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al iniciar sesión.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, message: 'Sesión finalizada.' });
  res.cookies.set('sisbirceca_auth', '', { path: '/', maxAge: 0 });
  return res;
}
