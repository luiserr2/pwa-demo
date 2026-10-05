import React from 'react';
import type { ReporteDetalleApi } from '@/shared/tipos-api';
import { EstadoReporte, ETIQUETAS_CANAL } from '@/shared/flujo-reporte';
import { formatearFecha, formatearFechaHora } from './formato-expediente';

interface Props {
  reporte: ReporteDetalleApi;
  numeroSeccion: number;
}

interface FilaTrazabilidad {
  etiqueta: string;
  valor: string;
  mono?: boolean;
}

/** Bloque de trazabilidad: solo se listan los hitos que el servidor informa. */
export function TrazabilidadDocumento({ reporte, numeroSeccion }: Props) {
  const filas: FilaTrazabilidad[] = [];
  if (reporte.canalRadicacion) filas.push({ etiqueta: 'Canal de radicación', valor: ETIQUETAS_CANAL[reporte.canalRadicacion] });
  if (reporte.numeroTicketCliente) filas.push({ etiqueta: 'Ticket del cliente', valor: reporte.numeroTicketCliente, mono: true });
  if (reporte.fechaEnvioCliente) filas.push({ etiqueta: 'Envío al cliente', valor: formatearFechaHora(reporte.fechaEnvioCliente) });
  if (reporte.fechaVisado) filas.push({ etiqueta: 'Fecha de visado', valor: formatearFechaHora(reporte.fechaVisado) });
  if (reporte.numeroHes) filas.push({ etiqueta: 'Número HES', valor: reporte.numeroHes, mono: true });
  if (reporte.fechaHes) filas.push({ etiqueta: 'Fecha HES', valor: formatearFecha(reporte.fechaHes) });

  const mostrarMotivoRechazo = reporte.estado === EstadoReporte.OBSERVADO && Boolean(reporte.motivoRechazo);

  return (
    <section className="pt-6 border-t-2 border-slate-200 break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{numeroSeccion}. Trazabilidad del Expediente</h2>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded border font-mono ${
            reporte.bloqueadoEdicion
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-300'
          }`}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            {reporte.bloqueadoEdicion ? <path d="M7 11V7a5 5 0 0 1 10 0v4" /> : <path d="M7 11V7a5 5 0 0 1 9.9-1" />}
          </svg>
          <span>{reporte.bloqueadoEdicion ? 'Edición bloqueada' : 'Edición habilitada'}</span>
        </span>
      </div>

      {mostrarMotivoRechazo && (
        <div className="mb-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded px-3 py-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider mb-0.5">Motivo de observación</span>
          {reporte.motivoRechazo}
        </div>
      )}

      {filas.length > 0 ? (
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
          {filas.map((fila) => (
            <div key={fila.etiqueta} className="p-2 border border-slate-200 rounded bg-slate-50">
              <dt className="text-[9px] text-slate-500 font-bold uppercase">{fila.etiqueta}</dt>
              <dd className={`font-bold text-slate-800 ${fila.mono ? 'font-mono' : ''}`}>{fila.valor}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-[11px] text-slate-500 mb-3">El expediente aún no registra hitos de radicación, visado ni HES.</p>
      )}

      {reporte.hashSha256 && (
        <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50">
          <span className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Huella SHA-256 de integridad del contenido visado
          </span>
          <p className="font-mono text-[10px] text-slate-600 break-all">{reporte.hashSha256}</p>
        </div>
      )}
    </section>
  );
}
