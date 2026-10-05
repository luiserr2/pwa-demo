/**
 * Persistencia offline-first del expediente de campo (Dexie / IndexedDB).
 * Nota: IndexedDB no indexa booleanos, por eso `sincronizado` se filtra en memoria (filter),
 * nunca con where('sincronizado').
 */
import { offlineDB, type EvidenciaOffline, type ZonaOffline } from '@/client/offline/dexie-db';
import {
  CATALOGO_ZONAS,
  EstadoZona,
  type SubsistemaZona,
} from '@/shared/catalogo-zonas';
import { esUuidValido } from './api-campo';

export type MomentoEvidencia = 'ANTES' | 'DESPUES';

export interface ZonaEstadoLocal {
  numeroZona: number;
  descripcion: string;
  subsistema: SubsistemaZona;
  estado: EstadoZona;
  observacion: string;
}

export function zonasDesdeCatalogo(): ZonaEstadoLocal[] {
  return CATALOGO_ZONAS.map((def) => ({
    numeroZona: def.numeroZona,
    descripcion: def.descripcion,
    subsistema: def.subsistema,
    estado: EstadoZona.NORMAL,
    observacion: '',
  }));
}

/** Fusiona el catálogo canónico con los estados guardados (zonas sin registro → NORMAL). */
export function fusionarZonas(
  registros: ReadonlyArray<{ numeroZona: number; estado: EstadoZona; observacion: string | null }>
): ZonaEstadoLocal[] {
  const porNumero = new Map(registros.map((r) => [r.numeroZona, r]));
  return zonasDesdeCatalogo().map((zona) => {
    const guardada = porNumero.get(zona.numeroZona);
    return guardada
      ? { ...zona, estado: guardada.estado, observacion: guardada.observacion ?? '' }
      : zona;
  });
}

export async function cargarZonasLocales(reporteId: string): Promise<ZonaOffline[]> {
  return offlineDB.zonas.where('reporteId').equals(reporteId).toArray();
}

/** Upsert atómico por [reporteId+numeroZona] (la transacción rw serializa escrituras concurrentes). */
export async function guardarZonasLocales(
  reporteId: string,
  zonas: ReadonlyArray<{ numeroZona: number; estado: EstadoZona; observacion: string }>,
  sincronizado: boolean
): Promise<void> {
  const ahora = new Date().toISOString();
  await offlineDB.transaction('rw', offlineDB.zonas, async () => {
    for (const zona of zonas) {
      const existente = await offlineDB.zonas
        .where('[reporteId+numeroZona]')
        .equals([reporteId, zona.numeroZona])
        .first();
      const registro: ZonaOffline = {
        reporteId,
        numeroZona: zona.numeroZona,
        estado: zona.estado,
        observacion: zona.observacion.trim() === '' ? null : zona.observacion,
        sincronizado,
        actualizadoEn: ahora,
      };
      if (existente?.localId !== undefined) {
        await offlineDB.zonas.update(existente.localId, registro);
      } else {
        await offlineDB.zonas.add(registro);
      }
    }
  });
}

export async function marcarZonasSincronizadas(reporteId: string): Promise<void> {
  await offlineDB.zonas.where('reporteId').equals(reporteId).modify({ sincronizado: true });
}

/** Evidencias del expediente, conservando solo la captura más reciente por slot + momento. */
export async function cargarEvidenciasLocales(reporteId: string): Promise<EvidenciaOffline[]> {
  const todas = await offlineDB.evidencias.where('reporteId').equals(reporteId).toArray();
  const vigentes = new Map<string, EvidenciaOffline>();
  for (const ev of todas) {
    const clave = `${ev.slotNumero}:${ev.momento}`;
    const previa = vigentes.get(clave);
    if (!previa || previa.creadoEn < ev.creadoEn) {
      vigentes.set(clave, ev);
    }
  }
  return Array.from(vigentes.values());
}

/** Reemplaza la evidencia de un slot/momento (repetir foto no deja duplicados en la cola). */
export async function guardarEvidenciaLocal(params: {
  reporteId: string;
  slotNumero: number;
  tipoEquipo: string;
  momento: MomentoEvidencia;
  blob: Blob;
  previewUrl: string;
}): Promise<EvidenciaOffline> {
  const registro: EvidenciaOffline = {
    reporteId: params.reporteId,
    tipoEquipo: params.tipoEquipo,
    slotNumero: params.slotNumero,
    momento: params.momento,
    blobData: params.blob,
    previewUrl: params.previewUrl,
    sincronizado: false,
    creadoEn: new Date().toISOString(),
  };
  await offlineDB.transaction('rw', offlineDB.evidencias, async () => {
    await offlineDB.evidencias
      .where('reporteId')
      .equals(params.reporteId)
      .filter((ev) => ev.slotNumero === params.slotNumero && ev.momento === params.momento)
      .delete();
    registro.localId = await offlineDB.evidencias.add(registro);
  });
  return registro;
}

export async function marcarEvidenciasSincronizadas(localIds: readonly number[]): Promise<void> {
  if (localIds.length === 0) return;
  await offlineDB.evidencias.where('localId').anyOf([...localIds]).modify({ sincronizado: true });
}

export interface PendientesLocales {
  evidencias: number;
  zonas: number;
  /** reporteId con al menos una foto o zona sin sincronizar en este dispositivo. */
  reportes: Set<string>;
  /** Capturas heredadas sin UUID de expediente (versión anterior): el backend no las acepta. */
  huerfanas: number;
}

export async function contarPendientesGlobales(): Promise<PendientesLocales> {
  const [evidencias, zonas] = await Promise.all([
    offlineDB.evidencias.filter((ev) => !ev.sincronizado).toArray(),
    offlineDB.zonas.filter((z) => !z.sincronizado).toArray(),
  ]);
  const evidenciasValidas = evidencias.filter((e) => esUuidValido(e.reporteId));
  const zonasValidas = zonas.filter((z) => esUuidValido(z.reporteId));
  const reportes = new Set<string>([
    ...evidenciasValidas.map((e) => e.reporteId),
    ...zonasValidas.map((z) => z.reporteId),
  ]);
  return {
    evidencias: evidenciasValidas.length,
    zonas: zonasValidas.length,
    reportes,
    huerfanas: evidencias.length - evidenciasValidas.length + (zonas.length - zonasValidas.length),
  };
}

export function blobADataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se pudo leer la imagen almacenada localmente.'));
    lector.onload = () => {
      if (typeof lector.result === 'string') {
        resolve(lector.result);
      } else {
        reject(new Error('Formato de imagen local inesperado.'));
      }
    };
    lector.readAsDataURL(blob);
  });
}

export function formatearTamano(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
