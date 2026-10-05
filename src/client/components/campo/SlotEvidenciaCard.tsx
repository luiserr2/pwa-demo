'use client';

import React from 'react';
import { Camera, Lock, RefreshCw, CloudOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { MomentoEvidencia } from './persistencia-campo';

export interface FotoSlot {
  url: string;
  origen: 'LOCAL' | 'SERVIDOR';
  sincronizado: boolean;
  tamano: string | null;
}

export interface SlotEquipo {
  id: number;
  tipoEquipo: string;
  nombre: string;
  antes: FotoSlot | null;
  despues: FotoSlot | null;
}

export interface RechazoSlot {
  momento: MomentoEvidencia;
  motivo: string;
}

interface SlotEvidenciaCardProps {
  slot: SlotEquipo;
  modoSol: boolean;
  deshabilitado: boolean;
  rechazos: readonly RechazoSlot[];
  onCapturar: (slotId: number, momento: MomentoEvidencia, archivo: File) => void;
}

interface PanelFotoProps {
  slot: SlotEquipo;
  momento: MomentoEvidencia;
  foto: FotoSlot | null;
  bloqueado: boolean;
  modoSol: boolean;
  deshabilitado: boolean;
  onCapturar: (slotId: number, momento: MomentoEvidencia, archivo: File) => void;
}

function PanelFoto({ slot, momento, foto, bloqueado, modoSol, deshabilitado, onCapturar }: PanelFotoProps) {
  const etiqueta = momento === 'ANTES' ? 'ANTES' : 'DESPUÉS';
  const textoAccion = momento === 'ANTES' ? 'Capturar Antes' : 'Capturar Después';
  const ariaCaptura = `Capturar fotografía estado ${momento === 'ANTES' ? 'Antes' : 'Después'} para slot ${slot.id}: ${slot.nombre}`;

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (archivo) onCapturar(slot.id, momento, archivo);
  };

  return (
    <div
      className={`border rounded-xl p-3 flex flex-col justify-between ${
        modoSol ? 'border-amber-500/30 bg-zinc-900' : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-1">
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            modoSol ? 'bg-amber-400 text-black' : 'text-slate-700 bg-slate-200/80'
          }`}
        >
          {etiqueta}
        </span>
        {foto && (
          <span
            className={`text-[9px] font-mono flex items-center gap-1 ${
              foto.sincronizado ? (modoSol ? 'text-emerald-300' : 'text-emerald-700') : modoSol ? 'text-amber-300' : 'text-amber-700'
            }`}
          >
            {foto.sincronizado ? <CheckCircle2 className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
            {foto.sincronizado ? 'En servidor' : 'Pendiente'}
            {foto.tamano ? ` · ${foto.tamano}` : ''}
          </span>
        )}
      </div>

      {foto ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black flex items-center justify-center">
          <img src={foto.url} alt={`${etiqueta} ${slot.nombre}`} className="object-cover w-full h-full" />
          {!deshabilitado && (
            <label className="absolute bottom-1.5 right-1.5 min-h-[36px] px-2.5 rounded-md bg-black/70 hover:bg-black/85 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer active:translate-y-[1px]">
              <RefreshCw className="w-3 h-3" />
              Repetir
              <input
                type="file"
                accept="image/*"
                capture="environment"
                aria-label={`Repetir fotografía ${etiqueta} para slot ${slot.id}: ${slot.nombre}`}
                className="hidden"
                onChange={manejarCambio}
              />
            </label>
          )}
        </div>
      ) : bloqueado ? (
        <div
          className={`flex flex-col items-center justify-center aspect-video border rounded-lg text-center p-2 ${
            modoSol ? 'border-amber-500/20 bg-black text-amber-200/70' : 'border-slate-200 bg-slate-100/70 text-slate-400'
          }`}
        >
          <Lock className="w-5 h-5 mb-1" />
          <span className="text-[10px] leading-tight">Bloqueado hasta tomar foto Antes</span>
        </div>
      ) : deshabilitado ? (
        <div
          className={`flex flex-col items-center justify-center aspect-video border rounded-lg text-center p-2 ${
            modoSol ? 'border-amber-500/20 bg-black text-amber-200/70' : 'border-slate-200 bg-slate-100/70 text-slate-400'
          }`}
        >
          <Lock className="w-5 h-5 mb-1" />
          <span className="text-[10px] leading-tight">Expediente bloqueado</span>
        </div>
      ) : (
        <label
          className={`min-h-[48px] flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer transition-colors p-2 text-center active:translate-y-[1px] ${
            momento === 'ANTES'
              ? modoSol
                ? 'border-amber-400/60 bg-black hover:bg-zinc-900'
                : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40'
              : modoSol
              ? 'border-emerald-400/60 bg-black hover:bg-zinc-900'
              : 'border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80'
          }`}
        >
          <Camera
            className={`w-6 h-6 mb-1 ${
              momento === 'ANTES' ? (modoSol ? 'text-amber-300' : 'text-slate-400') : modoSol ? 'text-emerald-300' : 'text-emerald-600'
            }`}
          />
          <span
            className={`text-[11px] font-medium ${
              momento === 'ANTES' ? (modoSol ? 'text-amber-200' : 'text-slate-600') : modoSol ? 'text-emerald-200' : 'text-emerald-700'
            }`}
          >
            {textoAccion}
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            aria-label={ariaCaptura}
            className="hidden"
            onChange={manejarCambio}
          />
        </label>
      )}
    </div>
  );
}

export function SlotEvidenciaCard({ slot, modoSol, deshabilitado, rechazos, onCapturar }: SlotEvidenciaCardProps) {
  const antesListo = slot.antes !== null;

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl border transition-all ${
        rechazos.length > 0
          ? modoSol
            ? 'bg-zinc-950 border-red-500/70'
            : 'bg-white border-red-300 shadow-xs'
          : modoSol
          ? 'bg-zinc-950 border-amber-500/30'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 shrink-0 rounded-md bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center">
            #{slot.id}
          </span>
          <h3 className={`font-bold text-xs sm:text-sm truncate ${modoSol ? 'text-amber-100' : 'text-slate-900'}`}>
            {slot.nombre}
          </h3>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
            modoSol ? 'text-amber-300 bg-black border-amber-500/30' : 'text-slate-500 bg-slate-100 border-slate-200'
          }`}
        >
          {slot.tipoEquipo}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PanelFoto
          slot={slot}
          momento="ANTES"
          foto={slot.antes}
          bloqueado={false}
          modoSol={modoSol}
          deshabilitado={deshabilitado}
          onCapturar={onCapturar}
        />
        <PanelFoto
          slot={slot}
          momento="DESPUES"
          foto={slot.despues}
          bloqueado={!antesListo}
          modoSol={modoSol}
          deshabilitado={deshabilitado}
          onCapturar={onCapturar}
        />
      </div>

      {rechazos.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rechazos.map((r) => (
            <li
              key={`${r.momento}-${r.motivo}`}
              className={`text-[11px] flex items-start gap-1.5 ${modoSol ? 'text-red-300' : 'text-red-700'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 mt-px shrink-0" />
              <span>
                <strong>{r.momento === 'ANTES' ? 'Antes' : 'Después'} rechazada:</strong> {r.motivo}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
