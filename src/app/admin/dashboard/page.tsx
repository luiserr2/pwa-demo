'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  GitBranch,
  RefreshCw,
  ShieldAlert,
  Signal,
  TrendingUp,
  Users,
  XOctagon,
} from 'lucide-react';
import type { RespuestaApi, StatsApi } from '@/shared/tipos-api';
import { EstadoReporte, ETIQUETAS_ESTADO, FASES_PIPELINE } from '@/shared/flujo-reporte';
import { EstadoZona } from '@/shared/catalogo-zonas';
import { TarjetaKpi } from '@/client/components/dashboard/TarjetaKpi';
import { PanelGrafico } from '@/client/components/dashboard/PanelGrafico';

const LOCALE = 'es-VE';

const ESTILO_TOOLTIP: React.CSSProperties = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
  fontSize: '12px',
};

/** Progresión cromática de las 8 fases del pipeline (inicio → cierre). */
const COLORES_PIPELINE = ['#94a3b8', '#64748b', '#f59e0b', '#3b82f6', '#6366f1', '#10b981', '#059669', '#0f172a'];

const PALETA_TECNOLOGIA = ['#0f172a', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#64748b'];

const VALIDACION_META: ReadonlyArray<{ clave: keyof StatsApi['evidenciasPorValidacion']; etiqueta: string; color: string }> = [
  { clave: 'APROBADO', etiqueta: 'Aprobadas', color: '#10b981' },
  { clave: 'RECHAZADO', etiqueta: 'Rechazadas', color: '#f43f5e' },
  { clave: 'PENDIENTE', etiqueta: 'Pendientes', color: '#94a3b8' },
];

const ESTADOS_CIERRE: readonly EstadoReporte[] = [
  EstadoReporte.VISADO,
  EstadoReporte.HES_SOLICITADA,
  EstadoReporte.FACTURADO,
];

const ESTADOS_CONTROL: readonly EstadoReporte[] = Object.values(EstadoReporte).filter(
  (estado) => !FASES_PIPELINE.includes(estado)
);

function entero(valor: number): string {
  return valor.toLocaleString(LOCALE);
}

function formatearMarcaTiempo(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

async function leerRespuesta(res: Response): Promise<RespuestaApi<StatsApi> | null> {
  try {
    const cuerpo: unknown = await res.json();
    if (typeof cuerpo === 'object' && cuerpo !== null && 'ok' in cuerpo) {
      return cuerpo as RespuestaApi<StatsApi>;
    }
    return null;
  } catch {
    return null;
  }
}

function mensajePorStatus(status: number, errorServidor: string | undefined): string {
  if (errorServidor) return errorServidor;
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (status === 403) return 'Tu rol no tiene acceso a las estadísticas operativas.';
  if (status === 503) return 'La base de datos no está disponible en este momento.';
  return `El servidor respondió HTTP ${status}.`;
}

export default function AdminDashboardPage() {
  const [datos, setDatos] = useState<StatsApi | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controladorRef = useRef<AbortController | null>(null);

  const cargar = useCallback(async () => {
    controladorRef.current?.abort();
    const controlador = new AbortController();
    controladorRef.current = controlador;
    setCargando(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/stats', {
        signal: controlador.signal,
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const cuerpo = await leerRespuesta(res);
      if (controlador.signal.aborted) return;
      if (res.ok && cuerpo?.ok && cuerpo.data) {
        setDatos(cuerpo.data);
      } else {
        setError(mensajePorStatus(res.status, cuerpo?.error));
      }
    } catch (e: unknown) {
      if (controlador.signal.aborted) return;
      setError(e instanceof Error ? `Sin conexión con el servidor: ${e.message}` : 'Sin conexión con el servidor.');
    } finally {
      if (!controlador.signal.aborted) setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
    return () => controladorRef.current?.abort();
  }, [cargar]);

  if (!datos) {
    return (
      <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
        {error && !cargando ? (
          <div role="alert" className="max-w-lg mx-auto mt-16 bg-white border border-rose-200 rounded-3xl p-8 text-center shadow-sm">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-3" aria-hidden="true" />
            <h1 className="text-lg font-black text-slate-900 mb-1">No se pudieron cargar las estadísticas</h1>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => void cargar()}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Cargando estadísticas">
            <div className="h-10 w-72 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl border border-slate-200/80" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-slate-100 rounded-3xl" />
              <div className="h-96 bg-slate-100 rounded-3xl" />
            </div>
          </div>
        )}
      </div>
    );
  }

  const cerrados = ESTADOS_CIERRE.reduce((acc, estado) => acc + datos.reportesPorEstado[estado], 0);
  const val = datos.evidenciasPorValidacion;
  const evaluadas = val.APROBADO + val.RECHAZADO;
  const totalZonas =
    datos.zonasPorEstado[EstadoZona.NORMAL] + datos.zonasPorEstado[EstadoZona.ALARMA] + datos.zonasPorEstado[EstadoZona.FALLA];

  const totalPipeline = datos.pipeline.reduce((acc, fase) => acc + fase.cantidad, 0);
  const totalRegion = datos.reportesPorRegion.reduce((acc, r) => acc + r.total, 0);
  const totalActividad = datos.actividadMensual.reduce((acc, m) => acc + m.creados + m.visados, 0);
  const totalTecnologia = datos.reportesPorTecnologia.reduce((acc, t) => acc + t.cantidad, 0);
  const serieValidacion = VALIDACION_META.map((meta) => ({ ...meta, cantidad: val[meta.clave] }));
  const serieValidacionPie = serieValidacion.filter((s) => s.cantidad > 0);

  const horas = datos.horasPromedioHastaVisado;
  const valorHoras = horas === null ? '—' : `${horas.toLocaleString(LOCALE, { maximumFractionDigits: 1 })} h`;
  const detalleHoras =
    horas === null
      ? 'Sin expedientes visados'
      : horas >= 24
      ? `≈ ${(horas / 24).toLocaleString(LOCALE, { maximumFractionDigits: 1 })} días desde la visita`
      : 'Desde la visita al visado';

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* HEADER EJECUTIVO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Control NOC</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Indicadores operativos de expedientes, evidencias y matriz de zonas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">Actualizado: {formatearMarcaTiempo(datos.generadoEn)}</span>
          <button
            type="button"
            onClick={() => void cargar()}
            disabled={cargando}
            className="inline-flex items-center gap-2 bg-white text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} aria-hidden="true" />
            {cargando ? 'Actualizando…' : 'Refrescar'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs">
          <span>
            <strong className="font-bold">No se pudo refrescar:</strong> {error} Se muestran los datos de la última carga.
          </span>
          <button
            type="button"
            onClick={() => void cargar()}
            className="font-bold underline underline-offset-2 hover:text-rose-900 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaKpi
          titulo="Expedientes"
          valor={entero(datos.totalReportes)}
          icono={FileText}
          tono="slate"
          detalle={`${entero(cerrados)} visados o posteriores`}
        />
        <TarjetaKpi titulo="Radiobases" valor={entero(datos.totalRadiobases)} icono={Signal} tono="blue" detalle="Registradas en catálogo" />
        <TarjetaKpi titulo="Técnicos" valor={entero(datos.totalTecnicos)} icono={Users} tono="indigo" detalle="Activos" />
        <TarjetaKpi
          titulo="Evidencias"
          valor={entero(datos.totalEvidencias)}
          icono={Camera}
          tono="blue"
          detalle={`${entero(val.PENDIENTE)} pendientes de validación`}
        />
        <TarjetaKpi
          titulo="Aprobación visual"
          valor={datos.tasaAprobacionVisual === null ? 'Sin evaluaciones' : `${datos.tasaAprobacionVisual.toFixed(1)}%`}
          icono={CheckCircle2}
          tono="emerald"
          detalle={evaluadas > 0 ? `${entero(val.APROBADO)} de ${entero(evaluadas)} evaluadas` : undefined}
        />
        <TarjetaKpi titulo="Promedio a visado" valor={valorHoras} icono={Clock} tono="indigo" detalle={detalleHoras} />
        <TarjetaKpi
          titulo="Zonas en alarma"
          valor={entero(datos.zonasPorEstado[EstadoZona.ALARMA])}
          icono={AlertTriangle}
          tono="amber"
          detalle={`De ${entero(totalZonas)} zonas registradas`}
        />
        <TarjetaKpi
          titulo="Zonas en falla"
          valor={entero(datos.zonasPorEstado[EstadoZona.FALLA])}
          icono={XOctagon}
          tono="rose"
          detalle={`De ${entero(totalZonas)} zonas registradas`}
        />
      </div>

      {/* PIPELINE + REGIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PanelGrafico
          titulo="Pipeline Operativo (8 fases)"
          subtitulo={`${entero(totalPipeline)} expedientes en flujo`}
          icono={<GitBranch className="w-4 h-4 text-slate-900" aria-hidden="true" />}
          vacio={totalPipeline === 0}
          mensajeVacio="No hay expedientes en las fases del pipeline."
          alturaClase="h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos.pipeline} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="etiqueta" type="category" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} width={130} />
              <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={ESTILO_TOOLTIP} />
              <Bar dataKey="cantidad" name="Expedientes" radius={[0, 4, 4, 0]} barSize={14}>
                {datos.pipeline.map((fase, i) => (
                  <Cell key={fase.estado} fill={COLORES_PIPELINE[i % COLORES_PIPELINE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PanelGrafico>

        <PanelGrafico
          titulo="Expedientes por Región"
          subtitulo="Total vs visados o posteriores"
          icono={<Cpu className="w-4 h-4 text-blue-600" aria-hidden="true" />}
          vacio={datos.reportesPorRegion.length === 0 || totalRegion === 0}
          mensajeVacio="No hay expedientes asociados a radiobases con región."
          alturaClase="h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos.reportesPorRegion} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="region" type="category" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} width={110} />
              <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={ESTILO_TOOLTIP} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="total" name="Total" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="visados" name="Visados" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </PanelGrafico>
      </div>

      {/* ACTIVIDAD MENSUAL + VALIDACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PanelGrafico
          className="lg:col-span-2"
          titulo="Actividad Mensual"
          subtitulo={`Expedientes creados vs visados · últimos ${datos.actividadMensual.length} meses`}
          icono={<TrendingUp className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
          vacio={datos.actividadMensual.length === 0 || totalActividad === 0}
          mensajeVacio="Sin expedientes creados ni visados en el periodo."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datos.actividadMensual} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="gradCreados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradVisados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="etiqueta" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={ESTILO_TOOLTIP} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="creados" name="Creados" stroke="#0f172a" strokeWidth={3} fill="url(#gradCreados)" />
              <Area type="monotone" dataKey="visados" name="Visados" stroke="#10b981" strokeWidth={3} fill="url(#gradVisados)" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelGrafico>

        <PanelGrafico
          titulo="Validación de Evidencias"
          subtitulo={`${entero(datos.totalEvidencias)} fotografías`}
          icono={<Camera className="w-4 h-4 text-emerald-600" aria-hidden="true" />}
          vacio={datos.totalEvidencias === 0}
          mensajeVacio="Aún no se han cargado evidencias fotográficas."
          alturaClase="h-auto"
        >
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serieValidacionPie} dataKey="cantidad" nameKey="etiqueta" innerRadius={55} outerRadius={78} paddingAngle={4} stroke="none">
                  {serieValidacionPie.map((s) => (
                    <Cell key={s.clave} fill={s.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={ESTILO_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900">{datos.tasaAprobacionPorcentaje}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Aprobación</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {serieValidacion.map((s) => (
              <div key={s.clave} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[11px] font-semibold text-slate-700">{s.etiqueta}</span>
                <span className="text-[11px] font-mono text-slate-500 ml-auto">{entero(s.cantidad)}</span>
              </div>
            ))}
          </div>
        </PanelGrafico>
      </div>

      {/* TECNOLOGÍA + ESTADOS DE CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PanelGrafico
          titulo="Expedientes por Tecnología"
          subtitulo="Según la radiobase intervenida"
          vacio={datos.reportesPorTecnologia.length === 0 || totalTecnologia === 0}
          mensajeVacio="No hay expedientes asociados a radiobases."
          alturaClase="h-auto"
        >
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos.reportesPorTecnologia}
                  dataKey="cantidad"
                  nameKey="tecnologia"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  stroke="none"
                >
                  {datos.reportesPorTecnologia.map((t, i) => (
                    <Cell key={t.tecnologia} fill={PALETA_TECNOLOGIA[i % PALETA_TECNOLOGIA.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={ESTILO_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{entero(totalTecnologia)}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Expedientes</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {datos.reportesPorTecnologia.map((t, i) => (
              <div key={t.tecnologia} className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PALETA_TECNOLOGIA[i % PALETA_TECNOLOGIA.length] }}
                />
                <span className="text-[11px] font-semibold text-slate-700 truncate">{t.tecnologia}</span>
                <span className="text-[11px] text-slate-400 ml-auto">
                  {((t.cantidad / totalTecnologia) * 100).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}%
                </span>
              </div>
            ))}
          </div>
        </PanelGrafico>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Distribución por Estado</h2>
              <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                Fases del pipeline y estados de control
              </p>
            </div>
            <Link
              href="/admin/expedientes"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver Expedientes
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Expedientes</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Participación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...FASES_PIPELINE, ...ESTADOS_CONTROL].map((estado) => {
                  const cantidad = datos.reportesPorEstado[estado];
                  const esControl = ESTADOS_CONTROL.includes(estado);
                  const participacion =
                    datos.totalReportes > 0
                      ? `${((cantidad / datos.totalReportes) * 100).toLocaleString(LOCALE, { maximumFractionDigits: 1 })}%`
                      : '—';
                  return (
                    <tr key={estado} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 text-xs font-bold text-slate-900">{ETIQUETAS_ESTADO[estado]}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                            esControl
                              ? estado === EstadoReporte.OBSERVADO
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}
                        >
                          {esControl ? 'Control' : 'Pipeline'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-xs font-mono font-bold text-slate-700">{entero(cantidad)}</td>
                      <td className="py-2.5 text-right text-xs font-mono text-slate-500">{participacion}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
