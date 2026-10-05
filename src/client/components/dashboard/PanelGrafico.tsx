import React from 'react';
import { BarChart3 } from 'lucide-react';

interface Props {
  titulo: string;
  subtitulo: string;
  icono?: React.ReactNode;
  accion?: React.ReactNode;
  /** true cuando la serie viene vacía: se muestra el estado vacío en lugar del gráfico. */
  vacio: boolean;
  mensajeVacio?: string;
  alturaClase?: string;
  className?: string;
  children: React.ReactNode;
}

export function PanelGrafico({
  titulo,
  subtitulo,
  icono,
  accion,
  vacio,
  mensajeVacio = 'Aún no hay datos registrados para esta serie.',
  alturaClase = 'h-72',
  className = '',
  children,
}: Props) {
  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            {icono}
            {titulo}
          </h2>
          <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">{subtitulo}</p>
        </div>
        {accion}
      </div>
      {vacio ? (
        <div
          className={`${alturaClase} w-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60`}
        >
          <BarChart3 className="w-6 h-6 text-slate-300" aria-hidden="true" />
          <span className="text-xs font-medium text-slate-400 text-center px-6">{mensajeVacio}</span>
        </div>
      ) : (
        <div className={`${alturaClase} w-full`}>{children}</div>
      )}
    </div>
  );
}
