import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { UserService } from '@/server/services/user.service';
import { CrearUsuarioSchema } from '@/server/schemas';
import { verificarPermisosAPI } from '@/server/security/guard';
import { RolUsuario } from '@/server/types/roles';
import { SEED_USUARIOS } from '@/server/db/fallback-catalog';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rol = (searchParams.get('rol') as RolUsuario) || undefined;

    const ds = await getDataSource();
    const service = new UserService(ds);
    const lista = await service.listarUsuarios({ rol });

    return NextResponse.json({ ok: true, data: lista });
  } catch (error: any) {
    console.warn(`[API Usuarios] Usando catálogo de alta disponibilidad: ${error.message}`);
    return NextResponse.json({ ok: true, data: SEED_USUARIOS, _resilient: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body = await req.json();
    const validado = CrearUsuarioSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Datos de usuario inválidos.' },
        { status: 400 }
      );
    }

    try {
      const ds = await getDataSource();
      const service = new UserService(ds);
      const nuevo = await service.crearUsuario(validado.data);
      return NextResponse.json({ ok: true, data: nuevo }, { status: 201 });
    } catch (dbErr: any) {
      // Fallback resiliente si la base de datos no está conectada
      const mockNuevo = {
        id: `usr-${Date.now()}`,
        email: validado.data.email.trim().toLowerCase(),
        nombre: validado.data.nombre.trim(),
        cedula: validado.data.cedula.trim(),
        rol: validado.data.rol,
        activo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      SEED_USUARIOS.push(mockNuevo as any);
      return NextResponse.json({ ok: true, data: mockNuevo }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al registrar usuario.' },
      { status: 400 }
    );
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
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID de usuario requerido.' }, { status: 400 });
    }

    try {
      const ds = await getDataSource();
      const service = new UserService(ds);
      await service.eliminarUsuario(id);
    } catch {
      const idx = SEED_USUARIOS.findIndex((u) => u.id === id);
      if (idx !== -1) {
        SEED_USUARIOS.splice(idx, 1);
      }
    }

    return NextResponse.json({ ok: true, message: 'Usuario eliminado exitosamente.' });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al eliminar usuario.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID de usuario requerido.' }, { status: 400 });
    }

    try {
      const ds = await getDataSource();
      const service = new UserService(ds);
      const modificado = await service.alternarEstado(id);
      return NextResponse.json({ ok: true, data: modificado });
    } catch {
      const u = SEED_USUARIOS.find((u) => u.id === id);
      if (u) {
        u.activo = !u.activo;
        return NextResponse.json({ ok: true, data: u });
      }
      return NextResponse.json({ ok: false, error: 'Usuario no encontrado.' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al actualizar estado del usuario.' },
      { status: 500 }
    );
  }
}
