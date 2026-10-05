import { ZonaService } from '../../src/server/services/zona.service';
import { EstadoZona } from '../../src/shared/catalogo-zonas';

describe('ZonaService - Matriz de 48 Zonas Fijas', () => {
  let zonaService: ZonaService;
  let mockDataSource: any;
  let mockZonaRepo: any;

  beforeEach(() => {
    mockZonaRepo = {
      find: jest.fn(),
      save: jest.fn((entities) => Promise.resolve(entities)),
    };

    mockDataSource = {
      getRepository: jest.fn(() => mockZonaRepo),
    };

    zonaService = new ZonaService(mockDataSource);
  });

  it('debe actualizar en lote estados y observaciones, reportando los cambios efectivos', async () => {
    mockZonaRepo.find.mockResolvedValue([
      { id: 'z1', numeroZona: 1, descripcion: 'Cerco Perimetral Norte', estado: EstadoZona.NORMAL, observacion: null, subsistema: null },
      { id: 'z2', numeroZona: 2, descripcion: 'Cerco Perimetral Sur', estado: EstadoZona.NORMAL, observacion: null, subsistema: 'TORRE' },
    ]);

    const { zonas, cambios } = await zonaService.guardarZonasLoteConCambios('rep-1', [
      { numeroZona: 1, estado: EstadoZona.ALARMA, observacion: 'Malla perimetral cortada 2 m' },
      { numeroZona: 2, estado: EstadoZona.NORMAL },
    ]);

    expect(zonas).toHaveLength(2);
    expect(zonas[0].estado).toBe(EstadoZona.ALARMA);
    expect(zonas[0].observacion).toBe('Malla perimetral cortada 2 m');
    expect(zonas[0].subsistema).toBe('TORRE');
    expect(cambios).toEqual([
      { numeroZona: 1, estadoAnterior: EstadoZona.NORMAL, estadoNuevo: EstadoZona.ALARMA, observacion: 'Malla perimetral cortada 2 m' },
    ]);
  });

  it('debe exigir observación para ALARMA / FALLA', async () => {
    await expect(
      zonaService.guardarZonasLote('rep-1', [{ numeroZona: 3, estado: EstadoZona.FALLA, observacion: ' ' }])
    ).rejects.toThrow('La zona 3 está en FALLA: la observación técnica es obligatoria.');
  });

  it('debe rechazar zonas fuera de rango y duplicadas', async () => {
    await expect(
      zonaService.guardarZonasLote('rep-1', [{ numeroZona: 49, estado: EstadoZona.NORMAL }])
    ).rejects.toThrow('Número de zona fuera de rango: 49');
    await expect(
      zonaService.guardarZonasLote('rep-1', [
        { numeroZona: 4, estado: EstadoZona.NORMAL },
        { numeroZona: 4, estado: EstadoZona.NORMAL },
      ])
    ).rejects.toThrow('La zona 4 está duplicada en el lote.');
  });

  it('debe lanzar error si no se envian datos de zonas', async () => {
    await expect(zonaService.guardarZonasLote('rep-1', [])).rejects.toThrow(
      'Debe proporcionar el listado de zonas a actualizar.'
    );
  });
});
