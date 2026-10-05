/**
 * Reglas de transición del lado cliente: derivadas 100% de TRANSICIONES_PERMITIDAS.
 * El backend vuelve a validar todo; esto solo evita ofrecer movimientos imposibles.
 */
import {
  ESTADOS_SOLO_SUPERVISION,
  FASES_PIPELINE,
  TRANSICIONES_PERMITIDAS,
  EstadoReporte,
  esEstadoReporte,
  esTransicionPermitida,
} from '@/shared/flujo-reporte';
import type { RolApi } from '@/shared/tipos-api';

export type TipoAccion = 'avanzar' | 'retroceder' | 'observar' | 'mover';

export interface AccionTransicion {
  destino: EstadoReporte;
  tipo: TipoAccion;
  bloqueadaPorRol: boolean;
}

export function requiereSupervision(destino: EstadoReporte): boolean {
  return ESTADOS_SOLO_SUPERVISION.includes(destino);
}

export function bloqueadaPorRol(destino: EstadoReporte, rol: RolApi | null): boolean {
  return rol === 'TECNICO' && requiereSupervision(destino);
}

export function transicionValida(origen: string, destino: EstadoReporte): boolean {
  return esEstadoReporte(origen) && esTransicionPermitida(origen, destino);
}

export function destinosValidos(origen: string): readonly EstadoReporte[] {
  return esEstadoReporte(origen) ? TRANSICIONES_PERMITIDAS[origen] : [];
}

function clasificar(origen: EstadoReporte, destino: EstadoReporte): TipoAccion {
  if (destino === EstadoReporte.OBSERVADO) return 'observar';
  const iOrigen = FASES_PIPELINE.indexOf(origen);
  const iDestino = FASES_PIPELINE.indexOf(destino);
  if (iOrigen === -1 || iDestino === -1) return 'mover';
  return iDestino > iOrigen ? 'avanzar' : 'retroceder';
}

const ORDEN_TIPO: Record<TipoAccion, number> = { retroceder: 0, mover: 1, observar: 2, avanzar: 3 };

export function accionesDisponibles(origen: string, rol: RolApi | null): AccionTransicion[] {
  if (!esEstadoReporte(origen)) return [];
  return TRANSICIONES_PERMITIDAS[origen]
    .map((destino) => ({
      destino,
      tipo: clasificar(origen, destino),
      bloqueadaPorRol: bloqueadaPorRol(destino, rol),
    }))
    .sort((a, b) => ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo]);
}
