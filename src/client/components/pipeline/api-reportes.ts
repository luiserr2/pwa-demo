/**
 * Cliente HTTP tipado para el pipeline de reportes (cookie same-origin).
 * Nunca inventa datos: ante cualquier fallo devuelve el error real del servidor.
 */
import type {
  CambiarEstadoPayload,
  ReporteBaseApi,
  ReporteListadoApi,
  RespuestaApi,
} from '@/shared/tipos-api';

export type ResultadoApi<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

/** PATCH devuelve el reporte sin evidencias/zonas; las relaciones pueden venir o no. */
export type ReporteActualizadoApi = ReporteBaseApi &
  Partial<Pick<ReporteListadoApi, 'radiobase' | 'tecnico' | 'supervisor' | 'totalEvidencias'>>;

const ERROR_RED = 'No se pudo contactar al servidor. Verifique su conexión e intente de nuevo.';

async function leerJson<T>(res: Response): Promise<RespuestaApi<T> | null> {
  try {
    const cuerpo: unknown = await res.json();
    if (typeof cuerpo !== 'object' || cuerpo === null || !('ok' in cuerpo)) return null;
    return cuerpo as RespuestaApi<T>;
  } catch {
    return null;
  }
}

function esReporteBase(valor: unknown): valor is ReporteBaseApi {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    typeof (valor as { id?: unknown }).id === 'string' &&
    typeof (valor as { estado?: unknown }).estado === 'string'
  );
}

export async function listarReportes(): Promise<ResultadoApi<ReporteListadoApi[]>> {
  let res: Response;
  try {
    res = await fetch('/api/reportes', { cache: 'no-store', credentials: 'same-origin' });
  } catch {
    return { ok: false, error: ERROR_RED, status: 0 };
  }

  const json = await leerJson<ReporteListadoApi[]>(res);
  if (!res.ok || !json || !json.ok) {
    return {
      ok: false,
      error: json?.error ?? `El servidor respondió HTTP ${res.status} al listar reportes.`,
      status: res.status,
    };
  }
  if (!Array.isArray(json.data)) {
    return { ok: false, error: 'El servidor respondió sin el listado de reportes.', status: res.status };
  }
  return { ok: true, data: json.data };
}

export async function cambiarEstadoReporte(
  reporteId: string,
  payload: CambiarEstadoPayload
): Promise<ResultadoApi<ReporteActualizadoApi>> {
  let res: Response;
  try {
    res = await fetch(`/api/reportes/${encodeURIComponent(reporteId)}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: ERROR_RED, status: 0 };
  }

  const json = await leerJson<ReporteActualizadoApi>(res);
  if (!res.ok || !json || !json.ok) {
    return {
      ok: false,
      error: json?.error ?? `El servidor respondió HTTP ${res.status} al cambiar el estado.`,
      status: res.status,
    };
  }
  if (!esReporteBase(json.data)) {
    return { ok: false, error: 'El servidor confirmó el cambio sin devolver el reporte actualizado.', status: res.status };
  }
  return { ok: true, data: json.data };
}

/** Reemplaza el item del listado con la respuesta del servidor conservando relaciones no devueltas. */
export function fusionarReporte(previo: ReporteListadoApi, actualizado: ReporteActualizadoApi): ReporteListadoApi {
  return {
    ...previo,
    ...actualizado,
    radiobase: actualizado.radiobase ?? previo.radiobase,
    tecnico: actualizado.tecnico ?? previo.tecnico,
    supervisor: actualizado.supervisor ?? previo.supervisor,
    totalEvidencias: actualizado.totalEvidencias ?? previo.totalEvidencias,
  };
}
