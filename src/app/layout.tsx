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
        <meta name="theme-color" content="#30235F" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* TOP NAVBAR INSTITUCIONAL CON #30235F Y ACENTO #009444 */}
        <header className="sticky top-0 z-50 bg-[#30235F] text-white shadow-lg border-b border-[#3e2c7a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <span className="bg-[#009444] text-white font-black text-xs px-2.5 py-1 rounded tracking-wider uppercase shadow-sm">
                  SISBIRCECA
                </span>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white hidden sm:inline">
                  Radiobases Telecom
                </span>
              </Link>
              <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                PRODUCCIÓN
              </span>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-semibold">
              <Link
                href="/mobile"
                className="px-3 py-1.5 rounded-md hover:bg-[#3e2c7a] text-purple-100 transition-colors flex items-center gap-1.5"
              >
                <span>📱</span>
                <span>PWA Campo</span>
              </Link>
              <Link
                href="/supervisor"
                className="px-3 py-1.5 rounded-md bg-[#009444] hover:bg-[#00803b] text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>👁️</span>
                <span>Validación Visual</span>
              </Link>
              <Link
                href="/reportes"
                className="px-3 py-1.5 rounded-md hover:bg-[#3e2c7a] text-purple-100 transition-colors flex items-center gap-1.5"
              >
                <span>📋</span>
                <span>48 Zonas</span>
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
