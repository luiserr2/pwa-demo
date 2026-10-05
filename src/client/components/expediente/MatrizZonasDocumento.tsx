import React from 'react';
import type { ZonaApi } from '@/shared/tipos-api';
import {
  EstadoZona,
  ETIQUETAS_ESTADO_ZONA,
  ETIQUETAS_SUBSISTEMA,
  TOTAL_ZONAS,
  normalizarEstadoZona,
} from '@/shared/catalogo-zonas';
import { SIN_DATO, TONO_ESTADO_ZONA } from './formato-expediente';

interface Props {
  zonas: ZonaApi[];
  numeroSeccion: number;
}

const ORDEN_ESTADOS: readonly EstadoZona[] = [EstadoZona.NORMAL, EstadoZona.ALARMA, EstadoZona.FALLA];

/**
 * Matriz de zonas tal como viene del servidor. Si el expediente trae menos de 48 zonas
 * se muestran solo las registradas: no se completan filas con estados supuestos.
 */
export function MatrizZonasDocumento({ zonas, numeroSeccion }: Props) {
  const ordenadas = [...zonas]
    .sort((a, b) => a.numeroZona - b.numeroZona)
    .map((zona) => ({ ...zona, estadoNormalizado: normalizarEstadoZona(zona.estado) }));

  const conteo = ordenadas.reduce<Record<EstadoZona, number>>(
    (acc, zona) => ({ ...acc, [zona.estadoNormalizado]: acc[zona.estadoNormalizado] + 1 }),
    { [EstadoZona.NORMAL]: 0, [EstadoZona.ALARMA]: 0, [EstadoZona.FALLA]: 0 }
  );

  return (
    <section className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {numeroSeccion}. Matriz de Zonas de Supervisión
        </h2>
        <span className="text-[10px] font-mono text-slate-500">
          {ordenadas.length} de {TOTAL_ZONAS} zonas registradas
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        {ORDEN_ESTADOS.map((estado) => (
          <div key={estado} className={`flex items-center justify-between px-3 py-2 rounded border ${TONO_ESTADO_ZONA[estado]}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">{ETIQUETAS_ESTADO_ZONA[estado]}</span>
            <span className="font-mono font-black text-sm">{conteo[estado]}</span>
          </div>
        ))}
      </div>

      {ordenadas.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded p-4 text-center text-xs text-slate-500">
          El expediente no tiene zonas registradas.
        </div>
      ) : (
        <table className="w-full text-[11px] border border-slate-200">
          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-1.5 text-center w-10">N.º</th>
              <th className="p-1.5 text-left">Descripción</th>
              <th className="p-1.5 text-left">Subsistema</th>
              <th className="p-1.5 text-center w-20">Estado</th>
              <th className="p-1.5 text-left">Observación</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((zona) => (
              <tr key={zona.id} className="border-b border-slate-200 break-inside-avoid">
                <td className="p-1.5 text-center font-mono font-bold text-slate-700">{zona.numeroZona}</td>
                <td className="p-1.5 font-semibold text-slate-800">{zona.descripcion || SIN_DATO}</td>
                <td className="p-1.5 text-slate-600">
                  {zona.subsistema ? ETIQUETAS_SUBSISTEMA[zona.subsistema] : SIN_DATO}
                </td>
                <td className="p-1.5 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase ${TONO_ESTADO_ZONA[zona.estadoNormalizado]}`}
                  >
                    {ETIQUETAS_ESTADO_ZONA[zona.estadoNormalizado]}
                  </span>
                </td>
                <td className="p-1.5 text-slate-600">{zona.observacion?.trim() ? zona.observacion : SIN_DATO}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
