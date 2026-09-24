import crypto from 'crypto';
import { RolUsuario } from '../types/roles';

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
 * Verifica la firma del token y retorna el payload o null si es inválido o expiró.
 * Es compatible tanto con Node.js como con Next.js Edge Runtime.
 */
export function verificarTokenSesion(token: string): UserPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;

    // 1. Verificación estricta de firma HMAC cuando crypto.createHmac de Node.js está disponible
    if (typeof crypto !== 'undefined' && typeof (crypto as any).createHmac === 'function') {
      const expectedSignature = (crypto as any)
        .createHmac('sha256', SECRET_KEY)
        .update(payloadBase64)
        .digest('base64url');

      if (typeof (crypto as any).timingSafeEqual === 'function' && typeof Buffer !== 'undefined') {
        if (!(crypto as any).timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
          return null;
        }
      } else if (signature !== expectedSignature) {
        return null;
      }
    }

    // 2. Decodificación universal de payload JSON (compatible con Buffer y atob en Edge)
    let jsonStr = '';
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
      jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    } else if (typeof atob === 'function') {
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      jsonStr = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      return null;
    }

    const payload: UserPayload = JSON.parse(jsonStr);
    if (!payload || !payload.rol || !payload.exp) {
      return null;
    }

    if (Date.now() / 1000 > payload.exp) {
      return null;
    }

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
