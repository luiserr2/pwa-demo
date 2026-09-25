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
      trendColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    },
    {
      label: 'Reportes Levantados',
      value: `${actividadReciente.length} Expedientes`,
      sub: `${totalCompletados} completados en campo`,
      trend: `${Math.round((totalCompletados / (actividadReciente.length || 1)) * 100)}% Completitud`,
      trendColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    },
    {
      label: 'Técnicos de Campo',
      value: stats ? `${stats.totalTecnicos} Técnicos` : '6 Cuadrillas',
      sub: 'Personal habilitado para captura',
      trend: 'Activos en Ruta',
      trendColor: 'text-slate-700 bg-slate-100 border border-slate-200',
    },
    {
      label: 'Eficiencia de Captura',
      value: '28 min',
      sub: 'Tiempo promedio por torre',
      trend: 'WebP Comprimido',
      trendColor: 'text-blue-700 bg-blue-50 border border-blue-200',
    },
  ];

  const filtrados = actividadReciente.filter(
    (item) => filtroEstado === 'TODOS' || item.estado === filtroEstado
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 w-full pb-20">
      {/* HEADER DE CONTROL GERENCIAL (B2B HIGH-DENSITY) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-slate-900 text-white text-[10px] font-mono uppercase px-2.5 py-0.5 rounded tracking-wider border border-slate-700 font-semibold">
              Dirección de Operaciones Telecom
            </span>
            <span className="text-xs text-slate-500 font-semibold font-mono">
              SISBIRCECA v1.2.0 &middot; Monitoreo en Vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Estadísticas y Monitoreo de Reportes
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Supervisión del levantamiento técnico de radiobases y acceso a expedientes en PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/usuarios"
            className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <span>👥 Administrar Técnicos de Campo</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* KPI TILES (DENSIFICADAS CON CONTEXTO REAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {kpi.label}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight mb-1">
                {kpi.value}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">{kpi.sub}</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${kpi.trendColor}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PANEL DE DISTRIBUCIÓN DE INFRAESTRUCTURA Y ESTADO DE ÓRDENES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-7">
        {/* DISTRIBUCIÓN TECNOLÓGICA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Parque Tecnológico Desplegado
            </h2>
            <span className="text-[11px] font-mono font-medium text-slate-400">Total: 42 Sitios</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-700">4G / 5G LTE (Dual)</span>
                <span className="font-mono text-slate-900 font-semibold">24 Sitios (57%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-800 h-2 rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-700">5G Standalone (Nueva Red)</span>
                <span className="font-mono text-emerald-700 font-semibold">10 Sitios (24%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-700">Microondas & Enlaces Rurales</span>
                <span className="font-mono text-amber-700 font-semibold">8 Sitios (19%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '19%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Homologación de hardware: <strong>Hikvision, DSC, Cisco, Huawei</strong>.
          </div>
        </div>

        {/* ESTADO OPERATIVO DE ÓRDENES */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Estatus Operativo de Intervenciones
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Avance de órdenes técnicas asignadas en campo</p>
            </div>
            <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
              Total: {actividadReciente.length} Órdenes
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">1. Pendientes</span>
              <span className="text-2xl font-bold text-slate-800 font-mono">{totalPendientes}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Por visitar</span>
            </div>
            <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-xl">
              <span className="text-[10px] font-semibold text-blue-800 uppercase block">2. En Progreso</span>
              <span className="text-2xl font-bold text-blue-700 font-mono">{totalEnProgreso}</span>
              <span className="text-[10px] text-blue-700 font-medium block mt-0.5">Captura en torre</span>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-xl">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase block">3. Completados</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono">{totalCompletados}</span>
              <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Reportes listos</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 border border-slate-200">
            <span>Flujo directo: Los reportes completados por los técnicos están listos de inmediato para consulta o descarga.</span>
          </div>
        </div>
      </div>

      {/* TABLA DE REPORTES Y ACTIVIDAD RECIENTE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Registro de Reportes de Radiobases
            </h2>
            <p className="text-xs text-slate-500">
              Historial de levantamientos técnicos con acceso directo al documento PDF.
            </p>
          </div>

          {/* FILTROS RÁPIDOS POR ESTADO */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['TODOS', 'COMPLETADO', 'EN_PROGRESO', 'PENDIENTE'].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroEstado(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filtroEstado === st
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
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
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 pl-5">Código / Sitio</th>
                <th className="p-3">Región / Celda</th>
                <th className="p-3">Técnico & Cuadrilla</th>
                <th className="p-3">Tecnología</th>
                <th className="p-3">Fotos</th>
                <th className="p-3">Estatus</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 pr-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 pl-5">
                    <div className="font-bold text-slate-900 text-xs">{item.sitio}</div>
                    <div className="font-mono text-[11px] text-slate-500 font-medium">{item.codigo}</div>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{item.region}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{item.tecnico}</div>
                    <div className="text-[10px] text-slate-500">{item.cuadrilla}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600 font-medium">{item.tecnologia}</td>
                  <td className="p-3 font-mono text-slate-700 font-semibold">{item.fotosPares}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        item.estado === 'COMPLETADO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.estado === 'EN_PROGRESO'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{item.fecha}</td>
                  <td className="p-3 pr-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/reportes/${item.id}/pdf?vista=FOTOS`}
                        className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200 transition-colors"
                        title="Ver solo Álbum Fotográfico"
                      >
                        📸 Fotos
                      </Link>

                      <Link
                        href={`/reportes/${item.id}/pdf?vista=TECNICO`}
                        className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 transition-colors"
                        title="Ver solo Ficha Técnica"
                      >
                        📋 Ficha
                      </Link>

                      <Link
                        href={`/reportes/${item.id}/pdf?vista=UNIFICADO`}
                        className="text-[11px] font-bold text-white bg-slate-900 hover:bg-black px-2.5 py-1 rounded-md transition-colors shadow-2xs"
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
