import { RadiobaseService } from '../../src/server/services/radiobase.service';
import { UserService } from '../../src/server/services/user.service';
import { RolUsuario } from '../../src/server/entities';

describe('RadiobaseService & UserService (HITO 1)', () => {
  let radiobaseService: RadiobaseService;
  let userService: UserService;
  let mockRadiobaseRepo: any;
  let mockUserRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    const radiobasesDB: any[] = [];
    mockRadiobaseRepo = {
      findOneBy: jest.fn(async ({ id, codigo }) => {
        if (codigo) return radiobasesDB.find((r) => r.codigo === codigo) || null;
        if (id) return radiobasesDB.find((r) => r.id === id) || null;
        return null;
      }),
      create: jest.fn((data) => ({ ...data, id: `rdb-${Date.now()}` })),
      save: jest.fn(async (entity) => {
        radiobasesDB.push(entity);
        return entity;
      }),
      createQueryBuilder: jest.fn(() => ({
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(async () => radiobasesDB),
      })),
    };

    const usersDB: any[] = [];
    mockUserRepo = {
      findOneBy: jest.fn(async ({ id, email }) => {
        if (email) return usersDB.find((u) => u.email === email) || null;
        if (id) return usersDB.find((u) => u.id === id) || null;
        return null;
      }),
      create: jest.fn((data) => ({ ...data, id: `u-${Date.now()}` })),
      save: jest.fn(async (entity) => {
        usersDB.push(entity);
        return entity;
      }),
      createQueryBuilder: jest.fn(() => ({
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(async () => usersDB),
      })),
    };

    mockDataSource = {
      getRepository: jest.fn((entityClass) => {
        const name = entityClass.name || entityClass;
        if (name === 'Radiobase') return mockRadiobaseRepo;
        if (name === 'User') return mockUserRepo;
        return {};
      }),
    };

    radiobaseService = new RadiobaseService(mockDataSource);
    userService = new UserService(mockDataSource);
  });

  describe('RadiobaseService', () => {
    it('debe crear una nueva radiobase con éxito', async () => {
      const rb = await radiobaseService.crearRadiobase({
        codigo: 'RDB-TEST-01',
        nombre: 'Torre Prueba 01',
        region: 'AMBA / CABA',
        tecnologia: '5G Standalone',
      });

      expect(rb).toBeDefined();
      expect(rb.codigo).toBe('RDB-TEST-01');
      expect(rb.nombre).toBe('Torre Prueba 01');
    });

    it('debe rechazar la creación de una radiobase con código duplicado', async () => {
      await radiobaseService.crearRadiobase({
        codigo: 'RDB-TEST-01',
        nombre: 'Torre Original',
        region: 'AMBA / CABA',
      });

      await expect(
        radiobaseService.crearRadiobase({
          codigo: 'RDB-TEST-01',
          nombre: 'Torre Duplicada',
          region: 'CABA',
        })
      ).rejects.toThrow(/Ya existe una radiobase/);
    });

    it('debe listar radiobases registradas', async () => {
      await radiobaseService.crearRadiobase({
        codigo: 'RDB-TEST-02',
        nombre: 'Torre Prueba 02',
        region: 'Centro',
      });

      const lista = await radiobaseService.listarRadiobases();
      expect(lista.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('UserService', () => {
    it('debe crear un nuevo usuario con rol asignado', async () => {
      const user = await userService.crearUsuario({
        email: 'tecnico.test@sisbirceca.com',
        nombre: 'Pedro Pérez',
        cedula: 'V-20.123.456',
        rol: RolUsuario.TECNICO,
      });

      expect(user).toBeDefined();
      expect(user.rol).toBe(RolUsuario.TECNICO);
      expect(user.activo).toBe(true);
    });

    it('debe impedir crear usuarios con email duplicado', async () => {
      await userService.crearUsuario({
        email: 'dup@sisbirceca.com',
        nombre: 'Primer Pedro',
        cedula: 'V-11.222.333',
        rol: RolUsuario.TECNICO,
      });

      await expect(
        userService.crearUsuario({
          email: 'dup@sisbirceca.com',
          nombre: 'Segundo Pedro',
          cedula: 'V-44.555.666',
          rol: RolUsuario.TECNICO,
        })
      ).rejects.toThrow(/ya está registrado/);
    });

    it('debe listar usuarios', async () => {
      await userService.crearUsuario({
        email: 'sup@sisbirceca.com',
        nombre: 'Supervisor Test',
        cedula: 'V-99.888.777',
        rol: RolUsuario.SUPERVISOR,
      });

      const lista = await userService.listarUsuarios();
      expect(lista.length).toBeGreaterThanOrEqual(1);
    });
  });
});
