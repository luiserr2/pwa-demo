import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { ReporteService } from '@/server/services/reporte.service';

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
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al obtener reporte.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { nuevoEstado, usuarioEjecutor, observacion } = body;

    if (!nuevoEstado || !usuarioEjecutor) {
      return NextResponse.json(
        { ok: false, error: 'Campos nuevoEstado y usuarioEjecutor son obligatorios.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const service = new ReporteService(ds);
    const reporteActualizado = await service.cambiarEstado(
      params.id,
      nuevoEstado,
      usuarioEjecutor,
      observacion
    );

    return NextResponse.json({ ok: true, data: reporteActualizado });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al cambiar estado del reporte.' },
      { status: 400 }
    );
  }
}
