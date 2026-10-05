/**
 * Prueba de integración del flujo VERTEX de 8 fases contra un PostgreSQL REAL.
 * Se ejecuta solo si INTEGRATION_DATABASE_URL está definido (destruye y recrea el esquema).
 *
 *   $env:INTEGRATION_DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5433/postgres"; npx jest tests/integration
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { NextRequest } from 'next/server';
import {
  User,
  Radiobase,
  Reporte,
  EvidenciaFotografica,
  ZonaMatriz,
  EquipoInstalado,
  AuditoriaEvento,
  EstadoReporte,
  RolUsuario,
  MomentoFoto,
} from '../../src/server/entities';
import { seedDatabase } from '../../src/server/db/seed';
import { ReporteService } from '../../src/server/services/reporte.service';
import { EvidenciaService } from '../../src/server/services/evidencia.service';
import { AuditoriaService } from '../../src/server/services/auditoria.service';
import { EstadoZona } from '../../src/shared/catalogo-zonas';
import { PATCH as patchReporte, GET as getReporte } from '../../src/app/api/reportes/[id]/route';
import { PATCH as patchEstadoAlias } from '../../src/app/api/reportes/[id]/estado/route';
import { GET as getReportes } from '../../src/app/api/reportes/route';
import { GET as getStats } from '../../src/app/api/admin/stats/route';
import { GET as getAuditoria } from '../../src/app/api/admin/auditoria/route';
import { POST as postSync } from '../../src/app/api/sync/offline/route';
import type { StatsApi, SyncOfflineRespuestaApi } from '../../src/shared/tipos-api';

const URL_BD = process.env.INTEGRATION_DATABASE_URL;
const describirSiHayBD = URL_BD ? describe : describe.skip;

jest.setTimeout(120_000);

function peticion(
  url: string,
  actor: { id: string; rol: RolUsuario },
  init: { method?: string; body?: unknown } = {}
): NextRequest {
  return new NextRequest(`http://localhost${url}`, {
    method: init.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      'x-user-role': actor.rol,
      'x-user-id': actor.id,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

describirSiHayBD('Integración PostgreSQL — flujo operativo de 8 fases', () => {
  let ds: DataSource;
  let tecnico: User;
  let supervisor: User;
  let reporteSemilla: Reporte;

  beforeAll(async () => {
    ds = new DataSource({
      type: 'postgres',
      url: URL_BD,
      entities: [User, Radiobase, Reporte, EvidenciaFotografica, ZonaMatriz, EquipoInstalado, AuditoriaEvento],
      synchronize: true,
      dropSchema: true,
      logging: false,
      extra: { max: 1 },
    });
    await ds.initialize();
    globalThis.__TYPEORM_DATA_SOURCE__ = ds;

    await seedDatabase(ds);
    tecnico = (await ds.getRepository(User).findOneBy({ email: 'tecnico@sisbirceca.com' }))!;
    supervisor = (await ds.getRepository(User).findOneBy({ email: 'supervisor@sisbirceca.com' }))!;
    reporteSemilla = (await ds.getRepository(Reporte).findOneBy({ codigo: 'RDB-001_20260922' }))!;
  });

  afterAll(async () => {
    globalThis.__TYPEORM_DATA_SOURCE__ = undefined;
    if (ds?.isInitialized) await ds.destroy();
  });

  it('crea expediente en SIN_EMPEZAR con 48 zonas tipadas del catálogo', async () => {
    const rdb2 = (await ds.getRepository(Radiobase).findOneBy({ codigo: 'RDB-002' }))!;
    const nuevo = await new ReporteService(ds).crearReporte({ radiobaseId: rdb2.id, tecnicoId: tecnico.id });
    const zonas = await ds.getRepository(ZonaMatriz).find({ where: { reporteId: nuevo.id }, order: { numeroZona: 'ASC' } });
    expect(nuevo.estado).toBe(EstadoReporte.SIN_EMPEZAR);
    expect(zonas).toHaveLength(48);
    expect(zonas.every((z) => z.estado === EstadoZona.NORMAL && !!z.subsistema)).toBe(true);
  });

  it('recorre ELABORANDO_INFORME → … → FACTURADO vía HTTP y persiste cada dato de fase', async () => {
    const id = reporteSemilla.id;
    const tec = { id: tecnico.id, rol: RolUsuario.TECNICO };
    const sup = { id: supervisor.id, rol: RolUsuario.SUPERVISOR };
    const ctx = { params: { id } };

    const r1 = await patchReporte(peticion(`/api/reportes/${id}`, tec, { method: 'PATCH', body: { nuevoEstado: 'REVISION_INTERNA' } }), ctx);
    expect(r1.status).toBe(200);

    // Un técnico no puede enviar al cliente
    const r403 = await patchReporte(
      peticion(`/api/reportes/${id}`, tec, {
        method: 'PATCH',
        body: { nuevoEstado: 'ENVIADO_AL_CLIENTE', canalRadicacion: 'CORREO', numeroTicketCliente: 'X' },
      }),
      ctx
    );
    expect(r403.status).toBe(403);

    // Payload incompleto → 422
    const r422 = await patchEstadoAlias(
      peticion(`/api/reportes/${id}/estado`, sup, { method: 'PATCH', body: { nuevoEstado: 'ENVIADO_AL_CLIENTE', canalRadicacion: 'CORREO' } }),
      ctx
    );
    expect(r422.status).toBe(422);

    const r2 = await patchEstadoAlias(
      peticion(`/api/reportes/${id}/estado`, sup, {
        method: 'PATCH',
        body: {
          nuevoEstado: 'ENVIADO_AL_CLIENTE',
          canalRadicacion: 'PORTAL_CLIENTE',
          numeroTicketCliente: 'INC-2026-0042',
          usuarioEjecutor: { id: supervisor.id, rol: 'SUPERVISOR' },
        },
      }),
      ctx
    );
    expect(r2.status).toBe(200);

    // Suplantación declarada en el cuerpo → 403
    const rSuplanta = await patchReporte(
      peticion(`/api/reportes/${id}`, sup, {
        method: 'PATCH',
        body: { nuevoEstado: 'VISADO', usuarioEjecutor: { id: tecnico.id, rol: 'TECNICO' } },
      }),
      ctx
    );
    expect(rSuplanta.status).toBe(403);

    const r3 = await patchReporte(peticion(`/api/reportes/${id}`, sup, { method: 'PATCH', body: { nuevoEstado: 'VISADO' } }), ctx);
    expect(r3.status).toBe(200);

    const r4 = await patchReporte(
      peticion(`/api/reportes/${id}`, sup, { method: 'PATCH', body: { nuevoEstado: 'HES_SOLICITADA', numeroHes: 'HES-9001' } }),
      ctx
    );
    expect(r4.status).toBe(200);

    const r5 = await patchReporte(peticion(`/api/reportes/${id}`, sup, { method: 'PATCH', body: { nuevoEstado: 'FACTURADO' } }), ctx);
    expect(r5.status).toBe(200);

    // Transición inválida desde estado terminal → 409
    const r409 = await patchReporte(peticion(`/api/reportes/${id}`, sup, { method: 'PATCH', body: { nuevoEstado: 'VISADO' } }), ctx);
    expect(r409.status).toBe(409);

    const persistido = (await ds.getRepository(Reporte).findOneBy({ id }))!;
    expect(persistido.estado).toBe(EstadoReporte.FACTURADO);
    expect(persistido.canalRadicacion).toBe('PORTAL_CLIENTE');
    expect(persistido.numeroTicketCliente).toBe('INC-2026-0042');
    expect(persistido.fechaEnvioCliente).toBeInstanceOf(Date);
    expect(persistido.bloqueadoEdicion).toBe(true);
    expect(persistido.fechaVisado).toBeInstanceOf(Date);
    expect(persistido.hashSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(persistido.numeroHes).toBe('HES-9001');
    expect(persistido.fechaHes).toBeInstanceOf(Date);

    // GET detalle real
    const det = await getReporte(peticion(`/api/reportes/${id}`, sup), ctx);
    const detJson = (await det.json()) as { ok: boolean; data: { zonas: unknown[]; evidencias: unknown[] } };
    expect(detJson.ok).toBe(true);
    expect(detJson.data.zonas).toHaveLength(48);
    expect(detJson.data.evidencias.length).toBe(12);
  });

  it('bloquea evidencias nuevas en un expediente visado', async () => {
    await expect(
      new EvidenciaService(ds).registrarEvidencia({
        reporteId: reporteSemilla.id,
        tipoEquipo: 'CAMARA',
        slotNumero: 1,
        momento: MomentoFoto.ANTES,
        urlImagen: 'data:image/webp;base64,AAAA',
      })
    ).rejects.toThrow('bloqueado para edición');
  });

  it('sincroniza un expediente nuevo desde campo (UUID del dispositivo, radiobase por código)', async () => {
    const reporteId = '0b6f6a2e-3c1d-4a8e-9f5b-2d7c8e9a1b23';
    const tec = { id: tecnico.id, rol: RolUsuario.TECNICO };
    const malo = await postSync(
      peticion('/api/sync/offline', tec, {
        method: 'POST',
        body: { reporteId, radiobaseCodigo: 'RDB-003', evidencias: [], zonas: [{ numeroZona: 2, estado: 'FALLA' }] },
      })
    );
    expect(malo.status).toBe(400);

    const res = await postSync(
      peticion('/api/sync/offline', tec, {
        method: 'POST',
        body: {
          reporteId,
          radiobaseCodigo: 'RDB-003',
          evidencias: [
            { slotNumero: 1, tipoEquipo: 'CAMARA', momento: 'DESPUES', urlImagen: 'data:image/webp;base64,DESPUES' },
            { slotNumero: 1, tipoEquipo: 'CAMARA', momento: 'ANTES', urlImagen: 'data:image/webp;base64,ANTES' },
            { slotNumero: 2, tipoEquipo: 'PIR', momento: 'DESPUES', urlImagen: 'data:image/webp;base64,SIN_ANTES' },
          ],
          zonas: [
            { numeroZona: 2, estado: 'FALLA', observacion: 'Cerco sur colapsado' },
            { numeroZona: 3, estado: 'NORMAL' },
          ],
        },
      })
    );
    const json = (await res.json()) as { ok: boolean; data: SyncOfflineRespuestaApi };
    expect(res.status).toBe(200);
    expect(json.data.reporteId).toBe(reporteId);
    expect(json.data.creado).toBe(true);
    expect(json.data.estado).toBe(EstadoReporte.EN_VISITA);
    expect(json.data.evidenciasProcesadas).toBe(2);
    expect(json.data.evidenciasRechazadas).toHaveLength(1);
    expect(json.data.zonasModificadas).toBe(1);

    const zona2 = (await ds.getRepository(ZonaMatriz).findOneBy({ reporteId, numeroZona: 2 }))!;
    expect(zona2.estado).toBe(EstadoZona.FALLA);
    expect(zona2.observacion).toBe('Cerco sur colapsado');

    const lista = await getReportes(peticion(`/api/reportes?tecnicoId=${tecnico.id}`, tec));
    const listaJson = (await lista.json()) as { ok: boolean; data: Array<{ id: string; totalEvidencias: number }> };
    expect(listaJson.data.find((r) => r.id === reporteId)?.totalEvidencias).toBe(2);
  });

  it('stats devuelve métricas reales de las 8 columnas', async () => {
    const res = await getStats(peticion('/api/admin/stats', { id: supervisor.id, rol: RolUsuario.SUPERVISOR }));
    const json = (await res.json()) as { ok: boolean; data: StatsApi };
    expect(res.status).toBe(200);
    expect(json.data.pipeline).toHaveLength(8);
    expect(json.data.reportesPorEstado.FACTURADO).toBe(1);
    expect(json.data.reportesPorEstado.SIN_EMPEZAR).toBe(1);
    expect(json.data.reportesPorEstado.EN_VISITA).toBe(1);
    expect(json.data.totalReportes).toBe(3);
    expect(json.data.totalEvidencias).toBe(14);
    expect(json.data.zonasPorEstado.FALLA).toBe(1);
    expect(json.data.zonasPorEstado.ALARMA).toBe(1);
    expect(json.data.actividadMensual).toHaveLength(6);
    expect(json.data.reportesPorRegion.length).toBeGreaterThan(0);
  });

  it('la bitácora persiste en BD con cadena SHA-256 válida y detecta manipulación', async () => {
    const res = await getAuditoria(peticion('/api/admin/auditoria', { id: supervisor.id, rol: RolUsuario.SUPERVISOR }));
    const json = (await res.json()) as {
      ok: boolean;
      data: Array<{ tipo: string; timestamp: string }>;
      stats: { cadenaValida: boolean; totalEventos: number };
    };
    expect(res.status).toBe(200);
    expect(json.stats.cadenaValida).toBe(true);
    expect(json.stats.totalEventos).toBeGreaterThanOrEqual(8);
    const tiempos = json.data.map((e) => new Date(e.timestamp).getTime());
    expect([...tiempos].sort((a, b) => b - a)).toEqual(tiempos);
    expect(json.data.some((e) => e.tipo === 'APROBACION_QA')).toBe(true);
    expect(json.data.some((e) => e.tipo === 'SINCRONIZACION_CAMPO')).toBe(true);

    await ds.query(
      `UPDATE auditoria_eventos SET detalles = jsonb_set(detalles, '{descripcion}', '"alterado"') WHERE tipo_evento = 'APROBACION_QA'`
    );
    const verificado = await new AuditoriaService(ds).listar({});
    expect(verificado.cadenaValida).toBe(false);
    expect(verificado.eslabonesRotos).toBeGreaterThanOrEqual(1);
  });
});
