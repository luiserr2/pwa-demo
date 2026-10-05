import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { EvidenciaService } from '@/server/services/evidencia.service';
import { RegistrarEvidenciaSchema, EvaluarEvidenciaSchema } from '@/server/schemas';
import { verificarPermisosAPI } from '@/server/security/guard';
import { RolUsuario } from '@/server/types/roles';
import { respuestaError, obtenerIpCliente } from '@/server/http/respuestas';
import { resolverActorPersistido } from '@/server/security/actor';

const MAX_DATA_URI_BYTES = 1024 * 1024 * 2; // 2MB

export async function POST(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body: unknown = await req.json();
    const validado = RegistrarEvidenciaSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Parámetros de evidencia inválidos.' },
        { status: 400 }
      );
    }

    // Zero-Trust: Límite de tamaño de imagen para prevenir denegación de servicio (DoS)
    const { urlImagen } = validado.data;
    if (urlImagen.startsWith('data:') && urlImagen.length > MAX_DATA_URI_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'La fotografía excede el tamaño máximo permitido (máx 2MB).' },
        { status: 413 }
      );
    }

    const ds = await getDataSource();
    const service = new EvidenciaService(ds);
    const evidencia = await service.registrarEvidencia(validado.data);
    return NextResponse.json({ ok: true, data: evidencia }, { status: 201 });
  } catch (error: unknown) {
    // Sin "guardado resiliente" falso: si no se persistió, el cliente debe saberlo y conservar la foto en Dexie.
    return respuestaError(error, 'API Fotos POST');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.SUPERVISOR, RolUsuario.ADMIN]);
    if (!guard.autorizado || !guard.usuario) {
      return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
    }

    const body: unknown = await req.json();
    const validado = EvaluarEvidenciaSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Parámetros de evaluación inválidos.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const actor = await resolverActorPersistido(ds, guard.usuario);
    const service = new EvidenciaService(ds);
    const evidencia = await service.evaluarYAuditar(
      { ...validado.data, supervisorId: actor.id },
      obtenerIpCliente(req)
    );
    return NextResponse.json({ ok: true, data: evidencia });
  } catch (error: unknown) {
    return respuestaError(error, 'API Fotos PATCH');
  }
}
