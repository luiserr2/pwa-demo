/**
 * Matriz RBAC de 3 roles (fuente única para middleware, Navbar y redirecciones de cliente).
 * TS puro: se importa desde Edge (middleware) y desde componentes cliente.
 *
 *  - TECNICO:    captura en campo (/campo, /captura, /mobile) + expediente PDF propio.
 *  - SUPERVISOR: pipeline de 8 fases (/reportes), supervisión y trazabilidad (/supervisor),
 *                validación visual de evidencias + expediente PDF.
 *  - ADMIN:      todo lo anterior + administración (/admin/*).
 */
import type { RolApi } from './tipos-api';

export const ROLES: readonly RolApi[] = ['TECNICO', 'SUPERVISOR', 'ADMIN'];

export const ETIQUETAS_ROL: Record<RolApi, string> = {
  TECNICO: 'Técnico',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Administrador',
};

export const DESCRIPCION_ROL: Record<RolApi, string> = {
  TECNICO: 'Captura en torre: fotos Antes/Después y matriz de 48 zonas.',
  SUPERVISOR: 'Revisión interna, validación visual de evidencias y avance del pipeline.',
  ADMIN: 'Estadísticas, usuarios, radiobases, auditoría y control total del flujo.',
};

export const RUTA_INICIO_POR_ROL: Record<RolApi, string> = {
  TECNICO: '/campo',
  SUPERVISOR: '/reportes',
  ADMIN: '/admin/dashboard',
};

interface ReglaRuta {
  /** Coincide si el pathname es exactamente el prefijo o empieza por `${prefijo}/`. */
  prefijo: string;
  roles: readonly RolApi[];
}

/** Orden: de más específica a más general. La primera regla que coincide decide. */
const REGLAS: readonly ReglaRuta[] = [
  { prefijo: '/admin', roles: ['ADMIN'] },
  { prefijo: '/supervisor', roles: ['SUPERVISOR', 'ADMIN'] },
  { prefijo: '/campo', roles: ['TECNICO', 'ADMIN'] },
  { prefijo: '/captura', roles: ['TECNICO', 'ADMIN'] },
  { prefijo: '/mobile', roles: ['TECNICO', 'ADMIN'] },
];

const PATRON_EXPEDIENTE_PDF = /^\/reportes\/[^/]+\/pdf\/?$/;

function coincidePrefijo(pathname: string, prefijo: string): boolean {
  return pathname === prefijo || pathname.startsWith(`${prefijo}/`);
}

export function esRol(valor: unknown): valor is RolApi {
  return typeof valor === 'string' && (ROLES as readonly string[]).includes(valor);
}

/**
 * ¿Puede el rol abrir esta página? Rutas no listadas quedan abiertas a cualquier sesión válida.
 * El expediente PDF es visible para los 3 roles (la API de detalle aplica su propio control).
 */
export function puedeAccederRuta(rol: RolApi, pathname: string): boolean {
  if (PATRON_EXPEDIENTE_PDF.test(pathname)) return true;
  if (coincidePrefijo(pathname, '/reportes')) return rol === 'SUPERVISOR' || rol === 'ADMIN';
  const regla = REGLAS.find((r) => coincidePrefijo(pathname, r.prefijo));
  return regla ? regla.roles.includes(rol) : true;
}

export interface EnlaceNavegacion {
  href: string;
  etiqueta: string;
}

/** Navegación principal por rol (solo rutas que el rol puede abrir). */
export const NAVEGACION_POR_ROL: Record<RolApi, readonly EnlaceNavegacion[]> = {
  TECNICO: [{ href: '/campo', etiqueta: 'Asignaciones' }],
  SUPERVISOR: [
    { href: '/reportes', etiqueta: 'Pipeline' },
    { href: '/supervisor', etiqueta: 'Supervisión' },
  ],
  ADMIN: [
    { href: '/admin/dashboard', etiqueta: 'Estadísticas' },
    { href: '/reportes', etiqueta: 'Pipeline' },
    { href: '/supervisor', etiqueta: 'Supervisión' },
    { href: '/admin/usuarios', etiqueta: 'Usuarios' },
    { href: '/admin/radiobases', etiqueta: 'Radiobases' },
  ],
};
