/**
 * Catálogo canónico de la matriz de 48 zonas de supervisión — módulo puro compartido cliente/servidor.
 */

export enum EstadoZona {
  NORMAL = 'NORMAL',
  ALARMA = 'ALARMA',
  FALLA = 'FALLA',
}

export enum SubsistemaZona {
  TORRE = 'TORRE',
  SHELTER = 'SHELTER',
  ENERGIA_DC = 'ENERGIA_DC',
  RADIOFRECUENCIA = 'RADIOFRECUENCIA',
  TIERRA = 'TIERRA',
}

export const TOTAL_ZONAS = 48;

export const ETIQUETAS_ESTADO_ZONA: Record<EstadoZona, string> = {
  [EstadoZona.NORMAL]: 'Normal',
  [EstadoZona.ALARMA]: 'Alarma',
  [EstadoZona.FALLA]: 'Falla',
};

export const ETIQUETAS_SUBSISTEMA: Record<SubsistemaZona, string> = {
  [SubsistemaZona.TORRE]: 'Torre',
  [SubsistemaZona.SHELTER]: 'Shelter',
  [SubsistemaZona.ENERGIA_DC]: 'Energía DC',
  [SubsistemaZona.RADIOFRECUENCIA]: 'Radiofrecuencia',
  [SubsistemaZona.TIERRA]: 'Puesta a tierra',
};

export interface DefinicionZona {
  numeroZona: number;
  descripcion: string;
  subsistema: SubsistemaZona;
}

const T = SubsistemaZona.TORRE;
const S = SubsistemaZona.SHELTER;
const E = SubsistemaZona.ENERGIA_DC;
const R = SubsistemaZona.RADIOFRECUENCIA;
const G = SubsistemaZona.TIERRA;

const DEFINICIONES: ReadonlyArray<[string, SubsistemaZona]> = [
  ['Cerco Perimetral Norte', T],
  ['Cerco Perimetral Sur', T],
  ['Cerco Perimetral Este', T],
  ['Cerco Perimetral Oeste', T],
  ['Puerta de Ingreso Principal', T],
  ['Portón Vehicular', T],
  ['Sensor Sísmico Torre Base', T],
  ['Sensor Sísmico Mástil', T],
  ['PIR Gabinete Baterías', E],
  ['PIR Shelter Principal', S],
  ['Detector Humo Shelter', S],
  ['Detector Inundación Fosa', S],
  ['Tamper Gabinete Rectificadores', E],
  ['Tamper Caja Distribución AC', E],
  ['Tamper Tablero Transferencia', E],
  ['Sensor Apertura Rack 1', S],
  ['Sensor Apertura Rack 2', S],
  ['Sensor Apertura Rack 3', S],
  ['Botón Pánico Caseta', S],
  ['Botón Pánico Portón', S],
  ['Microondas Enlace Principal', R],
  ['Microondas Backup', R],
  ['Baliza Obstrucción Aeronáutica L1', T],
  ['Baliza Obstrucción L2', T],
  ['Cámara PTZ Domo 1', S],
  ['Cámara Fija Perimetral 2', S],
  ['Cámara Entrada Shelter', S],
  ['Cámara Panorámica Torre', T],
  ['Monitoreo Generador Diesel', E],
  ['Sensor Nivel Combustible', E],
  ['Sensor Temperatura Shelter', S],
  ['Sensor Flujo Aire Acondicionado', S],
  ['Sensor Puesta a Tierra Torre', G],
  ['Sensor Descargador Sobretensión', G],
  ['Alarma Falla Red Comercial', E],
  ['Alarma Batería Baja', E],
  ['Sensor Vibración Escalerilla', T],
  ['Tamper Climatizador 1', S],
  ['Tamper Climatizador 2', S],
  ['Detector Rotura Vidrio', S],
  ['Sensor Infrarrojo Barrera 1', S],
  ['Sensor Infrarrojo Barrera 2', S],
  ['Contacto Magnético Escotilla', S],
  ['Sirena Exterior Torre', T],
  ['Sirena Interior Shelter', S],
  ['Estroboscópica Baliza', T],
  ['Luz Emergencia LED', S],
  ['Cierre Electromagnético Acceso', S],
];

export const CATALOGO_ZONAS: readonly DefinicionZona[] = DEFINICIONES.map(([descripcion, subsistema], i) => ({
  numeroZona: i + 1,
  descripcion,
  subsistema,
}));

export function definicionZona(numeroZona: number): DefinicionZona {
  const def = CATALOGO_ZONAS[numeroZona - 1];
  if (!def) {
    throw new Error(`Número de zona fuera de rango: ${numeroZona}. Debe estar entre 1 y ${TOTAL_ZONAS}.`);
  }
  return def;
}

export function zonaRequiereObservacion(estado: EstadoZona | string): boolean {
  return estado === EstadoZona.ALARMA || estado === EstadoZona.FALLA;
}

/** Normaliza estados heredados ('OK', 'OBSERVADO', 'NO_APLICA') al catálogo vigente. */
export function normalizarEstadoZona(valor: string | null | undefined): EstadoZona {
  if (valor === EstadoZona.ALARMA) return EstadoZona.ALARMA;
  if (valor === EstadoZona.FALLA) return EstadoZona.FALLA;
  return EstadoZona.NORMAL;
}
