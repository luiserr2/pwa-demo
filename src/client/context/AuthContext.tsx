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

  /**
   * Pide al servidor la sesión firmada y adopta la identidad persistida (UUID real de `usuarios`).
   * Devuelve false si el servidor rechaza al usuario (no existe / BD caída).
   */
  const sincronizarCookieSesion = async (usuario: UserSession): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email, rol: usuario.rol }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.data?.usuario?.id) {
        return false;
      }
      const real: UserSession = {
        ...usuario,
        id: data.data.usuario.id,
        nombre: data.data.usuario.nombre ?? usuario.nombre,
        rol: data.data.usuario.rol ?? usuario.rol,
      };
      setUser(real);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sisbirceca_session', JSON.stringify(real));
      }
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Cargar sesión persistida si existe y revalidarla contra el servidor
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sisbirceca_session') : null;
    if (saved) {
      try {
        const initialUser = JSON.parse(saved) as UserSession;
        setUser(initialUser);
        void sincronizarCookieSesion(initialUser);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const normalizado = email.trim().toLowerCase();
    if (!normalizado) return false;
    const homologado = Object.values(USUARIOS_HOMOLOGADOS).find((u) => u.email.toLowerCase() === normalizado);
    const semilla: UserSession = homologado ?? {
      id: '',
      email: normalizado,
      nombre: normalizado,
      cedula: '',
      rol: 'TECNICO',
      cargo: '',
    };
    return await sincronizarCookieSesion(semilla);
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
    await sincronizarCookieSesion(USUARIOS_HOMOLOGADOS[rol]);
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
