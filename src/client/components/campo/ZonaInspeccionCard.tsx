'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  EstadoZona,
  ETIQUETAS_ESTADO_ZONA,
  ETIQUETAS_SUBSISTEMA,
  zonaRequiereObservacion,
} from '@/shared/catalogo-zonas';
import type { ZonaEstadoLocal } from './persistencia-campo';

interface ZonaInspeccionCardProps {
  zona: ZonaEstadoLocal;
  modoSol: boolean;
  deshabilitado: boolean;
  onCambiarEstado: (numeroZona: number, estado: EstadoZona) => void;
  onCambiarObservacion: (numeroZona: number, observacion: string) => void;
}

const ORDEN_ESTADOS: readonly EstadoZona[] = [EstadoZona.NORMAL, EstadoZona.ALARMA, EstadoZona.FALLA];

const ESTILO_ACTIVO: Record<EstadoZona, string> = {
  [EstadoZona.NORMAL]: 'bg-emerald-600 text-white border-emerald-600',
  [EstadoZona.ALARMA]: 'bg-amber-500 text-black border-amber-500',
  [EstadoZona.FALLA]: 'bg-red-600 text-white border-red-600',
};

const ESTILO_TARJETA: Record<EstadoZona, string> = {
  [EstadoZona.NORMAL]: 'bg-white border-slate-200',
  [EstadoZona.ALARMA]: 'bg-amber-50 border-amber-300',
  [EstadoZona.FALLA]: 'bg-red-50 border-red-300',
};

const ESTILO_TARJETA_SOL: Record<EstadoZona, string> = {
  [EstadoZona.NORMAL]: 'bg-zinc-950 border-amber-500/30',
  [EstadoZona.ALARMA]: 'bg-zinc-950 border-amber-400',
  [EstadoZona.FALLA]: 'bg-zinc-950 border-red-500',
};

export function zonaIncompleta(zona: ZonaEstadoLocal): boolean {
  return zonaRequiereObservacion(zona.estado) && zona.observacion.trim() === '';
}

export function ZonaInspeccionCard({
  zona,
  modoSol,
  deshabilitado,
  onCambiarEstado,
  onCambiarObservacion,
}: ZonaInspeccionCardProps) {
  const requiereObservacion = zonaRequiereObservacion(zona.estado);
  const incompleta = zonaIncompleta(zona);
  const idObservacion = `obs-zona-${zona.numeroZona}`;

  return (
    <div
      id={`zona-${zona.numeroZona}`}
      className={`p-3 rounded-lg border text-xs transition-all ${
        modoSol ? ESTILO_TARJETA_SOL[zona.estado] : ESTILO_TARJETA[zona.estado]
      } ${incompleta ? 'ring-2 ring-red-500 ring-offset-1' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className={`font-mono font-bold text-[10px] w-6 shrink-0 pt-0.5 ${modoSol ? 'text-amber-300' : 'text-slate-500'}`}>
            #{zona.numeroZona}
          </span>
          <span className={`font-medium text-[11px] leading-tight ${modoSol ? 'text-amber-50' : 'text-slate-800'}`}>
            {zona.descripcion}
          </span>
        </div>
        <span
          className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
            modoSol ? 'bg-black text-amber-200 border-amber-500/30' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {ETIQUETAS_SUBSISTEMA[zona.subsistema]}
        </span>
      </div>

      <div role="radiogroup" aria-label={`Estado de la zona ${zona.numeroZona}`} className="grid grid-cols-3 gap-1.5">
        {ORDEN_ESTADOS.map((estado) => {
          const activo = zona.estado === estado;
          return (
            <button
              key={estado}
              type="button"
              role="radio"
              aria-checked={activo}
              disabled={deshabilitado}
              onClick={() => onCambiarEstado(zona.numeroZona, estado)}
              className={`min-h-[44px] rounded-md border text-[11px] font-semibold transition-all active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                activo
                  ? ESTILO_ACTIVO[estado]
                  : modoSol
                  ? 'bg-black text-amber-200 border-amber-500/30 hover:bg-zinc-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {ETIQUETAS_ESTADO_ZONA[estado]}
            </button>
          );
        })}
      </div>

      {requiereObservacion && (
        <div className="mt-2">
          <label
            htmlFor={idObservacion}
            className={`block text-[10px] font-semibold mb-1 ${
              incompleta ? (modoSol ? 'text-red-300' : 'text-red-700') : modoSol ? 'text-amber-200' : 'text-slate-600'
            }`}
          >
            Observación técnica (obligatoria)
          </label>
          <textarea
            id={idObservacion}
            value={zona.observacion}
            disabled={deshabilitado}
            maxLength={1000}
            rows={2}
            aria-invalid={incompleta}
            placeholder="Describa la novedad encontrada y la acción tomada"
            onChange={(e) => onCambiarObservacion(zona.numeroZona, e.target.value)}
            className={`w-full rounded-md border p-2 text-[12px] leading-snug focus:outline-none focus:ring-2 disabled:opacity-60 ${
              modoSol
                ? 'bg-black text-amber-50 placeholder:text-amber-200/40 border-amber-500/40 focus:ring-amber-400'
                : 'bg-white text-slate-900 placeholder:text-slate-400 border-slate-300 focus:ring-blue-500'
            } ${incompleta ? 'border-red-500' : ''}`}
          />
          {incompleta && (
            <p className={`mt-1 text-[10px] flex items-center gap-1 ${modoSol ? 'text-red-300' : 'text-red-700'}`}>
              <AlertTriangle className="w-3 h-3" />
              Sin observación no se puede sincronizar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
