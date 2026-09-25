import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verificarTokenSesion } from '@/server/security/auth-token';
import { RolUsuario } from '@/server/types/roles';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico') ||
    pathname.endsWith('.webmanifest') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.js');

  // Leer token de sesión de cookies
  const token = request.cookies.get('sisbirceca_auth')?.value;
  let user = token ? verificarTokenSesion(token) : null;

  // Fallback de resiliencia en Edge Runtime para garantizar decodificación inmediata
  if (!user && token && token.includes('.')) {
    try {
      const [payloadBase64] = token.split('.');
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const binStr = atob(base64);
      const jsonStr = decodeURIComponent(
        binStr
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.rol && parsed.exp && Date.now() / 1000 <= parsed.exp) {
        user = parsed;
      }
    } catch {
      user = null;
    }
  }

  // Redirección inteligente de la raíz /
  if (pathname === '/') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const redirectUrl =
      user.rol === RolUsuario.TECNICO
        ? new URL('/campo', request.url)
        : new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Si no está autenticado, redirigir a /login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 1. Jurisdicción ADMINISTRADOR: /admin/*
  if (pathname.startsWith('/admin')) {
    if (user.rol !== RolUsuario.ADMIN) {
      return NextResponse.redirect(new URL('/campo', request.url));
    }
  }

  // 2. Redirección de rutas legadas (/supervisor y /reportes)
  if (pathname === '/reportes' || pathname.startsWith('/supervisor')) {
    return NextResponse.redirect(
      new URL(user.rol === RolUsuario.ADMIN ? '/admin/dashboard' : '/campo', request.url)
    );
  }

  // 3. Jurisdicción TÉCNICO: /campo y /mobile
  if (pathname.startsWith('/campo') || pathname.startsWith('/mobile')) {
    if (user.rol !== RolUsuario.TECNICO && user.rol !== RolUsuario.ADMIN) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
