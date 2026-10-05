'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  GripVertical,
  Loader2,
  Lock,
  MapPin,
  Receipt,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { ETIQUETAS_CANAL, ETIQUETAS_ESTADO, EstadoReporte, type CanalRadicacion } from '@/shared/flujo-reporte';
import type { ReporteListadoApi, RolApi } from '@/shared/tipos-api';
import { accionesDisponibles, type AccionTransicion } from './transiciones';
import { estiloEstado, formatearFecha } from './estado-visual';

interface TarjetaReporteProps {
  reporte: ReporteListadoApi;
  rol: RolApi | null;
  sesionActiva: boolean;
  moviendo: boolean;
  arrastrando: boolean;
  mostrarEstado?: boolean;
  onMover: (reporte: ReporteListadoApi, destino: EstadoReporte) => void;
  onDragStart: (reporte: ReporteListadoApi, e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

function etiquetaCanal(canal: CanalRadicacion | null): string | null {
  if (!canal) return null;
  return (ETIQUETAS_CANAL as Record<string, string | undefined>)[canal] ?? canal;
}

function etiquetaEstado(estado: string): string {
  return (ETIQUETAS_ESTADO as Record<string, string | undefined>)[estado] ?? estado;
}

function BotonAccion({
  accion,
  deshabilitada,
  motivo,
  onClick,
}: {
  accion: AccionTransicion;
  deshabilitada: boolean;
  motivo: string | null;
  onClick: () => void;
}) {
  const etiqueta = ETIQUETAS_ESTADO[accion.destino];
  const base =
    'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-colors disabled:opacity-35 disabled:cursor-not-allowed';
  const estilos: Record<AccionTransicion['tipo'], string> = {
    avanzar: 'bg-slate-900 text-white border-slate-900 hover:bg-slate-700',
    retroceder: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
    observar: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    mover: 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
  };
  const titulo = motivo ?? `Mover a «${etiqueta}»`;

  return (
    <button type="button" onClick={onClick} disabled={deshabilitada} title={titulo} className={`${base} ${estilos[accion.tipo]}`}>
      {accion.tipo === 'retroceder' && <ChevronLeft className="w-3 h-3" />}
      {accion.tipo === 'observar' && <AlertTriangle className="w-3 h-3" />}
      {accion.tipo === 'retroceder' ? 'Retroceder' : accion.tipo === 'observar' ? 'Observar' : etiqueta}
      {accion.tipo === 'avanzar' && <ChevronRight className="w-3 h-3" />}
      {accion.bloqueadaPorRol && <Lock className="w-2.5 h-2.5" />}
    </button>
  );
}

export default function TarjetaReporte({
  reporte,
  rol,
  sesionActiva,
  moviendo,
  arrastrando,
  mostrarEstado = false,
  onMover,
  onDragStart,
  onDragEnd,
}: TarjetaReporteProps) {
  const acciones = accionesDisponibles(reporte.estado, rol);
  const fechaVisita = formatearFecha(reporte.fechaVisita);
  const canal = etiquetaCanal(reporte.canalRadicacion);
  const visado = reporte.fechaVisado !== null || reporte.hashSha256 !== null;
  const esObservado = reporte.estado === EstadoReporte.OBSERVADO;

  return (
    <article
      draggable={!moviendo && sesionActiva}
      onDragStart={(e) => onDragStart(reporte, e)}
      onDragEnd={onDragEnd}
      aria-busy={moviendo}
      className={`bg-white p-4 rounded-lg shadow-sm border transition-all group relative ${
        esObservado ? 'border-rose-200' : 'border-slate-200'
      } ${arrastrando ? 'opacity-40 ring-2 ring-blue-400' : 'hover:shadow-md'} ${
        moviendo ? 'pointer-events-none opacity-70' : sesionActiva ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1 min-w-0">
          {sesionActiva && <GripVertical className="w-3 h-3 text-slate-300 shrink-0" aria-hidden />}
          <span className="text-[10px] font-mono font-semibold text-slate-500 truncate" title={reporte.codigo}>
            {reporte.codigo}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {moviendo && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" aria-label="Actualizando" />}
          {reporte.bloqueadoEdicion && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold uppercase"
              title="Expediente bloqueado para edición"
            >
              <Lock className="w-2.5 h-2.5" />
              Bloqueado
            </span>
          )}
        </div>
      </div>

      {mostrarEstado && (
        <span
          className={`inline-block mb-2 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide ${estiloEstado(
            reporte.estado
          )}`}
        >
          {etiquetaEstado(reporte.estado)}
        </span>
      )}

      {reporte.radiobase ? (
        <>
          <div className="font-semibold text-slate-800 text-sm leading-tight">{reporte.radiobase.nombre}</div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {reporte.radiobase.codigo} · {reporte.radiobase.region}
            </span>
          </div>
        </>
      ) : (
        <div className="font-semibold text-slate-400 text-sm italic leading-tight">Radiobase no vinculada</div>
      )}

      <div className="mt-3 space-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 shrink-0" />
          {reporte.tecnico ? (
            <span className="font-medium text-slate-700 truncate">{reporte.tecnico.nombre}</span>
          ) : (
            <span className="italic text-slate-400">Sin técnico asignado</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 shrink-0" />
            {fechaVisita ?? <span className="italic text-slate-400">Sin fecha</span>}
          </span>
          <span className="flex items-center gap-1" title="Evidencias fotográficas registradas">
            <Camera className="w-3 h-3 shrink-0" />
            <span className="font-mono">{reporte.totalEvidencias}</span>
          </span>
        </div>
      </div>

      {(reporte.numeroTicketCliente || reporte.numeroHes || visado) && (
        <div className="flex flex-wrap gap-1 mt-3">
          {reporte.numeroTicketCliente && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold"
              title={canal ? `Radicado vía ${canal}` : 'Ticket del cliente'}
            >
              <Send className="w-2.5 h-2.5" />
              <span className="font-mono">{reporte.numeroTicketCliente}</span>
            </span>
          )}
          {reporte.numeroHes && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[9px] font-bold"
              title={formatearFecha(reporte.fechaHes) ? `HES del ${formatearFecha(reporte.fechaHes)}` : 'Número HES'}
            >
              <Receipt className="w-2.5 h-2.5" />
              <span className="font-mono">HES {reporte.numeroHes}</span>
            </span>
          )}
          {visado && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase"
              title={
                formatearFecha(reporte.fechaVisado)
                  ? `Visado el ${formatearFecha(reporte.fechaVisado)}`
                  : 'Expediente visado con hash de integridad'
              }
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              Visado
            </span>
          )}
        </div>
      )}

      {esObservado && reporte.motivoRechazo && (
        <div className="mt-3 p-2 rounded-md bg-rose-50 border border-rose-100 text-[11px] text-rose-700 leading-snug">
          <span className="font-bold uppercase text-[9px] tracking-wide block mb-0.5">Motivo de observación</span>
          {reporte.motivoRechazo}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        {acciones.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {acciones.map((accion) => {
              const motivo = !sesionActiva
                ? 'Inicie sesión para mover expedientes'
                : accion.bloqueadaPorRol
                  ? `«${ETIQUETAS_ESTADO[accion.destino]}» requiere rol Supervisor o Admin`
                  : null;
              return (
                <BotonAccion
                  key={accion.destino}
                  accion={accion}
                  deshabilitada={moviendo || !sesionActiva || accion.bloqueadaPorRol}
                  motivo={motivo}
                  onClick={() => onMover(reporte, accion.destino)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-[10px] font-medium text-slate-400 italic">Fase final: sin transiciones disponibles.</div>
        )}
        <Link
          href={`/reportes/${reporte.id}/pdf?vista=UNIFICADO`}
          target="_blank"
          className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
        >
          <FileText className="w-3 h-3" />
          Ver PDF
        </Link>
      </div>
    </article>
  );
}
