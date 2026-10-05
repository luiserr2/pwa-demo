'use client';

import { useEffect, useState } from 'react';

/**
 * Estado real de conectividad del dispositivo (navigator.onLine + eventos online/offline).
 * Arranca en `true` para que el render de servidor y el primer render de cliente coincidan;
 * el valor real se adopta en el primer efecto.
 */
export function useOnlineStatus(): boolean {
  const [enLinea, setEnLinea] = useState(true);

  useEffect(() => {
    setEnLinea(navigator.onLine);
    const alConectar = () => setEnLinea(true);
    const alDesconectar = () => setEnLinea(false);
    window.addEventListener('online', alConectar);
    window.addEventListener('offline', alDesconectar);
    return () => {
      window.removeEventListener('online', alConectar);
      window.removeEventListener('offline', alDesconectar);
    };
  }, []);

  return enLinea;
}
