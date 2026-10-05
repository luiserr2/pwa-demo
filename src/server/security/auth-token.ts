import crypto from 'crypto';
import { RolUsuario } from '../types/roles';
import { esPayloadSesion } from './token-edge';

const SECRET_KEY = process.env.AUTH_SECRET || 'sisbirceca_telecom_hmac_secret_key_2026_super_safe';

export interface UserPayload {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  exp: number; // timestamp en segundos
}

/**
 * Genera un token HMAC-SHA256 firmado con expiración de 24 horas.
 */
export function generarTokenSesion(user: { id: string; email: string; nombre: string; rol: RolUsuario }): string {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24h
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payloadBase64).digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifica la firma HMAC del token (runtime Node.js) y retorna el payload o null si es
 * inválido, está mal formado o expiró. Falla cerrado. Para Edge (middleware) usar
 * `verificarTokenSesionEdge` de ./token-edge.
 */
export function verificarTokenSesion(token: string): UserPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payloadBase64).digest('base64url');

    const recibida = Buffer.from(signature);
    const esperada = Buffer.from(expectedSignature);
    if (recibida.length !== esperada.length || !crypto.timingSafeEqual(recibida, esperada)) {
      return null;
    }

    const payload: unknown = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!esPayloadSesion(payload)) return null;
    if (Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Genera un Hash SHA-256 determinístico para sellar un reporte aprobado.
 * Se alimenta de: código, IDs, fecha y contenido canónico de zonas y evidencias.
 */
export function generarHashDeterministaReporte(datos: {
  reporteId: string;
  codigoReporte: string;
  radiobaseId: string;
  tecnicoId: string;
  supervisorId: string;
  fechaAprobacion: string;
  totalZonas: number;
  totalEvidencias: number;
}): string {
  const payloadCanonica = [
    datos.reporteId,
    datos.codigoReporte,
    datos.radiobaseId,
    datos.tecnicoId,
    datos.supervisorId,
    datos.fechaAprobacion,
    datos.totalZonas.toString(),
    datos.totalEvidencias.toString(),
  ].join('::');

  return crypto.createHash('sha256').update(payloadCanonica).digest('hex');
}

/** SHA-256 hexadecimal de una cadena UTF-8. */
export function sha256Hex(contenido: string): string {
  return crypto.createHash('sha256').update(contenido, 'utf8').digest('hex');
}

/**
 * Serialización JSON canónica (claves ordenadas) para que el hash sea determinista
 * independientemente del orden de inserción de propiedades.
 */
export function serializarCanonico(valor: unknown): string {
  if (valor === null || typeof valor !== 'object') {
    return JSON.stringify(valor ?? null);
  }
  if (valor instanceof Date) {
    return JSON.stringify(valor.toISOString());
  }
  if (Array.isArray(valor)) {
    return `[${valor.map((v) => serializarCanonico(v)).join(',')}]`;
  }
  const entradas = Object.entries(valor as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entradas.map(([k, v]) => `${JSON.stringify(k)}:${serializarCanonico(v)}`).join(',')}}`;
}

/**
 * Sello SHA-256 del contenido técnico del expediente al momento del visado:
 * identidad del reporte + estado de las 48 zonas + inventario de evidencias.
 */
export function generarHashContenidoReporte(datos: {
  reporteId: string;
  codigoReporte: string;
  radiobaseId: string;
  tecnicoId: string;
  supervisorId: string;
  fechaVisado: string;
  zonas: ReadonlyArray<{ numeroZona: number; estado: string; observacion: string | null }>;
  evidencias: ReadonlyArray<{ slotNumero: number; tipoEquipo: string; momento: string; urlImagen: string }>;
}): string {
  const zonas = [...datos.zonas]
    .sort((a, b) => a.numeroZona - b.numeroZona)
    .map((z) => ({ n: z.numeroZona, e: z.estado, o: z.observacion ?? null }));
  const evidencias = [...datos.evidencias]
    .map((e) => ({ s: e.slotNumero, t: e.tipoEquipo, m: e.momento, h: sha256Hex(e.urlImagen) }))
    .sort((a, b) => a.s - b.s || (a.m < b.m ? -1 : a.m > b.m ? 1 : 0) || (a.t < b.t ? -1 : 1));

  return sha256Hex(
    serializarCanonico({
      reporteId: datos.reporteId,
      codigo: datos.codigoReporte,
      radiobaseId: datos.radiobaseId,
      tecnicoId: datos.tecnicoId,
      supervisorId: datos.supervisorId,
      fechaVisado: datos.fechaVisado,
      zonas,
      evidencias,
    })
  );
}

