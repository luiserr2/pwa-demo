'use client';

import React from 'react';
import { ETIQUETAS_ESTADO, type EstadoReporte } from '@/shared/flujo-reporte';
import { estiloEstado } from './estado-visual';

/** Retroalimentación visual mientras se arrastra una tarjeta sobre la columna. */
export type EstadoDrop = 'inactivo' | 'origen' | 'permitido' | 'prohibido';

interface ColumnaKanbanProps {
  estado: EstadoReporte;
  cantidad: number;
  estadoDrop: EstadoDrop;
  resaltada: boolean;
  variante?: 'pipeline' | 'observados' | 'heredado';
  mensajeVacio: string;
  onDragOverColumna: (estado: EstadoReporte) => void;
  onDragLeaveColumna: (estado: EstadoReporte) => void;
  onDropColumna: (estado: EstadoReporte, reporteId: string) => void;
  children: React.ReactNode;
}

const ANILLO_DROP: Record<EstadoDrop, string> = {
  inactivo: '',
  origen: 'opacity-80',
  permitido: 'ring-2 ring-emerald-300 bg-emerald-50/40',
  prohibido: 'opacity-60',
};

export default function ColumnaKanban({
  estado,
  cantidad,
  estadoDrop,
  resaltada,
  variante = 'pipeline',
  mensajeVacio,
  onDragOverColumna,
  onDragLeaveColumna,
  onDropColumna,
  children,
}: ColumnaKanbanProps) {
  const fondo =
    variante === 'observados'
      ? 'bg-rose-50/60 border-rose-200'
      : variante === 'heredado'
        ? 'bg-white border-dashed border-slate-300'
        : 'bg-slate-100/50 border-slate-200';
  const resalte =
    resaltada && estadoDrop === 'permitido'
      ? 'ring-2 ring-emerald-500 bg-emerald-50'
      : resaltada && estadoDrop === 'prohibido'
        ? 'ring-2 ring-rose-400 bg-rose-50/60 opacity-100'
        : ANILLO_DROP[estadoDrop];

  return (
    <section
      aria-label={`Columna ${ETIQUETAS_ESTADO[estado]}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOverColumna(estado);
      }}
      onDragLeave={(e) => {
        if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
        onDragLeaveColumna(estado);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const reporteId = e.dataTransfer.getData('text/plain');
        if (reporteId) onDropColumna(estado, reporteId);
      }}
      className={`snap-start shrink-0 w-72 flex flex-col rounded-xl border transition-all ${fondo} ${resalte}`}
    >
      <header className="p-3 border-b border-slate-200/70 flex items-center justify-between gap-2">
        <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${estiloEstado(estado)}`}>
          {ETIQUETAS_ESTADO[estado]}
        </span>
        <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-sm font-mono">
          {cantidad}
        </span>
      </header>
      <div className={`flex-1 p-3 space-y-3 ${variante === 'heredado' ? 'min-h-[160px]' : 'min-h-[420px]'}`}>
        {cantidad === 0 ? (
          <div className="h-full min-h-[120px] flex items-center justify-center text-xs text-slate-400 font-medium italic p-6 text-center">
            {mensajeVacio}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
