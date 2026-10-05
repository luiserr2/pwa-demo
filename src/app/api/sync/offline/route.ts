import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { SincronizarOfflineSchema } from '@/server/schemas';
import { EvidenciaService } from '@/server/services/evidencia.service';
import { ReporteService } from '@/server/services/reporte.service';
import { ZonaService } from '@/server/services/zona.service';
import { AuditoriaService } from '@/server/services/auditoria.service';
import { verificarPermisosAPI } from '@/server/security/guard';
import { resolverActorPersistido } from '@/server/security/actor';
import { RolUsuario } from '@/server/types/roles';
import { Reporte, EstadoReporte } from '@/server/entities/Reporte';
import { Radiobase } from '@/server/entities/Radiobase';
import { MomentoFoto } from '@/server/entities/EvidenciaFotografica';
import { respuestaError, obtenerIpCliente } from '@/server/http/respuestas';
import { ESTADOS_CONTENIDO_BLOQUEADO } from '@/shared/flujo-reporte';

export const dynamic = 'force-dynamic';

interface EvidenciaRechazada {
  slotNumero: number;
  tipoEquipo: string;
  momento: MomentoFoto;
  motivo: string;
}

/**
 * Sincronización de campo (offline-first). Persiste evidencias y la matriz de 48 zonas
 * del expediente identificado por un UUID generado en el dispositivo.
 * Sin modo "resiliente": si la base de datos falla, el cliente recibe el error y conserva su cola local.
 */
export async function POST(req: NextRequest) {
  const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.ADMIN]);
  if (!guard.autorizado || !guard.usuario) {
    return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'El paquete de sincronización no es JSON válido.' }, { status: 400 });
  }

  const validado = SincronizarOfflineSchema.safeParse(body);
  if (!validado.success) {
    return NextResponse.json(
      { ok: false, error: validado.error.errors[0]?.message || 'Paquete de sincronización offline inválido.' },
      { status: 400 }
    );
  }

  const { reporteId, radiobaseId, radiobaseCodigo, evidencias, zonas } = validado.data;
  const ip = obtenerIpCliente(req);

  try {
    const ds = await getDataSource();
    const actor = await resolverActorPersistido(ds, guard.usuario);

    const radiobase = radiobaseId
      ? await ds.getRepository(Radiobase).findOneBy({ id: radiobaseId })
      : await ds.getRepository(Radiobase).findOneBy({ codigo: radiobaseCodigo?.trim().toUpperCase() });
    if (!radiobase) {
      return NextResponse.json(
        { ok: false, error: `Radiobase '${radiobaseId ?? radiobaseCodigo}' no registrada en el inventario.` },
        { status: 404 }
      );
    }

    const reporteService = new ReporteService(ds);
    const evidenciaService = new EvidenciaService(ds);
    const zonaService = new ZonaService(ds);
    const auditoria = new AuditoriaService(ds);

    // 1. Obtener o crear el expediente con el UUID del dispositivo
    let reporte = await ds.getRepository(Reporte).findOne({
      where: { id: reporteId },
      select: { id: true, codigo: true, estado: true, tecnicoId: true, radiobaseId: true, bloqueadoEdicion: true },
    });
    let creado = false;

    if (!reporte) {
      reporte = await reporteService.crearReporte({
        id: reporteId,
        radiobaseId: radiobase.id,
        tecnicoId: actor.id,
        creadoPorId: actor.id,
        estadoInicial: EstadoReporte.EN_VISITA,
        fechaVisita: new Date(),
        ip,
      });
      creado = true;
    } else {
      if (reporte.bloqueadoEdicion || ESTADOS_CONTENIDO_BLOQUEADO.includes(reporte.estado)) {
        return NextResponse.json(
          { ok: false, error: `El reporte ${reporte.codigo} está visado y bloqueado para edición.` },
          { status: 409 }
        );
      }
      if (actor.rol === RolUsuario.TECNICO && reporte.tecnicoId !== actor.id) {
        return NextResponse.json(
          { ok: false, error: 'Este expediente pertenece a otro técnico.' },
          { status: 403 }
        );
      }
      if (reporte.radiobaseId !== radiobase.id) {
        return NextResponse.json(
          { ok: false, error: `El expediente ${reporte.codigo} corresponde a otra radiobase.` },
          { status: 409 }
        );
      }
      // Primera sincronización de un expediente planificado: la visita arrancó.
      if (reporte.estado === EstadoReporte.SIN_EMPEZAR) {
        reporte = await reporteService.cambiarEstado(reporte.id, EstadoReporte.EN_VISITA, actor, undefined, { ip });
      }
    }

    // 2. Evidencias: ANTES primero para respetar la regla de bloqueo Antes/Después dentro del mismo lote
    const ordenadas = [...evidencias].sort((a, b) =>
      a.momento === b.momento ? a.slotNumero - b.slotNumero : a.momento === MomentoFoto.ANTES ? -1 : 1
    );
    const rechazadas: EvidenciaRechazada[] = [];
    let procesadas = 0;
    for (const item of ordenadas) {
      try {
        await evidenciaService.registrarEvidencia({
          reporteId: reporte.id,
          tipoEquipo: item.tipoEquipo,
          slotNumero: item.slotNumero,
          momento: item.momento,
          urlImagen: item.urlImagen,
        });
        procesadas++;
      } catch (err) {
        rechazadas.push({
          slotNumero: item.slotNumero,
          tipoEquipo: item.tipoEquipo,
          momento: item.momento,
          motivo: err instanceof Error ? err.message : 'Evidencia rechazada.',
        });
      }
    }

    // 3. Matriz de zonas + auditoría atómica
    let cambiosZonas = 0;
    await ds.transaction(async (manager) => {
      if (zonas && zonas.length > 0) {
        const { cambios } = await zonaService.guardarZonasLoteConCambios(reporte.id, zonas, manager);
        cambiosZonas = cambios.length;
        if (cambios.length > 0) {
          await auditoria.registrar(manager, {
            reporteId: reporte.id,
            usuarioId: actor.id,
            tipoEvento: 'CAMBIO_MATRIZ',
            severidad: cambios.some((c) => c.estadoNuevo === 'FALLA') ? 'ADVERTENCIA' : 'INFO',
            descripcion: `Reporte ${reporte.codigo}: ${cambios.length} zona(s) actualizada(s) desde campo.`,
            ip,
            detalles: { cambios },
          });
        }
      }

      if (evidencias.length > 0) {
        await auditoria.registrar(manager, {
          reporteId: reporte.id,
          usuarioId: actor.id,
          tipoEvento: 'SINCRONIZACION_CAMPO',
          severidad: rechazadas.length > 0 ? 'ADVERTENCIA' : 'INFO',
          descripcion: `Reporte ${reporte.codigo}: ${procesadas} de ${evidencias.length} evidencias sincronizadas.`,
          ip,
          detalles: {
            evidenciasProcesadas: procesadas,
            evidenciasRechazadas: rechazadas.map(({ slotNumero, momento, motivo }) => ({ slotNumero, momento, motivo })),
          },
        });
      }
    });

    return NextResponse.json({
      ok: true,
      data: {
        reporteId: reporte.id,
        codigo: reporte.codigo,
        estado: reporte.estado,
        creado,
        evidenciasProcesadas: procesadas,
        totalEvidenciasEnviadas: evidencias.length,
        evidenciasRechazadas: rechazadas,
        zonasRecibidas: zonas?.length ?? 0,
        zonasModificadas: cambiosZonas,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return respuestaError(error, 'API Sync Offline');
  }
}
