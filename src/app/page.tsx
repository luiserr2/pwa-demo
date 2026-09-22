import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
      {/* HERO BANNER INSTITUCIONAL CON #30235F Y #009444 */}
      <div className="bg-gradient-to-br from-[#30235F] via-[#3b297b] to-[#1e153c] text-white rounded-2xl p-6 sm:p-10 shadow-2xl border border-purple-900/60 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-[#009444] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
            Sistema Oficial para el Mercado
          </span>
          <span className="bg-purple-950/60 text-purple-200 border border-purple-400/40 text-xs font-bold px-3 py-1 rounded-full">
            TypeORM & PostgreSQL 16
          </span>
          <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-400/40 text-xs font-bold px-3 py-1 rounded-full">
            Jest Backend 100% Certified
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
          SISBIRCECA — Plataforma de Radiobases
        </h1>
        <p className="text-purple-100/90 text-sm sm:text-base max-w-3xl leading-relaxed mb-6">
          Solución de nivel enterprise para el levantamiento técnico en radiobases, inspección fotográfica guiada con compresión móvil y flujo de validación visual con control de calidad para supervisores.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/mobile"
            className="bg-[#009444] hover:bg-[#00803b] text-white font-extrabold text-sm px-5 py-2.5 rounded-lg shadow-lg transition-all flex items-center gap-2"
          >
            <span>📱</span>
            <span>PWA Móvil de Campo</span>
          </Link>
          <Link
            href="/supervisor"
            className="bg-[#30235F] hover:bg-[#3e2c7a] text-white border border-purple-400/40 font-extrabold text-sm px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow"
          >
            <span>👁️</span>
            <span>Bandeja de Validación Visual</span>
          </Link>
          <Link
            href="/reportes"
            className="bg-black/30 hover:bg-black/50 text-purple-200 border border-purple-400/30 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📋</span>
            <span>Matriz de 48 Zonas</span>
          </Link>
        </div>
      </div>

      {/* CORE MODULES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* MODULO 1: CAMPO */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#009444] flex items-center justify-center text-xl font-bold mb-4 border border-emerald-200">
            📱
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">1. Captura en Campo (PWA)</h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Diseñada para técnicos en torre. Cuenta con slots de fotos correlativos, compresión local en navegador (&lt; 250 KB WebP) y bloqueo reactivo de fotos &quot;Después&quot;.
          </p>
          <Link
            href="/mobile"
            className="text-[#009444] hover:text-[#006b31] font-extrabold text-sm inline-flex items-center gap-1"
          >
            Ir a Captura Móvil &rarr;
          </Link>
        </div>

        {/* MODULO 2: SUPERVISIÓN */}
        <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-b from-white to-purple-50/20">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#30235F] flex items-center justify-center text-xl font-bold mb-4 border border-purple-200">
            👁️
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">2. Validación Visual QA</h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Panel de supervisión que permite comparar fotográficamente el Antes vs Después, aprobar evidencias con 1 clic o rechazar con motivos visuales técnicos.
          </p>
          <Link
            href="/supervisor"
            className="text-[#30235F] hover:text-[#1e153c] font-extrabold text-sm inline-flex items-center gap-1"
          >
            Ir a Validación Visual &rarr;
          </Link>
        </div>

        {/* MODULO 3: MATRIZ Y EQUIPOS */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-xl font-bold mb-4 border border-slate-300">
            🎛️
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">3. Matriz de 48 Zonas</h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Grid rápido pre-renderizado de 48 entradas con teclado veloz, catálogo controlado de equipos (Hikvision, DSC, etc.) y configuración de red.
          </p>
          <Link
            href="/reportes"
            className="text-slate-800 hover:text-black font-extrabold text-sm inline-flex items-center gap-1"
          >
            Ver Matriz de Zonas &rarr;
          </Link>
        </div>
      </div>

      {/* FOOTER AUDIT SPECS */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-4">
        <div>
          <strong>Identidad Oficial:</strong> Institucional <span className="font-mono text-[#30235F] font-bold">#30235F</span> &middot; Operativo <span className="font-mono text-[#009444] font-bold">#009444</span> &middot; TypeORM 0.3 &middot; Next.js 14 App Router &middot; Jest Tests (17/17)
        </div>
        <div className="font-mono bg-white px-2.5 py-1 rounded border border-slate-300 font-bold text-slate-700">
          gerson-sisbirceca v1.0.0-prod
        </div>
      </div>
    </div>
  );
}
