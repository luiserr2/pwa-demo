import { ReporteService } from '../../src/server/services/reporte.service';
import {
  EstadoReporte,
  RolUsuario,
  EstadoValidacionVisual,
  MomentoFoto,
} from '../../src/server/entities';

describe('ReporteService - Lógica de Dominio y Máquina de Estados', () => {
  let reporteService: ReporteService;
  let mockDataSource: any;
  let mockReporteRepo: any;
  let mockZonaRepo: any;
  let mockRadiobaseRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
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

    mockDataSource = {
      getRepository: jest.fn((entityClass) => {
        const name = entityClass.name || entityClass;
        if (name === 'Reporte') return mockReporteRepo;
        if (name === 'ZonaMatriz') return mockZonaRepo;
        if (name === 'Radiobase') return mockRadiobaseRepo;
        if (name === 'User') return mockUserRepo;
        return {};
      }),
      transaction: jest.fn(async (cb) => {
        const manager = {
          create: jest.fn((entityClass, data) => ({ ...data })),
          save: jest.fn((entityClass, data) => {
            if (Array.isArray(data)) {
              return Promise.resolve(data.map((item, idx) => ({ ...item, id: `id-${idx}` })));
            }
            return Promise.resolve({ ...data, id: 'rep-uuid-123' });
          }),
        };
        return await cb(manager);
      }),
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
    it('debe crear un reporte en estado BORRADOR e inicializar atomicamente 48 zonas fijas', async () => {
      const resultado = await reporteService.crearReporte({
        radiobaseId: 'rdb-1',
        tecnicoId: 'usr-tec-1',
        fechaVisita: new Date(2026, 8, 22),
      });

      expect(resultado).toBeDefined();
      expect(resultado.codigo).toBe('RDB-042_20260922');
      expect(resultado.estado).toBe(EstadoReporte.BORRADOR);
      expect(resultado.zonas).toHaveLength(48);
      expect(resultado.zonas[0].numeroZona).toBe(1);
      expect(resultado.zonas[47].numeroZona).toBe(48);
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
});
