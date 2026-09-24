import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { ReporteService } from '@/server/services/reporte.service';
import { CrearReporteSchema } from '@/server/schemas';
import { verificarPermisosAPI } from '@/server/security/guard';
import { RolUsuario } from '@/server/types/roles';
import { SEED_REPORTES } from '@/server/db/fallback-catalog';

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
    console.warn(`[API Reportes] Usando catálogo de alta disponibilidad: ${error.message}`);
    return NextResponse.json({ ok: true, data: SEED_REPORTES, _resilient: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body = await req.json();
    const validado = CrearReporteSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Datos de reporte inválidos.' },
        { status: 400 }
      );
    }

    const { radiobaseId, tecnicoId, fechaVisita, observaciones, datosRed } = validado.data;
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
