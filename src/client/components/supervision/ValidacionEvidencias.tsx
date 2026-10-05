'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Camera, CheckCircle2, Loader2, Lock, RotateCcw, XCircle } from 'lucide-react';
import { solicitarApi } from '@/client/components/campo/api-campo';
import type { EvidenciaApi, ReporteDetalleApi } from '@/shared/tipos-api';

interface Props {
  reporteId: string;
  bloqueado: boolean;
  /** Se invoca tras cada evaluación persistida (p. ej. para refrescar la línea de tiempo). */
  onEvaluada: () => void;
}

interface GrupoSlot {
  clave: string;
  slotNumero: number;
  tipoEquipo: string;
  antes: EvidenciaApi | null;
  despues: EvidenciaApi | null;
}

const ESTILO_VALIDACION: Record<EvidenciaApi['estadoValidacion'], { etiqueta: string; clase: string }> = {
  PENDIENTE: { etiqueta: 'Pendiente', clase: 'bg-amber-50 text-amber-700 border-amber-200' },
  APROBADO: { etiqueta: 'Aprobada', clase: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RECHAZADO: { etiqueta: 'Rechazada', clase: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function agruparPorSlot(evidencias: readonly EvidenciaApi[]): GrupoSlot[] {
  const mapa = new Map<string, GrupoSlot>();
  for (const ev of evidencias) {
    const clave = `${ev.slotNumero}::${ev.tipoEquipo}`;
    const grupo = mapa.get(clave) ?? {
      clave,
      slotNumero: ev.slotNumero,
      tipoEquipo: ev.tipoEquipo,
      antes: null,
      despues: null,
    };
    if (ev.momento === 'ANTES') grupo.antes = ev;
    else grupo.despues = ev;
    mapa.set(clave, grupo);
  }
  return Array.from(mapa.values()).sort((a, b) => a.slotNumero - b.slotNumero || a.tipoEquipo.localeCompare(b.tipoEquipo));
}

/**
 * Validación visual de evidencias por el Supervisor: aprobar o rechazar (con motivo) cada foto.
 * Persiste vía PATCH /api/fotos; el servidor toma al evaluador de la sesión y audita el evento.
 */
export function ValidacionEvidencias({ reporteId, bloqueado, onEvaluada }: Props) {
  const [evidencias, setEvidencias] = useState<EvidenciaApi[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState<number>(0);

  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [rechazandoId, setRechazandoId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<string>('');
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);
    setRechazandoId(null);
    setErrorAccion(null);
    void (async () => {
      const resultado = await solicitarApi<ReporteDetalleApi>(`/api/reportes/${encodeURIComponent(reporteId)}`);
      if (cancelado) return;
      if (resultado.ok) {
        setEvidencias(Array.isArray(resultado.data.evidencias) ? resultado.data.evidencias : []);
      } else {
        setEvidencias([]);
        setError(`HTTP ${resultado.status}: ${resultado.error}`);
      }
      setCargando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [reporteId, intento]);

  const grupos = useMemo(() => agruparPorSlot(evidencias), [evidencias]);

  const resumen = useMemo(
    () => ({
      pendientes: evidencias.filter((e) => e.estadoValidacion === 'PENDIENTE').length,
      aprobadas: evidencias.filter((e) => e.estadoValidacion === 'APROBADO').length,
      rechazadas: evidencias.filter((e) => e.estadoValidacion === 'RECHAZADO').length,
    }),
    [evidencias]
  );

  const evaluar = useCallback(
    async (evidencia: EvidenciaApi, estado: 'APROBADO' | 'RECHAZADO', observacion?: string) => {
      setEnviandoId(evidencia.id);
      setErrorAccion(null);
      const resultado = await solicitarApi<EvidenciaApi>('/api/fotos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenciaId: evidencia.id,
          estado,
          ...(estado === 'RECHAZADO' ? { observacionRechazo: observacion } : {}),
        }),
      });
      setEnviandoId(null);
      if (!resultado.ok) {
        setErrorAccion(`HTTP ${resultado.status}: ${resultado.error}`);
        return;
      }
      setEvidencias((previas) =>
        previas.map((e) =>
          e.id === evidencia.id
            ? { ...e, estadoValidacion: resultado.data.estadoValidacion, observacionRechazo: resultado.data.observacionRechazo }
            : e
        )
      );
      setRechazandoId(null);
      setMotivo('');
      onEvaluada();
    },
    [onEvaluada]
  );

  const renderFoto = (evidencia: EvidenciaApi | null, momento: 'ANTES' | 'DESPUÉS') => {
    if (!evidencia) {
      return (
        <div className="aspect-[4/3] rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-[10px] text-slate-400 gap-1">
          <Camera className="w-4 h-4" />
          {momento}: sin evidencia
        </div>
      );
    }
    const estilo = ESTILO_VALIDACION[evidencia.estadoValidacion];
    const enviando = enviandoId === evidencia.id;
    const enRechazo = rechazandoId === evidencia.id;
    return (
      <div className="space-y-1.5">
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={evidencia.urlImagen} alt={`${momento} slot ${evidencia.slotNumero}`} className="w-full h-full object-cover" />
          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase bg-white/90 text-slate-700 px-1.5 py-0.5 rounded">
            {momento}
          </span>
          <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${estilo.clase}`}>
            {estilo.etiqueta}
          </span>
        </div>
        {evidencia.estadoValidacion === 'RECHAZADO' && evidencia.observacionRechazo && (
          <p className="text-[10px] text-rose-700 leading-snug">{evidencia.observacionRechazo}</p>
        )}
        {!bloqueado && !enRechazo && (
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={enviando || evidencia.estadoValidacion === 'APROBADO'}
              onClick={() => void evaluar(evidencia, 'APROBADO')}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Aprobar
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={() => {
                setRechazandoId(evidencia.id);
                setMotivo(evidencia.observacionRechazo ?? '');
                setErrorAccion(null);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="w-3 h-3" />
              Rechazar
            </button>
          </div>
        )}
        {!bloqueado && enRechazo && (
          <div className="space-y-1.5">
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Motivo del rechazo (desenfoque, ángulo, obstrucción...)"
              className="w-full text-[11px] border border-rose-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={enviando || motivo.trim().length === 0}
                onClick={() => void evaluar(evidencia, 'RECHAZADO', motivo.trim())}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {enviando ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                Confirmar rechazo
              </button>
              <button
                type="button"
                disabled={enviando}
                onClick={() => {
                  setRechazandoId(null);
                  setMotivo('');
                }}
                className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-600" />
          Validación visual de evidencias ({evidencias.length})
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">{resumen.pendientes} pendientes</span>
          <span className="px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">{resumen.aprobadas} aprobadas</span>
          <span className="px-1.5 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200">{resumen.rechazadas} rechazadas</span>
        </div>
      </div>

      {bloqueado && (
        <p className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2">
          <Lock className="w-3.5 h-3.5" /> Expediente visado: las evaluaciones quedaron congeladas.
        </p>
      )}
      {resumen.rechazadas > 0 && !bloqueado && (
        <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          Hay fotos rechazadas: el expediente no podrá pasar a Visado hasta que el técnico las repita y se aprueben.
        </p>
      )}
      {errorAccion && (
        <p role="alert" className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {errorAccion}
        </p>
      )}

      {cargando ? (
        <div className="p-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando evidencias...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setIntento((n) => n + 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 font-bold"
          >
            <RotateCcw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      ) : grupos.length === 0 ? (
        <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
          Este expediente no tiene evidencias sincronizadas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grupos.map((grupo) => (
            <div key={grupo.clave} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="text-[11px] font-bold text-slate-700">
                Slot {grupo.slotNumero} · <span className="font-mono">{grupo.tipoEquipo}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {renderFoto(grupo.antes, 'ANTES')}
                {renderFoto(grupo.despues, 'DESPUÉS')}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
