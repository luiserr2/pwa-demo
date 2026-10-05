import { NextRequest } from 'next/server';
import { manejarCambioEstado } from '@/server/http/cambiar-estado.handler';

export const dynamic = 'force-dynamic';

/** Alias explícito de PATCH /api/reportes/[id] para transiciones de estado. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return manejarCambioEstado(req, params.id);
}
