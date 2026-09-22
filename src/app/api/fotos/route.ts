import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { EvidenciaService } from '@/server/services/evidencia.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reporteId, tipoEquipo, slotNumero, momento, urlImagen } = body;

    if (!reporteId || !tipoEquipo || slotNumero === undefined || !momento || !urlImagen) {
      return NextResponse.json(
        { ok: false, error: 'Parámetros incompletos para registrar evidencia fotográfica.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const service = new EvidenciaService(ds);
    const evidencia = await service.registrarEvidencia({
      reporteId,
      tipoEquipo,
      slotNumero,
      momento,
      urlImagen,
    });

    return NextResponse.json({ ok: true, data: evidencia }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al registrar evidencia fotográfica.' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { evidenciaId, estado, observacionRechazo, supervisorId } = body;

    if (!evidenciaId || !estado || !supervisorId) {
      return NextResponse.json(
        { ok: false, error: 'Campos evidenciaId, estado y supervisorId son obligatorios.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const service = new EvidenciaService(ds);
    const evidencia = await service.evaluarVisualmente({
      evidenciaId,
      estado,
      observacionRechazo,
      supervisorId,
    });

    return NextResponse.json({ ok: true, data: evidencia });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al evaluar evidencia visualmente.' },
      { status: 400 }
    );
  }
}
