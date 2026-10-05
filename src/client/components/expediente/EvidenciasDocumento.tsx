import React from 'react';
import type { EvidenciaApi } from '@/shared/tipos-api';
import { ETIQUETAS_VALIDACION, TONO_VALIDACION, formatearFechaHora } from './formato-expediente';

interface Props {
  evidencias: EvidenciaApi[];
  numeroSeccion: number;
}

interface GrupoEvidencia {
  clave: string;
  slotNumero: number;
  tipoEquipo: string;
  antes: EvidenciaApi | null;
  despues: EvidenciaApi | null;
}

/** Si hay varias capturas para el mismo slot/momento prevalece la más reciente. */
function masReciente(actual: EvidenciaApi | null, candidata: EvidenciaApi): EvidenciaApi {
  if (!actual) return candidata;
  return new Date(candidata.createdAt).getTime() >= new Date(actual.createdAt).getTime() ? candidata : actual;
}

function agruparEvidencias(evidencias: EvidenciaApi[]): GrupoEvidencia[] {
  const grupos = new Map<string, GrupoEvidencia>();
  for (const ev of evidencias) {
    const clave = `${ev.slotNumero}|${ev.tipoEquipo}`;
    const grupo = grupos.get(clave) ?? {
      clave,
      slotNumero: ev.slotNumero,
      tipoEquipo: ev.tipoEquipo,
      antes: null,
      despues: null,
    };
    if (ev.momento === 'ANTES') grupo.antes = masReciente(grupo.antes, ev);
    else grupo.despues = masReciente(grupo.despues, ev);
    grupos.set(clave, grupo);
  }
  return [...grupos.values()].sort(
    (a, b) => a.slotNumero - b.slotNumero || a.tipoEquipo.localeCompare(b.tipoEquipo, 'es')
  );
}

function CuadroFoto({ evidencia, momento }: { evidencia: EvidenciaApi | null; momento: 'ANTES' | 'DESPUES' }) {
  const titulo = momento === 'ANTES' ? 'Estado anterior (antes)' : 'Estado final (después)';
  const bordeFoto = momento === 'ANTES' ? 'border-slate-300' : 'border-emerald-300';
  const colorTitulo = momento === 'ANTES' ? 'text-slate-500' : 'text-emerald-700';

  return (
    <div className="flex flex-col gap-1">
      <span className={`block text-[10px] font-semibold uppercase ${colorTitulo}`}>{titulo}</span>
      {evidencia ? (
        <>
          <div className={`aspect-video rounded overflow-hidden border bg-slate-100 ${bordeFoto}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- urlImagen puede ser dataURL base64 */}
            <img
              src={evidencia.urlImagen}
              alt={`${titulo} — slot ${evidencia.slotNumero} (${evidencia.tipoEquipo})`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span
              className={`inline-flex items-center text-[9px] font-semibold px-1.5 py-0.5 rounded border ${TONO_VALIDACION[evidencia.estadoValidacion]}`}
            >
              {ETIQUETAS_VALIDACION[evidencia.estadoValidacion]}
            </span>
            <span className="text-[9px] font-mono text-slate-400">{formatearFechaHora(evidencia.createdAt)}</span>
          </div>
          {evidencia.estadoValidacion === 'RECHAZADO' && evidencia.observacionRechazo && (
            <p className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1">
              Motivo de rechazo: {evidencia.observacionRechazo}
            </p>
          )}
        </>
      ) : (
        <div className="aspect-video rounded border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sin evidencia</span>
        </div>
      )}
    </div>
  );
}

export function EvidenciasDocumento({ evidencias, numeroSeccion }: Props) {
  const grupos = agruparEvidencias(evidencias);

  return (
    <section className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {numeroSeccion}. Registro Fotográfico Comparativo (Antes vs Después)
        </h2>
        <span className="text-[10px] font-mono text-slate-500">
          {evidencias.length} {evidencias.length === 1 ? 'fotografía' : 'fotografías'} · {grupos.length}{' '}
          {grupos.length === 1 ? 'slot' : 'slots'}
        </span>
      </div>

      {grupos.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded p-4 text-center text-xs text-slate-500">
          El expediente no tiene evidencias fotográficas registradas.
        </div>
      ) : (
        <div className="space-y-4">
          {grupos.map((grupo) => (
            <div key={grupo.clave} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 break-inside-avoid">
              <div className="mb-2">
                <span className="text-xs font-bold text-slate-900">
                  Slot #{grupo.slotNumero} · {grupo.tipoEquipo}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CuadroFoto evidencia={grupo.antes} momento="ANTES" />
                <CuadroFoto evidencia={grupo.despues} momento="DESPUES" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
