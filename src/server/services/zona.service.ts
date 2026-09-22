import { DataSource, Repository } from 'typeorm';
import { ZonaMatriz } from '../entities';

export interface ActualizarZonaDTO {
  numeroZona: number;
  descripcion: string;
  estado: string;
}

export class ZonaService {
  constructor(private dataSource: DataSource) {}

  private get zonaRepo(): Repository<ZonaMatriz> {
    return this.dataSource.getRepository(ZonaMatriz);
  }

  /**
   * Actualiza en lote las 48 zonas de un reporte.
   */
  async guardarZonasLote(
    reporteId: string,
    zonasData: ActualizarZonaDTO[]
  ): Promise<ZonaMatriz[]> {
    if (!zonasData || zonasData.length === 0) {
      throw new Error('Debe proporcionar el listado de zonas a actualizar.');
    }

    const zonasExistentes = await this.zonaRepo.find({
      where: { reporteId },
      order: { numeroZona: 'ASC' },
    });

    if (zonasExistentes.length === 0) {
      throw new Error(`No se encontraron zonas inicializadas para el reporte '${reporteId}'.`);
    }

    const mapaExistentes = new Map(zonasExistentes.map((z) => [z.numeroZona, z]));

    for (const item of zonasData) {
      const zona = mapaExistentes.get(item.numeroZona);
      if (zona) {
        zona.descripcion = item.descripcion ?? zona.descripcion;
        zona.estado = item.estado ?? zona.estado;
      }
    }

    return await this.zonaRepo.save(Array.from(mapaExistentes.values()));
  }
}
