import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { RadiobaseService } from '@/server/services/radiobase.service';
import { CrearRadiobaseSchema } from '@/server/schemas';
import { verificarPermisosAPI } from '@/server/security/guard';
import { RolUsuario } from '@/server/types/roles';
import { SEED_RADIOBASES } from '@/server/db/fallback-catalog';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busqueda = searchParams.get('busqueda') || undefined;
    const region = searchParams.get('region') || undefined;

    const ds = await getDataSource();
    const service = new RadiobaseService(ds);
    const lista = await service.listarRadiobases({ busqueda, region });

    return NextResponse.json({ ok: true, data: lista });
  } catch (error: any) {
    console.warn(`[API Radiobases] Usando catálogo de alta disponibilidad: ${error.message}`);
    return NextResponse.json({ ok: true, data: SEED_RADIOBASES, _resilient: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Zero-Trust Guard: Solo administradores pueden registrar radiobases
    const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN]);
    if (!guard.autorizado && guard.response) {
      return guard.response;
    }

    const body = await req.json();
    const validado = CrearRadiobaseSchema.safeParse(body);
    if (!validado.success) {
      return NextResponse.json(
        { ok: false, error: validado.error.errors[0]?.message || 'Datos de radiobase inválidos.' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const service = new RadiobaseService(ds);
    const nueva = await service.crearRadiobase(validado.data);

    return NextResponse.json({ ok: true, data: nueva }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al crear radiobase.' },
      { status: 400 }
    );
  }
}
