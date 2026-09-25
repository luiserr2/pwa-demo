'use client';

import { useEffect } from 'react';
import { useAuth } from '@/client/context/AuthContext';

export default function RootPage() {
  const { user } = useAuth();

  useEffect(() => {
    // Si no hay usuario cargado en contexto/localStorage, enviar a login
    if (!user) {
      window.location.href = '/login';
    } else if (user.rol === 'ADMIN') {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/campo';
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-mono text-xs">
      <div className="flex items-center gap-3 bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-2xl">
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <div>
          <div className="font-bold text-white text-sm">SISBIRCECA Enterprise Platform</div>
          <div className="text-slate-400 text-xs">Conectando con la terminal autorizada...</div>
        </div>
      </div>
    </div>
  );
}
