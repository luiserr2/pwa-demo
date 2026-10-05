import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { ReporteService } from '@/server/services/reporte.service';
import { CrearReporteSchema } from '@/server/schemas';
import { verificarPermisosAPI } from '@/server/security/guard';
import { resolverActorPersistido, esUuid } from '@/server/security/actor';
import { RolUsuario } from '@/server/types/roles';
import { respuestaError, obtenerIpCliente } from '@/server/http/respuestas';
import { esEstadoReporte } from '@/shared/flujo-reporte';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.SUPERVISOR, RolUsuario.ADMIN]);
  if (!guard.autorizado) {
    return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const estadoParam = searchParams.get('estado');
  const tecnicoId = searchParams.get('tecnicoId');
  const radiobaseId = searchParams.get('radiobaseId');

  if (estadoParam && !esEstadoReporte(estadoParam)) {
    return NextResponse.json({ ok: false, error: `Estado '${estadoParam}' inválido.` }, { status: 400 });
  }
  if ((tecnicoId && !esUuid(tecnicoId)) || (radiobaseId && !esUuid(radiobaseId))) {
    return NextResponse.json({ ok: false, error: 'tecnicoId / radiobaseId deben ser UUID válidos.' }, { status: 400 });
  }

  try {
    const ds = await getDataSource();
    const service = new ReporteService(ds);
    const reportes = await service.listarReportes({
      estado: estadoParam && esEstadoReporte(estadoParam) ? estadoParam : undefined,
      tecnicoId: tecnicoId ?? undefined,
      radiobaseId: radiobaseId ?? undefined,
    });

    return NextResponse.json({ ok: true, data: reportes });
  } catch (error) {
    return respuestaError(error, 'API Reportes GET');
  }
}

export async function POST(req: NextRequest) {
  const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.SUPERVISOR, RolUsuario.ADMIN]);
  if (!guard.autorizado || !guard.usuario) {
    return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();
    const validado = CrearReporteSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Datos de reporte inválidos.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const actor = await resolverActorPersistido(ds, guard.usuario);
    const { radiobaseId, tecnicoId, fechaVisita, observaciones, datosRed } = validado.data;

    // Un técnico solo puede abrir expedientes a su propio nombre.
    if (actor.rol === RolUsuario.TECNICO && tecnicoId !== actor.id) {
      return NextResponse.json(
        { ok: false, error: 'Un técnico solo puede crear reportes asignados a sí mismo.' },
        { status: 403 }
      );
    }

    const service = new ReporteService(ds);
    const nuevoReporte = await service.crearReporte({
      radiobaseId,
      tecnicoId,
      creadoPorId: actor.id,
      fechaVisita: fechaVisita ? new Date(fechaVisita) : undefined,
      observaciones,
      datosRed,
      ip: obtenerIpCliente(req),
    });

    return NextResponse.json({ ok: true, data: nuevoReporte }, { status: 201 });
  } catch (error) {
    return respuestaError(error, 'API Reportes POST');
  }
}
