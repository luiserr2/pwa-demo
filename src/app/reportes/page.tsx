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

  // Matriz 48 zonas editable para el reporte seleccionado
  const [zonas, setZonas] = useState<Array<{ id: number; desc: string; estado: string }>>(
    Array.from({ length: 48 }, (_, i) => ({
      id: i + 1,
      desc: i === 0 ? 'PIR Entrada Principal' : i === 1 ? 'Magnético Puerta Torre' : i === 2 ? 'Sensor Sísmico Baterías' : `Zona ${i + 1}`,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#30235F] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
              Auditoría y Despliegue
            </span>
            <span className="text-xs font-bold text-slate-500">Módulo de Tabulación Rápida</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Reportes & Matriz de 48 Zonas
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Persistencia relacional con TypeORM &middot; Flujo integral de ciclo de vida del reporte.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/mobile"
            className="bg-[#009444] hover:bg-[#007d3a] text-white text-xs font-black px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>📱</span>
            <span>Nuevo Reporte en Campo</span>
          </Link>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#30235F] uppercase">Filtrar por:</span>
          {['TODOS', 'BORRADOR', 'EN_REVISION', 'OBSERVADO', 'APROBADO'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroEstado(st)}
              className={`text-xs font-black px-3 py-1.5 rounded-lg transition-colors ${
                filtroEstado === st
                  ? 'bg-[#30235F] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-500">
          Mostrando {reportesFiltrados.length} de {reportes.length} reportes
        </span>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LIST OF REPORTS (5 COLS) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-black text-[#30235F] uppercase tracking-wider mb-2">
            Listado de Reportes
          </h2>
          {reportesFiltrados.map((rep) => {
            const isSelected = zonaActivaReporte === rep.id;

            return (
              <div
                key={rep.id}
                onClick={() => setZonaActivaReporte(rep.id)}
                className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-sm ${
                  isSelected
                    ? 'border-[#30235F] ring-2 ring-purple-600/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black text-[#30235F]">{rep.codigo}</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      rep.estado === 'APROBADO'
                        ? 'bg-emerald-50 text-[#009444] border-emerald-300'
                        : rep.estado === 'OBSERVADO'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : rep.estado === 'EN_REVISION'
                        ? 'bg-purple-50 text-[#30235F] border-purple-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {rep.estado}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm mb-1">{rep.radiobase}</h3>
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Técnico: {rep.tecnico}</span>
                  <span className="font-mono font-bold text-slate-700">{rep.fotosCount} fotos</span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Fecha: {rep.fechaVisita}</span>
                  <Link
                    href="/supervisor"
                    className="text-[#30235F] hover:text-[#009444] font-black transition-colors"
                  >
                    Inspección Visual &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* 48-ZONE MATRIX EDITOR (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Matriz Fija de 48 Zonas (Inicialización TypeORM)
              </h2>
              <p className="text-xs text-slate-500">
                Grid pre-renderizado con 48 entradas para llenado y tabulación instantánea.
              </p>
            </div>
            <button
              onClick={() => alert('¡Matriz de 48 zonas guardada con éxito en la base de datos!')}
              className="bg-[#009444] hover:bg-[#007d3a] text-white text-xs font-black px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              💾 Guardar 48 Zonas
            </button>
          </div>

          {/* 48 ZONES SCROLLABLE CONTAINER */}
          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {zonas.map((zona) => (
                <div
                  key={zona.id}
                  className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-white text-xs transition-colors"
                >
                  <span className="w-7 h-7 rounded bg-[#30235F] text-white font-mono font-bold flex items-center justify-center shrink-0">
                    {zona.id}
                  </span>
                  <input
                    type="text"
                    value={zona.desc}
                    onChange={(e) => handleZonaChange(zona.id, e.target.value, zona.estado)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs focus:ring-1 focus:ring-[#30235F]"
                    placeholder={`Descripción zona ${zona.id}`}
                  />
                  <select
                    value={zona.estado}
                    onChange={(e) => handleZonaChange(zona.id, zona.desc, e.target.value)}
                    className={`rounded px-1.5 py-1 font-extrabold text-[10px] border ${
                      zona.estado === 'OK'
                        ? 'bg-emerald-50 text-[#009444] border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    <option value="OK">OK</option>
                    <option value="ALARMA">ALARMA</option>
                    <option value="DESCONECTADO">DESCONECTADO</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
