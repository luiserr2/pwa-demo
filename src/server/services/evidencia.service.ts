import { DataSource, Repository } from 'typeorm';
import {
  EvidenciaFotografica,
  MomentoFoto,
  EstadoValidacionVisual,
  Reporte,
} from '../entities';

export interface RegistrarEvidenciaDTO {
  reporteId: string;
  tipoEquipo: string;
  slotNumero: number;
  momento: MomentoFoto;
  urlImagen: string;
}

export interface EvaluacionVisualDTO {
  evidenciaId: string;
  estado: EstadoValidacionVisual;
  observacionRechazo?: string;
  supervisorId: string;
}

export class EvidenciaService {
  constructor(private dataSource: DataSource) {}

  private get evidenciaRepo(): Repository<EvidenciaFotografica> {
    return this.dataSource.getRepository(EvidenciaFotografica);
  }

  private get reporteRepo(): Repository<Reporte> {
    return this.dataSource.getRepository(Reporte);
  }

  /**
   * Registra o actualiza una evidencia fotográfica aplicando la Regla Crítica de Avance:
   * No se permite registrar foto 'DESPUES' si la foto 'ANTES' no existe previamente en ese slot.
   */
  async registrarEvidencia(dto: RegistrarEvidenciaDTO): Promise<EvidenciaFotografica> {
    const reporte = await this.reporteRepo.findOneBy({ id: dto.reporteId });
    if (!reporte) {
      throw new Error(`Reporte con ID '${dto.reporteId}' no encontrado.`);
    }
    if (reporte.bloqueadoEdicion) {
      throw new Error(`El reporte '${reporte.codigo}' está visado y bloqueado para edición.`);
    }

    // Regla Crítica de Bloqueo "Antes/Después"
    if (dto.momento === MomentoFoto.DESPUES) {
      const fotoAntes = await this.evidenciaRepo.findOne({
        where: {
          reporteId: dto.reporteId,
          tipoEquipo: dto.tipoEquipo,
          slotNumero: dto.slotNumero,
          momento: MomentoFoto.ANTES,
        },
      });

      if (!fotoAntes || !fotoAntes.urlImagen) {
        throw new Error(
          `Regla de Bloqueo: No se puede capturar la foto 'DESPUES' para el slot ${dto.tipoEquipo} #${dto.slotNumero} sin haber completado la foto 'ANTES'.`
        );
      }
    }

    // Buscar si ya existe para ese slot y momento específico
    let evidencia = await this.evidenciaRepo.findOne({
      where: {
        reporteId: dto.reporteId,
        tipoEquipo: dto.tipoEquipo,
        slotNumero: dto.slotNumero,
        momento: dto.momento,
      },
    });

    if (evidencia) {
      evidencia.urlImagen = dto.urlImagen;
      evidencia.estadoValidacion = EstadoValidacionVisual.PENDIENTE;
      evidencia.observacionRechazo = null;
    } else {
      evidencia = this.evidenciaRepo.create({
        reporteId: dto.reporteId,
        tipoEquipo: dto.tipoEquipo,
        slotNumero: dto.slotNumero,
        momento: dto.momento,
        urlImagen: dto.urlImagen,
        estadoValidacion: EstadoValidacionVisual.PENDIENTE,
        observacionRechazo: null,
      });
    }

    return await this.evidenciaRepo.save(evidencia);
  }

  /**
   * Validación Visual por parte del Supervisor técnico:
   * Aprueba o Rechaza la foto individualmente con feedback visual.
   */
  async evaluarVisualmente(dto: EvaluacionVisualDTO): Promise<EvidenciaFotografica> {
    const evidencia = await this.evidenciaRepo.findOneBy({ id: dto.evidenciaId });
    if (!evidencia) {
      throw new Error(`Evidencia con ID '${dto.evidenciaId}' no encontrada.`);
    }

    if (dto.estado === EstadoValidacionVisual.RECHAZADO && (!dto.observacionRechazo || dto.observacionRechazo.trim().length === 0)) {
      throw new Error('Debe especificar una observación visual al rechazar una fotografía (ej: desenfoque, ángulo incorrecto, obstrucción).');
    }

    evidencia.estadoValidacion = dto.estado;
    evidencia.observacionRechazo = dto.estado === EstadoValidacionVisual.RECHAZADO ? dto.observacionRechazo || null : null;

    return await this.evidenciaRepo.save(evidencia);
  }
}
