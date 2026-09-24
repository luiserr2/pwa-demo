import { DataSource, Repository, Like } from 'typeorm';
import { Radiobase } from '../entities/Radiobase';

export interface CrearRadiobaseDTO {
  codigo: string;
  nombre: string;
  region: string;
  tecnologia?: string;
  tipoTorre?: string;
}

export class RadiobaseService {
  constructor(private dataSource: DataSource) {}

  private get repo(): Repository<Radiobase> {
    return this.dataSource.getRepository(Radiobase);
  }

  async listarRadiobases(filtro?: { busqueda?: string; region?: string }): Promise<Radiobase[]> {
    const qb = this.repo.createQueryBuilder('rb').orderBy('rb.codigo', 'ASC');

    if (filtro?.region && filtro.region !== 'TODAS') {
      qb.andWhere('rb.region = :region', { region: filtro.region });
    }

    if (filtro?.busqueda) {
      qb.andWhere('(LOWER(rb.nombre) LIKE LOWER(:term) OR LOWER(rb.codigo) LIKE LOWER(:term))', {
        term: `%${filtro.busqueda}%`,
      });
    }

    return await qb.getMany();
  }

  async obtenerPorId(id: string): Promise<Radiobase | null> {
    return await this.repo.findOneBy({ id });
  }

  async obtenerPorCodigo(codigo: string): Promise<Radiobase | null> {
    return await this.repo.findOneBy({ codigo: codigo.toUpperCase() });
  }

  async crearRadiobase(dto: CrearRadiobaseDTO): Promise<Radiobase> {
    const codigoUpper = dto.codigo.trim().toUpperCase();
    const existe = await this.obtenerPorCodigo(codigoUpper);
    if (existe) {
      throw new Error(`Ya existe una radiobase registrada con el código '${codigoUpper}'.`);
    }

    const radiobase = this.repo.create({
      codigo: codigoUpper,
      nombre: dto.nombre.trim(),
      region: dto.region.trim(),
      tecnologia: dto.tecnologia?.trim() || '4G / 5G LTE Dual',
      tipoTorre: dto.tipoTorre?.trim() || 'Mástil Autosoportado',
    });

    return await this.repo.save(radiobase);
  }
}
