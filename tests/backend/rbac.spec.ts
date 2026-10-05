import { NextRequest } from 'next/server';
import { generarTokenSesion } from '../../src/server/security/auth-token';
import { verificarTokenSesionEdge } from '../../src/server/security/token-edge';
import { verificarPermisosAPI } from '../../src/server/security/guard';
import { RolUsuario } from '../../src/server/types/roles';
import { puedeAccederRuta, RUTA_INICIO_POR_ROL, NAVEGACION_POR_ROL, ROLES } from '../../src/shared/rbac';

const usuario = (rol: RolUsuario) => ({
  id: '7f1d2c3b-4a5e-4f60-8a71-92b3c4d5e6f7',
  email: `${rol.toLowerCase()}@sisbirceca.com`,
  nombre: `Usuario ${rol}`,
  rol,
});

describe('RBAC de 3 roles — matriz de rutas', () => {
  it('cada rol aterriza en una ruta que puede abrir', () => {
    for (const rol of ROLES) {
      expect(puedeAccederRuta(rol, RUTA_INICIO_POR_ROL[rol])).toBe(true);
    }
  });

  it('la navegación de cada rol solo contiene rutas permitidas', () => {
    for (const rol of ROLES) {
      for (const enlace of NAVEGACION_POR_ROL[rol]) {
        expect(puedeAccederRuta(rol, enlace.href)).toBe(true);
      }
    }
  });

  it('TECNICO: campo y captura sí; pipeline, supervisión y admin no', () => {
    expect(puedeAccederRuta('TECNICO', '/campo')).toBe(true);
    expect(puedeAccederRuta('TECNICO', '/captura')).toBe(true);
    expect(puedeAccederRuta('TECNICO', '/reportes')).toBe(false);
    expect(puedeAccederRuta('TECNICO', '/supervisor')).toBe(false);
    expect(puedeAccederRuta('TECNICO', '/admin/dashboard')).toBe(false);
  });

  it('SUPERVISOR: pipeline y supervisión sí; captura y admin no', () => {
    expect(puedeAccederRuta('SUPERVISOR', '/reportes')).toBe(true);
    expect(puedeAccederRuta('SUPERVISOR', '/supervisor')).toBe(true);
    expect(puedeAccederRuta('SUPERVISOR', '/captura')).toBe(false);
    expect(puedeAccederRuta('SUPERVISOR', '/campo')).toBe(false);
    expect(puedeAccederRuta('SUPERVISOR', '/admin/usuarios')).toBe(false);
  });

  it('ADMIN accede a todo', () => {
    for (const ruta of ['/admin/dashboard', '/reportes', '/supervisor', '/campo', '/captura']) {
      expect(puedeAccederRuta('ADMIN', ruta)).toBe(true);
    }
  });

  it('el expediente PDF es visible para los 3 roles', () => {
    for (const rol of ROLES) {
      expect(puedeAccederRuta(rol, '/reportes/7f1d2c3b-4a5e-4f60-8a71-92b3c4d5e6f7/pdf')).toBe(true);
    }
  });

  it('no confunde prefijos (/administracion no es /admin)', () => {
    expect(puedeAccederRuta('TECNICO', '/administracion')).toBe(true);
  });
});

describe('Sesión firmada — Edge (middleware) y guard de API', () => {
  it('Edge acepta un token legítimo para cada rol', async () => {
    for (const rol of Object.values(RolUsuario)) {
      const payload = await verificarTokenSesionEdge(generarTokenSesion(usuario(rol)));
      expect(payload?.rol).toBe(rol);
    }
  });

  it('Edge rechaza un token con el rol escalado (firma no coincide)', async () => {
    const token = generarTokenSesion(usuario(RolUsuario.TECNICO));
    const [payloadB64, firma] = token.split('.');
    const datos = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    datos.rol = RolUsuario.ADMIN;
    const falsificado = `${Buffer.from(JSON.stringify(datos)).toString('base64url')}.${firma}`;
    expect(await verificarTokenSesionEdge(falsificado)).toBeNull();
  });

  it('Edge rechaza un token sin firma (decodificación sola ya no basta)', async () => {
    const payload = Buffer.from(
      JSON.stringify({ ...usuario(RolUsuario.ADMIN), exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString('base64url');
    expect(await verificarTokenSesionEdge(`${payload}.`)).toBeNull();
    expect(await verificarTokenSesionEdge(`${payload}.firma-inventada`)).toBeNull();
  });

  it('el guard rechaza la cabecera x-user-role sin sesión (bypass eliminado)', () => {
    const req = new NextRequest('http://localhost/api/usuarios', {
      headers: { 'x-user-role': 'ADMIN', 'x-user-id': 'atacante' },
    });
    const resultado = verificarPermisosAPI(req, [RolUsuario.ADMIN]);
    expect(resultado.autorizado).toBe(false);
    expect(resultado.response?.status).toBe(401);
  });

  it('el guard aplica el rol: SUPERVISOR no entra a rutas solo-ADMIN', () => {
    const token = generarTokenSesion(usuario(RolUsuario.SUPERVISOR));
    const req = new NextRequest('http://localhost/api/usuarios', { headers: { cookie: `sisbirceca_auth=${token}` } });
    expect(verificarPermisosAPI(req, [RolUsuario.ADMIN]).response?.status).toBe(403);
    expect(verificarPermisosAPI(req, [RolUsuario.SUPERVISOR, RolUsuario.ADMIN]).autorizado).toBe(true);
  });
});
