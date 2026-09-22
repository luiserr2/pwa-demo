import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { ReporteService } from '@/server/services/reporte.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado') as any;
    const tecnicoId = searchParams.get('tecnicoId') || undefined;

    const ds = await getDataSource();
    const service = new ReporteService(ds);
    const reportes = await service.listarReportes({ estado, tecnicoId });

    return NextResponse.json({ ok: true, data: reportes });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al listar reportes.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { radiobaseId, tecnicoId, fechaVisita, observaciones, datosRed } = body;

    if (!radiobaseId || !tecnicoId) {
      return NextResponse.json(
        { ok: false, error: 'Campos radiobaseId y tecnicoId son obligatorios.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const service = new ReporteService(ds);
    const nuevoReporte = await service.crearReporte({
      radiobaseId,
      tecnicoId,
      fechaVisita: fechaVisita ? new Date(fechaVisita) : undefined,
      observaciones,
      datosRed,
    });

    return NextResponse.json({ ok: true, data: nuevoReporte }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al crear reporte.' },
      { status: 400 }
    );
  }
}
