import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

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
        <meta name="theme-color" content="#1e40af" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded tracking-wider uppercase">
                SISBIRCECA
              </span>
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-100 hidden sm:inline">
                PWA Radiobases Telecom
              </span>
              <span className="bg-emerald-600/80 text-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                TypeORM Core
              </span>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-3 text-xs sm:text-sm font-medium">
              <Link
                href="/mobile"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>📱</span>
                <span>PWA Campo</span>
              </Link>
              <Link
                href="/supervisor"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1.5 bg-blue-900/40 border border-blue-500/30 text-blue-200"
              >
                <span>👁️</span>
                <span>Validación Visual</span>
              </Link>
              <Link
                href="/reportes"
                className="px-3 py-1.5 rounded-md hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>📋</span>
                <span>Reportes</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

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
