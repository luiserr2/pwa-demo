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

  const kpis = [
    {
      label: 'Radiobases Atendidas',
      value: stats ? `${stats.totalRadiobases} Sitios` : '42 Sitios',
      sub: 'Monitoreo e infraestructura activa',
      trend: '100% Operativo',
      trendColor: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md',
    },
    {
      label: 'Reportes Levantados',
      value: `${actividadReciente.length} Expedientes`,
      sub: `${totalCompletados} completados en campo`,
      trend: `${Math.round((totalCompletados / (actividadReciente.length || 1)) * 100)}% Completitud`,
      trendColor: 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md',
    },
    {
      label: 'Técnicos de Campo',
      value: stats ? `${stats.totalTecnicos} Técnicos` : '6 Cuadrillas',
      sub: 'Personal habilitado para captura',
      trend: 'Activos en Ruta',
      trendColor: 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md',
    },
    {
      label: 'Respaldo Fotográfico',
      value: `${actividadReciente.reduce((acc, cur) => acc + parseInt(cur.fotosPares), 0)} Pares`,
      sub: 'Certificación Antes / Después',
      trend: 'WebP < 250 KB',
      trendColor: 'text-teal-300 bg-teal-500/10 border border-teal-500/30 backdrop-blur-md',
    },
  ];

  const filtrados = actividadReciente.filter(
    (item) => filtroEstado === 'TODOS' || item.estado === filtroEstado
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20">
      {/* HEADER DE CONTROL GERENCIAL (GLASS STYLE) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/5 text-cyan-300 text-[10px] font-mono uppercase px-3 py-1 rounded-full tracking-widest border border-cyan-500/20 backdrop-blur-md font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              Dirección de Operaciones Telecom
            </span>
            <span className="text-xs text-slate-400 font-semibold font-mono">
              SISBIRCECA v3.5 &middot; Panel Glass
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            Estadísticas y Monitoreo de Reportes
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Supervisión ejecutiva del parque de radiobases y acceso instantáneo a expedientes técnicos y fotográficos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/usuarios"
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:border-white/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95 group"
          >
            <span>👥 Administrar Técnicos de Campo</span>
            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* KPI TILES (FROSTED GLASS CONTAINER) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/10 hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                {kpi.label}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mb-1 drop-shadow-sm">
                {kpi.value}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">{kpi.sub}</p>
            </div>
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${kpi.trendColor}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PANEL DE DISTRIBUCIÓN DE INFRAESTRUCTURA Y ESTADO DE ÓRDENES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
        {/* DISTRIBUCIÓN TECNOLÓGICA */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Parque Tecnológico Desplegado
            </h2>
            <span className="text-[11px] font-mono font-medium text-cyan-400">Total: 42 Sitios</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-300">4G / 5G LTE (Dual)</span>
                <span className="font-mono text-white font-semibold">24 Sitios (57%)</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-300">5G Standalone (Nueva Red)</span>
                <span className="font-mono text-emerald-400 font-semibold">10 Sitios (24%)</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-300">Microondas & Enlaces Rurales</span>
                <span className="font-mono text-amber-400 font-semibold">8 Sitios (19%)</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-2 rounded-full" style={{ width: '19%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 text-[11px] text-slate-400">
            Homologación de hardware: <strong className="text-slate-200">Hikvision, DSC, Cisco, Huawei</strong>.
          </div>
        </div>

        {/* ESTADO OPERATIVO DE ÓRDENES */}
        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Estatus Operativo de Intervenciones
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Avance de órdenes técnicas asignadas en campo</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-white/5 text-slate-300 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
              Total: {actividadReciente.length} Órdenes
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-white/[0.03] border border-white/10 p-3.5 rounded-xl backdrop-blur-md">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">1. Pendientes</span>
              <span className="text-2xl font-bold text-slate-200 font-mono">{totalPendientes}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Por visitar</span>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-3.5 rounded-xl backdrop-blur-md">
              <span className="text-[10px] font-semibold text-cyan-300 uppercase block">2. En Progreso</span>
              <span className="text-2xl font-bold text-cyan-400 font-mono">{totalEnProgreso}</span>
              <span className="text-[10px] text-cyan-300/70 font-medium block mt-0.5">Captura en torre</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl backdrop-blur-md">
              <span className="text-[10px] font-semibold text-emerald-300 uppercase block">3. Completados</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">{totalCompletados}</span>
              <span className="text-[10px] text-emerald-300/70 font-medium block mt-0.5">Reportes listos</span>
            </div>
          </div>

          <div className="bg-white/[0.03] p-3 rounded-xl text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 border border-white/10 backdrop-blur-md">
            <span>⚡ Flujo continuo: Los reportes completados por los técnicos están disponibles de inmediato para descarga separada o unificada.</span>
          </div>
        </div>
      </div>

      {/* TABLA DE REPORTES Y ACTIVIDAD RECIENTE (FROSTED GLASS TABLE) */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Registro de Reportes de Radiobases
            </h2>
            <p className="text-xs text-slate-400">
              Historial de levantamientos técnicos con acceso directo a entregables en PDF.
            </p>
          </div>

          {/* FILTROS RÁPIDOS POR ESTADO (GLASS PILLS) */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs backdrop-blur-md">
            {['TODOS', 'COMPLETADO', 'EN_PROGRESO', 'PENDIENTE'].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroEstado(st)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filtroEstado === st
                    ? 'bg-white/20 text-white shadow-inner font-semibold border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.03] text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-white/10 backdrop-blur-md">
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
            <tbody className="divide-y divide-white/5">
              {filtrados.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-3 pl-5">
                    <div className="font-bold text-white text-xs">{item.sitio}</div>
                    <div className="font-mono text-[11px] text-slate-400 font-medium">{item.codigo}</div>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">{item.region}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">{item.tecnico}</div>
                    <div className="text-[10px] text-slate-400">{item.cuadrilla}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-cyan-400 font-medium">{item.tecnologia}</td>
                  <td className="p-3 font-mono text-slate-300 font-semibold">{item.fotosPares}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                        item.estado === 'COMPLETADO'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.estado === 'EN_PROGRESO'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">{item.fecha}</td>
                  <td className="p-3 pr-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/reportes/${item.id}/pdf?vista=FOTOS`}
                        className="text-[11px] font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/25 px-2.5 py-1 rounded-lg border border-blue-500/30 backdrop-blur-md transition-all cursor-pointer"
                        title="Ver solo Álbum Fotográfico"
                      >
                        📸 Fotos
                      </Link>

                      <Link
                        href={`/reportes/${item.id}/pdf?vista=TECNICO`}
                        className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/25 px-2.5 py-1 rounded-lg border border-emerald-500/30 backdrop-blur-md transition-all cursor-pointer"
                        title="Ver solo Ficha Técnica"
                      >
                        📋 Ficha
                      </Link>

                      <Link
                        href={`/reportes/${item.id}/pdf?vista=UNIFICADO`}
                        className="text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs transition-all cursor-pointer"
                        title="Ver Informe Unificado Completo"
                      >
                        📑 Unificado
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
