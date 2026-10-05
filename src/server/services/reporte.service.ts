import { DataSource, Repository } from 'typeorm';
import {
  Reporte,
  EstadoReporte,
  ZonaMatriz,
  Radiobase,
  User,
  RolUsuario,
  EvidenciaFotografica,
  EstadoValidacionVisual,
} from '../entities';
import { generarHashDeterministaReporte } from '../security/auth-token';

export interface CrearReporteDTO {
  radiobaseId: string;
  tecnicoId: string;
  fechaVisita?: Date;
  observaciones?: string;
  datosRed?: {
    ipWan?: string;
    ipLan?: string;
    gateway?: string;
    mascara?: string;
    vlanId?: string;
    dns1?: string;
    dns2?: string;
  };
}

export class ReporteService {
  constructor(private dataSource: DataSource) {}

  private get reporteRepo(): Repository<Reporte> {
    return this.dataSource.getRepository(Reporte);
  }

  private get zonaRepo(): Repository<ZonaMatriz> {
    return this.dataSource.getRepository(ZonaMatriz);
  }

  private get radiobaseRepo(): Repository<Radiobase> {
    return this.dataSource.getRepository(Radiobase);
  }

  private get userRepo(): Repository<User> {
    return this.dataSource.getRepository(User);
  }

  /**
   * Genera el código normalizado de reporte: ${CodigoRadiobase}_${YYYYMMDD}
   */
  public generarCodigoReporte(codigoRadiobase: string, fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${codigoRadiobase}_${yyyy}${mm}${dd}`;
  }

  /**
   * Crea un nuevo reporte e inicializa atómicamente la matriz de las 48 zonas fijas.
   */
  async crearReporte(dto: CrearReporteDTO): Promise<Reporte> {
    const radiobase = await this.radiobaseRepo.findOneBy({ id: dto.radiobaseId });
    if (!radiobase) {
      throw new Error(`Radiobase con ID '${dto.radiobaseId}' no encontrada.`);
    }

    const tecnico = await this.userRepo.findOneBy({ id: dto.tecnicoId });
    if (!tecnico) {
      throw new Error(`Técnico con ID '${dto.tecnicoId}' no encontrado.`);
    }

    const fechaVisita = dto.fechaVisita || new Date();
    const codigo = this.generarCodigoReporte(radiobase.codigo, fechaVisita);

    // Transacción atómica: Crear Reporte + Inicializar 48 Zonas
    return await this.dataSource.transaction(async (manager) => {
      const reporte = manager.create(Reporte, {
        codigo,
        estado: EstadoReporte.BORRADOR,
        radiobaseId: radiobase.id,
        tecnicoId: tecnico.id,
        fechaVisita,
        observaciones: dto.observaciones || null,
        datosRed: dto.datosRed || null,
      });

      const reporteGuardado = await manager.save(Reporte, reporte);

      // Inicializar exactamente 48 zonas fijas
      const zonas: ZonaMatriz[] = [];
      for (let i = 1; i <= 48; i++) {
        const zona = manager.create(ZonaMatriz, {
          reporteId: reporteGuardado.id,
          numeroZona: i,
          descripcion: `Zona ${i}`,
          estado: 'OK',
        });
        zonas.push(zona);
      }

      await manager.save(ZonaMatriz, zonas);
      reporteGuardado.zonas = zonas;
      return reporteGuardado;
    });
  }

  /**
   * Transición de la máquina de estados con validación de roles y reglas de negocio.
   */
  async cambiarEstado(
    reporteId: string,
    nuevoEstado: EstadoReporte,
    usuarioEjecutor: { id: string; rol: RolUsuario },
    observacion?: string
  ): Promise<Reporte> {
    const reporte = await this.reporteRepo.findOne({
      where: { id: reporteId },
      relations: ['evidencias', 'zonas', 'tecnico', 'supervisor'],
    });

    if (!reporte) {
      throw new Error(`Reporte con ID '${reporteId}' no encontrado.`);
    }

    const estadoActual = reporte.estado;

    // Regla 1: BORRADOR -> EN_REVISION (El técnico solicita revisión)
    if (nuevoEstado === EstadoReporte.EN_REVISION || nuevoEstado === EstadoReporte.REVISION_INTERNA) {
      if (usuarioEjecutor.rol === RolUsuario.TECNICO && reporte.tecnicoId !== usuarioEjecutor.id) {
        throw new Error('Solo el técnico titular asignado o un Administrador puede enviar a revisión.');
      }
      if (!reporte.evidencias || reporte.evidencias.length === 0) {
        throw new Error('No se puede enviar a revisión un reporte sin evidencias fotográficas.');
      }
      reporte.estado = nuevoEstado;
    }

    // Regla 2: EN_REVISION -> OBSERVADO (El supervisor rechaza con observaciones)
    else if (nuevoEstado === EstadoReporte.OBSERVADO) {
      if (usuarioEjecutor.rol !== RolUsuario.SUPERVISOR && usuarioEjecutor.rol !== RolUsuario.ADMIN) {
        throw new Error('Solo un Supervisor o Administrador puede observar un reporte.');
      }
      if (!observacion || observacion.trim().length === 0) {
        throw new Error('Debe proporcionar un motivo u observación clara al rechazar el reporte.');
      }
      reporte.estado = EstadoReporte.OBSERVADO;
      reporte.supervisorId = usuarioEjecutor.id;
      reporte.observaciones = observacion;
    }

    // Regla 3: EN_REVISION / OBSERVADO -> APROBADO (El supervisor valida visualmente y aprueba)
    else if (nuevoEstado === EstadoReporte.APROBADO || nuevoEstado === EstadoReporte.VISADO) {
      if (usuarioEjecutor.rol !== RolUsuario.SUPERVISOR && usuarioEjecutor.rol !== RolUsuario.ADMIN) {
        throw new Error('Solo un Supervisor o Administrador puede aprobar el reporte.');
      }

      // Validar que ninguna foto esté marcada como RECHAZADA
      const tieneRechazadas = reporte.evidencias?.some(
        (e) => e.estadoValidacion === EstadoValidacionVisual.RECHAZADO
      );
      if (tieneRechazadas) {
        throw new Error('No se puede aprobar un reporte que contenga evidencias marcadas como RECHAZADAS.');
      }

      reporte.estado = nuevoEstado;
      reporte.supervisorId = usuarioEjecutor.id;
      if (observacion) {
        reporte.observaciones = observacion;
      }

      // Generar sello criptográfico inmutable SHA-256
      reporte.hashSha256 = generarHashDeterministaReporte({
        reporteId: reporte.id,
        codigoReporte: reporte.codigo,
        radiobaseId: reporte.radiobaseId,
        tecnicoId: reporte.tecnicoId,
        supervisorId: usuarioEjecutor.id,
        fechaAprobacion: new Date().toISOString(),
        totalZonas: reporte.zonas?.length || 48,
        totalEvidencias: reporte.evidencias?.length || 0,
      });
    }

    // Regla 4: Volver a BORRADOR para corregir
    else if (nuevoEstado === EstadoReporte.BORRADOR || nuevoEstado === EstadoReporte.SIN_EMPEZAR) {
      if (
        estadoActual !== EstadoReporte.OBSERVADO &&
        estadoActual !== EstadoReporte.REVISION_INTERNA &&
        usuarioEjecutor.rol !== RolUsuario.ADMIN
      ) {
        throw new Error('Solo se puede reabrir a borrador un reporte previamente observado.');
      }
      reporte.estado = nuevoEstado;
    }

    return await this.reporteRepo.save(reporte);
  }

  /**
   * Obtiene un reporte con todas sus relaciones cargadas.
   */
  async obtenerReportePorId(id: string): Promise<Reporte | null> {
    return await this.reporteRepo.findOne({
      where: { id },
      relations: ['radiobase', 'tecnico', 'supervisor', 'evidencias', 'zonas', 'equipos'],
      order: {
        zonas: { numeroZona: 'ASC' },
        evidencias: { slotNumero: 'ASC', momento: 'ASC' },
      },
    });
  }

  /**
   * Lista reportes con filtros opcionales.
   */
  async listarReportes(filtro?: {
    estado?: EstadoReporte;
    tecnicoId?: string;
    radiobaseId?: string;
  }): Promise<Reporte[]> {
    const qb = this.reporteRepo
      .createQueryBuilder('reporte')
      .leftJoinAndSelect('reporte.radiobase', 'radiobase')
      .leftJoinAndSelect('reporte.tecnico', 'tecnico')
      .leftJoinAndSelect('reporte.supervisor', 'supervisor')
      .leftJoinAndSelect('reporte.evidencias', 'evidencia')
      .orderBy('reporte.createdAt', 'DESC');

    if (filtro?.estado) {
      qb.andWhere('reporte.estado = :estado', { estado: filtro.estado });
    }
    if (filtro?.tecnicoId) {
      qb.andWhere('reporte.tecnicoId = :tecnicoId', { tecnicoId: filtro.tecnicoId });
    }
    if (filtro?.radiobaseId) {
      qb.andWhere('reporte.radiobaseId = :radiobaseId', { radiobaseId: filtro.radiobaseId });
    }

    return await qb.getMany();
  }
}
