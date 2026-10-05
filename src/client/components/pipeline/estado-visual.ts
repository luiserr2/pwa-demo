/**
 * Identidad visual por estado del expediente VERTEX (Kanban + Expedientes).
 * Solo presentación: la semántica vive en src/shared/flujo-reporte.ts.
 */
import { EstadoReporte } from '@/shared/flujo-reporte';

/** Clases Tailwind para el badge/cabecera de cada estado. */
export const ESTILO_ESTADO: Record<EstadoReporte, string> = {
  [EstadoReporte.SIN_EMPEZAR]: 'bg-slate-200 text-slate-700 border-slate-300',
  [EstadoReporte.EN_VISITA]: 'bg-amber-100 text-amber-700 border-amber-200',
  [EstadoReporte.ELABORANDO_INFORME]: 'bg-blue-100 text-blue-700 border-blue-200',
  [EstadoReporte.REVISION_INTERNA]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [EstadoReporte.ENVIADO_AL_CLIENTE]: 'bg-purple-100 text-purple-700 border-purple-200',
  [EstadoReporte.VISADO]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [EstadoReporte.HES_SOLICITADA]: 'bg-orange-100 text-orange-700 border-orange-200',
  [EstadoReporte.FACTURADO]: 'bg-slate-800 text-slate-100 border-slate-800',
  [EstadoReporte.OBSERVADO]: 'bg-rose-100 text-rose-700 border-rose-200',
  [EstadoReporte.BORRADOR]: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  [EstadoReporte.EN_REVISION]: 'bg-sky-100 text-sky-700 border-sky-200',
  [EstadoReporte.APROBADO]: 'bg-teal-100 text-teal-700 border-teal-200',
};

const ESTILO_DESCONOCIDO = 'bg-slate-100 text-slate-500 border-slate-200';

/** Estados heredados que no pertenecen al pipeline de 8 fases. */
export const ESTADOS_FUERA_PIPELINE: readonly EstadoReporte[] = [
  EstadoReporte.BORRADOR,
  EstadoReporte.EN_REVISION,
  EstadoReporte.APROBADO,
];

export function estiloEstado(estado: string): string {
  return (ESTILO_ESTADO as Record<string, string | undefined>)[estado] ?? ESTILO_DESCONOCIDO;
}

/** Formatea una fecha ISO-8601 para la UI. Devuelve null si no es una fecha válida. */
export function formatearFecha(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}
