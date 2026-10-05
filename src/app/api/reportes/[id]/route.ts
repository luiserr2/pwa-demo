import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { ReporteService } from '@/server/services/reporte.service';
import { verificarPermisosAPI } from '@/server/security/guard';
import { esUuid } from '@/server/security/actor';
import { RolUsuario } from '@/server/types/roles';
import { respuestaError } from '@/server/http/respuestas';
import { manejarCambioEstado } from '@/server/http/cambiar-estado.handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.SUPERVISOR, RolUsuario.ADMIN]);
  if (!guard.autorizado) {
    return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  if (!esUuid(params.id)) {
    return NextResponse.json({ ok: false, error: 'El identificador del reporte no es un UUID válido.' }, { status: 400 });
  }

  try {
    const ds = await getDataSource();
    const service = new ReporteService(ds);
    const reporte = await service.obtenerReportePorId(params.id);

    if (!reporte) {
      return NextResponse.json({ ok: false, error: 'Reporte no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: reporte });
  } catch (error) {
    return respuestaError(error, `API Reporte ${params.id} GET`);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return manejarCambioEstado(req, params.id);
}
