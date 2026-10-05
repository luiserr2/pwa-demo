'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Receipt, Send, X } from 'lucide-react';
import {
  CANALES_RADICACION,
  ETIQUETAS_CANAL,
  ETIQUETAS_ESTADO,
  EstadoReporte,
  type CanalRadicacion,
} from '@/shared/flujo-reporte';
import type { CambiarEstadoPayload, ReporteListadoApi } from '@/shared/tipos-api';

/** Destinos que exigen datos adicionales antes de enviar el PATCH. */
export const ESTADOS_CON_FORMULARIO: readonly EstadoReporte[] = [
  EstadoReporte.ENVIADO_AL_CLIENTE,
  EstadoReporte.HES_SOLICITADA,
  EstadoReporte.OBSERVADO,
];

export function requiereFormulario(destino: EstadoReporte): boolean {
  return ESTADOS_CON_FORMULARIO.includes(destino);
}

export type DatosTransicion = Pick<
  CambiarEstadoPayload,
  'canalRadicacion' | 'numeroTicketCliente' | 'numeroHes' | 'fechaHes' | 'motivoRechazo'
>;

const PATRON_HES = /^[A-Za-z0-9\-_./ ]{3,100}$/;

function esCanal(valor: string): valor is CanalRadicacion {
  return (CANALES_RADICACION as readonly string[]).includes(valor);
}

interface ModalTransicionProps {
  reporte: ReporteListadoApi;
  destino: EstadoReporte;
  enviando: boolean;
  errorServidor: string | null;
  onCancelar: () => void;
  onConfirmar: (datos: DatosTransicion) => void;
}

export default function ModalTransicion({
  reporte,
  destino,
  enviando,
  errorServidor,
  onCancelar,
  onConfirmar,
}: ModalTransicionProps) {
  const [canal, setCanal] = useState<string>('');
  const [ticket, setTicket] = useState('');
  const [numeroHes, setNumeroHes] = useState('');
  const [fechaHes, setFechaHes] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errorCliente, setErrorCliente] = useState<string | null>(null);

  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !enviando) onCancelar();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [enviando, onCancelar]);

  const validar = (): DatosTransicion | string => {
    if (destino === EstadoReporte.ENVIADO_AL_CLIENTE) {
      if (!esCanal(canal)) return 'Seleccione el canal de radicación.';
      const t = ticket.trim();
      if (!t) return 'El número de ticket del cliente es obligatorio.';
      if (t.length > 100) return 'El número de ticket no puede superar 100 caracteres.';
      return { canalRadicacion: canal, numeroTicketCliente: t };
    }
    if (destino === EstadoReporte.HES_SOLICITADA) {
      const h = numeroHes.trim();
      if (!PATRON_HES.test(h)) {
        return 'El número HES debe tener entre 3 y 100 caracteres (letras, números, espacio, "-", "_", "." o "/").';
      }
      if (!fechaHes) return { numeroHes: h };
      const fecha = new Date(`${fechaHes}T00:00:00`);
      if (Number.isNaN(fecha.getTime())) return 'La fecha HES no es válida.';
      return { numeroHes: h, fechaHes: fecha.toISOString() };
    }
    if (destino === EstadoReporte.OBSERVADO) {
      const m = motivo.trim();
      if (!m) return 'El motivo de la observación es obligatorio.';
      if (m.length > 2000) return 'El motivo no puede superar 2000 caracteres.';
      return { motivoRechazo: m };
    }
    return {};
  };

  const alEnviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (enviando) return;
    const resultado = validar();
    if (typeof resultado === 'string') {
      setErrorCliente(resultado);
      return;
    }
    setErrorCliente(null);
    onConfirmar(resultado);
  };

  const error = errorCliente ?? errorServidor;
  const esObservacion = destino === EstadoReporte.OBSERVADO;
  const Icono = esObservacion ? AlertTriangle : destino === EstadoReporte.HES_SOLICITADA ? Receipt : Send;
  const campo =
    'w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50';
  const etiqueta = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !enviando) onCancelar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-transicion-titulo"
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg border ${
                esObservacion ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}
            >
              <Icono className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-transicion-titulo" className="text-sm font-bold text-slate-900">
                Mover a «{ETIQUETAS_ESTADO[destino]}»
              </h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {reporte.codigo}
                {reporte.radiobase ? ` · ${reporte.radiobase.nombre}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            disabled={enviando}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={alEnviar} noValidate className="p-5 space-y-4">
          {destino === EstadoReporte.ENVIADO_AL_CLIENTE && (
            <>
              <div>
                <label htmlFor="canal-radicacion" className={etiqueta}>
                  Canal de radicación *
                </label>
                <select
                  id="canal-radicacion"
                  value={canal}
                  onChange={(e) => setCanal(e.target.value)}
                  disabled={enviando}
                  className={campo}
                  autoFocus
                >
                  <option value="">Seleccione un canal…</option>
                  {CANALES_RADICACION.map((c) => (
                    <option key={c} value={c}>
                      {ETIQUETAS_CANAL[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ticket-cliente" className={etiqueta}>
                  Número de ticket del cliente *
                </label>
                <input
                  id="ticket-cliente"
                  type="text"
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                  maxLength={100}
                  disabled={enviando}
                  className={campo}
                  placeholder="Identificador asignado por el cliente"
                />
              </div>
            </>
          )}

          {destino === EstadoReporte.HES_SOLICITADA && (
            <>
              <div>
                <label htmlFor="numero-hes" className={etiqueta}>
                  Número HES *
                </label>
                <input
                  id="numero-hes"
                  type="text"
                  value={numeroHes}
                  onChange={(e) => setNumeroHes(e.target.value)}
                  maxLength={100}
                  disabled={enviando}
                  className={`${campo} font-mono`}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="fecha-hes" className={etiqueta}>
                  Fecha HES (opcional)
                </label>
                <input
                  id="fecha-hes"
                  type="date"
                  value={fechaHes}
                  onChange={(e) => setFechaHes(e.target.value)}
                  disabled={enviando}
                  className={campo}
                />
              </div>
            </>
          )}

          {esObservacion && (
            <div>
              <label htmlFor="motivo-rechazo" className={etiqueta}>
                Motivo de la observación *
              </label>
              <textarea
                id="motivo-rechazo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={2000}
                rows={5}
                disabled={enviando}
                className={`${campo} resize-y`}
                placeholder="Describa qué debe corregir el técnico"
                autoFocus
              />
              <div className="text-[10px] font-mono text-slate-400 text-right mt-1">{motivo.trim().length}/2000</div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancelar}
              disabled={enviando}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className={`px-4 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60 ${
                esObservacion ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {enviando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {esObservacion ? 'Registrar observación' : 'Confirmar cambio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
