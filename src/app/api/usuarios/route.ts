import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { UserService } from '@/server/services/user.service';
import { CrearUsuarioSchema } from '@/server/schemas';
import { verificarPermisosAPI } from '@/server/security/guard';
import { RolUsuario } from '@/server/types/roles';
import { respuestaError } from '@/server/http/respuestas';
import { esUuid } from '@/server/security/actor';

function esRolUsuario(valor: string | null): valor is RolUsuario {
  return valor !== null && (Object.values(RolUsuario) as string[]).includes(valor);
}

function extraerId(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && 'id' in body) {
    const id = (body as { id?: unknown }).id;
    return typeof id === 'string' ? id : null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.SUPERVISOR, RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const { searchParams } = new URL(req.url);
    const rolParam = searchParams.get('rol');
    if (rolParam !== null && !esRolUsuario(rolParam)) {
      return NextResponse.json({ ok: false, error: `Rol '${rolParam}' no reconocido.` }, { status: 400 });
    }

    const ds = await getDataSource();
    const service = new UserService(ds);
    const lista = await service.listarUsuarios({ rol: rolParam ?? undefined });

    return NextResponse.json({ ok: true, data: lista });
  } catch (error: unknown) {
    return respuestaError(error, 'API Usuarios GET');
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body: unknown = await req.json();
    const validado = CrearUsuarioSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Datos de usuario inválidos.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const service = new UserService(ds);
    const nuevo = await service.crearUsuario(validado.data);
    return NextResponse.json({ ok: true, data: nuevo }, { status: 201 });
  } catch (error: unknown) {
    return respuestaError(error, 'API Usuarios POST');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || !esUuid(id)) {
      return NextResponse.json({ ok: false, error: 'ID de usuario requerido (UUID).' }, { status: 400 });
    }

    const ds = await getDataSource();
    const service = new UserService(ds);
    await service.eliminarUsuario(id);

    return NextResponse.json({ ok: true, message: 'Usuario eliminado exitosamente.' });
  } catch (error: unknown) {
    return respuestaError(error, 'API Usuarios DELETE');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body: unknown = await req.json();
    const id = extraerId(body);
    if (!id || !esUuid(id)) {
      return NextResponse.json({ ok: false, error: 'ID de usuario requerido (UUID).' }, { status: 400 });
    }

    const ds = await getDataSource();
    const service = new UserService(ds);
    const modificado = await service.alternarEstado(id);
    return NextResponse.json({ ok: true, data: modificado });
  } catch (error: unknown) {
    return respuestaError(error, 'API Usuarios PATCH');
  }
}
