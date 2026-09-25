'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupervisorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0A0F1D] flex items-center justify-center p-6 text-slate-300 font-mono text-xs">
      <div className="flex items-center gap-3.5 bg-slate-900/60 border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl shadow-2xl">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
        <div>
          <div className="font-bold text-white text-xs tracking-wider uppercase">
            Arquitectura Consolidada (2 Roles)
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">
            Redirigiendo a la consola de Dirección de Operaciones (/admin/dashboard)...
          </div>
        </div>
      </div>
    </div>
  );
}
