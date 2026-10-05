'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  History,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  User,
  Search,
  Filter,
  RotateCcw,
  RefreshCw,
  Loader2,
  Lock,
  Hash,
  Kanban,
} from 'lucide-react';
import { solicitarApi } from '@/client/components/campo/api-campo';
import { EstadoReporte, ETIQUETAS_ESTADO, esEstadoReporte } from '@/shared/flujo-reporte';
import type { ReporteListadoApi } from '@/shared/tipos-api';
import type { AuditEvent } from '@/app/api/admin/auditoria/route';

/** Estados que entran en la bandeja de supervisión (de la revisión interna en adelante). */
const ESTADOS_SUPERVISION: readonly EstadoReporte[] = [
  EstadoReporte.REVISION_INTERNA,
  EstadoReporte.OBSERVADO,
  EstadoReporte.ENVIADO_AL_CLIENTE,
  EstadoReporte.VISADO,
  EstadoReporte.HES_SOLICITADA,
  EstadoReporte.FACTURADO,
];

const ESTILO_BADGE_ESTADO: Partial<Record<EstadoReporte, string>> = {
  [EstadoReporte.REVISION_INTERNA]: 'bg-amber-100 text-amber-800 border border-amber-300',
  [EstadoReporte.OBSERVADO]: 'bg-rose-100 text-rose-800 border border-rose-300',
  [EstadoReporte.ENVIADO_AL_CLIENTE]: 'bg-purple-100 text-purple-800 border border-purple-300',
  [EstadoReporte.VISADO]: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  [EstadoReporte.HES_SOLICITADA]: 'bg-blue-100 text-blue-800 border border-blue-300',
  [EstadoReporte.FACTURADO]: 'bg-slate-900 text-white border border-slate-900',
};

const ETIQUETAS_TIPO_EVENTO: Record<string, string> = {
  CAMBIO_ESTADO: 'Cambio de estado',
  SINCRONIZACION_CAMPO: 'Sincronización de campo',
  CAMBIO_MATRIZ: 'Matriz de zonas',
  SUBIDA_FOTO: 'Evidencia fotográfica',
  APROBACION_QA: 'Aprobación QA',
  OBSERVACION_QA: 'Observación QA',
  AUTENTICACION: 'Autenticación',
  POLITICA_CONFIG: 'Configuración',
  ALERTA_SLA: 'Alerta SLA',
  GEOFENCING_FAIL: 'Geocerca',
};

const ESTILO_SEVERIDAD: Record<AuditEvent['severidad'], { punto: string; badge: string; etiqueta: string }> = {
  INFO: {
    punto: 'border-blue-600',
    badge: 'text-blue-700 bg-blue-50 border-blue-200',
    etiqueta: 'Info',
  },
  ADVERTENCIA: {
    punto: 'border-amber-500',
    badge: 'text-amber-700 bg-amber-50 border-amber-200',
    etiqueta: 'Advertencia',
  },
  CRITICO: {
    punto: 'border-rose-600',
    badge: 'text-rose-700 bg-rose-50 border-rose-200',
    etiqueta: 'Crítico',
  },
};

interface ErrorCarga {
  mensaje: string;
  status: number;
}

function etiquetaEstado(valor: string | null): string {
  if (valor === null || valor === '') return '—';
  return esEstadoReporte(valor) ? ETIQUETAS_ESTADO[valor] : valor;
}

function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter((p) => p.length > 0);
  if (partes.length === 0) return '?';
  const primera = partes[0]?.charAt(0) ?? '';
  const segunda = partes.length > 1 ? (partes[partes.length - 1]?.charAt(0) ?? '') : '';
  return `${primera}${segunda}`.toUpperCase();
}

/** Metadatos escalares legibles (se omiten objetos anidados y valores vacíos). */
function metadatosLegibles(metadatos: Record<string, unknown>): Array<[string, string]> {
  const salida: Array<[string, string]> = [];
  for (const [clave, valor] of Object.entries(metadatos)) {
    if (typeof valor === 'string' && valor.trim() !== '') salida.push([clave, valor]);
    else if (typeof valor === 'number' || typeof valor === 'boolean') salida.push([clave, String(valor)]);
  }
  return salida;
}

function BadgeEstado({ estado }: { estado: EstadoReporte }) {
  const estilo = ESTILO_BADGE_ESTADO[estado] ?? 'bg-slate-100 text-slate-700 border border-slate-300';
  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md whitespace-nowrap ${estilo}`}>
      {ETIQUETAS_ESTADO[estado]}
    </span>
  );
}

function PanelError({ error, onReintentar }: { error: ErrorCarga; onReintentar: () => void }) {
  return (
    <div className="p-5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">
            {error.status > 0 ? `Error HTTP ${error.status}` : 'Sin conexión'}
          </div>
          <p className="mt-0.5">{error.mensaje}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReintentar}
        className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Reintentar
      </button>
    </div>
  );
}

export default function SupervisorAuditoriaPage() {
  const [expedientes, setExpedientes] = useState<ReporteListadoApi[]>([]);
  const [cargandoLista, setCargandoLista] = useState<boolean>(true);
  const [errorLista, setErrorLista] = useState<ErrorCarga | null>(null);

  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReporte | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');

  const [eventos, setEventos] = useState<AuditEvent[]>([]);
  const [cargandoEventos, setCargandoEventos] = useState<boolean>(false);
  const [errorEventos, setErrorEventos] = useState<ErrorCarga | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [intentoEventos, setIntentoEventos] = useState<number>(0);

  const cargarExpedientes = useCallback(async () => {
    setCargandoLista(true);
    setErrorLista(null);
    const resultado = await solicitarApi<ReporteListadoApi[]>('/api/reportes');
    if (resultado.ok) {
      const enSupervision = (Array.isArray(resultado.data) ? resultado.data : [])
        .filter((r) => ESTADOS_SUPERVISION.includes(r.estado))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setExpedientes(enSupervision);
    } else {
      setExpedientes([]);
      setErrorLista({ mensaje: resultado.error, status: resultado.status });
    }
    setCargandoLista(false);
  }, []);

  useEffect(() => {
    void cargarExpedientes();
  }, [cargarExpedientes]);

  const expedientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return expedientes.filter((r) => {
      const coincideEstado = filtroEstado === 'TODOS' || r.estado === filtroEstado;
      if (!coincideEstado) return false;
      if (termino === '') return true;
      const campos = [
        r.codigo,
        r.radiobase?.codigo ?? '',
        r.radiobase?.nombre ?? '',
        r.tecnico?.nombre ?? '',
      ];
      return campos.some((c) => c.toLowerCase().includes(termino));
    });
  }, [expedientes, filtroEstado, busqueda]);

  // Mantiene una selección válida dentro del conjunto filtrado.
  useEffect(() => {
    if (expedientesFiltrados.length === 0) {
      if (seleccionadoId !== null) setSeleccionadoId(null);
      return;
    }
    if (!expedientesFiltrados.some((r) => r.id === seleccionadoId)) {
      setSeleccionadoId(expedientesFiltrados[0]?.id ?? null);
    }
  }, [expedientesFiltrados, seleccionadoId]);

  const seleccionado = useMemo(
    () => expedientes.find((r) => r.id === seleccionadoId) ?? null,
    [expedientes, seleccionadoId]
  );

  // Historial real del expediente seleccionado (cadena de auditoría).
  useEffect(() => {
    if (seleccionadoId === null) {
      setEventos([]);
      setErrorEventos(null);
      return;
    }
    let cancelado = false;
    setCargandoEventos(true);
    setErrorEventos(null);
    setFiltroTipo('TODOS');
    void (async () => {
      const resultado = await solicitarApi<AuditEvent[]>(
        `/api/admin/auditoria?reporteId=${encodeURIComponent(seleccionadoId)}&limite=2000`
      );
      if (cancelado) return;
      if (resultado.ok) {
        const ordenados = (Array.isArray(resultado.data) ? resultado.data : []).slice().sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setEventos(ordenados);
      } else {
        setEventos([]);
        setErrorEventos({ mensaje: resultado.error, status: resultado.status });
      }
      setCargandoEventos(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [seleccionadoId, intentoEventos]);

  const tiposDisponibles = useMemo(
    () => Array.from(new Set(eventos.map((e) => e.tipo))).sort(),
    [eventos]
  );

  const eventosFiltrados = useMemo(
    () => (filtroTipo === 'TODOS' ? eventos : eventos.filter((e) => e.tipo === filtroTipo)),
    [eventos, filtroTipo]
  );

  const conteo = useMemo(() => {
    const porEstado = (estados: readonly EstadoReporte[]) =>
      expedientes.filter((r) => estados.includes(r.estado)).length;
    return {
      revision: porEstado([EstadoReporte.REVISION_INTERNA]),
      observados: porEstado([EstadoReporte.OBSERVADO]),
      enviados: porEstado([EstadoReporte.ENVIADO_AL_CLIENTE]),
      cerrados: porEstado([EstadoReporte.VISADO, EstadoReporte.HES_SOLICITADA, EstadoReporte.FACTURADO]),
    };
  }, [expedientes]);

  const metricas: Array<{ titulo: string; valor: number; detalle: string; color: string }> = [
    { titulo: 'Revisión interna', valor: conteo.revision, detalle: 'Pendientes de control de calidad', color: 'text-amber-600' },
    { titulo: 'Observados', valor: conteo.observados, detalle: 'Devueltos para subsanación', color: 'text-rose-600' },
    { titulo: 'Enviados al cliente', valor: conteo.enviados, detalle: 'En espera de visado', color: 'text-purple-600' },
    { titulo: 'Visado / HES / Facturado', valor: conteo.cerrados, detalle: 'Aprobados por el cliente', color: 'text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER DE MANDO DEL SUPERVISOR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Módulo 2: Coordinación y Seguimiento
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Rol Supervisor
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Supervisión y Trazabilidad de Expedientes
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Expedientes desde la revisión interna hasta la facturación, con el historial registrado de{' '}
              <strong>quién</strong> intervino, <strong>cuándo</strong> y <strong>qué transición</strong> ejecutó.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void cargarExpedientes()}
              disabled={cargandoLista}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${cargandoLista ? 'animate-spin' : ''}`} /> Actualizar
            </button>
            <Link
              href="/reportes"
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Pipeline Kanban
            </Link>
            <Link
              href="/admin/expedientes"
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" /> Expedientes PDF
            </Link>
          </div>
        </div>

        {/* MÉTRICAS REALES DEL SUPERVISOR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricas.map((m) => (
            <div key={m.titulo} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.titulo}</div>
              <div className={`text-2xl font-black mt-1 ${m.color}`}>
                {cargandoLista ? '—' : m.valor}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{m.detalle}</div>
            </div>
          ))}
        </div>

        {/* CUERPO PRINCIPAL: SELECTOR DE EXPEDIENTE + TRAZABILIDAD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LISTA LATERAL DE EXPEDIENTES (4 COLS) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" /> Expedientes en Supervisión
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {expedientesFiltrados.length}/{expedientes.length}
              </span>
            </div>

            {/* BUSCADOR + FILTRO DE ESTADO */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Código, radiobase o técnico..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setFiltroEstado(esEstadoReporte(valor) ? valor : 'TODOS');
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="TODOS">Todos los estados</option>
                  {ESTADOS_SUPERVISION.map((estado) => (
                    <option key={estado} value={estado}>
                      {ETIQUETAS_ESTADO[estado]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {cargandoLista ? (
              <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando expedientes...
              </div>
            ) : errorLista ? (
              <PanelError error={errorLista} onReintentar={() => void cargarExpedientes()} />
            ) : expedientesFiltrados.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                {expedientes.length === 0
                  ? 'No hay expedientes en fases de supervisión.'
                  : 'Ningún expediente coincide con la búsqueda o el filtro.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {expedientesFiltrados.map((exp) => {
                  const activo = exp.id === seleccionadoId;
                  return (
                    <button
                      type="button"
                      key={exp.id}
                      onClick={() => setSeleccionadoId(exp.id)}
                      className={`w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all ${
                        activo
                          ? 'bg-blue-50/60 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-900">{exp.codigo}</span>
                          <h4 className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                            {exp.radiobase?.nombre ?? 'Radiobase no disponible'}
                          </h4>
                        </div>
                        <BadgeEstado estado={exp.estado} />
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          {exp.tecnico?.nombre ?? 'Sin técnico'}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                          <Clock className="w-3 h-3" /> {formatearFecha(exp.updatedAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PANEL DETALLADO DE TRAZABILIDAD (8 COLS) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            {!seleccionado ? (
              <div className="p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                {cargandoLista
                  ? 'Cargando expedientes...'
                  : 'Seleccione un expediente para consultar su trazabilidad.'}
              </div>
            ) : (
              <>
                {/* CABECERA DEL EXPEDIENTE SELECCIONADO */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-200 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {seleccionado.codigo}
                      </span>
                      {seleccionado.radiobase && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-600">{seleccionado.radiobase.codigo}</span>
                        </>
                      )}
                      {seleccionado.bloqueadoEdicion && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          <Lock className="w-3 h-3" /> Contenido bloqueado
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mt-1">
                      {seleccionado.radiobase
                        ? `${seleccionado.radiobase.nombre} (${seleccionado.radiobase.region})`
                        : 'Radiobase no disponible'}
                    </h2>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Técnico: <strong>{seleccionado.tecnico?.nombre ?? 'Sin técnico'}</strong></span>
                      <span>Visita: <strong>{formatearFecha(seleccionado.fechaVisita)}</strong></span>
                      <span>Último cambio: <strong>{formatearFecha(seleccionado.updatedAt)}</strong></span>
                      <span>Evidencias: <strong>{seleccionado.totalEvidencias}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <BadgeEstado estado={seleccionado.estado} />
                  </div>
                </div>

                {/* DATOS DE RADICACIÓN REGISTRADOS */}
                {(seleccionado.numeroTicketCliente ||
                  seleccionado.fechaEnvioCliente ||
                  seleccionado.fechaVisado ||
                  seleccionado.numeroHes ||
                  seleccionado.motivoRechazo) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {seleccionado.numeroTicketCliente && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="block text-[10px] font-bold uppercase text-slate-500">Ticket del cliente</span>
                        <span className="font-mono font-semibold text-slate-900">{seleccionado.numeroTicketCliente}</span>
                      </div>
                    )}
                    {seleccionado.fechaEnvioCliente && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="block text-[10px] font-bold uppercase text-slate-500">Enviado al cliente</span>
                        <span className="font-mono font-semibold text-slate-900">{formatearFecha(seleccionado.fechaEnvioCliente)}</span>
                      </div>
                    )}
                    {seleccionado.fechaVisado && (
                      <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                        <span className="block text-[10px] font-bold uppercase text-emerald-700">Visado</span>
                        <span className="font-mono font-semibold text-emerald-900">{formatearFecha(seleccionado.fechaVisado)}</span>
                      </div>
                    )}
                    {seleccionado.numeroHes && (
                      <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                        <span className="block text-[10px] font-bold uppercase text-blue-700">HES</span>
                        <span className="font-mono font-semibold text-blue-900">
                          {seleccionado.numeroHes}
                          {seleccionado.fechaHes ? ` · ${formatearFecha(seleccionado.fechaHes)}` : ''}
                        </span>
                      </div>
                    )}
                    {seleccionado.motivoRechazo && (
                      <div className="sm:col-span-2 p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-[10px] font-bold uppercase text-rose-700">Motivo de observación</span>
                          <span className="text-rose-900">{seleccionado.motivoRechazo}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* FILTRO DEL HISTORIAL */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-600" />
                    Línea de tiempo de trazabilidad ({eventosFiltrados.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      disabled={tiposDisponibles.length === 0}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="TODOS">Todos los eventos</option>
                      {tiposDisponibles.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {ETIQUETAS_TIPO_EVENTO[tipo] ?? tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CRONOLOGÍA REAL DEL EXPEDIENTE */}
                <div className="space-y-4">
                  {cargandoEventos ? (
                    <div className="p-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" /> Cargando historial...
                    </div>
                  ) : errorEventos ? (
                    <PanelError error={errorEventos} onReintentar={() => setIntentoEventos((n) => n + 1)} />
                  ) : eventos.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                      Este expediente no tiene eventos registrados en la bitácora de auditoría.
                    </div>
                  ) : eventosFiltrados.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                      No hay eventos del tipo seleccionado.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {eventosFiltrados.map((ev) => {
                        const severidad = ESTILO_SEVERIDAD[ev.severidad] ?? ESTILO_SEVERIDAD.INFO;
                        const hayTransicion = ev.estadoAnterior !== null || ev.estadoNuevo !== null;
                        const extras = metadatosLegibles(ev.metadatos ?? {});
                        return (
                          <div
                            key={ev.id}
                            className="relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors"
                          >
                            <span
                              className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-white border-2 ${severidad.punto}`}
                            ></span>

                            {/* ACTOR + FECHA */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                                  {iniciales(ev.actor.nombre)}
                                </span>
                                <div>
                                  <span className="text-xs font-bold text-slate-900">{ev.actor.nombre}</span>
                                  <span className="text-[10px] text-slate-400 ml-1.5 font-medium uppercase">
                                    ({ev.actor.rol})
                                  </span>
                                  {ev.actor.email && (
                                    <span className="block text-[10px] text-slate-400 font-mono">{ev.actor.email}</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                                  {ETIQUETAS_TIPO_EVENTO[ev.tipo] ?? ev.tipo}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${severidad.badge}`}>
                                  {severidad.etiqueta}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {formatearFecha(ev.timestamp)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              {hayTransicion && (
                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                                  <span className="px-2 py-1 rounded-lg bg-red-50/70 border border-red-200 text-red-900">
                                    {etiquetaEstado(ev.estadoAnterior)}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="px-2 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900 font-semibold">
                                    {etiquetaEstado(ev.estadoNuevo)}
                                  </span>
                                </div>
                              )}

                              <p className="text-xs text-slate-700">{ev.descripcion}</p>

                              {extras.length > 0 && (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                  {extras.map(([clave, valor]) => (
                                    <div key={clave} className="flex gap-1.5 min-w-0">
                                      <dt className="font-semibold text-slate-500 whitespace-nowrap">{clave}:</dt>
                                      <dd className="text-slate-700 break-words min-w-0">{valor}</dd>
                                    </div>
                                  ))}
                                </dl>
                              )}

                              {ev.hashActual && (
                                <div
                                  className="text-[10px] font-mono text-slate-400 flex items-center gap-1"
                                  title={ev.hashActual}
                                >
                                  <Hash className="w-3 h-3" /> {ev.hashActual.slice(0, 16)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ACCIONES: REVISIÓN DEL DOCUMENTO Y CAMBIO DE FASE EN EL PIPELINE */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                  <div className="text-xs text-blue-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Revisión y cambio de fase
                    </span>
                    <p className="text-[11px] text-blue-700/80 mt-0.5">
                      Revise el documento unificado y ejecute la transición de estado desde el Pipeline.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/reportes/${seleccionado.id}/pdf?vista=UNIFICADO`}
                      className="px-4 py-2 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4" /> Ver documento unificado
                    </Link>
                    <Link
                      href="/reportes"
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2 whitespace-nowrap"
                    >
                      <Kanban className="w-4 h-4" /> Mover de fase en el Pipeline
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
