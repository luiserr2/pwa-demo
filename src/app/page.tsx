import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-blue-900/50 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Arquitectura de Producción
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-medium px-3 py-1 rounded-full">
            TypeORM + PostgreSQL 16
          </span>
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-medium px-3 py-1 rounded-full">
            Jest Backend Certified
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
          SISBIRCECA — Plataforma de Radiobases
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed mb-6">
          Sistema integral para técnicos de campo y supervisores de telecomunicaciones. Incorpora captura móvil guiada con compresión en cliente, validación visual lado a lado con control de calidad y matriz de 48 zonas con persistencia TypeORM.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/mobile"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <span>📱</span>
            <span>Abrir PWA Móvil de Campo</span>
          </Link>
          <Link
            href="/supervisor"
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>👁️</span>
            <span>Bandeja de Validación Visual</span>
          </Link>
          <Link
            href="/reportes"
            className="bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/60 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
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
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4">
            📱
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">1. Captura en Campo (PWA)</h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Diseñada para técnicos en torre. Cuenta con slots de fotos correlativos, compresión local en navegador (&lt; 250 KB WebP) y bloqueo reactivo de fotos &quot;Después&quot;.
          </p>
          <Link
            href="/mobile"
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm inline-flex items-center gap-1"
          >
            Ir a Captura Móvil &rarr;
          </Link>
        </div>

        {/* MODULO 2: SUPERVISIÓN */}
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-b from-white to-blue-50/30">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold mb-4">
            👁️
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">2. Validación Visual</h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Panel de supervisión que permite comparar fotográficamente el Antes vs Después, aprobar evidencias con 1 clic o rechazar con motivos visuales técnicos.
          </p>
          <Link
            href="/supervisor"
            className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm inline-flex items-center gap-1"
          >
            Ir a Validación Visual &rarr;
          </Link>
        </div>

        {/* MODULO 3: MATRIZ Y EQUIPOS */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mb-4">
            🎛️
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">3. Matriz de 48 Zonas</h3>
          <p className="text-slate-600 text-sm mb-4 leading-relaxed">
            Grid rápido pre-renderizado de 48 entradas con teclado veloz, catálogo controlado de equipos (Hikvision, DSC, etc.) y configuración de red.
          </p>
          <Link
            href="/reportes"
            className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm inline-flex items-center gap-1"
          >
            Ver Matriz de Zonas &rarr;
          </Link>
        </div>
      </div>

      {/* FOOTER AUDIT SPECS */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-4">
        <div>
          <strong>Stack Técnico Certificado:</strong> Next.js 14 App Router &middot; TypeORM 0.3 &middot; PostgreSQL 16 &middot; Jest Tests (15/15 pasando) &middot; Dexie.js
        </div>
        <div className="font-mono bg-white px-2.5 py-1 rounded border border-slate-300">
          gerson-sisbirceca v1.0.0
        </div>
      </div>
    </div>
  );
}
