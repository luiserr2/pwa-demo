/**
 * Cliente HTTP mínimo para las vistas de campo. Normaliza el contrato { ok, data | error }
 * y distingue fallos de red / BD caída (reintentables: el trabajo se conserva en Dexie)
 * de rechazos de negocio (400/401/403/404/409).
 */

export type ResultadoApi<T> =
  | { ok: true; data: T; status: number; resiliente: boolean }
  | { ok: false; error: string; status: number; reintentable: boolean };

interface CuerpoApi {
  ok?: unknown;
  data?: unknown;
  error?: unknown;
  _resilient?: unknown;
}

function esObjeto(valor: unknown): valor is CuerpoApi {
  return typeof valor === 'object' && valor !== null;
}

export function mensajePorEstadoHttp(status: number): string {
  switch (status) {
    case 0:
      return 'Sin conexión con el servidor.';
    case 400:
      return 'La solicitud fue rechazada por datos inválidos.';
    case 401:
      return 'Sesión no válida o expirada. Vuelva a iniciar sesión.';
    case 403:
      return 'No tiene permisos para esta operación.';
    case 404:
      return 'Recurso no encontrado.';
    case 409:
      return 'Conflicto: el expediente no admite esta operación en su estado actual.';
    case 503:
      return 'Base de datos no disponible.';
    default:
      return `Error inesperado del servidor (HTTP ${status}).`;
  }
}

export async function solicitarApi<T>(url: string, init?: RequestInit): Promise<ResultadoApi<T>> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...init });
  } catch {
    return { ok: false, error: mensajePorEstadoHttp(0), status: 0, reintentable: true };
  }

  let cuerpo: unknown = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    cuerpo = null;
  }

  const reintentable = respuesta.status === 503 || respuesta.status === 502 || respuesta.status === 504;

  if (esObjeto(cuerpo)) {
    if (respuesta.ok && cuerpo.ok === true && cuerpo.data !== undefined) {
      return {
        ok: true,
        data: cuerpo.data as T,
        status: respuesta.status,
        resiliente: cuerpo._resilient === true,
      };
    }
    const error =
      typeof cuerpo.error === 'string' && cuerpo.error.trim() !== ''
        ? cuerpo.error
        : mensajePorEstadoHttp(respuesta.status);
    return { ok: false, error, status: respuesta.status, reintentable };
  }

  return { ok: false, error: mensajePorEstadoHttp(respuesta.status), status: respuesta.status, reintentable };
}

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function esUuidValido(valor: string | null | undefined): valor is string {
  return typeof valor === 'string' && PATRON_UUID.test(valor);
}
