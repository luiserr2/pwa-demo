import { DataSource, EntityManager, In } from 'typeorm';
import { AuditoriaEvento } from '../entities/AuditoriaEvento';
import { User } from '../entities/User';
import { Reporte } from '../entities/Reporte';
import { sha256Hex, serializarCanonico } from '../security/auth-token';

export const TIPOS_EVENTO_AUDITORIA = [
  'CAMBIO_ESTADO',
  'SINCRONIZACION_CAMPO',
  'CAMBIO_MATRIZ',
  'SUBIDA_FOTO',
  'APROBACION_QA',
  'OBSERVACION_QA',
  'AUTENTICACION',
  'POLITICA_CONFIG',
  'ALERTA_SLA',
  'GEOFENCING_FAIL',
] as const;
export type TipoEventoAuditoria = (typeof TIPOS_EVENTO_AUDITORIA)[number];

export type SeveridadAuditoria = 'INFO' | 'ADVERTENCIA' | 'CRITICO';

export const HASH_GENESIS = '0'.repeat(64);

/** Clave fija del advisory lock transaccional que serializa la escritura de la cadena. */
const LOCK_CADENA_AUDITORIA = 48_048_001;

export interface RegistrarEventoInput {
  reporteId: string | null;
  usuarioId: string;
  tipoEvento: TipoEventoAuditoria;
  estadoAnterior?: string | null;
  estadoNuevo?: string | null;
  severidad?: SeveridadAuditoria;
  descripcion: string;
  ip?: string | null;
  detalles?: Record<string, unknown>;
}

/** Vista pública del evento (contrato consumido por /admin/auditoria). */
export interface EventoAuditoriaVista {
  id: string;
  timestamp: string;
  actor: { nombre: string; email: string; rol: string };
  tipo: string;
  severidad: SeveridadAuditoria;
  recurso: string;
  ip: string;
  ubicacion: string;
  descripcion: string;
  hashActual: string;
  hashPrevio: string;
  metadatos: Record<string, unknown>;
  reporteId: string | null;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
}

export interface ResultadoListadoAuditoria {
  eventos: EventoAuditoriaVista[];
  totalEventos: number;
  eventosCriticos: number;
  cadenaValida: boolean;
  eslabonesRotos: number;
  ultimoHash: string | null;
}

function calcularHashEvento(
  hashPrevio: string,
  evento: Pick<AuditoriaEvento, 'reporteId' | 'usuarioId' | 'tipoEvento' | 'estadoAnterior' | 'estadoNuevo'>,
  detallesSinHash: Record<string, unknown>,
  createdAt: Date
): string {
  return sha256Hex(
    hashPrevio +
      serializarCanonico({
        reporteId: evento.reporteId,
        usuarioId: evento.usuarioId,
        tipoEvento: evento.tipoEvento,
        estadoAnterior: evento.estadoAnterior,
        estadoNuevo: evento.estadoNuevo,
        detalles: detallesSinHash,
        createdAt: createdAt.toISOString(),
      })
  );
}

function separarHashPrevio(detalles: Record<string, unknown>): {
  hashPrevio: string;
  resto: Record<string, unknown>;
} {
  const { hashPrevio, ...resto } = detalles;
  return { hashPrevio: typeof hashPrevio === 'string' ? hashPrevio : HASH_GENESIS, resto };
}

export class AuditoriaService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Registra un evento dentro de la transacción del llamador (atomicidad negocio + bitácora).
   * El advisory lock garantiza que dos transacciones concurrentes no bifurquen la cadena.
   */
  async registrar(manager: EntityManager, input: RegistrarEventoInput): Promise<AuditoriaEvento> {
    await manager.query('SELECT pg_advisory_xact_lock($1)', [LOCK_CADENA_AUDITORIA]);

    const [ultimo] = await manager.find(AuditoriaEvento, {
      order: { createdAt: 'DESC' },
      take: 1,
    });

    const hashPrevio = ultimo?.hashSha256 ?? HASH_GENESIS;
    const ahora = Date.now();
    const minimo = ultimo ? new Date(ultimo.createdAt).getTime() + 1 : 0;
    const createdAt = new Date(Math.max(ahora, minimo));

    const detallesSinHash: Record<string, unknown> = JSON.parse(
      JSON.stringify({
        ...(input.detalles ?? {}),
        descripcion: input.descripcion,
        severidad: input.severidad ?? 'INFO',
        ip: input.ip ?? null,
      })
    );

    const base = {
      reporteId: input.reporteId,
      usuarioId: input.usuarioId,
      tipoEvento: input.tipoEvento,
      estadoAnterior: input.estadoAnterior ?? null,
      estadoNuevo: input.estadoNuevo ?? null,
    };

    const hashSha256 = calcularHashEvento(hashPrevio, base, detallesSinHash, createdAt);

    const evento = manager.create(AuditoriaEvento, {
      ...base,
      detalles: { ...detallesSinHash, hashPrevio },
      hashSha256,
      createdAt,
    });

    return await manager.save(AuditoriaEvento, evento);
  }

  /**
   * Lista los eventos más recientes, verifica la integridad de la cadena completa recuperada
   * y aplica filtros opcionales sobre la vista.
   */
  async listar(filtro: {
    tipo?: string | null;
    severidad?: string | null;
    q?: string | null;
    reporteId?: string | null;
    limite?: number;
  }): Promise<ResultadoListadoAuditoria> {
    const limite = Math.min(Math.max(filtro.limite ?? 500, 1), 2000);
    const repo = this.dataSource.getRepository(AuditoriaEvento);

    const filas = await repo.find({ order: { createdAt: 'DESC' }, take: limite });

    // Verificación criptográfica: recomputar cada eslabón y su enlace con el anterior.
    let eslabonesRotos = 0;
    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      const { hashPrevio, resto } = separarHashPrevio(fila.detalles ?? {});
      const recalculado = calcularHashEvento(hashPrevio, fila, resto, new Date(fila.createdAt));
      const anterior = filas[i + 1];
      const enlaceRoto = anterior ? anterior.hashSha256 !== hashPrevio : false;
      if (recalculado !== fila.hashSha256 || enlaceRoto) {
        eslabonesRotos++;
      }
    }

    const usuarioIds = Array.from(new Set(filas.map((f) => f.usuarioId)));
    const reporteIds = Array.from(new Set(filas.map((f) => f.reporteId).filter((v): v is string => !!v)));

    const [usuarios, reportes] = await Promise.all([
      usuarioIds.length ? this.dataSource.getRepository(User).findBy({ id: In(usuarioIds) }) : Promise.resolve([]),
      reporteIds.length
        ? this.dataSource.getRepository(Reporte).find({
            where: { id: In(reporteIds) },
            relations: ['radiobase'],
          })
        : Promise.resolve([]),
    ]);

    const usuariosPorId = new Map(usuarios.map((u) => [u.id, u]));
    const reportesPorId = new Map(reportes.map((r) => [r.id, r]));

    const vistas: EventoAuditoriaVista[] = filas.map((fila) => {
      const { hashPrevio, resto } = separarHashPrevio(fila.detalles ?? {});
      const { descripcion, severidad, ip, ubicacion, ...metadatos } = resto;
      const usuario = usuariosPorId.get(fila.usuarioId);
      const reporte = fila.reporteId ? reportesPorId.get(fila.reporteId) : undefined;
      const severidadValida: SeveridadAuditoria =
        severidad === 'CRITICO' || severidad === 'ADVERTENCIA' ? severidad : 'INFO';

      return {
        id: fila.id,
        timestamp: new Date(fila.createdAt).toISOString(),
        actor: usuario
          ? { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
          : { nombre: 'Usuario eliminado', email: fila.usuarioId, rol: 'DESCONOCIDO' },
        tipo: fila.tipoEvento,
        severidad: severidadValida,
        recurso: reporte
          ? `${reporte.codigo}${reporte.radiobase ? ` / ${reporte.radiobase.nombre}` : ''}`
          : fila.reporteId ?? 'SISTEMA',
        ip: typeof ip === 'string' && ip ? ip : 'No registrada',
        ubicacion: typeof ubicacion === 'string' && ubicacion ? ubicacion : 'No registrada',
        descripcion: typeof descripcion === 'string' ? descripcion : fila.tipoEvento,
        hashActual: fila.hashSha256,
        hashPrevio,
        metadatos: {
          ...metadatos,
          ...(fila.estadoAnterior ? { estadoAnterior: fila.estadoAnterior } : {}),
          ...(fila.estadoNuevo ? { estadoNuevo: fila.estadoNuevo } : {}),
        },
        reporteId: fila.reporteId,
        estadoAnterior: fila.estadoAnterior,
        estadoNuevo: fila.estadoNuevo,
      };
    });

    const q = filtro.q?.trim().toLowerCase();
    const filtradas = vistas.filter((e) => {
      if (filtro.reporteId && e.reporteId !== filtro.reporteId) return false;
      if (filtro.tipo && filtro.tipo !== 'TODOS' && e.tipo !== filtro.tipo) return false;
      if (filtro.severidad && filtro.severidad !== 'TODAS' && e.severidad !== filtro.severidad) return false;
      if (q) {
        return (
          e.descripcion.toLowerCase().includes(q) ||
          e.recurso.toLowerCase().includes(q) ||
          e.actor.nombre.toLowerCase().includes(q) ||
          e.actor.email.toLowerCase().includes(q) ||
          e.ip.toLowerCase().includes(q) ||
          e.hashActual.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return {
      eventos: filtradas,
      totalEventos: vistas.length,
      eventosCriticos: vistas.filter((e) => e.severidad === 'CRITICO').length,
      cadenaValida: eslabonesRotos === 0,
      eslabonesRotos,
      ultimoHash: filas[0]?.hashSha256 ?? null,
    };
  }
}
