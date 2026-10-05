import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDataSource } from '@/server/db/data-source';
import { verificarPermisosAPI } from '@/server/security/guard';
import { resolverActorPersistido, esUuid } from '@/server/security/actor';
import { RolUsuario } from '@/server/types/roles';
import { respuestaError, obtenerIpCliente } from '@/server/http/respuestas';
import {
  AuditoriaService,
  TIPOS_EVENTO_AUDITORIA,
  type EventoAuditoriaVista,
} from '@/server/services/auditoria.service';

export const dynamic = 'force-dynamic';

/** Contrato público consumido por /admin/auditoria. */
export type AuditEvent = EventoAuditoriaVista;

const RegistrarEventoSchema = z.object({
  tipo: z.enum(TIPOS_EVENTO_AUDITORIA, { errorMap: () => ({ message: 'Tipo de evento inválido.' }) }),
  severidad: z.enum(['INFO', 'ADVERTENCIA', 'CRITICO']).default('INFO'),
  descripcion: z.string().trim().min(3).max(1000),
  reporteId: z.string().uuid().nullable().optional(),
  ubicacion: z.string().trim().max(200).optional(),
  metadatos: z.record(z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN, RolUsuario.SUPERVISOR]);
  if (!guard.autorizado) {
    return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limiteParam = searchParams.get('limite');
  const reporteIdParam = searchParams.get('reporteId');
  if (reporteIdParam !== null && !esUuid(reporteIdParam)) {
    return NextResponse.json({ ok: false, error: 'reporteId debe ser un UUID válido.' }, { status: 400 });
  }

  try {
    const ds = await getDataSource();
    const service = new AuditoriaService(ds);
    const resultado = await service.listar({
      tipo: searchParams.get('tipo'),
      severidad: searchParams.get('severidad'),
      q: searchParams.get('q'),
      reporteId: reporteIdParam,
      limite: limiteParam ? parseInt(limiteParam, 10) : undefined,
    });

    return NextResponse.json({
      ok: true,
      data: resultado.eventos,
      stats: {
        totalEventos: resultado.totalEventos,
        eventosCriticos: resultado.eventosCriticos,
        sellosVerificados: resultado.totalEventos - resultado.eslabonesRotos,
        eslabonesRotos: resultado.eslabonesRotos,
        cadenaValida: resultado.cadenaValida,
        ultimoHash: resultado.ultimoHash,
        algoritmo: 'SHA-256 encadenado (append-only)',
      },
    });
  } catch (error) {
    return respuestaError(error, 'API Auditoría GET');
  }
}

export async function POST(req: NextRequest) {
  const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN, RolUsuario.SUPERVISOR]);
  if (!guard.autorizado || !guard.usuario) {
    return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();
    const validado = RegistrarEventoSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message ?? 'Evento de auditoría inválido.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const actor = await resolverActorPersistido(ds, guard.usuario);
    const service = new AuditoriaService(ds);
    const datos = validado.data;

    const evento = await ds.transaction((manager) =>
      service.registrar(manager, {
        reporteId: datos.reporteId && esUuid(datos.reporteId) ? datos.reporteId : null,
        usuarioId: actor.id,
        tipoEvento: datos.tipo,
        severidad: datos.severidad,
        descripcion: datos.descripcion,
        ip: obtenerIpCliente(req),
        detalles: {
          ...(datos.metadatos ?? {}),
          ...(datos.ubicacion ? { ubicacion: datos.ubicacion } : {}),
        },
      })
    );

    return NextResponse.json(
      { ok: true, data: evento, message: 'Evento auditado y encadenado.' },
      { status: 201 }
    );
  } catch (error) {
    return respuestaError(error, 'API Auditoría POST');
  }
}
