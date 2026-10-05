'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CloudOff,
  FileText,
  Loader2,
  LogOut,
  MapPin,
  PlayCircle,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/client/context/AuthContext';
import { useOnlineStatus } from '@/client/hooks/useOnlineStatus';
import { esUuidValido, solicitarApi } from '@/client/components/campo/api-campo';
import { contarPendientesGlobales, type PendientesLocales } from '@/client/components/campo/persistencia-campo';
import { ETIQUETAS_ESTADO, EstadoReporte } from '@/shared/flujo-reporte';
import type { RadiobaseApi, ReporteListadoApi } from '@/shared/tipos-api';

const ESTADOS_CAPTURA_ABIERTA: readonly EstadoReporte[] = [
  EstadoReporte.SIN_EMPEZAR,
  EstadoReporte.EN_VISITA,
  EstadoReporte.ELABORANDO_INFORME,
  EstadoReporte.OBSERVADO,
];

const ESTADOS_CERRADOS: readonly EstadoReporte[] = [
  EstadoReporte.VISADO,
  EstadoReporte.HES_SOLICITADA,
  EstadoReporte.FACTURADO,
  EstadoReporte.APROBADO,
];

type CargaReportes =
  | { fase: 'esperando-sesion' }
  | { fase: 'cargando' }
  | { fase: 'ok'; reportes: ReporteListadoApi[] }
  | { fase: 'error'; mensaje: string };

type CargaRadiobases =
  | { fase: 'cargando' }
  | { fase: 'ok'; radiobases: RadiobaseApi[]; resiliente: boolean }
  | { fase: 'error'; mensaje: string };

function construirUrlCaptura(params: { reporteId: string; codigo: string; nombre: string; mode?: 'FOTOS' | 'ZONAS' }): string {
  const qs = new URLSearchParams({ reporteId: params.reporteId, site: params.codigo, sitio: params.nombre });
  if (params.mode) qs.set('mode', params.mode);
  return `/captura?${qs.toString()}`;
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Fecha no registrada';
  return fecha.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function iniciales(nombre: string): string {
  const partes = nombre
    .replace(/^(Ing\.|Lic\.|Téc\.|Tec\.)\s*/i, '')
    .split(/\s+/)
    .filter(Boolean);
  return partes
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

function estiloEstado(estado: EstadoReporte): string {
  if (estado === EstadoReporte.OBSERVADO) return 'bg-red-50 text-red-700 border-red-200';
  if (ESTADOS_CAPTURA_ABIERTA.includes(estado)) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (ESTADOS_CERRADOS.includes(estado)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
}

function mensajeErrorCarga(status: number, error: string): string {
  return status === 503 ? 'Base de datos no disponible. Intente de nuevo en unos minutos.' : error;
}

interface TarjetaAccionProps {
  href: string | null;
  children: React.ReactNode;
  sombra: string;
}

/** Tarjeta hero: Link real si hay radiobase elegida; bloque deshabilitado si no. */
function TarjetaAccion({ href, children, sombra }: TarjetaAccionProps) {
  const base = 'group relative overflow-hidden bg-white p-1.5 rounded-[2rem] shadow-sm transition-all duration-300';
  if (!href) {
    return (
      <div aria-disabled="true" className={`${base} opacity-60 cursor-not-allowed`} title="Elija primero una radiobase">
        {children}
      </div>
    );
  }
  return (
    <Link href={href} className={`${base} hover:shadow-xl ${sombra} active:scale-[0.98]`}>
      {children}
    </Link>
  );
}

export default function CampoPortalPage() {
  const { user, logout } = useAuth();
  const enLinea = useOnlineStatus();

  const [mounted, setMounted] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [reporteNuevoId, setReporteNuevoId] = useState('');
  const [radiobaseId, setRadiobaseId] = useState('');
  const [cargaRadiobases, setCargaRadiobases] = useState<CargaRadiobases>({ fase: 'cargando' });
  const [cargaReportes, setCargaReportes] = useState<CargaReportes>({ fase: 'esperando-sesion' });
  const [pendientes, setPendientes] = useState<PendientesLocales | null>(null);
  const [errorDexie, setErrorDexie] = useState<string | null>(null);

  const tecnicoId = user && esUuidValido(user.id) ? user.id : null;

  const cargarPendientes = useCallback(async () => {
    try {
      setPendientes(await contarPendientesGlobales());
      setErrorDexie(null);
    } catch (e) {
      setErrorDexie(e instanceof Error ? e.message : 'Almacenamiento local no disponible.');
    }
  }, []);

  const cargarRadiobases = useCallback(async () => {
    setCargaRadiobases({ fase: 'cargando' });
    const res = await solicitarApi<RadiobaseApi[]>('/api/radiobases');
    if (res.ok) {
      const ordenadas = [...res.data].sort((a, b) => a.codigo.localeCompare(b.codigo));
      setCargaRadiobases({ fase: 'ok', radiobases: ordenadas, resiliente: res.resiliente });
    } else {
      setCargaRadiobases({ fase: 'error', mensaje: mensajeErrorCarga(res.status, res.error) });
    }
  }, []);

  const cargarReportes = useCallback(async (idTecnico: string) => {
    setCargaReportes({ fase: 'cargando' });
    const res = await solicitarApi<ReporteListadoApi[]>(`/api/reportes?tecnicoId=${encodeURIComponent(idTecnico)}`);
    if (res.ok) {
      const ordenados = [...res.data].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      setCargaReportes({ fase: 'ok', reportes: ordenados });
    } else {
      setCargaReportes({ fase: 'error', mensaje: mensajeErrorCarga(res.status, res.error) });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setReporteNuevoId(uuidv4());
    void cargarPendientes();
    void cargarRadiobases();
  }, [cargarPendientes, cargarRadiobases]);

  // El listado solo se pide cuando AuthContext resolvió el UUID real del técnico.
  useEffect(() => {
    if (tecnicoId) {
      void cargarReportes(tecnicoId);
    } else {
      setCargaReportes({ fase: 'esperando-sesion' });
    }
  }, [tecnicoId, cargarReportes]);

  // Al recuperar señal, refrescar el contador de pendientes locales.
  useEffect(() => {
    if (!mounted || !enLinea) return;
    void cargarPendientes();
  }, [enLinea, mounted, cargarPendientes]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const radiobaseElegida = useMemo(
    () => (cargaRadiobases.fase === 'ok' ? cargaRadiobases.radiobases.find((r) => r.id === radiobaseId) ?? null : null),
    [cargaRadiobases, radiobaseId]
  );

  const urlFotos =
    radiobaseElegida && reporteNuevoId
      ? construirUrlCaptura({ reporteId: reporteNuevoId, codigo: radiobaseElegida.codigo, nombre: radiobaseElegida.nombre, mode: 'FOTOS' })
      : null;
  const urlZonas =
    radiobaseElegida && reporteNuevoId
      ? construirUrlCaptura({ reporteId: reporteNuevoId, codigo: radiobaseElegida.codigo, nombre: radiobaseElegida.nombre, mode: 'ZONAS' })
      : null;

  const reportes = cargaReportes.fase === 'ok' ? cargaReportes.reportes : [];
  const termino = busqueda.trim().toLowerCase();
  const filtrados = termino
    ? reportes.filter(
        (r) =>
          r.codigo.toLowerCase().includes(termino) ||
          (r.radiobase?.nombre.toLowerCase().includes(termino) ?? false) ||
          (r.radiobase?.codigo.toLowerCase().includes(termino) ?? false)
      )
    : reportes;

  const totalPendientes = (pendientes?.evidencias ?? 0) + (pendientes?.zonas ?? 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-slate-50 selection:bg-blue-600 selection:text-white pb-32 font-sans overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Shield className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-bold text-slate-900 tracking-tight leading-none">Reportes Radiobases</h1>
                <span
                  role="status"
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    enLinea
                      ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50'
                      : 'bg-amber-100/80 text-amber-800 border-amber-200/50'
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${enLinea ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {enLinea ? 'En línea' : 'Sin señal'}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1">Plataforma Operativa de Campo</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3 bg-slate-100/50 border border-slate-200 py-1.5 pl-1.5 pr-4 rounded-full">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-blue-600">
                  <span className="text-[10px] font-bold tracking-tighter">{iniciales(user.nombre)}</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">{user.nombre}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleLogout()}
              aria-label="Cerrar sesión"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-all shadow-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* PENDIENTES EN EL DISPOSITIVO */}
        {errorDexie && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <span>No se pudo leer el almacenamiento local del dispositivo: {errorDexie}</span>
          </div>
        )}
        {pendientes && totalPendientes > 0 && (
          <div role="status" className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-sm flex items-start gap-3">
            <CloudOff className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">
                {pendientes.evidencias} foto(s) y {pendientes.zonas} zona(s) guardadas en este dispositivo sin sincronizar
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Afectan a {pendientes.reportes.size} expediente(s). Abra cada uno con &quot;Continuar captura&quot; y pulse Sincronizar
                cuando tenga señal.
              </p>
            </div>
          </div>
        )}
        {pendientes && pendientes.huerfanas > 0 && (
          <p className="text-xs text-slate-500 -mt-6">
            {pendientes.huerfanas} captura(s) antiguas sin expediente asignado permanecen en el dispositivo y no son sincronizables.
          </p>
        )}

        {/* NUEVA CAPTURA */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <label htmlFor="radiobase-nueva" className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Nueva captura: elija la radiobase
            </label>

            {cargaRadiobases.fase === 'cargando' && (
              <p className="text-xs text-slate-500 flex items-center gap-2 min-h-[48px]">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando inventario de radiobases...
              </p>
            )}

            {cargaRadiobases.fase === 'error' && (
              <div className="flex flex-wrap items-center gap-3 min-h-[48px]">
                <p className="text-xs text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> {cargaRadiobases.mensaje}
                </p>
                <button
                  type="button"
                  onClick={() => void cargarRadiobases()}
                  className="min-h-[44px] px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reintentar
                </button>
              </div>
            )}

            {cargaRadiobases.fase === 'ok' && (
              <>
                {cargaRadiobases.radiobases.length === 0 ? (
                  <p className="text-xs text-slate-500 min-h-[48px] flex items-center">
                    No hay radiobases registradas en el inventario. Solicite a un administrador que las registre.
                  </p>
                ) : (
                  <select
                    id="radiobase-nueva"
                    value={radiobaseId}
                    onChange={(e) => setRadiobaseId(e.target.value)}
                    className="w-full min-h-[48px] px-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Seleccione una radiobase...</option>
                    {cargaRadiobases.radiobases.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.codigo} · {r.nombre}
                        {r.region ? ` (${r.region})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {cargaRadiobases.resiliente && (
                  <p className="text-[11px] text-amber-700 mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Base de datos no disponible: se muestra el catálogo de respaldo. La sincronización fallará hasta que se
                    restablezca.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Acción 1: Fotos */}
            <TarjetaAccion href={urlFotos} sombra="hover:shadow-blue-900/5">
              <div className="relative h-full bg-slate-900 rounded-[1.65rem] p-6 sm:p-8 overflow-hidden flex flex-col md:justify-center">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-blue-100 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-inner shadow-white/10">
                    <Camera className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/20 group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-3">
                    <Camera className="w-3 h-3" /> Evidencia fotográfica
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight mb-2">
                    1. Tomar Fotos (Antes/Después)
                  </h2>
                  <p className="text-sm text-blue-200/80 font-medium leading-relaxed max-w-sm">
                    {radiobaseElegida
                      ? `${radiobaseElegida.codigo} · ${radiobaseElegida.nombre}`
                      : '6 equipos con foto Antes y Después, guardadas sin señal.'}
                  </p>
                </div>
              </div>
            </TarjetaAccion>

            {/* Acción 2: Matriz técnica (misma captura, pestaña ZONAS) */}
            <TarjetaAccion href={urlZonas} sombra="hover:shadow-emerald-900/5">
              <div className="relative h-full bg-[#064E3B] rounded-[1.65rem] p-6 sm:p-8 overflow-hidden flex flex-col md:justify-center">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-teal-500/20 blur-3xl rounded-full pointer-events-none" />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-emerald-100 group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-inner shadow-white/10">
                    <ClipboardCheck className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/20 group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-3">
                    <ClipboardCheck className="w-3 h-3" /> Matriz 48 zonas
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight mb-2">
                    2. Llenar Formulario Técnico
                  </h2>
                  <p className="text-sm text-emerald-200/80 font-medium leading-relaxed max-w-sm">
                    Estado Normal / Alarma / Falla por zona, con observación obligatoria en novedades.
                  </p>
                </div>
              </div>
            </TarjetaAccion>
          </div>
        </section>

        {/* MIS EXPEDIENTES */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Mis Expedientes{cargaReportes.fase === 'ok' ? ` (${reportes.length})` : ''}
            </h3>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Buscar por código o radiobase..."
                  aria-label="Buscar expedientes"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                />
              </div>
              {tecnicoId && (
                <button
                  type="button"
                  onClick={() => {
                    void cargarReportes(tecnicoId);
                    void cargarPendientes();
                  }}
                  disabled={cargaReportes.fase === 'cargando'}
                  aria-label="Actualizar listado"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${cargaReportes.fase === 'cargando' ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {cargaReportes.fase === 'esperando-sesion' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600 flex flex-wrap items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Validando sesión del técnico con el servidor...</span>
              {!user && (
                <Link href="/login" className="text-blue-700 font-semibold underline">
                  Iniciar sesión
                </Link>
              )}
            </div>
          )}

          {cargaReportes.fase === 'cargando' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Cargando sus expedientes...
            </div>
          )}

          {cargaReportes.fase === 'error' && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-800 flex flex-wrap items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="flex-1">{cargaReportes.mensaje}</span>
              {tecnicoId && (
                <button
                  type="button"
                  onClick={() => void cargarReportes(tecnicoId)}
                  className="min-h-[44px] px-4 rounded-lg bg-white border border-red-200 text-red-700 font-semibold text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reintentar
                </button>
              )}
            </div>
          )}

          {cargaReportes.fase === 'ok' && reportes.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-sm text-slate-500">
              Aún no tiene expedientes. Elija una radiobase arriba y tome las fotos para crear el primero.
            </div>
          )}

          {cargaReportes.fase === 'ok' && reportes.length > 0 && filtrados.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-sm text-slate-500">
              Ningún expediente coincide con &quot;{busqueda}&quot;.
            </div>
          )}

          {filtrados.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {filtrados.map((reporte) => {
                const capturaAbierta = ESTADOS_CAPTURA_ABIERTA.includes(reporte.estado);
                const pendienteLocal = pendientes?.reportes.has(reporte.id) ?? false;
                const urlContinuar =
                  capturaAbierta && reporte.radiobase
                    ? construirUrlCaptura({
                        reporteId: reporte.id,
                        codigo: reporte.radiobase.codigo,
                        nombre: reporte.radiobase.nombre,
                      })
                    : null;

                return (
                  <div
                    key={reporte.id}
                    className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row gap-6"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${estiloEstado(
                            reporte.estado
                          )}`}
                        >
                          {ESTADOS_CERRADOS.includes(reporte.estado) ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : reporte.estado === EstadoReporte.OBSERVADO ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {ETIQUETAS_ESTADO[reporte.estado]}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 font-mono">
                          {reporte.codigo}
                        </span>
                        {pendienteLocal && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 flex items-center gap-1">
                            <CloudOff className="w-3 h-3" /> Pendiente en dispositivo
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
                          {reporte.radiobase
                            ? `${reporte.radiobase.codigo} · ${reporte.radiobase.nombre}`
                            : 'Radiobase no disponible'}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium">
                          Visita: {formatearFecha(reporte.fechaVisita)} &middot; {reporte.totalEvidencias} foto(s) en servidor
                        </p>
                      </div>

                      {reporte.estado === EstadoReporte.OBSERVADO && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
                          <strong className="block mb-0.5">Motivo de observación</strong>
                          {reporte.motivoRechazo ?? 'Sin motivo registrado por coordinación.'}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row lg:flex-col items-stretch lg:items-end justify-start lg:justify-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 lg:min-w-[190px]">
                      {urlContinuar && (
                        <Link
                          href={urlContinuar}
                          className="flex-1 lg:flex-none w-full min-h-[48px] flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors active:scale-95"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Continuar captura
                        </Link>
                      )}
                      <Link
                        href={`/reportes/${reporte.id}/pdf?vista=UNIFICADO`}
                        className="flex-1 lg:flex-none w-full min-h-[48px] flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
