import { generarTokenSesion, verificarTokenSesion, generarHashDeterministaReporte } from '../../src/server/security/auth-token';
import { RolUsuario } from '../../src/server/entities/User';
import { CrearRadiobaseSchema, CrearUsuarioSchema, RegistrarEvidenciaSchema } from '../../src/server/schemas';
import { MomentoFoto } from '../../src/server/entities/EvidenciaFotografica';

describe('Security, Auth Tokens & Deterministic SHA-256 (HITO 2)', () => {
  const usuarioPrueba = {
    id: 'usr-sec-01',
    email: 'seguridad@sisbirceca.com',
    nombre: 'Inspector de Seguridad',
    rol: RolUsuario.SUPERVISOR,
  };

  describe('Tokens Criptográficos HMAC-SHA256', () => {
    it('debe generar y verificar un token de sesión legítimo', () => {
      const token = generarTokenSesion(usuarioPrueba);
      expect(token).toBeDefined();
      expect(token.split('.').length).toBe(2);

      const payload = verificarTokenSesion(token);
      expect(payload).not.toBeNull();
      expect(payload?.email).toBe(usuarioPrueba.email);
      expect(payload?.rol).toBe(RolUsuario.SUPERVISOR);
    });

    it('debe rechazar un token manipulado por un atacante', () => {
      const token = generarTokenSesion(usuarioPrueba);
      const [payloadBase64, signature] = token.split('.');

      // Atacante modifica el payload para ascender a ADMIN
      const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
      decoded.rol = RolUsuario.ADMIN;
      const forgedPayload = Buffer.from(JSON.stringify(decoded)).toString('base64url');
      const forgedToken = `${forgedPayload}.${signature}`;

      const resultado = verificarTokenSesion(forgedToken);
      expect(resultado).toBeNull();
    });
  });

  describe('Sellado Determinístico SHA-256', () => {
    it('debe generar un hash SHA-256 de exactamente 64 caracteres hexadecimales', () => {
      const hash = generarHashDeterministaReporte({
        reporteId: 'rep-uuid-001',
        codigoReporte: 'RDB-001_20260923',
        radiobaseId: 'rdb-uuid-001',
        tecnicoId: 'usr-tec-01',
        supervisorId: 'usr-sup-01',
        fechaAprobacion: '2026-09-23T18:00:00.000Z',
        totalZonas: 48,
        totalEvidencias: 12,
      });

      expect(hash).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });

    it('debe producir el mismo hash ante idénticos parámetros canónicos', () => {
      const params = {
        reporteId: 'rep-uuid-001',
        codigoReporte: 'RDB-001_20260923',
        radiobaseId: 'rdb-uuid-001',
        tecnicoId: 'usr-tec-01',
        supervisorId: 'usr-sup-01',
        fechaAprobacion: '2026-09-23T18:00:00.000Z',
        totalZonas: 48,
        totalEvidencias: 12,
      };

      const hash1 = generarHashDeterministaReporte(params);
      const hash2 = generarHashDeterministaReporte(params);
      expect(hash1).toBe(hash2);
    });

    it('debe producir un hash completamente diferente si se altera cualquier dato canónico', () => {
      const hash1 = generarHashDeterministaReporte({
        reporteId: 'rep-uuid-001',
        codigoReporte: 'RDB-001_20260923',
        radiobaseId: 'rdb-uuid-001',
        tecnicoId: 'usr-tec-01',
        supervisorId: 'usr-sup-01',
        fechaAprobacion: '2026-09-23T18:00:00.000Z',
        totalZonas: 48,
        totalEvidencias: 12,
      });

      const hashAlterado = generarHashDeterministaReporte({
        reporteId: 'rep-uuid-001',
        codigoReporte: 'RDB-001_20260923',
        radiobaseId: 'rdb-uuid-001',
        tecnicoId: 'usr-tec-01',
        supervisorId: 'usr-sup-01',
        fechaAprobacion: '2026-09-23T18:00:00.000Z',
        totalZonas: 48,
        totalEvidencias: 11, // Una evidencia menos
      });

      expect(hash1).not.toBe(hashAlterado);
    });
  });

  describe('Validación de Esquemas Zod', () => {
    it('debe validar exitosamente datos correctos de radiobase', () => {
      const res = CrearRadiobaseSchema.safeParse({
        codigo: 'RDB-099',
        nombre: 'Torre Nueva',
        region: 'Centro',
      });
      expect(res.success).toBe(true);
    });

    it('debe rechazar correo inválido en usuarios', () => {
      const res = CrearUsuarioSchema.safeParse({
        email: 'correo-invalido',
        nombre: 'Pedro',
        cedula: '12345',
        rol: RolUsuario.TECNICO,
      });
      expect(res.success).toBe(false);
    });

    it('debe rechazar evidencias con slot menor a 1 o mayor a 48', () => {
      const res = RegistrarEvidenciaSchema.safeParse({
        reporteId: 'rep-1',
        tipoEquipo: 'PIR',
        slotNumero: 49,
        momento: MomentoFoto.ANTES,
        urlImagen: 'https://img.com/test.jpg',
      });
      expect(res.success).toBe(false);
    });
  });
});
