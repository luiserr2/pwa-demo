'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ReporteItem {
  id: string;
  codigo: string;
  radiobase: string;
  region: string;
  tecnico: string;
  estado: 'BORRADOR' | 'EN_REVISION' | 'OBSERVADO' | 'APROBADO';
  fechaVisita: string;
  fotosCount: number;
}

const REPORTES_INICIALES: ReporteItem[] = [
  {
    id: 'rep-001',
    codigo: 'RDB-001_20260922',
    radiobase: 'Torre Puerto Madero',
    region: 'AMBA / CABA',
    tecnico: 'Gerson Martínez',
    estado: 'EN_REVISION',
    fechaVisita: '2026-09-22',
    fotosCount: 12,
  },
  {
    id: 'rep-002',
    codigo: 'RDB-002_20260922',
    radiobase: 'Cerro Catedral Repetidor',
    region: 'Patagonia Norte',
    tecnico: 'Carlos Gómez',
    estado: 'OBSERVADO',
    fechaVisita: '2026-09-22',
    fotosCount: 10,
  },
  {
    id: 'rep-003',
    codigo: 'RDB-003_20260921',
    radiobase: 'Córdoba Sierras Torre 4',
    region: 'Centro',
    tecnico: 'Martín Albornoz',
    estado: 'APROBADO',
    fechaVisita: '2026-09-21',
    fotosCount: 12,
  },
  {
    id: 'rep-004',
    codigo: 'RDB-004_20260920',
    radiobase: 'Palermo Soho Microcelda',
    region: 'CABA Norte',
    tecnico: 'Gerson Martínez',
    estado: 'BORRADOR',
    fechaVisita: '2026-09-20',
    fotosCount: 4,
  },
];

export default function ReportesPage() {
  const [reportes] = useState<ReporteItem[]>(REPORTES_INICIALES);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [zonaActivaReporte, setZonaActivaReporte] = useState<string | null>('rep-001');
  const [guardadoFeedback, setGuardadoFeedback] = useState<string | null>(null);

  // Matriz 48 zonas editable para el reporte seleccionado
  const [zonas, setZonas] = useState<Array<{ id: number; desc: string; estado: string }>>(
    Array.from({ length: 48 }, (_, i) => ({
      id: i + 1,
      desc:
        i === 0
          ? 'PIR Entrada Principal'
          : i === 1
          ? 'Magnético Puerta Torre'
          : i === 2
          ? 'Sensor Sísmico Baterías'
          : `Zona de Seguridad ${i + 1}`,
      estado: i === 3 ? 'ALARMA' : 'OK',
    }))
  );

  const reportesFiltrados = reportes.filter((r) => {
    if (filtroEstado === 'TODOS') return true;
    return r.estado === filtroEstado;
  });

  const handleZonaChange = (id: number, desc: string, estado: string) => {
    setZonas((prev) => prev.map((z) => (z.id === id ? { ...z, desc, estado } : z)));
  };

  const handleGuardarZonas = () => {
    setGuardadoFeedback(`Matriz de 48 zonas sincronizada correctamente para ${zonaActivaReporte || 'el reporte'}.`);
    setTimeout(() => {
      setGuardadoFeedback(null);
    }, 4000);
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-[#0A0F1D] text-slate-100 flex flex-col py-8">
      {/* RETÍCULA DE FONDO SMOKED OBSIDIAN */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        {/* CABECERA INDUSTRIAL COBALT */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-blue-600/15 text-blue-400 text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-blue-500/30 font-semibold tracking-wider">
                Auditoría & Despliegue SSOT
              </span>
              <span className="text-xs font-medium text-slate-400">
                Módulo de Tabulación Rápida y Matriz 48
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Gestión de Reportes Técnicos & Matriz de Zonas
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Persistencia canónica TypeORM &middot; Flujo integral de ciclo de vida del reporte de radiobase.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/campo"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-blue-400/30 shadow-sm transition-all flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Nuevo Reporte en Campo</span>
            </Link>
          </div>
        </div>

        {/* FEEDBACK NOTIFICATION */}
        {guardadoFeedback && (
          <div className="mb-6 p-3.5 rounded-xl text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{guardadoFeedback}</span>
            </div>
            <button
              onClick={() => setGuardadoFeedback(null)}
              className="text-emerald-400 hover:text-white text-xs font-mono"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* BARRA DE FILTROS SMOKED OBSIDIAN */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/[0.08] p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">
              Filtrar por:
            </span>
            {['TODOS', 'BORRADOR', 'EN_REVISION', 'OBSERVADO', 'APROBADO'].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroEstado(st)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filtroEstado === st
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border border-white/[0.06]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-400">
            Mostrando <span className="text-white font-semibold">{reportesFiltrados.length}</span> de {reportes.length} reportes
          </span>
        </div>

        {/* GRID ASIMÉTRICO: BANDEJA DE REPORTES (5 COLS) + MATRIZ 48 (7 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          {/* LISTADO DE REPORTES (5 COLS) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-1 px-1">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Bandeja de Expedientes
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Seleccionar para editar matriz</span>
            </div>

            {reportesFiltrados.map((rep) => {
              const isSelected = zonaActivaReporte === rep.id;

              return (
                <div
                  key={rep.id}
                  onClick={() => setZonaActivaReporte(rep.id)}
                  className={`bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-blue-500/50 bg-blue-600/[0.06] ring-1 ring-blue-500/30'
                      : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-white tracking-wide">
                      {rep.codigo}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                        rep.estado === 'APROBADO'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : rep.estado === 'OBSERVADO'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                          : rep.estado === 'EN_REVISION'
                          ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                          : 'bg-white/[0.04] text-slate-300 border-white/[0.08]'
                      }`}
                    >
                      {rep.estado}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm mb-1">{rep.radiobase}</h3>
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Técnico: {rep.tecnico}</span>
                    <span className="font-mono text-slate-300">{rep.fotosCount} fotos</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Fecha: {rep.fechaVisita}</span>
                    <Link
                      href={`/reportes/${rep.id}/pdf`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Auditoría PDF</span>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MATRIZ DE 48 ZONAS (7 COLS) */}
          <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 shadow-sm flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.08]">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Matriz Canónica de 48 Zonas (TypeORM)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Grid pre-renderizado con 48 entradas obligatorias para auditoría de alarma y sensores.
                </p>
              </div>
              <button
                onClick={handleGuardarZonas}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-blue-400/30 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:translate-y-[1px]"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Guardar Matriz</span>
              </button>
            </div>

            {/* CONTENEDOR CON OVERFLOW BLINDADO CONTRA DESBORDES */}
            <div className="w-full overflow-x-auto">
              <div className="max-h-[620px] overflow-y-auto pr-1 space-y-2 min-w-[320px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {zonas.map((zona) => (
                    <div
                      key={zona.id}
                      className="flex items-center gap-2 p-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="w-7 h-7 rounded-lg bg-slate-950 border border-white/10 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                        {zona.id}
                      </span>
                      <input
                        type="text"
                        value={zona.desc}
                        onChange={(e) => handleZonaChange(zona.id, e.target.value, zona.estado)}
                        className="flex-1 min-w-0 bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                        placeholder={`Descripción zona ${zona.id}`}
                      />
                      <select
                        value={zona.estado}
                        onChange={(e) => handleZonaChange(zona.id, zona.desc, e.target.value)}
                        className={`rounded-lg px-2 py-1.5 font-mono font-semibold text-[10px] border transition-colors shrink-0 ${
                          zona.estado === 'OK'
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                            : zona.estado === 'ALARMA'
                            ? 'bg-rose-950/50 text-rose-300 border-rose-500/30'
                            : 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <option value="OK" className="bg-[#0A0F1D] text-emerald-300">OK</option>
                        <option value="ALARMA" className="bg-[#0A0F1D] text-rose-300">ALARMA</option>
                        <option value="DESCONECTADO" className="bg-[#0A0F1D] text-amber-300">DESCONECTADO</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
