import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/client/context/AuthContext';
import { Navbar } from '@/client/components/Navbar';

export const metadata: Metadata = {
  title: 'SISBIRCECA — Sistema de Reportes Técnicos de Radiobases',
  description: 'PWA de grado de producción con TypeORM, Next.js y flujo de validación visual',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navbar />
          {/* MAIN BODY */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </AuthProvider>


        {/* PWA SERVICE WORKER REGISTRATION SCRIPT */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('SW SISBIRCECA activo:', reg.scope); },
                    function(err) { console.log('SW registro error:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
