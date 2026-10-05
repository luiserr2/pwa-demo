import { DataSource, EntityManager, Repository } from 'typeorm';
import { ZonaMatriz } from '../entities';
import {
  EstadoZona,
  TOTAL_ZONAS,
  definicionZona,
  zonaRequiereObservacion,
} from '../../shared/catalogo-zonas';

export interface ActualizarZonaDTO {
  numeroZona: number;
  estado: EstadoZona;
  descripcion?: string;
  observacion?: string | null;
}

export interface CambioZona {
  numeroZona: number;
  estadoAnterior: EstadoZona;
  estadoNuevo: EstadoZona;
  observacion: string | null;
}

const ESTADOS_VALIDOS = Object.values(EstadoZona) as string[];

export class ZonaService {
  constructor(private dataSource: DataSource) {}

  private repo(manager?: EntityManager): Repository<ZonaMatriz> {
    return manager ? manager.getRepository(ZonaMatriz) : this.dataSource.getRepository(ZonaMatriz);
  }

  /**
   * Valida el lote antes de tocar la base de datos:
   * rango 1..48, estado del catálogo y observación obligatoria para ALARMA / FALLA.
   */
  validarLote(zonasData: ActualizarZonaDTO[]): void {
    if (!zonasData || zonasData.length === 0) {
      throw new Error('Debe proporcionar el listado de zonas a actualizar.');
    }
    const vistos = new Set<number>();
    for (const item of zonasData) {
      if (!Number.isInteger(item.numeroZona) || item.numeroZona < 1 || item.numeroZona > TOTAL_ZONAS) {
        throw new Error(`Número de zona fuera de rango: ${item.numeroZona}. Debe estar entre 1 y ${TOTAL_ZONAS}.`);
      }
      if (vistos.has(item.numeroZona)) {
        throw new Error(`La zona ${item.numeroZona} está duplicada en el lote.`);
      }
      vistos.add(item.numeroZona);
      if (!ESTADOS_VALIDOS.includes(item.estado)) {
        throw new Error(`Estado de zona inválido '${item.estado}' en la zona ${item.numeroZona}.`);
      }
      if (zonaRequiereObservacion(item.estado) && !item.observacion?.trim()) {
        throw new Error(
          `La zona ${item.numeroZona} está en ${item.estado}: la observación técnica es obligatoria.`
        );
      }
    }
  }

  /**
   * Actualiza en lote las zonas de un reporte y devuelve la matriz completa junto con los cambios efectivos.
   */
  async guardarZonasLoteConCambios(
    reporteId: string,
    zonasData: ActualizarZonaDTO[],
    manager?: EntityManager
  ): Promise<{ zonas: ZonaMatriz[]; cambios: CambioZona[] }> {
    this.validarLote(zonasData);
    const repo = this.repo(manager);

    const zonasExistentes = await repo.find({
      where: { reporteId },
      order: { numeroZona: 'ASC' },
    });

    if (zonasExistentes.length === 0) {
      throw new Error(`No se encontraron zonas inicializadas para el reporte '${reporteId}'.`);
    }

    const mapaExistentes = new Map(zonasExistentes.map((z) => [z.numeroZona, z]));
    const cambios: CambioZona[] = [];

    for (const item of zonasData) {
      const zona = mapaExistentes.get(item.numeroZona);
      if (!zona) {
        throw new Error(`La zona ${item.numeroZona} no existe en el reporte '${reporteId}'.`);
      }
      const observacion = zonaRequiereObservacion(item.estado) ? item.observacion?.trim() ?? null : null;
      if (zona.estado !== item.estado || (zona.observacion ?? null) !== observacion) {
        cambios.push({
          numeroZona: zona.numeroZona,
          estadoAnterior: zona.estado,
          estadoNuevo: item.estado,
          observacion,
        });
      }
      zona.estado = item.estado;
      zona.observacion = observacion;
      if (item.descripcion?.trim()) {
        zona.descripcion = item.descripcion.trim();
      }
      if (!zona.subsistema) {
        zona.subsistema = definicionZona(zona.numeroZona).subsistema;
      }
    }

    const zonas = await repo.save(Array.from(mapaExistentes.values()));
    return { zonas, cambios };
  }

  /** Compatibilidad: actualiza el lote y devuelve solo la matriz. */
  async guardarZonasLote(
    reporteId: string,
    zonasData: ActualizarZonaDTO[],
    manager?: EntityManager
  ): Promise<ZonaMatriz[]> {
    const { zonas } = await this.guardarZonasLoteConCambios(reporteId, zonasData, manager);
    return zonas;
  }
}
