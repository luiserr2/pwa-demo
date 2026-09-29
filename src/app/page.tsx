'use client';

import { useEffect } from 'react';
import { useAuth } from '@/client/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirección inmediata según el rol
    if (!user) {
      router.replace('/login');
    } else if (user.rol === 'ADMIN') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/campo');
    }
  }, [user, router]);

  return <div className="min-h-screen bg-slate-50"></div>;
}
