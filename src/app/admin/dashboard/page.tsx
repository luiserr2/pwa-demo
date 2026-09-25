'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const ACTIVIDAD_INICIAL = [
  {
    id: 'rep-001',
    sitio: 'Torre Puerto Madero',
    codigo: 'RDB-001_20260922',
    siteCodigo: 'RDB-001',
    region: 'AMBA / CABA',
    tecnico: 'Gerson Martínez',
    cuadrilla: 'Cuadrilla 04',
    estado: 'COMPLETADO',
    fotosPares: '6/6 pares',
    fecha: '2026-09-22 11:40',
    tecnologia: '4G / 5G LTE Dual',
  },
  {
    id: 'rep-002',
    sitio: 'Cerro Catedral Repetidor',
    codigo: 'RDB-002_20260922',
    siteCodigo: 'RDB-002',
    region: 'Patagonia Norte',
    tecnico: 'Carlos Gómez',
    cuadrilla: 'Cuadrilla 09',
    estado: 'EN_PROGRESO',
    fotosPares: '5/6 pares',
    fecha: '2026-09-22 10:15',
    tecnologia: '4G LTE / Microondas',
  },
  {
    id: 'rep-003',
    sitio: 'Córdoba Sierras Repetidor',
    codigo: 'RDB-003_20260921',
    siteCodigo: 'RDB-003',
    region: 'Centro',
    tecnico: 'Martín Albornoz',
    cuadrilla: 'Cuadrilla 02',
    estado: 'COMPLETADO',
    fotosPares: '6/6 pares',
    fecha: '2026-09-21 16:30',
    tecnologia: '5G Standalone',
  },
  {
    id: 'rep-004',
    sitio: 'Palermo Soho Microcelda',
    codigo: 'RDB-004_20260920',
    siteCodigo: 'RDB-004',
    region: 'CABA Norte',
    tecnico: 'Gerson Martínez',
    cuadrilla: 'Cuadrilla 04',
    estado: 'PENDIENTE',
    fotosPares: '0/6 pares',
    fecha: '2026-09-20 09:00',
    tecnologia: '4G LTE',
  },
];

export default function AdminDashboardPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [actividadReciente, setActividadReciente] = useState(ACTIVIDAD_INICIAL);
  const [stats, setStats] = useState<{
    totalRadiobases: number;
    totalTecnicos: number;
    reportesPorEstado: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    // 1. Cargar estadísticas en tiempo real
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data) {
          setStats(json.data);
        }
      })
      .catch(() => {});

    // 2. Cargar reportes recientes
    fetch('/api/reportes')
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          const mapeados = json.data.map((r: any) => {
            const rawEstado = r.estado;
            const estadoMapeado =
              rawEstado === 'APROBADO' || rawEstado === 'COMPLETADO'
                ? 'COMPLETADO'
                : rawEstado === 'EN_REVISION' || rawEstado === 'EN_PROGRESO'
                ? 'EN_PROGRESO'
                : 'PENDIENTE';

            return {
              id: r.id,
              sitio: r.radiobase?.nombre || 'Radiobase Telecom',
              codigo: r.codigo,
              siteCodigo: r.radiobase?.codigo || 'RDB-001',
              region: r.radiobase?.region || 'AMBA / CABA',
              tecnico: r.tecnico?.nombre || 'Gerson Martínez',
              cuadrilla: 'Cuadrilla Operativa',
              estado: estadoMapeado,
              fotosPares: `${r.evidencias?.length || 0}/6 pares`,
              fecha: r.fechaVisita ? new Date(r.fechaVisita).toLocaleDateString('es-VE') : '2026-09-22',
              tecnologia: r.radiobase?.tecnologia || '4G / 5G LTE Dual',
            };
          });
          setActividadReciente(mapeados);
        }
      })
      .catch(() => {});
  }, []);

  const totalCompletados = actividadReciente.filter((a) => a.estado === 'COMPLETADO').length;
  const totalEnProgreso = actividadReciente.filter((a) => a.estado === 'EN_PROGRESO').length;
  const totalPendientes = actividadReciente.filter((a) => a.estado === 'PENDIENTE').length;
  const porcentajeCompletitud = Math.round((totalCompletados / (actividadReciente.length || 1)) * 100);

  const filtrados = actividadReciente.filter(
    (item) => filtroEstado === 'TODOS' || item.estado === filtroEstado
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      {/* HEADER DE CONTROL GERENCIAL */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-100 text-slate-700 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-slate-200 font-semibold tracking-wider">
              Dirección de Operaciones Telecom
            </span>
            <span className="text-slate-400">&middot;</span>
            <span className="text-xs text-slate-500 font-mono">
              SISBIRCECA NOC &middot; Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Estadísticas y Monitoreo de Infraestructura
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Supervisión ejecutiva de radiobases, despliegue en ruta y certificación de expedientes técnicos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/usuarios"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer active:translate-y-[1px]"
          >
            <span>Administrar Técnicos</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ASYMMETRIC BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-7">
        {/* HERO CARD (5 COLS) */}
        <div className="md:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Parque de Radiobases
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Operativo
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight mb-1">
              {stats ? `${stats.totalRadiobases} Sitios` : '42 Sitios'}
            </div>
            <p className="text-xs text-slate-500">
              Infraestructura homologada y monitoreada en tiempo real a nivel nacional.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-slate-500">Disponibilidad de Red</span>
              <span className="text-emerald-700 font-semibold">99.85% SLA</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '99.85%' }}></div>
            </div>
          </div>
        </div>

        {/* METRICS CARD (4 COLS) */}
        <div className="md:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Expedientes Técnicos
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {porcentajeCompletitud}% Completitud
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight mb-1">
              {actividadReciente.length}
            </div>
            <p className="text-xs text-slate-500">
              {totalCompletados} reportes certificados y listos para exportación técnica.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-slate-500">Tasa de Entrega</span>
              <span className="text-blue-700 font-semibold">{totalCompletados}/{actividadReciente.length} completados</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${porcentajeCompletitud}%` }}></div>
            </div>
          </div>
        </div>

        {/* TELEMETRY STACK (3 COLS) */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Personal Técnico en Campo
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {stats ? `${stats.totalTecnicos} Técnicos` : '6 Cuadrillas'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Habilitados para captura PWA</span>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Respaldo Fotográfico
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {actividadReciente.reduce((acc, cur) => acc + parseInt(cur.fotosPares), 0)} Pares
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Compresión WebP &lt; 250 KB</span>
          </div>
        </div>
      </div>

      {/* PANEL DE DISTRIBUCIÓN Y PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-7">
        {/* PARQUE TECNOLÓGICO (5 COLS) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Distribución de Tecnologías
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Total: 42 Sitios</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1.5">
                <span className="text-slate-700">4G / 5G LTE (Dual)</span>
                <span className="font-mono text-slate-900 font-semibold">24 Sitios (57%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1.5">
                <span className="text-slate-700">5G Standalone (Nueva Red)</span>
                <span className="font-mono text-emerald-700 font-semibold">10 Sitios (24%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1.5">
                <span className="text-slate-700">Microondas & Enlaces Rurales</span>
                <span className="font-mono text-amber-700 font-semibold">8 Sitios (19%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '19%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Homologación certificada: <strong className="text-slate-700">Hikvision, DSC, Cisco, Huawei</strong>.
          </div>
        </div>

        {/* PIPELINE DE INTERVENCIONES (7 COLS) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Pipeline Operativo de Intervenciones
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Flujo secuencial de órdenes asignadas a cuadrillas</p>
              </div>
              <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                {actividadReciente.length} Órdenes
              </span>
            </div>

            {/* INTEGRATED PIPELINE METRIC BAR */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 mb-4">
              <div className="p-3 rounded-md bg-white border border-slate-200/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">1. Pendientes</span>
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                </div>
                <div className="text-2xl font-bold text-slate-800 font-mono">{totalPendientes}</div>
                <span className="text-[10px] text-slate-500 block">Por visitar</span>
              </div>

              <div className="p-3 rounded-md bg-blue-50/70 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-blue-700 uppercase">2. En Progreso</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                </div>
                <div className="text-2xl font-bold text-blue-700 font-mono">{totalEnProgreso}</div>
                <span className="text-[10px] text-blue-600 block">Captura en torre</span>
              </div>

              <div className="p-3 rounded-md bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-emerald-700 uppercase">3. Completados</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                </div>
                <div className="text-2xl font-bold text-emerald-700 font-mono">{totalCompletados}</div>
                <span className="text-[10px] text-emerald-600 block">Reportes listos</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 flex items-center justify-between border border-slate-200">
            <span>Flujo continuo: Los reportes completados están disponibles de inmediato para descarga separada o informe unificado.</span>
          </div>
        </div>
      </div>

      {/* TABLA DE EXPEDIENTES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Registro de Reportes de Radiobases
            </h2>
            <p className="text-xs text-slate-500">
              Historial de levantamientos técnicos con acceso directo a entregables oficiales.
            </p>
          </div>

          {/* FILTROS SEGMENTADOS */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {['TODOS', 'COMPLETADO', 'EN_PROGRESO', 'PENDIENTE'].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroEstado(st)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  filtroEstado === st
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 pl-5">Código / Sitio</th>
                <th className="p-3">Región / Celda</th>
                <th className="p-3">Técnico & Cuadrilla</th>
                <th className="p-3">Tecnología</th>
                <th className="p-3">Fotos</th>
                <th className="p-3">Estatus</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 pr-5 text-right">Entregables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 pl-5">
                    <div className="font-bold text-slate-900 text-xs">{item.sitio}</div>
                    <div className="font-mono text-[11px] text-slate-500 font-medium">{item.codigo}</div>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{item.region}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{item.tecnico}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.cuadrilla}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-700">{item.tecnologia}</td>
                  <td className="p-3 font-mono text-slate-800 font-semibold">{item.fotosPares}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                        item.estado === 'COMPLETADO'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.estado === 'EN_PROGRESO'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{item.fecha}</td>
                  <td className="p-3 pr-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* FOTOS LINK */}
                      <Link
                        href={`/reportes/${item.id}/pdf?vista=FOTOS`}
                        className="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-md border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 active:translate-y-[1px]"
                        title="Ver solo Álbum Fotográfico"
                      >
                        <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>Fotos</span>
                      </Link>

                      {/* FICHA TÉCNICA LINK */}
                      <Link
                        href={`/reportes/${item.id}/pdf?vista=TECNICO`}
                        className="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-md border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 active:translate-y-[1px]"
                        title="Ver solo Ficha Técnica"
                      >
                        <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span>Ficha</span>
                      </Link>

                      {/* INFORME UNIFICADO LINK */}
                      <Link
                        href={`/reportes/${item.id}/pdf?vista=UNIFICADO`}
                        className="text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 active:translate-y-[1px]"
                        title="Ver Informe Unificado Completo"
                      >
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          <polyline points="2 17 12 22 22 17" />
                          <polyline points="2 12 12 17 22 12" />
                        </svg>
                        <span>Unificado</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
