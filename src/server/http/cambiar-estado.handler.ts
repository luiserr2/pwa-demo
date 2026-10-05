import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '../db/data-source';
import { CambiarEstadoReporteSchema } from '../schemas';
import { verificarPermisosAPI } from '../security/guard';
import { resolverActorPersistido, esUuid } from '../security/actor';
import { RolUsuario } from '../types/roles';
import { ReporteService } from '../services/reporte.service';
import { obtenerIpCliente, respuestaError } from './respuestas';

/**
 * Handler único de transición de estado. Lo comparten:
 *   PATCH /api/reportes/[id]
 *   PATCH /api/reportes/[id]/estado
 * La identidad del ejecutor sale de la sesión y se resuelve contra la tabla `usuarios`.
 */
export async function manejarCambioEstado(req: NextRequest, reporteId: string): Promise<NextResponse> {
  const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.SUPERVISOR, RolUsuario.ADMIN]);
  if (!guard.autorizado || !guard.usuario) {
    return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  if (!esUuid(reporteId)) {
    return NextResponse.json({ ok: false, error: 'El identificador del reporte no es un UUID válido.' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'El cuerpo de la petición no es JSON válido.' }, { status: 400 });
  }

  const validado = CambiarEstadoReporteSchema.safeParse(body);
  if (!validado.success) {
    return NextResponse.json(
      { ok: false, error: validado.error.errors[0]?.message || 'Datos de cambio de estado inválidos.' },
      { status: 400 }
    );
  }

  try {
    const ds = await getDataSource();
    const actor = await resolverActorPersistido(ds, guard.usuario);
    const datos = validado.data;

    // El cliente puede declarar el ejecutor, pero jamás suplantar a otro usuario o rol.
    if (datos.usuarioEjecutor) {
      const coincideId = datos.usuarioEjecutor.id === actor.id || datos.usuarioEjecutor.id === guard.usuario.id;
      if (!coincideId || datos.usuarioEjecutor.rol !== actor.rol) {
        return NextResponse.json(
          { ok: false, error: 'El usuario ejecutor declarado no coincide con la sesión activa.' },
          { status: 403 }
        );
      }
    }

    const service = new ReporteService(ds);
    const reporte = await service.cambiarEstado(
      reporteId,
      datos.nuevoEstado,
      { id: actor.id, rol: actor.rol },
      datos.observacion,
      {
        motivoRechazo: datos.motivoRechazo,
        canalRadicacion: datos.canalRadicacion,
        numeroTicketCliente: datos.numeroTicketCliente,
        numeroHes: datos.numeroHes,
        fechaHes: datos.fechaHes ? new Date(datos.fechaHes) : undefined,
        ip: obtenerIpCliente(req),
      }
    );

    const { evidencias: _evidencias, zonas: _zonas, ...resumen } = reporte;
    return NextResponse.json({ ok: true, data: resumen });
  } catch (error) {
    return respuestaError(error, `API Reporte ${reporteId} PATCH estado`);
  }
}
