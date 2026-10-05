import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ErrorDominio } from '../services/errores';
import { ActorNoResueltoError } from '../security/actor';

const CODIGOS_CONEXION = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', '57P01', '57P03', '3D000', '28P01', '28000']);

function codigoError(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

export function esErrorConexionBD(error: unknown): boolean {
  const code = codigoError(error);
  if (code && CODIGOS_CONEXION.has(code)) return true;
  if (error instanceof AggregateError) return error.errors.some((e) => esErrorConexionBD(e));
  return error instanceof Error && /connect|connection terminated|timeout expired/i.test(error.message);
}

/** IP del cliente detrás de proxy (Cloud Run / Nginx) o conexión directa. */
export function obtenerIpCliente(req: NextRequest): string | null {
  const reenviada = req.headers.get('x-forwarded-for');
  if (reenviada) return reenviada.split(',')[0]?.trim() || null;
  return req.headers.get('x-real-ip') || null;
}

/**
 * Traduce cualquier error a una respuesta HTTP honesta. Sin datos simulados:
 * si la base de datos no responde, el cliente recibe 503 y lo sabe.
 */
export function respuestaError(error: unknown, contexto: string): NextResponse {
  if (error instanceof ErrorDominio) {
    return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
  }
  if (error instanceof ActorNoResueltoError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { ok: false, error: error.errors[0]?.message ?? 'Datos inválidos.' },
      { status: 400 }
    );
  }
  if (esErrorConexionBD(error)) {
    console.error(`[${contexto}] Base de datos no disponible:`, error);
    return NextResponse.json(
      { ok: false, error: 'Base de datos no disponible. Intente nuevamente en unos minutos.' },
      { status: 503 }
    );
  }

  const code = codigoError(error);
  if (code === '23505') {
    return NextResponse.json({ ok: false, error: 'Registro duplicado: viola una restricción de unicidad.' }, { status: 409 });
  }
  if (code === '22P02') {
    return NextResponse.json({ ok: false, error: 'Identificador con formato inválido.' }, { status: 400 });
  }

  // Errores de negocio legados lanzados como Error genérico por servicios existentes.
  if (error instanceof Error && !code) {
    console.warn(`[${contexto}] ${error.message}`);
    return NextResponse.json({ ok: false, error: error.message }, { status: 422 });
  }

  console.error(`[${contexto}] Error interno:`, error);
  return NextResponse.json({ ok: false, error: 'Error interno del servidor.' }, { status: 500 });
}
