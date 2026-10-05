import { RolUsuario } from '../types/roles';
import type { UserPayload } from './auth-token';

/**
 * Verificación HMAC-SHA256 del token de sesión compatible con Edge Runtime (Web Crypto).
 * El middleware NO puede usar `crypto` de Node: antes decodificaba el payload sin
 * comprobar la firma, lo que permitía falsificar el rol a nivel de rutas.
 * Falla cerrado: cualquier anomalía devuelve null.
 */

const ROLES_VALIDOS: ReadonlySet<string> = new Set(Object.values(RolUsuario));

function obtenerSecreto(): string {
  return process.env.AUTH_SECRET || 'sisbirceca_telecom_hmac_secret_key_2026_super_safe';
}

function bytesABase64Url(bytes: Uint8Array): string {
  let binario = '';
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlATexto(valor: string): string {
  const base64 = valor.replace(/-/g, '+').replace(/_/g, '/');
  const relleno = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binario = atob(base64 + relleno);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Comparación en tiempo constante para no filtrar la firma por timing. */
function igualdadConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferencia === 0;
}

export function esPayloadSesion(valor: unknown): valor is UserPayload {
  if (typeof valor !== 'object' || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.email === 'string' &&
    typeof v.nombre === 'string' &&
    typeof v.rol === 'string' &&
    ROLES_VALIDOS.has(v.rol) &&
    typeof v.exp === 'number'
  );
}

export async function verificarTokenSesionEdge(token: string): Promise<UserPayload | null> {
  try {
    const partes = token.split('.');
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
    const [payloadBase64, firma] = partes;

    const clave = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(obtenerSecreto()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const firmaEsperada = bytesABase64Url(
      new Uint8Array(await crypto.subtle.sign('HMAC', clave, new TextEncoder().encode(payloadBase64)))
    );
    if (!igualdadConstante(firma, firmaEsperada)) return null;

    const payload: unknown = JSON.parse(base64UrlATexto(payloadBase64));
    if (!esPayloadSesion(payload)) return null;
    if (Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
