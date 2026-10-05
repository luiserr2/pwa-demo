/**
 * Utilidades de presentación para el documento imprimible del expediente.
 * Nunca inventan datos: si el valor no existe o es inválido devuelven '—'.
 */
import { EstadoReporte } from '@/shared/flujo-reporte';
import { EstadoZona } from '@/shared/catalogo-zonas';
import type { DatosRedApi, EquipoApi } from '@/shared/tipos-api';

export const SIN_DATO = '—';

const LOCALE = 'es-VE';

export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return SIN_DATO;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return SIN_DATO;
  return fecha.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatearFechaHora(iso: string | null | undefined): string {
  if (!iso) return SIN_DATO;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return SIN_DATO;
  return fecha.toLocaleString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Clases Tailwind del distintivo de estado del expediente. */
export const TONO_ESTADO_REPORTE: Record<EstadoReporte, string> = {
  [EstadoReporte.BORRADOR]: 'bg-slate-100 text-slate-700 border-slate-300',
  [EstadoReporte.SIN_EMPEZAR]: 'bg-slate-100 text-slate-700 border-slate-300',
  [EstadoReporte.EN_VISITA]: 'bg-amber-50 text-amber-800 border-amber-300',
  [EstadoReporte.ELABORANDO_INFORME]: 'bg-amber-50 text-amber-800 border-amber-300',
  [EstadoReporte.EN_REVISION]: 'bg-blue-50 text-blue-800 border-blue-300',
  [EstadoReporte.REVISION_INTERNA]: 'bg-blue-50 text-blue-800 border-blue-300',
  [EstadoReporte.ENVIADO_AL_CLIENTE]: 'bg-indigo-50 text-indigo-800 border-indigo-300',
  [EstadoReporte.OBSERVADO]: 'bg-rose-50 text-rose-800 border-rose-300',
  [EstadoReporte.APROBADO]: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  [EstadoReporte.VISADO]: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  [EstadoReporte.HES_SOLICITADA]: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  [EstadoReporte.FACTURADO]: 'bg-emerald-50 text-emerald-800 border-emerald-300',
};

/** Clases Tailwind por estado de zona: NORMAL verde, ALARMA ámbar, FALLA rojo. */
export const TONO_ESTADO_ZONA: Record<EstadoZona, string> = {
  [EstadoZona.NORMAL]: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  [EstadoZona.ALARMA]: 'bg-amber-50 text-amber-800 border-amber-300',
  [EstadoZona.FALLA]: 'bg-rose-50 text-rose-800 border-rose-300',
};

export const TONO_VALIDACION: Record<'PENDIENTE' | 'APROBADO' | 'RECHAZADO', string> = {
  PENDIENTE: 'bg-slate-100 text-slate-700 border-slate-300',
  APROBADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RECHAZADO: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const ETIQUETAS_VALIDACION: Record<'PENDIENTE' | 'APROBADO' | 'RECHAZADO', string> = {
  PENDIENTE: 'Pendiente de validación',
  APROBADO: 'Aprobada',
  RECHAZADO: 'Rechazada',
};

const ETIQUETAS_RED: ReadonlyArray<[keyof DatosRedApi, string]> = [
  ['ipWan', 'IP WAN'],
  ['ipLan', 'IP LAN'],
  ['gateway', 'Gateway'],
  ['mascara', 'Máscara'],
  ['vlanId', 'VLAN ID'],
  ['dns1', 'DNS primario'],
  ['dns2', 'DNS secundario'],
];

/** Solo los parámetros de red que realmente vienen informados. */
export function camposRedInformados(datosRed: DatosRedApi | null): Array<{ etiqueta: string; valor: string }> {
  if (!datosRed) return [];
  return ETIQUETAS_RED.flatMap(([clave, etiqueta]) => {
    const valor = datosRed[clave];
    return typeof valor === 'string' && valor.trim() !== '' ? [{ etiqueta, valor }] : [];
  });
}

export interface EquipoPresentable {
  id: string;
  descripcion: string;
  modelo: string;
  serial: string;
  cantidad: string;
}

function textoODefecto(valor: unknown): string {
  return typeof valor === 'string' && valor.trim() !== '' ? valor : SIN_DATO;
}

/** EquipoApi es un registro abierto: se leen los campos conocidos con guardas de tipo. */
export function equipoPresentable(equipo: EquipoApi): EquipoPresentable {
  const cantidad = equipo['cantidad'];
  return {
    id: equipo.id,
    descripcion: textoODefecto(equipo['descripcion']),
    modelo: textoODefecto(equipo['modelo']),
    serial: textoODefecto(equipo['serial']),
    cantidad: typeof cantidad === 'number' && Number.isFinite(cantidad) ? String(cantidad) : SIN_DATO,
  };
}
