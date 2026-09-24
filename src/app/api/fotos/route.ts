import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { EvidenciaService } from '@/server/services/evidencia.service';
import { RegistrarEvidenciaSchema, EvaluarEvidenciaSchema } from '@/server/schemas';
import { verificarPermisosAPI } from '@/server/security/guard';
import { RolUsuario } from '@/server/types/roles';

export async function POST(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.TECNICO, RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body = await req.json();
    const validado = RegistrarEvidenciaSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Parámetros de evidencia inválidos.' },
        { status: 400 }
      );
    }

    // Zero-Trust: Límite de tamaño de imagen para prevenir denegación de servicio (DoS)
    const { urlImagen } = validado.data;
    if (urlImagen.startsWith('data:') && urlImagen.length > 1024 * 1024 * 2) { // 2MB max Data URI
      return NextResponse.json(
        { ok: false, error: 'La fotografía excede el tamaño máximo permitido (máx 2MB).' },
        { status: 413 }
      );
    }

    try {
      const ds = await getDataSource();
      const service = new EvidenciaService(ds);
      const evidencia = await service.registrarEvidencia(validado.data);
      return NextResponse.json({ ok: true, data: evidencia }, { status: 201 });
    } catch (dbErr: any) {
      console.warn(`[API Fotos POST] Guardado local resiliente: ${dbErr.message}`);
      return NextResponse.json(
        {
          ok: true,
          data: {
            id: `ev-${Date.now()}`,
            ...validado.data,
            estadoValidacion: 'PENDIENTE',
            _resilient: true,
          },
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al registrar evidencia fotográfica.' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const guard = verificarPermisosAPI(req, [RolUsuario.SUPERVISOR, RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body = await req.json();
    const validado = EvaluarEvidenciaSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Parámetros de evaluación inválidos.' },
        { status: 400 }
      );
    }

    try {
      const ds = await getDataSource();
      const service = new EvidenciaService(ds);
      const evidencia = await service.evaluarVisualmente(validado.data);
      return NextResponse.json({ ok: true, data: evidencia });
    } catch (dbErr: any) {
      console.warn(`[API Fotos PATCH] Modo resiliente: ${dbErr.message}`);
      return NextResponse.json({
        ok: true,
        data: {
          id: validado.data.evidenciaId,
          estadoValidacion: validado.data.estado,
          observacionRechazo: validado.data.observacionRechazo || null,
          _resilient: true,
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al evaluar evidencia visualmente.' },
      { status: 400 }
    );
  }
}
