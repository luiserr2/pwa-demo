import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type TonoKpi = 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo';

const TONOS: Record<TonoKpi, { fondoIcono: string; iconoFantasma: string; chip: string }> = {
  blue: { fondoIcono: 'bg-blue-600', iconoFantasma: 'text-blue-600', chip: 'text-blue-700 bg-blue-50' },
  emerald: { fondoIcono: 'bg-emerald-500', iconoFantasma: 'text-emerald-600', chip: 'text-emerald-700 bg-emerald-50' },
  amber: { fondoIcono: 'bg-amber-500', iconoFantasma: 'text-amber-500', chip: 'text-amber-700 bg-amber-50' },
  rose: { fondoIcono: 'bg-rose-500', iconoFantasma: 'text-rose-500', chip: 'text-rose-700 bg-rose-50' },
  slate: { fondoIcono: 'bg-slate-900', iconoFantasma: 'text-slate-900', chip: 'text-slate-700 bg-slate-100' },
  indigo: { fondoIcono: 'bg-indigo-600', iconoFantasma: 'text-indigo-600', chip: 'text-indigo-700 bg-indigo-50' },
};

interface Props {
  titulo: string;
  valor: string;
  icono: LucideIcon;
  tono: TonoKpi;
  detalle?: string;
}

export function TarjetaKpi({ titulo, valor, icono: Icono, tono, detalle }: Props) {
  const estilo = TONOS[tono];
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icono className={`w-16 h-16 ${estilo.iconoFantasma}`} aria-hidden="true" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`${estilo.fondoIcono} p-2 rounded-lg`}>
          <Icono className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{titulo}</span>
      </div>
      <div className="text-3xl font-black text-slate-900 font-mono mb-1 truncate">{valor}</div>
      {detalle && <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${estilo.chip}`}>{detalle}</div>}
    </div>
  );
}
