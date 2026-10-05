import Dexie, { Table } from 'dexie';
import type { EstadoZona } from '@/shared/catalogo-zonas';

export interface ReporteOffline {
  localId?: number;
  reporteId?: string;
  codigo: string;
  radiobaseId: string;
  nombreRadiobase: string;
  tecnicoId: string;
  fechaVisita: string;
  observaciones?: string;
  sincronizado: boolean;
  actualizadoEn: string;
}

export interface EvidenciaOffline {
  localId?: number;
  reporteId: string;
  tipoEquipo: string;
  slotNumero: number;
  momento: 'ANTES' | 'DESPUES';
  blobData: Blob;
  previewUrl: string;
  sincronizado: boolean;
  creadoEn: string;
}

/** Estado local de cada una de las 48 zonas por expediente (persistencia en tiempo real sin señal). */
export interface ZonaOffline {
  localId?: number;
  reporteId: string;
  numeroZona: number;
  estado: EstadoZona;
  observacion: string | null;
  sincronizado: boolean;
  actualizadoEn: string;
}

export class SisbircecaDexieDB extends Dexie {
  reportes!: Table<ReporteOffline, number>;
  evidencias!: Table<EvidenciaOffline, number>;
  zonas!: Table<ZonaOffline, number>;

  constructor() {
    super('SisbircecaPWA_DB');
    this.version(1).stores({
      reportes: '++localId, reporteId, codigo, radiobaseId, sincronizado',
      evidencias: '++localId, reporteId, tipoEquipo, slotNumero, momento, sincronizado',
    });
    this.version(2).stores({
      reportes: '++localId, reporteId, codigo, radiobaseId, sincronizado',
      evidencias: '++localId, reporteId, tipoEquipo, slotNumero, momento, sincronizado',
      zonas: '++localId, reporteId, numeroZona, estado, sincronizado, [reporteId+numeroZona]',
    });
  }
}

export const offlineDB = new SisbircecaDexieDB();
