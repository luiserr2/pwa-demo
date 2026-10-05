import { DataSource, Repository } from 'typeorm';
import {
  Reporte,
  EstadoReporte,
  ZonaMatriz,
  Radiobase,
  User,
  RolUsuario,
  EstadoValidacionVisual,
} from '../entities';
import { generarHashContenidoReporte } from '../security/auth-token';
import {
  CANALES_RADICACION,
  ESTADOS_SOLO_SUPERVISION,
  ETIQUETAS_ESTADO,
  esTransicionPermitida,
  type CanalRadicacion,
} from '../../shared/flujo-reporte';
import {
  CATALOGO_ZONAS,
  EstadoZona,
  TOTAL_ZONAS,
  zonaRequiereObservacion,
} from '../../shared/catalogo-zonas';
import { AuditoriaService } from './auditoria.service';
import {
  PermisoDenegadoError,
  RecursoNoEncontradoError,
  ReglaNegocioError,
  TransicionInvalidaError,
} from './errores';

export interface CrearReporteDTO {
  /** UUID generado en el cliente (offline-first). Si se omite lo genera Postgres. */
  id?: string;
  radiobaseId: string;
  tecnicoId: string;
  /** Usuario que origina el expediente (auditoría). Por defecto, el técnico. */
  creadoPorId?: string;
  estadoInicial?: EstadoReporte.SIN_EMPEZAR | EstadoReporte.EN_VISITA;
  fechaVisita?: Date;
  observaciones?: string;
  ip?: string | null;
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

export interface ActorTransicion {
  id: string;
  rol: RolUsuario;
}

export interface DatosTransicion {
  motivoRechazo?: string;
  canalRadicacion?: string;
  numeroTicketCliente?: string;
  numeroHes?: string;
  fechaHes?: Date;
  ip?: string | null;
}

/** Cambios parciales admitidos por Repository.update (QueryDeepPartialEntity<Reporte>). */
type CambiosReporte = Parameters<Repository<Reporte>['update']>[1];

const ROLES_SUPERVISION: readonly RolUsuario[] = [RolUsuario.SUPERVISOR, RolUsuario.ADMIN];
const PATRON_HES = /^[A-Za-z0-9][A-Za-z0-9\-_/. ]{2,99}$/;

function textoLimpio(valor: string | null | undefined): string {
  return (valor ?? '').trim();
}

export class ReporteService {
  private readonly auditoria: AuditoriaService;

  constructor(private dataSource: DataSource) {
    this.auditoria = new AuditoriaService(dataSource);
  }

  private get reporteRepo(): Repository<Reporte> {
    return this.dataSource.getRepository(Reporte);
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

  /** Resuelve colisiones de código (misma radiobase, mismo día) con sufijo incremental _2, _3… */
  private async resolverCodigoUnico(base: string): Promise<string> {
    let candidato = base;
    for (let intento = 2; intento <= 100; intento++) {
      const existente = await this.reporteRepo.findOne({ where: { codigo: candidato }, select: { id: true } });
      if (!existente) return candidato;
      candidato = `${base}_${intento}`;
    }
    throw new ReglaNegocioError(`No fue posible asignar un código único para '${base}'.`);
  }

  /**
   * Crea un nuevo reporte e inicializa atómicamente la matriz de las 48 zonas del catálogo canónico.
   */
  async crearReporte(dto: CrearReporteDTO): Promise<Reporte> {
    const radiobase = await this.radiobaseRepo.findOneBy({ id: dto.radiobaseId });
    if (!radiobase) {
      throw new RecursoNoEncontradoError(`Radiobase con ID '${dto.radiobaseId}' no encontrada.`);
    }

    const tecnico = await this.userRepo.findOneBy({ id: dto.tecnicoId });
    if (!tecnico) {
      throw new RecursoNoEncontradoError(`Técnico con ID '${dto.tecnicoId}' no encontrado.`);
    }

    const fechaVisita = dto.fechaVisita || new Date();
    const codigo = await this.resolverCodigoUnico(this.generarCodigoReporte(radiobase.codigo, fechaVisita));
    const estadoInicial = dto.estadoInicial ?? EstadoReporte.SIN_EMPEZAR;

    return await this.dataSource.transaction(async (manager) => {
      const reporte = manager.create(Reporte, {
        ...(dto.id ? { id: dto.id } : {}),
        codigo,
        estado: estadoInicial,
        radiobaseId: radiobase.id,
        tecnicoId: tecnico.id,
        fechaVisita,
        observaciones: dto.observaciones || null,
        datosRed: dto.datosRed || null,
        bloqueadoEdicion: false,
      });

      const reporteGuardado = await manager.save(Reporte, reporte);

      const zonas: ZonaMatriz[] = CATALOGO_ZONAS.map((def) =>
        manager.create(ZonaMatriz, {
          reporteId: reporteGuardado.id,
          numeroZona: def.numeroZona,
          descripcion: def.descripcion,
          subsistema: def.subsistema,
          estado: EstadoZona.NORMAL,
          observacion: null,
        })
      );

      const zonasGuardadas = await manager.save(ZonaMatriz, zonas);

      await this.auditoria.registrar(manager, {
        reporteId: reporteGuardado.id,
        usuarioId: dto.creadoPorId ?? tecnico.id,
        tipoEvento: 'CAMBIO_ESTADO',
        estadoAnterior: null,
        estadoNuevo: estadoInicial,
        descripcion: `Expediente ${codigo} creado en ${ETIQUETAS_ESTADO[estadoInicial]} con ${TOTAL_ZONAS} zonas inicializadas.`,
        ip: dto.ip ?? null,
        detalles: { codigo, radiobase: radiobase.codigo, tecnicoId: tecnico.id },
      });

      reporteGuardado.zonas = zonasGuardadas;
      return reporteGuardado;
    });
  }

  private validarPermisoTransicion(reporte: Reporte, nuevoEstado: EstadoReporte, actor: ActorTransicion): void {
    const esSupervision = ROLES_SUPERVISION.includes(actor.rol);

    if (ESTADOS_SOLO_SUPERVISION.includes(nuevoEstado)) {
      if (esSupervision) return;
      if (nuevoEstado === EstadoReporte.APROBADO || nuevoEstado === EstadoReporte.VISADO) {
        throw new PermisoDenegadoError('Solo un Supervisor o Administrador puede aprobar el reporte.');
      }
      if (nuevoEstado === EstadoReporte.OBSERVADO) {
        throw new PermisoDenegadoError('Solo un Supervisor o Administrador puede observar un reporte.');
      }
      throw new PermisoDenegadoError(
        `Solo un Supervisor o Administrador puede mover el reporte a '${ETIQUETAS_ESTADO[nuevoEstado]}'.`
      );
    }

    if (!esSupervision && reporte.tecnicoId !== actor.id) {
      throw new PermisoDenegadoError(
        'Solo el técnico titular asignado, un Supervisor o un Administrador puede mover este reporte.'
      );
    }
  }

  /**
   * Máquina de estados del flujo VERTEX (8 fases) con validación de roles, reglas por fase
   * y registro atómico de la transición en `auditoria_eventos`.
   */
  async cambiarEstado(
    reporteId: string,
    nuevoEstado: EstadoReporte,
    usuarioEjecutor: ActorTransicion,
    observacion?: string,
    datos: DatosTransicion = {}
  ): Promise<Reporte> {
    const reporte = await this.reporteRepo.findOne({
      where: { id: reporteId },
      relations: ['evidencias', 'zonas'],
    });

    if (!reporte) {
      throw new RecursoNoEncontradoError(`Reporte con ID '${reporteId}' no encontrado.`);
    }

    const estadoActual = reporte.estado;
    if (estadoActual === nuevoEstado) {
      throw new TransicionInvalidaError(
        `El reporte ya se encuentra en estado '${ETIQUETAS_ESTADO[nuevoEstado]}'.`
      );
    }

    this.validarPermisoTransicion(reporte, nuevoEstado, usuarioEjecutor);

    if (!esTransicionPermitida(estadoActual, nuevoEstado)) {
      throw new TransicionInvalidaError(
        `Transición no permitida: '${ETIQUETAS_ESTADO[estadoActual]}' → '${ETIQUETAS_ESTADO[nuevoEstado]}'.`
      );
    }

    const evidencias = reporte.evidencias ?? [];
    const zonas = reporte.zonas ?? [];
    const ahora = new Date();
    const cambios: CambiosReporte = { estado: nuevoEstado };
    const detalles: Record<string, unknown> = {};
    const observacionLimpia = textoLimpio(observacion);

    switch (nuevoEstado) {
      case EstadoReporte.EN_REVISION:
      case EstadoReporte.REVISION_INTERNA: {
        if (evidencias.length === 0) {
          throw new ReglaNegocioError('No se puede enviar a revisión un reporte sin evidencias fotográficas.');
        }
        if (nuevoEstado === EstadoReporte.REVISION_INTERNA) {
          if (zonas.length < TOTAL_ZONAS) {
            throw new ReglaNegocioError(
              `No se puede enviar a revisión interna: la matriz tiene ${zonas.length} de ${TOTAL_ZONAS} zonas cargadas.`
            );
          }
          const sinObservacion = zonas.filter((z) => zonaRequiereObservacion(z.estado) && !textoLimpio(z.observacion));
          if (sinObservacion.length > 0) {
            throw new ReglaNegocioError(
              `Zonas en ALARMA/FALLA sin observación técnica: ${sinObservacion.map((z) => z.numeroZona).join(', ')}.`
            );
          }
          detalles.zonasConNovedad = zonas.filter((z) => zonaRequiereObservacion(z.estado)).length;
        }
        detalles.totalEvidencias = evidencias.length;
        break;
      }

      case EstadoReporte.OBSERVADO: {
        const motivo = textoLimpio(datos.motivoRechazo) || observacionLimpia;
        if (!motivo) {
          throw new ReglaNegocioError('Debe proporcionar un motivo u observación clara al rechazar el reporte.');
        }
        cambios.motivoRechazo = motivo;
        cambios.observaciones = motivo;
        cambios.supervisorId = usuarioEjecutor.id;
        cambios.bloqueadoEdicion = false;
        detalles.motivoRechazo = motivo;
        break;
      }

      case EstadoReporte.APROBADO:
      case EstadoReporte.VISADO: {
        const tieneRechazadas = evidencias.some((e) => e.estadoValidacion === EstadoValidacionVisual.RECHAZADO);
        if (tieneRechazadas) {
          throw new ReglaNegocioError(
            'No se puede aprobar un reporte que contenga evidencias marcadas como RECHAZADAS.'
          );
        }
        cambios.supervisorId = usuarioEjecutor.id;
        if (observacionLimpia) {
          cambios.observaciones = observacionLimpia;
        }
        const hash = generarHashContenidoReporte({
          reporteId: reporte.id,
          codigoReporte: reporte.codigo,
          radiobaseId: reporte.radiobaseId,
          tecnicoId: reporte.tecnicoId,
          supervisorId: usuarioEjecutor.id,
          fechaVisado: ahora.toISOString(),
          zonas: zonas.map((z) => ({ numeroZona: z.numeroZona, estado: z.estado, observacion: z.observacion ?? null })),
          evidencias: evidencias.map((e) => ({
            slotNumero: e.slotNumero,
            tipoEquipo: e.tipoEquipo,
            momento: e.momento,
            urlImagen: e.urlImagen ?? '',
          })),
        });
        cambios.hashSha256 = hash;
        if (nuevoEstado === EstadoReporte.VISADO) {
          cambios.bloqueadoEdicion = true;
          cambios.fechaVisado = ahora;
        }
        detalles.hashSha256 = hash;
        break;
      }

      case EstadoReporte.ENVIADO_AL_CLIENTE: {
        const canal = textoLimpio(datos.canalRadicacion);
        const ticket = textoLimpio(datos.numeroTicketCliente);
        if (!(CANALES_RADICACION as readonly string[]).includes(canal)) {
          throw new ReglaNegocioError(
            `Debe indicar el canal de radicación (${CANALES_RADICACION.join(', ')}).`
          );
        }
        if (!ticket) {
          throw new ReglaNegocioError('Debe indicar el número de ticket o radicado entregado por el cliente.');
        }
        cambios.canalRadicacion = canal as CanalRadicacion;
        cambios.numeroTicketCliente = ticket;
        cambios.fechaEnvioCliente = ahora;
        detalles.canalRadicacion = canal;
        detalles.numeroTicketCliente = ticket;
        break;
      }

      case EstadoReporte.HES_SOLICITADA: {
        const numeroHes = textoLimpio(datos.numeroHes);
        if (!PATRON_HES.test(numeroHes)) {
          throw new ReglaNegocioError(
            'Debe indicar un número de HES válido (3 a 100 caracteres alfanuméricos, guiones o barras).'
          );
        }
        const duplicado = await this.reporteRepo.findOne({ where: { numeroHes }, select: { id: true, codigo: true } });
        if (duplicado && duplicado.id !== reporte.id) {
          throw new ReglaNegocioError(`La HES '${numeroHes}' ya está asociada al reporte ${duplicado.codigo}.`);
        }
        const fechaHes = datos.fechaHes ?? ahora;
        cambios.numeroHes = numeroHes;
        cambios.fechaHes = fechaHes;
        detalles.numeroHes = numeroHes;
        detalles.fechaHes = fechaHes.toISOString();
        break;
      }

      case EstadoReporte.FACTURADO: {
        if (!textoLimpio(reporte.numeroHes)) {
          throw new ReglaNegocioError('No se puede facturar un reporte sin número de HES registrado.');
        }
        detalles.numeroHes = reporte.numeroHes;
        break;
      }

      case EstadoReporte.SIN_EMPEZAR:
      case EstadoReporte.EN_VISITA:
      case EstadoReporte.ELABORANDO_INFORME:
      case EstadoReporte.BORRADOR:
        break;
    }

    if (observacionLimpia && cambios.observaciones === undefined) {
      cambios.observaciones = observacionLimpia;
    }

    return await this.dataSource.transaction(async (manager) => {
      await manager.update(Reporte, { id: reporte.id }, cambios);

      await this.auditoria.registrar(manager, {
        reporteId: reporte.id,
        usuarioId: usuarioEjecutor.id,
        tipoEvento:
          nuevoEstado === EstadoReporte.OBSERVADO
            ? 'OBSERVACION_QA'
            : nuevoEstado === EstadoReporte.VISADO || nuevoEstado === EstadoReporte.APROBADO
              ? 'APROBACION_QA'
              : 'CAMBIO_ESTADO',
        estadoAnterior: estadoActual,
        estadoNuevo: nuevoEstado,
        severidad: nuevoEstado === EstadoReporte.OBSERVADO ? 'ADVERTENCIA' : 'INFO',
        descripcion: `Reporte ${reporte.codigo}: ${ETIQUETAS_ESTADO[estadoActual]} → ${ETIQUETAS_ESTADO[nuevoEstado]}.`,
        ip: datos.ip ?? null,
        detalles: {
          ...detalles,
          ...(observacionLimpia ? { observacion: observacionLimpia } : {}),
          rolEjecutor: usuarioEjecutor.rol,
        },
      });

      return Object.assign(reporte, cambios) as Reporte;
    });
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
   * Lista reportes con filtros opcionales. No carga el binario de las evidencias:
   * expone `totalEvidencias` mediante conteo de relación.
   */
  async listarReportes(filtro?: {
    estado?: EstadoReporte;
    tecnicoId?: string;
    radiobaseId?: string;
  }): Promise<Array<Reporte & { totalEvidencias?: number }>> {
    const qb = this.reporteRepo
      .createQueryBuilder('reporte')
      .leftJoinAndSelect('reporte.radiobase', 'radiobase')
      .leftJoinAndSelect('reporte.tecnico', 'tecnico')
      .leftJoinAndSelect('reporte.supervisor', 'supervisor')
      .loadRelationCountAndMap('reporte.totalEvidencias', 'reporte.evidencias')
      .orderBy('reporte.updatedAt', 'DESC');

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
