import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verificarTokenSesionEdge } from '@/server/security/token-edge';
import { RUTA_INICIO_POR_ROL, puedeAccederRuta } from '@/shared/rbac';

function esRutaPublica(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico') ||
    pathname.endsWith('.webmanifest') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.js')
  );
}

/**
 * RBAC de páginas (3 roles). La sesión se verifica con HMAC-SHA256 vía Web Crypto:
 * un token sin firma válida equivale a no tener sesión. Las APIs aplican su propio guard.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('sisbirceca_auth')?.value;
  const user = token ? await verificarTokenSesionEdge(token) : null;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(user ? RUTA_INICIO_POR_ROL[user.rol] : '/login', request.url));
  }

  if (esRutaPublica(pathname)) {
    return NextResponse.next();
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const respuesta = NextResponse.redirect(loginUrl);
    // Cookie presente pero inválida/expirada/falsificada: se elimina.
    if (token) respuesta.cookies.set('sisbirceca_auth', '', { path: '/', maxAge: 0 });
    return respuesta;
  }

  if (!puedeAccederRuta(user.rol, pathname)) {
    return NextResponse.redirect(new URL(RUTA_INICIO_POR_ROL[user.rol], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
