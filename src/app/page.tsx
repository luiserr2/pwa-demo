'use client';

import { useEffect } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import { useRouter } from 'next/navigation';
import { RUTA_INICIO_POR_ROL } from '@/shared/rbac';

export default function RootPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirección según el rol (misma matriz que el middleware).
    router.replace(user ? RUTA_INICIO_POR_ROL[user.rol] : '/login');
  }, [user, router]);

  return <div className="min-h-screen bg-slate-50"></div>;
}
