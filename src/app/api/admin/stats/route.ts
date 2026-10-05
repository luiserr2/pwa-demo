import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/server/db/data-source';
import { Reporte } from '@/server/entities/Reporte';
import { Radiobase } from '@/server/entities/Radiobase';
import { User, RolUsuario } from '@/server/entities/User';
import { EvidenciaFotografica, EstadoValidacionVisual } from '@/server/entities/EvidenciaFotografica';
import { ZonaMatriz } from '@/server/entities/ZonaMatriz';
import { verificarPermisosAPI } from '@/server/security/guard';
import { respuestaError } from '@/server/http/respuestas';
import { EstadoReporte, ETIQUETAS_ESTADO, FASES_PIPELINE, esEstadoReporte } from '@/shared/flujo-reporte';
import { EstadoZona, normalizarEstadoZona } from '@/shared/catalogo-zonas';

export const dynamic = 'force-dynamic';

const MESES_HISTORICO = 6;

interface FilaConteo {
  clave: string | null;
  cantidad: string;
}

function aEntero(valor: string | number | null | undefined): number {
  const n = typeof valor === 'number' ? valor : parseInt(valor ?? '0', 10);
  return Number.isFinite(n) ? n : 0;
}

function claveMes(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  const guard = verificarPermisosAPI(req, [RolUsuario.ADMIN, RolUsuario.SUPERVISOR]);
  if (!guard.autorizado) {
    return guard.response ?? NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const ds = await getDataSource();
    const reporteRepo = ds.getRepository(Reporte);
    const evidenciaRepo = ds.getRepository(EvidenciaFotografica);

    const inicioHistorico = new Date();
    inicioHistorico.setDate(1);
    inicioHistorico.setHours(0, 0, 0, 0);
    inicioHistorico.setMonth(inicioHistorico.getMonth() - (MESES_HISTORICO - 1));

    const [
      totalRadiobases,
      totalTecnicos,
      totalReportes,
      conteoEstados,
      conteoValidacion,
      conteoZonas,
      porRegion,
      porTecnologia,
      creadosPorMes,
      visadosPorMes,
      promedioVisado,
    ] = await Promise.all([
      ds.getRepository(Radiobase).count(),
      ds.getRepository(User).countBy({ rol: RolUsuario.TECNICO, activo: true }),
      reporteRepo.count(),
      reporteRepo
        .createQueryBuilder('r')
        .select('r.estado', 'clave')
        .addSelect('COUNT(r.id)', 'cantidad')
        .groupBy('r.estado')
        .getRawMany<FilaConteo>(),
      evidenciaRepo
        .createQueryBuilder('e')
        .select('e.estadoValidacion', 'clave')
        .addSelect('COUNT(e.id)', 'cantidad')
        .groupBy('e.estadoValidacion')
        .getRawMany<FilaConteo>(),
      ds
        .getRepository(ZonaMatriz)
        .createQueryBuilder('z')
        .select('z.estado', 'clave')
        .addSelect('COUNT(z.id)', 'cantidad')
        .groupBy('z.estado')
        .getRawMany<FilaConteo>(),
      reporteRepo
        .createQueryBuilder('r')
        .innerJoin('r.radiobase', 'rb')
        .select('rb.region', 'region')
        .addSelect('COUNT(r.id)', 'total')
        .addSelect(
          `SUM(CASE WHEN r.estado IN (:...cerrados) THEN 1 ELSE 0 END)`,
          'visados'
        )
        .setParameter('cerrados', [EstadoReporte.VISADO, EstadoReporte.HES_SOLICITADA, EstadoReporte.FACTURADO])
        .groupBy('rb.region')
        .orderBy('total', 'DESC')
        .getRawMany<{ region: string; total: string; visados: string | null }>(),
      reporteRepo
        .createQueryBuilder('r')
        .innerJoin('r.radiobase', 'rb')
        .select('rb.tecnologia', 'clave')
        .addSelect('COUNT(r.id)', 'cantidad')
        .groupBy('rb.tecnologia')
        .getRawMany<FilaConteo>(),
      reporteRepo
        .createQueryBuilder('r')
        .select(`TO_CHAR(DATE_TRUNC('month', r.createdAt), 'YYYY-MM')`, 'clave')
        .addSelect('COUNT(r.id)', 'cantidad')
        .where('r.createdAt >= :inicio', { inicio: inicioHistorico })
        .groupBy('clave')
        .getRawMany<FilaConteo>(),
      reporteRepo
        .createQueryBuilder('r')
        .select(`TO_CHAR(DATE_TRUNC('month', r.fechaVisado), 'YYYY-MM')`, 'clave')
        .addSelect('COUNT(r.id)', 'cantidad')
        .where('r.fechaVisado IS NOT NULL AND r.fechaVisado >= :inicio', { inicio: inicioHistorico })
        .groupBy('clave')
        .getRawMany<FilaConteo>(),
      reporteRepo
        .createQueryBuilder('r')
        .select('AVG(EXTRACT(EPOCH FROM (r.fechaVisado - r.fechaVisita)) / 3600)', 'horas')
        .where('r.fechaVisado IS NOT NULL')
        .getRawOne<{ horas: string | null }>(),
    ]);

    // Conteo por estado (todos los estados del enum, con 0 explícito)
    const reportesPorEstado = Object.values(EstadoReporte).reduce<Record<EstadoReporte, number>>(
      (acc, estado) => ({ ...acc, [estado]: 0 }),
      {} as Record<EstadoReporte, number>
    );
    for (const fila of conteoEstados) {
      if (fila.clave && esEstadoReporte(fila.clave)) {
        reportesPorEstado[fila.clave] = aEntero(fila.cantidad);
      }
    }

    const pipeline = FASES_PIPELINE.map((estado) => ({
      estado,
      etiqueta: ETIQUETAS_ESTADO[estado],
      cantidad: reportesPorEstado[estado],
    }));

    // Validación visual de evidencias
    const validacion = { APROBADO: 0, RECHAZADO: 0, PENDIENTE: 0 };
    for (const fila of conteoValidacion) {
      if (fila.clave === EstadoValidacionVisual.APROBADO) validacion.APROBADO = aEntero(fila.cantidad);
      else if (fila.clave === EstadoValidacionVisual.RECHAZADO) validacion.RECHAZADO = aEntero(fila.cantidad);
      else validacion.PENDIENTE += aEntero(fila.cantidad);
    }
    const totalEvidencias = validacion.APROBADO + validacion.RECHAZADO + validacion.PENDIENTE;
    const evaluadas = validacion.APROBADO + validacion.RECHAZADO;
    const tasaAprobacionVisual = evaluadas > 0 ? Math.round((validacion.APROBADO / evaluadas) * 1000) / 10 : null;

    // Estado de zonas (filas heredadas 'OK' cuentan como NORMAL)
    const zonasPorEstado: Record<EstadoZona, number> = {
      [EstadoZona.NORMAL]: 0,
      [EstadoZona.ALARMA]: 0,
      [EstadoZona.FALLA]: 0,
    };
    for (const fila of conteoZonas) {
      zonasPorEstado[normalizarEstadoZona(fila.clave)] += aEntero(fila.cantidad);
    }

    // Serie mensual continua (meses sin actividad = 0)
    const creados = new Map(creadosPorMes.map((f) => [f.clave ?? '', aEntero(f.cantidad)]));
    const visados = new Map(visadosPorMes.map((f) => [f.clave ?? '', aEntero(f.cantidad)]));
    const actividadMensual = Array.from({ length: MESES_HISTORICO }, (_, i) => {
      const fecha = new Date(inicioHistorico);
      fecha.setMonth(inicioHistorico.getMonth() + i);
      const clave = claveMes(fecha);
      return {
        mes: clave,
        etiqueta: fecha.toLocaleDateString('es-VE', { month: 'short', year: '2-digit' }),
        creados: creados.get(clave) ?? 0,
        visados: visados.get(clave) ?? 0,
      };
    });

    const horasPromedio = promedioVisado?.horas != null ? Number(promedioVisado.horas) : null;

    return NextResponse.json({
      ok: true,
      data: {
        generadoEn: new Date().toISOString(),
        totalRadiobases,
        totalTecnicos,
        totalReportes,
        reportesPorEstado,
        pipeline,
        totalEvidencias,
        evidenciasPorValidacion: validacion,
        evidenciasAprobadas: validacion.APROBADO,
        tasaAprobacionVisual,
        tasaAprobacionPorcentaje: tasaAprobacionVisual === null ? 'Sin evaluaciones' : `${tasaAprobacionVisual.toFixed(1)}%`,
        zonasPorEstado,
        reportesPorRegion: porRegion.map((f) => ({
          region: f.region,
          total: aEntero(f.total),
          visados: aEntero(f.visados),
        })),
        reportesPorTecnologia: porTecnologia.map((f) => ({
          tecnologia: f.clave ?? 'Sin especificar',
          cantidad: aEntero(f.cantidad),
        })),
        actividadMensual,
        horasPromedioHastaVisado: horasPromedio !== null && Number.isFinite(horasPromedio)
          ? Math.round(horasPromedio * 10) / 10
          : null,
      },
    });
  } catch (error) {
    return respuestaError(error, 'API Stats');
  }
}
