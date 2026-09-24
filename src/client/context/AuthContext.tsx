'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type RolUsuario = 'TECNICO' | 'SUPERVISOR' | 'ADMIN';

export interface UserSession {
  id: string;
  email: string;
  nombre: string;
  cedula: string;
  rol: RolUsuario;
  cargo: string;
}

export const USUARIOS_HOMOLOGADOS: Record<RolUsuario, UserSession> = {
  TECNICO: {
    id: 'usr-tec-01',
    email: 'tecnico@sisbirceca.com',
    nombre: 'Gerson Martínez',
    cedula: 'V-24.891.203',
    rol: 'TECNICO',
    cargo: 'Técnico Especialista en Radiobases',
  },
  SUPERVISOR: {
    id: 'usr-sup-01',
    email: 'supervisor@sisbirceca.com',
    nombre: 'Ing. Roberto Silva',
    cedula: 'V-18.442.109',
    rol: 'SUPERVISOR',
    cargo: 'Supervisor de Calidad & Operaciones Telecom',
  },
  ADMIN: {
    id: 'usr-adm-01',
    email: 'admin@sisbirceca.com',
    nombre: 'Lic. Mariana Fernández',
    cedula: 'V-15.320.841',
    rol: 'ADMIN',
    cargo: 'Gerente Nacional de Infraestructura',
  },
};

interface AuthContextType {
  user: UserSession | null;
  rolActivo: RolUsuario | null;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (rol: RolUsuario) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  rolActivo: null,
  login: async () => false,
  logout: async () => {},
  switchRole: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  const sincronizarCookieSesion = async (usuario: UserSession) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email, rol: usuario.rol }),
      });
      const data = await res.json();
      if (data?.data?.token && typeof document !== 'undefined') {
        document.cookie = `sisbirceca_auth=${data.data.token}; path=/; max-age=86400; SameSite=Lax`;
      }
    } catch {
      // En caso de fallo de red puntual, no bloquear la UI
    }
  };

  useEffect(() => {
    // Cargar sesión persistida si existe
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sisbirceca_session') : null;
    if (saved) {
      try {
        const initialUser = JSON.parse(saved);
        setUser(initialUser);
        sincronizarCookieSesion(initialUser);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const found = Object.values(USUARIOS_HOMOLOGADOS).find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (found) {
      setUser(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sisbirceca_session', JSON.stringify(found));
        try {
          const payload = {
            id: found.id,
            email: found.email,
            nombre: found.nombre,
            rol: found.rol,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          };
          const p64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
          document.cookie = `sisbirceca_auth=${p64}.client_sync; path=/; max-age=86400; SameSite=Lax`;
        } catch {}
      }
      await sincronizarCookieSesion(found);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sisbirceca_session');
      document.cookie = 'sisbirceca_auth=; path=/; max-age=0; SameSite=Lax';
    }
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // No-op
    }
  };

  const switchRole = async (rol: RolUsuario) => {
    const target = USUARIOS_HOMOLOGADOS[rol];
    setUser(target);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sisbirceca_session', JSON.stringify(target));
      try {
        const payload = {
          id: target.id,
          email: target.email,
          nombre: target.nombre,
          rol: target.rol,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        };
        const p64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        document.cookie = `sisbirceca_auth=${p64}.client_sync; path=/; max-age=86400; SameSite=Lax`;
      } catch {}
    }
    await sincronizarCookieSesion(target);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        rolActivo: user?.rol || null,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
