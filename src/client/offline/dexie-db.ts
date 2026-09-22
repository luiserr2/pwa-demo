import Dexie, { Table } from 'dexie';

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

export class SisbircecaDexieDB extends Dexie {
  reportes!: Table<ReporteOffline, number>;
  evidencias!: Table<EvidenciaOffline, number>;

  constructor() {
    super('SisbircecaPWA_DB');
    this.version(1).stores({
      reportes: '++localId, reporteId, codigo, radiobaseId, sincronizado',
      evidencias: '++localId, reporteId, tipoEquipo, slotNumero, momento, sincronizado',
    });
  }
}

export const offlineDB = new SisbircecaDexieDB();
