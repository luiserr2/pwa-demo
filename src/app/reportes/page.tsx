'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Archive, CheckCircle2, Inbox, Loader2, RefreshCw, Search, ServerCrash, X } from 'lucide-react';
import { useAuth } from '@/client/context/AuthContext';
import {
  ETIQUETAS_ESTADO,
  FASES_PIPELINE,
  EstadoReporte,
  esEstadoReporte,
} from '@/shared/flujo-reporte';
import type { ReporteListadoApi } from '@/shared/tipos-api';
import { cambiarEstadoReporte, fusionarReporte, listarReportes } from '@/client/components/pipeline/api-reportes';
import ColumnaKanban, { type EstadoDrop } from '@/client/components/pipeline/ColumnaKanban';
import TarjetaReporte from '@/client/components/pipeline/TarjetaReporte';
import ModalTransicion, { requiereFormulario, type DatosTransicion } from '@/client/components/pipeline/ModalTransicion';
import { ESTADOS_FUERA_PIPELINE } from '@/client/components/pipeline/estado-visual';
import { bloqueadaPorRol, destinosValidos, transicionValida } from '@/client/components/pipeline/transiciones';

interface ErrorCarga {
  mensaje: string;
  status: number;
}

interface Aviso {
  tipo: 'exito' | 'error';
  texto: string;
}

interface TransicionPendiente {
  reporte: ReporteListadoApi;
  destino: EstadoReporte;
}

export default function KanbanPipelinePage() {
  const { user } = useAuth();
  const rol = user?.rol ?? null;
  const sesionActiva = user !== null && user.id !== '';

  const [reportes, setReportes] = useState<ReporteListadoApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<ErrorCarga | null>(null);
  const [ultimaSync, setUltimaSync] = useState<Date | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const [moviendo, setMoviendo] = useState<ReadonlySet<string>>(new Set());
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const [pendiente, setPendiente] = useState<TransicionPendiente | null>(null);
  const [enviandoModal, setEnviandoModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const [arrastrado, setArrastrado] = useState<ReporteListadoApi | null>(null);
  const [columnaSobre, setColumnaSobre] = useState<EstadoReporte | null>(null);

  const montado = useRef(true);
  const reportesRef = useRef<ReporteListadoApi[]>([]);

  useEffect(() => {
    reportesRef.current = reportes;
  }, [reportes]);

  const cargar = useCallback(async (modo: 'inicial' | 'refresco') => {
    if (modo === 'inicial') setCargando(true);
    else setRefrescando(true);

    const resultado = await listarReportes();
    if (!montado.current) return;

    if (resultado.ok) {
      setReportes(resultado.data);
      setErrorCarga(null);
      setUltimaSync(new Date());
    } else {
      setErrorCarga({ mensaje: resultado.error, status: resultado.status });
    }
    setCargando(false);
    setRefrescando(false);
  }, []);

  useEffect(() => {
    montado.current = true;
    void cargar('inicial');
    return () => {
      montado.current = false;
    };
  }, [cargar]);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 6000);
    return () => window.clearTimeout(t);
  }, [aviso]);

  /** Ejecuta el PATCH con actualización optimista. Devuelve el error del servidor o null si tuvo éxito. */
  const ejecutarCambio = useCallback(
    async (reporte: ReporteListadoApi, destino: EstadoReporte, datos: DatosTransicion): Promise<string | null> => {
      if (!user || user.id === '') return 'No hay una sesión activa. Inicie sesión para mover expedientes.';

      setMoviendo((prev) => new Set(prev).add(reporte.id));
      setReportes((prev) => prev.map((r) => (r.id === reporte.id ? { ...r, estado: destino } : r)));

      const resultado = await cambiarEstadoReporte(reporte.id, {
        nuevoEstado: destino,
        usuarioEjecutor: { id: user.id, rol: user.rol },
        ...datos,
      });

      if (montado.current) {
        if (resultado.ok) {
          setReportes((prev) => prev.map((r) => (r.id === reporte.id ? fusionarReporte(r, resultado.data) : r)));
        } else {
          setReportes((prev) => prev.map((r) => (r.id === reporte.id ? reporte : r)));
        }
        setMoviendo((prev) => {
          const siguiente = new Set(prev);
          siguiente.delete(reporte.id);
          return siguiente;
        });
      }
      return resultado.ok ? null : resultado.error;
    },
    [user]
  );

  const moveReporte = (reporte: ReporteListadoApi, destino: EstadoReporte) => {
    if (reporte.estado === destino) return;
    if (moviendo.has(reporte.id)) {
      setAviso({ tipo: 'error', texto: `${reporte.codigo} ya tiene un cambio de estado en curso.` });
      return;
    }
    if (!sesionActiva) {
      setAviso({ tipo: 'error', texto: 'Inicie sesión para mover expedientes.' });
      return;
    }
    if (!transicionValida(reporte.estado, destino)) {
      const validos = destinosValidos(reporte.estado).map((d) => ETIQUETAS_ESTADO[d]);
      const origen = esEstadoReporte(reporte.estado) ? ETIQUETAS_ESTADO[reporte.estado] : reporte.estado;
      setAviso({
        tipo: 'error',
        texto: `Transición no permitida: ${origen} → ${ETIQUETAS_ESTADO[destino]}. ${
          validos.length > 0 ? `Destinos válidos: ${validos.join(', ')}.` : 'Este estado no admite más transiciones.'
        }`,
      });
      return;
    }
    if (bloqueadaPorRol(destino, rol)) {
      setAviso({
        tipo: 'error',
        texto: `Mover a «${ETIQUETAS_ESTADO[destino]}» requiere rol Supervisor o Admin.`,
      });
      return;
    }
    if (requiereFormulario(destino)) {
      setErrorModal(null);
      setPendiente({ reporte, destino });
      return;
    }
    void ejecutarCambio(reporte, destino, {}).then((error) => {
      if (!montado.current) return;
      setAviso(
        error
          ? { tipo: 'error', texto: `${reporte.codigo}: ${error}` }
          : { tipo: 'exito', texto: `${reporte.codigo} movido a «${ETIQUETAS_ESTADO[destino]}».` }
      );
    });
  };

  const cerrarModal = useCallback(() => {
    setPendiente(null);
    setErrorModal(null);
    setEnviandoModal(false);
  }, []);

  const confirmarModal = async (datos: DatosTransicion) => {
    if (!pendiente) return;
    const { reporte, destino } = pendiente;
    setEnviandoModal(true);
    setErrorModal(null);
    const error = await ejecutarCambio(reporte, destino, datos);
    if (!montado.current) return;
    setEnviandoModal(false);
    if (error) {
      setErrorModal(error);
      return;
    }
    cerrarModal();
    setAviso({ tipo: 'exito', texto: `${reporte.codigo} movido a «${ETIQUETAS_ESTADO[destino]}».` });
  };

  // ── Drag & drop nativo ──────────────────────────────────────────────
  const alIniciarArrastre = (reporte: ReporteListadoApi, e: React.DragEvent<HTMLElement>) => {
    e.dataTransfer.setData('text/plain', reporte.id);
    e.dataTransfer.effectAllowed = 'move';
    setArrastrado(reporte);
  };

  const alTerminarArrastre = () => {
    setArrastrado(null);
    setColumnaSobre(null);
  };

  const alSoltar = (estado: EstadoReporte, reporteId: string) => {
    setArrastrado(null);
    setColumnaSobre(null);
    const reporte = reportesRef.current.find((r) => r.id === reporteId);
    if (!reporte) return;
    moveReporte(reporte, estado);
  };

  const estadoDropDe = (estado: EstadoReporte): EstadoDrop => {
    if (!arrastrado) return 'inactivo';
    if (arrastrado.estado === estado) return 'origen';
    return transicionValida(arrastrado.estado, estado) && !bloqueadaPorRol(estado, rol) ? 'permitido' : 'prohibido';
  };

  // ── Filtrado y agrupación ──────────────────────────────────────────
  const termino = busqueda.trim().toLowerCase();
  const filtrados = useMemo(() => {
    if (!termino) return reportes;
    return reportes.filter((r) =>
      [r.codigo, r.radiobase?.nombre, r.radiobase?.codigo, r.radiobase?.region, r.tecnico?.nombre].some(
        (valor) => typeof valor === 'string' && valor.toLowerCase().includes(termino)
      )
    );
  }, [reportes, termino]);

  const porEstado = useMemo(() => {
    const mapa = new Map<string, ReporteListadoApi[]>();
    for (const r of filtrados) {
      const lista = mapa.get(r.estado);
      if (lista) lista.push(r);
      else mapa.set(r.estado, [r]);
    }
    return mapa;
  }, [filtrados]);

  const desconocidos = useMemo(() => filtrados.filter((r) => !esEstadoReporte(r.estado)), [filtrados]);
  const heredadosConDatos = ESTADOS_FUERA_PIPELINE.filter((e) => (porEstado.get(e)?.length ?? 0) > 0);
  const observados = porEstado.get(EstadoReporte.OBSERVADO) ?? [];

  const renderTarjeta = (r: ReporteListadoApi, mostrarEstado = false) => (
    <TarjetaReporte
      key={r.id}
      reporte={r}
      rol={rol}
      sesionActiva={sesionActiva}
      moviendo={moviendo.has(r.id)}
      arrastrando={arrastrado?.id === r.id}
      mostrarEstado={mostrarEstado}
      onMover={moveReporte}
      onDragStart={alIniciarArrastre}
      onDragEnd={alTerminarArrastre}
    />
  );

  const propsColumna = (estado: EstadoReporte) => ({
    estado,
    estadoDrop: estadoDropDe(estado),
    resaltada: columnaSobre === estado,
    onDragOverColumna: (e: EstadoReporte) => {
      if (columnaSobre !== e) setColumnaSobre(e);
    },
    onDragLeaveColumna: (e: EstadoReporte) => {
      setColumnaSobre((actual) => (actual === e ? null : actual));
    },
    onDropColumna: alSoltar,
  });

  const errorInicial = errorCarga !== null && ultimaSync === null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pipeline de Órdenes (VERTEX)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestión operativa de expedientes en 8 fases. Arrastra las tarjetas o usa los botones; solo se ofrecen las
          transiciones permitidas.
        </p>
      </header>

      {/* BARRA SUPERIOR */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, radiobase o técnico…"
            aria-label="Buscar expedientes"
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <span className="text-xs text-slate-500">
            <span className="font-mono font-bold text-slate-900">{filtrados.length}</span>
            {termino ? (
              <>
                {' '}
                de <span className="font-mono font-bold text-slate-900">{reportes.length}</span>
              </>
            ) : null}{' '}
            expedientes
          </span>
          {rol && (
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 font-semibold tracking-wider">
              {rol}
            </span>
          )}
          <button
            type="button"
            onClick={() => void cargar('refresco')}
            disabled={cargando || refrescando}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refrescando ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </div>
      </div>

      {!sesionActiva && !cargando && !errorInicial && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Sin sesión activa: el tablero es de solo lectura.{' '}
          <Link href="/login" className="underline font-bold">
            Iniciar sesión
          </Link>
        </div>
      )}

      {cargando ? (
        <div className="flex flex-col items-center justify-center h-80 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Cargando pipeline operativo…</span>
        </div>
      ) : errorInicial && errorCarga ? (
        <div className="flex flex-col items-center justify-center h-80 text-center gap-3 bg-white border border-rose-200 rounded-xl p-8">
          <ServerCrash className="w-10 h-10 text-rose-500" />
          <div className="text-sm font-bold text-slate-900">No se pudo cargar el pipeline</div>
          <div className="text-xs text-slate-600 max-w-md">{errorCarga.mensaje}</div>
          {errorCarga.status > 0 && (
            <div className="text-[10px] font-mono text-slate-400">HTTP {errorCarga.status}</div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => void cargar('inicial')}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Reintentar
            </button>
            {errorCarga.status === 401 && (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {errorCarga && ultimaSync && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                No se pudo refrescar ({errorCarga.status > 0 ? `HTTP ${errorCarga.status}` : 'sin conexión'}):{' '}
                {errorCarga.mensaje} Se muestra la última carga exitosa de las{' '}
                {ultimaSync.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}.
              </span>
            </div>
          )}

          {reportes.length === 0 ? (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium">
              <Inbox className="w-4 h-4 shrink-0 text-slate-400" />
              No hay expedientes registrados todavía. Los reportes creados en campo aparecerán aquí.
            </div>
          ) : filtrados.length === 0 ? (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium">
              <Search className="w-4 h-4 shrink-0 text-slate-400" />
              Ningún expediente coincide con «{busqueda.trim()}».
            </div>
          ) : null}

          {/* TABLERO: 8 FASES + BANDEJA DE OBSERVADOS */}
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x">
            {FASES_PIPELINE.map((fase) => {
              const lista = porEstado.get(fase) ?? [];
              return (
                <ColumnaKanban
                  key={fase}
                  {...propsColumna(fase)}
                  cantidad={lista.length}
                  mensajeVacio="No hay reportes en esta fase."
                >
                  {lista.map((r) => renderTarjeta(r))}
                </ColumnaKanban>
              );
            })}

            <div className="shrink-0 w-px bg-slate-200 mx-1" aria-hidden />

            <ColumnaKanban
              {...propsColumna(EstadoReporte.OBSERVADO)}
              variante="observados"
              cantidad={observados.length}
              mensajeVacio="Sin expedientes observados."
            >
              {observados.map((r) => renderTarjeta(r))}
            </ColumnaKanban>
          </div>

          {/* FUERA DEL PIPELINE: ESTADOS HEREDADOS */}
          {(heredadosConDatos.length > 0 || desconocidos.length > 0) && (
            <section className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Archive className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-800">Fuera del pipeline</h2>
                <span className="text-[11px] text-slate-500">
                  Estados heredados; usa sus transiciones para reincorporarlos a las 8 fases.
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {heredadosConDatos.map((estado) => {
                  const lista = porEstado.get(estado) ?? [];
                  return (
                    <ColumnaKanban
                      key={estado}
                      {...propsColumna(estado)}
                      variante="heredado"
                      cantidad={lista.length}
                      mensajeVacio="Sin expedientes."
                    >
                      {lista.map((r) => renderTarjeta(r))}
                    </ColumnaKanban>
                  );
                })}
                {desconocidos.length > 0 && (
                  <div className="shrink-0 w-72 flex flex-col rounded-xl border border-dashed border-amber-300 bg-amber-50/40">
                    <div className="p-3 border-b border-amber-200 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800">
                        Estado no reconocido
                      </span>
                      <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-sm">
                        {desconocidos.length}
                      </span>
                    </div>
                    <div className="p-3 space-y-3">{desconocidos.map((r) => renderTarjeta(r, true))}</div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {pendiente && (
        <ModalTransicion
          reporte={pendiente.reporte}
          destino={pendiente.destino}
          enviando={enviandoModal}
          errorServidor={errorModal}
          onCancelar={cerrarModal}
          onConfirmar={(datos) => void confirmarModal(datos)}
        />
      )}

      {aviso && (
        <div
          role={aviso.tipo === 'error' ? 'alert' : 'status'}
          className={`fixed bottom-6 right-6 z-40 max-w-sm flex items-start gap-2 p-3 rounded-lg shadow-lg border text-xs font-medium ${
            aviso.tipo === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {aviso.tipo === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{aviso.texto}</span>
          <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso" className="opacity-60 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
