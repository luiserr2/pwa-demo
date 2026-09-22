import { seedDatabase } from '../../src/server/db/seed';

describe('SeedDatabase - Carga de Datos Semilla para Producción', () => {
  let mockDataSource: any;
  let savedEntities: Record<string, any[]> = {};

  beforeEach(() => {
    savedEntities = {
      User: [],
      Radiobase: [],
      Reporte: [],
      ZonaMatriz: [],
      EvidenciaFotografica: [],
      EquipoInstalado: [],
    };

    const createRepo = (entityName: string) => ({
      findOneBy: jest.fn(async (query: any) => {
        const list = savedEntities[entityName] || [];
        return (
          list.find((item: any) => {
            return Object.entries(query).every(([k, v]) => item[k] === v);
          }) || null
        );
      }),
      findOne: jest.fn(async (query: any) => {
        const list = savedEntities[entityName] || [];
        if (query.where) {
          return (
            list.find((item: any) => {
              return Object.entries(query.where).every(([k, v]) => item[k] === v);
            }) || null
          );
        }
        return null;
      }),
      create: jest.fn((data: any) => ({ ...data, id: `uuid-${Math.random().toString(36).substring(7)}` })),
      save: jest.fn(async (data: any) => {
        if (Array.isArray(data)) {
          savedEntities[entityName].push(...data);
          return data;
        }
        savedEntities[entityName].push(data);
        return data;
      }),
    });

    mockDataSource = {
      getRepository: jest.fn((entity: any) => {
        const name = entity.name || entity;
        return createRepo(name);
      }),
    };
  });

  it('debe ejecutar el seed y crear los 3 usuarios del sistema (Tecnico, Supervisor, Admin)', async () => {
    await seedDatabase(mockDataSource);

    expect(savedEntities['User']).toHaveLength(3);
    const emails = savedEntities['User'].map((u) => u.email);
    expect(emails).toContain('tecnico@sisbirceca.com');
    expect(emails).toContain('supervisor@sisbirceca.com');
    expect(emails).toContain('admin@sisbirceca.com');
  });

  it('debe crear las 4 radiobases oficiales del catálogo', async () => {
    await seedDatabase(mockDataSource);

    expect(savedEntities['Radiobase']).toHaveLength(4);
    const codigos = savedEntities['Radiobase'].map((r) => r.codigo);
    expect(codigos).toContain('RDB-001');
    expect(codigos).toContain('RDB-002');
    expect(codigos).toContain('RDB-003');
    expect(codigos).toContain('RDB-004');
  });

  it('debe crear el reporte semilla con exactamente 48 zonas y 12 evidencias fotograficas', async () => {
    await seedDatabase(mockDataSource);

    expect(savedEntities['Reporte']).toHaveLength(1);
    expect(savedEntities['Reporte'][0].codigo).toBe('RDB-001_20260922');
    expect(savedEntities['ZonaMatriz']).toHaveLength(48);
    expect(savedEntities['EvidenciaFotografica']).toHaveLength(12); // 6 pares Antes/Después
    expect(savedEntities['EquipoInstalado']).toHaveLength(2);
  });
});
