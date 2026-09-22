import { ZonaService } from '../../src/server/services/zona.service';

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

  it('debe actualizar en lote las descripciones y estados de las zonas existentes', async () => {
    const zonasMock = [
      { id: 'z1', numeroZona: 1, descripcion: 'Zona 1', estado: 'OK' },
      { id: 'z2', numeroZona: 2, descripcion: 'Zona 2', estado: 'OK' },
    ];
    mockZonaRepo.find.mockResolvedValue(zonasMock);

    const actualizacion = [
      { numeroZona: 1, descripcion: 'Sensor PIR Pasillo', estado: 'ALARMA' },
      { numeroZona: 2, descripcion: 'Contacto Magnético Puerta', estado: 'OK' },
    ];

    const resultado = await zonaService.guardarZonasLote('rep-1', actualizacion);

    expect(resultado).toHaveLength(2);
    expect(resultado[0].descripcion).toBe('Sensor PIR Pasillo');
    expect(resultado[0].estado).toBe('ALARMA');
    expect(resultado[1].descripcion).toBe('Contacto Magnético Puerta');
  });

  it('debe lanzar error si no se envian datos de zonas', async () => {
    await expect(zonaService.guardarZonasLote('rep-1', [])).rejects.toThrow(
      'Debe proporcionar el listado de zonas a actualizar.'
    );
  });
});
