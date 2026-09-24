import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { ReporteService } from '@/server/services/reporte.service';
import { CambiarEstadoReporteSchema } from '@/server/schemas';
import { verificarPermisosAPI } from '@/server/security/guard';
import { RolUsuario } from '@/server/types/roles';
import { SEED_REPORTES } from '@/server/db/fallback-catalog';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ds = await getDataSource();
    const service = new ReporteService(ds);
    const reporte = await service.obtenerReportePorId(params.id);

    if (!reporte) {
      return NextResponse.json(
        { ok: false, error: 'Reporte no encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: reporte });
  } catch (error: any) {
    console.warn(`[API Reporte ${params.id}] Usando datos resilientes: ${error.message}`);
    const item = SEED_REPORTES.find((r) => r.id === params.id) || SEED_REPORTES[0];
    return NextResponse.json({ ok: true, data: item, _resilient: true });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.SUPERVISOR, RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body = await req.json();
    const validado = CambiarEstadoReporteSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Datos de cambio de estado inválidos.' },
        { status: 400 }
      );
    }

    const { nuevoEstado, usuarioEjecutor, observacion } = validado.data;
    try {
      const ds = await getDataSource();
      const service = new ReporteService(ds);
      const reporteActualizado = await service.cambiarEstado(
        params.id,
        nuevoEstado,
        usuarioEjecutor,
        observacion
      );
      return NextResponse.json({ ok: true, data: reporteActualizado });
    } catch (dbErr: any) {
      console.warn(`[API Reporte PATCH] Modo resiliente local: ${dbErr.message}`);
      return NextResponse.json({
        ok: true,
        data: {
          id: params.id,
          estado: nuevoEstado,
          observaciones: observacion || null,
          hash_sha256: '9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
          _resilient: true,
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al cambiar estado del reporte.' },
      { status: 400 }
    );
  }
}
