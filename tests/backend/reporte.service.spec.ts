import { ReporteService } from '../../src/server/services/reporte.service';
import {
  EstadoReporte,
  RolUsuario,
  EstadoValidacionVisual,
  MomentoFoto,
} from '../../src/server/entities';
import { CATALOGO_ZONAS, EstadoZona } from '../../src/shared/catalogo-zonas';

type Registro = Record<string, unknown>;

/** 48 zonas válidas del catálogo (todas NORMAL) para reglas de REVISION_INTERNA. */
function zonasCompletas(): Registro[] {
  return CATALOGO_ZONAS.map((z) => ({
    numeroZona: z.numeroZona,
    estado: EstadoZona.NORMAL,
    observacion: null,
  }));
}

describe('ReporteService - Lógica de Dominio y Máquina de Estados', () => {
  let reporteService: ReporteService;
  let mockDataSource: any;
  let mockReporteRepo: any;
  let mockZonaRepo: any;
  let mockRadiobaseRepo: any;
  let mockUserRepo: any;
  let manager: any;
  let eventosAuditoria: Registro[];

  beforeEach(() => {
    eventosAuditoria = [];

    mockReporteRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'rep-123' })),
      create: jest.fn((entity) => ({ ...entity })),
    };

    mockZonaRepo = {
      create: jest.fn((entity) => ({ ...entity })),
      save: jest.fn((entities) => Promise.resolve(entities)),
    };

    mockRadiobaseRepo = {
      findOneBy: jest.fn().mockResolvedValue({
        id: 'rdb-1',
        codigo: 'RDB-042',
        nombre: 'Torre Central',
      }),
    };

    mockUserRepo = {
      findOneBy: jest.fn().mockResolvedValue({
        id: 'usr-tec-1',
        nombre: 'Gerson Técnico',
        rol: RolUsuario.TECNICO,
      }),
    };

    manager = {
      query: jest.fn().mockResolvedValue([]),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      create: jest.fn((entityClass, data) => ({ ...data })),
      save: jest.fn((entityClass, data) => {
        if (entityClass?.name === 'AuditoriaEvento') {
          eventosAuditoria.push(data);
          return Promise.resolve({ ...data, id: `aud-${eventosAuditoria.length}` });
        }
        if (Array.isArray(data)) {
          return Promise.resolve(data.map((item, idx) => ({ ...item, id: `id-${idx}` })));
        }
        return Promise.resolve({ ...data, id: data.id || 'rep-uuid-123' });
      }),
    };

    mockDataSource = {
      getRepository: jest.fn((entityClass) => {
        const name = entityClass.name || entityClass;
        if (name === 'Reporte') return mockReporteRepo;
        if (name === 'ZonaMatriz') return mockZonaRepo;
        if (name === 'Radiobase') return mockRadiobaseRepo;
        if (name === 'User') return mockUserRepo;
        return {};
      }),
      transaction: jest.fn(async (cb) => await cb(manager)),
    };

    reporteService = new ReporteService(mockDataSource);
  });

  describe('generarCodigoReporte', () => {
    it('debe generar la nomenclatura estandar ${CodigoRadiobase}_YYYYMMDD', () => {
      const fecha = new Date(2026, 8, 22); // 22 de Septiembre de 2026
      const codigo = reporteService.generarCodigoReporte('RDB-042', fecha);
      expect(codigo).toBe('RDB-042_20260922');
    });
  });

  describe('crearReporte', () => {
    it('debe crear el reporte en SIN_EMPEZAR con las 48 zonas del catálogo y auditar la creación', async () => {
      const resultado = await reporteService.crearReporte({
        radiobaseId: 'rdb-1',
        tecnicoId: 'usr-tec-1',
        fechaVisita: new Date(2026, 8, 22),
      });

      expect(resultado.codigo).toBe('RDB-042_20260922');
      expect(resultado.estado).toBe(EstadoReporte.SIN_EMPEZAR);
      expect(resultado.zonas).toHaveLength(48);
      expect(resultado.zonas[0].numeroZona).toBe(1);
      expect(resultado.zonas[47].numeroZona).toBe(48);
      expect(resultado.zonas[0].descripcion).toBe(CATALOGO_ZONAS[0].descripcion);
      expect(resultado.zonas[0].subsistema).toBe(CATALOGO_ZONAS[0].subsistema);
      expect(resultado.zonas.every((z) => z.estado === EstadoZona.NORMAL)).toBe(true);
      expect(eventosAuditoria).toHaveLength(1);
      expect(eventosAuditoria[0].estadoNuevo).toBe(EstadoReporte.SIN_EMPEZAR);
      expect(eventosAuditoria[0].hashSha256).toMatch(/^[a-f0-9]{64}$/);
    });

    it('debe respetar el UUID del dispositivo y el estado inicial EN_VISITA (sync de campo)', async () => {
      const resultado = await reporteService.crearReporte({
        id: '7d49fc1a-e225-495e-bec2-e4ee2b10975c',
        radiobaseId: 'rdb-1',
        tecnicoId: 'usr-tec-1',
        estadoInicial: EstadoReporte.EN_VISITA,
      });
      expect(resultado.id).toBe('7d49fc1a-e225-495e-bec2-e4ee2b10975c');
      expect(resultado.estado).toBe(EstadoReporte.EN_VISITA);
    });

    it('debe resolver colisión de código con sufijo incremental', async () => {
      mockReporteRepo.findOne
        .mockResolvedValueOnce({ id: 'otro' })
        .mockResolvedValueOnce(null);
      const resultado = await reporteService.crearReporte({
        radiobaseId: 'rdb-1',
        tecnicoId: 'usr-tec-1',
        fechaVisita: new Date(2026, 8, 22),
      });
      expect(resultado.codigo).toBe('RDB-042_20260922_2');
    });

    it('debe lanzar error si la radiobase no existe', async () => {
      mockRadiobaseRepo.findOneBy.mockResolvedValue(null);

      await expect(
        reporteService.crearReporte({
          radiobaseId: 'rdb-invalida',
          tecnicoId: 'usr-tec-1',
        })
      ).rejects.toThrow("Radiobase con ID 'rdb-invalida' no encontrada.");
    });
  });

  describe('cambiarEstado (Máquina de Estados y Roles)', () => {
    it('debe permitir al tecnico enviar a EN_REVISION solo si existen evidencias fotográficas', async () => {
      mockReporteRepo.findOne.mockResolvedValue({
        id: 'rep-1',
        estado: EstadoReporte.BORRADOR,
        tecnicoId: 'usr-tec-1',
        evidencias: [{ id: 'ev-1', momento: MomentoFoto.ANTES }],
      });

      const resultado = await reporteService.cambiarEstado(
        'rep-1',
        EstadoReporte.EN_REVISION,
        { id: 'usr-tec-1', rol: RolUsuario.TECNICO }
      );

      expect(resultado.estado).toBe(EstadoReporte.EN_REVISION);
      expect(manager.update).toHaveBeenCalled();
      expect(eventosAuditoria).toHaveLength(1);
      expect(eventosAuditoria[0].estadoAnterior).toBe(EstadoReporte.BORRADOR);
      expect(eventosAuditoria[0].estadoNuevo).toBe(EstadoReporte.EN_REVISION);
    });

    it('debe impedir enviar a EN_REVISION si no hay fotos cargadas', async () => {
      mockReporteRepo.findOne.mockResolvedValue({
        id: 'rep-1',
        estado: EstadoReporte.BORRADOR,
        tecnicoId: 'usr-tec-1',
        evidencias: [],
      });

      await expect(
        reporteService.cambiarEstado(
          'rep-1',
          EstadoReporte.EN_REVISION,
          { id: 'usr-tec-1', rol: RolUsuario.TECNICO }
        )
      ).rejects.toThrow('No se puede enviar a revisión un reporte sin evidencias fotográficas.');
      expect(eventosAuditoria).toHaveLength(0);
    });

    it('debe exigir observacion clara al pasar a OBSERVADO', async () => {
      mockReporteRepo.findOne.mockResolvedValue({
        id: 'rep-1',
        estado: EstadoReporte.EN_REVISION,
        tecnicoId: 'usr-tec-1',
        evidencias: [{ id: 'ev-1' }],
      });

      await expect(
        reporteService.cambiarEstado(
          'rep-1',
          EstadoReporte.OBSERVADO,
          { id: 'usr-sup-1', rol: RolUsuario.SUPERVISOR },
          '' // observacion vacia
        )
      ).rejects.toThrow('Debe proporcionar un motivo u observación clara al rechazar el reporte.');
    });

    it('debe impedir que el tecnico se auto-apruebe el reporte', async () => {
      mockReporteRepo.findOne.mockResolvedValue({
        id: 'rep-1',
        estado: EstadoReporte.EN_REVISION,
        tecnicoId: 'usr-tec-1',
        evidencias: [{ id: 'ev-1', estadoValidacion: EstadoValidacionVisual.APROBADO }],
      });

      await expect(
        reporteService.cambiarEstado(
          'rep-1',
          EstadoReporte.APROBADO,
          { id: 'usr-tec-1', rol: RolUsuario.TECNICO }
        )
      ).rejects.toThrow('Solo un Supervisor o Administrador puede aprobar el reporte.');
    });

    it('debe impedir la aprobacion si alguna evidencia fue RECHAZADA por el supervisor', async () => {
      mockReporteRepo.findOne.mockResolvedValue({
        id: 'rep-1',
        estado: EstadoReporte.EN_REVISION,
        tecnicoId: 'usr-tec-1',
        evidencias: [
          { id: 'ev-1', estadoValidacion: EstadoValidacionVisual.APROBADO },
          { id: 'ev-2', estadoValidacion: EstadoValidacionVisual.RECHAZADO },
        ],
      });

      await expect(
        reporteService.cambiarEstado(
          'rep-1',
          EstadoReporte.APROBADO,
          { id: 'usr-sup-1', rol: RolUsuario.SUPERVISOR }
        )
      ).rejects.toThrow('No se puede aprobar un reporte que contenga evidencias marcadas como RECHAZADAS.');
    });

    it('debe aprobar con exito cuando el supervisor valida y no hay fotos rechazadas', async () => {
      mockReporteRepo.findOne.mockResolvedValue({
        id: 'rep-1',
        estado: EstadoReporte.EN_REVISION,
        tecnicoId: 'usr-tec-1',
        evidencias: [
          { id: 'ev-1', estadoValidacion: EstadoValidacionVisual.APROBADO },
          { id: 'ev-2', estadoValidacion: EstadoValidacionVisual.APROBADO },
        ],
      });

      const resultado = await reporteService.cambiarEstado(
        'rep-1',
        EstadoReporte.APROBADO,
        { id: 'usr-sup-1', rol: RolUsuario.SUPERVISOR },
        'Reporte técnicamente impecable'
      );

      expect(resultado.estado).toBe(EstadoReporte.APROBADO);
      expect(resultado.supervisorId).toBe('usr-sup-1');
      expect(resultado.observaciones).toBe('Reporte técnicamente impecable');
    });
  });

  describe('cambiarEstado (Pipeline de 8 fases)', () => {
    const supervisor = { id: 'usr-sup-1', rol: RolUsuario.SUPERVISOR };
    const tecnico = { id: 'usr-tec-1', rol: RolUsuario.TECNICO };

    function reporteEn(estado: EstadoReporte, extra: Registro = {}): Registro {
      return {
        id: 'rep-1',
        codigo: 'RDB-042_20260922',
        radiobaseId: 'rdb-1',
        estado,
        tecnicoId: 'usr-tec-1',
        evidencias: [{ id: 'ev-1', slotNumero: 1, tipoEquipo: 'CAMARA', momento: MomentoFoto.ANTES, urlImagen: 'data:image/webp;base64,AAA', estadoValidacion: EstadoValidacionVisual.APROBADO }],
        zonas: zonasCompletas(),
        ...extra,
      };
    }

    it('rechaza transiciones fuera de la máquina de estados (SIN_EMPEZAR → VISADO)', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.SIN_EMPEZAR));
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.VISADO, supervisor)
      ).rejects.toThrow('Transición no permitida');
    });

    it('impide que un técnico ajeno mueva el expediente', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.SIN_EMPEZAR));
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.EN_VISITA, { id: 'usr-otro', rol: RolUsuario.TECNICO })
      ).rejects.toThrow('Solo el técnico titular asignado');
    });

    it('REVISION_INTERNA exige las 48 zonas cargadas', async () => {
      mockReporteRepo.findOne.mockResolvedValue(
        reporteEn(EstadoReporte.ELABORANDO_INFORME, { zonas: zonasCompletas().slice(0, 10) })
      );
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.REVISION_INTERNA, tecnico)
      ).rejects.toThrow('la matriz tiene 10 de 48 zonas cargadas');
    });

    it('REVISION_INTERNA exige observación en zonas ALARMA/FALLA', async () => {
      const zonas = zonasCompletas();
      zonas[4] = { numeroZona: 5, estado: EstadoZona.FALLA, observacion: '  ' };
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.ELABORANDO_INFORME, { zonas }));
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.REVISION_INTERNA, tecnico)
      ).rejects.toThrow('Zonas en ALARMA/FALLA sin observación técnica: 5.');
    });

    it('REVISION_INTERNA procede con evidencias y 48 zonas completas', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.ELABORANDO_INFORME));
      const r = await reporteService.cambiarEstado('rep-1', EstadoReporte.REVISION_INTERNA, tecnico);
      expect(r.estado).toBe(EstadoReporte.REVISION_INTERNA);
    });

    it('OBSERVADO persiste motivoRechazo', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.REVISION_INTERNA));
      const r = await reporteService.cambiarEstado('rep-1', EstadoReporte.OBSERVADO, supervisor, undefined, {
        motivoRechazo: 'Foto del rack 2 desenfocada',
      });
      expect(r.estado).toBe(EstadoReporte.OBSERVADO);
      expect(r.motivoRechazo).toBe('Foto del rack 2 desenfocada');
      expect(eventosAuditoria[0].tipoEvento).toBe('OBSERVACION_QA');
    });

    it('ENVIADO_AL_CLIENTE exige canal válido y ticket, y persiste fechaEnvioCliente', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.REVISION_INTERNA));
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.ENVIADO_AL_CLIENTE, supervisor, undefined, {
          canalRadicacion: 'PALOMA',
          numeroTicketCliente: 'T-1',
        })
      ).rejects.toThrow('Debe indicar el canal de radicación');

      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.ENVIADO_AL_CLIENTE, supervisor, undefined, {
          canalRadicacion: 'CORREO',
        })
      ).rejects.toThrow('número de ticket');

      const r = await reporteService.cambiarEstado('rep-1', EstadoReporte.ENVIADO_AL_CLIENTE, supervisor, undefined, {
        canalRadicacion: 'PORTAL_CLIENTE',
        numeroTicketCliente: 'INC-2026-0042',
      });
      expect(r.canalRadicacion).toBe('PORTAL_CLIENTE');
      expect(r.numeroTicketCliente).toBe('INC-2026-0042');
      expect(r.fechaEnvioCliente).toBeInstanceOf(Date);
    });

    it('un técnico no puede enviar al cliente', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.REVISION_INTERNA));
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.ENVIADO_AL_CLIENTE, tecnico, undefined, {
          canalRadicacion: 'CORREO',
          numeroTicketCliente: 'T-1',
        })
      ).rejects.toThrow('Solo un Supervisor o Administrador puede mover el reporte');
    });

    it('VISADO bloquea edición, fija fechaVisado y sella hash SHA-256 del contenido', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.ENVIADO_AL_CLIENTE));
      const r = await reporteService.cambiarEstado('rep-1', EstadoReporte.VISADO, supervisor);
      expect(r.estado).toBe(EstadoReporte.VISADO);
      expect(r.bloqueadoEdicion).toBe(true);
      expect(r.fechaVisado).toBeInstanceOf(Date);
      expect(r.hashSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(eventosAuditoria[0].tipoEvento).toBe('APROBACION_QA');
    });

    it('HES_SOLICITADA valida formato y unicidad, y persiste numeroHes + fechaHes', async () => {
      mockReporteRepo.findOne.mockResolvedValueOnce(reporteEn(EstadoReporte.VISADO));
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.HES_SOLICITADA, supervisor, undefined, { numeroHes: '!' })
      ).rejects.toThrow('número de HES válido');

      mockReporteRepo.findOne
        .mockResolvedValueOnce(reporteEn(EstadoReporte.VISADO))
        .mockResolvedValueOnce({ id: 'rep-2', codigo: 'RDB-001_20260901' });
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.HES_SOLICITADA, supervisor, undefined, { numeroHes: 'HES-9001' })
      ).rejects.toThrow("La HES 'HES-9001' ya está asociada al reporte RDB-001_20260901.");

      mockReporteRepo.findOne
        .mockResolvedValueOnce(reporteEn(EstadoReporte.VISADO))
        .mockResolvedValueOnce(null);
      const r = await reporteService.cambiarEstado('rep-1', EstadoReporte.HES_SOLICITADA, supervisor, undefined, {
        numeroHes: 'HES-9001',
      });
      expect(r.numeroHes).toBe('HES-9001');
      expect(r.fechaHes).toBeInstanceOf(Date);
    });

    it('FACTURADO exige HES registrada', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.HES_SOLICITADA, { numeroHes: null }));
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.FACTURADO, supervisor)
      ).rejects.toThrow('sin número de HES');

      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.HES_SOLICITADA, { numeroHes: 'HES-9001' }));
      const r = await reporteService.cambiarEstado('rep-1', EstadoReporte.FACTURADO, supervisor);
      expect(r.estado).toBe(EstadoReporte.FACTURADO);
    });

    it('FACTURADO es terminal', async () => {
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.FACTURADO, { numeroHes: 'HES-9001' }));
      await expect(
        reporteService.cambiarEstado('rep-1', EstadoReporte.HES_SOLICITADA, supervisor, undefined, { numeroHes: 'HES-1' })
      ).rejects.toThrow('Transición no permitida');
    });

    it('encadena el hash de auditoría con el evento previo', async () => {
      manager.find.mockResolvedValue([{ hashSha256: 'a'.repeat(64), createdAt: new Date(Date.now() - 1000) }]);
      mockReporteRepo.findOne.mockResolvedValue(reporteEn(EstadoReporte.SIN_EMPEZAR));
      await reporteService.cambiarEstado('rep-1', EstadoReporte.EN_VISITA, tecnico);
      const detalles = eventosAuditoria[0].detalles as Registro;
      expect(detalles.hashPrevio).toBe('a'.repeat(64));
      expect(eventosAuditoria[0].hashSha256).not.toBe('a'.repeat(64));
      expect(manager.query).toHaveBeenCalledWith('SELECT pg_advisory_xact_lock($1)', expect.any(Array));
    });
  });
});
