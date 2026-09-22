import { EvidenciaService } from '../../src/server/services/evidencia.service';
import {
  MomentoFoto,
  EstadoValidacionVisual,
} from '../../src/server/entities';

describe('EvidenciaService - Regla de Avance y Validación Visual', () => {
  let evidenciaService: EvidenciaService;
  let mockDataSource: any;
  let mockEvidenciaRepo: any;
  let mockReporteRepo: any;

  beforeEach(() => {
    mockEvidenciaRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn((data) => ({ ...data })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'ev-uuid-1' })),
    };

    mockReporteRepo = {
      findOneBy: jest.fn().mockResolvedValue({ id: 'rep-1' }),
    };

    mockDataSource = {
      getRepository: jest.fn((entityClass) => {
        const name = entityClass.name || entityClass;
        if (name === 'EvidenciaFotografica') return mockEvidenciaRepo;
        if (name === 'Reporte') return mockReporteRepo;
        return {};
      }),
    };

    evidenciaService = new EvidenciaService(mockDataSource);
  });

  describe('registrarEvidencia (Regla de Bloqueo Antes/Después)', () => {
    it('debe registrar exitosamente una foto ANTES en cualquier momento', async () => {
      mockEvidenciaRepo.findOne.mockResolvedValue(null);

      const resultado = await evidenciaService.registrarEvidencia({
        reporteId: 'rep-1',
        tipoEquipo: 'CAMARA',
        slotNumero: 1,
        momento: MomentoFoto.ANTES,
        urlImagen: 'https://storage.googleapis.com/evidencias/foto_antes.webp',
      });

      expect(resultado).toBeDefined();
      expect(resultado.tipoEquipo).toBe('CAMARA');
      expect(resultado.momento).toBe(MomentoFoto.ANTES);
      expect(resultado.estadoValidacion).toBe(EstadoValidacionVisual.PENDIENTE);
    });

    it('debe BLOQUEAR la captura de foto DESPUES si no existe la foto ANTES en ese slot', async () => {
      // Simular que NO existe foto ANTES para este slot
      mockEvidenciaRepo.findOne.mockResolvedValue(null);

      await expect(
        evidenciaService.registrarEvidencia({
          reporteId: 'rep-1',
          tipoEquipo: 'CAMARA',
          slotNumero: 1,
          momento: MomentoFoto.DESPUES,
          urlImagen: 'https://storage.googleapis.com/evidencias/foto_despues.webp',
        })
      ).rejects.toThrow(
        "Regla de Bloqueo: No se puede capturar la foto 'DESPUES' para el slot CAMARA #1 sin haber completado la foto 'ANTES'."
      );
    });

    it('debe PERMITIR registrar la foto DESPUES cuando la foto ANTES ya existe en ese slot', async () => {
      // Primera llamada: verifica si existe foto ANTES -> Devuelve registro válido
      // Segunda llamada: verifica si ya existía la foto DESPUES -> Devuelve null (nueva)
      mockEvidenciaRepo.findOne
        .mockResolvedValueOnce({
          id: 'ev-antes-1',
          reporteId: 'rep-1',
          tipoEquipo: 'CAMARA',
          slotNumero: 1,
          momento: MomentoFoto.ANTES,
          urlImagen: 'https://storage.googleapis.com/evidencias/foto_antes.webp',
        })
        .mockResolvedValueOnce(null);

      const resultado = await evidenciaService.registrarEvidencia({
        reporteId: 'rep-1',
        tipoEquipo: 'CAMARA',
        slotNumero: 1,
        momento: MomentoFoto.DESPUES,
        urlImagen: 'https://storage.googleapis.com/evidencias/foto_despues.webp',
      });

      expect(resultado).toBeDefined();
      expect(resultado.momento).toBe(MomentoFoto.DESPUES);
      expect(resultado.urlImagen).toBe('https://storage.googleapis.com/evidencias/foto_despues.webp');
    });
  });

  describe('evaluarVisualmente (Validación Visual del Supervisor)', () => {
    it('debe permitir aprobar visualmente una foto individual', async () => {
      mockEvidenciaRepo.findOneBy.mockResolvedValue({
        id: 'ev-1',
        estadoValidacion: EstadoValidacionVisual.PENDIENTE,
      });

      const resultado = await evidenciaService.evaluarVisualmente({
        evidenciaId: 'ev-1',
        estado: EstadoValidacionVisual.APROBADO,
        supervisorId: 'usr-sup-1',
      });

      expect(resultado.estadoValidacion).toBe(EstadoValidacionVisual.APROBADO);
      expect(resultado.observacionRechazo).toBeNull();
    });

    it('debe exigir observacion visual al rechazar una foto', async () => {
      mockEvidenciaRepo.findOneBy.mockResolvedValue({
        id: 'ev-1',
        estadoValidacion: EstadoValidacionVisual.PENDIENTE,
      });

      await expect(
        evidenciaService.evaluarVisualmente({
          evidenciaId: 'ev-1',
          estado: EstadoValidacionVisual.RECHAZADO,
          observacionRechazo: '', // Vacia
          supervisorId: 'usr-sup-1',
        })
      ).rejects.toThrow('Debe especificar una observación visual al rechazar una fotografía');
    });

    it('debe registrar el rechazo con la nota visual del supervisor', async () => {
      mockEvidenciaRepo.findOneBy.mockResolvedValue({
        id: 'ev-1',
        estadoValidacion: EstadoValidacionVisual.PENDIENTE,
      });

      const resultado = await evidenciaService.evaluarVisualmente({
        evidenciaId: 'ev-1',
        estado: EstadoValidacionVisual.RECHAZADO,
        observacionRechazo: 'Foto borrosa y sin iluminación adecuada en el rack.',
        supervisorId: 'usr-sup-1',
      });

      expect(resultado.estadoValidacion).toBe(EstadoValidacionVisual.RECHAZADO);
      expect(resultado.observacionRechazo).toBe('Foto borrosa y sin iluminación adecuada en el rack.');
    });
  });
});
